import { motion } from 'framer-motion';

export default function BreakReminder({ onComplete }) {
  return (
    <div className="break-reminder-container" role="main" aria-label="বিশ্রাম">
      <div className="break-overlay">
        
        <motion.div 
          className="break-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          role="alert"
          aria-live="polite"
        >
          <motion.div 
            className="breathing-circle"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              ease: "easeInOut" 
            }}
            aria-hidden="true"
          >
            <span className="calm-icon">🧘‍♂️</span>
          </motion.div>

          <h1 className="break-title">তুমি অনেক ভালো করেছো!</h1>
          <p className="break-subtitle">এবার একটু বিশ্রাম নাও।</p>

          <motion.button 
            className="action-button primary-btn break-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            aria-label="আবার খেলবো"
          >
            আবার খেলবো →
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
