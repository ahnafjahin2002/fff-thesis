// ─── Phase 3: খেলো দোকানদার (Run the Shop) ─────────────────────────────────
// Customer arrives → child picks product → builds shopkeeper's sentence
// Implements: product identification, scrambled sentence unscrambling,
// reading anchor line, hint system, customer relationship tracking.

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../hooks/useGameState';
import { CUSTOMERS } from '../../data/customers';
import { CONVERSATIONS, scrambleSentence } from '../../data/sentences';
import { PHASE2_WORDS } from '../../data/words';
import './Phase3Conversation.css';

import imgMascotWave from '../../assets/mascot-wave.png';
import imgMascotCelebrate from '../../assets/mascot-celebrate.png';
import imgMascotEncourage from '../../assets/mascot-encourage.png';
import imgMascotThink from '../../assets/mascot-think.png';

// ── Sub-phases of a single customer interaction ──
const STEPS = {
  CUSTOMER_ENTERING: 'entering',
  PICK_PRODUCT: 'pick_product',
  BUILD_SENTENCE: 'build_sentence',
  SENTENCE_COMPLETE: 'sentence_complete',
  CUSTOMER_LEAVING: 'leaving',
};

import { playBanglaTTS } from '../../utils/audio';

export default function Phase3Conversation({ shopColor = '#18b368', onComplete, onBack }) {
  const { state, dispatch } = useGameState();
  const sessionSeed = useRef(Date.now());

  // Available products on the shelf (from Phase 2 words data)
  const shelfProducts = useMemo(() => {
    // Use first 3 products from PHASE2_WORDS as default shelf
    return PHASE2_WORDS.slice(0, 3).map(w => ({
      id: w.id,
      emoji: w.emoji,
      image: w.image,
      name: w.product,
    }));
  }, []);

  // Build conversation queue from available products
  const conversationQueue = useMemo(() => {
    const productIds = shelfProducts.map(p => p.id);
    return CONVERSATIONS.filter(c => productIds.includes(c.productId));
  }, [shelfProducts]);

  // Game state
  const [customerIdx, setCustomerIdx] = useState(0);
  const [step, setStep] = useState(STEPS.CUSTOMER_ENTERING);
  const [currentConvo, setCurrentConvo] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Product pick state
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [wrongPickId, setWrongPickId] = useState(null);
  const [correctPickId, setCorrectPickId] = useState(null);

  // Sentence building state
  const [scrambledWords, setScrambledWords] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);

  // Hint & feedback
  const [failureCount, setFailureCount] = useState(0);
  const [hintActive, setHintActive] = useState(false);
  const [hintWordIdx, setHintWordIdx] = useState(null);
  const [mascotState, setMascotState] = useState('wave');
  const [customerExpression, setCustomerExpression] = useState('happy');

  // Speech typing effect
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Celebration
  const [celebrating, setCelebrating] = useState(false);
  const [customersServed, setCustomersServed] = useState(0);

  // ── Initialize first customer ──
  useEffect(() => {
    if (conversationQueue.length === 0) return;
    startNewCustomer(0);
  }, [conversationQueue]);

  const startNewCustomer = useCallback((idx) => {
    if (idx >= conversationQueue.length) {
      // All customers served — celebrate!
      setCelebrating(true);
      setMascotState('celebrate');
      setTimeout(() => {
        if (onComplete) onComplete(customersServed + 1);
      }, 3000);
      return;
    }

    const convo = conversationQueue[idx];
    const customer = CUSTOMERS[idx % CUSTOMERS.length];

    setCurrentConvo(convo);
    setCurrentCustomer(customer);
    setCustomerIdx(idx);
    setStep(STEPS.CUSTOMER_ENTERING);
    setSelectedProductId(null);
    setWrongPickId(null);
    setCorrectPickId(null);
    setPlacedWords([]);
    setFailureCount(0);
    setHintActive(false);
    setHintWordIdx(null);
    setCustomerExpression('happy');
    setMascotState('wave');

    // Customer entrance animation → then show speech
    setTimeout(() => {
      setStep(STEPS.PICK_PRODUCT);
      typeText(convo.customerRequest, () => {
        playBanglaTTS(convo.customerRequest);
      });
    }, 1000);
  }, [conversationQueue, customersServed, onComplete]);

  // ── Typing effect for speech bubble ──
  const typeText = useCallback((text, onDone) => {
    setIsTyping(true);
    setDisplayedText('');
    let i = 0;
    const chars = [...text]; // Handle Unicode properly
    const timer = setInterval(() => {
      i++;
      setDisplayedText(chars.slice(0, i).join(''));
      if (i >= chars.length) {
        clearInterval(timer);
        setIsTyping(false);
        if (onDone) setTimeout(onDone, 200);
      }
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // ── Handle product pick ──
  const handleProductPick = useCallback((productId) => {
    if (step !== STEPS.PICK_PRODUCT || !currentConvo) return;

    if (productId === currentConvo.productId) {
      // Correct!
      setCorrectPickId(productId);
      setCustomerExpression('happy');
      setMascotState('celebrate');
      dispatch({ type: 'EARN_STAR', count: 1 });

      setTimeout(() => {
        // Move to sentence building
        const scrambled = scrambleSentence(
          currentConvo.shopkeeperResponse,
          sessionSeed.current + customerIdx
        );
        setScrambledWords(scrambled);
        setAvailableTiles(scrambled.map((w, i) => ({ word: w, id: i })));
        setPlacedWords([]);
        setFailureCount(0);
        setHintActive(false);
        setStep(STEPS.BUILD_SENTENCE);
        setMascotState('think');
      }, 800);
    } else {
      // Wrong pick
      setWrongPickId(productId);
      setCustomerExpression('curious');
      setMascotState('encourage');
      setFailureCount(f => f + 1);
      
      // Customer says confused line
      typeText('আমি বুঝিনি, আবার দেখাও?', null);
      playBanglaTTS('আমি বুঝিনি, আবার দেখাও?');

      setTimeout(() => {
        setWrongPickId(null);
        setCustomerExpression('happy');
        // Re-show original request
        typeText(currentConvo.customerRequest, null);
      }, 1500);
    }
  }, [step, currentConvo, customerIdx, dispatch, typeText]);

  // ── Hint trigger for product pick ──
  useEffect(() => {
    if (step === STEPS.PICK_PRODUCT && failureCount >= 2 && !hintActive) {
      setHintActive(true);
      // Hint: play the product name aloud
      if (currentConvo) {
        playBanglaTTS(currentConvo.productName);
      }
      setFailureCount(0);
    }
  }, [failureCount, step, hintActive, currentConvo]);

  // ── Handle word tile tap (sentence building) ──
  const handleTileTap = useCallback((tile) => {
    if (step !== STEPS.BUILD_SENTENCE || !currentConvo) return;

    const nextPos = placedWords.length;
    const correctWord = currentConvo.shopkeeperResponse[nextPos];

    if (tile.word === correctWord) {
      // Correct word placement
      const newPlaced = [...placedWords, tile];
      setPlacedWords(newPlaced);
      setAvailableTiles(prev => prev.filter(t => t.id !== tile.id));
      setHintActive(false);
      setHintWordIdx(null);
      setFailureCount(0);
      dispatch({ type: 'EARN_STAR', count: 1 });

      // Check if sentence is complete
      if (newPlaced.length === currentConvo.shopkeeperResponse.length) {
        handleSentenceComplete();
      }
    } else {
      // Wrong word
      setFailureCount(f => f + 1);
      setMascotState('encourage');

      // After 2 failures, activate hint
      if (failureCount + 1 >= 2) {
        setHintActive(true);
        // Find the correct next tile and highlight it
        const correctTile = availableTiles.find(t => t.word === correctWord);
        if (correctTile) setHintWordIdx(correctTile.id);
        // Read sentence aloud as hint
        playBanglaTTS(currentConvo.shopkeeperResponse.join(' '));
        setFailureCount(0);
      }
    }
  }, [step, currentConvo, placedWords, availableTiles, failureCount, dispatch]);

  // ── Undo last placed word ──
  const handleUndoWord = useCallback(() => {
    if (placedWords.length === 0) return;
    const lastPlaced = placedWords[placedWords.length - 1];
    setPlacedWords(prev => prev.slice(0, -1));
    setAvailableTiles(prev => [...prev, lastPlaced]);
  }, [placedWords]);

  // ── Sentence complete ──
  const handleSentenceComplete = useCallback(() => {
    setStep(STEPS.SENTENCE_COMPLETE);
    setMascotState('celebrate');
    setCustomerExpression('grateful');

    // Speak the full sentence
    const fullSentence = currentConvo.shopkeeperResponse.join(' ');
    playBanglaTTS(fullSentence);

    dispatch({ type: 'EARN_STAR', count: 2 });

    // Customer leaves after celebration
    setTimeout(() => {
      // Customer farewell
      if (currentCustomer) {
        typeText(currentCustomer.farewell, () => {
          playBanglaTTS(currentCustomer.farewell);
        });
      }

      setTimeout(() => {
        setStep(STEPS.CUSTOMER_LEAVING);
        setCustomersServed(prev => prev + 1);

        // Next customer after exit animation
        setTimeout(() => {
          startNewCustomer(customerIdx + 1);
        }, 1500);
      }, 2000);
    }, 1500);
  }, [currentConvo, currentCustomer, customerIdx, dispatch, typeText, startNewCustomer]);

  // ── Render ──
  if (!currentConvo || !currentCustomer) {
    return (
      <div className="phase3-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 48 }}>🏪</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#687076', marginTop: 16 }}>
          দোকান প্রস্তুত হচ্ছে...
        </div>
      </div>
    );
  }

  const totalCustomers = conversationQueue.length;

  return (
    <div className="phase3-container">
      {/* ── TOP BAR ── */}
      <div className="p3-topbar">
        <button className="p3-back-btn" onClick={onBack} aria-label="Back to street">
          ←
        </button>
        <span className="p3-title">খেলো দোকানদার</span>
        <div className="p3-footprints">
          {Array.from({ length: totalCustomers }).map((_, i) => (
            <span
              key={i}
              className={`p3-footprint ${i < customersServed ? 'served' : ''}`}
            >
              👣
            </span>
          ))}
        </div>
      </div>

      {/* ── MAIN SPLIT LAYOUT ── */}
      <div className="p3-main">
        {/* ── LEFT: Shop Shelves ── */}
        <div className="p3-shop-panel">
          <div className="p3-shop-label">আমার দোকান</div>
          <div className="p3-shelf-grid">
            {shelfProducts.map(product => (
              <motion.div
                key={product.id}
                className={`p3-shelf-item 
                  ${selectedProductId === product.id ? 'selected' : ''} 
                  ${wrongPickId === product.id ? 'wrong-pick' : ''}
                  ${correctPickId === product.id ? 'correct-pick' : ''}
                `}
                onClick={() => handleProductPick(product.id)}
                whileTap={{ scale: 0.95 }}
                style={{ cursor: step === STEPS.PICK_PRODUCT ? 'pointer' : 'default' }}
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                ) : (
                  <span className="p3-item-emoji">{product.emoji}</span>
                )}
                <span className="p3-item-name">{product.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Conversation ── */}
        <div className="p3-conversation-panel">
          {/* Customer with speech bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`customer-${customerIdx}`}
              className={`p3-customer-area ${
                step === STEPS.CUSTOMER_ENTERING ? 'p3-customer-enter' : ''
              } ${step === STEPS.CUSTOMER_LEAVING ? 'p3-customer-exit' : ''}`}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <div
                className={`p3-customer-avatar ${customerExpression === 'curious' ? 'curious' : ''}`}
                style={{ background: `${currentCustomer.color}20`, border: `3px solid ${currentCustomer.color}` }}
              >
                {currentCustomer.image ? (
                  <img src={currentCustomer.image} alt={currentCustomer.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                ) : (
                  currentCustomer.expressions[customerExpression] || currentCustomer.emoji
                )}
                <span className="p3-customer-name">{currentCustomer.name}</span>
              </div>

              <motion.div
                className="p3-speech-bubble"
                style={{ borderColor: `${currentCustomer.color}40` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
              >
                {displayedText || '...'}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Audio replay button */}
          <div className="p3-audio-row">
            <button
              className="p3-audio-btn"
              onClick={() => {
                if (step === STEPS.PICK_PRODUCT && currentConvo) {
                  playBanglaTTS(currentConvo.customerRequest);
                } else if (step === STEPS.BUILD_SENTENCE && currentConvo) {
                  playBanglaTTS(currentConvo.shopkeeperResponse.join(' '));
                }
              }}
              aria-label="আবার শুনুন"
            >
              🔊
            </button>
            <span className="p3-audio-label">আবার শুনুন</span>
          </div>

          {/* Step-specific content */}
          {step === STEPS.PICK_PRODUCT && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p3-prompt-text"
            >
              <span className="p3-step-badge">📦 ধাপ ১</span>
              <br />
              কাস্টমার কী চাইছে? তাকের থেকে বেছে দাও!
            </motion.div>
          )}

          {(step === STEPS.BUILD_SENTENCE || step === STEPS.SENTENCE_COMPLETE) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p3-prompt-text">
                <span className="p3-step-badge">💬 ধাপ ২</span>
                <br />
                দোকানদারের উত্তর সাজাও!
              </div>

              {/* Sentence slots */}
              <div className="p3-response-area">
                <div className="p3-response-label">তোমার উত্তর:</div>
                <div className="p3-sentence-slots">
                  {currentConvo.shopkeeperResponse.map((_, i) => (
                    <motion.div
                      key={i}
                      className={`p3-word-slot 
                        ${i < placedWords.length ? 'filled' : ''}
                        ${step === STEPS.SENTENCE_COMPLETE ? 'correct-wave' : ''}
                      `}
                      onClick={() => {
                        if (i === placedWords.length - 1 && step === STEPS.BUILD_SENTENCE) {
                          handleUndoWord();
                        }
                      }}
                      style={step === STEPS.SENTENCE_COMPLETE ? { animationDelay: `${i * 0.1}s` } : {}}
                    >
                      {placedWords[i]?.word || ''}
                    </motion.div>
                  ))}
                  <div className="p3-anchor-line" />
                </div>
              </div>

              {/* Word tile pool */}
              {step === STEPS.BUILD_SENTENCE && (
                <motion.div
                  className="p3-tile-pool"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {availableTiles.map(tile => (
                    <motion.button
                      key={tile.id}
                      className={`p3-word-tile ${hintActive && hintWordIdx === tile.id ? 'hint-glow' : ''}`}
                      onClick={() => handleTileTap(tile)}
                      whileTap={{ scale: 0.92 }}
                      layout
                    >
                      {tile.word}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── MASCOT ── */}
      <div className={`p3-mascot ${mascotState === 'celebrate' ? 'celebrating' : ''}`}>
        <AnimatePresence>
          {mascotState === 'encourage' && (
            <motion.div
              className="p3-mascot-bubble"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              আবার চেষ্টা করো! 💪
            </motion.div>
          )}
          {mascotState === 'celebrate' && (
            <motion.div
              className="p3-mascot-bubble"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              দারুণ! 🎉
            </motion.div>
          )}
          {mascotState === 'think' && (
            <motion.div
              className="p3-mascot-bubble"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              কথাটা সাজাও! 🤔
            </motion.div>
          )}
        </AnimatePresence>
        <div className="p3-mascot-emoji">
          {mascotState === 'celebrate' && <img src={imgMascotCelebrate} alt="Celebrate" style={{ height: 120 }} />}
          {mascotState === 'encourage' && <img src={imgMascotEncourage} alt="Encourage" style={{ height: 120 }} />}
          {mascotState === 'think' && <img src={imgMascotThink} alt="Think" style={{ height: 120 }} />}
          {mascotState === 'wave' && <img src={imgMascotWave} alt="Wave" style={{ height: 120 }} />}
        </div>
      </div>

      {/* ── CELEBRATION OVERLAY ── */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            className="p3-celebration-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="p3-celebration-emoji">🎉🏪🎉</div>
            <div className="p3-celebration-text">
              সব কাস্টমার খুশি!
              <br />
              তুমি একজন দারুণ দোকানদার!
            </div>
            <div className="p3-celebration-stars">
              {'⭐'.repeat(customersServed + 1)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
