import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../hooks/useGameState';
import { getLetterData } from '../../data/letters';
import { validateStroke } from '../../utils/strokeValidator';
import { playAudio } from '../../utils/audio';
import mascotThink from '../../assets/mascot-wave.png'; // fallback
import mascotCelebrate from '../../assets/mascot-wave.png'; // fallback
import streetBgBlur from '../../assets/street-empty.png'; // fallback

// ─── Fixed canvas dimensions to avoid CSS scaling issues ──────────────────────
const CANVAS_W = 460;
const CANVAS_H = 345; // 4:3 ratio

export default function Phase1Tracing({ onComplete, onBack }) {
  const { state, dispatch } = useGameState();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [letterData, setLetterData] = useState(null);
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [drawnStrokes, setDrawnStrokes] = useState([]); // Array of completed paths
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  
  const [wiggle, setWiggle] = useState(false);
  const [flash, setFlash] = useState(false);
  
  const [mascotState, setMascotState] = useState('think'); // think, celebrate, encourage
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });

  useEffect(() => {
    if (state.currentLetter) {
      setLetterData(getLetterData(state.currentLetter));
    }
  }, [state.currentLetter]);

  // Handle canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !letterData) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw completed strokes
    ctx.lineWidth = 14;
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

    // NEW: Draw saved unfinished parts of the current stroke
    ctx.lineWidth = 14;
    ctx.strokeStyle = state.selectedLetterColor || '#18b368';

    currentStrokeParts.forEach(path => {
      if (path.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);

      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }

      ctx.stroke();
    });
    
    // Draw current path being drawn
    if (currentPath.length >= 2) {
      ctx.lineWidth = 14;
      ctx.strokeStyle = state.selectedLetterColor || '#18b368';
      ctx.beginPath();
      ctx.moveTo(currentPath[0][0], currentPath[0][1]);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i][0], currentPath[i][1]);
      }
      ctx.stroke();
    }
    
    // Draw hint if active
    if (state.hintActive && letterData.strokes[currentStrokeIdx]) {
      const refPath = letterData.strokes[currentStrokeIdx];
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(255, 193, 7, 0.6)'; // Golden hint
      ctx.setLineDash([10, 15]);
      ctx.beginPath();
      
      const startX = refPath[0][0] * canvasSize.width;
      const startY = refPath[0][1] * canvasSize.height;
      ctx.moveTo(startX, startY);
      
      for (let i = 1; i < refPath.length; i++) {
        ctx.lineTo(refPath[i][0] * canvasSize.width, refPath[i][1] * canvasSize.height);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw starting dot
      ctx.fillStyle = '#ffc107';
      ctx.beginPath();
      ctx.arc(startX, startY, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
  }, [drawnStrokes, currentPath, canvasSize, letterData, currentStrokeIdx, state.hintActive, state.selectedLetterColor]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [clientX - rect.left, clientY - rect.top];
  };

  // NEW: More forgiving validation for iPad/finger drawing.
  // It checks if the child covered enough of the reference path,
  // even if the drawing was completed in several touches.
  const isStrokeCloseEnough = (drawnPath, refPath, width, height) => {
    if (!drawnPath || drawnPath.length < 8 || !refPath || refPath.length < 2) {
      return false;
    }

    const refPoints = refPath.map(([x, y]) => [x * width, y * height]);

    const distance = (p1, p2) => {
      const dx = p1[0] - p2[0];
      const dy = p1[1] - p2[1];
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Finger drawing needs generous tolerance.
    // Increase 0.09 to 0.11 if it still feels too strict.
    const tolerance = Math.max(width, height) * 0.09;

    let covered = 0;

    refPoints.forEach(refPoint => {
      const hasNearbyDrawPoint = drawnPath.some(drawPoint => {
        return distance(drawPoint, refPoint) <= tolerance;
      });

      if (hasNearbyDrawPoint) covered++;
    });

    const coverage = covered / refPoints.length;

    // 55% coverage is child-friendly.
    // Increase to 0.65 if it becomes too easy.
    return coverage >= 0.55;
  };

  // ── Drawing handlers ─────────────────────────────────────────────────────────
  const startDrawing = (e) => {
    if (currentStrokeIdx >= (letterData?.strokes.length || 0)) return;
    
    setIsDrawing(true);
    setCurrentPath([getPos(e)]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // prevent scrolling
    setCurrentPath(prev => [...prev, getPos(e)]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentPath.length < 5) {
      // Too short to be a real stroke
      setCurrentPath([]);
      return;
    }
    
    // Validate
    const refPath = letterData.strokes[currentStrokeIdx];
    const { valid } = validateStroke(currentPath, refPath, canvasSize.width, canvasSize.height);
    
    if (valid) {
      // Success!
      setDrawnStrokes(prev => [...prev, currentPath]);
      setCurrentPath([]);
      
      // Visual feedback
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
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setCurrentStrokeIdx(nextIdx);
        setMascotState('think');
      }
    } else {
      // Fail
      setWiggle(true);
      setMascotState('encourage');
      setTimeout(() => {
        setWiggle(false);
        setCurrentPath([]); // Clear the wrong path
      }, 300);
      
      dispatch({ type: 'RECORD_FAILURE' });
    }
  };

  // Optional: clear only the current unfinished stroke, not completed strokes
  const clearCurrentStroke = useCallback(() => {
    setCurrentPath([]);
    setCurrentStrokeParts([]);
    currentPathRef.current = [];
    currentStrokePartsRef.current = [];
    setWiggle(false);
    dispatch({ type: 'RESET_FAILURES' });
  }, [dispatch]);

  // ── Render ───────────────────────────────────────────────────────────────────
  if (!letterData) return null;

  const totalStrokes = letterData.strokes.length;

  return (
    <div
      className="tracing-screen"
      style={{ backgroundImage: `url(${streetBgBlur})` }}
    >
      {/* Header */}
      <div className="tracing-header">
        <motion.button
          className="btn-back"
          onClick={onBack}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>
        
        <div style={{ display: 'flex', gap: 10 }}>
          {Array.from({ length: letterData.strokes.length }).map((_, i) => (
            <div 
              key={i}
              style={{
                width: 16, height: 16, borderRadius: '50%',
                background: i < currentStrokeIdx ? '#18b368' : i === currentStrokeIdx ? '#ffc107' : '#e0e0e0',
                border: i === currentStrokeIdx ? '2px solid white' : 'none',
                boxShadow: i < currentStrokeIdx ? '0 0 8px #18b368' : 'none'
              }}
            />
          ))}
        </div>

        <motion.button
          className="btn-back"
          onClick={clearCurrentStroke}
          whileTap={{ scale: 0.95 }}
          title="Clear current stroke"
        >
          ↺
        </motion.button>
      </div>

      {/* Letter display */}
      <div className="tracing-letter-display">
        <div className="tracing-target-letter">{state.currentLetter}</div>
        <button className="btn-audio" style={{ width: 44, height: 44 }}>🔊</button>
      </div>

      {/* Canvas area */}
      <div className="tracing-canvas-area">
        <motion.div
          className={`tracing-canvas-wrapper ${wiggle ? 'wiggle' : ''}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <div className="tracing-ghost-letter">{state.currentLetter}</div>
          
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
          {state.hintActive && (
            <motion.div 
              className="mascot-speech"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              আবার চেষ্টা করো! 💪
            </motion.div>
          )}
          {wiggle && !state.hintActive && (
            <motion.div 
              className="mascot-speech"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              আবার চেষ্টা করো!
            </motion.div>
          )}
        </AnimatePresence>
        <img 
          src={mascotState === 'celebrate' ? mascotCelebrate : mascotThink} 
          alt="Mascot"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}