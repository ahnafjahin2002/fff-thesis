// client/src/pages/BornoBazar/Phase2Spelling.jsx

import { useState, useEffect, useRef } from "react";
import { PHASE2_WORDS, buildTilePool } from "../../data/words";
import "./Phase2Spelling.css";

export default function Phase2Spelling({ shopColor = "#18b368", onComplete, onBack }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [placedLetters, setPlacedLetters] = useState([]);
  const [tilePool, setTilePool] = useState([]);
  const [failureCount, setFailureCount] = useState(0);
  const [hintTileIndex, setHintTileIndex] = useState(null);
  const [wiggleTile, setWiggleTile] = useState(null);
  const [completedProducts, setCompletedProducts] = useState([]);
  const [celebrating, setCelebrating] = useState(false);
  const [wordSuccess, setWordSuccess] = useState(false);
  const [mascotState, setMascotState] = useState("wave"); // wave | celebrate | encourage
  const sessionTime = useRef(Date.now());

  const currentWord = PHASE2_WORDS[wordIndex];

  // Build tile pool when word changes
  useEffect(() => {
    if (!currentWord) return;
    setTilePool(buildTilePool(currentWord, sessionTime.current));
    setPlacedLetters([]);
    setFailureCount(0);
    setHintTileIndex(null);
    setWordSuccess(false);
  }, [wordIndex]);

  // Hint trigger after 2 failures
  useEffect(() => {
    if (failureCount >= 2) {
      const nextCorrectPos = placedLetters.length;
      const correctLetter = currentWord.letters[nextCorrectPos];
      const idx = tilePool.indexOf(correctLetter);
      setHintTileIndex(idx);
    }
  }, [failureCount]);

  function handleTileTap(tile, tileIdx) {
    const nextPos = placedLetters.length;
    if (nextPos >= currentWord.letters.length) return;

    const isCorrect = tile === currentWord.letters[nextPos];

    if (isCorrect) {
      const newPlaced = [...placedLetters, tile];
      setPlacedLetters(newPlaced);
      setHintTileIndex(null);
      setFailureCount(0);

      // Remove used tile from pool
      const newPool = [...tilePool];
      newPool.splice(tileIdx, 1);
      setTilePool(newPool);

      // Check if word complete
      if (newPlaced.length === currentWord.letters.length) {
        handleWordComplete(newPlaced);
      } else {
        setMascotState("encourage");
      }
    } else {
      // Wrong tile — wiggle
      setWiggleTile(tileIdx);
      setTimeout(() => setWiggleTile(null), 400);
      setFailureCount((f) => f + 1);
      setMascotState("encourage");
    }
  }

  function handleUndoLastTile() {
    if (placedLetters.length === 0) return;
    const removed = placedLetters[placedLetters.length - 1];
    setPlacedLetters((prev) => prev.slice(0, -1));
    setTilePool((prev) => [...prev, removed]);
    setHintTileIndex(null);
  }

  function handleWordComplete(placed) {
    setWordSuccess(true);
    setMascotState("celebrate");
    setTimeout(() => {
      setCompletedProducts((prev) => [...prev, currentWord]);
      // Move to next word or finish
      if (wordIndex + 1 < PHASE2_WORDS.length) {
        setWordIndex((i) => i + 1);
        setWordSuccess(false);
        setMascotState("wave");
      } else {
        // All products placed — celebrate!
        setCelebrating(true);
        setTimeout(() => {
          if (onComplete) onComplete(completedProducts.concat(currentWord));
        }, 2500);
      }
    }, 1200);
  }

  if (!currentWord) return null;

  return (
    <div className="phase2-container">
      {/* TOP BAR */}
      <div className="phase2-topbar">
        <button className="p2-back-btn" onClick={onBack}>
          ←
        </button>
        <span className="p2-shop-label">দোকান সাজাও</span>
        <div className="p2-progress-dots">
          {PHASE2_WORDS.slice(0, 3).map((_, i) => (
            <span
              key={i}
              className={`p2-dot ${i < completedProducts.length ? "filled" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* SHELF — completed products */}
      <div className="phase2-shelf">
        <div className="shelf-board">
          {completedProducts.map((p) => (
            <div key={p.id} className="shelf-item drop-in">
              <span className="shelf-emoji">{p.emoji}</span>
              <span className="shelf-label">{p.product}</span>
            </div>
          ))}
          {completedProducts.length === 0 && (
            <span className="shelf-empty-hint">তাকটি এখনও ফাঁকা...</span>
          )}
        </div>
      </div>

      {/* PRODUCT CLUE */}
      <div className="phase2-clue-area">
        <div className="clue-emoji">{currentWord.emoji}</div>
        <div className="clue-text">{currentWord.audioClue}</div>
        <button
          className="audio-btn"
          onClick={() => speakBengali(currentWord.audioClue)}
          aria-label="শুনুন"
        >
          🔊
        </button>
      </div>

      {/* WORD SLOTS */}
      <div className="phase2-slots">
        {currentWord.letters.map((_, i) => (
          <div
            key={i}
            className={`word-slot ${
              i < placedLetters.length ? "filled" : ""
            } ${i === placedLetters.length - 1 && wordSuccess ? "word-correct" : ""}`}
          >
            {placedLetters[i] || ""}
          </div>
        ))}
      </div>

      {/* TILE POOL */}
      <div className="phase2-tiles">
        <div className="tile-grid">
          {tilePool.map((tile, idx) => (
            <button
              key={`${tile}-${idx}`}
              className={`letter-tile
                ${wiggleTile === idx ? "wiggle" : ""}
                ${hintTileIndex === idx ? "hint-pulse" : ""}
              `}
              onClick={() => handleTileTap(tile, idx)}
              style={{ borderColor: shopColor }}
            >
              {tile}
            </button>
          ))}
        </div>

        {/* UNDO BUTTON */}
        <button className="undo-btn" onClick={handleUndoLastTile}>
          ↩ পূর্বে ফেরো
        </button>
      </div>

      {/* MASCOT */}
      <div className={`phase2-mascot mascot-${mascotState}`}>
        {mascotState === "celebrate" && (
          <div className="mascot-bubble">শাবাশ! 🌟</div>
        )}
        {mascotState === "encourage" && (
          <div className="mascot-bubble">আবার চেষ্টা করো!</div>
        )}
        <div className="mascot-emoji">
          {mascotState === "celebrate" ? "🧒🎉" : mascotState === "encourage" ? "🧒💪" : "🧒👋"}
        </div>
      </div>

      {/* CELEBRATION OVERLAY */}
      {celebrating && (
        <div className="celebration-overlay">
          <div className="celebration-text">
            🎉 দোকান তৈরি! এখন কাস্টমার আসবে! 🎉
          </div>
          <div className="celebration-stars">
            {"⭐".repeat(5)}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Bengali TTS via Web Speech API
function speakBengali(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "bn-BD";
  utter.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}