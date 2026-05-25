/**
 * ReadingPage.jsx
 * ----------------
 * Full page for Feature 1 — Adaptive Text Visualization.
 * Child-friendly interface with:
 *   - Top toolbar (back, audio, word-by-word)
 *   - Progressive difficulty levels (শুরু → সহজ → মাঝারি → উন্নত)
 *   - Main reading area with illustration
 *   - Conjunct word breakdown on tap
 *   - Navigation (prev/next with counter)
 *   - Bottom showcase cards (juktoborno, kar-chihno, reph, levels)
 *   - Custom text input section
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TextRenderer from '../components/reader/TextRenderer';
import PreferencesPanel from '../components/reader/PreferencesPanel';
import usePreferences from '../hooks/usePreferences';
import { decomposeWord } from '../utils/banglaUtils';
import { DIFFICULTY_LEVELS, READING_CONTENT, getLevelInfo } from '../utils/readingContent';


// ── Live Word Info Panel (replaces static image) ──
function LiveWordInfoPanel({ word, wordData, onClose }) {
  const decomp = decomposeWord(word);
  const hasConjunct = decomp.some(d => d.type === 'conjunct');

  return (
    <div style={{ height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #F0E8D8',
      }}>
        <span style={{
          fontFamily: '"Noto Sans Bengali", sans-serif',
          fontSize: '12px', fontWeight: 600, color: '#E06B2E',
        }}>🔍 শব্দ বিশ্লেষণ</span>
        <button onClick={onClose} style={{
          width: '24px', height: '24px', borderRadius: '50%',
          border: 'none', background: '#F5EDE0', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', color: '#666',
        }}>✕</button>
      </div>

      {/* Big word display */}
      <div style={{
        fontFamily: '"Noto Sans Bengali", sans-serif',
        fontSize: '32px', fontWeight: 700, color: '#2D1B00',
        textAlign: 'center', lineHeight: 1.3, marginBottom: '12px',
      }}>{word}</div>

      {/* Syllable decomposition */}
      {decomp.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '5px', flexWrap: 'wrap', marginBottom: '12px',
        }}>
          {decomp.map((d, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && <span style={{ fontSize: '14px', color: '#999', fontWeight: 700 }}>+</span>}
              <div style={{
                background: d.type === 'conjunct' ? '#FFF0E0' : '#E8F4FD',
                border: `1.5px solid ${d.type === 'conjunct' ? '#E06B2E' : '#B3D9F2'}`,
                borderRadius: '8px', padding: '4px 10px', textAlign: 'center',
              }}>
                <span style={{
                  fontFamily: '"Noto Sans Bengali", sans-serif',
                  fontSize: '18px', fontWeight: 600, display: 'block', color: '#2D1B00',
                }}>{d.display}</span>
                <span style={{
                  fontFamily: '"Noto Sans Bengali", sans-serif',
                  fontSize: '9px', color: '#888', display: 'block',
                }}>{d.label}</span>
              </div>
            </span>
          ))}
        </div>
      )}

      {/* Conjunct formulas */}
      {decomp.filter(d => d.formula).map((d, i) => (
        <div key={i} style={{
          background: '#FFF8E7', borderRadius: '8px', padding: '6px 10px',
          textAlign: 'center', marginBottom: '6px',
          fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '13px',
        }}>
          <span style={{ color: '#E06B2E', fontWeight: 600 }}>{d.formula}</span>
          {d.vowelSign && (
            <span style={{ color: '#666', marginLeft: '6px', fontSize: '11px' }}>
              + {d.vowelSign} ({d.vowelSignName})
            </span>
          )}
        </div>
      ))}

      {/* Vowel signs list */}
      {decomp.filter(d => d.vowelSign && d.type !== 'conjunct').length > 0 && (
        <div style={{
          marginTop: '6px', padding: '6px 10px', borderRadius: '8px',
          background: '#F0FFF4', fontSize: '11px', textAlign: 'center',
          fontFamily: '"Noto Sans Bengali", sans-serif', color: '#2E8B57',
        }}>
          কার: {decomp.filter(d => d.vowelSign && d.type !== 'conjunct').map(d => `${d.vowelSign} (${d.vowelSignName})`).join(', ')}
        </div>
      )}

      {/* Word meaning if available */}
      {wordData?.meaning && (
        <div style={{
          marginTop: '8px', padding: '6px 10px', borderRadius: '8px',
          background: '#E8F4FD', fontFamily: '"Noto Sans Bengali", sans-serif',
          fontSize: '12px', color: '#1A2B4A', textAlign: 'center',
        }}>
          অর্থ: {wordData.meaning}
        </div>
      )}

      {/* Type badges */}
      <div style={{
        display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px',
      }}>
        {hasConjunct && (
          <span style={{
            background: '#FFF0E0', color: '#E06B2E', padding: '2px 8px',
            borderRadius: '10px', fontSize: '10px', fontFamily: '"Noto Sans Bengali"', fontWeight: 600,
          }}>যুক্তবর্ণ</span>
        )}
        {decomp.some(d => d.vowelSign) && (
          <span style={{
            background: '#F0FFF4', color: '#2E8B57', padding: '2px 8px',
            borderRadius: '10px', fontSize: '10px', fontFamily: '"Noto Sans Bengali"', fontWeight: 600,
          }}>কার-চিহ্ন</span>
        )}
      </div>
    </div>
  );
}

