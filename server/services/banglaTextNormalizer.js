/**
 * banglaTextNormalizer.js
 * ──────────────────────────────────────────
 * Normalizes Bangla text for TTS input.
 * Handles numerals, punctuation, abbreviations,
 * and ensures clean text for natural speech flow.
 */

// ── Bangla digit mapping ──
const BANGLA_DIGITS = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
const DIGIT_WORDS = ['শূন্য','এক','দুই','তিন','চার','পাঁচ','ছয়','সাত','আট','নয়'];

const TENS_WORDS = {
  10:'দশ',11:'এগারো',12:'বারো',13:'তেরো',14:'চৌদ্দ',15:'পনেরো',
  16:'ষোলো',17:'সতেরো',18:'আঠারো',19:'উনিশ',20:'বিশ',
  21:'একুশ',22:'বাইশ',23:'তেইশ',24:'চব্বিশ',25:'পঁচিশ',
  26:'ছাব্বিশ',27:'সাতাশ',28:'আঠাশ',29:'উনত্রিশ',30:'ত্রিশ',
  40:'চল্লিশ',50:'পঞ্চাশ',60:'ষাট',70:'সত্তর',80:'আশি',90:'নব্বই',
  100:'একশো',1000:'এক হাজার',
};

/**
 * Convert Bangla digits to Arabic digits
 */
function banglaToArabic(str) {
  return str.replace(/[০-৯]/g, d => BANGLA_DIGITS[d] || d);
}

/**
 * Convert number to Bangla word representation (simplified)
 */
function numberToBanglaWord(num) {
  if (num < 0) return 'মাইনাস ' + numberToBanglaWord(-num);
  if (num < 10) return DIGIT_WORDS[num];
  if (TENS_WORDS[num]) return TENS_WORDS[num];
  if (num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    return (TENS_WORDS[tens] || '') + (ones > 0 ? ' ' + DIGIT_WORDS[ones] : '');
  }
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    return (hundreds > 1 ? DIGIT_WORDS[hundreds] + 'শো' : 'একশো') +
      (remainder > 0 ? ' ' + numberToBanglaWord(remainder) : '');
  }
  if (num < 100000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    return numberToBanglaWord(thousands) + ' হাজার' +
      (remainder > 0 ? ' ' + numberToBanglaWord(remainder) : '');
  }
  // For very large numbers, read digit by digit
  return String(num).split('').map(d => DIGIT_WORDS[parseInt(d)]).join(' ');
}

/**
 * normalizeForTTS(text)
 * Main normalization function
 */
function normalizeForTTS(text) {
  if (!text) return '';

  let normalized = text;

  // 1. Convert Bangla numerals to words
  normalized = normalized.replace(/[০-৯]+/g, match => {
    const num = parseInt(banglaToArabic(match));
    return numberToBanglaWord(num);
  });

  // 2. Convert Arabic numerals to words
  normalized = normalized.replace(/\d+/g, match => {
    const num = parseInt(match);
    return numberToBanglaWord(num);
  });

  // 3. Clean up excessive punctuation but keep natural pauses
  normalized = normalized.replace(/।{2,}/g, '।');  // Multiple দাড়ি → single
  normalized = normalized.replace(/,{2,}/g, ',');
  normalized = normalized.replace(/!{2,}/g, '!');
  normalized = normalized.replace(/\?{2,}/g, '?');

  // 4. Remove characters that confuse TTS
  normalized = normalized.replace(/[""''`]/g, '');
  normalized = normalized.replace(/[()[\]{}]/g, ' ');
  normalized = normalized.replace(/[—–]/g, ', ');

  // 5. Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

module.exports = { normalizeForTTS, numberToBanglaWord, banglaToArabic };
