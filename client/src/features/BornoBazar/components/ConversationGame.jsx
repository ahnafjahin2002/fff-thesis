import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { conversations } from '../data/conversations';
import { bornoAssets } from '../assets/config';
import { useBornoBazarContext } from '../context/BornoBazarContext';
import ShopHeader from './ShopHeader';
import Customer from './Customer';
import DialogueBubble from './DialogueBubble';
import SentenceBuilder from './SentenceBuilder';

export default function ConversationGame({ shop, onComplete, onBack }) {
  const shopConversations = conversations.filter(c => c.shop === shop);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [selectedWords, setSelectedWords] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'wrong' | 'correct'
  const [feedbackMsg, setFeedbackMsg] = useState("");
  
  const { addCoin } = useBornoBazarContext();

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

  const bgImage = bornoAssets.backgrounds.bazarMap;

  return (
    <div className="conversation-game-container" role="main" aria-label="কথোপকথন খেলা">
      <img src={bgImage} alt="" className="shop-bg blur-bg" aria-hidden="true" />
      
      <div className="conversation-overlay game-layout-wrapper">
        <div className="game-layout-header">
          <ShopHeader shopName="কাস্টমারের সাথে কথা বলো" onBack={onBack} />
        </div>
        
        <div className="game-layout-content interaction-area">
          <div className="customer-area" aria-live="polite">
            <DialogueBubble text={currentConvo.customer} />
            <Customer mood={status === 'correct' ? 'happy' : status === 'wrong' ? 'thinking' : 'neutral'} />
          </div>

          <div className="builder-area game-builder-section">
            <SentenceBuilder 
              expectedLength={currentConvo.correctSequence.length} 
              selectedWords={selectedWords}
              onRemoveWord={handleRemoveWord}
              status={status}
            />

            <div className="words-pool game-letters-section" role="group" aria-label="শব্দ পছন্দ করো">
              {currentConvo.words.map((word, idx) => {
                const isSelected = selectedWords.some(item => item.originalIndex === idx);
                return (
                  <motion.button 
                    key={`${currentIndex}-${idx}`}
                    className={`word-tile ${isSelected ? 'selected' : ''}`}
                    disabled={status !== 'idle' || isSelected}
                    onClick={() => handleWordClick(word, idx)}
                    whileHover={!(status !== 'idle' || isSelected) ? { scale: 1.1, y: -5 } : {}}
                    whileTap={!(status !== 'idle' || isSelected) ? { scale: 0.95 } : {}}
                    tabIndex={status !== 'idle' || isSelected ? -1 : 0}
                    aria-label={word}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </div>
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
