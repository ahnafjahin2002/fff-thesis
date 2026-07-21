import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { conversations } from '../data/conversations';
import { bornoAssets } from '../assets/config';
import { useBornoBazarContext } from '../context/BornoBazarContext';
import ShopHeader from './ShopHeader';
import Customer from './Customer';
import DialogueBubble from './DialogueBubble';
import SentenceBuilder from './SentenceBuilder';
import Shelf from './Shelf';
import { products } from '../data/products';

import convoBgImage from '../../../assets/images/convo_bg.png';
import shopkeeperImgSrc from '../../../assets/images/shopkeeper.png';

export default function ConversationGame({ shop, onComplete, onBack }) {
  const shopConversations = conversations.filter(c => c.shop === shop);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [selectedWords, setSelectedWords] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'wrong' | 'correct'
  const [feedbackMsg, setFeedbackMsg] = useState("");
  
  const { addCoin, progress } = useBornoBazarContext();
  const inventory = progress?.inventory || [];
  const shopProducts = products.filter(p => p.shop === shop);

  const currentConvo = shopConversations[currentIndex];

  useEffect(() => {
    if (!currentConvo) {
      onComplete();
    }
  }, [currentConvo, onComplete]);

  if (!currentConvo) return null;

  const handleWordClick = (word, originalIndex) => {
    if (status !== 'idle') return;
    if (selectedWords.length >= currentConvo.correctSequence.length) return;

    setSelectedWords([...selectedWords, { word, originalIndex }]);
  };

  const handleRemoveWord = (indexToRemove) => {
    if (status !== 'idle') return;
    const newWords = [...selectedWords];
    newWords.splice(indexToRemove, 1);
    setSelectedWords(newWords);
  };

  useEffect(() => {
    if (selectedWords.length === currentConvo.correctSequence.length) {
      checkAnswer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWords]);

  const checkAnswer = () => {
    const isCorrect = selectedWords.every((item, idx) => item.word === currentConvo.correctSequence[idx]);
    
    if (isCorrect) {
      setStatus('correct');
      setFeedbackMsg("চমৎকার! 🌟");
      
      addCoin(15);

      setTimeout(() => {
        if (currentIndex + 1 < shopConversations.length) {
          setCurrentIndex(prev => prev + 1);
          setSelectedWords([]);
          setStatus('idle');
          setFeedbackMsg("");
        } else {
          onComplete();
        }
      }, 2500);

    } else {
      setStatus('wrong');
      setFeedbackMsg(currentConvo.hint || "আরেকবার চেষ্টা করো।");
      
      setTimeout(() => {
        setSelectedWords([]);
        setStatus('idle');
        setFeedbackMsg("");
      }, 2000);
    }
  };

  const bgImage = convoBgImage;

  return (
    <div className="conversation-game-container" role="main" aria-label="কথোপকথন খেলা">
      <img src={bgImage} alt="" className="shop-bg blur-bg" aria-hidden="true" />
      
      <div className="conversation-white-card">
        {/* Header elements absolutely positioned on the top edge */}
        <div className="card-header-floating">
          <button className="floating-back-btn" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            ফিরুন
          </button>
          <div className="floating-title-pill">
            <h1>কাস্টমারের সাথে কথোপকথন</h1>
          </div>
        </div>
        
        <div className="conversation-main-area">
          {/* Left Panel: Shelf */}
          <div className="conversation-left-panel">
            <Shelf shopProducts={shopProducts} inventory={inventory} />
          </div>
          {/* Center Panel: Shopkeeper */}
          <div className="conversation-center-panel">
            <div className="shopkeeper-wrapper">
              <img src={shopkeeperImgSrc} alt="দোকানদার" className="convo-character-img shopkeeper-blend" />
              <div className="small-checkout-counter">
                 <div className="counter-top-edge"></div>
                 <div className="counter-front"></div>
              </div>
            </div>
          </div>

          {/* Right Panel: Customer */}
          <div className="conversation-right-panel" aria-live="polite">
            <div className="customer-bubble-wrapper">
              <DialogueBubble text={currentConvo.customer} />
            </div>
            <div className="customer-wrapper">
              <Customer mood={status === 'correct' ? 'happy' : status === 'wrong' ? 'thinking' : 'neutral'} />
              <div className="character-label">কাস্টমার</div>
            </div>
          </div>
        </div>

        <div className="conversation-footer">
          {/* Central Modal for Sentence Building moved to footer */}
          <div className="conversation-builder-dock">
            <div className="builder-main-area">
              <h2 className="builder-title">আপনার উত্তর তৈরি করুন</h2>
              <SentenceBuilder 
                expectedLength={currentConvo.correctSequence.length} 
                selectedWords={selectedWords}
                onRemoveWord={handleRemoveWord}
                status={status}
              />
              <div className="words-pool" role="group" aria-label="শব্দ পছন্দ করো">
                {currentConvo.words.map((word, idx) => {
                  const isSelected = selectedWords.some(item => item.originalIndex === idx);
                  return (
                    <motion.button 
                      key={`${currentIndex}-${idx}`}
                      className={`builder-word-tile ${isSelected ? 'selected' : ''}`}
                      disabled={status !== 'idle' || isSelected}
                      onClick={() => handleWordClick(word, idx)}
                      whileHover={!(status !== 'idle' || isSelected) ? { scale: 1.05, y: -2 } : {}}
                      whileTap={!(status !== 'idle' || isSelected) ? { scale: 0.95 } : {}}
                      tabIndex={status !== 'idle' || isSelected ? -1 : 0}
                      aria-label={word}
                    >
                      {word}
                    </motion.button>
                  );
                })}
                
                <button className="submit-answer-btn" disabled={selectedWords.length !== currentConvo.correctSequence.length || status !== 'idle'} onClick={checkAnswer}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${((currentIndex + 1) / shopConversations.length) * 100}%` }}></div>
          </div>
          
          <button className="finish-convo-btn" onClick={onComplete}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            কথা শেষ
          </button>
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
