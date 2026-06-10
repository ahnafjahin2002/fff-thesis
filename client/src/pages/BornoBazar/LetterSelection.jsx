import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '../../hooks/useGameState';
import { getLetterChoices } from '../../data/letters';
import { playAudio } from '../../utils/audio';

export default function LetterSelection({ onSelect, onBack }) {
  const { state } = useGameState();
  const [choices, setChoices] = useState([]);
  const [playingAudioFor, setPlayingAudioFor] = useState(null);

  // Generate 3 choices on mount, avoiding already learned letters
  useEffect(() => {
    const newChoices = getLetterChoices(state.lettersLearned, 'beginner');
    setChoices(newChoices);
  }, [state.lettersLearned]);

  const handleAudioTap = (e, letter) => {
    e.stopPropagation(); // Prevent card selection
    
    if (state.audioEnabled) {
      setPlayingAudioFor(letter);
      playAudio(letter, () => setPlayingAudioFor(null));
    }
  };

  const handleSelect = (letter) => {
    onSelect(letter);
  };

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", bounce: 0.4 }
    }
  };

  return (
    <div className="letter-select">
      <div className="letter-select-header">
        <motion.button 
          className="btn-back" 
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back"
        >
          ←
        </motion.button>
      </div>

      <motion.div 
        className="letter-select-prompt"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        কোন বর্ণ দিয়ে দোকান বানাবে?
      </motion.div>

      <motion.div 
        className="letter-cards"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {choices.map((char) => (
          <motion.div 
            key={char} 
            className="letter-card"
            variants={itemVariants}
            onClick={() => handleSelect(char)}
          >
            <div className="letter-card-char">{char}</div>
            
            <button 
              className="btn-audio" 
              style={{ width: 44, height: 44, marginTop: 8 }}
              onClick={(e) => handleAudioTap(e, char)}
              aria-label={`Play sound for ${char}`}
            >
              <motion.div
                animate={playingAudioFor === char ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                🔊
              </motion.div>
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
