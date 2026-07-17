import { motion } from 'framer-motion';
import { bornoAssets } from '../assets/config';

export default function Customer({ mood = 'neutral' }) {
  // Using a placeholder customer graphic. 
  // In a full game, you'd switch this based on mood or specific customer ID.
  const customerImage = bornoAssets.characters.customer;

  // Animate differently based on mood
  const animations = {
    neutral: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 3 } },
    happy: { y: [0, -15, 0], transition: { repeat: Infinity, duration: 0.5 } },
    thinking: { rotate: [-2, 2, -2], transition: { repeat: Infinity, duration: 4 } }
  };

  return (
    <motion.div 
      className="customer-character-container"
      animate={animations[mood] || animations.neutral}
    >
      <img src={customerImage} alt="Customer" className="customer-img" />
    </motion.div>
  );
}
