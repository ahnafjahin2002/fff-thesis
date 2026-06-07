import { motion } from "framer-motion";
import heroKid from "../assets/fff-hero-child-rainbow.png";
import "./LandingPage.css";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.11,
    },
  },
};

const features = [
  {
    title: "সহজে পড়া",
    text: "ধাপে ধাপে পড়ার চর্চা, বড় অক্ষর ও সহজ শব্দে।",
    icon: "📖",
    className: "mint",
    arrow: "green",
  },
  {
    title: "শুনে শেখা",
    text: "অডিও শুনে শব্দ, বাক্য ও উচ্চারণ বোঝা আরও সহজ।",
    icon: "🎧",
    className: "blue",
    arrow: "blue",
  },
  {
    title: "খেলতে খেলতে শেখা",
    text: "মজার গেম ও পাজল দিয়ে শেখা হবে আনন্দের।",
    icon: "🎮",
    className: "purple",
    arrow: "purple",
  },
  {
    title: "বলতে ও লিখতে শেখা",
    text: "উচ্চারণ, লেখা ও কথার চর্চায় আত্মবিশ্বাস বাড়ে।",
    icon: "✏️",
    className: "pink",
    arrow: "pink",
  },
  {
    title: "অগ্রগতি ট্র্যাক করুন",
    text: "শিশুর অগ্রগতি দেখুন সহজ গ্রাফ ও রিপোর্টে।",
    icon: "📊",
    className: "cream",
    arrow: "orange",
  },
];

export default function LandingPage() {
  return (
    <main className="fff-landing">
      <motion.nav
        className="fff-navbar"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <a href="/" className="fff-logo">
          <span className="logo-brain">🧠</span>

          <span>
            <strong>পড়তে পারি</strong>
            <small>সহজে শেখা, আনন্দে থাকা</small>
          </span>
        </a>

        <div className="fff-navlinks">
          <a className="active" href="/">
            হোম
          </a>
          <a href="#how">কিভাবে কাজ করে</a>
          <a href="#parents">অভিভাবকদের জন্য</a>
          <a href="#resources">সম্পদ</a>
          <a href="#contact">যোগাযোগ</a>
        </div>

        <button className="language-btn" type="button">
          <span>🌐</span>
          বাংলা
          <span>⌄</span>
        </button>
      </motion.nav>

      <section className="hero-section">
        <motion.div
          className="hero-copy"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div className="safe-pill" variants={fadeUp}>
            <span>🌱</span>
            ডিসলেক্সিক শিশুদের জন্য বন্ধুসুলভ শেখার প্ল্যাটফর্ম
          </motion.div>

          <motion.h1 variants={fadeUp}>
            <span>পড়া হবে সহজ,</span>
            <span>শেখা হবে আনন্দের</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="hero-description">
            এখানে পড়ে, শুনে, বুঝে ও চর্চার মাধ্যমে শিশুর আত্মবিশ্বাস,
            ভালোবাসা আর সফলতা ধীরে ধীরে গড়ে উঠবে।
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp}>
            <a className="primary-cta" href="/dashboard">
              

              <span>
                চল শুরু করি
                <small>বিনামূল্যে শুরু করুন</small>
              </span>
            </a>

            <a className="secondary-cta" href="#how">
              <span className="play-icon">▶</span>

              <span>
                কিভাবে কাজ করে?
                <small>একটি ছোট ভিডিও দেখুন</small>
              </span>
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          <motion.div
            className="floating-badge letter-a"
            animate={{ y: [0, -12, 0], rotate: [-3, 5, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            আ
          </motion.div>

          <motion.div
            className="floating-badge heart-badge"
            animate={{ y: [0, 10, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            ❤
          </motion.div>

          <motion.div
            className="floating-star"
            animate={{ rotate: [0, 18, -18, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            ⭐
          </motion.div>

          <img
            src={heroKid}
            alt="রঙধনুর সামনে বই পড়ছে এমন হাসিখুশি শিশু"
            className="hero-kid"
          />
        </motion.div>
      </section>

      <motion.section
        className="feature-grid"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {features.map((feature) => (
          <motion.article
            key={feature.title}
            className={`feature-card ${feature.className}`}
            variants={fadeUp}
            whileHover={{ y: -8, transition: { duration: 0.22 } }}
          >
            <div className="feature-icon">{feature.icon}</div>

            <h2>{feature.title}</h2>

            <p>{feature.text}</p>

            <a
              href="/dashboard"
              className={`feature-arrow ${feature.arrow}`}
            >
              →
            </a>
          </motion.article>
        ))}
      </motion.section>

      <motion.section
        className="trust-strip"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.6 }}
      >
        <div className="trust-item">
          <span className="trust-icon">🛡️</span>

          <div>
            <strong>বিশেষজ্ঞদের দ্বারা তৈরি</strong>
            <p>শিক্ষাবিদ ও ডিসলেক্সিয়া বিশেষজ্ঞদের সহযোগিতায়।</p>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">💗</span>

          <div>
            <strong>নিরাপদ ও বিজ্ঞাপনমুক্ত</strong>
            <p>শিশুদের জন্য নিরাপদ, সহজ ও শান্ত ইন্টারফেস।</p>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">👨‍👩‍👧</span>

          <div>
            <strong>পরিবারের জন্য সহজ</strong>
            <p>অভিভাবক সহজেই অগ্রগতি দেখতে পারবেন।</p>
          </div>
        </div>

        <motion.div
          className="trust-star"
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ⭐
        </motion.div>
      </motion.section>

      <footer className="landing-footer">
        <span>💚</span>
        প্রতিটি শিশুই শিখতে পারে, শুধু প্রয়োজন সঠিক সহায়তার
        <span>💚</span>
      </footer>
    </main>
  );
}