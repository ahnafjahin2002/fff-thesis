import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { synthesizeBanglaTTS } from '../utils/ttsApi';

const karList = [
  {
    name: 'আ-কার',
    symbol: 'া',
    vowel: 'আ',
    example: 'কা',
    fullExample: 'কাক',
    color: '#FF6B9D',
    bg: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
    lightBg: '#FFF0F5',
    borderColor: '#FF6B9D',
    description: 'ব্যঞ্জনবর্ণের ডানদিকে বসে',
  },
  {
    name: 'ই-কার',
    symbol: 'ি',
    vowel: 'ই',
    example: 'কি',
    fullExample: 'কিতাব',
    color: '#7C4DFF',
    bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    lightBg: '#F3F0FF',
    borderColor: '#7C4DFF',
    description: 'ব্যঞ্জনবর্ণের বামদিকে বসে',
  },
  {
    name: 'ঈ-কার',
    symbol: 'ী',
    vowel: 'ঈ',
    example: 'কী',
    fullExample: 'নদী',
    color: '#00BCD4',
    bg: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    lightBg: '#E8FAFF',
    borderColor: '#00BCD4',
    description: 'ব্যঞ্জনবর্ণের ডানদিকে বসে',
  },
  {
    name: 'উ-কার',
    symbol: 'ু',
    vowel: 'উ',
    example: 'কু',
    fullExample: 'কুকুর',
    color: '#FF7043',
    bg: 'linear-gradient(135deg, #FFD3A5 0%, #FD8075 100%)',
    lightBg: '#FFF3EE',
    borderColor: '#FF7043',
    description: 'ব্যঞ্জনবর্ণের নিচে বসে',
  },
  {
    name: 'ঊ-কার',
    symbol: 'ূ',
    vowel: 'ঊ',
    example: 'কূ',
    fullExample: 'ভূমি',
    color: '#E91E63',
    bg: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    lightBg: '#FDF0F8',
    borderColor: '#E91E63',
    description: 'ব্যঞ্জনবর্ণের নিচে বসে',
  },
  {
    name: 'ঋ-কার',
    symbol: 'ৃ',
    vowel: 'ঋ',
    example: 'কৃ',
    fullExample: 'কৃষক',
    color: '#43A047',
    bg: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
    lightBg: '#EDFFF4',
    borderColor: '#43A047',
    description: 'ব্যঞ্জনবর্ণের নিচে বসে',
  },
  {
    name: 'এ-কার',
    symbol: 'ে',
    vowel: 'এ',
    example: 'কে',
    fullExample: 'কেউ',
    color: '#1565C0',
    bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    lightBg: '#EAF4FF',
    borderColor: '#1565C0',
    description: 'ব্যঞ্জনবর্ণের বামদিকে বসে',
  },
  {
    name: 'ঐ-কার',
    symbol: 'ৈ',
    vowel: 'ঐ',
    example: 'কৈ',
    fullExample: 'বৈশাখ',
    color: '#6D4C41',
    bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    lightBg: '#FFF8EE',
    borderColor: '#6D4C41',
    description: 'ব্যঞ্জনবর্ণের বামদিকে বসে',
  },
  {
    name: 'ও-কার',
    symbol: 'ো',
    vowel: 'ও',
    example: 'কো',
    fullExample: 'কোলাহল',
    color: '#00796B',
    bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    lightBg: '#EAFFF8',
    borderColor: '#00796B',
    description: 'ব্যঞ্জনবর্ণের দুই পাশে বসে',
  },
  {
    name: 'ঔ-কার',
    symbol: 'ৌ',
    vowel: 'ঔ',
    example: 'কৌ',
    fullExample: 'কৌতূহল',
    color: '#8E24AA',
    bg: 'linear-gradient(135deg, #C471F5 0%, #FA71CD 100%)',
    lightBg: '#FBF0FF',
    borderColor: '#8E24AA',
    description: 'ব্যঞ্জনবর্ণের দুই পাশে বসে',
  },
];

