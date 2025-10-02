import withPreset from '../../features/PresetWrapper';
import { usePiP } from './usePip';
import withData from '../../features/viewers/ViewWrapper';
import React from 'react';

const TimerView = React.lazy(() => import('../../views/timer/Timer'));
const STimer = withPreset(withData(TimerView));

export function usePiPService() {
  const { openPiP } = usePiP();

  return {
    openTimer: () => openPiP(<STimer />),
  };
}
