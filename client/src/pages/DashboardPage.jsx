import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Google Fonts ───────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// ─── Inline global styles ────────────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f0e8; font-family: 'Hind Siliguri', sans-serif; }
  :root {
    --bg: #fdf8f0;
    --card-blue: #dbeeff;
    --card-yellow: #fff3d4;
    --card-green: #d9f5e5;
    --card-purple: #ede8ff;
    --accent-blue: #4a90d9;
    --accent-yellow: #f5a623;
    --accent-green: #3cb371;
    --accent-purple: #8b5cf6;
    --text-dark: #2d2d2d;
    --text-mid: #555;
    --white: #ffffff;
    --radius: 20px;
  }
  .app-wrap {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    overflow: hidden;
    padding-bottom: 90px;
  }
  .page { display: none; }
  .page.active { display: block; }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }

  /* slider */
  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 10px;
    background: #e0e0e0;
    outline: none;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--accent-blue);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(74,144,217,.4);
  }
`;
document.head.appendChild(styleEl);

// ─── SVG Illustrations ───────────────────────────────────────────────────────
const SunSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="22" fill="#FFD700" />
    <circle cx="40" cy="40" r="18" fill="#FFEC3D" />
    {[0,45,90,135,180,225,270,315].map((a,i)=>(
      <line key={i} x1="40" y1="40"
        x2={40+32*Math.cos(a*Math.PI/180)}
        y2={40+32*Math.sin(a*Math.PI/180)}
        stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round"
        transform={`rotate(0 40 40)`}/>
    ))}
    <circle cx="33" cy="36" r="3" fill="#333" />
    <circle cx="47" cy="36" r="3" fill="#333" />
    <path d="M33 47 Q40 54 47 47" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="31" cy="34" r="1.5" fill="#fff" />
    <circle cx="45" cy="34" r="1.5" fill="#fff" />
  </svg>
);

const CloudSVG = ({w=60,op=0.7}) => (
  <svg width={w} height={w*0.6} viewBox="0 0 60 36" style={{opacity:op}}>
    <ellipse cx="30" cy="26" rx="28" ry="12" fill="white"/>
    <circle cx="20" cy="22" r="11" fill="white"/>
    <circle cx="34" cy="18" r="14" fill="white"/>
    <circle cx="46" cy="24" r="9" fill="white"/>
  </svg>
);

const AvatarSVG = () => (
  <svg width="56" height="56" viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="28" fill="#c8f0c8"/>
    <circle cx="28" cy="22" r="11" fill="#ffcc99"/>
    <ellipse cx="28" cy="42" rx="14" ry="10" fill="#5ba0e0"/>
    <circle cx="28" cy="22" r="11" fill="#ffcc99"/>
    <circle cx="23" cy="20" r="2" fill="#333"/>
    <circle cx="33" cy="20" r="2" fill="#333"/>
    <path d="M23 27 Q28 32 33 27" stroke="#e07070" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M17 14 Q28 4 39 14" stroke="#5c3317" strokeWidth="4" fill="none" strokeLinecap="round"/>
  </svg>
);

const BookSVG = () => (
  <svg width="52" height="52" viewBox="0 0 52 52">
    <rect x="4" y="8" width="44" height="36" rx="5" fill="#5ba0e0"/>
    <rect x="6" y="10" width="19" height="32" rx="3" fill="#fff"/>
    <rect x="27" y="10" width="19" height="32" rx="3" fill="#f0f0f0"/>
    <line x1="26" y1="10" x2="26" y2="42" stroke="#5ba0e0" strokeWidth="2"/>
    {[15,20,25,30].map(y=><line key={y} x1="9" y1={y} x2="22" y2={y} stroke="#ccc" strokeWidth="1.5"/>)}
    {[15,20,25,30].map(y=><line key={y} x1="30" y1={y} x2="43" y2={y} stroke="#ccc" strokeWidth="1.5"/>)}
  </svg>
);

const BoardSVG = () => (
  <svg width="52" height="52" viewBox="0 0 52 52">
    <rect x="4" y="6" width="44" height="36" rx="6" fill="#3a7d44"/>
    <rect x="4" y="6" width="44" height="36" rx="6" fill="none" stroke="#8B5E3C" strokeWidth="3"/>
    <text x="12" y="26" fontSize="13" fill="#ff6b6b" fontFamily="Hind Siliguri">অ</text>
    <text x="27" y="26" fontSize="13" fill="#fff" fontFamily="Hind Siliguri">অ</text>
    <text x="19" y="39" fontSize="13" fill="#ffd700" fontFamily="Hind Siliguri">ক</text>
    <rect x="16" y="42" width="20" height="4" rx="2" fill="#8B5E3C"/>
    <rect x="22" y="46" width="8" height="6" rx="2" fill="#8B5E3C"/>
  </svg>
);

const GamepadSVG = () => (
  <svg width="52" height="52" viewBox="0 0 52 52">
    <rect x="4" y="14" width="44" height="28" rx="14" fill="#6b6fba"/>
    <circle cx="14" cy="28" r="7" fill="#5555a0"/>
    <line x1="14" y1="24" x2="14" y2="32" stroke="#888ddd" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="10" y1="28" x2="18" y2="28" stroke="#888ddd" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="36" cy="25" r="3" fill="#ff6b6b"/>
    <circle cx="42" cy="28" r="3" fill="#ffd700"/>
    <circle cx="36" cy="31" r="3" fill="#5ba0e0"/>
    <circle cx="30" cy="28" r="3" fill="#3cb371"/>
  </svg>
);

const PencilSVG = () => (
  <svg width="52" height="52" viewBox="0 0 52 52">
    <rect x="22" y="4" width="10" height="36" rx="4" fill="#f5a623" transform="rotate(25 26 26)"/>
    <polygon points="26,42 30,34 22,34" fill="#ff6b6b" transform="rotate(25 26 26)"/>
    <polygon points="26,46 29,42 23,42" fill="#ffd700" transform="rotate(25 26 26)"/>
    <rect x="22" y="4" width="10" height="7" rx="4 4 0 0" fill="#ccc" transform="rotate(25 26 26)"/>
    <line x1="8" y1="46" x2="44" y2="46" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3"/>
  </svg>
);

const StarSVG = ({size=24,fill="#FFD700"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      fill={fill} stroke={fill} strokeWidth="1"/>
  </svg>
);

const TrophySVG = () => (
  <svg width="28" height="28" viewBox="0 0 28 28">
    <rect x="9" y="22" width="10" height="3" rx="1.5" fill="#c8860a"/>
    <rect x="7" y="25" width="14" height="2.5" rx="1.25" fill="#c8860a"/>
    <path d="M7 4 h14 v10 a7 7 0 0 1-14 0 Z" fill="#f5a623"/>
    <path d="M7 6 H3 a3 3 0 0 0 3 6 h2" fill="none" stroke="#f5a623" strokeWidth="3" strokeLinecap="round"/>
    <path d="M21 6 h4 a3 3 0 0 1-3 6 h-2" fill="none" stroke="#f5a623" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const HomeSVG = () => (
  <svg width="28" height="28" viewBox="0 0 28 28">
    <path d="M3 14 L14 4 L25 14 V26 H18 V19 H10 V26 H3 Z" fill="#4a90d9"/>
  </svg>
);

const SettingsSVG = () => (
  <svg width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="3.5" fill="#8b5cf6"/>
    <path d="M14 2 v3 M14 23 v3 M2 14 h3 M23 14 h3 M5.5 5.5 l2.1 2.1 M20.4 20.4 l2.1 2.1 M20.4 5.5 l-2.1 2.1 M7.6 20.4 l-2.1 2.1"
      stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="14" cy="14" r="5.5" fill="none" stroke="#8b5cf6" strokeWidth="2.2"/>
  </svg>
);

const ActivitySVG = () => (
  <svg width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="11" fill="none" stroke="#3cb371" strokeWidth="2.5"/>
    <circle cx="14" cy="14" r="5" fill="#3cb371"/>
    <circle cx="14" cy="4" r="2" fill="#3cb371"/>
    <circle cx="14" cy="24" r="2" fill="#3cb371"/>
    <circle cx="4" cy="14" r="2" fill="#3cb371"/>
    <circle cx="24" cy="14" r="2" fill="#3cb371"/>
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────
const activities = [
  { id:"read", title:"পড়া", sub:"২ টি নতুন পাঠ", bg:"var(--card-blue)", accent:"var(--accent-blue)", icon:<BookSVG/>, badge:"নতুন" },
  { id:"phoneme", title:"ফোনেমস", sub:"অক্ষর চর্চা", bg:"var(--card-yellow)", accent:"var(--accent-yellow)", icon:<BoardSVG/>, badge:null },
  { id:"game", title:"শব্দ খেলা", sub:"লেভেল ৪ আনলক হয়েছে", bg:"var(--card-green)", accent:"var(--accent-green)", icon:<GamepadSVG/>, badge:"🔓" },
  { id:"trace", title:"ট্রেসিং", sub:"চর্চা শুরু করো", bg:"var(--card-purple)", accent:"var(--accent-purple)", icon:<PencilSVG/>, badge:null },
];

const sampleText = "আমি বাংলা পড়তে ভালোবাসি। আকাশ নীল, মাঠ সবুজ।";

const navItems = [
  { id:"home", label:"হোম", icon:<HomeSVG/> },
  { id:"progress", label:"অগ্রগতি", icon:<StarSVG size={28}/> },
  { id:"rewards", label:"পুরস্কার", icon:<TrophySVG/> },
  { id:"activity", label:"কার্যক্রম", icon:<ActivitySVG/> },
  { id:"settings", label:"সেটিংস", icon:<SettingsSVG/> },
];

// ─── Progress Page ────────────────────────────────────────────────────────────
function ProgressPage() {
  const stats = [
    { label:"মোট পড়া", value:"১২ টি", color:"#4a90d9" },
    { label:"স্ট্রিক", value:"৫ দিন", color:"#f5a623" },
    { label:"স্কোর", value:"৮৫%", color:"#3cb371" },
    { label:"ব্যাজ", value:"৩ টি", color:"#8b5cf6" },
  ];
  const days = ["সো","মঙ","বু","বৃ","শু","শ","র"];
  const done = [true,true,true,true,true,false,false];
  return (
    <div style={{padding:"24px 20px"}}>
      <h2 style={{fontSize:22,fontWeight:700,color:"#2d2d2d",marginBottom:20}}>আমার অগ্রগতি</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
        {stats.map(s=>(
          <motion.div key={s.label} whileHover={{scale:1.03}}
            style={{background:"white",borderRadius:16,padding:"18px 14px",
              boxShadow:"0 4px 16px rgba(0,0,0,.06)",textAlign:"center"}}>
            <div style={{fontSize:26,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:13,color:"#888",marginTop:4}}>{s.label}</div>
          </motion.div>
        ))}
      </div>
      <div style={{background:"white",borderRadius:20,padding:20,boxShadow:"0 4px 16px rgba(0,0,0,.06)",marginBottom:20}}>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:14,color:"#333"}}>এই সপ্তাহের স্ট্রিক</h3>
        <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
          {days.map((d,i)=>(
            <div key={d} style={{textAlign:"center"}}>
              <div style={{width:36,height:36,borderRadius:"50%",
                background:done[i]?"#ffd700":"#f0f0f0",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:18,marginBottom:4}}>
                {done[i]?"⭐":"○"}
              </div>
              <div style={{fontSize:11,color:"#888"}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"white",borderRadius:20,padding:20,boxShadow:"0 4px 16px rgba(0,0,0,.06)"}}>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:14,color:"#333"}}>সাম্প্রতিক কার্যক্রম</h3>
        {[{t:"পড়া — পাঠ ৩",d:"আজ",s:"★★★"},{t:"ফোনেমস চর্চা",d:"গতকাল",s:"★★☆"},{t:"শব্দ খেলা লেভেল ৪",d:"২ দিন আগে",s:"★★★"}].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"12px 0",borderBottom:i<2?"1px solid #f0f0f0":"none"}}>
            <div>
              <div style={{fontWeight:600,fontSize:14}}>{r.t}</div>
              <div style={{fontSize:12,color:"#aaa"}}>{r.d}</div>
            </div>
            <div style={{color:"#f5a623",fontSize:16}}>{r.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rewards Page ─────────────────────────────────────────────────────────────
function RewardsPage() {
  const badges = [
    {emoji:"🏆",label:"পাঠ চ্যাম্পিয়ন",earned:true},
    {emoji:"⭐",label:"৫ দিনের স্ট্রিক",earned:true},
    {emoji:"🎯",label:"নিখুঁত স্কোর",earned:true},
    {emoji:"📚",label:"১০ টি পাঠ",earned:false},
    {emoji:"🎮",label:"গেম মাস্টার",earned:false},
    {emoji:"✏️",label:"ট্রেসিং হিরো",earned:false},
  ];
  return (
    <div style={{padding:"24px 20px"}}>
      <h2 style={{fontSize:22,fontWeight:700,color:"#2d2d2d",marginBottom:6}}>পুরস্কার</h2>
      <p style={{fontSize:14,color:"#888",marginBottom:20}}>তুমি এখন পর্যন্ত ৩ টি ব্যাজ পেয়েছ!</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
        {badges.map((b,i)=>(
          <motion.div key={i} whileHover={{scale:1.05}} whileTap={{scale:.95}}
            style={{background:b.earned?"white":"#f9f9f9",borderRadius:16,padding:"16px 8px",
              textAlign:"center",boxShadow:b.earned?"0 4px 16px rgba(0,0,0,.08)":"none",
              border:b.earned?"2px solid #ffd700":"2px dashed #ddd",
              opacity:b.earned?1:.5}}>
            <div style={{fontSize:32,marginBottom:8}}>{b.emoji}</div>
            <div style={{fontSize:11,fontWeight:600,color:b.earned?"#333":"#aaa",lineHeight:1.3}}>{b.label}</div>
            {b.earned && <div style={{fontSize:10,color:"#f5a623",marginTop:4}}>✓ অর্জিত</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Page ────────────────────────────────────────────────────────────
function ActivityPage() {
  const lessons = [
    {title:"পাঠ ১ — আমার পরিবার",level:"সহজ",done:true,icon:"📖"},
    {title:"পাঠ ২ — আমাদের গ্রাম",level:"সহজ",done:true,icon:"🏡"},
    {title:"পাঠ ৩ — পাখির গান",level:"মধ্যম",done:false,icon:"🐦"},
    {title:"পাঠ ৪ — আকাশ ও তারা",level:"মধ্যম",done:false,icon:"⭐"},
  ];
  return (
    <div style={{padding:"24px 20px"}}>
      <h2 style={{fontSize:22,fontWeight:700,color:"#2d2d2d",marginBottom:20}}>কার্যক্রম</h2>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {lessons.map((l,i)=>(
          <motion.div key={i} whileHover={{x:4}} whileTap={{scale:.98}}
            style={{background:"white",borderRadius:18,padding:"16px 18px",
              display:"flex",alignItems:"center",gap:14,
              boxShadow:"0 4px 16px rgba(0,0,0,.06)",
              borderLeft:`4px solid ${l.done?"#3cb371":"#e0e0e0"}`}}>
            <div style={{fontSize:28}}>{l.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15,color:"#333"}}>{l.title}</div>
              <div style={{fontSize:12,color:"#aaa",marginTop:2}}>{l.level}</div>
            </div>
            <div style={{fontSize:20}}>{l.done?"✅":"🔒"}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings / Adaptive Text Page ───────────────────────────────────────────
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
  const bgs = ["#FFF8E7","#E8F4FD","#FFFDE7","#F3E5F5","#FFFFFF"];

  const textStyle = {
    fontSize, letterSpacing:`${letterSpacing}px`,
    lineHeight, wordSpacing:`${wordSpacing}px`,
    color: textColor, fontFamily:"'Hind Siliguri', sans-serif",
    transition:"all .25s ease"
  };

  const Toggle = ({val,set,label}) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <span style={{fontSize:14,fontWeight:600,color:"#444"}}>{label}</span>
      <motion.div onClick={()=>set(!val)} whileTap={{scale:.9}}
        style={{width:48,height:26,borderRadius:13,
          background:val?"#4a90d9":"#ddd",cursor:"pointer",
          position:"relative",transition:"background .2s"}}>
        <motion.div animate={{x:val?24:2}}
          style={{width:22,height:22,borderRadius:"50%",background:"white",
            position:"absolute",top:2,boxShadow:"0 2px 4px rgba(0,0,0,.2)"}}/>
      </motion.div>
    </div>
  );

  const Slider = ({label,min,max,step=1,val,set,unit=""}) => (
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:14,fontWeight:600,color:"#444"}}>{label}</span>
        <span style={{fontSize:13,color:"#4a90d9",fontWeight:700}}>{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e=>set(Number(e.target.value))}/>
    </div>
  );

  return (
    <div style={{padding:"24px 20px"}}>
      <h2 style={{fontSize:20,fontWeight:800,color:"#2d2d2d",marginBottom:4}}>অ্যাডাপ্টিভ টেক্সট সেটিংস</h2>
      <p style={{fontSize:13,color:"#888",marginBottom:20}}>তোমার পড়ার সুবিধা অনুযায়ী সাজাও</p>

      {/* Live Preview */}
      <div style={{borderRadius:20,padding:20,marginBottom:20,background:bg,
        boxShadow:"0 4px 20px rgba(0,0,0,.08)",position:"relative",overflow:"hidden"}}>
        {ruler && (
          <div style={{position:"absolute",left:0,right:0,height:fontSize*lineHeight+8,
            top:20,background:"rgba(74,144,217,.1)",borderTop:"2px solid rgba(74,144,217,.3)",
            borderBottom:"2px solid rgba(74,144,217,.3)",pointerEvents:"none"}}/>
        )}
        <div style={{fontSize:11,color:"#aaa",marginBottom:10,fontFamily:"Atkinson Hyperlegible"}}>লাইভ প্রিভিউ</div>
        <div style={textStyle}>
          {syllable
            ? sampleText.split("").map((c,i)=>
                <span key={i} style={{background: i%3===0?"rgba(255,215,0,.35)":
                  i%3===1?"rgba(74,144,217,.2)":"transparent",borderRadius:3}}>{c}</span>)
            : sampleText
          }
        </div>
        {focusMode && (
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.04)",
            backdropFilter:"blur(0.5px)",pointerEvents:"none",borderRadius:20}}/>
        )}
      </div>

      {/* Background color */}
      <div style={{background:"white",borderRadius:20,padding:20,
        boxShadow:"0 4px 16px rgba(0,0,0,.06)",marginBottom:16}}>
        <h3 style={{fontSize:15,fontWeight:700,marginBottom:14,color:"#333"}}>পটভূমির রং</h3>
        <div style={{display:"flex",gap:10}}>
          {bgs.map(c=>(
            <motion.div key={c} whileTap={{scale:.85}} onClick={()=>setBg(c)}
              style={{width:36,height:36,borderRadius:"50%",background:c,cursor:"pointer",
                border:`3px solid ${bg===c?"#4a90d9":"#ddd"}`,
                boxShadow:bg===c?"0 0 0 2px rgba(74,144,217,.3)":"none",
                transition:"border .2s"}}/>
          ))}
          <div style={{flex:1}}>
            <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)}
              style={{width:"100%",height:36,border:"none",borderRadius:10,cursor:"pointer",padding:2}}/>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div style={{background:"white",borderRadius:20,padding:20,
        boxShadow:"0 4px 16px rgba(0,0,0,.06)",marginBottom:16}}>
        <h3 style={{fontSize:15,fontWeight:700,marginBottom:16,color:"#333"}}>টাইপোগ্রাফি</h3>
        <Slider label="ফন্ট সাইজ" min={12} max={48} val={fontSize} set={setFontSize} unit="px"/>
        <Slider label="অক্ষর ফাঁক" min={0} max={20} val={letterSpacing} set={setLetterSpacing} unit="px"/>
        <Slider label="লাইন উচ্চতা" min={1} max={3} step={0.1} val={lineHeight} set={setLineHeight}/>
        <Slider label="শব্দ ফাঁক" min={0} max={20} val={wordSpacing} set={setWordSpacing} unit="px"/>
        <Slider label="নারেশন স্পিড" min={0.5} max={1.5} step={0.05} val={narrationSpeed} set={setNarrationSpeed} unit="x"/>
      </div>

      {/* Toggles */}
      <div style={{background:"white",borderRadius:20,padding:20,
        boxShadow:"0 4px 16px rgba(0,0,0,.06)"}}>
        <h3 style={{fontSize:15,fontWeight:700,marginBottom:16,color:"#333"}}>বিশেষ মোড</h3>
        <Toggle val={ruler} set={setRuler} label="📏 রিডিং রুলার"/>
        <Toggle val={syllable} set={setSyllable} label="🔤 সিলেবল হাইলাইট"/>
        <Toggle val={focusMode} set={setFocusMode} label="🎯 ফোকাস মোড"/>
      </div>
    </div>
  );
}

// ─── Reading View ─────────────────────────────────────────────────────────────
function ReadingView({onBack}) {
  const [activeWord, setActiveWord] = useState(null);
  const [playing, setPlaying] = useState(false);
  const words = ["আমি","বাংলা","পড়তে","ভালোবাসি।","আকাশ","নীল,","মাঠ","সবুজ।","পাখি","গান","গায়।","আমরা","সবাই","খুশি।"];
  const phonemes = {
    "আমি":["আ","মি"], "বাংলা":["বাং","লা"], "পড়তে":["পড়","তে"],
    "ভালোবাসি।":["ভা","লো","বা","সি"], "আকাশ":["আ","কাশ"],
  };
  useEffect(()=>{
    if(!playing){setActiveWord(null);return;}
    let i=0;
    const iv=setInterval(()=>{
      setActiveWord(words[i]);
      i++;
      if(i>=words.length){clearInterval(iv);setPlaying(false);setActiveWord(null);}
    },600);
    return()=>clearInterval(iv);
  },[playing]);

  return (
    <div style={{padding:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <motion.button whileTap={{scale:.9}} onClick={onBack}
          style={{width:40,height:40,borderRadius:"50%",border:"none",
            background:"white",cursor:"pointer",fontSize:18,
            boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>←</motion.button>
        <h2 style={{fontSize:18,fontWeight:700,color:"#2d2d2d"}}>পাঠ ১ — আমার পরিবার</h2>
      </div>
      <div style={{background:"#FFF8E7",borderRadius:20,padding:20,
        boxShadow:"0 4px 20px rgba(0,0,0,.08)",marginBottom:20,lineHeight:2.2,
        fontSize:20,letterSpacing:"2px",wordSpacing:"8px",color:"#2D1B00",
        fontFamily:"'Hind Siliguri', sans-serif"}}>
        {words.map((w,i)=>(
          <motion.span key={i} onClick={()=>setActiveWord(w===activeWord?null:w)}
            animate={{
              backgroundColor:activeWord===w?"#FFD700":"transparent",
              scale:activeWord===w?1.08:1
            }}
            style={{display:"inline-block",cursor:"pointer",borderRadius:6,
              padding:"2px 4px",marginRight:4}}>
            {w}
          </motion.span>
        ))}
      </div>
      {activeWord && phonemes[activeWord] && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
          style={{background:"white",borderRadius:16,padding:16,marginBottom:16,
            boxShadow:"0 4px 16px rgba(0,0,0,.08)"}}>
          <div style={{fontSize:13,color:"#888",marginBottom:10}}>ফোনেম ভাঙন: {activeWord}</div>
          <div style={{display:"flex",gap:10}}>
            {phonemes[activeWord].map((p,i)=>(
              <div key={i} style={{background:"#dbeeff",borderRadius:12,padding:"10px 16px",
                fontSize:20,fontWeight:700,color:"#2d5fa6"}}>
                {p}
              </div>
            ))}
          </div>
        </motion.div>
      )}
      <div style={{display:"flex",gap:12}}>
        <motion.button whileTap={{scale:.95}}
          onClick={()=>setPlaying(!playing)}
          style={{flex:1,padding:"14px",borderRadius:16,border:"none",
            background:playing?"#ff6b6b":"#4a90d9",color:"white",
            fontSize:16,fontWeight:700,cursor:"pointer",
            boxShadow:`0 4px 14px ${playing?"rgba(255,107,107,.4)":"rgba(74,144,217,.4)"}`}}>
          {playing?"⏸ থামো":"▶ পড়া শুরু"}
        </motion.button>
        <motion.button whileTap={{scale:.95}}
          onClick={()=>{setPlaying(false);setActiveWord(null);}}
          style={{width:52,height:52,borderRadius:16,border:"none",
            background:"white",cursor:"pointer",fontSize:18,
            boxShadow:"0 4px 14px rgba(0,0,0,.1)"}}>⏹</motion.button>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({onNav}) {
  const [view, setView] = useState("home"); // home | read | phoneme | game | trace
  const navigate = useNavigate();
  const progress = 3/5;

  if(view==="read") return <ReadingView onBack={()=>setView("home")}/>;
  if(view==="phoneme") return <PhonemeView onBack={()=>setView("home")}/>;
  if(view==="game") return <GameView onBack={()=>setView("home")}/>;
  if(view==="trace") return <TraceView onBack={()=>setView("home")}/>;

  return (
    <div>
      {/* Header BG */}
      <div style={{background:"linear-gradient(135deg,#e8f5ff 0%,#fff8e7 100%)",
        padding:"20px 20px 14px",position:"relative",overflow:"hidden"}}>
        {/* Decorations */}
        <div style={{position:"absolute",top:10,right:80}}><CloudSVG w={50} op={0.6}/></div>
        <div style={{position:"absolute",top:30,right:140}}><CloudSVG w={35} op={0.4}/></div>
        <div style={{position:"absolute",top:8,right:14}}>
          <motion.div animate={{rotate:[0,10,-10,0]}} transition={{repeat:Infinity,duration:4}}>
            <SunSVG/>
          </motion.div>
        </div>
        {/* Stars */}
        {[[10,10],[50,5],[70,20]].map(([x,y],i)=>(
          <motion.div key={i} animate={{opacity:[.4,1,.4]}}
            transition={{repeat:Infinity,duration:2+i*0.5,delay:i*0.3}}
            style={{position:"absolute",left:`${x}%`,top:`${y}%`,fontSize:10,color:"#ffd700"}}>★</motion.div>
        ))}
        {/* Avatar + greeting */}
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <motion.div whileHover={{scale:1.08}} style={{borderRadius:"50%",
            border:"3px solid white",boxShadow:"0 4px 12px rgba(0,0,0,.15)",cursor:"pointer"}}>
            <AvatarSVG/>
          </motion.div>
          <div>
            <div style={{fontSize:26,fontWeight:800,color:"#1a1a2e",letterSpacing:-0.5}}>
              হ্যালো, রাইহান! 🌿
            </div>
            <div style={{fontSize:14,color:"#555",marginTop:2,display:"flex",alignItems:"center",gap:4}}>
              ৫ দিনের স্ট্রিক <motion.span animate={{scale:[1,1.3,1]}}
                transition={{repeat:Infinity,duration:1.5}} style={{display:"inline-block"}}>⭐</motion.span> চালিয়ে যাও!
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 18px"}}>
        {/* Today's Goal */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          style={{background:"white",borderRadius:20,padding:"18px 20px",
            boxShadow:"0 4px 20px rgba(0,0,0,.07)",marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:17,fontWeight:800,color:"#2d2d2d"}}>আজকের লক্ষ্য</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:22,fontWeight:800,color:"#3cb371"}}>৩</span>
              <span style={{fontSize:16,color:"#aaa",fontWeight:400}}>/৫</span>
              <span style={{fontSize:13,color:"#888"}}> টি কাজ সম্পন্ন</span>
              <motion.div animate={{rotate:[0,15,-15,0]}} transition={{repeat:Infinity,duration:2}}>
                <StarSVG size={28}/>
              </motion.div>
            </div>
          </div>
          <div style={{background:"#f0f0f0",borderRadius:100,height:12,overflow:"hidden"}}>
            <motion.div initial={{width:0}} animate={{width:`${progress*100}%`}}
              transition={{duration:1,ease:"easeOut"}}
              style={{height:"100%",borderRadius:100,
                background:"linear-gradient(90deg,#56e39f,#3cb371)"}}>
              <div style={{height:"100%",background:"repeating-linear-gradient(90deg,transparent,transparent 10px,rgba(255,255,255,.2) 10px,rgba(255,255,255,.2) 20px)",borderRadius:100}}/>
            </motion.div>
          </div>
        </motion.div>

        {/* Activity Grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {activities.map((act,i)=>(
            <motion.div key={act.id}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              transition={{delay:i*0.1}}
              whileHover={{y:-4,boxShadow:"0 12px 32px rgba(0,0,0,.12)"}}
              whileTap={{scale:.96}}
              onClick={()=> act.id === "read" ? navigate('/reading') : setView(act.id)}
              style={{background:act.bg,borderRadius:20,padding:"18px 14px",
                cursor:"pointer",position:"relative",overflow:"hidden",
                boxShadow:"0 4px 16px rgba(0,0,0,.07)"}}>
              {act.badge && (
                <div style={{position:"absolute",top:10,right:10,
                  background:act.accent,color:"white",fontSize:10,fontWeight:700,
                  borderRadius:100,padding:"2px 8px"}}>{act.badge}</div>
              )}
              <motion.div animate={{y:[0,-4,0]}}
                transition={{repeat:Infinity,duration:2.5,delay:i*0.4}}>
                {act.icon}
              </motion.div>
              <div style={{fontSize:17,fontWeight:800,color:"#1a1a2e",marginTop:10,marginBottom:4}}>
                {act.title}
              </div>
              <div style={{fontSize:12,color:"#666",marginBottom:14}}>{act.sub}</div>
              <motion.div whileHover={{x:4}}
                style={{width:32,height:32,borderRadius:"50%",
                  background:act.accent,display:"flex",alignItems:"center",justifyContent:"center",
                  marginLeft:"auto",color:"white",fontWeight:800,fontSize:16}}>›</motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Phoneme View ─────────────────────────────────────────────────────────────
function PhonemeView({onBack}) {
  const [active, setActive] = useState(null);
  const letters = ["অ","আ","ই","ঈ","উ","ঊ","ক","খ","গ","ঘ","চ","ছ","জ","ঝ","ট","ঠ","ড","ঢ","ত","থ","দ","ধ","ন","প","ফ","ব","ভ","ম","য","র","ল","শ","ষ","স","হ"];
  const colors = ["#dbeeff","#fff3d4","#d9f5e5","#ede8ff","#ffe0e0"];
  return (
    <div style={{padding:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <motion.button whileTap={{scale:.9}} onClick={onBack}
          style={{width:40,height:40,borderRadius:"50%",border:"none",
            background:"white",cursor:"pointer",fontSize:18,
            boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>←</motion.button>
        <h2 style={{fontSize:18,fontWeight:700}}>ফোনেমস — অক্ষর চর্চা</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
        {letters.map((l,i)=>(
          <motion.div key={l} whileTap={{scale:.85}}
            animate={{backgroundColor:active===l?colors[i%5]:"white",
              scale:active===l?1.1:1}}
            onClick={()=>setActive(active===l?null:l)}
            style={{borderRadius:14,padding:"12px 0",textAlign:"center",
              fontSize:22,fontWeight:700,cursor:"pointer",
              boxShadow:"0 2px 8px rgba(0,0,0,.06)",fontFamily:"'Hind Siliguri',sans-serif",
              color:"#333"}}>
            {l}
          </motion.div>
        ))}
      </div>
      {active && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
          style={{background:"#dbeeff",borderRadius:18,padding:20,marginTop:20,textAlign:"center"}}>
          <div style={{fontSize:56,fontWeight:800,color:"#2d5fa6",marginBottom:8}}>{active}</div>
          <div style={{fontSize:14,color:"#555"}}>এই অক্ষরটি চেনো!</div>
          <motion.button whileTap={{scale:.95}}
            style={{marginTop:12,padding:"10px 24px",borderRadius:30,
              border:"none",background:"#4a90d9",color:"white",
              fontWeight:700,fontSize:15,cursor:"pointer"}}>
            🔊 শুনো
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Word Game ────────────────────────────────────────────────────────────────
function GameView({onBack}) {
  const words = [
    {q:"🏡",ans:"বাড়ি",opts:["বাড়ি","পাখি","মাছি"]},
    {q:"📚",ans:"বই",opts:["গাছ","বই","ফুল"]},
    {q:"🌸",ans:"ফুল",opts:["ফুল","চাঁদ","তারা"]},
  ];
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);
  const choose = (opt) => {
    if(chosen) return;
    setChosen(opt);
    if(opt===words[qi].ans) setScore(s=>s+1);
    setTimeout(()=>{
      if(qi+1<words.length){setQi(q=>q+1);setChosen(null);}
      else setDone(true);
    },900);
  };
  if(done) return (
    <div style={{padding:30,textAlign:"center"}}>
      <motion.button whileTap={{scale:.9}} onClick={onBack}
        style={{width:40,height:40,borderRadius:"50%",border:"none",
          background:"white",cursor:"pointer",fontSize:18,display:"block",marginBottom:20,
          boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>←</motion.button>
      <div style={{fontSize:60,marginBottom:16}}>🎉</div>
      <h2 style={{fontSize:24,fontWeight:800,marginBottom:8}}>শাবাশ!</h2>
      <div style={{fontSize:18,color:"#555"}}>স্কোর: {score}/{words.length}</div>
      <div style={{margin:"20px 0"}}>{"⭐".repeat(score)}</div>
      <motion.button whileTap={{scale:.95}} onClick={()=>{setQi(0);setScore(0);setChosen(null);setDone(false);}}
        style={{padding:"14px 32px",borderRadius:30,border:"none",
          background:"#4a90d9",color:"white",fontWeight:700,fontSize:16,cursor:"pointer"}}>
        আবার খেলো
      </motion.button>
    </div>
  );
  const w = words[qi];
  return (
    <div style={{padding:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <motion.button whileTap={{scale:.9}} onClick={onBack}
          style={{width:40,height:40,borderRadius:"50%",border:"none",
            background:"white",cursor:"pointer",fontSize:18,
            boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>←</motion.button>
        <h2 style={{fontSize:18,fontWeight:700}}>শব্দ খেলা — লেভেল ৪</h2>
      </div>
      <div style={{textAlign:"center",marginBottom:30}}>
        <div style={{fontSize:80}}>{w.q}</div>
        <div style={{fontSize:15,color:"#888",marginTop:8}}>এই ছবির শব্দটি কী?</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {w.opts.map(opt=>(
          <motion.button key={opt} whileTap={{scale:.96}}
            onClick={()=>choose(opt)}
            animate={{
              background: chosen ? (opt===w.ans?"#d9f5e5": opt===chosen?"#ffe0e0":"white") : "white",
              scale: chosen===opt?1.04:1
            }}
            style={{padding:"16px",borderRadius:16,border:"2px solid",
              borderColor: chosen?(opt===w.ans?"#3cb371":opt===chosen?"#ff6b6b":"#eee"):"#eee",
              fontSize:20,fontWeight:700,cursor:"pointer",
              fontFamily:"'Hind Siliguri',sans-serif",color:"#333"}}>
            {opt}
          </motion.button>
        ))}
      </div>
      <div style={{textAlign:"center",marginTop:20,fontSize:13,color:"#aaa"}}>
        প্রশ্ন {qi+1}/{words.length}
      </div>
    </div>
  );
}

// ─── Trace View ───────────────────────────────────────────────────────────────
function TraceView({onBack}) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const ctx = useRef(null);
  const [letter, setLetter] = useState("অ");
  const letters = ["অ","আ","ক","খ","গ","ঘ"];
  useEffect(()=>{
    const c = canvasRef.current;
    ctx.current = c.getContext("2d");
    ctx.current.lineWidth=6;ctx.current.lineCap="round";
    ctx.current.strokeStyle="#4a90d9";
    // watermark
    ctx.current.font="140px 'Hind Siliguri'";
    ctx.current.fillStyle="rgba(74,144,217,.1)";
    ctx.current.textAlign="center";
    ctx.current.fillText(letter,c.width/2,c.height*0.7);
  },[letter]);
  const getPos=(e,c)=>{const r=c.getBoundingClientRect();const src=e.touches?e.touches[0]:e;return[src.clientX-r.left,src.clientY-r.top];};
  const start=e=>{drawing.current=true;const[x,y]=getPos(e,canvasRef.current);ctx.current.beginPath();ctx.current.moveTo(x,y);};
  const move=e=>{if(!drawing.current)return;e.preventDefault();const[x,y]=getPos(e,canvasRef.current);ctx.current.lineTo(x,y);ctx.current.stroke();};
  const end=()=>{drawing.current=false;};
  const clear=()=>{const c=canvasRef.current;ctx.current.clearRect(0,0,c.width,c.height);ctx.current.font="140px 'Hind Siliguri'";ctx.current.fillStyle="rgba(74,144,217,.1)";ctx.current.textAlign="center";ctx.current.fillText(letter,c.width/2,c.height*0.7);};
  return (
    <div style={{padding:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <motion.button whileTap={{scale:.9}} onClick={onBack}
          style={{width:40,height:40,borderRadius:"50%",border:"none",
            background:"white",cursor:"pointer",fontSize:18,
            boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>←</motion.button>
        <h2 style={{fontSize:18,fontWeight:700}}>ট্রেসিং — অক্ষর চর্চা</h2>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {letters.map(l=>(
          <motion.button key={l} whileTap={{scale:.9}} onClick={()=>{setLetter(l);clear();}}
            style={{padding:"8px 16px",borderRadius:30,border:"2px solid",
              borderColor:letter===l?"#4a90d9":"#ddd",
              background:letter===l?"#dbeeff":"white",
              fontWeight:700,fontSize:18,cursor:"pointer",
              fontFamily:"'Hind Siliguri',sans-serif",color:"#333"}}>
            {l}
          </motion.button>
        ))}
      </div>
      <div style={{borderRadius:20,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.1)",
        background:"#FFF8E7",border:"2px solid #e0d5c3"}}>
        <canvas ref={canvasRef} width={390} height={300}
          style={{display:"block",touchAction:"none",width:"100%"}}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}/>
      </div>
      <div style={{display:"flex",gap:12,marginTop:16}}>
        <motion.button whileTap={{scale:.95}} onClick={clear}
          style={{flex:1,padding:"14px",borderRadius:16,border:"none",
            background:"white",fontWeight:700,fontSize:15,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(0,0,0,.08)",color:"#555"}}>
          🗑️ মুছো
        </motion.button>
        <motion.button whileTap={{scale:.95}}
          style={{flex:1,padding:"14px",borderRadius:16,border:"none",
            background:"#3cb371",color:"white",fontWeight:700,fontSize:15,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(60,179,113,.3)"}}>
          ✅ সম্পন্ন
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");

  const pages = {
    home: <HomePage onNav={setTab}/>,
    progress: <ProgressPage/>,
    rewards: <RewardsPage/>,
    activity: <ActivityPage/>,
    settings: <SettingsPage/>,
  };

  return (
    <div className="app-wrap" style={{fontFamily:"'Hind Siliguri',sans-serif"}}>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
          exit={{opacity:0,y:-12}} transition={{duration:.2}} style={{minHeight:"calc(100vh - 90px)"}}>
          {pages[tab]}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:430,background:"white",
        borderTop:"1px solid #f0ebe0",
        boxShadow:"0 -4px 20px rgba(0,0,0,.08)",
        display:"flex",justifyContent:"space-around",alignItems:"center",
        padding:"8px 0 14px",zIndex:100}}>
        {navItems.map(n=>(
          <motion.button key={n.id} whileTap={{scale:.85}} onClick={()=>setTab(n.id)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              border:"none",background:"none",cursor:"pointer",
              padding:"4px 8px",borderRadius:16,
              opacity:tab===n.id?1:0.45,
              color:tab===n.id?"#4a90d9":"#888"}}>
            <motion.div animate={{scale:tab===n.id?1.15:1,y:tab===n.id?-2:0}}
              transition={{type:"spring",stiffness:400}}>
              {n.icon}
            </motion.div>
            <span style={{fontSize:11,fontWeight:tab===n.id?700:400,
              color:tab===n.id?"#4a90d9":"#888"}}>
              {n.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
