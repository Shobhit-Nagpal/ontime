import { PipContext } from '../../common/context/PipContext';
import { useContext } from 'react';

export const usePiP = () => {
  const context = useContext(PipContext);
  if (!context) {
    throw new Error('usePiP must be used within a PiPProvider');
  }
  return context;
};
