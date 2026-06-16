import { motion } from 'framer-motion';

export default function MatchLine({ lines, containerRef }) {
  if (!containerRef.current) return null;
  
  return (
    <svg 
      style={{ 
        position: 'absolute', 
        top: 0, left: 0, 
        width: '100%', height: '100%', 
        pointerEvents: 'none', 
        zIndex: 10 
      }}
    >
      {lines.map((line, idx) => {
        // Line status: 'pending' | 'correct' | 'wrong'
        let color = '#cbd5e1'; // gray
        if (line.status === 'correct') color = '#18b368'; // green
        if (line.status === 'wrong') color = '#ff6b6b'; // red
        
        return (
          <motion.path
            key={idx}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            d={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`}
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            style={{ 
              filter: line.status === 'correct' ? 'drop-shadow(0 0 8px rgba(24,179,104,0.6))' : 'none' 
            }}
          />
        );
      })}
    </svg>
  );
}
