import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MatchLine from './MatchLine';
import { playAudio as playBanglaAudio } from '../../utils/audio';
import { createSession, updateProgress } from '../../utils/api';

export default function QuizCard({ pairs, onMatch, onWrongMatch, onComplete }) {
  const [words, setWords] = useState([]);
  const [images, setImages] = useState([]);
  
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongAnimation, setWrongAnimation] = useState(null);
  const [lines, setLines] = useState([]);
  
  const containerRef = useRef(null);
  const wordRefs = useRef({});
  const imageRefs = useRef({});

  // Initialization
  useEffect(() => {
    const shuffledWords = [...pairs].sort(() => Math.random() - 0.5);
    const shuffledImages = [...pairs].sort(() => Math.random() - 0.5);
    
    setWords(shuffledWords);
    setImages(shuffledImages);
    setMatchedPairs([]);
    setLines([]);
    setSelectedWord(null);
    setSelectedImage(null);
  }, [pairs]);

  // Update lines based on selections and matches
  const updateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];

    matchedPairs.forEach(pair => {
      const wordEl = wordRefs.current[pair.wordId];
      const imageEl = imageRefs.current[pair.imageId];
      if (wordEl && imageEl) {
        const wRect = wordEl.getBoundingClientRect();
        const iRect = imageEl.getBoundingClientRect();
        newLines.push({
          x1: wRect.right - containerRect.left,
          y1: wRect.top + wRect.height / 2 - containerRect.top,
          x2: iRect.left - containerRect.left,
          y2: iRect.top + iRect.height / 2 - containerRect.top,
          status: 'correct'
        });
      }
    });

    if (wrongAnimation) {
      const wordEl = wordRefs.current[wrongAnimation.wordId];
      const imageEl = imageRefs.current[wrongAnimation.imageId];
      if (wordEl && imageEl) {
        const wRect = wordEl.getBoundingClientRect();
        const iRect = imageEl.getBoundingClientRect();
        newLines.push({
          x1: wRect.right - containerRect.left,
          y1: wRect.top + wRect.height / 2 - containerRect.top,
          x2: iRect.left - containerRect.left,
          y2: iRect.top + iRect.height / 2 - containerRect.top,
          status: 'wrong'
        });
      }
    }

    setLines(newLines);
  };

  useEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [matchedPairs, wrongAnimation, words, images]);

  // Evaluation logic
  useEffect(() => {
    if (selectedWord && selectedImage) {
      const isMatch = selectedWord.id === selectedImage.id;
      const activeUserId = localStorage.getItem('activeUserId');

      const saveQuizActivity = async (correct) => {
        if (!activeUserId) return;
        try {
          await createSession({
            userId: activeUserId,
            feature: 'quiz',
            activityType: 'multiple_choice',
            score: correct ? 100 : 0,
            starsEarned: correct ? 1 : 0,
            accuracy: correct ? 100 : 0,
            durationMs: 5000 // estimated
          });
          
          await updateProgress(activeUserId, {
            starsEarned: correct ? 1 : 0,
            skill: 'quiz'
          });
        } catch (err) {
          console.warn("Failed to save quiz activity", err);
        }
      };
      
      if (isMatch) {
        setMatchedPairs(prev => [...prev, { wordId: selectedWord.id, imageId: selectedImage.id }]);
        onMatch(selectedWord);
        saveQuizActivity(true);
        
        if (matchedPairs.length + 1 === pairs.length) {
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      } else {
        setWrongAnimation({ wordId: selectedWord.id, imageId: selectedImage.id });
        onWrongMatch(selectedWord, selectedImage);
        saveQuizActivity(false);
        
        setTimeout(() => {
          setWrongAnimation(null);
        }, 800);
      }
      
      setSelectedWord(null);
      setSelectedImage(null);
    }
  }, [selectedWord, selectedImage]);

  const speak = (text) => {
    playBanglaAudio(text, { playbackRate: 0.8 });
  };

  // Dynamically calculate card height to fill the viewport nicely
  const pairCount = words.length || 4;
  const cardHeight = Math.max(140, Math.floor((window.innerHeight * 0.80 - 80) / pairCount));

  return (
    <div ref={containerRef} style={{ 
      position: 'relative', 
      display: 'flex', 
      gap: 200, 
      justifyContent: 'center', 
      alignItems: 'stretch', 
      width: '100%',
    }}>
      <MatchLine lines={lines} containerRef={containerRef} />
      
      {/* ─── Words Column ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, zIndex: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#18b368', textAlign: 'center', marginBottom: 4, letterSpacing: '1px' }}>
          📝 শব্দ নির্বাচন করো
        </div>
        {words.map(w => {
          const isMatched = matchedPairs.some(p => p.wordId === w.id);
          const isSelected = selectedWord?.id === w.id;
          const isWrong = wrongAnimation?.wordId === w.id;

          return (
            <motion.div
              key={`word-${w.id}`}
              ref={el => wordRefs.current[w.id] = el}
              animate={isWrong ? { x: [-14, 14, -14, 14, 0] } : {}}
              transition={{ duration: 0.4 }}
              whileHover={!isMatched ? { scale: 1.04, boxShadow: '0 10px 36px rgba(0,0,0,0.14)' } : {}}
              whileTap={!isMatched ? { scale: 0.96 } : {}}
              style={{
                width: '100%',
                maxWidth: 280,
                height: 200,
                background: isMatched 
                  ? 'linear-gradient(135deg, #d4f3e3, #b8e6cf)' 
                  : isSelected 
                    ? 'linear-gradient(135deg, #fff8e1, #ffe0b2)' 
                    : 'white',
                border: `6px solid ${isMatched ? '#18b368' : isSelected ? '#f5a623' : isWrong ? '#ff6b6b' : '#d0d0d0'}`,
                borderRadius: 16,
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: isMatched ? 'default' : 'pointer',
                opacity: isMatched ? 0.5 : 1,
                boxShadow: isSelected ? '0 10px 36px rgba(245,166,35,0.35)' : '0 5px 20px rgba(0,0,0,0.07)',
                transition: 'border-color 0.2s, background 0.2s',
                boxSizing: 'border-box',
              }}
              onClick={() => {
                if (!isMatched && !wrongAnimation) {
                  setSelectedWord(isSelected ? null : w);
                }
              }}
            >
              <div style={{ 
                fontSize: 44, 
                fontWeight: 800, 
                color: '#1d2b2a', 
                fontFamily: "'Hind Siliguri', sans-serif", 
                letterSpacing: '3px',
                lineHeight: 1.2,
              }}>
                {w.bangla}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {isMatched && <span style={{ fontSize: 40, color: '#18b368' }}>✓</span>}
                <button 
                  onClick={(e) => { e.stopPropagation(); speak(w.bangla); }}
                  style={{ 
                    background: isSelected ? '#f5a623' : '#f0f0f0', 
                    border: 'none', borderRadius: '50%', 
                    width: 58, height: 58, cursor: 'pointer', fontSize: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                    color: isSelected ? 'white' : '#333',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.12)'
                  }}
                >
                  🔊
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Images Column ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, zIndex: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#f5a623', textAlign: 'center', marginBottom: 4, letterSpacing: '1px' }}>
          🖼️ ছবি মেলাও
        </div>
        {images.map(img => {
          const isMatched = matchedPairs.some(p => p.imageId === img.id);
          const isSelected = selectedImage?.id === img.id;
          const isWrong = wrongAnimation?.imageId === img.id;

          return (
            <motion.div
              key={`img-${img.id}`}
              ref={el => imageRefs.current[img.id] = el}
              animate={isWrong ? { x: [-14, 14, -14, 14, 0] } : {}}
              transition={{ duration: 0.4 }}
              whileHover={!isMatched ? { scale: 1.7, zIndex: 100, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' } : {}}
              whileTap={!isMatched ? { scale: 0.96 } : {}}
              style={{
                width: '100%',
                maxWidth: 280,
                height: 200,
                background: isMatched ? '#f0faf4' : '#ffffff',
                border: `6px solid ${isMatched ? '#18b368' : isSelected ? '#f5a623' : isWrong ? '#ff6b6b' : '#d0d0d0'}`,
                borderRadius: 16,
                cursor: isMatched ? 'default' : 'pointer',
                opacity: isMatched ? 0.6 : 1,
                overflow: 'hidden',
                position: 'relative',
                zIndex: isSelected ? 30 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected ? '0 10px 36px rgba(245,166,35,0.35)' : '0 5px 20px rgba(0,0,0,0.07)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                padding: 10,
                boxSizing: 'border-box',
              }}
              onClick={() => {
                if (!isMatched && !wrongAnimation) {
                  setSelectedImage(isSelected ? null : img);
                }
              }}
            >
              <img 
                src={`/quiz-images/${img.english}.jpg`} 
                alt={img.english} 
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  borderRadius: 12,
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.style.fontSize = '56px';
                  fallback.innerText = '🖼️';
                  e.target.parentElement.appendChild(fallback);
                }}
              />
              {isMatched && (
                <div style={{ 
                  position: 'absolute', inset: 0, 
                  background: 'rgba(24,179,104,0.18)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 52 
                }}>
                  ✅
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
