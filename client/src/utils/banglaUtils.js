/**
 * banglaUtils.js
 * ---------------
 * Utility functions for Bangla script analysis.
 * Used by WordSpan and TextRenderer to detect:
 *   - Conjunct letters (যুক্তবর্ণ)
 *   - Vowel diacritics / কার-চিহ্ন
 *   - র-ফলা / রেফ
 *   - High-frequency sight words
 *   - Full word decomposition into grapheme clusters
 */

const BANGLA_RANGE = /[\u0980-\u09FF]/;
const HASANTA = '\u09CD';
const VOWEL_DIACRITICS = /[\u09BE\u09BF\u09C0\u09C1\u09C2\u09C3\u09C7\u09C8\u09CB\u09CC]/;
const REPH_PATTERN = /\u09B0\u09CD|\u09CD\u09B0/;

export const HIGH_FREQ_WORDS = new Set([
  'মা','বাবা','বাড়ি','ঘর','পানি','ভাত','রুটি','বই','স্কুল','শিক্ষক',
  'ছাত্র','ছাত্রী','আমি','তুমি','সে','আমরা','তারা','এই','ওই',
  'এখানে','ওখানে','হ্যাঁ','না','ভালো','খারাপ','বড়','ছোট','নাম',
]);

function isConsonant(c) { const code = c.charCodeAt(0); return code >= 0x0995 && code <= 0x09B9; }
function isIndepVowel(c) { const code = c.charCodeAt(0); return code >= 0x0985 && code <= 0x0994; }
function isVowelSign(c) { const code = c.charCodeAt(0); return code >= 0x09BE && code <= 0x09CC; }
function isModifier(c) { const code = c.charCodeAt(0); return code === 0x0981 || code === 0x0982 || code === 0x0983; }

const VOWEL_SIGN_NAMES = {
  '\u09BE':'আ-কার','\u09BF':'ই-কার','\u09C0':'ঈ-কার','\u09C1':'উ-কার',
  '\u09C2':'ঊ-কার','\u09C3':'ঋ-কার','\u09C7':'এ-কার','\u09C8':'ঐ-কার',
  '\u09CB':'ও-কার','\u09CC':'ঔ-কার',
};
export function getVowelSignName(sign) { return VOWEL_SIGN_NAMES[sign] || 'কার'; }

export function isConjunct(word) { return word.includes(HASANTA); }
export function hasVowelDiacritic(word) { return VOWEL_DIACRITICS.test(word); }
export function hasReph(word) { return REPH_PATTERN.test(word); }
export function isHighFrequency(word) { return HIGH_FREQ_WORDS.has(word.trim()); }
export function isBangla(word) { return BANGLA_RANGE.test(word); }

export function classifyWord(word) {
  const clean = word.trim();
  return {
    isConjunct: isConjunct(clean), hasReph: hasReph(clean),
    isHighFreq: isHighFrequency(clean), hasVowel: hasVowelDiacritic(clean),
    isBangla: isBangla(clean),
  };
}

/**
 * decomposeWord(word)
 * Deep decomposition of a Bangla word into grapheme clusters with metadata.
 * Example: রান্না → [
 *   { display:'রা', type:'consonant', components:['র'], vowelSign:'া', formula:null, label:'ব্যঞ্জন' },
 *   { display:'ন্না', type:'conjunct', components:['ন','ন'], vowelSign:'া', formula:'ন + ন = ন্ন', label:'যুক্তবর্ণ' }
 * ]
 */
export function decomposeWord(word) {
  const result = [];
  let i = 0;
  while (i < word.length) {
    if (isConsonant(word[i])) {
      let cluster = word[i];
      const components = [word[i]];
      let hasConj = false;
      let j = i + 1;
      while (j < word.length && word[j] === HASANTA && j + 1 < word.length && isConsonant(word[j + 1])) {
        cluster += word[j] + word[j + 1];
        components.push(word[j + 1]);
        hasConj = true;
        j += 2;
      }
      const conjunctOnly = cluster;
      let vs = null, vsName = null;
      if (j < word.length && isVowelSign(word[j])) {
        vs = word[j]; vsName = getVowelSignName(word[j]); cluster += word[j]; j++;
      }
      while (j < word.length && isModifier(word[j])) { cluster += word[j]; j++; }
      result.push({
        display: cluster, type: hasConj ? 'conjunct' : 'consonant',
        components, conjunctDisplay: hasConj ? conjunctOnly : null,
        vowelSign: vs, vowelSignName: vsName,
        formula: hasConj ? components.join(' + ') + ' = ' + conjunctOnly : null,
        label: hasConj ? 'যুক্তবর্ণ' : 'ব্যঞ্জন',
      });
      i = j;
    } else if (isIndepVowel(word[i])) {
      result.push({ display: word[i], type: 'vowel', components: [word[i]], conjunctDisplay: null,
        vowelSign: null, vowelSignName: null, formula: null, label: 'স্বরবর্ণ' });
      i++;
    } else if (isVowelSign(word[i])) {
      result.push({ display: word[i], type: 'vowelSign', components: [word[i]], conjunctDisplay: null,
        vowelSign: word[i], vowelSignName: getVowelSignName(word[i]), formula: null, label: 'কার' });
      i++;
    } else {
      result.push({ display: word[i], type: 'other', components: [word[i]], conjunctDisplay: null,
        vowelSign: null, vowelSignName: null, formula: null, label: '' });
      i++;
    }
  }
  return result;
}

export function breakConjunct(word) {
  if (!isConjunct(word)) return [{ part: word, label: '' }];
  const parts = []; let current = '';
  for (let i = 0; i < word.length; i++) {
    current += word[i];
    if (word[i] === HASANTA && i + 1 < word.length) { current += word[i + 1]; i++; }
    if (VOWEL_DIACRITICS.test(word[i]) && i < word.length - 1) { parts.push({ part: current, label: '' }); current = ''; }
  }
  if (current) parts.push({ part: current, label: '' });
  return parts.length > 1 ? parts : [{ part: word, label: 'যুক্তবর্ণ' }];
}

export function tokenizeText(text) {
  const tokens = [];
  const parts = text.split(/(\s+|[।,!?;:\-–—"'()[\]])/);
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) tokens.push({ type: 'space', value: part });
    else if (/^[।,!?;:\-–—"'()[\]]$/.test(part)) tokens.push({ type: 'punct', value: part });
    else tokens.push({ type: 'word', value: part });
  }
  return tokens;
}

export function splitIntoParagraphs(text, mode = 'every-sentence') {
  const sentences = text.split(/।+/).map(s => s.trim()).filter(s => s.length > 0).map(s => s + '।');
  if (mode === 'every-2-sentences') {
    const paras = [];
    for (let i = 0; i < sentences.length; i += 2) paras.push(sentences.slice(i, i + 2).join(' '));
    return paras;
  }
  return sentences;
}
