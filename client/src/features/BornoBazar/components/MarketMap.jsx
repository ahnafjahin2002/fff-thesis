import { useState } from 'react';
import { motion } from 'framer-motion';
import { bornoAssets } from '../assets/config';
import { shops } from '../data/shops';

export default function MarketMap({ onComplete, setShop, onBack }) {
  const [hoveredShop, setHoveredShop] = useState(null);

  const handleShopClick = (shopData) => {
    if (shopData.locked) return;
    setShop(shopData.id);
    onComplete();
  };

  const handleKeyDown = (e, shopData) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleShopClick(shopData);
    }
  };

  return (
    <div className="market-map-container" role="main" aria-label="বর্ণবাজার ম্যাপ">
      {/* Background Layer */}
      <img 
        src={bornoAssets.backgrounds.bazarMap} 
        alt="" 
        className="market-map-bg"
        aria-hidden="true"
      />

      {/* Main UI Overlay */}
      <div className="market-map-overlay">
        <header className="market-header" style={{ position: 'relative' }}>
          {onBack && (
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={onBack} 
              style={{ 
                position: 'absolute', 
                left: '20px', 
                top: '20px', 
                width: '44px', 
                height: '44px', 
                borderRadius: '14px', 
                border: 'none', 
                background: 'white', 
                cursor: 'pointer', 
                fontSize: '18px', 
                boxShadow: '0 2px 10px rgba(0,0,0,.08)',
                zIndex: 10
              }}
              aria-label="ফিরে যান"
            >
              ←
            </motion.button>
          )}
          <motion.h1 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            tabIndex={0}
          >
            বর্ণবাজার
          </motion.h1>
          <p tabIndex={0}>তুমি কোন দোকানে যেতে চাও?</p>
        </header>

        <div className="shops-grid" role="list">
          {shops.map((shop, index) => {
            const isLocked = shop.locked;
            const shopImage = bornoAssets.shops[shop.assetKey];

            return (
              <motion.div
                key={shop.id}
                role="listitem"
                className={`shop-card ${isLocked ? 'locked' : 'unlocked'}`}
                onHoverStart={() => !isLocked && setHoveredShop(shop.id)}
                onHoverEnd={() => setHoveredShop(null)}
                onClick={() => handleShopClick(shop)}
                
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!isLocked ? { scale: 1.05, y: -10 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                tabIndex={isLocked ? -1 : 0}
                aria-label={isLocked ? `${shop.name} - বন্ধ আছে` : shop.name}
                onKeyDown={(e) => handleKeyDown(e, shop)}
              >
                <div className="shop-image-container">
                  <img 
                    src={shopImage} 
                    alt="" 
                    className="shop-building-img"
                    aria-hidden="true"
                  />
                  {isLocked && (
                    <div className="lock-overlay" aria-hidden="true">
                      <span className="lock-icon">🔒</span>
                    </div>
                  )}
                </div>

                <div className={`shop-label ${hoveredShop === shop.id ? 'highlighted' : ''}`}>
                  <h3>{shop.name}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
