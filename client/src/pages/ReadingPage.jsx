import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TextRenderer from '../components/reader/TextRenderer';
import PreferencesPanel from '../components/reader/PreferencesPanel';
import usePreferences from '../hooks/usePreferences';
import { decomposeWord } from '../utils/banglaUtils';
import { DIFFICULTY_LEVELS, READING_CONTENT, getLevelInfo } from '../utils/readingContent';
import heroKid from '../assets/hero-kid.png';

// ── Live Word Info Panel ──
function LiveWordInfoPanel({ word, wordData, onClose }) {
  const decomp = decomposeWord(word);
  const colors = [
    { bg: '#FFF3CD', border: '#FDE68A' }, // Yellow
    { bg: '#FDE2E4', border: '#FAD1D4' }, // Pink/Orange
    { bg: '#EAE6F8', border: '#D1C4E9' }, // Purple
    { bg: '#D1F2EB', border: '#A3E4D7' }, // Blue
  ];

  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '24px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.04)', height: '100%', position: 'relative',
      border: '1px solid #F0E8D8'
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#4A5568" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '15px', fontWeight: 700, color: '#4A5568' }}>শব্দ বিশ্লেষণ</span>
      </div>

      {/* Big word display */}
      <div style={{
        fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '48px', fontWeight: 800, color: '#2D3748',
        textAlign: 'center', marginBottom: '16px', letterSpacing: '0.5px'
      }}>{word}</div>

      {/* Syllable decomposition */}
      {decomp.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {decomp.map((d, i) => {
            const style = colors[i % colors.length];
            return (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {i > 0 && <span style={{ fontSize: '18px', color: '#4A5568', fontWeight: 600 }}>+</span>}
                <div style={{
                  background: style.bg,
                  border: `1.5px solid ${style.border}`,
                  borderRadius: '12px', padding: '10px 18px', textAlign: 'center'
                }}>
                  <span style={{ fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '28px', fontWeight: 700, color: '#2D3748' }}>
                    {d.display}
                  </span>
                </div>
              </span>
            );
          })}
        </div>
      )}

      {/* Vowel signs list */}
      {decomp.some(d => d.vowelSign && d.type !== 'conjunct') && (
        <div style={{ width: '100%', marginBottom: '12px' }}>
          <div style={{
            background: '#E8F5E9', padding: '8px', borderRadius: '12px',
            fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '14px', color: '#1B5E20',
            fontWeight: 600, textAlign: 'center'
          }}>
            কার: {decomp.filter(d => d.vowelSign && d.type !== 'conjunct').map(d => `${d.vowelSign} (${d.vowelSignName})`).join(', ')}
          </div>
        </div>
      )}

      {/* Word badge */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          background: '#E8F5E9', padding: '6px 20px', borderRadius: '20px',
          fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '14px', color: '#1B5E20',
          fontWeight: 600, display: 'inline-block'
        }}>
          শব্দ: {word}
        </span>
      </div>
    </div>
  );
}

// ── Mini Word Decomposition (for custom text analysis) ──
function WordDecompositionMini({ word }) {
  const decomp = decomposeWord(word);
  const hasConjunct = decomp.some(d => d.type === 'conjunct');
  if (!word || word.length === 0) return null;

  return (
    <div style={{
      background: hasConjunct ? '#FFF0E0' : '#F8F4EE',
      border: `1px solid ${hasConjunct ? '#E06B2E' : '#E2D5C3'}`,
      borderRadius: '10px', padding: '8px 12px', textAlign: 'center',
      minWidth: '60px',
    }}>
      <div style={{
        fontFamily: '"Noto Sans Bengali", sans-serif',
        fontSize: '18px', fontWeight: 700, color: '#2D1B00', marginBottom: '4px',
      }}>{word}</div>
      {decomp.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', flexWrap: 'wrap' }}>
          {decomp.map((d, i) => (
            <span key={i} style={{
              fontFamily: '"Noto Sans Bengali", sans-serif',
              fontSize: '12px', color: d.type === 'conjunct' ? '#E06B2E' : '#666',
            }}>
              {i > 0 && '+'}{d.display}
            </span>
          ))}
        </div>
      )}
      {decomp.filter(d => d.formula).map((d, i) => (
        <div key={i} style={{
          fontFamily: '"Noto Sans Bengali", sans-serif',
          fontSize: '10px', color: '#E06B2E', marginTop: '2px',
        }}>({d.formula})</div>
      ))}
    </div>
  );
}

const FloatingStar = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" style={{ position: 'absolute', bottom: '60px', right: '40px', zIndex: 0, opacity: 0.9 }}>
    <polygon points="50,10 61,39 92,39 67,58 76,88 50,70 24,88 33,58 8,39 39,39" fill="#FFD700" />
    <circle cx="35" cy="45" r="5" fill="#333" />
    <circle cx="65" cy="45" r="5" fill="#333" />
    <path d="M40 65 Q50 75 60 65" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" />
    <circle cx="28" cy="58" r="6" fill="#FF9999" opacity="0.7" />
    <circle cx="72" cy="58" r="6" fill="#FF9999" opacity="0.7" />
  </svg>
);

