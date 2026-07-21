import { motion } from 'framer-motion';
import { bornoAssets } from '../assets/config';

export default function Shelf({ shopProducts = [], inventory = [], onSlotClick }) {
  // We'll generate spots for the shop's products. Max 4 per shelf, for example.
  // Or just display all shopProducts in this shelf container.
  
  return (
    <div className="shelf-container">
      <div className="shelf-board">
        {shopProducts.map((product, index) => {
          const isStocked = inventory.includes(product.id);
          const productImage = bornoAssets.products[product.imagePlaceholder] || null;

          return (
            <div key={product.id} className="shelf-slot">
              {isStocked ? (
                <motion.div
                  className="product-on-shelf"
                  initial={{ y: 50, scale: 0.5, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    boxShadow: '0 6px 20px rgba(255, 165, 0, 0.4), inset 0 2px 10px rgba(255,255,255,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #FFF',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '10px'
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
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', zIndex: 1, position: 'relative' }}>
                    {product.word}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="product-placeholder empty-slot"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.2 }}
                  onClick={() => onSlotClick?.(product.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="question-mark">?</span>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
      <div className="shelf-shadow"></div>
    </div>
  );
}
