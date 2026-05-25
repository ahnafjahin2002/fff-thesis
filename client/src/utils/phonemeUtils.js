/**
 * phonemeUtils.js
 * ─────────────────────────────────────────────────────────
 * Bangla Phoneme Segmentation Engine
 *
 * Splits Bangla words into syllable-like phoneme units
 * based on Bangla orthographic structure.
 *
 * Rules handled:
 *  - Basic CV syllable:      বাড়ি   → বা + ড়ি
 *  - Consonant cluster:      ক্লান্ত  → ক্লান্ + ত
 *  - Vowel modifier (কার):    কালো    → কা + লো
 *  - র-ফলা word:             প্রেম   → প্রে + ম
 *  - Nasal vowel:            বাঁশ    → বাঁ + শ
 *  - Diphthong:              পাই     → পা + ই
 *  - High-frequency words:   মা / বাবা → treat as single unit
 */

// ── Unicode ranges ──
const HASANTA = '\u09CD';       // ্ (virama/halant)
const CHANDRABINDU = '\u0981';  // ঁ
const ANUSVARA = '\u0982';      // ং
const VISARGA = '\u0983';       // ঃ

// Consonants: ক-হ + ড় ঢ় য়
function isConsonant(ch) {
  if (!ch) return false;
  const c = ch.charCodeAt(0);
  return (c >= 0x0995 && c <= 0x09B9) || c === 0x09DC || c === 0x09DD || c === 0x09DF;
}

// Independent vowels: অ-ঔ
function isIndepVowel(ch) {
  if (!ch) return false;
  const c = ch.charCodeAt(0);
  return c >= 0x0985 && c <= 0x0994;
}

// Vowel signs (কার): া-ৌ
function isVowelSign(ch) {
  if (!ch) return false;
  const c = ch.charCodeAt(0);
  return c >= 0x09BE && c <= 0x09CC;
}

// Modifier marks: ঁ, ং, ঃ
function isModifier(ch) {
  if (!ch) return false;
  const c = ch.charCodeAt(0);
  return c === 0x0981 || c === 0x0982 || c === 0x0983;
}

// Nukta: ়
function isNukta(ch) {
  if (!ch) return false;
  return ch.charCodeAt(0) === 0x09BC;
}

// Is a Bangla character at all
function isBanglaChar(ch) {
  if (!ch) return false;
  const c = ch.charCodeAt(0);
  return c >= 0x0980 && c <= 0x09FF;
}

// ── High-frequency whole words (treat as single unit) ──
const HIGH_FREQ_SINGLE = new Set([
  'মা', 'বাবা', 'না', 'হ্যাঁ', 'আমি', 'তুমি', 'সে',
  'এই', 'ওই', 'কি', 'কে', 'তা', 'যা', 'আর',
]);

/**
 * segmentBanglaWord(word)
 * ────────────────────────
 * Main function: splits a Bangla word into an array of phoneme (syllable) strings.
 *
 * Returns: string[]  e.g. ['বা', 'ড়ি']
 */
export function segmentBanglaWord(word) {
  if (!word || word.length === 0) return [word];

  // Strip punctuation from the end for segmentation, add back later
  const punctMatch = word.match(/([।,!?;:\-–—"'()\[\]]+)$/);
  const punct = punctMatch ? punctMatch[1] : '';
  const clean = punct ? word.slice(0, -punct.length) : word;

  if (!clean) return [word];

  // High-frequency words → treat as single unit
  if (HIGH_FREQ_SINGLE.has(clean)) {
    return punct ? [clean + punct] : [clean];
  }

  // If not Bangla, return as-is
  if (!isBanglaChar(clean[0]) && !isIndepVowel(clean[0])) {
    return [word];
  }

  const syllables = [];
  let i = 0;

  while (i < clean.length) {
    let syllable = '';

    // ── Case 1: Starts with consonant ──
    if (isConsonant(clean[i])) {
      // Consume consonant + any conjunct chain (C + hasanta + C ...)
      syllable += clean[i];
      i++;

      // Handle nukta (e.g. ড় = ড + ়)
      if (i < clean.length && isNukta(clean[i])) {
        syllable += clean[i];
        i++;
      }

      // Consume conjunct chain: hasanta + consonant (+ optional nukta)
      while (i + 1 < clean.length && clean[i] === HASANTA && isConsonant(clean[i + 1])) {
        syllable += clean[i] + clean[i + 1]; // hasanta + consonant
        i += 2;
        // Handle nukta after conjunct consonant
        if (i < clean.length && isNukta(clean[i])) {
          syllable += clean[i];
          i++;
        }
      }

      // Consume vowel sign
      if (i < clean.length && isVowelSign(clean[i])) {
        syllable += clean[i];
        i++;
      }

      // Consume modifier (chandrabindu, anusvara, visarga)
      if (i < clean.length && isModifier(clean[i])) {
        syllable += clean[i];
        i++;
      }

      // Check if the NEXT char is a hasanta starting another conjunct
      // that should belong to the NEXT syllable onset
      // → We do NOT consume it; we let the next iteration pick it up
      // But if there's a trailing hasanta at end of word, attach it here
      if (i < clean.length && clean[i] === HASANTA) {
        if (i + 1 < clean.length && isConsonant(clean[i + 1])) {
          // There's a next consonant — this hasanta starts the next cluster
          // Don't consume
        } else {
          // Trailing hasanta (e.g. হসন্ত)
          syllable += clean[i];
          i++;
        }
      }

      syllables.push(syllable);

    // ── Case 2: Independent vowel ──
    } else if (isIndepVowel(clean[i])) {
      syllable += clean[i];
      i++;

      // Consume modifier after vowel
      if (i < clean.length && isModifier(clean[i])) {
        syllable += clean[i];
        i++;
      }

      syllables.push(syllable);

    // ── Case 3: Stray vowel sign / modifier / other ──
    } else {
      syllable += clean[i];
      i++;
      syllables.push(syllable);
    }
  }

  // Re-attach punctuation to last syllable
  if (punct && syllables.length > 0) {
    syllables[syllables.length - 1] += punct;
  }

  return syllables.length > 0 ? syllables : [word];
}

/**
 * segmentText(text)
 * ─────────────────
 * Given a full text string, splits into words and segments each word.
 * Returns: Array<{ word: string, phonemes: string[] }>
 */
export function segmentText(text) {
  if (!text) return [];
  // Split by whitespace but keep the structure
  const words = text.split(/(\s+)/);
  return words
    .filter(w => w.trim().length > 0)
    .map(word => ({
      word,
      phonemes: segmentBanglaWord(word),
    }));
}

/**
 * estimatePhonemeDuration(phoneme, baseDurationMs)
 * ────────────────────────────────────────────────
 * Estimate how long a phoneme should be highlighted during TTS.
 * Longer clusters get more time.
 */
export function estimatePhonemeDuration(phoneme, baseDurationMs = 250) {
  if (!phoneme) return baseDurationMs;
  // Count actual characters (exclude combining marks for weighting)
  let complexity = 0;
  for (const ch of phoneme) {
    if (isConsonant(ch) || isIndepVowel(ch)) complexity += 1;
    else if (ch === HASANTA) complexity += 0.3;
    else if (isVowelSign(ch)) complexity += 0.5;
    else if (isModifier(ch)) complexity += 0.3;
  }
  return Math.max(baseDurationMs, baseDurationMs * Math.max(1, complexity * 0.7));
}
