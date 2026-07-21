import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';
import { bornoAssets } from '../assets/config';
import { useBornoBazarContext } from '../context/BornoBazarContext';
import ShopHeader from './ShopHeader';
import LetterTile from './LetterTile';
import WordBuilder from './WordBuilder';
import ProductClue from './ProductClue';

export default function StockingGame({ shop, targetProductId, onComplete, onBack }) {
  const shopProducts = products.filter(p => p.shop === shop);
  const initialIndex = targetProductId ? shopProducts.findIndex(p => p.id === targetProductId) : 0;
  const [currentProductIndex, setCurrentProductIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'wrong' | 'correct'
  const [feedbackMsg, setFeedbackMsg] = useState("");
  
  const { addStar, addProduct } = useBornoBazarContext();

  const currentProduct = shopProducts[currentProductIndex];

  useEffect(() => {
    if (!currentProduct) {
      // If no products found for shop, skip to next stage
      onComplete();
    }
  }, [currentProduct, onComplete]);

  if (!currentProduct) return null;

  const handleLetterClick = (letter, originalIndex) => {
    if (status !== 'idle') return; // block input while animating
    if (selectedLetters.length >= currentProduct.answer.length) return;

    setSelectedLetters([...selectedLetters, { letter, originalIndex }]);
  };

  const handleRemoveLetter = (indexToRemove) => {
    if (status !== 'idle') return;
    const newLetters = [...selectedLetters];
    newLetters.splice(indexToRemove, 1);
    setSelectedLetters(newLetters);
  };

  // Check answer when all slots are filled
  useEffect(() => {
    if (selectedLetters.length === currentProduct.answer.length) {
      checkAnswer();
    }
  }, [selectedLetters]);

  const checkAnswer = () => {
    const isCorrect = selectedLetters.every((item, idx) => item.letter === currentProduct.answer[idx]);
    
    if (isCorrect) {
      setStatus('correct');
      setFeedbackMsg("অসাধারণ! তুমি পেরেছো! 🎉");
      
      // Update global progress
      addStar(10);
      addProduct(currentProduct.id);

      // Wait 2.5s to show success animation, then finish to close the popup
      setTimeout(() => {
        onComplete();
      }, 2500);

    } else {
      setStatus('wrong');
      setFeedbackMsg("আরেকবার চেষ্টা করো। তুমি পারবে! 💪");
      
      // Shake for 1s, then clear
      setTimeout(() => {
        setSelectedLetters([]);
        setStatus('idle');
        setFeedbackMsg("");
      }, 1500);
    }
  };

  const bgImage = bornoAssets.backgrounds.bazarMap; // simple background

  return (
    <div className="stocking-game-container popup-overlay" role="main" aria-label="পণ্য সাজাও খেলা" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <div className="shop-bg blur-bg" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', position: 'absolute', inset: 0 }} aria-hidden="true" />
      
      <div className="stocking-overlay game-layout-wrapper" style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        <div className="game-layout-header">
          <ShopHeader shopName="পণ্য সাজাও" onBack={onBack} />
        </div>
        
        <div className="game-layout-content">
          <div className="game-clue-section">
            <ProductClue 
            clue={currentProduct.clue} 
            status={status} 
            productImageKey={currentProduct.imagePlaceholder} 
            answerLength={currentProduct.answer.length}
          />

          </div>

          <div className="game-builder-section">
            <WordBuilder 
              expectedLength={currentProduct.answer.length} 
              selectedLetters={selectedLetters}
              onRemoveLetter={handleRemoveLetter}
              status={status}
            />
          </div>

          <div className="game-letters-section letters-pool" role="group" aria-label="অক্ষর পছন্দ করো">
            {currentProduct.letters.map((letter, idx) => {
              const isSelected = selectedLetters.some(item => item.originalIndex === idx);
              return (
                <LetterTile 
                  key={`${currentProductIndex}-${idx}`}
                  letter={letter} 
                  isSelected={isSelected}
                  disabled={status !== 'idle'}
                  onClick={() => handleLetterClick(letter, idx)}
                  tabIndex={status !== 'idle' || isSelected ? -1 : 0}
                  aria-label={letter}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (status === 'idle' && !isSelected) handleLetterClick(letter, idx);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {feedbackMsg && (
            <motion.div 
              className={`feedback-toast ${status}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              role="alert"
              aria-live="assertive"
            >
              {feedbackMsg}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
