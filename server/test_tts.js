fetch("http://localhost:3002/api/tts/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "আমি বাংলায় কথা বলতে পারি।", voice: "female" })
}).then(res => res.json()).then(console.log).catch(console.error);
