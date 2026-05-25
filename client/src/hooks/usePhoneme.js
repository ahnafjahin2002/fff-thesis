/**
 * usePhoneme.js
 * ─────────────────────────────────────────────────
 * Custom hook that connects TTS (Speech Synthesis) events
 * to phoneme highlighting index.
 *
 * Features:
 *  - Manages which word and which phoneme within that word is active
 *  - Uses SpeechSynthesisUtterance boundary events for sync
 *  - Falls back to timer-based highlighting when boundary events unavailable
 *  - Supports play, pause, stop, and manual word tap
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { estimatePhonemeDuration } from '../utils/phonemeUtils';

export function usePhoneme(words = []) {
  // words: Array<{ word: string, phonemes: string[] }>

  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [activePhonemeIndex, setActivePhonemeIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#FFD700');
  const [speed, setSpeed] = useState(0.85);

  const timerRef = useRef(null);
  const utteranceRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const wordIndexRef = useRef(-1);
  const phonemeIndexRef = useRef(-1);
  const playingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNarration();
    };
  }, []);

  /**
   * Animate phonemes for a single word using timers
   */
  const animatePhonemes = useCallback((wordIdx, onComplete) => {
    if (!words[wordIdx]) {
      onComplete?.();
      return;
    }

    const phonemes = words[wordIdx].phonemes;
    let pIdx = 0;

    const nextPhoneme = () => {
      if (!playingRef.current) return;

      if (pIdx >= phonemes.length) {
        onComplete?.();
        return;
      }

      setActivePhonemeIndex(pIdx);
      phonemeIndexRef.current = pIdx;

      const duration = estimatePhonemeDuration(phonemes[pIdx], 300 / speed);
      pIdx++;

      timerRef.current = setTimeout(nextPhoneme, duration);
    };

    nextPhoneme();
  }, [words, speed]);

  /**
   * Start narration — highlights words one by one, phonemes within each
   */
  const startNarration = useCallback(() => {
    if (words.length === 0) return;

    // Cancel any existing
    if (synthRef.current) synthRef.current.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    setIsPlaying(true);
    setIsPaused(false);
    playingRef.current = true;

    let wIdx = 0;

    const processWord = () => {
      if (!playingRef.current || wIdx >= words.length) {
        // Done
        setIsPlaying(false);
        setActiveWordIndex(-1);
        setActivePhonemeIndex(-1);
        playingRef.current = false;
        wordIndexRef.current = -1;
        phonemeIndexRef.current = -1;
        return;
      }

      setActiveWordIndex(wIdx);
      wordIndexRef.current = wIdx;

      // Speak the word using TTS
      const wordText = words[wIdx].word.replace(/[।,!?;:\-–—"'()\[\]]/g, '');
      if (synthRef.current && wordText.trim()) {
        const utt = new SpeechSynthesisUtterance(wordText);
        utt.lang = 'bn-BD';
        utt.rate = speed;
        utteranceRef.current = utt;

        // We use timer-based phoneme animation in parallel with TTS
        // since boundary events are unreliable for Bangla
        animatePhonemes(wIdx, () => {
          // Phoneme animation done for this word
        });

        utt.onend = () => {
          if (!playingRef.current) return;
          wIdx++;
          // Small gap between words
          timerRef.current = setTimeout(processWord, 150);
        };

        utt.onerror = () => {
          if (!playingRef.current) return;
          wIdx++;
          timerRef.current = setTimeout(processWord, 150);
        };

        synthRef.current.speak(utt);
      } else {
        // No TTS available — just use timer
        animatePhonemes(wIdx, () => {
          if (!playingRef.current) return;
          wIdx++;
          timerRef.current = setTimeout(processWord, 150);
        });
      }
    };

    processWord();
  }, [words, speed, animatePhonemes]);

  /**
   * Stop narration completely
   */
  const stopNarration = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setActiveWordIndex(-1);
    setActivePhonemeIndex(-1);
    wordIndexRef.current = -1;
    phonemeIndexRef.current = -1;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  /**
   * Pause / Resume
   */
  const togglePause = useCallback(() => {
    if (!isPlaying) return;

    if (isPaused) {
      setIsPaused(false);
      if (synthRef.current) synthRef.current.resume();
    } else {
      setIsPaused(true);
      if (synthRef.current) synthRef.current.pause();
    }
  }, [isPlaying, isPaused]);

  /**
   * Manual tap on a word — highlight phonemes without audio
   * (or with audio if desired)
   */
  const tapWord = useCallback((wordIdx, withAudio = false) => {
    if (isPlaying) return; // Don't interrupt narration

    // Clear any previous tap animation
    if (timerRef.current) clearTimeout(timerRef.current);

    setActiveWordIndex(wordIdx);
    wordIndexRef.current = wordIdx;
    playingRef.current = true;

    const phonemes = words[wordIdx]?.phonemes || [];

    if (withAudio && synthRef.current) {
      const wordText = words[wordIdx].word.replace(/[।,!?;:\-–—"'()\[\]]/g, '');
      const utt = new SpeechSynthesisUtterance(wordText);
      utt.lang = 'bn-BD';
      utt.rate = speed;
      synthRef.current.speak(utt);
    }

    // Animate phonemes
    let pIdx = 0;
    const nextPhoneme = () => {
      if (pIdx >= phonemes.length) {
        // Keep last phoneme highlighted briefly, then reset
        timerRef.current = setTimeout(() => {
          setActiveWordIndex(-1);
          setActivePhonemeIndex(-1);
          playingRef.current = false;
        }, 500);
        return;
      }

      setActivePhonemeIndex(pIdx);
      const duration = estimatePhonemeDuration(phonemes[pIdx], 400);
      pIdx++;
      timerRef.current = setTimeout(nextPhoneme, duration);
    };

    nextPhoneme();
  }, [words, isPlaying, speed]);

  return {
    // State
    activeWordIndex,
    activePhonemeIndex,
    isPlaying,
    isPaused,
    highlightColor,
    speed,

    // Actions
    startNarration,
    stopNarration,
    togglePause,
    tapWord,
    setHighlightColor,
    setSpeed,
  };
}
