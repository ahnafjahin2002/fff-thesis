import { motion } from 'framer-motion';
import { bornoAssets } from '../assets/config';

export default function ProductClue({ clue, status, productImageKey, answerLength }) {
  const isRevealed = status === 'correct';
  
  // Use product image or placeholder based on reveal state
  const imgSource = isRevealed && bornoAssets.products[productImageKey] 
    ? bornoAssets.products[productImageKey]
    : null; // Can fallback to question mark or blank

  return (
    <div className="product-clue-container">
      <div className="clue-text-bubble">
        <p>{clue}</p>
        <button className="audio-btn">🔊</button>
      </div>

      <div className="product-display">
        {isRevealed ? (
          <motion.img 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            src={imgSource} 
            alt="Product Revealed" 
            className="revealed-product-img"
          />
        ) : (
          <div className="mystery-box">
            <span className="question-mark">?</span>
            <div className="letter-count-hint">
              {answerLength} অক্ষরের শব্দ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
