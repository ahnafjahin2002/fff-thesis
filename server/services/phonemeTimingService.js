/**
 * phonemeTimingService.js
 * ──────────────────────────────────────────────────
 * Estimates phoneme timing from audio duration.
 *
 * Since the HuggingFace VITS model doesn't return
 * per-phoneme timestamps, we estimate them proportionally
 * based on phoneme complexity and the total audio duration.
 */

const HASANTA = '\u09CD';

/**
 * Character type weights for timing estimation.
 * Consonant clusters take longer to pronounce than simple vowels.
 */
function getPhonemeWeight(phoneme) {
  if (!phoneme) return 1;

  let weight = 0;
  for (const ch of phoneme) {
    const c = ch.charCodeAt(0);
    // Consonant
    if ((c >= 0x0995 && c <= 0x09B9) || c === 0x09DC || c === 0x09DD || c === 0x09DF) {
      weight += 1.0;
    }
    // Independent vowel
    else if (c >= 0x0985 && c <= 0x0994) {
      weight += 0.8;
    }
    // Vowel sign
    else if (c >= 0x09BE && c <= 0x09CC) {
      weight += 0.5;
    }
    // Hasanta (makes pronunciation shorter)
    else if (c === 0x09CD) {
      weight += 0.2;
    }
    // Modifiers (chandrabindu, anusvara, visarga)
    else if (c === 0x0981 || c === 0x0982 || c === 0x0983) {
      weight += 0.3;
    }
  }
  return Math.max(0.5, weight);
}

/**
 * estimateWordTimings(words, totalDurationMs)
 * ─────────────────────────────────────────────
 * Given an array of words and total audio duration,
 * returns timing for each word.
 *
 * @param {string[]} words - Array of word strings
 * @param {number} totalDurationMs - Total audio duration in ms
 * @returns {Array<{word, startMs, endMs}>}
 */
function estimateWordTimings(words, totalDurationMs) {
  if (!words || words.length === 0) return [];

  // Calculate weight per word
  const wordWeights = words.map(w => {
    let weight = 0;
    for (const ch of w) {
      const c = ch.charCodeAt(0);
      if (c >= 0x0980 && c <= 0x09FF) weight += 1;
      else weight += 0.3; // punctuation/space
    }
    return Math.max(1, weight);
  });

  const totalWeight = wordWeights.reduce((a, b) => a + b, 0);
  const timings = [];
  let currentMs = 0;

  // Add small leading silence
  const leadingSilence = Math.min(100, totalDurationMs * 0.02);
  currentMs = leadingSilence;
  const usableDuration = totalDurationMs - leadingSilence * 2;

  for (let i = 0; i < words.length; i++) {
    const duration = (wordWeights[i] / totalWeight) * usableDuration;
    timings.push({
      word: words[i],
      startMs: Math.round(currentMs),
      endMs: Math.round(currentMs + duration),
    });
    currentMs += duration;
  }

  return timings;
}

/**
 * estimatePhonemeTimings(phonemes, wordDurationMs, wordStartMs)
 * ─────────────────────────────────────────────────────────────
 * Given phonemes of a single word and its duration,
 * returns timing for each phoneme.
 *
 * @param {string[]} phonemes - Phoneme segments
 * @param {number} wordDurationMs - Duration of the word in ms
 * @param {number} wordStartMs - Start time of the word in ms
 * @returns {Array<{phoneme, startMs, endMs}>}
 */
function estimatePhonemeTimings(phonemes, wordDurationMs, wordStartMs = 0) {
  if (!phonemes || phonemes.length === 0) return [];

  const weights = phonemes.map(getPhonemeWeight);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const timings = [];
  let currentMs = wordStartMs;

  for (let i = 0; i < phonemes.length; i++) {
    const duration = (weights[i] / totalWeight) * wordDurationMs;
    timings.push({
      phoneme: phonemes[i],
      index: i,
      startMs: Math.round(currentMs),
      endMs: Math.round(currentMs + duration),
    });
    currentMs += duration;
  }

  return timings;
}

/**
 * estimateFullTimings(segmentedWords, totalDurationMs)
 * ─────────────────────────────────────────────────────
 * Full timing estimation for all words and their phonemes.
 *
 * @param {Array<{word, phonemes}>} segmentedWords
 * @param {number} totalDurationMs
 * @returns {Array<{word, startMs, endMs, phonemes: [{phoneme, startMs, endMs}]}>}
 */
function estimateFullTimings(segmentedWords, totalDurationMs) {
  if (!segmentedWords || segmentedWords.length === 0) return [];

  const words = segmentedWords.map(w => w.word);
  const wordTimings = estimateWordTimings(words, totalDurationMs);

  return wordTimings.map((wt, i) => ({
    word: wt.word,
    startMs: wt.startMs,
    endMs: wt.endMs,
    phonemes: estimatePhonemeTimings(
      segmentedWords[i].phonemes,
      wt.endMs - wt.startMs,
      wt.startMs
    ),
  }));
}

module.exports = {
  estimateWordTimings,
  estimatePhonemeTimings,
  estimateFullTimings,
  getPhonemeWeight,
};
