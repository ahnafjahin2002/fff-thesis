/**
 * ReadingPage.jsx
 * ----------------
 * Full page for Feature 1 — Adaptive Text Visualization.
 * Premium child-friendly / dyslexia-friendly interface.
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PreferencesPanel from '../components/reader/PreferencesPanel';
import PhonemeHighlighter from '../components/reader/PhonemeHighlighter';
import PhonemeWord from '../components/reader/PhonemeWord';
import usePreferences from '../hooks/usePreferences';
import { usePhoneme } from '../hooks/usePhoneme';
import { segmentText } from '../utils/phonemeUtils';
import { decomposeWord } from '../utils/banglaUtils';
import { synthesizeBanglaTTS } from '../utils/ttsApi';
import { DIFFICULTY_LEVELS, READING_CONTENT, getLevelInfo } from '../utils/readingContent';

// Premium UI assets
import readingKid from '../assets/reading-kid.png';
import bookLogo from '../assets/book-logo.png';
import cloudSoft from '../assets/cloud-soft.png';
import plantCorner from '../assets/plant-corner.png';
import starMascot from '../assets/star-mascot.png';
import bottomBooks from '../assets/bottom-books.png';
import magicWand from '../assets/magic-wand.png';
import speakerIcon from '../assets/speaker-icon.png';
import settingsIcon from '../assets/settings-icon.png';
import progressStar from '../assets/progress-star.png';
import rewardConfetti from '../assets/reward-confetti.png';

const cleanDisplayWord = (word = '') =>
  word.replace(/[।,!?;:\-–—"'()\[\]]/g, '').trim();

const HIGHLIGHT_COLORS = ['#FFD700', '#A7E46F', '#92D7FF', '#FF9AA2', '#C8A2FF', '#FFB86B'];

function ReadingSpeedControl({ speed, setSpeed }) {
  return (
    <div className="reading-speed-panel">
      <div className="reading-speed-title">
        <span>🐢</span>
        <strong>পড়ার গতি</strong>
        <span>🐇</span>
      </div>

      <div className="reading-speed-row">
        <input
          type="range"
          min="0.6"
          max="1.25"
          step="0.05"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="reading-speed-slider"
          aria-label="পড়ার গতি"
        />

        <span className="reading-speed-value">{speed.toFixed(2)}x</span>
      </div>
    </div>
  );
}

function HighlightColorControl({ highlightColor, setHighlightColor }) {
  return (
    <div className="highlight-chip-panel">
      <div className="highlight-chip-title">🎨 হাইলাইট রং</div>

      <div className="highlight-chip-row">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`highlight-chip ${highlightColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setHighlightColor(color)}
            aria-label={`হাইলাইট রং ${color}`}
          >
            {highlightColor === color ? '✓' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

function NarratedTextRenderer({
  words,
  activeWordIndex,
  activePhonemeIndex,
  highlightColor,
  onWordTap,
  isPlaying,
}) {
  if (!words.length) {
    return (
      <div className="phoneme-reading-empty">
        এখানে বাংলা লেখা দেখা যাবে
      </div>
    );
  }

  return (
    <div className="phoneme-reading-text">
      {words.map((entry, idx) => (
        <span key={`${entry.word}-${idx}`} className="phoneme-reading-token">
          <PhonemeWord
            word={entry.word}
            phonemes={entry.phonemes}
            isActiveWord={idx === activeWordIndex}
            activePhonemeIndex={activePhonemeIndex}
            highlightColor={highlightColor}
            dimmed={isPlaying && activeWordIndex !== -1 && idx !== activeWordIndex}
            onClick={() => onWordTap(entry.word, entry, idx)}
          />
          {' '}
        </span>
      ))}
    </div>
  );
}

// ── Live Word Info Panel ──
function LiveWordInfoPanel({
  word,
  wordData,
  phonemes = [],
  activePhonemeIndex = -1,
  isPlaying = false,
  onClose,
}) {
  const decomp = decomposeWord(word);
  const hasConjunct = decomp.some((d) => d.type === 'conjunct');

  const units = phonemes.length
    ? phonemes.map((p, i) => ({
        display: p,
        label: decomp[i]?.label || 'ধ্বনি',
        formula: decomp[i]?.formula,
        vowelSign: decomp[i]?.vowelSign,
        vowelSignName: decomp[i]?.vowelSignName,
      }))
    : decomp;

  return (
    <div className="live-word-info-inner">
      <div className="live-word-panel-header">
        <span>
          🧩 শব্দ বিশ্লেষণ
          {isPlaying && <em>চলছে...</em>}
        </span>

        <button onClick={onClose} aria-label="বন্ধ করুন">
          ✕
        </button>
      </div>

      <div className="live-word-title">{word}</div>

      {units.length > 0 && (
        <div className="word-breakdown-row">
          {units.map((d, i) => (
            <span key={`${d.display}-${i}`} className="breakdown-unit-wrap">
              {i > 0 && <span className="breakdown-plus">+</span>}

              <div
                className={`breakdown-unit-card ${
                  i === activePhonemeIndex ? 'active' : ''
                }`}
              >
                <span className="breakdown-unit-char">{d.display}</span>
                <span className="breakdown-unit-label">
                  {i === activePhonemeIndex ? 'এখন পড়ছে' : d.label}
                </span>
              </div>
            </span>
          ))}
        </div>
      )}

      {decomp.filter((d) => d.formula).map((d, i) => (
        <div key={i} className="breakdown-formula">
          <span>{d.formula}</span>

          {d.vowelSign && (
            <small>
              + {d.vowelSign} ({d.vowelSignName})
            </small>
          )}
        </div>
      ))}

      {decomp.filter((d) => d.vowelSign && d.type !== 'conjunct').length > 0 && (
        <div className="breakdown-kar">
          কার:{' '}
          {decomp
            .filter((d) => d.vowelSign && d.type !== 'conjunct')
            .map((d) => `${d.vowelSign} (${d.vowelSignName})`)
            .join(', ')}
        </div>
      )}

      {wordData?.meaning && (
        <div className="breakdown-meaning">
          অর্থ: {wordData.meaning}
        </div>
      )}

      <div className="breakdown-tags">
        {hasConjunct && <span>যুক্তবর্ণ</span>}
        {decomp.some((d) => d.vowelSign) && <span>কার-চিহ্ন</span>}
      </div>
    </div>
  );
}

// ── Hub Selection Screen ──
function ReadingHub({ onSelect }) {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'line',
      title: 'লাইন ধরে পড়া',
      sub: 'বাক্য ধরে ধরে পড়ি\nশব্দ বিশ্লেষণ শিখি',
      emoji: '📖',
      bg: '#eef9f1',
      accent: '#18b368',
    },
    {
      id: 'phoneme',
      title: 'অক্ষর অভ্যাস',
      sub: 'অক্ষর চিনি',
      emoji: '🔤',
      bg: '#fffbee',
      accent: '#f5a623',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0faf4',
        fontFamily: "'Hind Siliguri', sans-serif",
        padding: '28px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/dashboard')}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            border: 'none',
            background: 'white',
            cursor: 'pointer',
            fontSize: 20,
            boxShadow: '0 3px 14px rgba(0,0,0,.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ←
        </motion.button>

        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1a2e1a', lineHeight: 1.2 }}>
            📚 পড়া
          </div>

          <div style={{ fontSize: 14, color: '#3a6b4a', fontWeight: 500, marginTop: 2 }}>
            পড়ার সুবিধা ও অক্ষর চর্চা একসাথে
          </div>
        </div>
      </div>

      <div
        className="reading-hub-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          maxWidth: 700,
          margin: '0 auto',
        }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ translateY: -5, boxShadow: '0 10px 32px rgba(0,0,0,.12)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(card.id)}
            style={{
              background: card.bg,
              borderRadius: 22,
              padding: '30px 22px',
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 12,
              minHeight: 200,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2.8,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
              style={{ fontSize: 52 }}
            >
              {card.emoji}
            </motion.div>

            <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.3 }}>
              {card.title}
            </div>

            <div
              style={{
                fontSize: 14,
                color: '#687076',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
              }}
            >
              {card.sub}
            </div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.93 }}
              style={{
                marginTop: 'auto',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: card.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 20,
              }}
            >
              →
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page Component ──
export default function ReadingPage() {
  const [subView, setSubView] = useState(null);
  const { isPanelOpen, togglePanel } = usePreferences();

  const [tappedWord, setTappedWord] = useState(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [currentLevel, setCurrentLevel] = useState('sohoj');
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [customText, setCustomText] = useState('');
  const [customAnalysisActive, setCustomAnalysisActive] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const textSectionRef = useRef(null);
  const autoStartCustomRef = useRef(false);
  const audioRef = useRef(null);

  const levelContent = READING_CONTENT[currentLevel] || [];
  const currentItem = levelContent[currentItemIdx] || { text: '', title: '' };
  const levelInfo = getLevelInfo(currentLevel);
  const isSingleWord = currentLevel === 'shuru' && !customAnalysisActive;

  const displayText = customAnalysisActive ? customText : currentItem.text;

  const readingWords = useMemo(() => segmentText(displayText), [displayText]);

  const handleNarrationWordChange = useCallback((entry, wordIdx) => {
    const cleanWord = cleanDisplayWord(entry.word) || entry.word;

    setTappedWord({
      word: cleanWord,
      wordData: entry,
      wordIdx,
    });

    setActiveIdx(wordIdx);
  }, []);

  const handleNarrationEnd = useCallback(() => {
    setActiveIdx(-1);
  }, []);

  const {
    activeWordIndex,
    activePhonemeIndex,
    isPlaying,
    highlightColor,
    speed,
    startNarration,
    startHighlightOnly,
    stopNarration,
    setHighlightColor,
    setSpeed,
  } = usePhoneme(readingWords, {
    onWordChange: handleNarrationWordChange,
    onEnd: handleNarrationEnd,
  });

  const stopAllAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsGeneratingAudio(false);
    stopNarration();
  }, [stopNarration]);

  const playAudioWithBackend = useCallback(async () => {
    if (!displayText.trim()) return;

    setIsGeneratingAudio(true);
    setTappedWord(null);
    setActiveIdx(-1);

    try {
      const result = await synthesizeBanglaTTS(displayText, "female");

      if (result && result.fullAudioUrl) {
        const audio = new Audio(result.fullAudioUrl);
        audio.playbackRate = speed;
        audioRef.current = audio;

        audio.onended = () => {
          audioRef.current = null;
        };

        await audio.play();
        
        const effectiveDurationMs = result.durationMs / speed;
        startHighlightOnly(effectiveDurationMs);
      } else {
        throw new Error("No audio URL returned");
      }
    } catch (err) {
      console.warn("Backend TTS failed, falling back to browser SpeechSynthesis", err);
      startNarration(); // Fallback
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [displayText, speed, startHighlightOnly, startNarration]);

  useEffect(() => {
    stopAllAudio();
    setTappedWord(null);
    setActiveIdx(-1);
  }, [displayText, stopAllAudio]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  useEffect(() => {
    if (customAnalysisActive && autoStartCustomRef.current && displayText.trim()) {
      autoStartCustomRef.current = false;

      const timer = setTimeout(() => {
        playAudioWithBackend();
      }, 180);

      return () => clearTimeout(timer);
    }
  }, [customAnalysisActive, displayText, playAudioWithBackend]);

  const handlePlayToggle = useCallback(() => {
    if (isPlaying || isGeneratingAudio) {
      stopAllAudio();
      return;
    }

    playAudioWithBackend();
  }, [isPlaying, isGeneratingAudio, stopAllAudio, playAudioWithBackend]);

  const handleWordTap = useCallback(
    (word, wordData, wordIdx) => {
      if (isPlaying || isGeneratingAudio) stopAllAudio();

      const cleanWord = cleanDisplayWord(word) || word;

      setTappedWord({
        word: cleanWord,
        wordData,
        wordIdx,
      });

      setActiveIdx(wordIdx);
    },
    [isPlaying, isGeneratingAudio, stopAllAudio]
  );

  const handlePrev = () => {
    if (currentItemIdx > 0) {
      stopAllAudio();
      setCurrentItemIdx(currentItemIdx - 1);
      setTappedWord(null);
      setActiveIdx(-1);
      setCustomAnalysisActive(false);
    }
  };

  const handleNext = () => {
    if (currentItemIdx < levelContent.length - 1) {
      stopAllAudio();
      setCurrentItemIdx(currentItemIdx + 1);
      setTappedWord(null);
      setActiveIdx(-1);
      setCustomAnalysisActive(false);
    }
  };

  const handleLevelChange = (levelId) => {
    stopAllAudio();
    setCurrentLevel(levelId);
    setCurrentItemIdx(0);
    setTappedWord(null);
    setActiveIdx(-1);
    setCustomAnalysisActive(false);
  };

  const handleAnalyze = () => {
    if (customText.trim()) {
      stopAllAudio();
      autoStartCustomRef.current = true;
      setCustomAnalysisActive(true);
      setTappedWord(null);
      setActiveIdx(-1);

      setTimeout(() => {
        textSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    }
  };

  const selectedPhonemes =
    tappedWord?.wordIdx !== undefined
      ? readingWords[tappedWord.wordIdx]?.phonemes || []
      : [];

  if (subView === null) return <ReadingHub onSelect={setSubView} />;
  if (subView === 'phoneme') return <PhonemeHighlighter onBack={() => setSubView(null)} />;

  let btnLabel = 'শোনো';
  if (isGeneratingAudio) btnLabel = 'অডিও তৈরি হচ্ছে...';
  else if (isPlaying) btnLabel = 'থামাও';

  return (
    <div className="reading-page-shell">
      <div className="reading-decor-layer" aria-hidden="true">
        <img src={cloudSoft} alt="" className="reading-bottom-cloud" />
        <img src={readingKid} alt="" className="reading-bottom-kid" />

        <div className="reading-bottom-right-decor">
          <img src={starMascot} alt="" className="reading-bottom-star" />
          <img src={bottomBooks} alt="" className="reading-bottom-books" />
          <img src={plantCorner} alt="" className="reading-bottom-plant" />
        </div>
      </div>

      <header className="app-header">
        <div className="app-header-left">
          <button className="back-btn" aria-label="পেছনে যান" onClick={() => setSubView(null)}>
            ←
          </button>

          <div className="app-brand">
            <img src={bookLogo} alt="Book logo" className="app-brand-logo" />

            <div>
              <span className="app-brand-name">চলো পড়ি</span>
              <div className="app-brand-subtitle">পড়ি, বুঝি, শিখি</div>
            </div>
          </div>
        </div>

        <div className="app-header-actions">
          <button
            className={`header-btn ${(isPlaying || isGeneratingAudio) ? 'listen-button-active' : ''}`}
            aria-label="শোনো"
            onClick={handlePlayToggle}
          >
            <img src={speakerIcon} alt="" className="btn-icon-img" />
            <span>{btnLabel}</span>
          </button>

          <button className="header-btn save-btn" aria-label="সংরক্ষণ">
            <span className="bookmark-icon">🔖</span>
            <span>সংরক্ষণ</span>
          </button>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={togglePanel}
            className={`header-btn ${isPanelOpen ? 'active' : ''}`}
            aria-label="সেটিংস"
            aria-expanded={isPanelOpen}
          >
            <img src={settingsIcon} alt="" className="btn-icon-img" />
            <span>সেটিংস</span>
          </motion.button>
        </div>
      </header>

      <div className="reading-level-stepper">
        {DIFFICULTY_LEVELS.map((level, index) => (
          <button
            key={level.id}
            onClick={() => handleLevelChange(level.id)}
            className={`reading-level-pill ${currentLevel === level.id ? 'active' : ''}`}
          >
            <span className="level-number">{index + 1}</span>
            <span>{level.label}</span>

            {currentLevel === level.id && (
              <img src={progressStar} alt="" className="level-active-star" />
            )}
          </button>
        ))}
      </div>

      <main className="reading-premium-main">
        <div className="reading-main-area">
          <div className="reading-text-section">
            <div className="reading-text-col" ref={textSectionRef}>
              <button
                className={`sentence-listen-btn ${(isPlaying || isGeneratingAudio) ? 'listen-button-active' : ''}`}
                aria-label="এই লেখাটি শুনুন"
                onClick={handlePlayToggle}
              >
                <img src={speakerIcon} alt="" />
                <span>{btnLabel}</span>
              </button>

              <div className="reading-level-label">
                {customAnalysisActive ? (
                  <span>✏️ নিজের লেখা</span>
                ) : (
                  <>
                    <span>{levelInfo.label}</span>
                    {currentItem.title && <span>— {currentItem.title}</span>}
                  </>
                )}
              </div>

              <NarratedTextRenderer
                words={readingWords}
                activeWordIndex={activeWordIndex}
                activePhonemeIndex={activePhonemeIndex}
                highlightColor={highlightColor}
                isPlaying={isPlaying}
                onWordTap={handleWordTap}
              />
            </div>

            <AnimatePresence>
              <motion.div
                className={`live-word-panel ${tappedWord ? '' : 'empty-panel'}`}
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {tappedWord ? (
                  <>
                    <LiveWordInfoPanel
                      word={tappedWord.word}
                      wordData={tappedWord.wordData}
                      phonemes={selectedPhonemes}
                      activePhonemeIndex={
                        tappedWord.wordIdx === activeWordIndex ? activePhonemeIndex : -1
                      }
                      isPlaying={isPlaying}
                      onClose={() => {
                        setTappedWord(null);
                        setActiveIdx(-1);
                      }}
                    />

                    <ReadingSpeedControl speed={speed} setSpeed={setSpeed} />
                    <HighlightColorControl
                      highlightColor={highlightColor}
                      setHighlightColor={setHighlightColor}
                    />
                  </>
                ) : (
                  <>
                    <div className="empty-panel-content">
                      <img src={starMascot} alt="" className="empty-panel-star" />

                      <div>
                        <strong>শব্দে ক্লিক করো</strong>
                        <span>বিশ্লেষণ এখানে দেখাবে</span>
                      </div>
                    </div>

                    <ReadingSpeedControl speed={speed} setSpeed={setSpeed} />
                    <HighlightColorControl
                      highlightColor={highlightColor}
                      setHighlightColor={setHighlightColor}
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="nav-footer">
          <button className="nav-btn" onClick={handlePrev} disabled={currentItemIdx === 0}>
            ← পূর্ববর্তী
          </button>

          <div className="progress-wrap">
            <div className="reading-progress-bar">
              <motion.div
                initial={false}
                animate={{
                  width: `${
                    levelContent.length
                      ? ((currentItemIdx + 1) / levelContent.length) * 100
                      : 0
                  }%`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="reading-progress-fill"
              />
            </div>

            <span className="nav-counter">
              {currentItemIdx + 1} / {levelContent.length}
            </span>
          </div>

          <button
            className="nav-btn next-btn"
            onClick={handleNext}
            disabled={currentItemIdx >= levelContent.length - 1}
          >
            পরবর্তী →
          </button>
        </div>

        {isSingleWord && currentItem.text && (
          <div style={{ maxWidth: '1180px', margin: '0 auto 24px', padding: '0 4px' }}>
            <WordDecompositionCard word={currentItem.text} />
          </div>
        )}

        <div className="custom-input-section">
          <img src={rewardConfetti} alt="" className="custom-confetti" />

          <div className="custom-input-card">
            <div className="custom-input-title">
              <span className="custom-title-icon">✏️</span>

              <div>
                <strong>নিজের লেখা বিশ্লেষণ করুন</strong>
                <span>এখানে বাংলা শব্দ বা বাক্য লিখুন...</span>
              </div>
            </div>

            <textarea
              className="custom-textarea"
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                setCustomAnalysisActive(false);
              }}
              placeholder="এখানে বাংলা শব্দ বা বাক্য লিখুন..."
            />

            <button className="custom-analyze-btn" onClick={handleAnalyze}>
              <img src={magicWand} alt="" className="analyze-wand-icon" />
              বিশ্লেষণ করুন ও শোনো
            </button>

            {customAnalysisActive && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="custom-active-message"
              >
                ✅ লেখাটি উপরে দেখানো হচ্ছে — পড়া ও বিশ্লেষণ চলছে
              </motion.div>
            )}
          </div>
        </div>

        <div style={{ height: '44px' }} />
      </main>

      <PreferencesPanel />
    </div>
  );
}

// ── Word Decomposition Card ──
function WordDecompositionCard({ word }) {
  const decomp = decomposeWord(word);
  if (decomp.length <= 1 && !decomp[0]?.formula) return null;

  return (
    <div className="showcase-card" style={{ marginTop: '0' }}>
      <div className="showcase-card-title">শব্দ ভাঙন: {word}</div>

      <div className="showcase-decomp-row">
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            fontFamily: '"Noto Sans Bengali"',
          }}
        >
          {word}
        </span>

        <span className="conjunct-equals">=</span>

        {decomp.map((d, i) => (
          <span
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {i > 0 && <span className="conjunct-plus">+</span>}

            <div className={`showcase-decomp-box ${d.type === 'conjunct' ? 'conjunct' : ''}`}>
              <span className="showcase-decomp-char">{d.display}</span>
              <span className="showcase-decomp-label">{d.label}</span>
            </div>
          </span>
        ))}
      </div>

      {decomp.filter((d) => d.formula).map((d, i) => (
        <div
          key={i}
          style={{
            textAlign: 'center',
            marginTop: '8px',
            padding: '8px',
            background: '#FFF8E7',
            borderRadius: '8px',
            fontFamily: '"Noto Sans Bengali", sans-serif',
            fontSize: '14px',
          }}
        >
          <span style={{ color: '#E06B2E', fontWeight: 600 }}>{d.formula}</span>

          {d.vowelSign && (
            <span style={{ color: '#666', marginLeft: '8px' }}>
              + {d.vowelSign} ({d.vowelSignName})
            </span>
          )}
        </div>
      ))}

      <div className="showcase-pron" style={{ marginTop: '10px' }}>
        <span>🔊</span>
        <span>
          উচ্চারণ: <strong>{word}</strong>
        </span>
      </div>
    </div>
  );
}