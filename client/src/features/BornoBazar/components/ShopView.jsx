import { motion } from 'framer-motion';
import { bornoAssets } from '../assets/config';
import { shops } from '../data/shops';
import { products } from '../data/products';
import { useBornoBazarContext } from '../context/BornoBazarContext';
import ShopHeader from './ShopHeader';
import Shelf from './Shelf';
import GameButton from './GameButton';

export default function ShopView({ shop, onComplete, onBack }) {
  const shopData = shops.find(s => s.id === shop);
  const shopName = shopData ? shopData.name : "দোকান";
  const shopProducts = products.filter(p => p.shop === shop);
  
  const { progress } = useBornoBazarContext();
  const inventory = progress?.inventory || [];

  const isFullyStocked = shopProducts.length > 0 && shopProducts.every(p => inventory.includes(p.id));

  // Use the shop's specific interior background, or fallback to general map bg
  const bgImage = bornoAssets.backgrounds[shopData?.assetKey] || bornoAssets.backgrounds.bazarMap;
  const shopkeeperImg = bornoAssets.characters.shopkeeper;

  return (
    <div className="shop-view-container" role="region" aria-label={`${shopName} - ভিতরের দৃশ্য`}>
      <motion.img 
        src={bgImage} 
        alt="" 
        className="shop-bg" 
        aria-hidden="true" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      <div className="shop-overlay">
        <ShopHeader shopName={shopName} onBack={onBack} />
        
        <div className="shop-main-content">
          <div className="shop-left-panel">
            <motion.div 
              className="shopkeeper-container"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <div className="speech-bubble" role="status" aria-live="polite">
                <p>
                  {isFullyStocked 
                    ? "বাহ! দোকান একদম সাজানো! কাস্টমারের অপেক্ষা করি!"
                    : "দোকানটি খালি! পণ্য সাজাতে শব্দ বানাও।"
                  }
                </p>
              </div>
              <img 
                src={shopkeeperImg} 
                alt="দোকানদার" 
                className="shopkeeper-img" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="character-placeholder" style={{ display: 'none' }}>
                দোকানদার
              </div>
            </motion.div>
          </div>
          
          <div className="shop-center-panel" aria-label="তাক">
            <div className="shelves-container">
              {/* Split products into multiple shelves if necessary, simple version: all on one shelf for now, or chunk them */}
              <Shelf shopProducts={shopProducts.slice(0, 4)} inventory={inventory} />
              {shopProducts.length > 4 && (
                <Shelf shopProducts={shopProducts.slice(4, 8)} inventory={inventory} />
              )}
            </div>
          </div>
        </div>

        <div className="shop-footer">
          <GameButton onClick={onComplete} aria-label="পণ্য সাজানো শুরু করুন">
            পণ্য সাজাও
          </GameButton>
        </div>
      </div>
    </div>
  );
}
