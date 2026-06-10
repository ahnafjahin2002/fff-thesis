/**
 * Utility for playing text-to-speech audio using the Web Speech API.
 * Defaults to Bengali language if available.
 */

export function playAudio(text, onEnd) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'bn-BD'; // Bengali (Bangladesh)
  utterance.rate = 0.8; // Slightly slower for children
  utterance.pitch = 1.1; // Slightly higher pitch

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd; // Handle errors gracefully
  }

  window.speechSynthesis.speak(utterance);
}
