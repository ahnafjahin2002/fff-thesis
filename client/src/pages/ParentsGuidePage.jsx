import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import parentChildImg from "../assets/parent-child-reading.png";
import brainMascotImg from "../assets/brain-mascot.png";
import familyCelebImg from "../assets/family-celebration.png";
import appPreviewImg from "../assets/app-preview-illustration.png";
import "./ParentsGuidePage.css";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const tips = [
  { icon: "⏰", text: "প্রতিদিন ১০ - ১৫ মিনিট। বেশি নয়।" },
  { icon: "🎉", text: 'ছোট সাফল্যেও প্রশংসা করুন। "বাহ!" যথেষ্ট।' },
  { icon: "🔇", text: "পড়তে দেরি হলে তাড়া দেবেন না।" },
  { icon: "👀", text: "পাশে বসুন। সন্তানকে দেখতে দিন আপনি যত্নশীল।" },
];

const donts = [
  '"তুমি কেন পারছ না?" — এটি বলবেন না',
  "অন্য শিশুর সাথে তুলনা করবেন না",
  "জোর করে পড়াতে বসাবেন না",
  "সমস্যা লুকাবেন না — শিক্ষককে জানান",
];

const badges = [
  "কতটি অক্ষর শিখেছে",
  "কতটি শব্দ বানান করতে পেরেছে",
  "কতটি কথোপকথন সম্পন্ন করেছে",
];

