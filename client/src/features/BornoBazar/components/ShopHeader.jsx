import { motion } from 'framer-motion';

import GameBackButton from './GameBackButton';

export default function ShopHeader({ shopName, onBack, backLabel = "ফিরে যাও" }) {
  return (
    <header className="shop-header">
      {onBack && <GameBackButton onClick={onBack} label={backLabel} />}
      <div className="shop-title-container">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          {shopName}
        </motion.h1>
      </div>
      <div className="spacer"></div>
    </header>
  );
}
