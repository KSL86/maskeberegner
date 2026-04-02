import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`[IN] ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '30mb' }));
app.use(express.static(join(__dirname, 'dist')));

function safeJson(res, status, payload) {
  if (!res.headersSent) {
    return res.status(status).json(payload);
  }
}

async function parseResponseText(response, label) {
  const contentType = response.headers.get('content-type');
  const raw = await response.text();

  console.log(
    `[${label}] status=${response.status} content-type=${contentType || 'unknown'} raw-length=${raw.length}`
  );

  if (!raw || !raw.trim()) {
    throw new Error(`${label}: Tomt svar`);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`${label}: Ugyldig JSON. Første 300 tegn: ${raw.slice(0, 300)}`);
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `${label}: HTTP ${response.status}`);
  }

  if (data?.error) {
    throw new Error(data.error.message || `${label}: Uspesifisert API-feil`);
  }

  return data;
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    time: new Date().toISOString(),
  });
});

app.post('/api/upload-pdf', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return safeJson(res, 500, {
      error: { message: 'ANTHROPIC_API_KEY not configured' },
    });
  }

  try {
    const { filename, mimeType, data } = req.body || {};

    if (!data) {
      return safeJson(res, 400, {
        error: { message: 'Mangler PDF-data.' },
      });
    }

    console.log(
      `[UPLOAD] filename=${filename || 'unknown'} mimeType=${mimeType || 'unknown'} base64-length=${data.length}`
    );

    const buffer = Buffer.from(data, 'base64');
    console.log(`[UPLOAD] decoded-bytes=${buffer.length}`);

    const form = new FormData();
    const blob = new Blob([buffer], { type: mimeType || 'application/pdf' });
    form.append('file', blob, filename || 'document.pdf');

    const response = await fetch('https://api.anthropic.com/v1/files', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'files-api-2025-04-14',
      },
      body: form,
    });

    const uploaded = await parseResponseText(response, 'FILES_API');

    return safeJson(res, 200, {
      file_id: uploaded.id,
      filename: uploaded.filename,
      mime_type: uploaded.mime_type,
      size_bytes: uploaded.size_bytes,
    });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    return safeJson(res, 500, {
      error: { message: err.message || 'Kunne ikke laste opp PDF.' },
    });
  }
});

app.post('/api/messages', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return safeJson(res, 500, {
      error: { message: 'ANTHROPIC_API_KEY not configured' },
    });
  }

  try {
    console.log('[MESSAGES] forwarding request');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'files-api-2025-04-14',
      },
      body: JSON.stringify(req.body),
    });

    const data = await parseResponseText(response, 'MESSAGES_API');
    return safeJson(res, response.status, data);
  } catch (err) {
    console.error('[MESSAGES ERROR]', err);
    return safeJson(res, 500, {
      error: { message: err.message || 'Kunne ikke koble til AI-tjenesten.' },
    });
  }
});

app.get('/{*splat}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('[EXPRESS ERROR]', err);

  if (err?.type === 'entity.too.large') {
    return safeJson(res, 413, {
      error: { message: 'Filen er for stor for backend-opplasting.' },
    });
  }

  return safeJson(res, 500, {
    error: { message: err.message || 'Uventet serverfeil.' },
  });
});

app.listen(PORT, () => {
  console.log(`Maskeberegner running on port ${PORT}`);
});
