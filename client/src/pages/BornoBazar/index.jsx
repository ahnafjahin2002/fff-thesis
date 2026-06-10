// ─── বর্ণের দোকান — Phase 1: দোকান বানাও (Build the Shop) ───────────────────
// Main entry page that orchestrates the complete Phase 1 flow:
//   Street View → Letter Selection → Tracing → Shop Color → Shop Built
//
// This file contains the page-level routing and the GameProvider wrapper.

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameProvider, useGameState } from '../../hooks/useGameState';
import StreetView from './StreetView';
import LetterSelection from './LetterSelection';
import Phase1Tracing from './Phase1Tracing';
import ShopColorPicker from './ShopColorPicker';
import ShopBuiltCelebration from './ShopBuiltCelebration';
import SessionRestPrompt from './SessionRestPrompt';
import './BornoBazar.css';
import Phase2Spelling from './Phase2Spelling';
import Phase3Conversation from './Phase3Conversation';

// ─── Screen Flow States ───────────────────────────────────────────────────────
const SCREENS = {
  STREET: 'street',
  LETTER_SELECT: 'letter_select',
  TRACING: 'tracing',
  COLOR_PICK: 'color_pick',
  CELEBRATION: 'celebration',
  PHASE2: 'phase2',
  PHASE3: 'phase3',
};

function BornoBazarInner({ onBack }) {
  const [screen, setScreen] = useState(SCREENS.STREET);
  const [showRest, setShowRest] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const { state, dispatch, isSessionExpired } = useGameState();

  // Check session time periodically
  const checkSession = useCallback(() => {
    if (isSessionExpired() && !state.sessionRestShown) {
      setShowRest(true);
      dispatch({ type: 'SESSION_REST_SHOWN' });
    }
  }, [isSessionExpired, state.sessionRestShown, dispatch]);

  // ── Navigation handlers ──
  const handleStartBuild = useCallback(() => {
    checkSession();
    dispatch({ type: 'SET_PHASE', phase: 1 });
    setScreen(SCREENS.LETTER_SELECT);
  }, [dispatch, checkSession]);

  const handleLetterSelected = useCallback((letter) => {
    dispatch({ type: 'SELECT_LETTER', letter });
    setScreen(SCREENS.TRACING);
  }, [dispatch]);

  const handleTracingComplete = useCallback(() => {
    dispatch({ type: 'TRACING_COMPLETE' });
    setScreen(SCREENS.COLOR_PICK);
  }, [dispatch]);

  const handleColorPicked = useCallback((shopColor) => {
    dispatch({ type: 'ADD_SHOP', shopColor });
    dispatch({ type: 'EARN_STAR', count: 1 });
    setScreen(SCREENS.CELEBRATION);
  }, [dispatch]);

  const handleCelebrationDone = useCallback(() => {
    dispatch({ type: 'RETURN_TO_STREET' });
    setScreen(SCREENS.STREET);
  }, [dispatch]);

  const handleBackToStreet = useCallback(() => {
    dispatch({ type: 'RETURN_TO_STREET' });
    setScreen(SCREENS.STREET);
  }, [dispatch]);

  const handleTapShop = useCallback((shopId) => {
    const shop = state.streetShops?.find(s => s.id === shopId);
    setSelectedShop(shop || { id: shopId, color: '#18b368' });
    checkSession();

    // If shop has products stocked, go to Phase 3; otherwise Phase 2
    if (shop?.products && shop.products.length >= 3) {
      dispatch({ type: 'SET_PHASE', phase: 3 });
      setScreen(SCREENS.PHASE3);
    } else {
      dispatch({ type: 'SET_PHASE', phase: 2 });
      setScreen(SCREENS.PHASE2);
    }
  }, [state.streetShops, checkSession, dispatch]);

  const handlePhase2Complete = useCallback((products) => {
    dispatch({ type: 'STOCK_SHOP', shopId: selectedShop?.id, products });
    dispatch({ type: 'EARN_STAR', count: products.length });
    setScreen(SCREENS.STREET);
  }, [dispatch, selectedShop]);

  const handlePhase3Complete = useCallback((servedCount) => {
    dispatch({ type: 'SERVE_CUSTOMERS', shopId: selectedShop?.id, count: servedCount });
    dispatch({ type: 'EARN_STAR', count: servedCount * 2 });
    setScreen(SCREENS.STREET);
  }, [dispatch, selectedShop]);

  return (
    <div className="borno-bazar-root">
      <AnimatePresence mode="wait">
        {screen === SCREENS.STREET && (
          <motion.div
            key="street"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="borno-screen"
          >
            <StreetView
              onBuild={handleStartBuild}
              onTapShop={handleTapShop}
              onBack={onBack}
            />
          </motion.div>
        )}

        {screen === SCREENS.LETTER_SELECT && (
          <motion.div
            key="letter-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="borno-screen"
          >
            <LetterSelection
              onSelect={handleLetterSelected}
              onBack={handleBackToStreet}
            />
          </motion.div>
        )}

        {screen === SCREENS.TRACING && (
          <motion.div
            key="tracing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="borno-screen"
          >
            <Phase1Tracing
              onComplete={handleTracingComplete}
              onBack={handleBackToStreet}
            />
          </motion.div>
        )}

        {screen === SCREENS.COLOR_PICK && (
          <motion.div
            key="color-pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="borno-screen"
          >
            <ShopColorPicker
              onPick={handleColorPicked}
            />
          </motion.div>
        )}

        {screen === SCREENS.CELEBRATION && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="borno-screen"
          >
            <ShopBuiltCelebration
              onDone={handleCelebrationDone}
            />
          </motion.div>
        )}
        {screen === SCREENS.PHASE2 && (
          <motion.div
           key="phase2"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.25 }}
           className="borno-screen"
          >
            <Phase2Spelling
              shopColor={selectedShop?.color || '#18b368'}
              onComplete={handlePhase2Complete}
              onBack={handleBackToStreet}
            />
          </motion.div>
        )}
        {screen === SCREENS.PHASE3 && (
          <motion.div
           key="phase3"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.25 }}
           className="borno-screen"
          >
            <Phase3Conversation
              shopColor={selectedShop?.color || '#18b368'}
              onComplete={handlePhase3Complete}
              onBack={handleBackToStreet}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Rest Prompt Overlay */}
      <AnimatePresence>
        {showRest && (
          <SessionRestPrompt
            onContinue={() => setShowRest(false)}
            onRest={onBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Wrapped with GameProvider ─────────────────────────────────────────────────
export default function BornoBazar({ onBack }) {
  return (
    <GameProvider>
      <BornoBazarInner onBack={onBack} />
    </GameProvider>
  );
}
