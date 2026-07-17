import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bornoBazarProgress';

const DEFAULT_PROGRESS = {
  stars: 0,
  coins: 0,
  inventory: [],
  shopProgress: {}
};

export default function useBornoProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load progress', error);
    }
    return DEFAULT_PROGRESS;
  });

  // Save to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress', error);
    }
  }, [progress]);

  const addStar = (amount = 1) => {
    setProgress(prev => ({
      ...prev,
      stars: prev.stars + amount
    }));
  };

  const addCoin = (amount = 1) => {
    setProgress(prev => ({
      ...prev,
      coins: prev.coins + amount
    }));
  };

  const addProduct = (productId) => {
    setProgress(prev => {
      // Avoid duplicate products
      if (prev.inventory.includes(productId)) return prev;
      return {
        ...prev,
        inventory: [...prev.inventory, productId]
      };
    });
  };

  const updateShopProgress = (shopId, levelData) => {
    setProgress(prev => ({
      ...prev,
      shopProgress: {
        ...prev.shopProgress,
        [shopId]: levelData
      }
    }));
  };

  const resetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
  };

  return {
    progress,
    addStar,
    addCoin,
    addProduct,
    updateShopProgress,
    resetProgress
  };
}
