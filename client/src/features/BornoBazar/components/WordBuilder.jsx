import { motion } from 'framer-motion';

export default function WordBuilder({ expectedLength, selectedLetters, onRemoveLetter, status }) {
  const slots = Array.from({ length: expectedLength });

  let statusClass = '';
  if (status === 'wrong') statusClass = 'shake-error';
  if (status === 'correct') statusClass = 'success-glow';

  return (
    <motion.div 
      className={`word-builder ${statusClass}`}
      animate={status === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {slots.map((_, index) => {
        const letterObj = selectedLetters[index];
        return (
          <div 
            key={index} 
            className="word-slot"
            onClick={() => letterObj && onRemoveLetter(index)}
          >
            {letterObj && (
              <motion.div 
                className="filled-letter"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                {letterObj.letter}
              </motion.div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
