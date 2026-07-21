import { motion } from 'framer-motion';
import { bornoAssets } from '../assets/config';
import customerImageSrc from '../../../assets/images/transparent_customer.png';

export default function Customer({ mood = 'neutral' }) {
  // Using the custom generated customer graphic.
  const customerImage = customerImageSrc;

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