export default function ParentsGuidePage() {
  const navigate = useNavigate();

  return (
    <main className="parents-guide">
      {/* ── Navbar ── */}
      <motion.nav
        className="pg-navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <a href="/" className="pg-logo" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          <span className="pg-logo-icon">🧠</span>
          <span>
            <strong>পড়তে পারি</strong>
            <small>সহজে শেখা, আনন্দে থাকা</small>
          </span>
        </a>

        <button
          className="pg-back-btn"
          onClick={() => navigate("/")}
          type="button"
        >
          ← হোমে ফিরুন
        </button>
      </motion.nav>

      {/* ── Hero Section ── */}
      <motion.section 
        className="pg-hero-section"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <div className="pg-hero-content">
          <motion.div className="pg-badge-pill" variants={fadeUp}>
            <span role="img" aria-label="family">👨‍👩‍👧‍👦</span> অভিভাবকদের জন্য বিশেষ গাইড
          </motion.div>
          <motion.h1 variants={fadeUp}>
            আপনার সন্তানের <span>শেখায় সঙ্গী হোন</span>
          </motion.h1>
          <motion.p variants={fadeUp}>
            ডিসলেক্সিয়া কোনো বাধা নয়, এটি শুধু একটু ভিন্নভাবে শেখার ধরন। 
            সঠিক টুল ও আপনার ভালোবাসায় আপনার সন্তানও পারে চমৎকার পড়তে ও শিখতে।
          </motion.p>
          <motion.div variants={fadeUp} className="pg-hero-actions">
            <button className="pg-primary-btn" onClick={() => document.getElementById('guide-content')?.scrollIntoView({ behavior: 'smooth' })}>
              গাইডটি পড়ুন ↓
            </button>
          </motion.div>
        </div>
        
        <motion.div className="pg-hero-visual" variants={fadeUp}>
          <div className="pg-image-wrapper">
             <img src={parentChildImg} alt="Parent and child reading" className="pg-hero-img" />
             <motion.div className="pg-floating-element pg-float-1" animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>✨</motion.div>
             <motion.div className="pg-floating-element pg-float-2" animate={{ y: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>📚</motion.div>
             <motion.div className="pg-floating-element pg-float-3" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>💡</motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* ── Main Content Container ── */}
      <motion.div
        id="guide-content"
        className="pg-container"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Card 1: ডিসলেক্সিয়া কী - Split layout with Brain Mascot */}
        <motion.div className="pg-card pg-card-split orange-accent" variants={fadeUp}>
          <div className="pg-card-text">
            <div className="pg-card-icon orange-icon">🧠</div>
            <h2>ডিসলেক্সিয়া কী?</h2>
            <p>
              ডিসলেক্সিয়া একটি শেখার পার্থক্য — এটি বুদ্ধিমত্তার সমস্যা নয়।
              ডিসলেক্সিক শিশুরা প্রায়ই অক্ষর চেনা, বানান করা এবং পড়তে সমস্যায়
              পড়ে — কিন্তু সঠিক সহায়তায় তারা দারুণভাবে এগিয়ে যেতে পারে।
            </p>
            <div className="pg-highlight">
              <span className="pg-quote-mark">❝</span>
              আপনার সন্তান অলস নয়। তার মস্তিষ্ক শুধু একটু ভিন্নভাবে কাজ করে।
              <span className="pg-quote-mark">❞</span>
            </div>
          </div>
          <div className="pg-card-visual">
            <motion.img 
              src={brainMascotImg} 
              alt="Brain Mascot" 
              className="pg-mascot-img"
              whileHover={{ scale: 1.05, rotate: 3 }}
            />
          </div>
        </motion.div>

        <div className="pg-grid-2col">
          {/* Card 2: এই টুল কীভাবে কাজ করে */}
          <motion.div className="pg-card blue-accent" variants={fadeUp}>
            <div className="pg-card-icon blue-icon">📱</div>
            <h2>এই টুল কীভাবে কাজ করে?</h2>
            <p>আমাদের প্ল্যাটফর্মে তিনটি মূল ফিচার আছে:</p>
            <ul className="pg-feature-list">
              <li>
                <span className="pg-bullet mint-bg">১</span>
                <div>
                  <strong>অভিযোজিত টেক্সট ভিজুয়ালাইজেশন</strong>
                  <span>জটিল বাংলা শব্দ ভেঙে দেখায়</span>
                </div>
              </li>
              <li>
                <span className="pg-bullet blue-bg">২</span>
                <div>
                  <strong>ফোনেম হাইলাইটিং</strong>
                  <span>শব্দ পড়ার সময় শব্দাংশ আলাদা করে দেখায়</span>
                </div>
              </li>
              <li>
                <span className="pg-bullet purple-bg">৩</span>
                <div>
                  <strong>গেমিফাইড লার্নিং</strong>
                  <span>বর্ণের দোকান গেমে খেলার ছলে পড়তে শেখে</span>
                </div>
              </li>
            </ul>
            <motion.div 
              className="pg-app-preview-container"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img src={appPreviewImg} alt="App Preview Illustration" className="pg-app-preview-img" />
            </motion.div>
          </motion.div>

          <div className="pg-grid-col-stack">
            {/* Card 3: আপনি বাড়িতে যা করতে পারেন */}
            <motion.div className="pg-card green-accent" variants={fadeUp}>
              <div className="pg-card-icon green-icon">✅</div>
              <h2>আপনি বাড়িতে যা করতে পারেন</h2>
              <div className="pg-tip-grid">
                {tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    className="pg-tip"
                    whileHover={{ y: -6, scale: 1.02 }}
                  >
                    <span className="pg-tip-icon">{tip.icon}</span>
                    <p>{tip.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Card 4: যা করবেন না */}
            <motion.div className="pg-card red-accent" variants={fadeUp}>
              <div className="pg-card-icon red-icon">⚠️</div>
              <h2>যা করবেন না</h2>
              <ul className="pg-dont-list">
                {donts.map((item, i) => (
                  <li key={i}>
                    <span className="pg-dont-x">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Card 5: অগ্রগতি - Split layout with Celebration */}
        <motion.div className="pg-card pg-card-split purple-accent" variants={fadeUp}>
           <div className="pg-card-visual pg-visual-left">
            <motion.img 
              src={familyCelebImg} 
              alt="Family Celebration" 
              className="pg-celebration-img"
              whileHover={{ scale: 1.03 }}
            />
          </div>
          <div className="pg-card-text">
            <div className="pg-card-icon purple-icon">📊</div>
            <h2>অগ্রগতি কীভাবে বুঝবেন?</h2>
            <p>এই টুলে আপনার সন্তানের প্রতিটি অর্জন দেখা যাবে:</p>
            <div className="pg-badge-wrap">
              {badges.map((b, i) => (
                <span key={i} className="pg-badge">
                  <span className="pg-check">✔</span> {b}
                </span>
              ))}
            </div>
            <div className="pg-coming-soon">
              <span className="pg-cs-icon">🚀</span>
              ড্যাশবোর্ডে লগইন করে আপনি এই তথ্য দেখতে পাবেন।
              <em> (শীঘ্রই আসছে)</em>
            </div>
          </div>
        </motion.div>

        {/* Card 6: মনে রাখবেন */}
        <motion.div className="pg-card inspire-accent pg-card-center" variants={fadeUp}>
          <div className="pg-card-icon inspire-icon">💬</div>
          <h2>মনে রাখবেন</h2>
          <p className="pg-inspire-text">
            ডিসলেক্সিয়া আছে এমন অনেক মানুষ জীবনে অনেক বড় সাফল্য পেয়েছেন।
            <br />
            <strong>আপনার সন্তানের সবচেয়ে বড় শক্তি হলেন আপনি।</strong>
          </p>
          <motion.div
            className="pg-heart-float"
            animate={{ scale: [1, 1.2, 1], y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            💚
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── CTA ── */}
      <motion.section
        className="pg-cta-strip"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="pg-cta-content">
            <h2>প্রস্তুত আপনার সন্তানের শেখার যাত্রায়?</h2>
            <p>আজই আমাদের ড্যাশবোর্ডে যুক্ত হোন এবং পরিবর্তন দেখতে শুরু করুন।</p>
        </div>
        <button
          className="pg-cta-btn-large"
          onClick={() => navigate("/dashboard")}
          type="button"
        >
          🚀 ড্যাশবোর্ডে যান
        </button>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="pg-footer">
        <span>💚</span>
        প্রতিটি শিশুই শিখতে পারে, শুধু প্রয়োজন সঠিক সহায়তার
        <span>💚</span>
      </footer>
    </main>
  );
}
