/**
 * index.js — Bangla TTS Server
 * ──────────────────────────────────────────
 * Express server providing TTS synthesis and
 * phoneme timing APIs for the reading assistant.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { synthesize, getAudioDuration, getCachedAudio } = require('./services/ttsService');
const { estimateWordTimings, estimateFullTimings } = require('./services/phonemeTimingService');
const { normalizeForTTS } = require('./services/banglaTextNormalizer');
const { generateQuiz } = require('./services/quizService');

// ── Database Connection ──
const connectDB = require('./config/db');

// ── New API Routes ──
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progressRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const bornoBazarRoutes = require('./routes/bornoBazarRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to MongoDB (Safe fallback if uri is missing)
connectDB();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// Serve cached audio files statically
app.use('/audio', express.static(path.resolve(process.env.CACHE_DIR || './cache')));

// ── New Base API Routes ──
app.use('/api', healthRoutes); // Provides /api/health and /api/data-status
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/borno-bazar', bornoBazarRoutes);

// ── TTS Synthesis ──
// POST /api/tts/synthesize
// Body: { text: "বাংলা টেক্সট", speed: 1.0 }
// Returns: { audioUrl, cacheKey, source, cached, durationMs }
app.post('/api/tts/synthesize', async (req, res) => {
  try {
    const { text, speed = 1.0 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "text" field' });
    }

    console.log(`[API] TTS request: "${text.substring(0, 60)}..."`);

    const result = await synthesize(text, speed);

    if (result.audioBuffer) {
      const durationMs = getAudioDuration(result.audioBuffer);
      return res.json({
        audioUrl: `/audio/${result.cacheKey}.wav`,
        cacheKey: result.cacheKey,
        source: result.source,
        cached: result.cached,
        durationMs,
      });
    }

    // No audio — client should use browser fallback
    return res.json({
      audioUrl: null,
      cacheKey: result.cacheKey,
      source: 'none',
      cached: false,
      durationMs: null,
      fallback: 'browser-speech-synthesis',
    });

  } catch (err) {
    console.error('[API] TTS error:', err.message);
    res.status(500).json({ error: 'TTS synthesis failed', details: err.message });
  }
});

// ── Phoneme Timing Estimation ──
// POST /api/tts/timings
// Body: { words: [{word, phonemes}], totalDurationMs }
// Returns: { timings: [{word, startMs, endMs, phonemes: [{phoneme, startMs, endMs}]}] }
app.post('/api/tts/timings', (req, res) => {
  try {
    const { words, totalDurationMs } = req.body;

    if (!words || !Array.isArray(words) || !totalDurationMs) {
      return res.status(400).json({ error: 'Missing "words" array or "totalDurationMs"' });
    }

    const timings = estimateFullTimings(words, totalDurationMs);
    res.json({ timings });

  } catch (err) {
    console.error('[API] Timing error:', err.message);
    res.status(500).json({ error: 'Timing estimation failed', details: err.message });
  }
});

// ── Text Normalization ──
// POST /api/tts/normalize
// Body: { text: "বাংলা ১২৩" }
// Returns: { normalized: "বাংলা একশো তেইশ" }
app.post('/api/tts/normalize', (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "text" field' });
    }

    const normalized = normalizeForTTS(text);
    res.json({ normalized });

  } catch (err) {
    console.error('[API] Normalize error:', err.message);
    res.status(500).json({ error: 'Normalization failed', details: err.message });
  }
});

// ── Quiz Module ──
// GET /api/quiz/generate?difficulty=1&count=6&category=all
app.get('/api/quiz/generate', (req, res) => {
  try {
    const difficulty = parseInt(req.query.difficulty) || 1;
    const count = parseInt(req.query.count) || 6;
    const category = req.query.category || 'all';

    const words = generateQuiz(difficulty, count, category);
    res.json({ success: true, words });
  } catch (err) {
    console.error('[API] Quiz generate error:', err.message);
    res.status(500).json({ error: 'Failed to generate quiz', details: err.message });
  }
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`\n🎙️  Bangla TTS Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   HF Model: ${process.env.HF_MODEL || 'EMTIAZZ/bangladeshi-bangla-tts-vits'}`);
  console.log(`   HF Token: ${process.env.HF_TOKEN ? '✅ Set' : '❌ Not set (browser fallback only)'}\n`);
});


