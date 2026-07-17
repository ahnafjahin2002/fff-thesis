import { motion } from 'framer-motion';
import { bornoAssets } from '../assets/config';

export default function Shelf({ shopProducts = [], inventory = [] }) {
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
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                >
                  {productImage ? (
                    <img src={productImage} alt={product.word} className="shelf-product-img" />
                  ) : (
                    <div className="placeholder-product">{product.word}</div>
                  )}
                  <span className="product-label">{product.word}</span>
                </motion.div>
              ) : (
                <motion.div 
                  className="product-placeholder empty-slot"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.2 }}
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
