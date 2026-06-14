/**
 * PhonemeWord.jsx
 * ────────────────────────────────────────────
 * Renders one word as phoneme/syllable units.
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
  const units = phonemes.length ? phonemes : [word];

  return (
    <motion.span
      className={`phoneme-word ${isActiveWord ? 'phoneme-word--active' : ''} ${
        dimmed ? 'phoneme-word--dimmed' : ''
      }`}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      layout
      style={{ cursor: 'pointer' }}
    >
      {units.map((phoneme, idx) => {
        const isActive = isActiveWord && idx === activePhonemeIndex;

        return (
          <span
            key={`${phoneme}-${idx}`}
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