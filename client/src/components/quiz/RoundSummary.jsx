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
      style={{ textAlign: 'center', padding: '50px 30px', background: 'white', borderRadius: 32, border: '6px solid #e5e5e5', borderBottomWidth: '12px', maxWidth: 600, margin: '0 auto' }}
    >
      <div style={{ fontSize: 72, marginBottom: 15 }}>
        {percentage === 1 ? '🎉' : percentage >= 0.7 ? '👍' : '💪'}
      </div>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1d2b2a', marginBottom: 20, letterSpacing: '1px' }}>
        {percentage === 1 ? 'অসাধারণ!' : 'খুব ভালো চেষ্টা!'}
      </h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: 15, margin: '30px 0' }}>
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.2, type: 'spring' }}
            style={{ fontSize: 64, filter: i <= stars ? 'none' : 'grayscale(1) opacity(0.2)' }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
      
      <p style={{ fontSize: 24, fontWeight: 700, color: '#555', marginBottom: 40 }}>
        তুমি {total} টির মধ্যে <span style={{ color: '#18b368', fontSize: 28 }}>{score}</span> টি সঠিক উত্তর দিয়েছ!
      </p>

      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={onChangeDifficulty}
          style={{ 
            padding: '16px 32px', borderRadius: 20, border: '4px solid #e5e5e5', borderBottomWidth: '8px', 
            background: 'white', fontSize: 20, fontWeight: 800, cursor: 'pointer', color: '#555',
            transition: 'border-bottom-width 0.1s, transform 0.1s'
          }}
          onMouseDown={(e) => { e.currentTarget.style.borderBottomWidth = '4px'; e.currentTarget.style.transform = 'translateY(4px)'; }}
          onMouseUp={(e) => { e.currentTarget.style.borderBottomWidth = '8px'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          কঠিনতা বদলাও
        </button>
        <button 
          onClick={onNextRound}
          style={{ 
            padding: '16px 40px', borderRadius: 20, border: '4px solid #149957', borderBottomWidth: '8px', 
            background: '#18b368', fontSize: 20, fontWeight: 800, cursor: 'pointer', color: 'white', 
            boxShadow: '0 4px 12px rgba(24,179,104,0.3)',
            transition: 'border-bottom-width 0.1s, transform 0.1s'
          }}
          onMouseDown={(e) => { e.currentTarget.style.borderBottomWidth = '4px'; e.currentTarget.style.transform = 'translateY(4px)'; }}
          onMouseUp={(e) => { e.currentTarget.style.borderBottomWidth = '8px'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          পরের রাউন্ড ▶
        </button>
      </div>
    </motion.div>
  );
}
