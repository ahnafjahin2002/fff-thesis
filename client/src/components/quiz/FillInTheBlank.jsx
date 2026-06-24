import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAudio as playBanglaAudio } from '../../utils/audio';
import { createSession, updateProgress } from '../../utils/api';
const WORD_IMAGES = {
  // ━━━ া (আ-কার) ━━━
  "হাত":  { file: "hat.jpg",     prompt: "A real close-up photo of a human hand (palm facing up) on a plain white background" },
  "মাছ":  { file: "mach.jpg",    prompt: "A real photo of a fresh fish on a white surface, clearly showing scales and fins" },
  "গাছ":  { file: "gach.jpg",    prompt: "A real photo of a single green tree standing alone in a field, full tree visible" },
  "নাক":  { file: "nak.jpg",     prompt: "A real close-up photo of a human nose from the front, neutral expression, plain background" },
  "কান":  { file: "kan.jpg",     prompt: "A real close-up photo of a human ear, side profile, plain white background" },
  "বাস":  { file: "bus.jpg",     prompt: "A real photo of a colorful Bangladeshi local bus on a road" },
  "রাত":  { file: "raat.jpg",    prompt: "A real photo of a dark night sky with visible stars over a village or field" },
  "ডাল":  { file: "dal.jpg",     prompt: "A real photo of a bowl of Bengali yellow lentil dal (soup) on a wooden table" },
  "পাল":  { file: "pal.jpg",     prompt: "A real photo of a white sail on a traditional wooden boat on a river in Bangladesh" },
  "তাল":  { file: "taal.jpg",    prompt: "A real photo of a palm tree (তাল গাছ) with fruit clusters, Bangladesh countryside" },

  // ━━━ ি (ই-কার) ━━━
  "বাড়ি": { file: "bari.jpg",   prompt: "A real photo of a simple rural house in Bangladesh with a tin roof and green surroundings" },
  "দিন":  { file: "din.jpg",     prompt: "A real photo of bright sunny daytime sky over a green field, daylight scene" },
  "মিল":  { file: "mil.jpg",     prompt: "A real photo of a textile or rice mill factory building in Bangladesh" },
  "তিল":  { file: "til.jpg",     prompt: "A real close-up photo of sesame seeds (তিল) scattered on a white surface" },
  "বিল":  { file: "bil.jpg",     prompt: "A real photo of a large open wetland (বিল) with still water and green vegetation in Bangladesh" },
  "শিল":  { file: "shil.jpg",    prompt: "A real photo of a traditional Bangladeshi stone grinding slab (শিল) used in the kitchen" },
  "পিঠ":  { file: "pith.jpg",    prompt: "A real photo of a person's bare upper back/shoulder area, plain background" },
  "পাখি": { file: "pakhi.jpg",   prompt: "A real photo of a colorful small bird perched on a branch in Bangladesh — like a kingfisher or sparrow" },
  "ছিল":  { file: "chhil.jpg",   prompt: "A real photo of an old sepia or faded photograph suggesting 'something that was/existed before'" },
  "গিত":  { file: "git.jpg",     prompt: "A real photo of a person singing into a microphone on a stage with stage lighting" },

  // ━━━ ী (ঈ-কার) ━━━
  "নদী":  { file: "nodi.jpg",    prompt: "A real photo of a wide calm river (নদী) in rural Bangladesh with green banks" },
  "বীর":  { file: "bir.jpg",     prompt: "A real photo of a statue or portrait of a brave soldier or freedom fighter (বীর) in Bangladesh" },
  "গীত":  { file: "geet.jpg",    prompt: "A real photo of a classical music performance with a Bengali singer and harmonium" },
  "শীল":  { file: "sheel.jpg",   prompt: "A real close-up photo of a smooth polished stone or a traditional শীল grinding stone" },
  "তীর":  { file: "teer.jpg",    prompt: "A real photo of a riverbank (তীর) in Bangladesh — grassy shore meeting calm water" },

  // ━━━ ু (উ-কার) ━━━
  "বুক":  { file: "buk.jpg",     prompt: "A real photo of a person placing their hand on their chest/heart area, plain background" },
  "চুল":  { file: "chul.jpg",    prompt: "A real close-up photo of long black hair (চুল) flowing or spread out on a white surface" },
  "ফুল":  { file: "ful.jpg",     prompt: "A real photo of a bright colorful flower (ফুল) — like a marigold or rose — on a green background" },
  "কুল":  { file: "kul.jpg",     prompt: "A real close-up photo of Indian jujube fruits (কুল/বরই) — small green-yellow round fruits on a branch" },
  "ধুলো": { file: "dhulo.jpg",   prompt: "A real photo of dust (ধুলো) particles visible in a ray of sunlight in a room" },
  "তুলা": { file: "tula.jpg",    prompt: "A real close-up photo of raw cotton (তুলা) bolls on a plant, fluffy white fibers visible" },
  "মুখ":  { file: "mukh.jpg",    prompt: "A real close-up photo of a child's smiling face (মুখ) looking directly at camera, plain background" },
  "গুণ":  { file: "gun.jpg",     prompt: "A real photo of a child receiving a certificate or award, symbolizing a good quality/virtue (গুণ)" },

  // ━━━ ূ (ঊ-কার) ━━━
  "মূল":  { file: "mul.jpg",     prompt: "A real close-up photo of a plant root (মূল) pulled from soil, showing root system" },
  "ভুল":  { file: "bhul.jpg",    prompt: "A real photo of a student's exam paper with red cross marks showing mistakes (ভুল)" },
  "ধূল":  { file: "dhul.jpg",    prompt: "A real photo of a dusty dirt road with visible dust cloud in dry weather" },

  // ━━━ ে (এ-কার) ━━━
  "মেলা": { file: "mela.jpg",    prompt: "A real photo of a colorful village fair (মেলা) in Bangladesh with stalls, lights, and crowd" },
  "রেখা": { file: "rekha.jpg",   prompt: "A real photo of a pencil drawing a straight line (রেখা) on white paper" },
  "ছেলে": { file: "chhele.jpg",  prompt: "A real photo of a young Bangladeshi boy (ছেলে) smiling, wearing school uniform" },
  "বেলা": { file: "bela.jpg",    prompt: "A real photo of afternoon golden hour sunlight (বেলা) over a rice field in Bangladesh" },
  "খেলা": { file: "khela.jpg",   prompt: "A real photo of children playing (খেলা) outdoors in a field in Bangladesh" },
  "দেশ":  { file: "desh.jpg",    prompt: "A real photo of the Bangladesh flag waving in front of a clear blue sky" },
  "নেশা": { file: "nesha.jpg",   prompt: "A real photo of a person deeply absorbed in playing a musical instrument or reading — showing passion/obsession (নেশা)" },
  "ফেলা": { file: "fela.jpg",    prompt: "A real photo of a hand dropping or throwing a paper into a trash bin" },
  "ঢেলা": { file: "dhela.jpg",   prompt: "A real close-up photo of a small clump or lump of mud/clay (ঢেলা) on a surface" },
  "তেল":  { file: "tel.jpg",     prompt: "A real photo of a bottle of mustard oil (সরিষার তেল) next to yellow mustard flowers, Bangladesh kitchen context" },

  // ━━━ ো (ও-কার) ━━━
  "কোল":  { file: "kol.jpg",     prompt: "A real photo of a mother holding a small child on her lap (কোলে নেওয়া), warm family scene" },
  "ঘোড়া": { file: "ghora.jpg",  prompt: "A real photo of a brown horse (ঘোড়া) standing in a field, full body visible" },
  "ছোট":  { file: "chhot.jpg",   prompt: "A real photo of a very small kitten or puppy next to a larger adult animal to show size contrast (ছোট = small)" },
  "ভোর":  { file: "bhor.jpg",    prompt: "A real photo of early dawn (ভোর) — pink and orange sunrise over a quiet village or river" },
  "খোল":  { file: "khol.jpg",    prompt: "A real photo of a traditional Bengali drum called Khol (খোল) lying on a wooden surface" },
  "বোন":  { file: "bon.jpg",     prompt: "A real photo of two sisters (বোন) smiling together, arms around each other, Bangladeshi family setting" },
  "মোম":  { file: "mom.jpg",     prompt: "A real photo of a lit white candle (মোম) with wax dripping, dark background" },
  "ঢোল":  { file: "dhol.jpg",    prompt: "A real photo of a dhol (ঢোল) drum being played at a Bengali celebration or festival" },
  "মোড়":  { file: "mor.jpg",    prompt: "A real photo of a road intersection or street corner (মোড়) in a Bangladeshi town" },
  "নোট":  { file: "note.jpg",    prompt: "A real photo of a Bangladeshi taka banknote (নোট) laid flat on a surface" },
};

