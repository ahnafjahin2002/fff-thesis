import { motion } from 'framer-motion';
import { SHOP_COLORS } from '../../data/letters';

export default function ShopColorPicker({ onPick }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.5 } }
  };

  return (
    <div className="color-picker-screen">
      <motion.div 
        className="color-picker-title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        দারুণ! এবার তোমার দোকানের রং বেছে নাও
      </motion.div>

      <motion.div 
        className="color-options"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {SHOP_COLORS.map((colorObj) => (
          <motion.button
            key={colorObj.name}
            variants={itemVariants}
            className="color-option"
            style={{ backgroundColor: colorObj.color }}
            onClick={() => onPick(colorObj)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Select ${colorObj.name} color`}
          />
        ))}
      </motion.div>
    </div>
  );
}
