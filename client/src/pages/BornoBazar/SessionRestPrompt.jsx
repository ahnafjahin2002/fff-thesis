import { motion } from 'framer-motion';

export default function SessionRestPrompt({ onContinue, onRest }) {
  return (
    <div className="rest-overlay">
      <motion.div 
        className="rest-card"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", bounce: 0.4 }}
      >
        <div className="rest-emoji">🥱</div>
        <div className="rest-title">বিশ্রাম নেবে?</div>
        <div className="rest-sub">
          তুমি অনেকক্ষণ ধরে চমৎকার খেলছো! এখন একটু বিশ্রাম নিতে পারো।
        </div>
        
        <div className="rest-actions">
          <motion.button 
            className="btn-primary"
            style={{ background: '#f0f0f0', color: '#1a2e1a' }}
            onClick={onContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            আরও খেলব
          </motion.button>
          
          <motion.button 
            className="btn-primary"
            onClick={onRest}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            হ্যাঁ, বিশ্রাম
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
