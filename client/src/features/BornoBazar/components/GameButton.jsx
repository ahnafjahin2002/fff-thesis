import { motion } from 'framer-motion';

export default function GameButton({ 
  onClick, 
  children, 
  className = "", 
  variant = "primary", 
  disabled = false 
}) {
  return (
    <motion.button 
      className={`game-btn game-btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95, y: 4, boxShadow: "0 0px 0px rgba(0,0,0,0.2)" } : {}}
    >
      <span className="game-btn-content">
        {children}
      </span>
    </motion.button>
  );
}