const GrassBackground = () => (
  <svg width="100%" height="120" viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.9 }}>
    <path d="M0,100 L0,40 Q50,30 100,50 T200,40 T300,60 T400,30 T500,50 T600,30 T700,60 T800,40 T900,50 T1000,40 L1000,100 Z" fill="#E8F5E9"/>
    <path d="M0,100 L0,60 Q50,50 100,70 T200,60 T300,80 T400,50 T500,70 T600,50 T700,80 T800,60 T900,70 T1000,60 L1000,100 Z" fill="#C8E6C9"/>
  </svg>
);

// ── Main Page Component ──
export default function ReadingPage() {
  const { isPanelOpen, togglePanel } = usePreferences();
  const navigate = useNavigate();
  const [tappedWord, setTappedWord] = useState(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [currentLevel, setCurrentLevel] = useState('sohoj');
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [customText, setCustomText] = useState('');
  const [showCustomResult, setShowCustomResult] = useState(false);

  const levelContent = READING_CONTENT[currentLevel] || [];
  const currentItem = levelContent[currentItemIdx] || { text: '', title: '' };
  const isSingleWord = currentLevel === 'shuru';

  const handleWordTap = useCallback((word, wordData, wordIdx) => {
    setTappedWord({ word, wordData, wordIdx });
    setActiveIdx(wordIdx);
  }, []);

  const handlePrev = () => { if (currentItemIdx > 0) { setCurrentItemIdx(currentItemIdx - 1); setTappedWord(null); setActiveIdx(-1); } };
  const handleNext = () => { if (currentItemIdx < levelContent.length - 1) { setCurrentItemIdx(currentItemIdx + 1); setTappedWord(null); setActiveIdx(-1); } };
  const handleLevelChange = (levelId) => { setCurrentLevel(levelId); setCurrentItemIdx(0); setTappedWord(null); setActiveIdx(-1); };
  const handleAnalyze = () => { if (customText.trim()) setShowCustomResult(true); };

  const levelStyles = {
    shuru: { bg: '#F0FAEE', border: '#D5EDD0', activeColor: '#2E7D32' },
    sohoj: { bg: '#FFF3E0', border: '#FFB74D', activeColor: '#E65100' },
    majhari: { bg: '#E3F2FD', border: '#BBDEFB', activeColor: '#1565C0' },
    unnoto: { bg: '#F3E5F5', border: '#E1BEE7', activeColor: '#6A1B9A' }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0', fontFamily: '"Noto Sans Bengali", sans-serif', position: 'relative', overflowX: 'hidden' }}>
      
      {/* ── Top Toolbar ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#FFF9F0', borderBottom: '1.5px solid #F0E8D8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ width: '48px', height: '48px', borderRadius: '16px', border: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '32px' }}>📖</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#2D3748' }}>চলো পড়ি</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '10px 20px', borderRadius: '24px', border: '1px solid #F0E8D8', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', color: '#2D3748' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#4CAF50"/>
              <path d="M15.54 8.46A5 5 0 0 1 15.54 15.54M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            শোনো
          </button>
          <button style={{ padding: '10px 20px', borderRadius: '24px', border: '1px solid #F0E8D8', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', color: '#6A1B9A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="#6A1B9A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            শব্দ ধরে ধরে
          </button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={togglePanel} style={{ padding: '10px 20px', borderRadius: '24px', border: 'none', background: '#FBE9E7', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', color: '#5D4037' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="#5D4037"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.8 1 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" fill="#5D4037"/>
            </svg>
            সেটিংস
          </motion.button>
        </div>
      </header>

      {/* ── Level Tabs ── */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '24px 0' }}>
        {DIFFICULTY_LEVELS.map(level => {
          const isActive = currentLevel === level.id;
          const style = levelStyles[level.id] || levelStyles.shuru;
          return (
            <button
              key={level.id}
              onClick={() => handleLevelChange(level.id)}
              style={{
                padding: '8px 24px', borderRadius: '30px', whiteSpace: 'nowrap',
                border: isActive ? `1.5px solid ${style.activeColor}` : `1px solid ${style.border}`,
                background: style.bg,
                fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '15px',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? style.activeColor : '#2D3748',
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span style={{ color: '#FFD700', fontSize: '14px' }}>{'⭐'.repeat(level.stars)}</span> {level.label}
            </button>
          );
        })}
      </div>

      {/* ── Main Reading Area ── */}
      <div style={{ display: 'flex', gap: '24px', maxWidth: '1000px', margin: '0 auto', marginBottom: '24px', padding: '0 20px', zIndex: 10, position: 'relative' }}>
        {/* Left Column: Text Renderer */}
        <div style={{ flex: '2.5', background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'relative', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F0E8D8' }}>
          <button style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#4CAF50"/>
              <path d="M15.54 8.46A5 5 0 0 1 15.54 15.54M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div style={{ width: '100%' }}>
            <TextRenderer
              content={currentItem.text}
              activeWordIdx={activeIdx}
              onWordTap={handleWordTap}
              isSingleWord={isSingleWord}
            />
          </div>
        </div>

        {/* Right Column: Analysis */}
        <div style={{ flex: '1.5', minWidth: '320px' }}>
          <AnimatePresence mode="wait">
            {tappedWord ? (
              <motion.div
                key={tappedWord.word}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%' }}
              >
                <LiveWordInfoPanel
                  word={tappedWord.word}
                  wordData={tappedWord.wordData}
                  onClose={() => { setTappedWord(null); setActiveIdx(-1); }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ height: '100%', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F0E8D8' }}
              >
                <div style={{ textAlign: 'center', color: '#A0AEC0', fontSize: '16px', fontWeight: 600 }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>👆</div>
                  শব্দ বিশ্লেষণ দেখতে<br/>যেকোনো শব্দে চাপুন
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigation Row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', maxWidth: '1000px', margin: '0 auto', marginBottom: '32px', padding: '0 20px', zIndex: 10, position: 'relative' }}>
        <button onClick={handlePrev} disabled={currentItemIdx === 0} style={{ padding: '10px 24px', borderRadius: '30px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 700, color: currentItemIdx === 0 ? '#CBD5E0' : '#2E7D32', cursor: currentItemIdx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={currentItemIdx === 0 ? '#CBD5E0' : '#2E7D32'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          পূর্ববর্তী
        </button>
        
        {/* Progress Bar */}
        <div style={{ flex: 1, height: '16px', background: '#E2E8F0', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
          <motion.div 
             initial={false}
             animate={{ width: `${((currentItemIdx + 1) / levelContent.length) * 100}%` }}
             transition={{ type: 'spring', stiffness: 300, damping: 20 }}
             style={{ 
               height: '100%', 
               borderRadius: '8px',
               background: 'repeating-linear-gradient(-45deg, #4CAF50, #4CAF50 10px, #81C784 10px, #81C784 20px)'
             }} 
          />
        </div>

        {/* Counter */}
        <div style={{ padding: '8px 20px', background: '#FFF3E0', borderRadius: '20px', fontWeight: 700, color: '#E65100', fontSize: '15px' }}>
          {currentItemIdx + 1} / {levelContent.length}
        </div>

        <button onClick={handleNext} disabled={currentItemIdx >= levelContent.length - 1} style={{ padding: '10px 24px', borderRadius: '30px', border: 'none', background: currentItemIdx >= levelContent.length - 1 ? '#A5D6A7' : '#4CAF50', color: 'white', fontWeight: 700, cursor: currentItemIdx >= levelContent.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          পরবর্তী
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 19M19 12L12 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── Custom Text Input ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'relative', zIndex: 10, width: 'calc(100% - 40px)', border: '1px solid #F0E8D8' }}>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#1A202C', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✏️</span> নিজের লেখা বিশ্লেষণ করুন
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <input 
             type="text"
             value={customText}
             onChange={(e) => { setCustomText(e.target.value); setShowCustomResult(false); }}
             placeholder="এখানে বাংলা শব্দ বা বাক্য লিখুন..."
             style={{ flex: 1, padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '16px', fontFamily: '"Noto Sans Bengali", sans-serif', outline: 'none' }}
          />
          <button onClick={handleAnalyze} style={{ padding: '0 24px', borderRadius: '12px', border: 'none', background: '#388E3C', color: 'white', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 20L18.5 5.5C19.3284 4.67157 20.6716 4.67157 21.5 5.5V5.5C22.3284 6.32843 22.3284 7.67157 21.5 8.5L7 23" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M15 3L16 1L17 3L19 4L17 5L16 7L15 5L13 4L15 3Z" fill="white"/>
              <path d="M5 9L6 6L9 5L6 4L5 1L4 4L1 5L4 6L5 9Z" fill="white"/>
            </svg>
            বিশ্লেষণ করুন
          </button>
        </div>
        
        {showCustomResult && customText.trim() && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ background: '#FFF9F0', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <TextRenderer
                content={customText}
                activeWordIdx={-1}
                onWordTap={handleWordTap}
              />
            </div>
            {/* Word-level breakdown */}
            <div>
              <p style={{
                fontFamily: '"Noto Sans Bengali", sans-serif',
                fontSize: '14px', fontWeight: 700, color: '#E65100', marginBottom: '10px',
              }}>শব্দ বিশ্লেষণ:</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {customText.trim().split(/\s+/).filter(w => w.length > 0).map((w, i) => (
                  <WordDecompositionMini key={i} word={w.replace(/[।,!?]/g, '')} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: '80px' }} />

      {/* Decorative Assets */}
      <GrassBackground />
      <img src={heroKid} alt="" style={{ position: 'absolute', bottom: '0', left: '20px', width: '160px', zIndex: 5 }} />
      <FloatingStar />

      {/* ── Preferences Panel ── */}
      <PreferencesPanel />
    </div>
  );
}
