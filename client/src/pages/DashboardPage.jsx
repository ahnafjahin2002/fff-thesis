import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroKid from "../assets/hero-kid.png";
import BornoBazar from "./BornoBazar";
import QuizModule from "../components/quiz/QuizModule";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// ─── Global Styles ────────────────────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    font-family: 'Hind Siliguri', sans-serif;
    background: #f0faf4;
  }
  :root {
    --primary: #18b368;
    --primary-dark: #0f9055;
    --primary-light: #d4f3e3;
    --bg: #f0faf4;
    --sidebar-bg: #e8f7ee;
    --card-green: #eef9f1;
    --card-yellow: #fffbee;
    --card-purple: #f0efff;
    --card-pink: #fff0f5;
    --text-main: #1d2b2a;
    --text-sub: #687076;
    --shadow-sm: 0 2px 12px rgba(0,0,0,.07);
    --shadow-md: 0 6px 28px rgba(0,0,0,.10);
    --radius-card: 22px;
  }

  .app-root {
    display: flex;
    width: 100vw;
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    overflow-x: hidden;
  }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed;
    top: 0; left: -280px;
    width: 260px;
    height: 100vh;
    background: var(--sidebar-bg);
    display: flex;
    flex-direction: column;
    padding: 28px 18px 24px;
    border-right: 1px solid rgba(24,179,104,.13);
    transition: left .3s cubic-bezier(.4,0,.2,1);
    z-index: 200;
    overflow-y: auto;
  }
  .sidebar.open { left: 0; }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.32);
    z-index: 190;
    opacity: 0;
    pointer-events: none;
    transition: opacity .3s;
  }
  .sidebar-overlay.active { opacity: 1; pointer-events: all; }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
    padding-left: 4px;
  }
  .sidebar-logo-icon {
    width: 46px; height: 46px;
    border-radius: 14px;
    background: #c8f0d8;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }
  .sidebar-logo-text { font-size: 17px; font-weight: 700; color: #0a6e3a; line-height: 1.2; }
  .sidebar-logo-sub  { font-size: 11px; color: #4caf7d; margin-top: 1px; }

  .nav-item {
    display: flex; align-items: center; gap: 13px;
    height: 50px; border-radius: 15px;
    padding: 0 15px;
    cursor: pointer;
    color: var(--text-sub);
    font-size: 15px; font-weight: 600;
    margin-bottom: 3px;
    transition: background .18s, color .18s;
    user-select: none;
  }
  .nav-item:hover  { background: #c8f0d8; color: #0a6e3a; }
  .nav-item.active { background: #c8f0d8; color: #0a6e3a; font-weight: 700; }

  .sidebar-motivate {
    margin-top: auto;
    background: white;
    border-radius: 20px;
    padding: 20px 14px;
    text-align: center;
    box-shadow: var(--shadow-sm);
  }

  /* ── Main area ── */
  .main-area {
    flex: 1;
    width: 100%;
    min-height: 100vh;
    padding: 28px 32px 40px;
    display: flex;
    flex-direction: column;
  }

  /* ── Top bar ── */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .hamburger {
    width: 50px; height: 50px;
    border-radius: 16px;
    border: none;
    background: white;
    box-shadow: 0 3px 14px rgba(0,0,0,.12);
    cursor: pointer;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    gap: 5px;
    flex-shrink: 0;
  }
  .hamburger span {
    display: block;
    height: 2.8px;
    background: #1d2b2a;
    border-radius: 3px;
    transition: width .2s;
  }

  .profile-pill {
    display: flex; align-items: center; gap: 11px;
    background: white;
    padding: 7px 18px 7px 8px;
    border-radius: 100px;
    box-shadow: var(--shadow-sm);
    cursor: pointer;
  }
  .profile-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #c8f0c8;
    overflow: hidden;
    border: 2px solid #a8e6bf;
    flex-shrink: 0;
  }

  /* ── Hero Banner ── */
  .hero-banner {
    width: 100%;
    border-radius: var(--radius-card);
    background: linear-gradient(135deg, #e2f5ea 0%, #cdeadb 100%);
    padding: 32px 40px 0 40px;
    margin-bottom: 22px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    min-height: 180px;
    position: relative;
    overflow: hidden;
  }
  .hero-text { z-index: 2; padding-bottom: 32px; }
  .hero-title {
    font-size: 36px; font-weight: 800;
    color: #1a2e1a; line-height: 1.2;
    margin-bottom: 8px;
  }
  .hero-sub { font-size: 16px; color: #3a6b4a; font-weight: 500; }
  .hero-img {
    width: 240px;
    height: auto;
    object-fit: contain;
    flex-shrink: 0;
    z-index: 2;
    display: block;
    align-self: flex-end;
  }
  .hero-cloud {
    position: absolute;
    opacity: .65;
  }

  /* ── Goal card ── */
  .goal-card {
    background: white;
    border-radius: var(--radius-card);
    padding: 22px 28px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 22px;
  }
  .goal-bar-bg {
    background: #dff0e8;
    border-radius: 100px;
    height: 15px;
    overflow: hidden;
    margin-top: 14px;
  }
  .goal-bar-fill {
    height: 100%;
    border-radius: 100px;
    background: linear-gradient(90deg, #22c776, #18b368);
  }

  /* ── Activity grid ── */
  .activity-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-bottom: 22px;
  }
  .activity-card {
    border-radius: var(--radius-card);
    padding: 26px 22px;
    display: flex;
    align-items: center;
    gap: 18px;
    min-height: 152px;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: transform .2s, box-shadow .2s;
    position: relative;
    overflow: hidden;
  }
  .activity-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
  .card-arrow {
    width: 44px; height: 44px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
    border: none;
    cursor: pointer;
  }

  /* ── Achievements ── */
  .achievements {
    background: white;
    border-radius: var(--radius-card);
    padding: 22px 28px;
    box-shadow: var(--shadow-sm);
  }
  .ach-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
  }
  .ach-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    border-right: 1px solid #eee;
  }
  .ach-item:first-child { padding-left: 0; }
  .ach-item:last-child  { border-right: none; }
  .ach-icon-box {
    width: 46px; height: 46px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .ach-num   { font-size: 22px; font-weight: 800; line-height: 1; }
  .ach-label { font-size: 12px; color: var(--text-sub); margin-top: 2px; }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .main-area { padding: 18px 14px 32px; }
    .activity-grid { grid-template-columns: 1fr; }
    .ach-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
    .ach-item { border-right: none; padding: 0; }
    .hero-img { width: 150px; }
    .hero-title { font-size: 26px; }
    .hero-banner { padding: 24px 20px 0; min-height: 140px; }
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #b2d8c4; border-radius: 10px; }
`;
document.head.appendChild(styleEl);

// ─── SVGs ─────────────────────────────────────────────────────────────────────
const CloudSVG = ({ w = 50, style = {} }) => (
  <svg width={w} height={w * 0.6} viewBox="0 0 60 36" style={style}>
    <ellipse cx="30" cy="26" rx="28" ry="12" fill="white" />
    <circle cx="20" cy="22" r="11" fill="white" />
    <circle cx="34" cy="18" r="14" fill="white" />
    <circle cx="46" cy="24" r="9" fill="white" />
  </svg>
);

const SunSVG = () => (
  <svg width="68" height="68" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="22" fill="#FFD700" />
    <circle cx="40" cy="40" r="18" fill="#FFEC3D" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
      <line key={i} x1="40" y1="40"
        x2={40 + 32 * Math.cos(a * Math.PI / 180)}
        y2={40 + 32 * Math.sin(a * Math.PI / 180)}
        stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
    ))}
    <circle cx="33" cy="36" r="3" fill="#333" />
    <circle cx="47" cy="36" r="3" fill="#333" />
    <path d="M33 47 Q40 54 47 47" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

const AvatarSVG = () => (
  <svg width="40" height="40" viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="28" fill="#c8f0c8" />
    <circle cx="28" cy="22" r="11" fill="#ffcc99" />
    <ellipse cx="28" cy="42" rx="14" ry="10" fill="#5ba0e0" />
    <circle cx="23" cy="20" r="2" fill="#333" />
    <circle cx="33" cy="20" r="2" fill="#333" />
    <path d="M23 27 Q28 32 33 27" stroke="#e07070" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M17 14 Q28 4 39 14" stroke="#5c3317" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

const StarSVG = ({ size = 20, fill = "#FFD700" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <polygon
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      fill={fill} stroke={fill} strokeWidth="1" />
  </svg>
);

const BookSVG = () => (
  <svg width="48" height="48" viewBox="0 0 52 52">
    <rect x="4" y="8" width="44" height="36" rx="5" fill="#5ba0e0" />
    <rect x="6" y="10" width="19" height="32" rx="3" fill="#fff" />
    <rect x="27" y="10" width="19" height="32" rx="3" fill="#f0f0f0" />
    <line x1="26" y1="10" x2="26" y2="42" stroke="#5ba0e0" strokeWidth="2" />
    {[15, 20, 25, 30].map(y => <line key={y} x1="9" y1={y} x2="22" y2={y} stroke="#ccc" strokeWidth="1.5" />)}
    {[15, 20, 25, 30].map(y => <line key={y} x1="30" y1={y} x2="43" y2={y} stroke="#ccc" strokeWidth="1.5" />)}
  </svg>
);

const BoardSVG = () => (
  <svg width="48" height="48" viewBox="0 0 52 52">
    <rect x="4" y="4" width="44" height="36" rx="8" fill="#f5a623" />
    <rect x="10" y="8" width="14" height="14" rx="4" fill="#ff6b6b" />
    <rect x="28" y="8" width="14" height="14" rx="4" fill="#4a90d9" />
    <rect x="10" y="26" width="14" height="10" rx="3" fill="#3cb371" />
    <rect x="28" y="26" width="14" height="10" rx="3" fill="#8b5cf6" />
    <text x="17" y="20" fontSize="10" fill="white" fontFamily="Hind Siliguri" textAnchor="middle">অ</text>
    <text x="35" y="20" fontSize="10" fill="white" fontFamily="Hind Siliguri" textAnchor="middle">আ</text>
    <text x="17" y="34" fontSize="10" fill="white" fontFamily="Hind Siliguri" textAnchor="middle">ক</text>
    <text x="35" y="34" fontSize="10" fill="white" fontFamily="Hind Siliguri" textAnchor="middle">খ</text>
  </svg>
);

const GamepadSVG = () => (
  <svg width="48" height="48" viewBox="0 0 52 52">
    <rect x="4" y="14" width="44" height="28" rx="14" fill="#6b6fba" />
    <circle cx="14" cy="28" r="7" fill="#5555a0" />
    <line x1="14" y1="24" x2="14" y2="32" stroke="#888ddd" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="10" y1="28" x2="18" y2="28" stroke="#888ddd" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="36" cy="25" r="3" fill="#ff6b6b" />
    <circle cx="42" cy="28" r="3" fill="#ffd700" />
    <circle cx="36" cy="31" r="3" fill="#5ba0e0" />
    <circle cx="30" cy="28" r="3" fill="#3cb371" />
  </svg>
);

const PencilSVG = () => (
  <svg width="48" height="48" viewBox="0 0 52 52">
    <rect x="22" y="4" width="10" height="36" rx="4" fill="#f5a623" transform="rotate(25 26 26)" />
    <polygon points="26,42 30,34 22,34" fill="#ff6b6b" transform="rotate(25 26 26)" />
    <polygon points="26,46 29,42 23,42" fill="#ffd700" transform="rotate(25 26 26)" />
    <rect x="22" y="4" width="10" height="7" rx="4 4 0 0" fill="#ccc" transform="rotate(25 26 26)" />
  </svg>
);

const TrophySVG = () => (
  <svg width="24" height="24" viewBox="0 0 28 28">
    <rect x="9" y="22" width="10" height="3" rx="1.5" fill="#c8860a" />
    <rect x="7" y="25" width="14" height="2.5" rx="1.25" fill="#c8860a" />
    <path d="M7 4 h14 v10 a7 7 0 0 1-14 0 Z" fill="#f5a623" />
    <path d="M7 6 H3 a3 3 0 0 0 3 6 h2" fill="none" stroke="#f5a623" strokeWidth="3" strokeLinecap="round" />
    <path d="M21 6 h4 a3 3 0 0 1-3 6 h-2" fill="none" stroke="#f5a623" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const PuzzleSVG = () => (
  <svg width="48" height="48" viewBox="0 0 52 52">
    <rect x="4" y="4" width="20" height="20" rx="4" fill="#e04e81" />
    <rect x="28" y="4" width="20" height="20" rx="4" fill="#f5a623" />
    <rect x="4" y="28" width="20" height="20" rx="4" fill="#18b368" />
    <rect x="28" y="28" width="20" height="20" rx="4" fill="#4a90d9" />
    <circle cx="24" cy="14" r="6" fill="#e04e81" />
    <circle cx="24" cy="38" r="6" fill="#18b368" />
    <circle cx="14" cy="24" r="6" fill="#e04e81" />
    <circle cx="38" cy="24" r="6" fill="#4a90d9" />
  </svg>
);

const HomeSVG = () => <svg width="22" height="22" viewBox="0 0 28 28"><path d="M3 14 L14 4 L25 14 V26 H18 V19 H10 V26 H3 Z" fill="#18b368" /></svg>;
const SettingsSVG = () => (
  <svg width="22" height="22" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="3.5" fill="#8b5cf6" />
    <path d="M14 2v3M14 23v3M2 14h3M23 14h3M5.5 5.5l2.1 2.1M20.4 20.4l2.1 2.1M20.4 5.5l-2.1 2.1M7.6 20.4l-2.1 2.1" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="14" cy="14" r="5.5" fill="none" stroke="#8b5cf6" strokeWidth="2.2" />
  </svg>
);

// ─── Default dynamic data (replace with API/context in production) ─────────────
const DEFAULT_USER = {
  name: "রাইহান",
  level: "৮",
  avatarBg: "#c8f0c8",
};

const DEFAULT_ACTIVITIES = [
  { id: "read", title: "পড়া", sub: "লাইন ধরে পড়ি\nআর অক্ষর চিনি", bg: "#eef9f1", accent: "#18b368", icon: <BookSVG /> },
  { id: "game", title: "বর্ণের দোকান", sub: "খেলার মাধ্যমে\nশিখি আর মজা করি", bg: "#f0efff", accent: "#7c75dd", icon: <GamepadSVG /> },
  { id: "trace", title: "ট্রেনিং", sub: "লেখা ও বানান চর্চা\nকরি প্রতিদিন", bg: "#fff0f5", accent: "#f06292", icon: <PencilSVG /> },
  { id: "quiz", title: "কুইজ", sub: "শব্দ ও ছবি মেলাও", bg: "#fffbee", accent: "#e04e81", icon: <PuzzleSVG /> },
];

const DEFAULT_PROGRESS = 70;

const DEFAULT_ACHIEVEMENTS = [
  { num: "১২", label: "গল্প পড়া হয়েছে", color: "#18b368", bg: "#e8f4ff", icon: <BookSVG /> },
  { num: "৩৪", label: "অক্ষর শিখেছি", color: "#f5a623", bg: "#fff8e8", icon: <BoardSVG /> },
  { num: "১৮", label: "খেলা সম্পন্ন", color: "#7c75dd", bg: "#f0efff", icon: <GamepadSVG /> },
  { num: "১২৫", label: "তারকা পয়েন্ট", color: "#18b368", bg: "#fffbdd", icon: <StarSVG size={36} /> },
];

const NAV_ITEMS = [
  { id: "home", label: "হোম", icon: <HomeSVG /> },
  { id: "read", label: "পড়া", icon: <BookSVG /> },
  { id: "game", label: "বর্ণের দোকান", icon: <GamepadSVG /> },
  { id: "trace", label: "ট্রেনিং", icon: <PencilSVG /> },
  { id: "quiz", label: "কুইজ", icon: <PuzzleSVG /> },
  { id: "rewards", label: "অর্জন", icon: <TrophySVG /> },
  { id: "settings", label: "সেটিংস", icon: <SettingsSVG /> },
];

// ─── Sub-pages ────────────────────────────────────────────────────────────────
function ProgressPage() {
  const stats = [
    { label: "মোট পড়া", value: "১২ টি", color: "#4a90d9" },
    { label: "স্ট্রিক", value: "৫ দিন", color: "#f5a623" },
    { label: "স্কোর", value: "৮৫%", color: "#3cb371" },
    { label: "ব্যাজ", value: "৩ টি", color: "#8b5cf6" },
  ];
  const days = ["সো", "মঙ", "বু", "বৃ", "শু", "শ", "র"];
  const done = [true, true, true, true, true, false, false];
  return (
    <div style={{ padding: "24px 20px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1d2b2a", marginBottom: 20 }}>আমার অগ্রগতি</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <motion.div key={s.label} whileHover={{ scale: 1.03 }}
            style={{ background: "white", borderRadius: 20, padding: "18px 14px", boxShadow: "0 4px 16px rgba(0,0,0,.06)", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,.06)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "#333" }}>এই সপ্তাহের স্ট্রিক</h3>
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          {days.map((d, i) => (
            <div key={d} style={{ textAlign: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: done[i] ? "#ffd700" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 4 }}>
                {done[i] ? "⭐" : "○"}
              </div>
              <div style={{ fontSize: 11, color: "#888" }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,.06)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "#333" }}>সাম্প্রতিক কার্যক্রম</h3>
        {[{ t: "পড়া — পাঠ ৩", d: "আজ", s: "★★★" }, { t: "ফোনেমস চর্চা", d: "গতকাল", s: "★★☆" }, { t: "শব্দ খেলা লেভেল ৪", d: "২ দিন আগে", s: "★★★" }].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? "1px solid #f0f0f0" : "none" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{r.t}</div>
              <div style={{ fontSize: 12, color: "#aaa" }}>{r.d}</div>
            </div>
            <div style={{ color: "#f5a623", fontSize: 16 }}>{r.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardsPage() {
  const badges = [
    { emoji: "🏆", label: "পাঠ চ্যাম্পিয়ন", earned: true },
    { emoji: "⭐", label: "৫ দিনের স্ট্রিক", earned: true },
    { emoji: "🎯", label: "নিখুঁত স্কোর", earned: true },
    { emoji: "📚", label: "১০ টি পাঠ", earned: false },
    { emoji: "🎮", label: "গেম মাস্টার", earned: false },
    { emoji: "✏️", label: "ট্রেসিং হিরো", earned: false },
  ];
  return (
    <div style={{ padding: "24px 20px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1d2b2a", marginBottom: 6 }}>পুরস্কার</h2>
      <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>তুমি এখন পর্যন্ত ৩ টি ব্যাজ পেয়েছ!</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {badges.map((b, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
            style={{
              background: b.earned ? "white" : "#f9f9f9", borderRadius: 16, padding: "16px 8px", textAlign: "center",
              boxShadow: b.earned ? "0 4px 16px rgba(0,0,0,.08)" : "none",
              border: b.earned ? "2px solid #ffd700" : "2px dashed #ddd", opacity: b.earned ? 1 : .5
            }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{b.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: b.earned ? "#333" : "#aaa", lineHeight: 1.3 }}>{b.label}</div>
            {b.earned && <div style={{ fontSize: 10, color: "#f5a623", marginTop: 4 }}>✓ অর্জিত</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ActivityPage() {
  const lessons = [
    { title: "পাঠ ১ — আমার পরিবার", level: "সহজ", done: true, icon: "📖" },
    { title: "পাঠ ২ — আমাদের গ্রাম", level: "সহজ", done: true, icon: "🏡" },
    { title: "পাঠ ৩ — পাখির গান", level: "মধ্যম", done: false, icon: "🐦" },
    { title: "পাঠ ৪ — আকাশ ও তারা", level: "মধ্যম", done: false, icon: "⭐" },
  ];
  return (
    <div style={{ padding: "24px 20px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1d2b2a", marginBottom: 20 }}>কার্যক্রম</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {lessons.map((l, i) => (
          <motion.div key={i} whileHover={{ x: 4 }} whileTap={{ scale: .98 }}
            style={{
              background: "white", borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 4px 16px rgba(0,0,0,.06)", borderLeft: `4px solid ${l.done ? "#18b368" : "#e0e0e0"}`
            }}>
            <div style={{ fontSize: 28 }}>{l.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#333" }}>{l.title}</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{l.level}</div>
            </div>
            <div style={{ fontSize: 20 }}>{l.done ? "✅" : "🔒"}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const [fontSize, setFontSize] = useState(22);
  const [letterSpacing, setLetterSpacing] = useState(3);
  const [lineHeight, setLineHeight] = useState(2.0);
  const [wordSpacing, setWordSpacing] = useState(8);
  const [bg, setBg] = useState("#FFF8E7");
  const [textColor, setTextColor] = useState("#2D1B00");
  const [ruler, setRuler] = useState(false);
  const [syllable, setSyllable] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [narrationSpeed, setNarrationSpeed] = useState(0.85);
  const bgs = ["#FFF8E7", "#E8F4FD", "#FFFDE7", "#F3E5F5", "#FFFFFF"];
  const sampleText = "আমি বাংলা পড়তে ভালোবাসি। আকাশ নীল, মাঠ সবুজ।";
  const Toggle = ({ val, set, label }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>{label}</span>
      <motion.div onClick={() => set(!val)} whileTap={{ scale: .9 }}
        style={{ width: 48, height: 26, borderRadius: 13, background: val ? "#18b368" : "#ddd", cursor: "pointer", position: "relative", transition: "background .2s" }}>
        <motion.div animate={{ x: val ? 24 : 2 }} style={{ width: 22, height: 22, borderRadius: "50%", background: "white", position: "absolute", top: 2, boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
      </motion.div>
    </div>
  );
  const Slider = ({ label, min, max, step = 1, val, set, unit = "" }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>{label}</span>
        <span style={{ fontSize: 13, color: "#18b368", fontWeight: 700 }}>{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={{ width: "100%" }} />
    </div>
  );
  return (
    <div style={{ padding: "24px 20px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1d2b2a", marginBottom: 4 }}>অ্যাডাপ্টিভ টেক্সট সেটিংস</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>তোমার পড়ার সুবিধা অনুযায়ী সাজাও</p>
      <div style={{ borderRadius: 20, padding: 20, marginBottom: 20, background: bg, boxShadow: "0 4px 20px rgba(0,0,0,.08)", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}>লাইভ প্রিভিউ</div>
        <div style={{ fontSize, letterSpacing: `${letterSpacing}px`, lineHeight, wordSpacing: `${wordSpacing}px`, color: textColor, fontFamily: "'Hind Siliguri',sans-serif" }}>
          {syllable ? sampleText.split("").map((c, i) => <span key={i} style={{ background: i % 3 === 0 ? "rgba(255,215,0,.35)" : i % 3 === 1 ? "rgba(24,179,104,.2)" : "transparent", borderRadius: 3 }}>{c}</span>) : sampleText}
        </div>
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,.06)", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#333" }}>পটভূমির রং</h3>
        <div style={{ display: "flex", gap: 10 }}>
          {bgs.map(c => (
            <motion.div key={c} whileTap={{ scale: .85 }} onClick={() => setBg(c)}
              style={{ width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer", border: `3px solid ${bg === c ? "#18b368" : "#ddd"}`, transition: "border .2s" }} />
          ))}
          <div style={{ flex: 1 }}>
            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: "100%", height: 36, border: "none", borderRadius: 10, cursor: "pointer", padding: 2 }} />
          </div>
        </div>
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,.06)", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#333" }}>টাইপোগ্রাফি</h3>
        <Slider label="ফন্ট সাইজ" min={12} max={48} val={fontSize} set={setFontSize} unit="px" />
        <Slider label="অক্ষর ফাঁক" min={0} max={20} val={letterSpacing} set={setLetterSpacing} unit="px" />
        <Slider label="লাইন উচ্চতা" min={1} max={3} step={0.1} val={lineHeight} set={setLineHeight} />
        <Slider label="শব্দ ফাঁক" min={0} max={20} val={wordSpacing} set={setWordSpacing} unit="px" />
        <Slider label="নারেশন স্পিড" min={0.5} max={1.5} step={0.05} val={narrationSpeed} set={setNarrationSpeed} unit="x" />
      </div>
      <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,.06)" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#333" }}>বিশেষ মোড</h3>
        <Toggle val={ruler} set={setRuler} label="📏 রিডিং রুলার" />
        <Toggle val={syllable} set={setSyllable} label="🔤 সিলেবল হাইলাইট" />
        <Toggle val={focusMode} set={setFocusMode} label="🎯 ফোকাস মোড" />
      </div>
    </div>
  );
}

function ReadingView({ onBack }) {
  const [activeWord, setActiveWord] = useState(null);
  const [playing, setPlaying] = useState(false);
  const words = ["আমি", "বাংলা", "পড়তে", "ভালোবাসি।", "আকাশ", "নীল,", "মাঠ", "সবুজ।", "পাখি", "গান", "গায়।", "আমরা", "সবাই", "খুশি।"];
  const phonemes = { "আমি": ["আ", "মি"], "বাংলা": ["বাং", "লা"], "পড়তে": ["পড়", "তে"], "ভালোবাসি।": ["ভা", "লো", "বা", "সি"], "আকাশ": ["আ", "কাশ"] };
  useEffect(() => {
    if (!playing) { setActiveWord(null); return; }
    let i = 0;
    const iv = setInterval(() => { setActiveWord(words[i]); i++; if (i >= words.length) { clearInterval(iv); setPlaying(false); setActiveWord(null); } }, 600);
    return () => clearInterval(iv);
  }, [playing]);
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <motion.button whileTap={{ scale: .9 }} onClick={onBack} style={{ width: 44, height: 44, borderRadius: 14, border: "none", background: "white", cursor: "pointer", fontSize: 18, boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}>←</motion.button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1d2b2a" }}>পাঠ ১ — আমার পরিবার</h2>
      </div>
      <div style={{ background: "#FFF8E7", borderRadius: 24, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,.08)", marginBottom: 20, lineHeight: 2.2, fontSize: 20, letterSpacing: "2px", wordSpacing: "8px", color: "#2D1B00", fontFamily: "'Hind Siliguri',sans-serif" }}>
        {words.map((w, i) => (
          <motion.span key={i} onClick={() => setActiveWord(w === activeWord ? null : w)}
            animate={{ backgroundColor: activeWord === w ? "#FFD700" : "transparent", scale: activeWord === w ? 1.08 : 1 }}
            style={{ display: "inline-block", cursor: "pointer", borderRadius: 6, padding: "2px 4px", marginRight: 4 }}>{w}</motion.span>
        ))}
      </div>
      {activeWord && phonemes[activeWord] && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "white", borderRadius: 20, padding: 16, marginBottom: 16, boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>ফোনেম ভাঙন: {activeWord}</div>
          <div style={{ display: "flex", gap: 10 }}>
            {phonemes[activeWord].map((p, i) => (
              <div key={i} style={{ background: "#d4f3e3", borderRadius: 12, padding: "10px 16px", fontSize: 20, fontWeight: 700, color: "#0f6e3a" }}>{p}</div>
            ))}
          </div>
        </motion.div>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <motion.button whileTap={{ scale: .95 }} onClick={() => setPlaying(!playing)}
          style={{ flex: 1, padding: "14px", borderRadius: 50, border: "none", background: playing ? "#ff6b6b" : "#18b368", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          {playing ? "⏸ থামো" : "▶ পড়া শুরু"}
        </motion.button>
        <motion.button whileTap={{ scale: .95 }} onClick={() => { setPlaying(false); setActiveWord(null); }}
          style={{ width: 52, height: 52, borderRadius: 14, border: "none", background: "white", cursor: "pointer", fontSize: 18, boxShadow: "0 4px 14px rgba(0,0,0,.1)" }}>⏹</motion.button>
      </div>
    </div>
  );
}

function PhonemeView({ onBack }) {
  const [active, setActive] = useState(null);
  const letters = ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ক", "খ", "গ", "ঘ", "চ", "ছ", "জ", "ঝ", "ট", "ঠ", "ড", "ঢ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ", "স", "হ"];
  const colors = ["#d4f3e3", "#fff3d4", "#f0efff", "#ffe0f0", "#e8f4ff"];
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <motion.button whileTap={{ scale: .9 }} onClick={onBack} style={{ width: 44, height: 44, borderRadius: 14, border: "none", background: "white", cursor: "pointer", fontSize: 18, boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}>←</motion.button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1d2b2a" }}>ফোনেমস — অক্ষর চর্চা</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
        {letters.map((l, i) => (
          <motion.div key={l} whileTap={{ scale: .85 }}
            animate={{ backgroundColor: active === l ? colors[i % 5] : "white", scale: active === l ? 1.1 : 1 }}
            onClick={() => setActive(active === l ? null : l)}
            style={{ borderRadius: 16, padding: "12px 0", textAlign: "center", fontSize: 22, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.06)", fontFamily: "'Hind Siliguri',sans-serif", color: "#333" }}>
            {l}
          </motion.div>
        ))}
      </div>
      {active && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#d4f3e3", borderRadius: 20, padding: 20, marginTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#0f6e3a", marginBottom: 8 }}>{active}</div>
          <div style={{ fontSize: 14, color: "#555" }}>এই অক্ষরটি চেনো!</div>
          <motion.button whileTap={{ scale: .95 }} style={{ marginTop: 12, padding: "10px 28px", borderRadius: 50, border: "none", background: "#18b368", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            🔊 শুনো
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

function TraceView({ onBack }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const ctx = useRef(null);
  const drawnPointsRef = useRef([]);
  const ghostMaskRef = useRef(null);
  const [letter, setLetter] = useState("অ");
  const [feedback, setFeedback] = useState(null); // null | 'success' | 'error'
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [wiggle, setWiggle] = useState(false);

  const CANVAS_W = 1170;
  const CANVAS_H = 900;
  const TOLERANCE_PX = 14;
  const MAX_OUTSIDE_RATIO = 0.02;

  const letters = [
    "অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ",
    "ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ", "স", "হ", "ড়", "ঢ়", "য়", "ৎ", "ং", "ঃ", "ঁ", "্য", "্"
  ];

  const buildGhostMask = useCallback((letterChar) => {
    const displayLetter = ["ং", "ঃ", "ঁ", "্য", "্"].includes(letterChar) ? "\u00A0" + letterChar : letterChar;
    
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_W;
    offscreen.height = CANVAS_H;
    const offCtx = offscreen.getContext("2d");
    offCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    offCtx.font = "420px 'Hind Siliguri'";
    offCtx.fillStyle = "rgba(0,0,0,1)";
    offCtx.textAlign = "center";
    offCtx.fillText(displayLetter, CANVAS_W / 2, CANVAS_H * 0.7);
    const imageData = offCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const data = imageData.data;

    // Store raw mask — 1 = ghost letter pixel, 0 = empty
    const rawMask = new Uint8Array(CANVAS_W * CANVAS_H);
    let totalShadowPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 10) {
        rawMask[i / 4] = 1;
        totalShadowPixels++;
      }
    }

    // Find Connected Components (to distinguish main body from dots)
    let componentCount = 0;
    const componentMap = new Int32Array(CANVAS_W * CANVAS_H);
    const components = [];

    for (let y = 0; y < CANVAS_H; y++) {
      for (let x = 0; x < CANVAS_W; x++) {
        const idx = y * CANVAS_W + x;
        if (rawMask[idx] === 1 && componentMap[idx] === 0) {
          componentCount++;
          let area = 0;
          const stack = [idx];
          componentMap[idx] = componentCount;

          while (stack.length > 0) {
            const curr = stack.pop();
            area++;
            const cy = Math.floor(curr / CANVAS_W);
            const cx = curr % CANVAS_W;

            if (cy > 0) {
              const n = curr - CANVAS_W;
              if (rawMask[n] === 1 && componentMap[n] === 0) {
                componentMap[n] = componentCount; stack.push(n);
              }
            }
            if (cy < CANVAS_H - 1) {
              const n = curr + CANVAS_W;
              if (rawMask[n] === 1 && componentMap[n] === 0) {
                componentMap[n] = componentCount; stack.push(n);
              }
            }
            if (cx > 0) {
              const n = curr - 1;
              if (rawMask[n] === 1 && componentMap[n] === 0) {
                componentMap[n] = componentCount; stack.push(n);
              }
            }
            if (cx < CANVAS_W - 1) {
              const n = curr + 1;
              if (rawMask[n] === 1 && componentMap[n] === 0) {
                componentMap[n] = componentCount; stack.push(n);
              }
            }
          }
          if (area > 20) {
            components.push({ id: componentCount, area });
          }
        }
      }
    }

    ghostMaskRef.current = { rawMask, totalShadowPixels, componentMap, components };
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    ctx.current = c.getContext("2d");
    ctx.current.clearRect(0, 0, c.width, c.height);
    ctx.current.lineWidth = 18;
    ctx.current.lineCap = "round";
    ctx.current.strokeStyle = "#18b368";
    ctx.current.font = "420px 'Hind Siliguri'";
    ctx.current.fillStyle = "rgba(24,179,104,.1)";
    ctx.current.textAlign = "center";
    const displayLetter = ["ং", "ঃ", "ঁ", "্য", "্"].includes(letter) ? "\u00A0" + letter : letter;
    ctx.current.fillText(displayLetter, c.width / 2, c.height * 0.7);
    drawnPointsRef.current = [];
    setFeedback(null);
    setFeedbackMsg("");
    buildGhostMask(letter);
  }, [letter, buildGhostMask]);

  const getPos = (e, c) => {
    const r = c.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    const scaleX = c.width / r.width;
    const scaleY = c.height / r.height;
    return [(src.clientX - r.left) * scaleX, (src.clientY - r.top) * scaleY];
  };

  const start = e => {
    drawing.current = true;
    const [x, y] = getPos(e, canvasRef.current);
    ctx.current.beginPath();
    ctx.current.moveTo(x, y);
    drawnPointsRef.current.push([x, y]);
  };

  const move = e => {
    if (!drawing.current) return;
    e.preventDefault();
    const [x, y] = getPos(e, canvasRef.current);
    ctx.current.lineTo(x, y);
    ctx.current.stroke();
    drawnPointsRef.current.push([x, y]);
  };

  const end = () => { drawing.current = false; };

  const clear = () => {
    const c = canvasRef.current;
    ctx.current.clearRect(0, 0, c.width, c.height);
    ctx.current.font = "420px 'Hind Siliguri'";
    ctx.current.fillStyle = "rgba(24,179,104,.1)";
    ctx.current.textAlign = "center";
    const displayLetter = ["ং", "ঃ", "ঁ", "্য", "্"].includes(letter) ? "\u00A0" + letter : letter;
    ctx.current.fillText(displayLetter, c.width / 2, c.height * 0.7);
    drawnPointsRef.current = [];
    setFeedback(null);
    setFeedbackMsg("");
  };

  const validateAndProceed = () => {
    const points = drawnPointsRef.current;
    const maskInfo = ghostMaskRef.current;

    if (points.length < 10) {
      setFeedback("error");
      setFeedbackMsg("অক্ষরটি আঁকো! ✏️");
      setWiggle(true);
      setTimeout(() => setWiggle(false), 500);
      return;
    }

    if (!maskInfo) {
      const next = (letters.indexOf(letter) + 1) % letters.length;
      setLetter(letters[next]);
      return;
    }

    const { rawMask, totalShadowPixels, componentMap, components } = maskInfo;

    let outsideCount = 0;
    let checkedCount = 0;
    const tol = TOLERANCE_PX;
    const tolSq = tol * tol;

    for (let i = 0; i < points.length; i += 3) {
      const px = Math.round(points[i][0]);
      const py = Math.round(points[i][1]);
      if (px < 0 || px >= CANVAS_W || py < 0 || py >= CANVAS_H) {
        outsideCount++;
        checkedCount++;
        continue;
      }
      checkedCount++;

      // Check if this point is directly on a ghost pixel
      if (rawMask[py * CANVAS_W + px] === 1) {
        continue; // on the shadow, pass
      }

      // Check tolerance radius — is any nearby pixel on the ghost?
      let nearGhost = false;
      const x0 = Math.max(0, px - tol);
      const x1 = Math.min(CANVAS_W - 1, px + tol);
      const y0 = Math.max(0, py - tol);
      const y1 = Math.min(CANVAS_H - 1, py + tol);
      for (let sy = y0; sy <= y1 && !nearGhost; sy += 4) {
        for (let sx = x0; sx <= x1 && !nearGhost; sx += 4) {
          const dx = sx - px;
          const dy = sy - py;
          if (dx * dx + dy * dy <= tolSq && rawMask[sy * CANVAS_W + sx] === 1) {
            nearGhost = true;
          }
        }
      }
      if (!nearGhost) {
        outsideCount++;
      }
    }

    const outsideRatio = checkedCount > 0 ? outsideCount / checkedCount : 1;

    if (outsideRatio > MAX_OUTSIDE_RATIO) {
      setFeedback("error");
      setFeedbackMsg("ছায়ার ভিতরে আঁকো! 🎯");
      setWiggle(true);
      setTimeout(() => {
        setWiggle(false);
        clear();
      }, 800);
      return;
    }

    // Check coverage
    const imageData = ctx.current.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const data = imageData.data;
    
    let coveredShadowPixels = 0;
    const componentCovered = {};
    for (let c of components) {
      componentCovered[c.id] = 0;
    }

    for (let i = 0; i < CANVAS_W * CANVAS_H; i++) {
      if (rawMask[i] === 1) {
        // User's stroke is drawn with high alpha
        if (data[i * 4 + 3] > 100) {
          coveredShadowPixels++;
          const cid = componentMap[i];
          if (componentCovered[cid] !== undefined) {
            componentCovered[cid]++;
          }
        }
      }
    }

    // Overall Coverage
    const coverageRatio = totalShadowPixels > 0 ? coveredShadowPixels / totalShadowPixels : 1;
    const MIN_COVERAGE = 0.40;

    if (coverageRatio < MIN_COVERAGE) {
      setFeedback("error");
      setFeedbackMsg("পুরো অক্ষরটি আঁকো! 🖍️");
      setWiggle(true);
      setTimeout(() => {
        setWiggle(false);
        clear();
      }, 800);
      return;
    }

    // Component Coverage (Enforce all disconnected parts, e.g. dots, are drawn)
    let missedComponent = false;
    for (let c of components) {
      const compCoverage = componentCovered[c.id] / c.area;
      if (compCoverage < 0.15) { // At least 15% of each disjoint part must be touched
        missedComponent = true;
        break;
      }
    }

    if (missedComponent) {
      setFeedback("error");
      setFeedbackMsg("অক্ষরের সব অংশ আঁকো! (যেমন: বিন্দু) 🖍️");
      setWiggle(true);
      setTimeout(() => {
        setWiggle(false);
        clear();
      }, 800);
      return;
    }

    setFeedback("success");
    setFeedbackMsg("দারুণ! 🎉");
    setTimeout(() => {
      const next = (letters.indexOf(letter) + 1) % letters.length;
      setLetter(letters[next]);
    }, 600);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <motion.button whileTap={{ scale: .9 }} onClick={onBack} style={{ width: 44, height: 44, borderRadius: 14, border: "none", background: "white", cursor: "pointer", fontSize: 18, boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}>←</motion.button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1d2b2a" }}>ট্রেসিং — অক্ষর চর্চা</h2>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {letters.map(l => (
          <motion.button key={l} whileTap={{ scale: .9 }} onClick={() => { setLetter(l); }}
            style={{ padding: "8px 18px", borderRadius: 50, border: "2px solid", borderColor: letter === l ? "#18b368" : "#ddd", background: letter === l ? "#d4f3e3" : "white", fontWeight: 700, fontSize: 18, cursor: "pointer", fontFamily: "'Hind Siliguri',sans-serif", color: "#333" }}>
            {l}
          </motion.button>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <motion.div
          animate={wiggle ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.1)", background: "#FFF8E7", border: `2px solid ${feedback === "error" ? "#ff6b6b" : feedback === "success" ? "#18b368" : "#e8d9bf"}`, transition: "border-color 0.3s" }}
        >
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={{ display: "block", touchAction: "none", width: "100%" }}
            onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
            onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
        </motion.div>
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              style={{
                position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
                padding: "12px 28px", borderRadius: 50,
                background: feedback === "error" ? "#ff6b6b" : "#18b368",
                color: "white", fontWeight: 700, fontSize: 16, boxShadow: "0 4px 16px rgba(0,0,0,.2)",
                pointerEvents: "none", zIndex: 10, whiteSpace: "nowrap"
              }}
            >
              {feedbackMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <motion.button whileTap={{ scale: .95 }} onClick={clear} style={{ flex: 1, padding: "14px", borderRadius: 50, border: "none", background: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.08)", color: "#555" }}>🗑️ মুছো</motion.button>
        <motion.button whileTap={{ scale: .95 }} onClick={validateAndProceed} style={{ flex: 1, padding: "14px", borderRadius: 50, border: "none", background: "#18b368", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>✅ সম্পন্ন</motion.button>
      </div>
    </div>
  );
}

// ─── Home Page (fully dynamic) ────────────────────────────────────────────────
function HomePage({
  user = DEFAULT_USER,
  userActivities = DEFAULT_ACTIVITIES,
  userProgress = DEFAULT_PROGRESS,
  achievements = DEFAULT_ACHIEVEMENTS,
  onNav,
}) {
  const [view, setView] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (view === "game") return <BornoBazar onBack={() => setView("home")} />;
  if (view === "trace") return <TraceView onBack={() => setView("home")} />;
  if (view === "quiz") return (
    <div style={{ padding: "20px", display: "flex", gap: 24, alignItems: "stretch", minHeight: "85vh" }}>
      {/* Left Cartoon Mascot Panel */}
      <div style={{ 
        width: 160, background: 'linear-gradient(to bottom, #74ebd5, #ACB6E5)', 
        borderRadius: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', 
        border: '6px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' 
      }}>
        <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: 30, left: 10, fontSize: 40 }}>☁️</motion.div>
        <motion.div animate={{ x: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: 120, right: 10, fontSize: 30 }}>☁️</motion.div>
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: 80, zIndex: 2, marginBottom: 15 }}>
          🦉
        </motion.div>
        <div style={{ width: '200%', height: 100, background: '#66bb6a', borderRadius: '50%', position: 'absolute', bottom: -40, zIndex: 1, boxShadow: 'inset 0 10px 0 rgba(0,0,0,0.1)' }} />
      </div>

      {/* Main Quiz Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <motion.button 
            whileTap={{ scale: .9 }} 
            onClick={() => setView("home")} 
            style={{ width: 44, height: 44, borderRadius: 14, border: "none", background: "white", cursor: "pointer", fontSize: 18, boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}
          >
            ←
          </motion.button>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1d2b2a' }}>মজার কুইজ</h2>
        </div>
        <QuizModule />
      </div>

      {/* Right Cartoon Mascot Panel */}
      <div style={{ 
        width: 160, background: 'linear-gradient(to bottom, #ff9a9e, #fecfef)', 
        borderRadius: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', 
        border: '6px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' 
      }}>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: 30, right: 20, fontSize: 50 }}>🎈</motion.div>
        <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 180] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: 140, left: 20, fontSize: 25 }}>✨</motion.div>
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} style={{ fontSize: 80, zIndex: 2, marginBottom: 15 }}>
          🐅
        </motion.div>
        <div style={{ width: '200%', height: 100, background: '#ffb74d', borderRadius: '50%', position: 'absolute', bottom: -40, zIndex: 1, boxShadow: 'inset 0 10px 0 rgba(0,0,0,0.1)' }} />
      </div>
    </div>
  );

  return (
    <div className="app-root">

      {/* ── Sidebar overlay ── */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🧠</div>
          <div>
            <div className="sidebar-logo-text">পড়তে পারি</div>
            <div className="sidebar-logo-sub">সহজে শেখা, আনন্দে থাকা</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {NAV_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 3 }}
              className={`nav-item ${i === 0 ? "active" : ""}`}
              onClick={() => {
                setSidebarOpen(false);
                if (item.id === "home") { onNav("home"); }
                else if (item.id === "read") { navigate("/reading"); }
                else if (["rewards", "settings"].includes(item.id)) { onNav(item.id); }
                else { setView(item.id); }
              }}
            >
              <div style={{ flexShrink: 0 }}>{item.icon}</div>
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="sidebar-motivate">
          <div style={{ fontSize: 38, marginBottom: 8 }}>🌟</div>
          <div style={{ fontWeight: 700, color: "#1d2b2a", fontSize: 15 }}>তুমি পারছো!</div>
          <div style={{ fontSize: 12, color: "#687076", marginTop: 4, lineHeight: 1.5 }}>
            প্রতিদিন অল্প করে<br />শিখলেই হবে সেরা!
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-area">

        {/* Top bar */}
        <div className="top-bar">
          <motion.button
            className="hamburger"
            whileTap={{ scale: .93 }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
          >
            <span style={{ width: 22 }} />
            <span style={{ width: 22 }} />
            <span style={{ width: 15, alignSelf: "flex-start", marginLeft: 3 }} />
          </motion.button>

          <div className="profile-pill" onClick={() => onNav && onNav("settings")}>
            <div className="profile-avatar"><AvatarSVG /></div>
            <div>
              <div style={{ fontWeight: 700, color: "#1d2b2a", fontSize: 15, lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 12, color: "#18b368", fontWeight: 600 }}>
                লেভেল {user.level} 📊
              </div>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <motion.div
          className="hero-banner"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* decorative clouds */}
          <CloudSVG w={52} style={{ position: "absolute", top: 18, right: 280, opacity: .7 }} />
          <CloudSVG w={38} style={{ position: "absolute", top: 10, right: 220, opacity: .5 }} />
          <CloudSVG w={44} style={{ position: "absolute", top: 24, left: 320, opacity: .45 }} />

          {/* Sun top-right */}
          <div style={{ position: "absolute", top: 14, right: 14, zIndex: 1 }}>
            <SunSVG />
          </div>

          {/* Text */}
          <div className="hero-text">
            <div className="hero-title">হ্যালো, {user.name}! 👋</div>
            <div className="hero-sub">চলো আজ নতুন কিছু শিখি 📚</div>
          </div>

          {/* Kid illustration */}
          <img
            src={heroKid}
            alt=""
            className="hero-img"
          />
        </motion.div>

        {/* Today's Goal */}
        <motion.div
          className="goal-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .1 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#1d2b2a" }}>আজকের লক্ষ্য</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16, color: "#18b368", fontWeight: 700 }}>{userProgress}% সম্পন্ন</span>
              <StarSVG size={20} />
            </div>
          </div>
          <div className="goal-bar-bg">
            <motion.div
              className="goal-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${userProgress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Activity Cards */}
        <div className="activity-grid">
          {userActivities.map((act, i) => (
            <motion.div
              key={act.id}
              className="activity-card"
              style={{ background: act.bg }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => act.id === "read" ? navigate("/reading") : setView(act.id)}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, delay: i * 0.5, ease: "easeInOut" }}
                style={{ flexShrink: 0, transform: "scale(1.2)", transformOrigin: "center" }}
              >
                {act.icon}
              </motion.div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", marginBottom: 6, lineHeight: 1.2 }}>
                  {act.title}
                </div>
                <div style={{ fontSize: 14, color: "#687076", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {act.sub}
                </div>
              </div>

              <motion.button
                className="card-arrow"
                style={{ background: act.accent }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: .93 }}
              >
                →
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <motion.div
          className="achievements"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .3 }}
        >
          <div style={{ fontSize: 17, fontWeight: 800, color: "#1d2b2a", marginBottom: 18 }}>আমার অর্জন</div>
          <div className="ach-grid">
            {achievements.map((a, i) => (
              <div key={i} className="ach-item">
                <div className="ach-icon-box" style={{ background: a.bg }}>{a.icon}</div>
                <div>
                  <div className="ach-num" style={{ color: a.color }}>{a.num}</div>
                  <div className="ach-label">{a.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </main>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");

  const pages = {
    home: <HomePage onNav={setTab} />,
    progress: <ProgressPage />,
    rewards: <RewardsPage />,
    activity: <ActivityPage />,
    settings: <SettingsPage />,
  };

  return (
    <div style={{ fontFamily: "'Hind Siliguri', sans-serif", width: "100vw", minHeight: "100vh", background: "#f0faf4" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: .18 }}
          style={{ minHeight: "100vh" }}
        >
          {pages[tab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}