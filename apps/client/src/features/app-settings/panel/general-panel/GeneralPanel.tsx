import React from 'react';
import useScrollIntoView from '../../../../common/hooks/useScrollIntoView';
import type { PanelBaseProps } from '../../panel-list/PanelList';
import * as Panel from '../../panel-utils/PanelUtils';
import EditorSettingsForm from '../interface-panel/EditorSettingsForm';

import GeneralPanelForm from './GeneralPanelForm';
import ViewSettingsForm from './ViewSettingsForm';
import { usePictureInPicture } from '../../../../common/hooks/useDPiP';
import withData from '../../../../features/viewers/ViewWrapper';
import withPreset from '../../../../features/PresetWrapper';

import { ontimeQueryClient } from '../../../../common/queryClient';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const TimerView = React.lazy(() => import('../../../../views/timer/Timer'));
const STimer = withPreset(withData(TimerView));

export default function GeneralPanel({ location }: PanelBaseProps) {
  const generalRef = useScrollIntoView<HTMLDivElement>('settings', location);
  const editorRef = useScrollIntoView<HTMLDivElement>('editor', location);
  const viewRef = useScrollIntoView<HTMLDivElement>('view', location);
  const { openPiP, closePiP, isOpen, isSupported } = usePictureInPicture();

  const handleTimerPiP = async (): Promise<void> => {
    try {
      await openPiP(<TimerWithProviders />, {
        width: 500,
        height: 400,
      });
    } catch (error) {
      console.error('Could not open PiP:', error);
    }
  };

  return (
    <>
      <Panel.Header>App Settings</Panel.Header>
      <button onClick={handleTimerPiP}>Toggle Timer PiP</button>
      <div ref={generalRef}>
        <GeneralPanelForm />
      </div>
      <div ref={editorRef}>
        <EditorSettingsForm />
      </div>
      <div ref={viewRef}>
        <ViewSettingsForm />
      </div>
    </>
  );
}

function TimerWithProviders() {
  return (
    <ChakraProvider disableGlobalStyle resetCSS>
      <QueryClientProvider client={ontimeQueryClient}>
        <BrowserRouter>
          <div className='App'>
            <STimer />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
