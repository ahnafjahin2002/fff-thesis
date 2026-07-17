import { motion } from 'framer-motion';

export default function DialogueBubble({ text }) {
  return (
    <motion.div 
      className="dialogue-bubble-container"
      initial={{ scale: 0, opacity: 0, x: -50 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      transition={{ type: "spring", bounce: 0.5 }}
    >
      <div className="dialogue-bubble">
        <p>{text}</p>
        <button className="audio-btn small">🔊</button>
      </div>
      <div className="bubble-tail"></div>
    </motion.div>
  );
}
