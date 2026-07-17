import { createContext, useContext } from 'react';
import useBornoProgress from '../hooks/useBornoProgress';

const BornoBazarContext = createContext(null);

export function BornoBazarProvider({ children }) {
  const bornoProgress = useBornoProgress();

  return (
    <BornoBazarContext.Provider value={bornoProgress}>
      {children}
    </BornoBazarContext.Provider>
  );
}

export function useBornoBazarContext() {
  const context = useContext(BornoBazarContext);
  if (!context) {
    throw new Error('useBornoBazarContext must be used within a BornoBazarProvider');
  }
  return context;
}
