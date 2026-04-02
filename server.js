import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, 'dist')));

async function parseAnthropicJson(response) {
  const raw = await response.text();

  if (!raw || !raw.trim()) {
    throw new Error('Tomt svar fra AI-tjenesten.');
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Ugyldig svar fra AI-tjenesten (${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Anthropic-feil (${response.status}).`);
  }

  if (data?.error) {
    throw new Error(data.error.message || 'Ukjent Anthropic-feil.');
  }

  return data;
}

async function uploadPdfToAnthropic({ filename, mimeType, buffer, apiKey }) {
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

  return parseAnthropicJson(response);
}

app.post('/api/upload-pdf', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'ANTHROPIC_API_KEY not configured' },
    });
  }

  try {
    const { filename, mimeType, data } = req.body || {};

    if (!data) {
      return res.status(400).json({
        error: { message: 'Mangler PDF-data.' },
      });
    }

    const buffer = Buffer.from(data, 'base64');

    const uploaded = await uploadPdfToAnthropic({
      filename: filename || 'document.pdf',
      mimeType: mimeType || 'application/pdf',
      buffer,
      apiKey,
    });

    return res.json({
      file_id: uploaded.id,
      filename: uploaded.filename,
      mime_type: uploaded.mime_type,
      size_bytes: uploaded.size_bytes,
    });
  } catch (err) {
    console.error('PDF upload error:', err);
    return res.status(500).json({
      error: { message: err.message || 'Kunne ikke laste opp PDF.' },
    });
  }
});

app.post('/api/messages', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'ANTHROPIC_API_KEY not configured' },
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'files-api-2025-04-14',
      },
      body: JSON.stringify(req.body),
    });

    const data = await parseAnthropicJson(response);
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('API proxy error:', err);
    return res.status(500).json({
      error: { message: err.message || 'Kunne ikke koble til AI-tjenesten.' },
    });
  }
});

// SPA fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Maskeberegner running on port ${PORT}`);
});
