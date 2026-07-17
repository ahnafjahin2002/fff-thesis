import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useBornoProgress from './hooks/useBornoProgress';
import { BornoBazarProvider } from './context/BornoBazarContext';
import MarketMap from './components/MarketMap';
import ShopView from './components/ShopView';
import StockingGame from './components/StockingGame';
import ConversationGame from './components/ConversationGame';
import RewardSystem from './components/RewardSystem';
import ShopUpgrade from './components/ShopUpgrade';
import BreakReminder from './components/BreakReminder';
import './BornoBazar.css';

export const STAGES = {
  MAP: 'MAP',
  SHOP: 'SHOP',
  STOCKING: 'STOCKING',
  REWARD_STOCKING: 'REWARD_STOCKING',
  CONVERSATION: 'CONVERSATION',
  REWARD_CONVERSATION: 'REWARD_CONVERSATION',
  UPGRADE: 'UPGRADE',
  BREAK: 'BREAK'
};

function BornoBazarInner({ onBack }) {
  const [currentStage, setCurrentStage] = useState(STAGES.MAP);
  const [currentShop, setCurrentShop] = useState(null);
  const [sessionActivities, setSessionActivities] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleStageTransition = (newStage, delay = 0) => {
    if (delay > 0) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentStage(newStage);
        setIsLoading(false);
      }, delay);
    } else {
      setCurrentStage(newStage);
    }
  };

  const advanceStage = () => {
    // Defines the exact flow:
    // MAP -> SHOP -> STOCKING -> REWARD_STOCKING -> CONVERSATION -> REWARD_CONVERSATION -> UPGRADE -> BREAK (or MAP)
    
    switch (currentStage) {
      case STAGES.MAP:
        handleStageTransition(STAGES.SHOP, 300);
        break;
      case STAGES.SHOP:
        handleStageTransition(STAGES.STOCKING, 300);
        break;
      case STAGES.STOCKING:
        handleStageTransition(STAGES.REWARD_STOCKING, 300);
        break;
      case STAGES.REWARD_STOCKING:
        handleStageTransition(STAGES.CONVERSATION, 300);
        break;
      case STAGES.CONVERSATION:
        handleStageTransition(STAGES.REWARD_CONVERSATION, 300);
        break;
      case STAGES.REWARD_CONVERSATION:
        handleStageTransition(STAGES.UPGRADE, 300);
        break;
      case STAGES.UPGRADE:
        const nextCount = sessionActivities + 1;
        if (nextCount >= 5) {
          setSessionActivities(0);
          handleStageTransition(STAGES.BREAK, 500);
        } else {
          setSessionActivities(nextCount);
          handleStageTransition(STAGES.MAP, 500);
        }
        break;
      case STAGES.BREAK:
        handleStageTransition(STAGES.MAP, 500);
        break;
      default:
        handleStageTransition(STAGES.MAP);
    }
  };

  const renderCurrentStage = () => {
    if (isLoading) {
      return (
        <div className="loading-screen" aria-live="polite" role="status">
          <div className="spinner"></div>
          <p>লোড হচ্ছে...</p>
        </div>
      );
    }

    switch (currentStage) {
      case STAGES.MAP:
        return <MarketMap onComplete={() => handleStageTransition(STAGES.SHOP)} setShop={setCurrentShop} onBack={onBack} />;
      case STAGES.SHOP:
        // Shop can go back to MAP or advance to STOCKING
        return <ShopView shop={currentShop} onComplete={advanceStage} onBack={() => handleStageTransition(STAGES.MAP)} />;
      case STAGES.STOCKING:
        return <StockingGame shop={currentShop} onComplete={advanceStage} onBack={() => handleStageTransition(STAGES.SHOP)} />;
      case STAGES.REWARD_STOCKING:
        return <RewardSystem onComplete={advanceStage} stageContext="stocking" />;
      case STAGES.CONVERSATION:
        return <ConversationGame shop={currentShop} onComplete={advanceStage} onBack={() => handleStageTransition(STAGES.SHOP)} />;
      case STAGES.REWARD_CONVERSATION:
        return <RewardSystem onComplete={advanceStage} stageContext="conversation" />;
      case STAGES.UPGRADE:
        // Upgrade can also go back to MAP manually, but standard advance goes to BREAK/MAP
        return <ShopUpgrade shop={currentShop} onComplete={advanceStage} onBack={() => handleStageTransition(STAGES.MAP)} />;
      case STAGES.BREAK:
        return <BreakReminder onComplete={advanceStage} />;
      default:
        return <MarketMap onComplete={() => handleStageTransition(STAGES.SHOP)} setShop={setCurrentShop} onBack={onBack} />;
    }
  };

  return (
    <div className="borno-bazar-container">
      <Suspense fallback={<div className="loading-screen"><div className="spinner"></div></div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%' }}
          >
            {renderCurrentStage()}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

export default function BornoBazar({ onBack }) {
  return (
    <BornoBazarProvider>
      <BornoBazarInner onBack={onBack} />
    </BornoBazarProvider>
  );
}
