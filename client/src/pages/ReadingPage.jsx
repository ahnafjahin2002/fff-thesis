/**
 * ReadingPage.jsx
 * ----------------
 * Full page for Feature 1 — Adaptive Text Visualization.
 * Premium child-friendly / dyslexia-friendly interface.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextRenderer from '../components/reader/TextRenderer';
import PreferencesPanel from '../components/reader/PreferencesPanel';
import usePreferences from '../hooks/usePreferences';
import { decomposeWord } from '../utils/banglaUtils';
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


// ── Live Word Info Panel ──
function LiveWordInfoPanel({ word, wordData, onClose }) {
  const decomp = decomposeWord(word);
  const hasConjunct = decomp.some(d => d.type === 'conjunct');

  return (
    <div style={{ height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #DDEBFF',
        }}
      >
        <span
          style={{
            fontFamily: '"Noto Sans Bengali", sans-serif',
            fontSize: '18px',
            fontWeight: 800,
            color: '#174A8B',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          🧩 শব্দ বিশ্লেষণ
        </span>

        <button
          onClick={onClose}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            background: '#F5EDE0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#666',
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          fontFamily: '"Noto Sans Bengali", sans-serif',
          fontSize: '52px',
          fontWeight: 800,
          color: '#183A24',
          textAlign: 'center',
          lineHeight: 1.3,
          marginBottom: '20px',
        }}
      >
        {word}
      </div>

      {decomp.length > 0 && (
        <div className="word-breakdown-row">
          {decomp.map((d, i) => (
            <span
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {i > 0 && (
                <span
                  style={{
                    fontSize: '28px',
                    color: '#7891B5',
                    fontWeight: 900,
                  }}
                >
                  +
                </span>
              )}

              <div
                style={{
                  background:
                    i % 3 === 0
                      ? '#EFF9E8'
                      : i % 3 === 1
                      ? '#EAF4FF'
                      : '#FFF0F5',
                  border:
                    i % 3 === 0
                      ? '2px solid #CDEEBE'
                      : i % 3 === 1
                      ? '2px solid #C9E1FF'
                      : '2px solid #FFD1E1',
                  borderRadius: '18px',
                  padding: '14px 20px',
                  textAlign: 'center',
                  minWidth: 76,
                  boxShadow: '0 8px 16px rgba(40, 50, 70, 0.08)',
                }}
              >
                <span
                  style={{
                    fontFamily: '"Noto Sans Bengali", sans-serif',
                    fontSize: '34px',
                    fontWeight: 800,
                    display: 'block',
                    color: '#183A24',
                  }}
                >
                  {d.display}
                </span>

                <span
                  style={{
                    fontFamily: '"Noto Sans Bengali", sans-serif',
                    fontSize: '13px',
                    color: '#65758A',
                    display: 'block',
                    marginTop: 3,
                  }}
                >
                  {d.label}
                </span>
              </div>
            </span>
          ))}
        </div>
      )}

      {decomp.filter(d => d.formula).map((d, i) => (
        <div
          key={i}
          style={{
            background: '#FFF8E7',
            borderRadius: '14px',
            padding: '9px 12px',
            textAlign: 'center',
            marginBottom: '8px',
            fontFamily: '"Noto Sans Bengali", sans-serif',
            fontSize: '15px',
          }}
        >
          <span style={{ color: '#E06B2E', fontWeight: 700 }}>{d.formula}</span>

          {d.vowelSign && (
            <span
              style={{
                color: '#666',
                marginLeft: '8px',
                fontSize: '13px',
              }}
            >
              + {d.vowelSign} ({d.vowelSignName})
            </span>
          )}
        </div>
      ))}

      {decomp.filter(d => d.vowelSign && d.type !== 'conjunct').length > 0 && (
        <div
          style={{
            marginTop: '10px',
            padding: '12px 14px',
            borderRadius: '16px',
            background: '#EAF8E6',
            fontSize: '15px',
            textAlign: 'center',
            fontFamily: '"Noto Sans Bengali", sans-serif',
            color: '#2E8B57',
            fontWeight: 700,
          }}
        >
          কার:{' '}
          {decomp
            .filter(d => d.vowelSign && d.type !== 'conjunct')
            .map(d => `${d.vowelSign} (${d.vowelSignName})`)
            .join(', ')}
        </div>
      )}

      {wordData?.meaning && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '16px',
            background: '#E8F4FD',
            fontFamily: '"Noto Sans Bengali", sans-serif',
            fontSize: '15px',
            color: '#1A2B4A',
            textAlign: 'center',
            fontWeight: 700,
          }}
        >
          অর্থ: {wordData.meaning}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '16px',
        }}
      >
        {hasConjunct && (
          <span
            style={{
              background: '#FFF0E0',
              color: '#E06B2E',
              padding: '5px 12px',
              borderRadius: '14px',
              fontSize: '12px',
              fontFamily: '"Noto Sans Bengali"',
              fontWeight: 800,
            }}
          >
            যুক্তবর্ণ
          </span>
        )}

        {decomp.some(d => d.vowelSign) && (
          <span
            style={{
              background: '#F0FFF4',
              color: '#2E8B57',
              padding: '5px 12px',
              borderRadius: '14px',
              fontSize: '12px',
              fontFamily: '"Noto Sans Bengali"',
              fontWeight: 800,
            }}
          >
            কার-চিহ্ন
          </span>
        )}
      </div>
    </div>
  );
}


// ── Main Page Component ──
export default function ReadingPage() {
  const { isPanelOpen, togglePanel } = usePreferences();
  const [tappedWord, setTappedWord] = useState(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [currentLevel, setCurrentLevel] = useState('sohoj');
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [customText, setCustomText] = useState('');
  const [showCustomResult, setShowCustomResult] = useState(false);

  const levelContent = READING_CONTENT[currentLevel] || [];
  const currentItem = levelContent[currentItemIdx] || { text: '', title: '' };
  const levelInfo = getLevelInfo(currentLevel);
  const isSingleWord = currentLevel === 'shuru';

  const handleWordTap = useCallback((word, wordData, wordIdx) => {
    setTappedWord({ word, wordData, wordIdx });
    setActiveIdx(wordIdx);
  }, []);

  const handlePrev = () => {
    if (currentItemIdx > 0) {
      setCurrentItemIdx(currentItemIdx - 1);
      setTappedWord(null);
      setActiveIdx(-1);
    }
  };

  const handleNext = () => {
    if (currentItemIdx < levelContent.length - 1) {
      setCurrentItemIdx(currentItemIdx + 1);
      setTappedWord(null);
      setActiveIdx(-1);
    }
  };

  const handleLevelChange = levelId => {
    setCurrentLevel(levelId);
    setCurrentItemIdx(0);
    setTappedWord(null);
    setActiveIdx(-1);
  };

  const handleAnalyze = () => {
    if (customText.trim()) setShowCustomResult(true);
  };

  return (
    <div className="reading-page-shell">
      {/* Premium clean bottom decorations only */}
      <div className="reading-decor-layer" aria-hidden="true">
        <img src={cloudSoft} alt="" className="reading-bottom-cloud" />
        <img src={readingKid} alt="" className="reading-bottom-kid" />

        <div className="reading-bottom-right-decor">
          <img src={starMascot} alt="" className="reading-bottom-star" />
          <img src={bottomBooks} alt="" className="reading-bottom-books" />
          <img src={plantCorner} alt="" className="reading-bottom-plant" />
        </div>
      </div>

      {/* ── Top Toolbar ── */}
      <header className="app-header">
        <div className="app-header-left">
          <button className="back-btn" aria-label="পেছনে যান">
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
          <button className="header-btn" aria-label="শোনো">
            <img src={speakerIcon} alt="" className="btn-icon-img" />
            <span>শোনো</span>
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

      {/* ── Level Tabs / Stepper ── */}
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

      {/* ── Main Reading Area ── */}
      <main className="reading-premium-main">
        <div className="reading-main-area">
          <div className="reading-text-section">
            <div className="reading-text-col">
              <button className="sentence-listen-btn" aria-label="এই লেখাটি শুনুন">
                <img src={speakerIcon} alt="" />
                <span>শোনো</span>
              </button>

              <div className="reading-level-label">
                <span>{levelInfo.label}</span>
                {currentItem.title && <span>— {currentItem.title}</span>}
              </div>

              <TextRenderer
                content={currentItem.text}
                activeWordIdx={activeIdx}
                onWordTap={handleWordTap}
                isSingleWord={isSingleWord}
              />
            </div>

            <AnimatePresence>
              {tappedWord ? (
                <motion.div
                  className="live-word-panel"
                  initial={{ opacity: 0, x: 20, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <LiveWordInfoPanel
                    word={tappedWord.word}
                    wordData={tappedWord.wordData}
                    onClose={() => {
                      setTappedWord(null);
                      setActiveIdx(-1);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="live-word-panel empty-panel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <img src={starMascot} alt="" className="empty-panel-star" />

                  <div>
                    <strong>শব্দে ক্লিক করো</strong>
                    <span>বিশ্লেষণ এখানে দেখাবে</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Navigation Footer ── */}
        <div className="nav-footer">
          <button
            className="nav-btn"
            onClick={handlePrev}
            disabled={currentItemIdx === 0}
          >
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

        {/* ── Single Word Decomposition ── */}
        {isSingleWord && currentItem.text && (
          <div style={{ maxWidth: '1180px', margin: '0 auto 24px', padding: '0 4px' }}>
            <WordDecompositionCard word={currentItem.text} />
          </div>
        )}

        {/* ── Custom Text Input ── */}
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
              onChange={e => {
                setCustomText(e.target.value);
                setShowCustomResult(false);
              }}
              placeholder="এখানে বাংলা শব্দ বা বাক্য লিখুন..."
            />

            <button className="custom-analyze-btn" onClick={handleAnalyze}>
              <img src={magicWand} alt="" className="analyze-wand-icon" />
              বিশ্লেষণ করুন
            </button>

            {showCustomResult && customText.trim() && (
              <div className="custom-result-area">
                <TextRenderer
                  content={customText}
                  activeWordIdx={-1}
                  onWordTap={handleWordTap}
                />

                <div style={{ marginTop: '14px', borderTop: '1px solid #E2D5C3', paddingTop: '14px' }}>
                  <p
                    style={{
                      fontFamily: '"Noto Sans Bengali", sans-serif',
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#E06B2E',
                      marginBottom: '10px',
                    }}
                  >
                    শব্দ বিশ্লেষণ:
                  </p>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {customText
                      .trim()
                      .split(/\s+/)
                      .filter(w => w.length > 0)
                      .map((w, i) => (
                        <WordDecompositionMini
                          key={i}
                          word={w.replace(/[।,!?]/g, '')}
                        />
                      ))}
                  </div>
                </div>
              </div>
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

      {decomp.filter(d => d.formula).map((d, i) => (
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


// ── Mini Word Decomposition ──
function WordDecompositionMini({ word }) {
  const decomp = decomposeWord(word);
  const hasConjunct = decomp.some(d => d.type === 'conjunct');

  if (!word || word.length === 0) return null;

  return (
    <div
      style={{
        background: hasConjunct ? '#FFF0E0' : '#F8F4EE',
        border: `1px solid ${hasConjunct ? '#E06B2E' : '#E2D5C3'}`,
        borderRadius: '10px',
        padding: '8px 12px',
        textAlign: 'center',
        minWidth: '60px',
      }}
    >
      <div
        style={{
          fontFamily: '"Noto Sans Bengali", sans-serif',
          fontSize: '18px',
          fontWeight: 700,
          color: '#2D1B00',
          marginBottom: '4px',
        }}
      >
        {word}
      </div>

      {decomp.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            flexWrap: 'wrap',
          }}
        >
          {decomp.map((d, i) => (
            <span
              key={i}
              style={{
                fontFamily: '"Noto Sans Bengali", sans-serif',
                fontSize: '12px',
                color: d.type === 'conjunct' ? '#E06B2E' : '#666',
              }}
            >
              {i > 0 && '+'}
              {d.display}
            </span>
          ))}
        </div>
      )}

      {decomp.filter(d => d.formula).map((d, i) => (
        <div
          key={i}
          style={{
            fontFamily: '"Noto Sans Bengali", sans-serif',
            fontSize: '10px',
            color: '#E06B2E',
            marginTop: '2px',
          }}
        >
          ({d.formula})
        </div>
      ))}
    </div>
  );
}