const FILL_BLANK_WORDS = [
  { base: "হ_ত",  answer: "হাত",  choices: ["হাত",  "হিত",  "হুত",  "হেত"],  missingKar: "া" },
  { base: "ম_ছ",  answer: "মাছ",  choices: ["মাছ",  "মিছ",  "মুছ",  "মেছ"],  missingKar: "া" },
  { base: "গ_ছ",  answer: "গাছ",  choices: ["গাছ",  "গিছ",  "গুছ",  "গেছ"],  missingKar: "া" },
  { base: "ন_ক",  answer: "নাক",  choices: ["নাক",  "নিক",  "নুক",  "নেক"],  missingKar: "া" },
  { base: "ক_ন",  answer: "কান",  choices: ["কান",  "কিন",  "কুন",  "কেন"],  missingKar: "া" },
  { base: "ব_স",  answer: "বাস",  choices: ["বাস",  "বিস",  "বুস",  "বেস"],  missingKar: "া" },
  { base: "র_ত",  answer: "রাত",  choices: ["রাত",  "রিত",  "রুত",  "রেত"],  missingKar: "া" },
  { base: "ড_ল",  answer: "ডাল",  choices: ["ডাল",  "ডিল",  "ডুল",  "ডেল"],  missingKar: "া" },
  { base: "প_ল",  answer: "পাল",  choices: ["পাল",  "পিল",  "পুল",  "পেল"],  missingKar: "া" },
  { base: "ত_ল",  answer: "তাল",  choices: ["তাল",  "তিল",  "তুল",  "তেল"],  missingKar: "া" },
  { base: "বাড়_", answer: "বাড়ি", choices: ["বাড়ী", "বাড়ি", "বারি", "বারী"], missingKar: "ি" },
  { base: "দ_ন",  answer: "দিন",  choices: ["দিন",  "দীন",  "দেন",  "দোন"],  missingKar: "ি" },
  { base: "ম_ল",  answer: "মিল",  choices: ["মিল",  "মীল",  "মেল",  "মোল"],  missingKar: "ি" },
  { base: "ত_ল",  answer: "তিল",  choices: ["তিল",  "তীল",  "তেল",  "তোল"],  missingKar: "ি" },
  { base: "ব_ল",  answer: "বিল",  choices: ["বিল",  "বীল",  "বেল",  "বোল"],  missingKar: "ি" },
  { base: "শ_ল",  answer: "শিল",  choices: ["শিল",  "শীল",  "শেল",  "শোল"],  missingKar: "ি" },
  { base: "প_ঠ",  answer: "পিঠ",  choices: ["পিঠ",  "পীঠ",  "পেঠ",  "পোঠ"],  missingKar: "ি" },
  { base: "পাখ_", answer: "পাখি", choices: ["পাখি", "পাখী", "পাখা", "পাখে"], missingKar: "ি" },
  { base: "ছ_ল",  answer: "ছিল",  choices: ["ছিল",  "ছীল",  "ছেল",  "ছোল"],  missingKar: "ি" },
  { base: "গ_ত",  answer: "গিত",  choices: ["গিত",  "গীত",  "গেত",  "গোত"],  missingKar: "ি" },
  { base: "নদ_",  answer: "নদী",  choices: ["নদি",  "নদী",  "নদা",  "নদে"],  missingKar: "ী" },
  { base: "ব_র",  answer: "বীর",  choices: ["বির",  "বীর",  "বের",  "বোর"],  missingKar: "ী" },
  { base: "গ_ত",  answer: "গীত",  choices: ["গিত",  "গীত",  "গেত",  "গোত"],  missingKar: "ী" },
  { base: "শ_ল",  answer: "শীল",  choices: ["শিল",  "শীল",  "শেল",  "শোল"],  missingKar: "ী" },
  { base: "ত_র",  answer: "তীর",  choices: ["তির",  "তীর",  "তের",  "তোর"],  missingKar: "ী" },
  { base: "ব_ক",  answer: "বুক",  choices: ["বুক",  "বূক",  "বোক",  "বেক"],  missingKar: "ু" },
  { base: "চ_ল",  answer: "চুল",  choices: ["চুল",  "চূল",  "চোল",  "চেল"],  missingKar: "ু" },
  { base: "ফ_ল",  answer: "ফুল",  choices: ["ফুল",  "ফূল",  "ফোল",  "ফেল"],  missingKar: "ু" },
  { base: "ক_ল",  answer: "কুল",  choices: ["কুল",  "কূল",  "কোল",  "কেল"],  missingKar: "ু" },
  { base: "ধ_লো", answer: "ধুলো", choices: ["ধুলো", "ধূলো", "ধোলো", "ধেলো"], missingKar: "ু" },
  { base: "ত_লা", answer: "তুলা", choices: ["তুলা", "তূলা", "তোলা", "তেলা"], missingKar: "ু" },
  { base: "ম_খ",  answer: "মুখ",  choices: ["মুখ",  "মূখ",  "মোখ",  "মেখ"],  missingKar: "ু" },
  { base: "গ_ণ",  answer: "গুণ",  choices: ["গুণ",  "গূণ",  "গোণ",  "গেণ"],  missingKar: "ু" },
  { base: "ম_ল",  answer: "মূল",  choices: ["মুল",  "মূল",  "মেল",  "মোল"],  missingKar: "ূ" },
  { base: "ভ_ল",  answer: "ভুল",  choices: ["ভুল",  "ভূল",  "ভেল",  "ভোল"],  missingKar: "ু" },
  { base: "ধ_ল",  answer: "ধূল",  choices: ["ধুল",  "ধূল",  "ধেল",  "ধোল"],  missingKar: "ূ" },
  { base: "ম_লা", answer: "মেলা", choices: ["মিলা", "মীলা", "মেলা", "মোলা"], missingKar: "ে" },
  { base: "র_খা", answer: "রেখা", choices: ["রিখা", "রীখা", "রেখা", "রোখা"], missingKar: "ে" },
  { base: "ছ_লে", answer: "ছেলে", choices: ["ছিলে", "ছীলে", "ছেলে", "ছোলে"], missingKar: "ে" },
  { base: "ব_লা", answer: "বেলা", choices: ["বিলা", "বীলা", "বেলা", "বোলা"], missingKar: "ে" },
  { base: "খ_লা", answer: "খেলা", choices: ["খিলা", "খীলা", "খেলা", "খোলা"], missingKar: "ে" },
  { base: "দ_শ",  answer: "দেশ",  choices: ["দিশ",  "দীশ",  "দেশ",  "দোশ"],  missingKar: "ে" },
  { base: "ন_শা", answer: "নেশা", choices: ["নিশা", "নীশা", "নেশা", "নোশা"], missingKar: "ে" },
  { base: "ফ_লা", answer: "ফেলা", choices: ["ফিলা", "ফুলা", "ফেলা", "ফোলা"], missingKar: "ে" },
  { base: "ঢ_লা", answer: "ঢেলা", choices: ["ঢিলা", "ঢুলা", "ঢেলা", "ঢোলা"], missingKar: "ে" },
  { base: "ত_ল",  answer: "তেল",  choices: ["তিল",  "তুল",  "তেল",  "তোল"],  missingKar: "ে" },
  { base: "ক_ল",  answer: "কোল",  choices: ["কুল",  "কূল",  "কোল",  "কেল"],  missingKar: "ো" },
  { base: "ঘ_ড়া", answer: "ঘোড়া", choices: ["ঘুড়া", "ঘূড়া", "ঘোড়া", "ঘেড়া"], missingKar: "ো" },
  { base: "ছ_ট",  answer: "ছোট",  choices: ["ছুট",  "ছিট",  "ছেট",  "ছোট"],  missingKar: "ো" },
  { base: "ভ_র",  answer: "ভোর",  choices: ["ভুর",  "ভির",  "ভের",  "ভোর"],  missingKar: "ো" },
  { base: "খ_ল",  answer: "খোল",  choices: ["খুল",  "খিল",  "খেল",  "খোল"],  missingKar: "ো" },
  { base: "ব_ন",  answer: "বোন",  choices: ["বুন",  "বিন",  "বেন",  "বোন"],  missingKar: "ো" },
  { base: "ম_ম",  answer: "মোম",  choices: ["মুম",  "মিম",  "মেম",  "মোম"],  missingKar: "ো" },
  { base: "ঢ_ল",  answer: "ঢোল",  choices: ["ঢুল",  "ঢিল",  "ঢেল",  "ঢোল"],  missingKar: "ো" },
  { base: "ম_ড়", answer: "মোড়",  choices: ["মুড়",  "মিড়",  "মেড়",  "মোড়"],  missingKar: "ো" },
  { base: "ন_ট",  answer: "নোট",  choices: ["নুট",  "নিট",  "নেট",  "নোট"],  missingKar: "ো" },
];

