import { createContext, useContext } from 'react';

interface KindnessSparksContextType {
  triggerSparks: () => void;
}

export const KindnessSparksContext = createContext<KindnessSparksContextType | null>(null);

export function useKindnessSparksContext() {
  const context = useContext(KindnessSparksContext);
  if (!context) {
    throw new Error('useKindnessSparksContext must be used within KindnessSparksProvider');
  }
  return context;
}