import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useBornoProgress from '../hooks/useBornoProgress';
import { bornoAssets } from '../assets/config';
import { shops } from '../data/shops';
import ShopHeader from './ShopHeader';
import Shelf from './Shelf';

const LEVEL_REQUIREMENTS = {
  2: 50,  // Need 50 stars for Level 2
  3: 150  // Need 150 stars for Level 3
};

export default function ShopUpgrade({ shop, onComplete, onBack }) {
  const { progress, updateShopProgress, addStar } = useBornoProgress();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const shopData = shops.find(s => s.id === shop);
  const currentLevel = progress.shopProgress[shop]?.level || 1;
  const nextLevel = currentLevel < 3 ? currentLevel + 1 : null;
  const requiredStars = nextLevel ? LEVEL_REQUIREMENTS[nextLevel] : 0;
  const canAfford = progress.stars >= requiredStars;

  const bgImage = bornoAssets.backgrounds.upgradeShopBg || bornoAssets.backgrounds.bazarMap;
  
  const handleUpgrade = () => {
    if (!canAfford || !nextLevel) return;

    setIsUpgrading(true);

    // Deduct stars (by adding negative)
    addStar(-requiredStars);

    // Play smooth upgrade animation
    setTimeout(() => {
      updateShopProgress(shop, { level: nextLevel });
      setIsUpgrading(false);
      setShowCelebration(true);
      
      // Clear celebration after a few seconds and advance
      setTimeout(() => {
        setShowCelebration(false);
        onComplete();
      }, 3000);
    }, 1500); // 1.5s animation duration
  };

  // Render a visual representation based on level
  const renderShopPreview = (level) => {
    return (
      <div className={`shop-preview-box level-${level}`} aria-hidden="true">
        <div className="shelves-preview">
          <Shelf isEmpty={level === 1} />
          {level >= 2 && <Shelf isEmpty={false} />}
          {level >= 3 && <div className="shop-decorations">✨ সুন্দর ডেকোরেশন ✨</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="shop-upgrade-container" role="main" aria-label="দোকান আপগ্রেড">
      <img src={bgImage} alt="" className="shop-bg blur-bg" aria-hidden="true" />
      
      <div className="upgrade-overlay">
        <ShopHeader shopName="দোকান আপগ্রেড" onBack={onBack} />
        
        <div className="stars-wallet" aria-label={`তোমার কাছে আছে ${progress.stars} স্টার`}>
          <span aria-hidden="true">⭐</span> তোমার স্টার: {progress.stars}
        </div>

        <div className="upgrade-content">
          {nextLevel ? (
            <>
              <div className="preview-section before" aria-label={`বর্তমান লেভেল ${currentLevel}`}>
                <h3>বর্তমান (লেভেল {currentLevel})</h3>
                {renderShopPreview(currentLevel)}
              </div>

              <div className="upgrade-action">
                <motion.button 
                  className={`action-button primary-btn upgrade-btn ${!canAfford ? 'disabled' : ''}`}
                  whileHover={canAfford ? { scale: 1.05 } : {}}
                  whileTap={canAfford ? { scale: 0.95 } : {}}
                  onClick={handleUpgrade}
                  disabled={!canAfford || isUpgrading}
                  aria-label={`আপগ্রেড করো, খরচ ${requiredStars} স্টার`}
                >
                  {isUpgrading ? "আপগ্রেড হচ্ছে..." : `আপগ্রেড করো (⭐ ${requiredStars})`}
                </motion.button>
                {!canAfford && (
                  <p className="hint-text" role="alert">আরও {requiredStars - progress.stars} স্টার লাগবে!</p>
                )}
              </div>

              <div className="preview-section after" aria-label={`পরবর্তী লেভেল ${nextLevel}`}>
                <h3>পরবর্তী (লেভেল {nextLevel})</h3>
                <AnimatePresence>
                  {isUpgrading ? (
                    <motion.div 
                      className="upgrade-flash"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0 }}
                      aria-hidden="true"
                    />
                  ) : (
                    renderShopPreview(nextLevel)
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="max-level-message">
              <motion.h2
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                aria-live="polite"
              >
                🎉 তোমার দোকান ফুল লেভেলে আছে! 🎉
              </motion.h2>
              {renderShopPreview(currentLevel)}
              <motion.button 
                className="action-button primary-btn"
                onClick={onComplete}
              >
                সামনে চলো →
              </motion.button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showCelebration && (
            <motion.div 
              className="celebration-toast"
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              role="alert"
              aria-live="assertive"
            >
              দারুণ! তোমার দোকান আরও সুন্দর হয়েছে! 🎊
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
