import { motion } from 'framer-motion';

export default function LetterTile({ letter, onClick, isSelected, disabled }) {
  return (
    <motion.button
      className={`letter-tile ${isSelected ? 'selected' : ''}`}
      whileHover={!disabled && !isSelected ? { scale: 1.1, y: -5 } : {}}
      whileTap={!disabled && !isSelected ? { scale: 0.9 } : {}}
      onClick={() => {
        if (!disabled && !isSelected) {
          onClick(letter);
        }
      }}
      disabled={disabled || isSelected}
    >
      {letter}
    </motion.button>
  );
}