// ─── Fisher-Yates Shuffle ──────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Convert number to Bangla digits ───────────────────────────────────────────
function toBanglaNum(n) {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).split('').map(d => banglaDigits[parseInt(d)] || d).join('');
}

// ─── Audio feedback (reusing the project's pattern) ────────────────────────────
function playAudioFeedback(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.log("Audio play error", e);
  }
}

// ─── TTS via existing /api/tts endpoint ────────────────────────────────────────
async function speakWord(word) {
  playBanglaAudio(word, { playbackRate: 0.8 });
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const TIMER_SECONDS = 45;
const FEEDBACK_DELAY = 1200;
const TOTAL_QUESTIONS = FILL_BLANK_WORDS.length;

const WordImage = ({ answer, size = 130, className = "", objectFit = "contain" }) => {
  const [imgError, setImgError] = useState(false);
  const imgData = WORD_IMAGES[answer];

  if (!imgData || imgError) {
    return (
      <div
        style={{
          width: size, height: size,
          background: "#e8f5e9",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: typeof size === 'number' && size > 150 ? "2.5rem" : "1.6rem",
          fontWeight: 800,
          color: "#2e7d32",
          fontFamily: "'Hind Siliguri', sans-serif",
        }}
        className={className}
      >
        {answer}
      </div>
    );
  }

  return (
    <img
      src={`/images/quiz/hints/${imgData.file}`}
      alt={answer}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: 12, 
        objectFit: objectFit,
        backgroundColor: '#f1f8e9'
      }}
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  FillInTheBlank Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function FillInTheBlank() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [stars, setStars] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  // Initialize: shuffle all questions on mount, but pin "বাড়ি" as the first question
  useEffect(() => {
    // Find the target word
    const targetWordIndex = FILL_BLANK_WORDS.findIndex(w => w.answer === "বাড়ি");
    const targetWord = FILL_BLANK_WORDS[targetWordIndex];
    
    // Get the rest of the words
    const restWords = [...FILL_BLANK_WORDS];
    if (targetWordIndex > -1) {
      restWords.splice(targetWordIndex, 1);
    }
    
    // Shuffle the rest and put target word at the beginning
    const shuffled = targetWord ? [targetWord, ...shuffleArray(restWords)] : shuffleArray(FILL_BLANK_WORDS);
    
    setShuffledWords(shuffled);
    setShuffledChoices(shuffleArray(shuffled[0]?.choices || []));
  }, []);

  // Shuffle choices when question changes
  useEffect(() => {
    if (shuffledWords.length > 0 && questionIndex < shuffledWords.length) {
      setShuffledChoices(shuffleArray(shuffledWords[questionIndex].choices));
    }
  }, [questionIndex, shuffledWords]);

  // Countdown timer
  useEffect(() => {
    if (quizDone || selected !== null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Time's up — treat as wrong
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [questionIndex, quizDone, selected]);

  const handleTimeUp = useCallback(() => {
    setSelected('timeout');
    setIsCorrect(false);
    setStreak(0);
    playAudioFeedback('wrong');

    const activeUserId = localStorage.getItem('activeUserId');
    if (activeUserId) {
      createSession({
        userId: activeUserId,
        feature: 'quiz',
        activityType: 'fill_in_the_blank',
        score: 0,
        starsEarned: 0,
        accuracy: 0,
        durationMs: 45000
      }).catch(err => console.warn("Failed to save timeout activity", err));
      updateProgress(activeUserId, { starsEarned: 0, skill: 'spelling' }).catch(err => console.warn(err));
    }

    feedbackTimerRef.current = setTimeout(() => {
      advanceQuestion();
    }, FEEDBACK_DELAY);
  }, [questionIndex, shuffledWords]);

  const advanceQuestion = useCallback(() => {
    const nextIdx = questionIndex + 1;
    if (nextIdx >= shuffledWords.length) {
      setQuizDone(true);
    } else {
      setQuestionIndex(nextIdx);
      setSelected(null);
      setIsCorrect(null);
      setShowHint(false);
      setShowCelebration(false);
      setTimeLeft(TIMER_SECONDS);
    }
  }, [questionIndex, shuffledWords]);

  const handleChoice = (choice) => {
    if (selected !== null) return; // Already answered

    clearInterval(timerRef.current);
    const currentQ = shuffledWords[questionIndex];
    const correct = choice === currentQ.answer;

    setSelected(choice);
    setShowHint(false);

    const saveFillBlankActivity = async (isCorrectAnswer) => {
      const activeUserId = localStorage.getItem('activeUserId');
      if (!activeUserId) return;
      try {
        await createSession({
          userId: activeUserId,
          feature: 'quiz',
          activityType: 'fill_in_the_blank',
          score: isCorrectAnswer ? 100 : 0,
          starsEarned: isCorrectAnswer ? 1 : 0,
          accuracy: isCorrectAnswer ? 100 : 0,
          durationMs: 5000
        });
        
        await updateProgress(activeUserId, {
          starsEarned: isCorrectAnswer ? 1 : 0,
          skill: 'spelling'
        });
      } catch (err) {
        console.warn("Failed to save fill-in-blank activity", err);
      }
    };

    if (correct) {
      setIsCorrect(true);
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      playAudioFeedback('correct');
      setShowCelebration(true);
      saveFillBlankActivity(true);

      feedbackTimerRef.current = setTimeout(() => {
        setShowCelebration(false);
        advanceQuestion();
      }, 1400);
    } else {
      setIsCorrect(false);
      setStreak(0);
      playAudioFeedback('wrong');
      saveFillBlankActivity(false);

      feedbackTimerRef.current = setTimeout(() => {
        advanceQuestion();
      }, 1200);
    }
  };

  const handleReplay = () => {
    // Find the target word
    const targetWordIndex = FILL_BLANK_WORDS.findIndex(w => w.answer === "বাড়ি");
    const targetWord = FILL_BLANK_WORDS[targetWordIndex];
    
    // Get the rest of the words
    const restWords = [...FILL_BLANK_WORDS];
    if (targetWordIndex > -1) {
      restWords.splice(targetWordIndex, 1);
    }
    
    // Shuffle the rest and put target word at the beginning
    const shuffled = targetWord ? [targetWord, ...shuffleArray(restWords)] : shuffleArray(FILL_BLANK_WORDS);
    
    setShuffledWords(shuffled);
    setShuffledChoices(shuffleArray(shuffled[0]?.choices || []));
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setStars(3);
    setTimeLeft(TIMER_SECONDS);
    setSelected(null);
    setIsCorrect(null);
    setShowHint(false);
    setShowCelebration(false);
    setQuizDone(false);
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // Calculate stars earned
  const getStarsEarned = () => {
    const pct = shuffledWords.length > 0 ? score / shuffledWords.length : 0;
    if (pct >= 0.8) return 3;
    if (pct >= 0.5) return 2;
    return 1;
  };

  // Guard: wait for data
  if (shuffledWords.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80, fontSize: 24, fontWeight: 800, color: '#2e7d32' }}>
        লোড হচ্ছে... ⏳
      </div>
    );
  }

  // ─── Results Screen ────────────────────────────────────────────────────────
  if (quizDone) {
    const earnedStars = getStarsEarned();
    const pct = Math.round((score / shuffledWords.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: 'center',
          padding: '50px 30px',
          background: 'linear-gradient(145deg, #ffffff, #f1f8e9)',
          borderRadius: 32,
          border: '6px solid #a5d6a7',
          borderBottomWidth: '12px',
          maxWidth: 600,
          margin: '0 auto',
          boxShadow: '0 12px 40px rgba(46,125,50,0.12)',
        }}
      >
        {/* Confetti emoji */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 72, marginBottom: 15 }}
        >
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </motion.div>

        <h2 style={{
          fontSize: 36, fontWeight: 800, color: '#1b5e20', marginBottom: 10,
          fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        }}>
          {pct >= 80 ? 'অসাধারণ!' : pct >= 50 ? 'চমৎকার চেষ্টা!' : 'চালিয়ে যাও!'}
        </h2>

        <p style={{
          fontSize: 20, color: '#555', marginBottom: 8,
          fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        }}>
          কার চিহ্ন চেনার ফলাফল
        </p>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 15, margin: '30px 0' }}>
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.2, type: 'spring' }}
              style={{ fontSize: 64, filter: i <= earnedStars ? 'none' : 'grayscale(1) opacity(0.2)' }}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Score text */}
        <p style={{
          fontSize: 24, fontWeight: 700, color: '#555', marginBottom: 12,
          fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        }}>
          তুমি {toBanglaNum(shuffledWords.length)} টির মধ্যে{' '}
          <span style={{ color: '#2e7d32', fontSize: 30 }}>{toBanglaNum(score)}</span> টি সঠিক উত্তর দিয়েছ!
        </p>

        <p style={{
          fontSize: 18, color: '#888', marginBottom: 40,
          fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        }}>
          সঠিক উত্তর: {toBanglaNum(pct)}%
        </p>

        {/* Replay button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 8px 28px rgba(46,125,50,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReplay}
          style={{
            padding: '16px 48px',
            borderRadius: 20,
            border: '4px solid #1b5e20',
            borderBottomWidth: '8px',
            background: 'linear-gradient(135deg, #43a047, #2e7d32)',
            fontSize: 22,
            fontWeight: 800,
            cursor: 'pointer',
            color: 'white',
            boxShadow: '0 4px 16px rgba(46,125,50,0.3)',
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            transition: 'border-bottom-width 0.1s, transform 0.1s',
          }}
          onMouseDown={(e) => { e.currentTarget.style.borderBottomWidth = '4px'; e.currentTarget.style.transform = 'translateY(4px)'; }}
          onMouseUp={(e) => { e.currentTarget.style.borderBottomWidth = '8px'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          🔄 খেলো আবার
        </motion.button>
      </motion.div>
    );
  }

  // ─── Current question data ─────────────────────────────────────────────────
  const currentQ = shuffledWords[questionIndex];
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;

  // Parse the base pattern to display with blank box
  const renderWordWithBlank = () => {
    const parts = currentQ.base.split('_');
    return (
      <span style={{
        fontSize: '2.8rem',
        fontWeight: 800,
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
        color: '#1b5e20',
        letterSpacing: '3px',
        lineHeight: 1.4,
      }}>
        {parts[0]}
        <span style={{
          display: 'inline-block',
          border: '3px solid #2e7d32',
          borderRadius: 6,
          minWidth: 40,
          minHeight: 44,
          background: 'linear-gradient(135deg, #f1f8e9, #e8f5e9)',
          verticalAlign: 'middle',
          margin: '0 4px',
          boxShadow: 'inset 0 2px 6px rgba(46,125,50,0.15), 0 2px 8px rgba(46,125,50,0.1)',
          position: 'relative',
        }}>
          {/* Pulsing animation on the blank */}
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#66bb6a',
              fontSize: '1.6rem',
              fontWeight: 400,
            }}
          >
            ?
          </motion.span>
        </span>
        {parts[1] || ''}
      </span>
    );
  };

  // Determine button styles based on selection
  const getChoiceStyle = (choice) => {
    const base = {
      padding: '18px 24px',
      borderRadius: 18,
      fontSize: '1.3rem',
      fontWeight: 700,
      cursor: selected !== null ? 'default' : 'pointer',
      fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
      letterSpacing: '1px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      minHeight: 64,
    };

    if (selected === null) {
      // Unselected state
      return {
        ...base,
        background: 'white',
        border: '3px solid #a5d6a7',
        color: '#2d1b00',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
      };
    }

    // After selection
    if (choice === currentQ.answer) {
      // This is the correct answer — always highlight green
      return {
        ...base,
        background: 'linear-gradient(135deg, #4caf50, #388e3c)',
        border: '3px solid #2e7d32',
        color: 'white',
        boxShadow: '0 4px 20px rgba(76,175,80,0.4)',
        transform: 'scale(1.03)',
      };
    }

    if (choice === selected && !isCorrect) {
      // Wrong selection
      return {
        ...base,
        background: 'linear-gradient(135deg, #e53935, #c62828)',
        border: '3px solid #b71c1c',
        color: 'white',
        boxShadow: '0 4px 20px rgba(229,57,53,0.4)',
      };
    }

    // Other unselected buttons after answer
    return {
      ...base,
      background: '#f5f5f5',
      border: '3px solid #e0e0e0',
      color: '#bbb',
      opacity: 0.6,
    };
  };

  // ─── Main Quiz UI ──────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100%',
      maxWidth: 700,
      margin: '0 auto',
      padding: '0 16px',
      fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
    }}>
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.85); }
          to   { opacity: 1; transform: translateX(-50%) scale(1); }
        }

        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      
      {/* ── Top Stats Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: '#ffffff',
        border: '4px solid #c8e6c9',
        borderBottomWidth: '8px',
        borderRadius: 20,
        marginBottom: 24,
        gap: 12,
        flexWrap: 'wrap',
      }}>
        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28 }}>🏆</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#666', letterSpacing: '0.5px' }}>স্কোর</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#2e7d32', lineHeight: 1 }}>{toBanglaNum(score)}</div>
          </div>
        </div>

        {/* Streak */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 18px',
          background: streak > 0 ? '#fff8e1' : '#f5f5f5',
          border: `3px solid ${streak > 0 ? '#f5a623' : '#e0e0e0'}`,
          borderRadius: 14,
        }}>
          <span style={{ fontSize: 24 }}>🔥</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c5841a' }}>ধারা</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f5a623', lineHeight: 1 }}>{toBanglaNum(streak)}</div>
          </div>
        </div>

        {/* Difficulty Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[1, 2, 3].map(i => (
            <span key={i} style={{ fontSize: 22, filter: i <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>★</span>
          ))}
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 18px',
          background: timeLeft <= 10 ? '#ffebee' : '#f1f8e9',
          border: `3px solid ${timeLeft <= 10 ? '#ef5350' : '#a5d6a7'}`,
          borderRadius: 14,
        }}>
          <span style={{ fontSize: 22 }}>⏱️</span>
          <div style={{
            fontSize: 22, fontWeight: 800, lineHeight: 1,
            color: timeLeft <= 10 ? '#e53935' : '#2e7d32',
          }}>
            {toBanglaNum(timeLeft)}s
          </div>
        </div>
      </div>

      {/* ── Timer Progress Bar ── */}
      <div style={{
        height: 8,
        background: '#e8f5e9',
        borderRadius: 4,
        marginBottom: 28,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <motion.div
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.4, ease: 'linear' }}
          style={{
            height: '100%',
            background: timeLeft <= 10
              ? 'linear-gradient(90deg, #ef5350, #e53935)'
              : 'linear-gradient(90deg, #66bb6a, #43a047)',
            borderRadius: 4,
            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.1)',
          }}
        />
      </div>

      {/* ── Question Progress ── */}
      <div style={{
        textAlign: 'center', marginBottom: 8,
        fontSize: 15, fontWeight: 700, color: '#888',
      }}>
        প্রশ্ন {toBanglaNum(questionIndex + 1)} / {toBanglaNum(shuffledWords.length)}
      </div>

      {/* ── Question Card ── */}
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f9fbe7)',
          borderRadius: 28,
          padding: '36px 28px 28px',
          border: '4px solid #c8e6c9',
          boxShadow: '0 8px 32px rgba(46,125,50,0.08)',
          marginBottom: 28,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(102,187,106,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -15, left: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,193,7,0.08)' }} />

        {/* Prompt text */}
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#555',
          marginBottom: 24,
          position: 'relative',
        }}>
          এটি কোন শব্দ?
        </div>

        {/* Word with blank + speaker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          position: 'relative',
        }}>
          {renderWordWithBlank()}

          {/* Speaker button */}
          <motion.button
            whileHover={{ scale: 1.15, boxShadow: '0 6px 20px rgba(46,125,50,0.25)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => speakWord(currentQ.answer)}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '3px solid #a5d6a7',
              background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
              cursor: 'pointer',
              fontSize: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(46,125,50,0.15)',
              flexShrink: 0,
            }}
            aria-label="শব্দ শুনুন"
          >
            🔊
          </motion.button>
        </div>

        {/* Missing কার hint */}
        <div style={{
          marginTop: 16,
          fontSize: 14,
          color: '#aaa',
          fontWeight: 600,
        }}>
          কোন কার চিহ্ন বসবে?
        </div>
      </motion.div>

      {/* ── Hint Button ── */}
      <div style={{ textAlign: 'center', marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {showHint && (
          <div style={{
            width: 'clamp(110px, 25vw, 220px)',
            height: 'clamp(110px, 25vw, 220px)',
            borderRadius: 16,
            border: "4px solid #a5d6a7",
            background: "#f1f8e9",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(46,125,50,0.15)",
            animation: "zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            padding: 8,
          }}>
            <WordImage answer={currentQ.answer} size="100%" objectFit="contain" />
          </div>
        )}

        <button
          onClick={() => setShowHint(h => !h)}
          style={{
            background: "#fff9c4",
            border: "2px solid #f9a825",
            borderRadius: 20,
            padding: "8px 24px",
            fontSize: "1.1rem",
            cursor: "pointer",
            color: "#f57f17",
            fontFamily: "'Hind Siliguri', sans-serif",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(245,127,23,0.15)",
            transition: "all 0.2s",
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {showHint ? "💡 লুকান" : "💡 হিন্ট"}
        </button>
      </div>

      {/* ── Choices Grid (2×2) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginBottom: 20,
      }}>
        <AnimatePresence mode="wait">
          {shuffledChoices.map((choice, idx) => (
            <motion.button
              key={`${questionIndex}-${idx}-${choice}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.2 }}
              whileHover={selected === null ? { scale: 1.04, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } : {}}
              whileTap={selected === null ? { scale: 0.96 } : {}}
              onClick={() => handleChoice(choice)}
              style={getChoiceStyle(choice)}
            >
              <span>{choice}</span>
              {selected !== null && choice === currentQ.answer && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: 22 }}
                >
                  ✓
                </motion.span>
              )}
              {selected === choice && !isCorrect && choice !== currentQ.answer && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: 22 }}
                >
                  ✗
                </motion.span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Feedback Banner ── */}
      <AnimatePresence>
        {selected !== null && !showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              textAlign: 'center',
              padding: '14px 28px',
              borderRadius: 16,
              background: isCorrect
                ? 'linear-gradient(135deg, #4caf50, #2e7d32)'
                : 'linear-gradient(135deg, #e53935, #c62828)',
              color: 'white',
              fontSize: 20,
              fontWeight: 800,
              boxShadow: isCorrect
                ? '0 6px 24px rgba(76,175,80,0.4)'
                : '0 6px 24px rgba(229,57,53,0.4)',
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            }}
          >
            {selected === 'timeout'
              ? '⏰ সময় শেষ!'
              : isCorrect
                ? '✓ সঠিক!'
                : `✗ ভুল! সঠিক উত্তর: ${currentQ.answer}`
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* CELEBRATION MODAL — render at top level of component return */}
      {showCelebration && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100,
          animation: "fadeIn 0.25s ease",
        }}>
          <div style={{
            background: "white",
            borderRadius: 24,
            padding: "28px 24px 24px",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            maxWidth: 300, width: "90%",
            position: "relative",
          }}>
            <div style={{ position: "relative" }}>
              <WordImage answer={currentQ.answer} size={240} />
              <div style={{
                position: "absolute", top: -10, right: -10,
                width: 40, height: 40,
                background: "#4CAF50", borderRadius: "50%",
                color: "white", fontSize: "1.4rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "3px solid white",
              }}>✓</div>
            </div>
            <div style={{
              fontSize: "2.5rem", fontWeight: 800,
              color: "#2e7d32",
              fontFamily: "'Hind Siliguri', sans-serif",
            }}>
              {currentQ.answer}
            </div>
            <div style={{
              fontSize: "1.2rem", color: "#388e3c", fontWeight: 600,
              fontFamily: "'Hind Siliguri', sans-serif",
            }}>
              সাবাশ! সঠিক উত্তর! 🎉
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
