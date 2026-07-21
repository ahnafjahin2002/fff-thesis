import { motion } from 'framer-motion';

export default function SentenceBuilder({ expectedLength, selectedWords, onRemoveWord, status }) {
  const slots = Array.from({ length: expectedLength });

  let statusClass = '';
  if (status === 'wrong') statusClass = 'shake-error';
  if (status === 'correct') statusClass = 'success-glow';

  return (
    <motion.div 
      className={`sentence-builder-container ${statusClass}`}
      animate={status === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {slots.map((_, index) => {
        const wordObj = selectedWords[index];
        return (
          <div 
            key={index} 
            className="builder-slot"
            onClick={() => wordObj && onRemoveWord(index)}
          >
            {wordObj && (
              <motion.div 
                className="filled-word"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                {wordObj.word}
              </motion.div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
