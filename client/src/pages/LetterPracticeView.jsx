import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { synthesizeBanglaTTS } from "../utils/ttsApi";

export default function LetterPracticeView({ onBack }) {
  const [selectedType, setSelectedType] = useState(null); // 'shorborno' or 'benjonborno'
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const shorborno = ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ"];
  const benjonborno = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ", "স", "হ", "ড়", "ঢ়", "য়", "ৎ", "ং", "ঃ", "ঁ"];

  const letters = selectedType === "shorborno" ? shorborno : benjonborno;
  const colors = ["#d4f3e3", "#fff3d4", "#f0efff", "#ffe0f0", "#e8f4ff"];

  const closePopup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSelectedLetter(null);
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={() => {
            if (selectedLetter) setSelectedLetter(null);
            else if (selectedType) setSelectedType(null);
            else onBack();
          }} 
          style={{ width: 48, height: 48, borderRadius: 16, border: "none", background: "white", cursor: "pointer", fontSize: 20, boxShadow: "0 4px 14px rgba(0,0,0,0.08)", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          ←
        </motion.button>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1d2b2a", margin: 0 }}>
          {selectedType === "shorborno" ? "স্বরবর্ণ" : selectedType === "benjonborno" ? "ব্যঞ্জনবর্ণ" : "অক্ষর অভ্যাস"}
        </h2>
      </div>

      {!selectedType ? (
        // Category Selection
        <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", marginTop: "10vh" }}>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType("shorborno")}
            style={{
              width: "100%", maxWidth: 400, background: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)",
              borderRadius: 30, padding: "40px 30px", cursor: "pointer", boxShadow: "0 10px 30px rgba(255, 154, 158, 0.3)",
              display: "flex", flexDirection: "column", alignItems: "center", border: "4px solid white"
            }}
          >
            <div style={{ fontSize: 60, marginBottom: 10 }}>অ</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#a01a35" }}>স্বরবর্ণ</div>
            <div style={{ fontSize: 16, color: "#c82649", marginTop: 8, fontWeight: 600 }}>১১ টি অক্ষর</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType("benjonborno")}
            style={{
              width: "100%", maxWidth: 400, background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
              borderRadius: 30, padding: "40px 30px", cursor: "pointer", boxShadow: "0 10px 30px rgba(161, 140, 209, 0.3)",
              display: "flex", flexDirection: "column", alignItems: "center", border: "4px solid white"
            }}
          >
            <div style={{ fontSize: 60, marginBottom: 10 }}>ক</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#4a3285" }}>ব্যঞ্জনবর্ণ</div>
            <div style={{ fontSize: 16, color: "#6e4bc4", marginTop: 8, fontWeight: 600 }}>৩৯ টি অক্ষর</div>
          </motion.div>
        </div>
      ) : (
        // Letter Grid
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 16 }}
        >
          {letters.map((l, i) => (
            <motion.div 
              key={l} 
              whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }} 
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedLetter(l)}
              style={{ 
                aspectRatio: "1", borderRadius: 24, display: "flex", justifyContent: "center", alignItems: "center", 
                fontSize: 40, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 16px rgba(0,0,0,0.06)", 
                background: "white", color: "#2d3748", border: `4px solid ${colors[i % colors.length]}` 
              }}
            >
              {l}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pop-up for selected letter */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
              background: "rgba(0,0,0,0.6)", zIndex: 1000, 
              display: "flex", justifyContent: "center", alignItems: "center", padding: 20,
              backdropFilter: "blur(5px)"
            }}
            onClick={closePopup}
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50, rotate: -5 }} 
              animate={{ scale: 1, y: 0, rotate: 0 }} 
              exit={{ scale: 0.5, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 350, aspectRatio: "1",
                background: "linear-gradient(135deg, #ffffff 0%, #f0f7f4 100%)", 
                borderRadius: 40, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                boxShadow: "0 20px 50px rgba(0,0,0,0.2)", position: "relative",
                border: "8px solid white"
              }}
            >
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={closePopup}
                style={{ 
                  position: "absolute", top: 15, right: 15, width: 40, height: 40, borderRadius: "50%", 
                  border: "none", background: "#f1f5f9", color: "#64748b", fontSize: 20, 
                  cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                }}
              >
                ✕
              </motion.button>

              <motion.div 
                animate={{ y: [-5, 5, -5] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                style={{ 
                  fontSize: 140, fontWeight: 900, 
                  background: "linear-gradient(135deg, #18b368 0%, #0a6e3a 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0px 4px 6px rgba(24,179,104,0.3))",
                  lineHeight: 1
                }}
              >
                {selectedLetter}
              </motion.div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }} 
                onClick={async () => {
                  if (isPlaying) return;
                  setIsPlaying(true);
                  try {
                    const result = await synthesizeBanglaTTS(selectedLetter, "female");
                    if (result && result.fullAudioUrl) {
                      const audio = new Audio(result.fullAudioUrl);
                      audioRef.current = audio;
                      audio.onended = () => setIsPlaying(false);
                      await audio.play();
                    } else {
                      throw new Error("No audio URL");
                    }
                  } catch (err) {
                    console.error("TTS error:", err);
                    const utterance = new SpeechSynthesisUtterance(selectedLetter);
                    utterance.lang = 'bn-BD';
                    utterance.onend = () => setIsPlaying(false);
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                style={{ 
                  marginTop: 30, padding: "14px 36px", borderRadius: 50, border: "none", 
                  background: isPlaying ? "#0f9055" : "#18b368", color: "white", fontWeight: 800, fontSize: 18, 
                  cursor: isPlaying ? "default" : "pointer", boxShadow: "0 8px 20px rgba(24,179,104,0.3)",
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: isPlaying ? 0.8 : 1
                }}
              >
                {isPlaying ? "🔊 পড়ছে..." : "🔊 শুনো"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
