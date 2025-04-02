import { useQuery } from '@tanstack/react-query';

import { CSS_OVERRIDE, overrideStylesURL } from '../api/constants';

import useViewSettings from './useViewSettings';

const scriptTagId = 'ontime-override';

const fetchData = async () => {
  const response = await fetch(overrideStylesURL);
  if (response.ok) {
    return response.text();
  }
  throw new Error('failed to load CSS override file');
};

export default function useOverrideStylesheet() {
  const { data, status } = useQuery({
    queryKey: CSS_OVERRIDE,
    queryFn: fetchData,
    placeholderData: (previousData, _previousQuery) => previousData,
    retry: 5,
    retryDelay: (attempt) => attempt * 2500,
    staleTime: Infinity,
    networkMode: 'always',
  });

  const shouldRender = status === 'success';

  const { data: viewSettings } = useViewSettings();
  const { overrideStyles } = viewSettings;

  if (overrideStyles) {
    console.log('overriding style');
    let styleSheet = document.getElementById(scriptTagId);
    if (!styleSheet) {
      console.log('creating style sheet');

      styleSheet = document.createElement('style');
      styleSheet.setAttribute('id', scriptTagId);
      // styleSheet.rel = 'stylesheet';
      document.head.append(styleSheet);
    }

    styleSheet!.innerHTML = data ?? '';
    document.head.append(styleSheet);
  } else {
    console.log('removing style');

    document.getElementById(scriptTagId)?.remove();
  }

  return { shouldRender };
}
