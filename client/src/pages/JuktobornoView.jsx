import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JuktobornoView({ onBack }) {
  const [active, setActive] = useState(null);
  const juktobornoList = [
    { char: "ক্ক", breakdown: "ক + ক", examples: "ছক্কা, আক্কেল" }, { char: "ক্ট", breakdown: "ক + ট", examples: "ডক্টর, অক্টোবর" },
    { char: "ক্ত", breakdown: "ক + ত", examples: "রক্ত, শক্ত, ভক্ত" }, { char: "ক্ব", breakdown: "ক + ব", examples: "পক্ব, পরিপক্ব" },
    { char: "ক্ম", breakdown: "ক + ম", examples: "রুক্মিণী" }, { char: "ক্য", breakdown: "ক + য-ফলা", examples: "বাক্য, ঐক্য" },
    { char: "ক্র", breakdown: "ক + র-ফলা", examples: "বক্র, চক্র" }, { char: "ক্ল", breakdown: "ক + ল", examples: "ক্লান্ত, ক্লাস" },
    { char: "ক্ষ", breakdown: "ক + ষ", examples: "ক্ষমা, ক্ষতি, শিক্ষা" }, { char: "ক্ষ্ণ", breakdown: "ক + ষ + ণ", examples: "তীক্ষ্ণ" },
    { char: "ক্ষ্ম", breakdown: "ক + ষ + ম", examples: "লক্ষ্মী, যক্ষ্মা" }, { char: "গ্ধ", breakdown: "গ + ধ", examples: "মুগ্ধ, দগ্ধ" },
    { char: "গ্ন", breakdown: "গ + ন", examples: "ভগ্ন, মগ্ন" }, { char: "গ্ব", breakdown: "গ + ব", examples: "দিগ্বিজয়" },
    { char: "গ্ম", breakdown: "গ + ম", examples: "যুগ্ম, বাগ্মী" }, { char: "গ্য", breakdown: "গ + য-ফলা", examples: "ভাগ্য, যোগ্য" },
    { char: "গ্র", breakdown: "গ + র-ফলা", examples: "গ্রাম, গ্রহণ" }, { char: "গ্ল", breakdown: "গ + ল", examples: "গ্লানি" },
    { char: "ঘ্ন", breakdown: "ঘ + ন", examples: "কৃতঘ্ন, বিঘ্ন" }, { char: "ঘ্য", breakdown: "ঘ + য-ফলা", examples: "শ্লাঘ্য" },
    { char: "ঘ্র", breakdown: "ঘ + র-ফলা", examples: "ঘ্রাণ, ব্যাঘ্র" }, { char: "ঙ্ক", breakdown: "ঙ + ক", examples: "অঙ্ক, কঙ্কাল" },
    { char: "ঙ্ক্ষ", breakdown: "ঙ + ক + ষ", examples: "আকাঙ্ক্ষা" }, { char: "ঙ্গ", breakdown: "ঙ + গ", examples: "অঙ্গ, বঙ্গ, সঙ্গী" },
    { char: "ঙ্ঘ", breakdown: "ঙ + ঘ", examples: "সঙ্ঘ, লঙ্ঘন" }, { char: "চ্চ", breakdown: "চ + চ", examples: "বাচ্চা, উচ্চ" },
    { char: "চ্ছ", breakdown: "চ + ছ", examples: "ইচ্ছা, তুচ্ছ" }, { char: "চ্য", breakdown: "চ + য-ফলা", examples: "প্রাচ্য,চ্যুতি" },
    { char: "জ্জ", breakdown: "জ + জ", examples: "লজ্জা, সজ্জা" }, { char: "জ্ঝ", breakdown: "জ + ঝ", examples: "কুজ্ঝটিকা" },
    { char: "জ্ঞ", breakdown: "জ + ঞ", examples: "জ্ঞান, বিজ্ঞান, আজ্ঞা" }, { char: "জ্ব", breakdown: "জ + ব", examples: "জ্বর, জ্বালা" },
    { char: "জ্য", breakdown: "জ + য-ফলা", examples: "রাজ্য, জ্যামিতি" }, { char: "জ্র", breakdown: "জ + র-ফলা", examples: "বজ্র" },
    { char: "ঞ্চ", breakdown: "ঞ + চ", examples: "অঞ্চল, কাঞ্চন" }, { char: "ঞ্ছ", breakdown: "ঞ + ছ", examples: "বাঞ্ছা, লাঞ্ছনা" },
    { char: "ঞ্জ", breakdown: "ঞ + জ", examples: "গঞ্জ, অঞ্জন, ব্যঞ্জন" }, { char: "ঞ্ঝ", breakdown: "ঞ + ঝ", examples: "ঝঞ্ঝা" },
    { char: "ট্ট", breakdown: "ট + ট", examples: "চট্টগ্রাম, বাট্টা" }, { char: "ট্র", breakdown: "ট + র-ফলা", examples: "ট্রেন, ট্রাক" },
    { char: "ড্ড", breakdown: "ড + ড", examples: "আড্ডা, হাড্ডি" }, { char: "ড্র", breakdown: "ড + র-ফলা", examples: "ড্রাম, ড্রাইভার" },
    { char: "ণ্ট", breakdown: "ণ + ট", examples: "ঘণ্টা, বণ্টন" }, { char: "ণ্ঠ", breakdown: "ণ + ঠ", examples: "কণ্ঠ, কুণ্ঠা" },
    { char: "ণ্ড", breakdown: "ণ + ড", examples: "গণ্ডগোল, কাণ্ড" }, { char: "ণ্ণ", breakdown: "ণ + ণ", examples: "বিষণ্ণ, ক্ষুণ্ণ" },
    { char: "ত্ত", breakdown: "ত + ত", examples: "উত্তর, বৃত্ত" }, { char: "ত্থ", breakdown: "ত + থ", examples: "উত্থান, অশ্বত্থ" },
    { char: "ত্ন", breakdown: "ত + ন", examples: "রত্ন, যত্ন" }, { char: "ত্ব", breakdown: "ত + ব", examples: "রাজত্ব, তত্ত্ব" },
    { char: "ত্ম", breakdown: "ত + ম", examples: "আত্মা, মহাত্মা" }, { char: "ত্য", breakdown: "ত + য-ফলা", examples: "সত্য, হত্যা" },
    { char: "ত্র", breakdown: "ত + র-ফলা", examples: "ছাত্র, পাত্র" }, { char: "থ্ব", breakdown: "থ + ব", examples: "পৃথিবী" },
    { char: "থ্য", breakdown: "থ + য-ফলা", examples: "তথ্য, পথ্য" }, { char: "দ্ঘ", breakdown: "দ + ঘ", examples: "উদ্‌ঘাটন" },
    { char: "দ্দ", breakdown: "দ + দ", examples: "উদ্দেশ্য, খদ্দর" }, { char: "দ্ধ", breakdown: "দ + ধ", examples: "যুদ্ধ, শুদ্ধ" },
    { char: "দ্ব", breakdown: "দ + ব", examples: "দ্বার, দ্বিতীয়" }, { char: "দ্ভ", breakdown: "দ + ভ", examples: "অদ্ভুত, উদ্ভব" },
    { char: "দ্ম", breakdown: "দ + ম", examples: "পদ্ম, ছদ্মবেশী" }, { char: "দ্য", breakdown: "দ + য-ফলা", examples: "বিদ্যা, গদ্য" },
    { char: "দ্র", breakdown: "দ + র-ফলা", examples: "রুদ্র, দরিদ্র" }, { char: "ধ্ব", breakdown: "ধ + ব", examples: "ধ্বনি, ধ্বংস" },
    { char: "ধ্য", breakdown: "ধ + য-ফলা", examples: "বাধ্য, মধ্য" }, { char: "ধ্র", breakdown: "ধ + র-ফলা", examples: "ধ্রুব" },
    { char: "ন্ট", breakdown: "ন + ট", examples: "প্যান্ট, ঘণ্টা" }, { char: "ন্ড", breakdown: "ন + ড", examples: "ফান্ড, ব্যান্ড" },
    { char: "ন্ত", breakdown: "ন + ত", examples: "শান্ত, অনন্ত" }, { char: "ন্থ", breakdown: "ন + থ", examples: "পান্থ, গ্রন্থ" },
    { char: "ন্দ", breakdown: "ন + দ", examples: "আনন্দ, সুন্দর" }, { char: "ন্ধ", breakdown: "ন + ধ", examples: "অন্ধ, বন্ধু" },
    { char: "ন্ন", breakdown: "ন + ন", examples: "অন্ন, নবান্ন" }, { char: "ন্ব", breakdown: "ন + ব", examples: "অন্বেষণ, ধন্বন্তরি" },
    { char: "ন্ম", breakdown: "ন + ম", examples: "জন্ম, উন্মাদ" }, { char: "ন্য", breakdown: "ন + য-ফলা", examples: "বন্য, জন্য" },
    { char: "প্ট", breakdown: "প + ট", examples: "ক্যাপ্টেন" }, { char: "প্ত", breakdown: "প + ত", examples: "সুপ্ত, তপ্ত" },
    { char: "প্ন", breakdown: "প + ন", examples: "স্বপ্ন" }, { char: "প্প", breakdown: "প + প", examples: "ধাপ্পা" },
    { char: "প্য", breakdown: "প + য-ফলা", examples: "প্রাপ্য, রূপ্য" }, { char: "প্র", breakdown: "প + র-ফলা", examples: "প্রথম, প্রাণ" },
    { char: "প্ল", breakdown: "প + ল", examples: "প্লাবন, বিপ্লব" }, { char: "ফ্ল", breakdown: "ফ + ল", examples: "ফ্লাস্ক" },
    { char: "ব্জ", breakdown: "ব + জ", examples: "কুব্জ, ন্যুব্জ" }, { char: "ব্দ", breakdown: "ব + দ", examples: "শব্দ, জব্দ" },
    { char: "ব্ধ", breakdown: "ব + ধ", examples: "লব্ধ, স্তব্ধ" }, { char: "ব্ব", breakdown: "ব + ব", examples: "আব্বা, ডাব্বা" },
    { char: "ব্য", breakdown: "ব + য-ফলা", examples: "ব্যয়, ব্যস্ত" }, { char: "ব্র", breakdown: "ব + র-ফলা", examples: "ব্রাহ্মণ, ব্রত" },
    { char: "ভ্য", breakdown: "ভ + য-ফলা", examples: "সভ্য, অভ্যাস" }, { char: "ভ্র", breakdown: "ভ + র-ফলা", examples: "ভ্রমণ, ভ্রান্তি" },
    { char: "ম্প", breakdown: "ম + প", examples: "কম্প, সম্পদ" }, { char: "ম্ফ", breakdown: "ম + ফ", examples: "লম্ফ, গুম্ফ" },
    { char: "ম্ব", breakdown: "ম + ব", examples: "অম্বল, কম্বল" }, { char: "ম্ভ", breakdown: "ম + ভ", examples: "দম্ভ, স্তম্ভ" },
    { char: "ম্ম", breakdown: "ম + ম", examples: "সম্মান, সম্মত" }, { char: "ম্য", breakdown: "ম + য-ফলা", examples: "রম্য, গাম্য" },
    { char: "ম্র", breakdown: "ম + র-ফলা", examples: "নম্র, তাম্র" }, { char: "ম্ল", breakdown: "ম + ল", examples: "অম্ল, ম্লান" },
    { char: "ল্ক", breakdown: "ল + ক", examples: "শুল্ক, বল্কল" }, { char: "ল্গ", breakdown: "ল + গ", examples: "বল্গা, ফাল্গুন" },
    { char: "ল্ট", breakdown: "ল + ট", examples: "উল্টো, পাল্লা" }, { char: "ল্ড", breakdown: "ল + ড", examples: "ফিল্ড, গোল্ড" },
    { char: "ল্প", breakdown: "ল + প", examples: "অল্প, গল্প" }, { char: "ল্ফ", breakdown: "ল + ফ", examples: "গুল্ফ" },
    { char: "ল্ব", breakdown: "ল + ব", examples: "বিল্ব, বাল্ব" }, { char: "ল্ম", breakdown: "ল + ম", examples: "গুল্ম, বাল্মীকি" },
    { char: "ল্ল", breakdown: "ল + ল", examples: "উল্লাস, পল্লি" }, { char: "শ্চ", breakdown: "শ + চ", examples: "নিশ্চয়, পশ্চিম" },
    { char: "শ্ছ", breakdown: "শ + ছ", examples: "শিরশ্ছেদ" }, { char: "শ্ন", breakdown: "শ + ন", examples: "প্রশ্ন" },
    { char: "শ্ব", breakdown: "শ + ব", examples: "অশ্ব, বিশ্বাস" }, { char: "শ্ম", breakdown: "শ + ম", examples: "শ্মশান, রশ্মি" },
    { char: "শ্য", breakdown: "শ + য-ফলা", examples: "দৃশ্য, অবশ্য" }, { char: "শ্র", breakdown: "শ + র-ফলা", examples: "শ্রম, মিশ্র" },
    { char: "শ্ল", breakdown: "শ + ল", examples: "শ্লীল, শ্লেষ" }, { char: "ষ্ক", breakdown: "ষ + ক", examples: "শুষ্ক, আবিষ্কার" },
    { char: "ষ্ট", breakdown: "ষ + ট", examples: "কষ্ট, নষ্ট" }, { char: "ষ্ঠ", breakdown: "ষ + ঠ", examples: "শ্রেষ্ঠ, পৃষ্ঠা" },
    { char: "ষ্ণ", breakdown: "ষ + ণ", examples: "কৃষ্ণ, উষ্ণ" }, { char: "ষ্প", breakdown: "ষ + প", examples: "পুষ্প, বাষ্প" },
    { char: "ষ্ফ", breakdown: "ষ + ফ", examples: "নিষ্ফল" }, { char: "ষ্ম", breakdown: "ষ + ম", examples: "উষ্ম, গ্রীষ্ম" },
    { char: "স্ক", breakdown: "স + ক", examples: "স্কুল, পরিষ্কার" }, { char: "স্খ", breakdown: "স + খ", examples: "স্খলন" },
    { char: "স্ট", breakdown: "স + ট", examples: "মাস্টার, স্টেশন" }, { char: "স্ত", breakdown: "স + ত", examples: "আস্ত, সস্তা" },
    { char: "স্থ", breakdown: "স + থ", examples: "সুস্থ, স্থান" }, { char: "স্ন", breakdown: "স + ন", examples: "স্নান, স্নেহ" },
    { char: "স্প", breakdown: "স + প", examples: "আস্পর্ধা, স্পর্শ" }, { char: "স্ফ", breakdown: "স + ফ", examples: "আস্ফালন, স্ফীত" },
    { char: "স্ব", breakdown: "স + ব", examples: "স্বর, স্বাধীন" }, { char: "স্ম", breakdown: "স + ম", examples: "স্মরণ, বিস্ময়" },
    { char: "স্য", breakdown: "স + য-ফলা", examples: "হাস্য, শস্য" }, { char: "স্র", breakdown: "স + র-ফলা", examples: "স্রোত, সহস্র" },
    { char: "হ্ণ", breakdown: "হ + ণ", examples: "অপরাহ্ণ, পূর্বাহ্ণ" }, { char: "হ্ন", breakdown: "হ + ন", examples: "চিহ্ন, মধ্যাহ্ন" },
    { char: "হ্ব", breakdown: "হ + ব", examples: "আহ্বান, জিহ্বা" }, { char: "হ্ম", breakdown: "হ + ম", examples: "ব্রহ্মা, ব্রাহ্মণ" },
    { char: "হ্য", breakdown: "হ + য-ফলা", examples: "সহ্য, বাহ্য" }, { char: "হ্র", breakdown: "হ + র-ফলা", examples: "হ্রদ, হ্রাস" },
    { char: "হ্ল", breakdown: "হ + ল", examples: "আহ্লাদ, প্রল্লাদ" }
  ];
  const dyslexicPalette = [
    { bg: "#d4f3e3", border: "#18b368", text: "#0f9055" },
    { bg: "#e8f4ff", border: "#4a90d9", text: "#2b6cb0" },
    { bg: "#f0efff", border: "#8b5cf6", text: "#553c9a" },
    { bg: "#fff3d4", border: "#f5a623", text: "#c05621" },
    { bg: "#ffe0f0", border: "#ff6b6b", text: "#c53030" },
  ];
  
  const activeIndex = active ? juktobornoList.findIndex(item => item.char === active.char) : 0;
  const activeColors = dyslexicPalette[activeIndex % dyslexicPalette.length];

  return (
    <div style={{ padding: "24px", position: "relative", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <motion.button whileTap={{ scale: .9 }} onClick={onBack} style={{ width: 44, height: 44, borderRadius: 14, border: "none", background: "white", cursor: "pointer", fontSize: 18, boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}>←</motion.button>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1d2b2a" }}>যুক্তবর্ণ শিখি</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 16 }}>
        {juktobornoList.map((item, i) => (
          <motion.div key={i} whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }} whileTap={{ scale: .9 }}
            onClick={() => setActive(item)}
            style={{ 
              aspectRatio: "1", borderRadius: 24, display: "flex", justifyContent: "center", alignItems: "center", 
              fontSize: 40, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 16px rgba(0,0,0,0.06)", 
              background: "white", color: "#2d3748", border: `4px solid ${dyslexicPalette[i % dyslexicPalette.length].border}`,
              fontFamily: "'Hind Siliguri',sans-serif"
            }}>
            {item.char}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {active && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ 
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
              background: "rgba(0,0,0,0.5)", zIndex: 1000, 
              display: "flex", justifyContent: "center", alignItems: "center",
              backdropFilter: "blur(4px)"
            }}
            onClick={() => setActive(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: "#ffffff", borderRadius: 28, padding: "40px", 
                width: "360px", textAlign: "center", position: "relative",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                display: "flex", flexDirection: "column", alignItems: "center"
              }}>
              <button 
                onClick={() => setActive(null)}
                style={{ 
                  position: "absolute", top: 20, right: 20, width: 32, height: 32, 
                  borderRadius: "50%", background: "#f0f0f0", border: "none", 
                  cursor: "pointer", fontSize: 16, display: "flex", 
                  justifyContent: "center", alignItems: "center", color: "#666" 
                }}>✕</button>
              <div style={{ fontSize: 130, fontWeight: 800, color: activeColors.text, lineHeight: 1.1, fontFamily: "'Hind Siliguri',sans-serif", margin: "10px 0" }}>
                {active.char}
              </div>
              <div style={{ fontSize: 32, color: "#333", fontWeight: 900, marginBottom: 12, fontFamily: "'Hind Siliguri',sans-serif" }}>
                {active.breakdown}
              </div>
              <div style={{ fontSize: 18, color: "#777", marginBottom: 8, fontWeight: 600, fontFamily: "'Hind Siliguri',sans-serif" }}>
                যেমন:
              </div>
              <div style={{ 
                background: activeColors.bg, 
                border: `2px solid ${activeColors.border}`, 
                borderRadius: 16, 
                padding: "12px 24px", 
                fontSize: 28, 
                color: activeColors.text, 
                fontWeight: 900, 
                marginBottom: 32, 
                fontFamily: "'Hind Siliguri',sans-serif",
                boxShadow: `0 4px 12px ${activeColors.bg}`,
                display: "inline-block"
              }}>
                {active.examples}
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: .95 }} 
                onClick={() => {
                  const u = new SpeechSynthesisUtterance(active.char);
                  u.lang = 'bn-BD';
                  speechSynthesis.speak(u);
                }}
                style={{ 
                  padding: "14px 36px", borderRadius: 50, border: "none", 
                  background: activeColors.border, color: "white", fontWeight: 700, 
                  fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  boxShadow: `0 8px 24px ${activeColors.bg}`
                }}>
                🔊 শুনো
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
