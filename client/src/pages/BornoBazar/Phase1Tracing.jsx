import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../hooks/useGameState';
import { getLetterData } from '../../data/letters';
import { validateStroke } from '../../utils/strokeValidator';
import { playAudio } from '../../utils/audio';
import mascotThink from '../../assets/mascot-wave.png'; // fallback
import mascotCelebrate from '../../assets/mascot-wave.png'; // fallback
import streetBgBlur from '../../assets/street-empty.png'; // fallback

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
      if (canvasRef.current) {
        const { clientWidth, clientHeight } = canvasRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setCanvasSize({ width: clientWidth, height: clientHeight });
        }
      }
    };
    
    // Initial size after mount
    setTimeout(updateSize, 0);
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
    const canvas = canvasRef.current;
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
    
    // Map screen coordinates strictly to canvas internal dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return [
      (clientX - rect.left) * scaleX,
      (clientY - rect.top) * scaleY
    ];
  };

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
      
      // Advance stroke
      if (state.hintActive) {
        dispatch({ type: 'HINT_SHOWN' });
      } else {
        dispatch({ type: 'RESET_FAILURES' });
      }
      
      const nextIdx = currentStrokeIdx + 1;
      if (nextIdx >= letterData.strokes.length) {
        // Complete!
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

  if (!letterData) return null;

  return (
    <div className="tracing-screen" style={{ backgroundImage: `url(${streetBgBlur})` }}>
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
      </div>

      <div className="tracing-letter-display">
        <div className="tracing-target-letter">{state.currentLetter}</div>
        <button 
          className="btn-audio" 
          style={{ width: 44, height: 44 }}
          onClick={() => {
            if (state.audioEnabled && state.currentLetter) {
              playAudio(state.currentLetter);
            }
          }}
          aria-label={`Play sound for ${state.currentLetter}`}
        >🔊</button>
      </div>

      <div className="tracing-canvas-area">
        <motion.div 
          className={`tracing-canvas-wrapper ${wiggle ? 'wiggle' : ''}`}
          ref={containerRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <div className="tracing-ghost-letter">{state.currentLetter}</div>
          
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
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
              আমি সাহায্য করছি!
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
