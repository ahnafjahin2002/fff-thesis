import { motion } from 'framer-motion';

export default function DifficultySelector({ onSelect }) {
  const options = [
    { id: 1, title: 'সহজ', desc: '৪টি শব্দ মেলাও', color: '#18b368', bg: '#eef9f1' },
    { id: 2, title: 'মাঝারি', desc: '৬টি শব্দ মেলাও', color: '#f5a623', bg: '#fffbee' },
    { id: 3, title: 'কঠিন', desc: '৮টি শব্দ (সময় সীমিত)', color: '#ff6b6b', bg: '#fff0f5' },
  ];

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1d2b2a', marginBottom: 30 }}>কুইজ - শব্দ ও ছবি মেলাও</h2>
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
        {options.map(opt => (
          <motion.div
            key={opt.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(opt.id)}
            style={{
              background: opt.bg,
              border: `4px solid ${opt.color}`,
              borderBottomWidth: '12px',
              borderRadius: 28,
              padding: '30px 40px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              minWidth: 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'border-bottom-width 0.1s, transform 0.1s'
            }}
            onMouseDown={(e) => { e.currentTarget.style.borderBottomWidth = '4px'; e.currentTarget.style.transform = 'translateY(8px)'; }}
            onMouseUp={(e) => { e.currentTarget.style.borderBottomWidth = '12px'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: 40, fontWeight: 800, color: opt.color, marginBottom: 12, letterSpacing: '2px' }}>{opt.title}</div>
            <div style={{ fontSize: 18, color: '#444', fontWeight: 700 }}>{opt.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
