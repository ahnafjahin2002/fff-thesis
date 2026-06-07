/**
 * PhonemeHighlighter.jsx
 * ──────────────────────────────────────────────────────
 * Full Phoneme Highlighting Engine UI.
 *
 * This is the main view that goes inside the "ফোনেমস" section
 * of the dashboard. It provides:
 *  - Text display area with per-phoneme highlighting
 *  - Play/Pause/Stop narration controls
 *  - Highlight color picker
 *  - Speed control
 *  - Tap-to-highlight individual words (works without audio)
 *  - Phoneme breakdown panel for selected word
 *  - Sample text selection & custom text input
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhonemeWord from './PhonemeWord';
import { segmentBanglaWord, segmentText } from '../../utils/phonemeUtils';
import { usePhoneme } from '../../hooks/usePhoneme';

// ── Sample texts for practice ──
const SAMPLE_TEXTS = [
  {
    id: 'simple',
    label: 'সহজ',
    emoji: '🌱',
    text: 'আমি বাংলা পড়তে ভালোবাসি। আকাশ নীল, মাঠ সবুজ।',
  },
  {
    id: 'medium',
    label: 'মধ্যম',
    emoji: '🌿',
    text: 'পাখি গান গায়। ফুল ফোটে বাগানে। প্রজাপতি উড়ে যায় আকাশে।',
  },
  {
    id: 'advanced',
    label: 'কঠিন',
    emoji: '🌳',
    text: 'ক্লান্ত পথিক বিশ্রাম নেয় গাছের ছায়ায়। প্রকৃতির সৌন্দর্য অপরূপ।',
  },
];

const COLOR_PRESETS = [
  { color: '#FFD700', label: 'সোনালী' },
  { color: '#58CC02', label: 'সবুজ' },
  { color: '#1CB0F6', label: 'নীল' },
  { color: '#FF9600', label: 'কমলা' },
  { color: '#FF4B8B', label: 'গোলাপী' },
  { color: '#CE82FF', label: 'বেগুনী' },
];

export default function PhonemeHighlighter({ onBack }) {
  const [selectedTextId, setSelectedTextId] = useState('simple');
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [tappedWordIdx, setTappedWordIdx] = useState(-1);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Get the active text
  const activeText = useCustom
    ? customText
    : SAMPLE_TEXTS.find(t => t.id === selectedTextId)?.text || '';

  // Segment the text into words with phonemes
  const segmentedWords = useMemo(() => segmentText(activeText), [activeText]);

  // Phoneme hook
  const {
    activeWordIndex,
    activePhonemeIndex,
    isPlaying,
    isPaused,
    highlightColor,
    speed,
    startNarration,
    stopNarration,
    togglePause,
    tapWord,
    setHighlightColor,
    setSpeed,
  } = usePhoneme(segmentedWords);

  // Determine the word currently being inspected (via tap or narration)
  const inspectedWordIdx = isPlaying ? activeWordIndex : tappedWordIdx;
  const inspectedWord = inspectedWordIdx >= 0 ? segmentedWords[inspectedWordIdx] : null;

  const handleWordTap = (idx) => {
    if (isPlaying) return;
    setTappedWordIdx(idx === tappedWordIdx ? -1 : idx);
    tapWord(idx, true);
  };

  return (
    <div className="phoneme-highlighter">
      {/* Header */}
      <div className="phoneme-header">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="phoneme-back-btn"
        >
          ←
        </motion.button>
        <div className="phoneme-header-text">
          <h2 className="phoneme-title">ফোনেম হাইলাইটার</h2>
          <p className="phoneme-subtitle">শব্দের প্রতিটি অংশ দেখো ও শোনো</p>
        </div>
        <motion.div
          className="phoneme-header-icon"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🔤
        </motion.div>
      </div>

      {/* Text Level Selector */}
      <div className="phoneme-section">
        <div className="phoneme-section-label">📚 পাঠ্য নির্বাচন</div>
        <div className="phoneme-level-grid">
          {SAMPLE_TEXTS.map(t => (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.95 }}
              className={`phoneme-level-btn ${!useCustom && selectedTextId === t.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedTextId(t.id);
                setUseCustom(false);
                stopNarration();
                setTappedWordIdx(-1);
              }}
            >
              <span className="phoneme-level-emoji">{t.emoji}</span>
              <span className="phoneme-level-label">{t.label}</span>
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`phoneme-level-btn ${useCustom ? 'active' : ''}`}
            onClick={() => {
              setUseCustom(true);
              stopNarration();
              setTappedWordIdx(-1);
            }}
          >
            <span className="phoneme-level-emoji">✏️</span>
            <span className="phoneme-level-label">নিজের</span>
          </motion.button>
        </div>

        {/* Custom Text Input */}
        <AnimatePresence>
          {useCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="phoneme-custom-input-wrap"
            >
              <textarea
                className="phoneme-custom-input"
                placeholder="তোমার নিজের বাংলা লেখা এখানে টাইপ করো..."
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                rows={3}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Text Display Area */}
      <div className="phoneme-display-card">
        <div className="phoneme-display-label">
          <span>💡 শব্দে ট্যাপ করো ফোনেম দেখতে</span>
          {isPlaying && (
            <motion.span
              className="phoneme-live-badge"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              ● লাইভ
            </motion.span>
          )}
        </div>
        <div className="phoneme-text-area">
          {segmentedWords.map((item, idx) => (
            <PhonemeWord
              key={`${item.word}-${idx}`}
              word={item.word}
              phonemes={item.phonemes}
              isActiveWord={activeWordIndex === idx || (!isPlaying && tappedWordIdx === idx)}
              activePhonemeIndex={
                activeWordIndex === idx
                  ? activePhonemeIndex
                  : tappedWordIdx === idx
                  ? activePhonemeIndex
                  : -1
              }
              highlightColor={highlightColor}
              dimmed={
                (isPlaying && activeWordIndex !== -1 && activeWordIndex !== idx) ||
                (!isPlaying && tappedWordIdx !== -1 && tappedWordIdx !== idx)
              }
              onClick={() => handleWordTap(idx)}
            />
          ))}
          {segmentedWords.length === 0 && (
            <div className="phoneme-empty">
              উপরে একটি পাঠ্য বেছে নাও বা নিজের লেখা টাইপ করো
            </div>
          )}
        </div>
      </div>

      {/* Phoneme Breakdown Panel */}
      <AnimatePresence>
        {inspectedWord && (
          <motion.div
            className="phoneme-breakdown-card"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <div className="phoneme-breakdown-header">
              <span className="phoneme-breakdown-title">🔍 ফোনেম ভাঙন</span>
              <span className="phoneme-breakdown-word">{inspectedWord.word}</span>
            </div>
            <div className="phoneme-breakdown-chips">
              {inspectedWord.phonemes.map((p, i) => (
                <motion.div
                  key={i}
                  className={`phoneme-chip ${
                    (activeWordIndex === inspectedWordIdx && activePhonemeIndex === i) ||
                    (!isPlaying && tappedWordIdx === inspectedWordIdx && activePhonemeIndex === i)
                      ? 'phoneme-chip--active'
                      : ''
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  style={{ '--chip-highlight': highlightColor }}
                >
                  <span className="phoneme-chip-text">{p}</span>
                  <span className="phoneme-chip-index">{i + 1}</span>
                </motion.div>
              ))}
            </div>
            <div className="phoneme-breakdown-formula">
              {inspectedWord.phonemes.join(' + ')} = {inspectedWord.word}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="phoneme-controls-card">
        {/* Play / Pause / Stop */}
        <div className="phoneme-controls-row">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`phoneme-ctrl-btn phoneme-ctrl-play ${isPlaying ? 'playing' : ''}`}
            onClick={() => {
              if (isPlaying) {
                togglePause();
              } else {
                setTappedWordIdx(-1);
                startNarration();
              }
            }}
            disabled={segmentedWords.length === 0}
          >
            {isPlaying
              ? isPaused
                ? '▶ চালাও'
                : '⏸ বিরতি'
              : '▶ পড়া শুরু'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="phoneme-ctrl-btn phoneme-ctrl-stop"
            onClick={() => {
              stopNarration();
              setTappedWordIdx(-1);
            }}
            disabled={!isPlaying}
          >
            ⏹
          </motion.button>
        </div>

        {/* Speed slider */}
        <div className="phoneme-speed-row">
          <span className="phoneme-speed-label">🐢</span>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="phoneme-speed-slider"
          />
          <span className="phoneme-speed-label">🐇</span>
          <span className="phoneme-speed-value">{speed.toFixed(2)}x</span>
        </div>

        {/* Highlight color */}
        <div className="phoneme-color-section">
          <button
            className="phoneme-color-toggle"
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <span
              className="phoneme-color-dot"
              style={{ background: highlightColor }}
            />
            হাইলাইট রং
            <span className="phoneme-color-arrow">{showColorPicker ? '▲' : '▼'}</span>
          </button>

          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                className="phoneme-color-grid"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {COLOR_PRESETS.map(c => (
                  <motion.button
                    key={c.color}
                    whileTap={{ scale: 0.85 }}
                    className={`phoneme-color-btn ${highlightColor === c.color ? 'active' : ''}`}
                    onClick={() => setHighlightColor(c.color)}
                  >
                    <span
                      className="phoneme-color-swatch"
                      style={{ background: c.color }}
                    />
                    <span className="phoneme-color-name">{c.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Letter Grid (original phoneme view, kept as sub-section) */}
      <div className="phoneme-letter-section">
        <div className="phoneme-section-label">🔠 অক্ষর অভ্যাস</div>
        <LetterGrid highlightColor={highlightColor} />
      </div>
    </div>
  );
}

// ── Letter Grid Sub-component ──
function LetterGrid({ highlightColor }) {
  const [active, setActive] = useState(null);
  const letters = [
    'অ','আ','ই','ঈ','উ','ঊ','ক','খ','গ','ঘ',
    'চ','ছ','জ','ঝ','ট','ঠ','ড','ঢ','ত','থ',
    'দ','ধ','ন','প','ফ','ব','ভ','ম','য','র',
    'ল','শ','ষ','স','হ',
  ];
  const colors = ['#dbeeff','#fff3d4','#d9f5e5','#ede8ff','#ffe0e0'];

  const speakLetter = (letter) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(letter);
    utt.lang = 'bn-BD';
    utt.rate = 0.7;
    synth.speak(utt);
  };

  return (
    <>
      <div className="phoneme-letter-grid">
        {letters.map((l, i) => (
          <motion.div
            key={l}
            whileTap={{ scale: 0.85 }}
            animate={{
              backgroundColor: active === l ? colors[i % 5] : 'white',
              scale: active === l ? 1.1 : 1,
            }}
            onClick={() => {
              setActive(active === l ? null : l);
              if (active !== l) speakLetter(l);
            }}
            className="phoneme-letter-cell"
          >
            {l}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="phoneme-letter-detail"
          >
            <div className="phoneme-letter-big">{active}</div>
            <div className="phoneme-letter-info">এই অক্ষরটি চেনো!</div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="phoneme-letter-speak-btn"
              onClick={() => speakLetter(active)}
            >
              🔊 আবার শোনো
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
