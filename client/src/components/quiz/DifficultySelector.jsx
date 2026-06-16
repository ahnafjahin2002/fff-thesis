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
              border: `2px solid ${opt.color}`,
              borderRadius: 20,
              padding: '30px 40px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              minWidth: 200,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 800, color: opt.color, marginBottom: 10 }}>{opt.title}</div>
            <div style={{ fontSize: 16, color: '#555', fontWeight: 600 }}>{opt.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
