import { motion } from 'framer-motion';

export default function ScoreBoard({ score, total, streak, timeElapsed, difficulty }) {
  const percentage = total > 0 ? (score / total) * 100 : 0;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 25px', background: 'white', borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.05)', marginBottom: 20 }}>
      {/* Progress */}
      <div style={{ flex: 1, marginRight: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#555', marginBottom: 8 }}>
          <span>অগ্রগতি</span>
          <span>{score} / {total}</span>
        </div>
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            style={{ height: '100%', background: '#18b368', borderRadius: 10 }}
          />
        </div>
      </div>
      
      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 20 }}>
        <span style={{ fontSize: 24 }}>🔥</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#f5a623' }}>{streak}</span>
      </div>
      
      {/* Time (for hard mode) */}
      {difficulty === 3 && (
        <div style={{ fontSize: 18, fontWeight: 800, color: timeElapsed > 45 ? '#ff6b6b' : '#333' }}>
          ⏱️ {Math.max(0, 60 - timeElapsed)}s
        </div>
      )}
    </div>
  );
}
