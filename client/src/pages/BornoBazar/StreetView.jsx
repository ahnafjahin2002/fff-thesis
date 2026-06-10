import { motion } from 'framer-motion';
import { useGameState } from '../../hooks/useGameState';
import streetBg from '../../assets/street-empty.png';
import mascotWave from '../../assets/mascot-wave.png';

export default function StreetView({ onBuild, onTapShop, onBack }) {
  const { state } = useGameState();
  const { streetShops, playerStars, playerName } = state;

  return (
    <div className="street-view">
      {/* Background with empty stalls */}
      <div 
        className="street-bg" 
        style={{ backgroundImage: `url(${streetBg})` }}
      />
      
      {/* Header */}
      <div className="street-header">
        <motion.button 
          className="btn-back" 
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to Dashboard"
        >
          ←
        </motion.button>
        
        <div className="street-title">{playerName}র বাজার</div>
        
        <motion.div 
          className="star-display"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <span className="star-icon">⭐</span>
          <span className="star-count">{playerStars}</span>
        </motion.div>
      </div>

      {/* Main Street Area - Built Shops */}
      <div className="street-shops-area">
        {streetShops.length === 0 ? (
          // Empty state plots
          <>
            <div className="empty-plot" />
            <div className="empty-plot" style={{ animationDelay: '1s' }} />
            <div className="empty-plot" style={{ animationDelay: '2s' }} />
          </>
        ) : (
          // Built shops
streetShops.map((shop, i) => {
  const shopMainColor =
    typeof shop.color === 'string'
      ? shop.color
      : shop.color?.color || '#18b368';

  const shopAccentColor =
    typeof shop.color === 'string'
      ? shop.color
      : shop.color?.accent || shopMainColor;

  return (
    <motion.div 
      key={shop.id}
      className="street-shop"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      onClick={() => onTapShop(shop.id)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      style={{ cursor: 'pointer' }}
    >
      <div className="shop-facade">
        <div 
          className="shop-awning" 
          style={{ '--shop-color': shopAccentColor }}
        />
        <div className="shop-body" style={{ background: shopMainColor }}>
          <div className="shop-sign">{shop.letter}</div>
        </div>
        <div className="shop-counter" />
      </div>
    </motion.div>
  );
})
        )}
      </div>

      {/* Mascot and Primary Action */}
      <div className="street-bottom">
        {streetShops.length > 0 && (
          <div className="shop-count-text">
            {streetShops.length}টি দোকান
          </div>
        )}
        
        <motion.button 
          className="btn-primary"
          onClick={onBuild}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          দোকান বানাই
        </motion.button>

        {/* Mascot in bottom left */}
        <div className="mascot-container" style={{ position: 'absolute', bottom: 16, left: 24 }}>
          {streetShops.length === 0 && (
            <motion.div 
              className="mascot-speech"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              তোমার বাজার শুরু হোক!
            </motion.div>
          )}
          <motion.img 
            src={mascotWave} 
            alt="Mascot waving" 
            style={{ width: 120, height: 'auto' }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
      </div>
    </div>
  );
}