// ── Showcase: Juktoborno Breakdown Demo ──
function JuktobornoShowcase() {
  const word = 'রান্না';
  const decomp = decomposeWord(word);
  return (
    <div className="showcase-card">
      <div className="showcase-card-title">যুক্তবর্ণ ভাঙার উদাহরণ</div>
      <div className="showcase-word-big" style={{ fontSize: '36px' }}>{word}</div>
      {/* Syllable-level breakdown */}
      <div className="showcase-decomp-row">
        <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: '"Noto Sans Bengali"' }}>{word}</span>
        <span className="conjunct-equals">=</span>
        {decomp.map((d, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {i > 0 && <span className="conjunct-plus">+</span>}
            <div className={`showcase-decomp-box ${d.type === 'conjunct' ? 'conjunct' : ''}`}>
              <span className="showcase-decomp-char">{d.display}</span>
            </div>
          </span>
        ))}
      </div>
      {/* Detailed table */}
      <table className="showcase-table">
        <tbody>
          <tr>{decomp.map((d, i) => <td key={i}>{d.display}</td>)}</tr>
          <tr>{decomp.map((d, i) => <td key={i} style={{ fontSize: '11px', color: '#888' }}>{d.label}{d.vowelSign ? ` + ${d.vowelSignName}` : ''}</td>)}</tr>
          {decomp.some(d => d.formula) && (
            <tr>{decomp.map((d, i) => <td key={i} style={{ fontSize: '11px', color: '#E06B2E' }}>{d.formula || '—'}</td>)}</tr>
          )}
        </tbody>
      </table>
      <div className="showcase-pron">
        <span>🔊</span>
        <span>উচ্চারণ: <strong>{word}</strong></span>
      </div>
    </div>
  );
}

// ── Showcase: Kar-Chihno Highlight ──
function KarChihnoShowcase() {
  return (
    <div className="showcase-card">
      <div className="showcase-card-title">কার-চিহ্ন হাইলাইট</div>
      <div className="vowel-highlight-demo">
        ক<span className="vowel-highlighted">ি</span>না
      </div>
      <div className="vowel-arrow">↑ কার-চিহ্ন (ই-কার)</div>
      <p style={{
        fontFamily: '"Noto Sans Bengali"', fontSize: '12px', color: '#666',
        marginTop: '10px', lineHeight: 1.6, textAlign: 'center',
      }}>
        কার-চিহ্নগুলো আলাদা রঙে দেখানো হয়েছে যাতে অবস্থান সহজে বোঝা যায়।
      </p>
    </div>
  );
}

// ── Showcase: Reph / R-fola Indicator ──
function RephShowcase() {
  return (
    <div className="showcase-card">
      <div className="showcase-card-title">রেফ / র-ফলা নির্দেশক</div>
      <div className="reph-demo-word">
        <span className="reph-marker">◌</span>প্রেম
      </div>
      <div className="reph-info">
        এই শব্দে র-ফলা আছে।<br />পড়ার সময় খেয়াল করুন।
      </div>
    </div>
  );
}

