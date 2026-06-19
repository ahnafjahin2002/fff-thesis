export async function synthesizeBanglaTTS(text, voice = "female") {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
  
  try {
    const response = await fetch(`${baseUrl}/api/tts/synthesize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
      throw new Error(`TTS API failed with status ${response.status}`);
    }

    const data = await response.json();
    
    let fullAudioUrl = null;
    if (data.audioUrl) {
      fullAudioUrl = data.audioUrl.startsWith('http') 
        ? data.audioUrl 
        : `${baseUrl}${data.audioUrl}`;
    }

    return {
      fullAudioUrl: fullAudioUrl,
      durationMs: data.durationMs,
      source: data.source,
      cached: data.cached
    };
  } catch (error) {
    console.error("Error calling synthesizeBanglaTTS:", error);
    throw error;
  }
}
