import { motion } from 'framer-motion';

export default function GameBackButton({ onClick, label = "ফিরে যাও" }) {
  return (
    <motion.button 
      className="game-back-btn"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95, y: 2 }}
      aria-label={label}
    >
      <span className="back-icon" aria-hidden="true">←</span> {label}
    </motion.button>
  );
}
