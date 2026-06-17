import { useState, useEffect } from 'react';
import DifficultySelector from './DifficultySelector';
import ScoreBoard from './ScoreBoard';
import QuizCard from './QuizCard';
import RoundSummary from './RoundSummary';

export default function QuizModule() {
  const [difficulty, setDifficulty] = useState(null); // 1, 2, 3
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  
  // Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const fetchPairs = async (diff) => {
    setLoading(true);
    try {
      let count = 4;
      if (diff === 2) count = 6;
      if (diff === 3) count = 8;
      
      const res = await fetch(`http://localhost:3001/api/quiz/generate?difficulty=${diff}&count=${count}&category=all`);
      const data = await res.json();
      if (data.success) {
        setPairs(data.words);
      }
    } catch (err) {
      console.error("Failed to fetch quiz pairs:", err);
    }
    setLoading(false);
  };

  const startGame = (diff) => {
    setDifficulty(diff);
    setRoundComplete(false);
    setScore(0);
    setTimeElapsed(0);
    fetchPairs(diff);
  };

  const handleNextRound = () => {
    setRoundComplete(false);
    setScore(0);
    setTimeElapsed(0);
    fetchPairs(difficulty);
  };

  // Timer for hard mode
  useEffect(() => {
    let timer;
    if (difficulty === 3 && !roundComplete && pairs.length > 0) {
      timer = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= 60) {
            setRoundComplete(true);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [difficulty, roundComplete, pairs]);

  const handleMatch = (word) => {
    setScore(prev => prev + 1);
    setStreak(prev => prev + 1);
    playAudio('correct');
    
    // Update mastery in localStorage
    updateMastery(word.id, true);
  };

  const handleWrongMatch = (word, image) => {
    setStreak(0);
    playAudio('wrong');
    
    // Update mastery in localStorage
    updateMastery(word.id, false);
  };

  const playAudio = (type) => {
    try {
      // Very simple beep fallback if no mp3 provided
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
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
    } catch(e) {
       console.log("Audio play error", e);
    }
  };

  const updateMastery = (wordId, isCorrect) => {
    const key = 'quiz_mastery';
    let mastery = JSON.parse(localStorage.getItem(key) || '{}');
    
    if (!mastery[wordId]) {
      mastery[wordId] = { attempts: 0, correct: 0, streak: 0 };
    }
    
    mastery[wordId].attempts += 1;
    if (isCorrect) {
      mastery[wordId].correct += 1;
      mastery[wordId].streak += 1;
    } else {
      mastery[wordId].streak = 0;
    }
    
    localStorage.setItem(key, JSON.stringify(mastery));
  };

  if (!difficulty) {
    return <DifficultySelector onSelect={startGame} />;
  }

  return (
    <div style={{ 
      width: '100%', 
      padding: '30px 40px', 
      background: 'linear-gradient(180deg, #E8F4FD 0%, #F0FFF4 100%)',
      borderRadius: 32,
      boxShadow: 'inset 0 4px 20px rgba(255,255,255,0.8), 0 8px 32px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Playful background decorative shapes */}
      <div style={{ position: 'absolute', top: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(28,176,246,0.08)' }} />
      <div style={{ position: 'absolute', bottom: 50, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(88,204,2,0.08)' }} />
      <div style={{ position: 'absolute', top: '40%', left: '50%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,200,0,0.05)', transform: 'translate(-50%, -50%)' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {!roundComplete && pairs.length > 0 && (
          <ScoreBoard 
            score={score} 
            total={pairs.length} 
            streak={streak} 
            timeElapsed={timeElapsed} 
            difficulty={difficulty} 
          />
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, fontSize: 24, fontWeight: 800, color: '#1cb0f6' }}>লুড হচ্ছে... ⏳</div>
        ) : roundComplete ? (
          <RoundSummary 
            score={score} 
            total={pairs.length} 
            onNextRound={handleNextRound}
            onChangeDifficulty={() => setDifficulty(null)}
          />
        ) : pairs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50, background: 'white', borderRadius: 24, border: '4px solid #e5e5e5', borderBottomWidth: '8px' }}>
            <div style={{ fontSize: 60, marginBottom: 15 }}>⚠️</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#ff4b4b', marginBottom: 10 }}>সার্ভারের সাথে সংযোগ করা যাচ্ছে না!</h3>
            <p style={{ color: '#555', marginBottom: 30, fontSize: 18 }}>অনুগ্রহ করে নিশ্চিত করুন যে ব্যাকএন্ড সার্ভারটি চলছে।</p>
            <button 
              onClick={() => fetchPairs(difficulty)}
              style={{ 
                padding: '16px 32px', background: '#1cb0f6', color: 'white', 
                border: '4px solid #1899D6', borderBottomWidth: '8px', 
                borderRadius: 20, fontSize: 20, cursor: 'pointer', fontWeight: 800,
                boxShadow: '0 4px 12px rgba(28,176,246,0.3)'
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.borderBottomWidth = '4px'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderBottomWidth = '8px'; }}
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        ) : (
          <QuizCard 
            pairs={pairs} 
            onMatch={handleMatch} 
            onWrongMatch={handleWrongMatch} 
            onComplete={() => setRoundComplete(true)}
          />
        )}
      </div>
    </div>
  );
}
