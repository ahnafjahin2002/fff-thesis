/**
 * ttsService.js
 * ──────────────────────────────────────────────────────────
 * Bangla Text-to-Speech Service
 *
 * Tiered approach:
 *  1. PRIMARY:   HuggingFace VITS API (EMTIAZZ/bangladeshi-bangla-tts-vits)
 *  2. FALLBACK:  Returns null → client uses browser SpeechSynthesis
 *
 * Features:
 *  - File-based audio caching (SHA256 hash)
 *  - Automatic retry with backoff
 *  - Bangla text normalization before synthesis
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { normalizeForTTS } = require('./banglaTextNormalizer');

// ── Config ──
const HF_TOKEN = process.env.HF_TOKEN || '';
const HF_MODEL = process.env.HF_MODEL || 'EMTIAZZ/bangladeshi-bangla-tts-vits';
const CACHE_DIR = path.resolve(process.env.CACHE_DIR || './cache');
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Generate a cache key from text + speed
 */
function getCacheKey(text, speed = 1.0) {
  const hash = crypto.createHash('sha256')
    .update(`${text}__${speed}__${HF_MODEL}`)
    .digest('hex');
  return hash.substring(0, 16);
}

/**
 * Get cached audio file path if it exists
 */
function getCachedAudio(cacheKey) {
  const filePath = path.join(CACHE_DIR, `${cacheKey}.wav`);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

/**
 * Save audio buffer to cache
 */
function saveToCache(cacheKey, audioBuffer) {
  const filePath = path.join(CACHE_DIR, `${cacheKey}.wav`);
  fs.writeFileSync(filePath, audioBuffer);
  return filePath;
}

/**
 * synthesizeWithHuggingFace(text)
 * ─────────────────────────────────
 * Call HuggingFace Inference API with the VITS model.
 * Returns audio buffer (WAV format) or null on failure.
 */
async function synthesizeWithHuggingFace(text, retries = 2) {
  if (!HF_TOKEN) {
    console.warn('[TTS] No HF_TOKEN set — HuggingFace API unavailable');
    return null;
  }

  const normalizedText = normalizeForTTS(text);
  if (!normalizedText) return null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[TTS] HuggingFace request (attempt ${attempt + 1}): "${normalizedText.substring(0, 50)}..."`);

      const response = await axios.post(
        HF_API_URL,
        { inputs: normalizedText },
        {
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 30000, // 30s timeout
        }
      );

      if (response.status === 200 && response.data && response.data.byteLength > 100) {
        console.log(`[TTS] HuggingFace success — ${response.data.byteLength} bytes`);
        return Buffer.from(response.data);
      }

      // Model loading — wait and retry
      if (response.status === 503) {
        const waitTime = 5000 * (attempt + 1);
        console.log(`[TTS] Model loading, waiting ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }

    } catch (err) {
      if (err.response?.status === 503 && attempt < retries) {
        const waitTime = 5000 * (attempt + 1);
        console.log(`[TTS] Model loading (503), waiting ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      if (err.response?.status === 429) {
        console.warn('[TTS] Rate limited by HuggingFace');
        return null;
      }
      console.error(`[TTS] HuggingFace error: ${err.message}`);
      if (attempt === retries) return null;
    }
  }

  return null;
}

const { spawn } = require('child_process');

async function synthesizeWithLocalTTS(text, cacheKey) {
  return new Promise((resolve) => {
    const normalizedText = normalizeForTTS(text);
    if (!normalizedText) return resolve(null);

    console.log(`[TTS] Local Python request: "${normalizedText.substring(0, 50)}..."`);
    
    const pythonScript = path.join(__dirname, '../scripts/bangla_tts.py');
    const outDir = CACHE_DIR;
    const filename = `${cacheKey}.wav`;
    // Cross-platform: check Windows venv path first, then Unix, then system python
    const pythonExecWin = path.join(__dirname, '../venv/Scripts/python.exe');
    const pythonExecUnix = path.join(__dirname, '../venv/bin/python3');
    const pythonCmd = fs.existsSync(pythonExecWin) ? pythonExecWin
      : fs.existsSync(pythonExecUnix) ? pythonExecUnix
      : (process.platform === 'win32' ? 'python' : 'python3');

    // -X utf8 forces UTF-8 mode on Windows (needed for Bangla romanization)
    const child = spawn(pythonCmd, ['-X', 'utf8', pythonScript], {
      env: { ...process.env, PYTHONUTF8: '1' }
    });
    
    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`[TTS] Local Python error (code ${code}):`, errorOutput);
        return resolve(null);
      }
      
      try {
        const result = JSON.parse(output.trim());
        if (result.success && result.audioPath) {
          console.log(`[TTS] Local Python success`);
          const audioBuffer = fs.readFileSync(result.audioPath);
          return resolve(audioBuffer);
        } else {
          console.error(`[TTS] Local Python script failed:`, result.error, result.traceback);
          return resolve(null);
        }
      } catch (err) {
        console.error(`[TTS] Failed to parse local Python output:`, output, errorOutput);
        return resolve(null);
      }
    });
    
    const payload = JSON.stringify({
      text: normalizedText,
      voice: 'female',
      outDir: outDir,
      filename: filename
    });
    child.stdin.write(payload);
    child.stdin.end();
  });
}

/**
 * synthesize(text, speed)
 * ────────────────────────
 * Main synthesis function with caching and fallback chain.
 *
 * @param {string} text - Bangla text to synthesize
 * @param {number} speed - Playback speed (affects cache key only, actual speed is client-side)
 * @returns {{ audioBuffer: Buffer|null, cacheKey: string, source: string, cached: boolean }}
 */
async function synthesize(text, speed = 1.0) {
  const cacheKey = getCacheKey(text, speed);

  // 1. Check cache
  const cachedPath = getCachedAudio(cacheKey);
  if (cachedPath) {
    console.log(`[TTS] Cache hit: ${cacheKey}`);
    const audioBuffer = fs.readFileSync(cachedPath);
    return { audioBuffer, cacheKey, source: 'cache', cached: true };
  }

  // 2. Try Local Python BanglaTTS
  if (process.env.TTS_PROVIDER === 'local') {
    const localAudio = await synthesizeWithLocalTTS(text, cacheKey);
    if (localAudio) {
      return { audioBuffer: localAudio, cacheKey, source: 'local', cached: false };
    }
  }

  // 3. Try HuggingFace VITS
  const hfAudio = await synthesizeWithHuggingFace(text);
  if (hfAudio) {
    saveToCache(cacheKey, hfAudio);
    return { audioBuffer: hfAudio, cacheKey, source: 'huggingface', cached: false };
  }

  // 4. No TTS available — return null (client will use browser SpeechSynthesis)
  console.warn('[TTS] All TTS engines failed — client must use browser fallback');
  return { audioBuffer: null, cacheKey, source: 'none', cached: false };
}

/**
 * getAudioDuration(audioBuffer)
 * ──────────────────────────────
 * Estimate duration from WAV buffer.
 * WAV header: bytes 28-31 = byte rate, total file size gives duration.
 */
function getAudioDuration(audioBuffer) {
  if (!audioBuffer || audioBuffer.length < 44) return 2000; // default 2s

  try {
    // WAV format: sample rate at offset 24 (4 bytes LE)
    // byte rate at offset 28 (4 bytes LE)
    const byteRate = audioBuffer.readUInt32LE(28);
    const dataSize = audioBuffer.length - 44; // subtract header
    if (byteRate > 0) {
      return Math.round((dataSize / byteRate) * 1000);
    }
  } catch (e) {
    // Fallback estimation
  }

  // Rough estimate: assume 22050Hz, 16-bit mono
  return Math.round((audioBuffer.length - 44) / (22050 * 2) * 1000);
}

module.exports = {
  synthesize,
  getAudioDuration,
  getCacheKey,
  getCachedAudio,
};
