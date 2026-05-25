/**
 * WordSpan.jsx
 * -------------
 * Renders a single Bangla word with all Feature 1 accessibility behaviors:
 *   1. Conjunct detection → underline + tap-to-expand popup
 *   2. Vowel diacritic tinting (via CSS class)
 *   3. র-ফলা indicator (via CSS class)
 *   4. High-frequency word bolding
 *   5. Hover/tap highlight for word selection
 */

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { classifyWord } from '../../utils/banglaUtils';
import ConjunctExpander from './ConjunctExpander';

export default function WordSpan({
  word, wordData = null, preferences = {}, onTap,
  isActive = false, showConjunct = true, showReph = true, boldHighFreq = true,
}) {
  const [conjunctOpen, setConjunctOpen] = useState(false);
  const wrapperRef = useRef(null);

  const classification = {
    isConjunct: wordData?.conjunctPresent ?? classifyWord(word).isConjunct,
    hasReph: classifyWord(word).hasReph,
    isHighFreq: wordData?.isFamiliar ?? classifyWord(word).isHighFreq,
    isBangla: classifyWord(word).isBangla,
  };

  const classes = ['word-span'];
  if (showConjunct && classification.isConjunct) classes.push('conjunct-word');
  if (showReph && classification.hasReph) classes.push('reph-word');
  if (boldHighFreq && classification.isHighFreq) classes.push('high-freq-word');
  if (isActive) classes.push('word-active');

  const handleTap = useCallback((e) => {
    e.stopPropagation();
    if (showConjunct && classification.isConjunct) setConjunctOpen(prev => !prev);
    onTap && onTap(word, wordData);
  }, [word, wordData, showConjunct, classification.isConjunct, onTap]);

  const handleCloseConjunct = useCallback(() => setConjunctOpen(false), []);

  const activeStyle = isActive ? {
    backgroundColor: preferences.highlightColor || '#FFD700',
    borderRadius: '4px', padding: '0 2px', transition: 'background-color 0.1s ease',
  } : {};

  return (
    <motion.span
      ref={wrapperRef}
      className={classes.join(' ')}
      style={{ position: 'relative', display: 'inline-block', ...activeStyle }}
      onClick={handleTap}
      onKeyDown={(e) => e.key === 'Enter' && handleTap(e)}
      tabIndex={0}
      role="button"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      aria-label={
        classification.isConjunct
          ? `যুক্তবর্ণ: ${word} — ক্লিক করুন বিশ্লেষণ দেখতে`
          : `শব্দ: ${word}`
      }
    >
      {word}
      {showConjunct && classification.isConjunct && (
        <ConjunctExpander
          word={word}
          parts={wordData?.conjunctBreakdown || null}
          isOpen={conjunctOpen}
          onClose={handleCloseConjunct}
        />
      )}
    </motion.span>
  );
}
