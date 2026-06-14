/**
 * usePhoneme.js
 * ─────────────────────────────────────────────────
 * Custom hook that connects TTS narration to
 * word-by-word and phoneme-by-phoneme highlighting.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { estimatePhonemeDuration } from '../utils/phonemeUtils';

const cleanSpeechText = (text = '') =>
  text.replace(/[।,!?;:\-–—"'()\[\]]/g, '').trim();

export function usePhoneme(words = [], options = {}) {
  const { onWordChange, onPhonemeChange, onEnd } = options;

  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [activePhonemeIndex, setActivePhonemeIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#FFD700');
  const [speed, setSpeed] = useState(0.85);

  const timerRef = useRef(null);
  const utteranceRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const playingRef = useRef(false);

  const stopNarration = useCallback(() => {
    playingRef.current = false;

    setIsPlaying(false);
    setIsPaused(false);
    setActiveWordIndex(-1);
    setActivePhonemeIndex(-1);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  useEffect(() => {
    return () => {
      stopNarration();
    };
  }, [stopNarration]);

  const animatePhonemes = useCallback(
    (wordIdx, onComplete) => {
      const currentWord = words[wordIdx];

      if (!currentWord) {
        onComplete?.();
        return;
      }

      const phonemes = currentWord.phonemes || [];
      let pIdx = 0;

      const nextPhoneme = () => {
        if (!playingRef.current) return;

        if (pIdx >= phonemes.length) {
          onComplete?.();
          return;
        }

        setActivePhonemeIndex(pIdx);
        onPhonemeChange?.(phonemes[pIdx], pIdx, wordIdx);

        const duration = estimatePhonemeDuration(
          phonemes[pIdx],
          Math.max(170, 320 / speed)
        );

        pIdx += 1;
        timerRef.current = setTimeout(nextPhoneme, duration);
      };

      nextPhoneme();
    },
    [words, speed, onPhonemeChange]
  );

  const startNarration = useCallback(() => {
    if (!words.length) return;

    if (synthRef.current) synthRef.current.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    setIsPlaying(true);
    setIsPaused(false);
    playingRef.current = true;

    let wIdx = 0;

    const processWord = () => {
      if (!playingRef.current || wIdx >= words.length) {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveWordIndex(-1);
        setActivePhonemeIndex(-1);
        playingRef.current = false;
        onEnd?.();
        return;
      }

      const currentWord = words[wIdx];
      const wordText = cleanSpeechText(currentWord.word);

      setActiveWordIndex(wIdx);
      setActivePhonemeIndex(-1);
      onWordChange?.(currentWord, wIdx);

      const finishCurrentWord = () => {
        if (!playingRef.current) return;
        wIdx += 1;
        timerRef.current = setTimeout(processWord, Math.max(80, 160 / speed));
      };

      if (synthRef.current && wordText) {
        const utt = new SpeechSynthesisUtterance(wordText);
        utt.lang = 'bn-BD';
        utt.rate = speed;
        utteranceRef.current = utt;

        animatePhonemes(wIdx);

        utt.onend = finishCurrentWord;
        utt.onerror = finishCurrentWord;

        synthRef.current.speak(utt);
      } else {
        animatePhonemes(wIdx, finishCurrentWord);
      }
    };

    processWord();
  }, [words, speed, animatePhonemes, onWordChange, onEnd]);

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

  const tapWord = useCallback(
    (wordIdx, withAudio = false) => {
      if (isPlaying) return;

      if (timerRef.current) clearTimeout(timerRef.current);

      const currentWord = words[wordIdx];
      if (!currentWord) return;

      setActiveWordIndex(wordIdx);
      setActivePhonemeIndex(-1);
      onWordChange?.(currentWord, wordIdx);

      playingRef.current = true;

      const wordText = cleanSpeechText(currentWord.word);

      if (withAudio && synthRef.current && wordText) {
        const utt = new SpeechSynthesisUtterance(wordText);
        utt.lang = 'bn-BD';
        utt.rate = speed;
        synthRef.current.speak(utt);
      }

      const phonemes = currentWord.phonemes || [];
      let pIdx = 0;

      const nextPhoneme = () => {
        if (pIdx >= phonemes.length) {
          timerRef.current = setTimeout(() => {
            setActivePhonemeIndex(-1);
            playingRef.current = false;
          }, 450);
          return;
        }

        setActivePhonemeIndex(pIdx);
        onPhonemeChange?.(phonemes[pIdx], pIdx, wordIdx);

        const duration = estimatePhonemeDuration(phonemes[pIdx], 320 / speed);
        pIdx += 1;
        timerRef.current = setTimeout(nextPhoneme, duration);
      };

      nextPhoneme();
    },
    [words, isPlaying, speed, onWordChange, onPhonemeChange]
  );

  return {
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
  };
}