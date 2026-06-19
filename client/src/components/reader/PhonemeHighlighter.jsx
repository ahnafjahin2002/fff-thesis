import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAudio as playBanglaAudio } from '../../utils/audio';

export default function PhonemeHighlighter({ onBack }) {
  return (
    <div className="phoneme-highlighter">
      <div className="phoneme-header">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="phoneme-back-btn"
        >
          ←
        </motion.button>
        <div className="phoneme-header-text">
          <h2 className="phoneme-title">অক্ষর অভ্যাস</h2>
          <p className="phoneme-subtitle">অক্ষর চিনি</p>
        </div>
        <motion.div
          className="phoneme-header-icon"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🔤
        </motion.div>
      </div>

      <div className="phoneme-letter-section">
        <LetterGrid />
      </div>
    </div>
  );
}

// ── Letter Grid Sub-component ──
function LetterGrid() {
  const [active, setActive] = useState(null);
  
  const swarabarna = [
    'অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ'
  ];
  const banjanbarna = [
    'ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ',
    'ট', 'ঠ', 'ড', 'ঢ', 'ণ', 'ত', 'থ', 'দ', 'ধ', 'ন',
    'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ',
    'স', 'হ', 'ড়', 'ঢ়', 'য়', 'ৎ', 'ং', 'ঃ', 'ঁ'
  ];
  
  const colors = ['#dbeeff','#fff3d4','#d9f5e5','#ede8ff','#ffe0e0'];

  const speakLetter = (letter) => {
    playBanglaAudio(letter, { playbackRate: 0.7 });
  };

  const renderLetter = (l, i) => (
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
  );

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1a2e1a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>স্বরবর্ণ</span>
        </h3>
        <div className="phoneme-letter-grid">
          {swarabarna.map((l, i) => renderLetter(l, i))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1a2e1a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>ব্যঞ্জনবর্ণ</span>
        </h3>
        <div className="phoneme-letter-grid">
          {banjanbarna.map((l, i) => renderLetter(l, i))}
        </div>
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
