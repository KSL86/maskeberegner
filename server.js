import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(join(__dirname, 'dist')));

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
      },
      body: JSON.stringify(req.body),
    });

    const raw = await response.text();

    if (!raw || !raw.trim()) {
      return res.status(502).json({
        error: { message: 'Tomt svar fra AI-tjenesten.' },
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        error: {
          message: `Ugyldig svar fra AI-tjenesten (${response.status}).`,
          raw: raw.slice(0, 500),
        },
      });
    }

    return res.status(response.status).json(data);
  } catch (err) {
    console.error('API proxy error:', err);
    return res.status(500).json({
      error: { message: 'Kunne ikke koble til AI-tjenesten.' },
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