export default function KarChihnoView({ onBack }) {
  const [selectedKar, setSelectedKar] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingTarget, setPlayingTarget] = useState(null);
  const audioRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setPlayingTarget(null);
  };

  const playTTS = async (text, targetId) => {
    if (isPlaying && playingTarget === targetId) {
      stopAudio();
      return;
    }
    stopAudio();
    setIsPlaying(true);
    setPlayingTarget(targetId);
    try {
      const result = await synthesizeBanglaTTS(text, 'female');
      if (result && result.fullAudioUrl) {
        const audio = new Audio(result.fullAudioUrl);
        audioRef.current = audio;
        audio.onended = () => { setIsPlaying(false); setPlayingTarget(null); };
        await audio.play();
      } else {
        throw new Error('No audio URL');
      }
    } catch {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      utterance.onend = () => { setIsPlaying(false); setPlayingTarget(null); };
      window.speechSynthesis.speak(utterance);
    }
  };

  const closePopup = () => {
    stopAudio();
    setSelectedKar(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f0faf4 0%, #e8f4ff 50%, #fdf0ff 100%)',
        fontFamily: "'Hind Siliguri', sans-serif",
        padding: '28px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #FF9A9E55, transparent)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, #89f7fe55, transparent)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{ position: 'absolute', top: '40%', left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, #C471F555, transparent)' }}
        />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          style={{
            width: 50, height: 50, borderRadius: 17, border: 'none',
            background: 'white', cursor: 'pointer', fontSize: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          ←
        </motion.button>

        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: 27, fontWeight: 900, color: '#1a2e1a', lineHeight: 1.2 }}
          >
            🔤 কার চিহ্ন
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 14, color: '#4a7a5a', fontWeight: 600, marginTop: 3 }}
          >
            স্বরচিহ্ন শিখি — ১০ টি কার
          </motion.div>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          background: 'white', borderRadius: 20, padding: '16px 22px', marginBottom: 28,
          boxShadow: '0 4px 18px rgba(0,0,0,.07)',
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'relative', zIndex: 1,
          borderLeft: '5px solid #18b368',
        }}
      >
        <div style={{ fontSize: 36 }}>💡</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1d2b2a', marginBottom: 3 }}>কার কী?</div>
          <div style={{ fontSize: 13, color: '#687076', lineHeight: 1.6 }}>
            স্বরবর্ণের সংক্ষিপ্ত রূপকে <strong>কার</strong> বলে। ব্যঞ্জনবর্ণের সাথে যুক্ত হয়ে শব্দ তৈরি করে।
          </div>
        </div>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 16,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {karList.map((kar, i) => (
          <motion.div
            key={kar.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedKar(kar)}
            style={{
              aspectRatio: '1', borderRadius: 24, cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,.06)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: 'white', color: kar.color,
              border: `4px solid ${kar.borderColor}`,
              fontSize: 60, fontWeight: 900,
              fontFamily: "'Hind Siliguri', sans-serif"
            }}
          >
            {'\u00A0'}{kar.symbol}
          </motion.div>
        ))}
      </div>

      {/* Detail Popup */}
      <AnimatePresence>
        {selectedKar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000,
              display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20,
              backdropFilter: 'blur(8px)',
            }}
            onClick={closePopup}
          >
            <motion.div
              initial={{ scale: 0.4, y: 60, rotate: -8 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.4, y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 16, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 420, background: 'white',
                borderRadius: 36, padding: '36px 32px 32px',
                boxShadow: '0 24px 64px rgba(0,0,0,.22)',
                position: 'relative', overflow: 'hidden',
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              {/* Gradient blob decoration */}
              <div
                style={{
                  position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                  borderRadius: '50%', background: `${selectedKar.color}18`, pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute', bottom: -40, left: -40, width: 140, height: 140,
                  borderRadius: '50%', background: `${selectedKar.color}12`, pointerEvents: 'none',
                }}
              />

              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={closePopup}
                style={{
                  position: 'absolute', top: 18, right: 18, width: 38, height: 38,
                  borderRadius: '50%', border: 'none', background: '#f1f5f9', color: '#64748b',
                  fontSize: 18, cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                }}
              >
                ✕
              </motion.button>

              {/* Vowel badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 13, fontWeight: 700, color: selectedKar.color,
                    background: selectedKar.lightBg, padding: '5px 14px', borderRadius: 50,
                    border: `2px solid ${selectedKar.color}33`,
                  }}
                >
                  {selectedKar.vowel} থেকে
                </div>
                <div style={{ flex: 1, height: 2, background: `${selectedKar.color}22`, borderRadius: 4 }} />
              </div>

              {/* Name */}
              <div style={{ fontSize: 26, fontWeight: 900, color: '#1d2b2a', marginBottom: 20 }}>
                {selectedKar.name}
              </div>

              {/* Symbol + Example showcase */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    flex: 1, background: 'white', borderRadius: 24,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    alignItems: 'center', border: `4px solid ${selectedKar.borderColor || selectedKar.color}`,
                    boxShadow: '0 6px 16px rgba(0,0,0,.06)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      fontSize: 90, fontWeight: 900, lineHeight: 1.3,
                      color: selectedKar.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '100%', height: '100%'
                    }}
                  >
                    {'\u00A0'}{selectedKar.symbol}
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  style={{
                    flex: 1, background: selectedKar.lightBg, borderRadius: 22,
                    padding: '20px 12px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 8, border: `2px solid ${selectedKar.color}33`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: selectedKar.color, textTransform: 'uppercase', letterSpacing: 1 }}>উদাহরণ</div>
                  <div
                    style={{
                      fontSize: 60, fontWeight: 900, lineHeight: 1.2,
                      background: selectedKar.bg,
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {selectedKar.example}
                  </div>
                </motion.div>
              </div>

              {/* Description */}
              <div
                style={{
                  background: '#f8fafc', borderRadius: 16, padding: '14px 18px', marginBottom: 18,
                  fontSize: 14, color: '#4a5568', lineHeight: 1.7,
                  borderLeft: `4px solid ${selectedKar.color}`,
                }}
              >
                📌 <strong>{selectedKar.description}</strong>
                <div style={{ marginTop: 10, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  উদাহরণ শব্দ: <span style={{ fontWeight: 800, color: selectedKar.color, fontSize: 28 }}>{selectedKar.fullExample}</span>
                </div>
              </div>

              {/* Formula row: ক + কার = syllable */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  marginBottom: 24, padding: '14px 18px',
                  background: selectedKar.lightBg, borderRadius: 16,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#1d2b2a', lineHeight: 1 }}>ক</div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>ব্যঞ্জন</div>
                </div>
                <span style={{ fontSize: 22, color: '#687076', fontWeight: 700 }}>+</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: selectedKar.color, lineHeight: 1 }}>{'\u00A0'}{selectedKar.symbol}</div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>কার</div>
                </div>
                <span style={{ fontSize: 22, color: '#687076', fontWeight: 700 }}>=</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: '#1d2b2a', lineHeight: 1 }}>{selectedKar.example}</div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>সিলেবল</div>
                </div>
              </div>

              {/* TTS Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => playTTS(selectedKar.name, 'name')}
                  style={{
                    flex: 1, padding: '14px 10px', borderRadius: 50, border: 'none',
                    background: isPlaying && playingTarget === 'name' ? '#0f9055' : '#18b368',
                    color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(24,179,104,.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: "'Hind Siliguri', sans-serif",
                  }}
                >
                  {isPlaying && playingTarget === 'name' ? '🔊 শুনছে...' : '🔊 নাম শুনো'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => playTTS(selectedKar.fullExample, 'word')}
                  style={{
                    flex: 1, padding: '14px 10px', borderRadius: 50, border: 'none',
                    background: isPlaying && playingTarget === 'word' ? '#c07000' : '#f5a623',
                    color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(245,166,35,.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: "'Hind Siliguri', sans-serif",
                  }}
                >
                  {isPlaying && playingTarget === 'word' ? '🔊 শুনছে...' : '🔊 শব্দ শুনো'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
