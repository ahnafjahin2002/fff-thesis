// ─── Game State Management (React Context) ───────────────────────────────────
// Central state for বর্ণের দোকান. Manages street shops, stars, sessions,
// and persists to localStorage (later: backend).

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'borno_bazar_state';
const SESSION_CAP_MINUTES = 20;

const initialState = {
  // Player info
  playerName: 'রাইহান',
  playerStars: 0,

  // Street & shops
  streetShops: [],       // Array of { id, letter, color, products[], customersServed, dateBuilt }

  // Current session
  currentPhase: null,    // 1, 2, or 3
  currentLetter: null,
  currentShopId: null,
  sessionStartTime: null,
  
  // Phase 1 specific
  selectedLetterColor: '#18b368',
  tracingComplete: false,
  vowelMarkerComplete: false,
  
  // Hint system
  failureCount: 0,
  hintActive: false,
  hintUsedForCurrentQuestion: false,

  // Progress tracking
  lettersLearned: [],
  totalStarsEarned: 0,

  // Settings
  audioEnabled: true,
  textSpacing: 3,
  sessionRestShown: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...initialState, ...action.payload, sessionStartTime: Date.now() };

    case 'SET_PHASE':
      return { ...state, currentPhase: action.phase, failureCount: 0, hintActive: false, hintUsedForCurrentQuestion: false };

    case 'SELECT_LETTER':
      return { ...state, currentLetter: action.letter, tracingComplete: false, vowelMarkerComplete: false, failureCount: 0, hintActive: false, hintUsedForCurrentQuestion: false };

    case 'SET_LETTER_COLOR':
      return { ...state, selectedLetterColor: action.color };

    case 'TRACING_COMPLETE':
      return { ...state, tracingComplete: true };

    case 'VOWEL_MARKER_COMPLETE':
      return { ...state, vowelMarkerComplete: true };

    case 'ADD_SHOP': {
      const newShop = {
        id: `shop_${Date.now()}`,
        letter: state.currentLetter,
        color: action.shopColor,
        products: [],
        customersServed: 0,
        dateBuilt: new Date().toISOString(),
      };
      const newLettersLearned = state.lettersLearned.includes(state.currentLetter)
        ? state.lettersLearned
        : [...state.lettersLearned, state.currentLetter];
      return {
        ...state,
        streetShops: [...state.streetShops, newShop],
        lettersLearned: newLettersLearned,
        currentShopId: newShop.id,
        playerStars: state.playerStars + 1,
        totalStarsEarned: state.totalStarsEarned + 1,
      };
    }

    case 'EARN_STAR':
      return { ...state, playerStars: state.playerStars + (action.count || 1), totalStarsEarned: state.totalStarsEarned + (action.count || 1) };

    case 'RECORD_FAILURE':
      const newFailureCount = state.failureCount + 1;
      return {
        ...state,
        failureCount: newFailureCount,
        hintActive: newFailureCount >= 2 && !state.hintUsedForCurrentQuestion,
      };

    case 'HINT_SHOWN':
      return { ...state, hintActive: false, hintUsedForCurrentQuestion: true, failureCount: 0 };

    case 'RESET_FAILURES':
      return { ...state, failureCount: 0, hintActive: false, hintUsedForCurrentQuestion: false };

    case 'RETURN_TO_STREET':
      return { ...state, currentPhase: null, currentLetter: null, currentShopId: null, tracingComplete: false, vowelMarkerComplete: false, failureCount: 0, hintActive: false };

    case 'TOGGLE_AUDIO':
      return { ...state, audioEnabled: !state.audioEnabled };

    case 'SET_TEXT_SPACING':
      return { ...state, textSpacing: action.spacing };

    case 'SESSION_REST_SHOWN':
      return { ...state, sessionRestShown: true };

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } else {
        dispatch({ type: 'LOAD_STATE', payload: {} });
      }
    } catch {
      dispatch({ type: 'LOAD_STATE', payload: {} });
    }
  }, []);

  // Auto-save every 30 seconds and on state change
  useEffect(() => {
    const saveState = () => {
      const toSave = {
        playerName: state.playerName,
        playerStars: state.playerStars,
        streetShops: state.streetShops,
        lettersLearned: state.lettersLearned,
        totalStarsEarned: state.totalStarsEarned,
        audioEnabled: state.audioEnabled,
        textSpacing: state.textSpacing,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    };

    saveState();

    // Save on page close
    window.addEventListener('beforeunload', saveState);
    return () => window.removeEventListener('beforeunload', saveState);
  }, [state.playerStars, state.streetShops, state.lettersLearned, state.totalStarsEarned]);

  // Session timer check (20 minute cap)
  const isSessionExpired = useCallback(() => {
    if (!state.sessionStartTime) return false;
    const elapsed = (Date.now() - state.sessionStartTime) / 1000 / 60;
    return elapsed >= SESSION_CAP_MINUTES;
  }, [state.sessionStartTime]);

  const value = {
    state,
    dispatch,
    isSessionExpired,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState must be used within a GameProvider');
  return ctx;
}

export default GameContext;
