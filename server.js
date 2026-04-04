require('dotenv').config({ path: '.env.local' });
const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Production hardening ────────────────────────────────────────────
app.disable('x-powered-by');
app.set('trust proxy', 1);

// ── Compression ─────────────────────────────────────────────────────
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// ── Static files with aggressive caching ────────────────────────────
app.use('/css', express.static(path.join(__dirname, 'css'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  immutable: false,
}));

app.use('/js', express.static(path.join(__dirname, 'js'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  immutable: false,
}));

// HTML files — short cache, always revalidate
app.use(express.static(__dirname, {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  },
}));

// ── Body parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '64kb' }));

// ── Configurable settings ───────────────────────────────────────────
const NVIDIA_API_URL = process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'google/gemma-4-31b-it';
const NVIDIA_MAX_TOKENS = parseInt(process.env.NVIDIA_MAX_TOKENS) || 512;
const NVIDIA_TEMPERATURE = parseFloat(process.env.NVIDIA_TEMPERATURE) || 0.7;
const NVIDIA_TOP_P = parseFloat(process.env.NVIDIA_TOP_P) || 0.9;
const NVIDIA_TIMEOUT_MS = parseInt(process.env.NVIDIA_TIMEOUT_MS) || 36000;
const MAX_CONTEXT_MESSAGES = parseInt(process.env.MAX_CONTEXT_MESSAGES) || 6;

// ── Rate limiting ───────────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 20;

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { timestamps: [now] });
    return next();
  }

  entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'rate_limit' });
  }

  entry.timestamps.push(now);
  next();
}

// Clean up rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (entry.timestamps.length === 0) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

// ── System prompt ───────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Hunar Kaur. You respond in first person as yourself — never say "I'm an AI" or "as a language model." You are a Software Engineer at PayPal on the Communications Hub team in Bengaluru, working with Java and Spring Boot on push notifications and in-app alerts.

Background: B.Tech in CS & Applied Mathematics from IIIT Delhi (2024). Previously interned at PayPal (API latency optimization, caching) and ScrapUncle (UI/UX design with Figma). Skills: Java, Python, Spring Boot, REST APIs, Figma, Jupyter.

Projects: Dukh_Bank (Java DBMS), Hybrid Entertainment Recommender (Python/ML), Course Similarity Evaluator, Assembler-Simulator, Snakes-and-Ladders.

GitHub: github.com/HunarKaur25 | LinkedIn: linkedin.com/in/hunar-kaur-229067242

Rules:
- Keep responses concise (2-4 sentences typically)
- Be warm, slightly casual, use "I" and "my"
- If asked something unrelated to tech, career, education, or professional topics, politely redirect: "Haha that's a fun question, but I'd rather keep things professional here. Ask me about my work or projects!"
- Never make up facts about yourself. Stick to the above info.
- If unsure, say "Hmm, I'm not sure about that one — but feel free to check my LinkedIn or GitHub for more details!"`;

// ── Health check ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() | 0 });
});

// ── Chat endpoint ───────────────────────────────────────────────────
app.post('/api/chat', rateLimit, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'bad_request' });
    }

    for (const msg of messages) {
      if (typeof msg.role !== 'string' || typeof msg.content !== 'string') {
        return res.status(400).json({ error: 'bad_request' });
      }
      if (msg.content.length > 2000) {
        return res.status(400).json({ error: 'bad_request' });
      }
    }

    const trimmedMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), NVIDIA_TIMEOUT_MS);

    try {
      const response = await fetch(NVIDIA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmedMessages],
          max_tokens: NVIDIA_MAX_TOKENS,
          temperature: NVIDIA_TEMPERATURE,
          top_p: NVIDIA_TOP_P,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error(`NVIDIA API error: ${response.status}`);
        return res.status(502).json({ error: 'upstream' });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      return res.json({ content });
    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        return res.status(504).json({ error: 'timeout' });
      }
      throw fetchErr;
    }
  } catch (err) {
    console.error('Chat endpoint error:', err.message);
    return res.status(500).json({ error: 'internal' });
  }
});

// ── Start server ────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// ── Graceful shutdown ───────────────────────────────────────────────
function shutdown() {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
