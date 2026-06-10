import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '../../hooks/useGameState';

export default function ShopBuiltCelebration({ onDone }) {
  const { state } = useGameState();

  useEffect(() => {
    // Auto advance after 4 seconds
    const timer = setTimeout(() => {
      onDone();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="celebration-screen">
      <motion.div 
        className="celebration-emoji"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        🎉
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="celebration-title">দারুণ!</div>
        <div className="celebration-sub">তোমার প্রথম দোকান তৈরি!</div>
      </motion.div>

      <motion.div 
        className="star-display"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ marginTop: 16 }}
      >
        <span className="star-icon">⭐</span>
        <span className="star-count">+১</span>
      </motion.div>

      <motion.button 
        className="btn-primary"
        style={{ marginTop: 32 }}
        onClick={onDone}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        বাজারে চলো
      </motion.button>
    </div>
  );
}
