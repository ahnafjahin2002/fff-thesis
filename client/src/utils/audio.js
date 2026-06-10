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

/**
 * Attempts to play high-quality native Bangla TTS via the local server.
 * Falls back to browser Web Speech API if the server fails.
 */
export async function playBanglaTTS(text, onEnd) {
  try {
    const response = await fetch('http://localhost:3001/api/tts/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speed: 1.0 })
    });

    if (!response.ok) throw new Error('TTS server error');

    const data = await response.json();

    if (data.audioUrl) {
      const audio = new Audio(`http://localhost:3001${data.audioUrl}`);
      if (onEnd) {
        audio.addEventListener('ended', onEnd);
        audio.addEventListener('error', () => {
          // If audio loading fails, fallback
          playAudio(text, onEnd);
        });
      }
      await audio.play();
      return;
    }

    // No audio URL returned, fallback
    playAudio(text, onEnd);

  } catch (err) {
    console.error('Failed to play native TTS, falling back:', err);
    playAudio(text, onEnd);
  }
}
