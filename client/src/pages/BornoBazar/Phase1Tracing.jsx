import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../hooks/useGameState';
import { getLetterData } from '../../data/letters';
import { validateStroke } from '../../utils/strokeValidator';
import { playBanglaTTS } from '../../utils/audio';
import imgMascotThink from '../../assets/mascot-think.png';
import imgMascotCelebrate from '../../assets/mascot-celebrate.png';
import imgMascotEncourage from '../../assets/mascot-encourage.png';
import imgStreetBgBlur from '../../assets/street-bg-blur.png';
import { createSession, updateBornoBazarProgress } from '../../utils/api';

// ─── Fixed canvas dimensions to avoid CSS scaling issues ──────────────────────
const CANVAS_W = 460;
const CANVAS_H = 345; // 4:3 ratio

export default function Phase1Tracing({ onComplete, onBack }) {
  const { state, dispatch } = useGameState();
  const canvasRef = useRef(null);

  const [letterData, setLetterData] = useState(null);
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [drawnStrokes, setDrawnStrokes] = useState([]);

  const isDrawingRef = useRef(false);
  const currentPathRef = useRef([]);

  const [wiggle, setWiggle] = useState(false);
  const [flash, setFlash] = useState(false);
  const [mascotState, setMascotState] = useState('think');

  useEffect(() => {
    if (state.currentLetter) {
      const data = getLetterData(state.currentLetter);
      setLetterData(data);
      // Reset tracing state when letter changes
      setCurrentStrokeIdx(0);
      setDrawnStrokes([]);
      currentPathRef.current = [];
      isDrawingRef.current = false;
    }
  }, [state.currentLetter]);

  // ── Redraw canvas ────────────────────────────────────────────────────────────
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !letterData) return;

    const ctx = canvas.getContext('2d');
    const W = CANVAS_W;
    const H = CANVAS_H;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Draw ghost letter using the actual font — always correct orientation
    ctx.save();
    ctx.font = `bold ${H * 0.7}px 'Hind Siliguri', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(24, 179, 104, 0.15)';
    ctx.fillText(state.currentLetter, W / 2, H / 2 + H * 0.05);
    ctx.restore();

    // 2. Draw already completed strokes (bright, solid)
    ctx.lineWidth = 12;
    ctx.strokeStyle = state.selectedLetterColor || '#18b368';
    drawnStrokes.forEach(path => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.stroke();
    });
  }, [drawnStrokes, letterData, currentStrokeIdx, state.selectedLetterColor, state.currentLetter]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // ── Pointer helpers ──────────────────────────────────────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Scale from CSS size to fixed canvas coordinates
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;

    return [
      (clientX - rect.left) * scaleX,
      (clientY - rect.top) * scaleY,
    ];
  };

  // ── Drawing handlers ─────────────────────────────────────────────────────────
  const startDrawing = (e) => {
    if (!letterData || currentStrokeIdx >= letterData.strokes.length) return;
    isDrawingRef.current = true;
    currentPathRef.current = [getPos(e)];
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const path = currentPathRef.current;
    if (path.length === 0) return;

    const prev = path[path.length - 1];
    path.push(pos);

    // Paint incrementally (no re-render needed)
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 12;
    ctx.strokeStyle = state.selectedLetterColor || '#18b368';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(prev[0], prev[1]);
    ctx.lineTo(pos[0], pos[1]);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const path = currentPathRef.current;

    if (path.length < 4) {
      currentPathRef.current = [];
      redrawCanvas();
      return;
    }

    // Validate
    const refPath = letterData.strokes[currentStrokeIdx];
    const { valid } = validateStroke(path, refPath, CANVAS_W, CANVAS_H);

    if (valid) {
      setDrawnStrokes(prev => [...prev, [...path]]);
      currentPathRef.current = [];

      setFlash(true);
      setTimeout(() => setFlash(false), 400);
      dispatch({ type: 'EARN_STAR', count: 1 });

      if (state.hintActive) {
        dispatch({ type: 'HINT_SHOWN' });
      } else {
        dispatch({ type: 'RESET_FAILURES' });
      }

      const nextIdx = currentStrokeIdx + 1;
      if (nextIdx >= letterData.strokes.length) {
        setMascotState('celebrate');

        const activeUserId = localStorage.getItem('activeUserId');
        if (activeUserId) {
          updateBornoBazarProgress(activeUserId, {
            letter: state.currentLetter,
            phaseCompleted: 1,
            starsEarned: 1
          }).catch(err => console.warn(err));
          
          createSession({
            userId: activeUserId,
            feature: 'borno_bazar',
            activityType: 'tracing',
            score: 100,
            starsEarned: 1,
            accuracy: 100,
            durationMs: 15000
          }).catch(err => console.warn(err));
        }

        setTimeout(() => onComplete(), 1200);
      } else {
        setCurrentStrokeIdx(nextIdx);
        setMascotState('think');
      }
    } else {
      setWiggle(true);
      setMascotState('encourage');
      setTimeout(() => {
        setWiggle(false);
        currentPathRef.current = [];
        redrawCanvas();
      }, 350);
      dispatch({ type: 'RECORD_FAILURE' });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (!letterData) return null;

  const totalStrokes = letterData.strokes.length;

  return (
    <div className="tracing-screen" style={{ backgroundImage: `url(${imgStreetBgBlur})` }}>
      {/* Header */}
      <div className="tracing-header">
        <motion.button
          className="btn-back"
          onClick={onBack}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>

        {/* Stroke progress dots */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#687076', marginRight: 4 }}>
            স্ট্রোক {currentStrokeIdx + 1}/{totalStrokes}
          </span>
          {Array.from({ length: totalStrokes }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 16, height: 16, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                background: i < currentStrokeIdx ? '#18b368'
                          : i === currentStrokeIdx ? '#ffc107'
                          : '#e0e0e0',
                border: i === currentStrokeIdx ? '2px solid white' : 'none',
                boxShadow: i < currentStrokeIdx ? '0 0 6px #18b368' : 'none',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Letter display */}
      <div className="tracing-letter-display">
        <div className="tracing-target-letter">{state.currentLetter}</div>
        <button
          className="btn-audio"
          style={{ width: 44, height: 44 }}
          onClick={() => {
            if (state.audioEnabled && state.currentLetter) {
              playBanglaTTS(state.currentLetter);
            }
          }}
          aria-label={`Play sound for ${state.currentLetter}`}
        >🔊</button>
      </div>

      {/* Canvas area */}
      <div className="tracing-canvas-area">
        <motion.div
          className={`tracing-canvas-wrapper ${wiggle ? 'wiggle' : ''}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="tracing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {flash && <div className="stroke-complete-flash" />}
        </motion.div>
      </div>

      {/* Mascot Feedback */}
      <div className="tracing-mascot">
        <AnimatePresence>
          {mascotState === 'encourage' && (
            <motion.div
              className="mascot-speech"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              আবার চেষ্টা করো! 💪
            </motion.div>
          )}
          {mascotState === 'celebrate' && (
            <motion.div
              className="mascot-speech"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              দারুণ! 🎉
            </motion.div>
          )}
        </AnimatePresence>
        <img
          src={mascotState === 'celebrate' ? imgMascotCelebrate : mascotState === 'encourage' ? imgMascotEncourage : imgMascotThink}
          alt="Mascot"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}
