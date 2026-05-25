/**
 * TextRenderer.jsx
 * -----------------
 * Core reading display component for Feature 1.
 * Tokenizes text into paragraphs → words → renders each as WordSpan.
 * Supports both structured content objects and raw text strings.
 */

import { useMemo } from 'react';
import WordSpan from './WordSpan';
import usePreferences from '../../hooks/usePreferences';
import { tokenizeText, splitIntoParagraphs } from '../../utils/banglaUtils';

export default function TextRenderer({
  content, activeWordIdx = -1, onWordTap, className = '', isSingleWord = false,
}) {
  const { preferences } = usePreferences();

  const { title, paragraphs, wordMap } = useMemo(() => {
    const rawText = typeof content === 'string' ? content : content?.text || '';
    const rawTitle = typeof content === 'object' ? content?.title : '';
    const wordMap = {};
    if (typeof content === 'object' && Array.isArray(content?.words)) {
      for (const wd of content.words) wordMap[wd.word] = wd;
    }
    // For single words, don't split into paragraphs
    if (isSingleWord) return { title: rawTitle, paragraphs: [rawText], wordMap };
    const paras = splitIntoParagraphs(rawText, preferences.paragraphBreak);
    return { title: rawTitle, paragraphs: paras, wordMap };
  }, [content, preferences.paragraphBreak, isSingleWord]);

  let globalWordIdx = 0;

  return (
    <div className={`reading-content ${className}`} lang="bn" dir="ltr" aria-label="পাঠ্য বিষয়বস্তু">
      {title && (
        <h2 style={{
          fontFamily: `'${preferences.fontFamily}', 'Noto Sans Bengali', sans-serif`,
          fontSize: `${Math.min(preferences.fontSize + 4, 36)}px`,
          lineHeight: 1.4, letterSpacing: `${preferences.letterSpacing}px`,
          color: 'var(--pref-text-color)', marginBottom: '0.8em', fontWeight: 700,
        }}>
          {title}
        </h2>
      )}
      {paragraphs.map((para, paraIdx) => {
        const tokens = tokenizeText(para);
        return (
          <p key={paraIdx} className="reading-para" aria-label={`অনুচ্ছেদ ${paraIdx + 1}`}>
            {tokens.map((token, tokenIdx) => {
              if (token.type !== 'word') {
                return <span key={tokenIdx} aria-hidden="true">{token.value}</span>;
              }
              const wordIdx = globalWordIdx++;
              const wordData = wordMap[token.value] || null;
              const isActive = wordIdx === activeWordIdx;
              const capturedIdx = wordIdx;
              return (
                <WordSpan
                  key={`${paraIdx}-${tokenIdx}`}
                  word={token.value} wordData={wordData} preferences={preferences}
                  isActive={isActive} showConjunct={preferences.showConjunctUnderline}
                  showReph={preferences.showRephIndicator} boldHighFreq={preferences.boldHighFreqWords}
                  onTap={(w, wd) => onWordTap && onWordTap(w, wd, capturedIdx)}
                />
              );
            })}
          </p>
        );
      })}
      {paragraphs.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem', color: 'rgba(45,27,0,0.4)',
          fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '18px',
        }} role="status">
          কোনো পাঠ্য পাওয়া যায়নি।
        </div>
      )}
    </div>
  );
}
