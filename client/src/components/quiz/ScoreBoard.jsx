import { motion } from 'framer-motion';

export default function ScoreBoard({ score, total, streak, timeElapsed, difficulty }) {
  const percentage = total > 0 ? (score / total) * 100 : 0;
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '20px 30px', 
      background: '#ffffff', 
      border: '4px solid #e5e5e5',
      borderBottomWidth: '8px',
      borderRadius: 24, 
      marginBottom: 30,
      gap: 30
    }}>
      {/* Progress Section */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: '#3c3c3c', marginBottom: 14, letterSpacing: '1px' }}>
          <span>🌟 অগ্রগতি</span>
          <span style={{ color: '#18b368' }}>{score} / {total}</span>
        </div>
        <div style={{ height: 24, background: '#f0f0f0', borderRadius: 12, overflow: 'hidden', border: 'inset 2px rgba(0,0,0,0.05)' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, #58cc02, #7add2c)', 
              borderRadius: 12,
              boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.15)'
            }}
          />
        </div>
      </div>
      
      {/* Streak Badge */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: 12, 
        padding: '12px 28px', 
        background: '#fff8e1', 
        border: '4px solid #f5a623',
        borderBottomWidth: '8px',
        borderRadius: 20 
      }}>
        <span style={{ fontSize: 36 }}>🔥</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#c5841a', letterSpacing: '1px' }}>স্ট্রিক</span>
          <span style={{ fontSize: 32, fontWeight: 800, color: '#f5a623', lineHeight: 1 }}>{streak}</span>
        </div>
      </div>
      
      {/* Time (for hard mode) */}
      {difficulty === 3 && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 12, 
          padding: '12px 28px', 
          background: timeElapsed > 45 ? '#ffebee' : '#f0f8ff', 
          border: `4px solid ${timeElapsed > 45 ? '#ff6b6b' : '#1cb0f6'}`,
          borderBottomWidth: '8px',
          borderRadius: 20 
        }}>
          <span style={{ fontSize: 36 }}>⏱️</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: timeElapsed > 45 ? '#c94848' : '#148ac2', letterSpacing: '1px' }}>সময়</span>
            <span style={{ fontSize: 32, fontWeight: 800, color: timeElapsed > 45 ? '#ff6b6b' : '#1cb0f6', lineHeight: 1 }}>{Math.max(0, 60 - timeElapsed)}s</span>
          </div>
        </div>
      )}
    </div>
  );
}
