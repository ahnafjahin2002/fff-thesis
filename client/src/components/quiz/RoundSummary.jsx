import { motion } from 'framer-motion';

export default function RoundSummary({ score, total, onNextRound, onChangeDifficulty }) {
  const percentage = total > 0 ? score / total : 0;
  let stars = 0;
  if (percentage === 1) stars = 3;
  else if (percentage >= 0.7) stars = 2;
  else if (percentage > 0) stars = 1;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', maxWidth: 500, margin: '0 auto' }}
    >
      <div style={{ fontSize: 48, marginBottom: 10 }}>
        {percentage === 1 ? '🎉' : percentage >= 0.7 ? '👍' : '💪'}
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1d2b2a', marginBottom: 15 }}>
        {percentage === 1 ? 'অসাধারণ!' : 'খুব ভালো চেষ্টা!'}
      </h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '20px 0' }}>
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.2, type: 'spring' }}
            style={{ fontSize: 48, filter: i <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
      
      <p style={{ fontSize: 18, color: '#555', marginBottom: 30 }}>
        তুমি {total} টির মধ্যে {score} টি সঠিক উত্তর দিয়েছ!
      </p>

      <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
        <button 
          onClick={onChangeDifficulty}
          style={{ padding: '12px 24px', borderRadius: 12, border: '2px solid #ddd', background: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', color: '#555' }}
        >
          কঠিনতা বদলাও
        </button>
        <button 
          onClick={onNextRound}
          style={{ padding: '12px 32px', borderRadius: 12, border: 'none', background: '#18b368', fontSize: 16, fontWeight: 700, cursor: 'pointer', color: 'white', boxShadow: '0 4px 12px rgba(24,179,104,0.3)' }}
        >
          পরের রাউন্ড ▶
        </button>
      </div>
    </motion.div>
  );
}
