import express from 'express';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const openaiKey = process.env.VITE_OPENAI_API_KEY;

// JSON body parser for incoming proxy requests
app.use(express.json());

// Proxy Perenual API calls (browser CORS fix)
app.all('/api/perenual/*', async (req, res) => {
  try {
    const targetPath = req.path.replace('/api/perenual', '');
    const url = `https://perenual.com${targetPath}`;
    const headers = { 'Content-Type': 'application/json' };

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: 'Perenual proxy error' });
  }
});

// Proxy OpenAI API calls (browser CORS fix)
app.all('/api/openai/*', async (req, res) => {
  try {
    const targetPath = req.path.replace('/api/openai', '');
    const url = `https://api.openai.com${targetPath}`;
    const headers = { 'Content-Type': 'application/json' };
    if (openaiKey) headers['Authorization'] = `Bearer ${openaiKey}`;

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // For streaming responses, pipe the response body
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      res.writeHead(response.status, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      for await (const chunk of response.body) {
        res.write(chunk);
      }
      res.end();
    } else {
      const data = await response.text();
      res.status(response.status).send(data);
    }
  } catch (err) {
    res.status(500).json({ error: 'Proxy error' });
  }
});

// Serve static build
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
