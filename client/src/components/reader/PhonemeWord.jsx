/**
 * PhonemeWord.jsx
 * ────────────────────────────────────────────
 * Renders a single word as a series of <span> elements,
 * one per phoneme/syllable unit.
 *
 * Props:
 *  - word: string (the original word)
 *  - phonemes: string[] (segmented phonemes)
 *  - isActiveWord: boolean (whether this word is currently being narrated)
 *  - activePhonemeIndex: number (which phoneme within this word is highlighted)
 *  - highlightColor: string (CSS color for active phoneme)
 *  - onClick: () => void (tap handler)
 *  - dimmed: boolean (whether to dim this word when another word is active)
 */

import { motion } from 'framer-motion';

export default function PhonemeWord({
  word,
  phonemes = [],
  isActiveWord = false,
  activePhonemeIndex = -1,
  highlightColor = '#FFD700',
  onClick,
  dimmed = false,
}) {
  return (
    <motion.span
      className={`phoneme-word ${isActiveWord ? 'phoneme-word--active' : ''} ${dimmed ? 'phoneme-word--dimmed' : ''}`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      layout
      style={{ cursor: 'pointer' }}
    >
      {phonemes.map((phoneme, idx) => {
        const isActive = isActiveWord && idx === activePhonemeIndex;
        return (
          <span
            key={idx}
            className={`phoneme-span ${isActive ? 'phoneme-active' : ''}`}
            style={{
              '--phoneme-highlight': highlightColor,
            }}
          >
            {phoneme}
          </span>
        );
      })}
    </motion.span>
  );
}
