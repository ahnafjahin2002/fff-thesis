/**
 * ConjunctExpander.jsx
 * ---------------------
 * White card popup showing conjunct letter breakdown.
 * Redesigned to be child-friendly with clean white background.
 *
 * Example display for ন্ন:
 *   যুক্তবর্ণ ভাঙন  ✕
 *   ন্ন
 *   = [ ন ] + [ ন ]
 *   উচ্চারণ: ন্ন 🔊
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decomposeWord } from '../../utils/banglaUtils';

export default function ConjunctExpander({ word, parts, isOpen, onClose }) {
  const popupRef = useRef(null);

  // Get decomposition data
  const decomposition = decomposeWord(word);

  // Find conjunct clusters in the word
  const conjunctClusters = decomposition.filter(d => d.type === 'conjunct');

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popupRef}
          className="conjunct-card"
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.94 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          role="tooltip"
          aria-label={`যুক্তবর্ণ বিশ্লেষণ: ${word}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          <div className="conjunct-card-arrow" />

          {/* Header */}
          <div className="conjunct-card-header">
            <span className="conjunct-card-title">যুক্তবর্ণ ভাঙন</span>
            <button className="conjunct-card-close" onClick={onClose} aria-label="বন্ধ করুন">✕</button>
          </div>

          {/* For each conjunct cluster found */}
          {conjunctClusters.length > 0 ? (
            conjunctClusters.map((cluster, idx) => (
              <div key={idx} style={{ marginBottom: idx < conjunctClusters.length - 1 ? '14px' : 0 }}>
                {/* Big conjunct display */}
                <div className="conjunct-card-body">
                  <span className="conjunct-big">{cluster.conjunctDisplay}</span>
                </div>

                {/* Formula: = [ ন ] + [ ন ] */}
                <div className="conjunct-formula">
                  <span className="conjunct-equals">=</span>
                  {cluster.components.map((comp, cIdx) => (
                    <span key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {cIdx > 0 && <span className="conjunct-plus">+</span>}
                      <div className="conjunct-part-box">
                        <span className="conjunct-part-char">{comp}</span>
                      </div>
                    </span>
                  ))}
                </div>

                {/* Vowel sign info if present */}
                {cluster.vowelSign && (
                  <div style={{
                    textAlign: 'center', marginTop: '8px',
                    fontFamily: '"Noto Sans Bengali", sans-serif',
                    fontSize: '11px', color: '#888'
                  }}>
                    + {cluster.vowelSign} ({cluster.vowelSignName})
                  </div>
                )}
              </div>
            ))
          ) : (
            // Fallback: show full word decomposition
            <div>
              <div className="conjunct-card-body">
                <span className="conjunct-big">{word}</span>
              </div>
              <div className="conjunct-formula">
                {decomposition.map((d, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {i > 0 && <span className="conjunct-plus">+</span>}
                    <div className="conjunct-part-box">
                      <span className="conjunct-part-char">{d.display}</span>
                    </div>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pronunciation */}
          <div className="conjunct-pronunciation">
            <span className="conjunct-pron-text">উচ্চারণ: {word}</span>
            <button className="conjunct-pron-btn" aria-label="উচ্চারণ শুনুন">🔊</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
