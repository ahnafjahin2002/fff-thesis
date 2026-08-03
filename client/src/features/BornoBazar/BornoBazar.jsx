import { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassroom } from '../../context/ClassroomContext';
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
  const navigate = useNavigate();
  const { isClassroomMode, activeClassroomStudent } = useClassroom();
  const [currentStage, setCurrentStage] = useState(STAGES.MAP);
  const [currentShop, setCurrentShop] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [sessionActivities, setSessionActivities] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (isClassroomMode) {
      navigate('/teacher-workspace');
    } else {
      navigate('/dashboard');
    }
  };

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
        return <MarketMap onComplete={() => handleStageTransition(STAGES.SHOP)} setShop={setCurrentShop} onBack={handleBack} />;
      case STAGES.SHOP:
      case STAGES.STOCKING:
        return (
          <>
            <ShopView shop={currentShop} onComplete={(productId) => { setSelectedProductId(productId); handleStageTransition(STAGES.STOCKING); }} onNextStage={() => handleStageTransition(STAGES.REWARD_STOCKING, 300)} onBack={() => handleStageTransition(STAGES.MAP)} />
            <AnimatePresence>
              {currentStage === STAGES.STOCKING && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 50 }}
                >
                  <StockingGame shop={currentShop} targetProductId={selectedProductId} onComplete={() => handleStageTransition(STAGES.SHOP)} onBack={() => handleStageTransition(STAGES.SHOP)} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        );
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
        return <MarketMap onComplete={() => handleStageTransition(STAGES.SHOP)} setShop={setCurrentShop} onBack={handleBack} />;
    }
  };

  return (
    <div className="borno-bazar-container">
      {isClassroomMode && activeClassroomStudent && (
        <div style={{ position: 'relative', zIndex: 999, background: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '10px 24px', fontWeight: 800, fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', borderBottom: '2px solid #38bdf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📽️</span>
            <span>ক্লাসরুম প্র্যাকটিস • আজকের শিক্ষার্থী: {activeClassroomStudent.name} ({activeClassroomStudent.classGrade || 'প্রথম শ্রেণী'})</span>
          </div>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
            {activeClassroomStudent.avatar || '👦'} সক্রিয়
          </span>
        </div>
      )}

      <Suspense fallback={<div className="loading-screen"><div className="spinner"></div></div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage === STAGES.STOCKING ? STAGES.SHOP : currentStage}
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