// ── Showcase: Level Selector ──
function LevelShowcase({ currentLevel, onLevelChange }) {
  return (
    <div className="showcase-card">
      <div className="showcase-card-title">শুরু থেকে উন্নত পর্যায়</div>
      <div className="level-grid">
        {DIFFICULTY_LEVELS.map(level => (
          <div
            key={level.id}
            className={`level-card ${currentLevel === level.id ? 'active' : ''}`}
            onClick={() => onLevelChange(level.id)}
          >
            <span className="level-card-label">{level.label}</span>
            <span className="level-card-sample">{level.desc}</span>
            <span className="level-stars">{'⭐'.repeat(level.stars)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const levelInfo = getLevelInfo(currentLevel);
  const isSingleWord = currentLevel === 'shuru';

  const handleWordTap = useCallback((word, wordData, wordIdx) => {
    setTappedWord({ word, wordData, wordIdx });
    setActiveIdx(wordIdx);
  }, []);

  const handlePrev = () => { if (currentItemIdx > 0) { setCurrentItemIdx(currentItemIdx - 1); setTappedWord(null); setActiveIdx(-1); } };
  const handleNext = () => { if (currentItemIdx < levelContent.length - 1) { setCurrentItemIdx(currentItemIdx + 1); setTappedWord(null); setActiveIdx(-1); } };
  const handleLevelChange = (levelId) => { setCurrentLevel(levelId); setCurrentItemIdx(0); setTappedWord(null); setActiveIdx(-1); };
  const handleAnalyze = () => { if (customText.trim()) setShowCustomResult(true); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--pref-bg-color)', transition: 'background 0.2s ease' }}>

      {/* ── Top Toolbar ── */}
      <header className="app-header">
        <div className="app-header-left">
          <button className="back-btn" aria-label="পেছনে যান" onClick={() => navigate('/')}>←</button>
          <div className="app-brand">
            <div className="app-brand-avatar">📖</div>
            <span className="app-brand-name">চলো পড়ি</span>
            <span className="app-brand-star">⭐</span>
          </div>
        </div>
        <div className="app-header-actions">
          <button className="header-btn" aria-label="শোনো">
            <span>🔊</span> <span>শোনো</span> <span>▶</span>
          </button>
          <button className="header-btn" aria-label="শব্দ ধরে ধরে">
            <span>➡</span> <span>শব্দ ধরে ধরে</span>
          </button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={togglePanel}
            className={`header-btn ${isPanelOpen ? 'active' : ''}`}
            aria-label="সেটিংস"
            aria-expanded={isPanelOpen}
          >
            <span>⚙️</span> <span>সেটিংস</span>
          </motion.button>
        </div>
      </header>

      {/* ── Level Tabs ── */}
      <div style={{
        display: 'flex', gap: '6px', padding: '10px 20px', maxWidth: '900px', margin: '0 auto',
        overflowX: 'auto', flexWrap: 'nowrap',
      }}>
        {DIFFICULTY_LEVELS.map(level => (
          <button
            key={level.id}
            onClick={() => handleLevelChange(level.id)}
            style={{
              padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
              border: currentLevel === level.id ? '2px solid #E06B2E' : '1.5px solid #E2D5C3',
              background: currentLevel === level.id ? '#FFF0E0' : '#fff',
              fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '13px',
              fontWeight: currentLevel === level.id ? 600 : 400,
              color: currentLevel === level.id ? '#E06B2E' : '#2D1B00',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {'⭐'.repeat(level.stars)} {level.label}
          </button>
        ))}
      </div>

      {/* ── Main Reading Area ── */}
      <main style={{ padding: '0 16px' }}>
        <div className="reading-main-area">
          {/* Level & item title */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
          }}>
            <span style={{
              background: '#FFF0E0', color: '#E06B2E', padding: '3px 10px',
              borderRadius: '12px', fontSize: '12px', fontWeight: 600,
              fontFamily: '"Noto Sans Bengali", sans-serif',
            }}>
              {levelInfo.label}
            </span>
            {currentItem.title && (
              <span style={{
                fontFamily: '"Noto Sans Bengali", sans-serif',
                fontSize: '13px', color: 'rgba(45,27,0,0.5)',
              }}>
                — {currentItem.title}
              </span>
            )}
          </div>

          {/* Text + Live Word Info Panel */}
          <div className="reading-text-section">
            <div className="reading-text-col">
              {/* Audio icon for the text */}
              <div style={{ marginBottom: '8px' }}>
                <button style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '24px', opacity: 0.6, transition: 'opacity 0.15s',
                }} aria-label="এই লেখাটি শুনুন">🔊</button>
              </div>

              <TextRenderer
                content={currentItem.text}
                activeWordIdx={activeIdx}
                onWordTap={handleWordTap}
                isSingleWord={isSingleWord}
              />
            </div>

            {/* Live Word Info Panel — shows decomposition when a word is tapped */}
            <AnimatePresence>
              {tappedWord ? (
                <motion.div
                  className="live-word-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <LiveWordInfoPanel
                    word={tappedWord.word}
                    wordData={tappedWord.wordData}
                    onClose={() => { setTappedWord(null); setActiveIdx(-1); }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  className="live-word-panel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div style={{
                    textAlign: 'center', padding: '20px',
                    color: 'rgba(45,27,0,0.35)',
                    fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '14px',
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>👆</div>
                    যেকোনো শব্দে ক্লিক করুন<br/>বিশ্লেষণ দেখতে
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Navigation Footer ── */}
        <div className="nav-footer">
          <button className="nav-btn" onClick={handlePrev} disabled={currentItemIdx === 0}>
            ← পূর্ববর্তী
          </button>
          <div style={{ flex: 1, margin: '0 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              flex: 1, height: '16px', background: '#E5E5E5',
              borderRadius: '8px', overflow: 'hidden', position: 'relative'
            }}>
              <motion.div
                initial={false}
                animate={{ width: `${((currentItemIdx + 1) / levelContent.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  background: 'var(--duo-green)', borderRadius: '8px',
                }}
              >
                {/* Glossy shine effect */}
                <div style={{
                  position: 'absolute', top: '2px', left: '8px', right: '8px',
                  height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px'
                }} />
              </motion.div>
            </div>
            <span className="nav-counter" style={{ flexShrink: 0, minWidth: '50px', textAlign: 'center' }}>
              {currentItemIdx + 1} / {levelContent.length}
            </span>
          </div>
          <button className="nav-btn" onClick={handleNext} disabled={currentItemIdx >= levelContent.length - 1}>
            পরবর্তী →
          </button>
        </div>

        {/* ── Single Word Decomposition (for shuru level) ── */}
        {isSingleWord && currentItem.text && (
          <div style={{ maxWidth: '900px', margin: '0 auto 16px', padding: '0 4px' }}>
            <WordDecompositionCard word={currentItem.text} />
          </div>
        )}

        {/* ── Custom Text Input ── */}
        <div className="custom-input-section">
          <div className="custom-input-card">
            <div className="custom-input-title">
              <span>✏️</span> নিজের লেখা বিশ্লেষণ করুন
            </div>
            <textarea
              className="custom-textarea"
              value={customText}
              onChange={(e) => { setCustomText(e.target.value); setShowCustomResult(false); }}
              placeholder="এখানে বাংলা শব্দ বা বাক্য লিখুন..."
            />
            <button className="custom-analyze-btn" onClick={handleAnalyze}>
              🔍 বিশ্লেষণ করুন
            </button>
            {showCustomResult && customText.trim() && (
              <div className="custom-result-area">
                <TextRenderer
                  content={customText}
                  activeWordIdx={-1}
                  onWordTap={handleWordTap}
                />
                {/* Word-level breakdown */}
                <div style={{ marginTop: '14px', borderTop: '1px solid #E2D5C3', paddingTop: '14px' }}>
                  <p style={{
                    fontFamily: '"Noto Sans Bengali", sans-serif',
                    fontSize: '13px', fontWeight: 600, color: '#E06B2E', marginBottom: '8px',
                  }}>শব্দ বিশ্লেষণ:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {customText.trim().split(/\s+/).filter(w => w.length > 0).map((w, i) => (
                      <WordDecompositionMini key={i} word={w.replace(/[।,!?]/g, '')} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ height: '40px' }} />
      </main>

      {/* ── Preferences Panel ── */}
      <PreferencesPanel />
    </div>
  );
}

// ── Word Decomposition Card (for single words at shuru level) ──
function WordDecompositionCard({ word }) {
  const decomp = decomposeWord(word);
  if (decomp.length <= 1 && !decomp[0]?.formula) return null;

  return (
    <div className="showcase-card" style={{ marginTop: '0' }}>
      <div className="showcase-card-title">শব্দ ভাঙন: {word}</div>
      <div className="showcase-decomp-row">
        <span style={{ fontSize: '28px', fontWeight: 700, fontFamily: '"Noto Sans Bengali"' }}>{word}</span>
        <span className="conjunct-equals">=</span>
        {decomp.map((d, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {i > 0 && <span className="conjunct-plus">+</span>}
            <div className={`showcase-decomp-box ${d.type === 'conjunct' ? 'conjunct' : ''}`}>
              <span className="showcase-decomp-char">{d.display}</span>
              <span className="showcase-decomp-label">{d.label}</span>
            </div>
          </span>
        ))}
      </div>
      {/* Conjunct details */}
      {decomp.filter(d => d.formula).map((d, i) => (
        <div key={i} style={{
          textAlign: 'center', marginTop: '8px', padding: '8px',
          background: '#FFF8E7', borderRadius: '8px',
          fontFamily: '"Noto Sans Bengali", sans-serif', fontSize: '14px',
        }}>
          <span style={{ color: '#E06B2E', fontWeight: 600 }}>{d.formula}</span>
          {d.vowelSign && (
            <span style={{ color: '#666', marginLeft: '8px' }}>+ {d.vowelSign} ({d.vowelSignName})</span>
          )}
        </div>
      ))}
      <div className="showcase-pron" style={{ marginTop: '10px' }}>
        <span>🔊</span>
        <span>উচ্চারণ: <strong>{word}</strong></span>
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
