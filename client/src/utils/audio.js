import { synthesizeBanglaTTS } from './ttsApi';

let currentAudio = null;

/**
 * Stops any currently playing audio (backend or browser fallback).
 */
export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function fallbackToBrowserSpeech(text, onEnd, playbackRate = 1.0) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'bn-BD';
  utterance.rate = 0.8 * playbackRate; // Slightly slower for children, adjusted by playbackRate
  utterance.pitch = 1.1;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd; // Handle errors gracefully
  }

  window.speechSynthesis.speak(utterance);
}

async function playWithTTS(text, optionsOrOnEnd) {
  let onEnd = null;
  let playbackRate = 1.0;

  if (typeof optionsOrOnEnd === 'function') {
    onEnd = optionsOrOnEnd;
  } else if (optionsOrOnEnd && typeof optionsOrOnEnd === 'object') {
    onEnd = optionsOrOnEnd.onEnd;
    if (optionsOrOnEnd.playbackRate !== undefined) {
      playbackRate = optionsOrOnEnd.playbackRate;
    }
  }

  stopAudio();

  try {
    const result = await synthesizeBanglaTTS(text, "female");
    if (result && result.fullAudioUrl) {
      const audio = new Audio(result.fullAudioUrl);
      audio.playbackRate = playbackRate;
      currentAudio = audio;

      if (onEnd) {
        audio.onended = () => {
          if (currentAudio === audio) currentAudio = null;
          onEnd();
        };
        audio.onerror = () => {
          if (currentAudio === audio) currentAudio = null;
          onEnd();
        };
      } else {
        audio.onended = () => {
          if (currentAudio === audio) currentAudio = null;
        };
      }

      await audio.play();
      return;
    } else {
      throw new Error("No audio URL returned");
    }
  } catch (err) {
    console.warn("Backend TTS failed, falling back to browser SpeechSynthesis", err);
    fallbackToBrowserSpeech(text, onEnd, playbackRate);
  }
}

/**
 * Utility for playing text-to-speech audio.
 * Now defaults to local backend BanglaTTS with browser fallback.
 */
export function playAudio(text, optionsOrOnEnd) {
  playWithTTS(text, optionsOrOnEnd);
}

/**
 * Attempts to play high-quality native Bangla TTS via the local server.
 * Falls back to browser Web Speech API if the server fails.
 */
export async function playBanglaTTS(text, optionsOrOnEnd) {
  await playWithTTS(text, optionsOrOnEnd);
}
