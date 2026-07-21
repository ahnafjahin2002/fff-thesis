import { motion } from 'framer-motion';
import { bornoAssets } from '../assets/config';

export default function Shelf({ shopProducts = [], inventory = [], onSlotClick }) {
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      maxWidth: '550px', /* Widened to fit 3 cards per row naturally */
      height: '600px', /* Tall enough to fit cards vertically */
      margin: '0 auto 20px auto'
    }}>
      {/* Background Shelf Image */}
      <img 
        src={bornoAssets.gameplayUi.woodenShelf} 
        alt="" 
        aria-hidden="true"
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block',
          zIndex: 0,
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))',
          objectFit: 'fill'
        }} 
      />
      
      {/* 3-Row Product Slots Grid */}
      <div style={{ 
        position: 'absolute', 
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        padding: '5% 5% 15% 5%', 
        justifyContent: 'space-between'
      }}>
        {[0, 1, 2].map(rowIndex => (
          <div key={`row-${rowIndex}`} style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px', 
            flex: 1, 
            alignItems: 'flex-end',
            paddingBottom: '2%'
          }}>
            {shopProducts.slice(rowIndex * 3, rowIndex * 3 + 3).map((product, index) => {
              const isStocked = inventory.includes(product.id);
              
              return (
                <div key={product.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {isStocked ? (
                    <motion.div
                      initial={{ y: 50, scale: 0.5, opacity: 0 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        boxShadow: '0 6px 20px rgba(255, 165, 0, 0.4), inset 0 2px 10px rgba(255,255,255,0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid #FFF',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <motion.div 
                        style={{
                          position: 'absolute',
                          top: 0, left: '-100%', width: '50%', height: '100%',
                          background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
                          transform: 'skewX(-25deg)'
                        }}
                        animate={{ left: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                      />
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', zIndex: 1, position: 'relative', whiteSpace: 'nowrap' }}>
                        {product.word}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                      onClick={() => onSlotClick?.(product.id)}
                      style={{ 
                        cursor: 'pointer',
                        width: '100px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed rgba(255, 255, 255, 0.5)',
                        borderRadius: '12px',
                        background: 'rgba(0, 0, 0, 0.1)'
                      }}
                      role="button"
                      aria-label="পণ্য সাজাও"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSlotClick?.(product.id);
                        }
                      }}
                    >
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
