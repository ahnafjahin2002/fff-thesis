import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useBornoProgress from '../hooks/useBornoProgress';
import { bornoAssets } from '../assets/config';
import { products } from '../data/products';



export default function RewardSystem({ onComplete, stageContext }) {
  const [showRewards, setShowRewards] = useState(false);

  // In a real flow, we would pass down the exact product that was just completed.
  const rewardProduct = products.find(p => p.id === 'mango'); 
  const productImage = bornoAssets.products[rewardProduct?.imagePlaceholder] || null;

  useEffect(() => {
    // Trigger animations after a short delay
    const timer = setTimeout(() => {
      setShowRewards(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const isStocking = stageContext === 'stocking';

  return (
    <div className="reward-system-container" role="main" aria-label="পুরস্কার">
      <motion.div 
        className="reward-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="reward-card"
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="reward-header"
            initial={{ scale: 0 }}
            animate={{ scale: showRewards ? 1 : 0 }}
            transition={{ type: "spring", bounce: 0.6, delay: 0.6 }}
            aria-live="polite"
          >
            <h1>{isStocking ? 'দারুণ! 🌟' : 'চমৎকার! 🌟'}</h1>
            <p>{isStocking ? 'তুমি দোকানে পণ্য সাজিয়েছো!' : 'তুমি খুব সুন্দর কথা বলেছো!'}</p>
          </motion.div>

          <div className="rewards-display" role="list" aria-label="অর্জিত পুরস্কার">
            {isStocking && (
              <motion.div 
                className="reward-item"
                role="listitem"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: showRewards ? 1 : 0, opacity: showRewards ? 1 : 0 }}
                transition={{ delay: 1.0, type: 'spring' }}
              >
                <div className="reward-icon star-icon" aria-hidden="true">⭐</div>
                <div className="reward-text">+১০ স্টার</div>
              </motion.div>
            )}

            {!isStocking && (
              <motion.div 
                className="reward-item"
                role="listitem"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: showRewards ? 1 : 0, opacity: showRewards ? 1 : 0 }}
                transition={{ delay: 1.3, type: 'spring' }}
              >
                <div className="reward-icon coin-icon" aria-hidden="true">🪙</div>
                <div className="reward-text">+১৫ কয়েন</div>
              </motion.div>
            )}

            {isStocking && productImage && (
              <motion.div 
                className="reward-item product-reward"
                role="listitem"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: showRewards ? 1 : 0, opacity: showRewards ? 1 : 0 }}
                transition={{ delay: 1.6, type: 'spring' }}
              >
                <img src={productImage} alt="" className="reward-product-img" aria-hidden="true" />
                <div className="reward-text">নতুন পণ্য!</div>
              </motion.div>
            )}
          </div>

          <motion.button 
            className="action-button primary-btn continue-btn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showRewards ? 1 : 0, y: showRewards ? 0 : 20 }}
            transition={{ delay: 2.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            aria-label="সামনে চলো"
          >
            সামনে চলো →
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
