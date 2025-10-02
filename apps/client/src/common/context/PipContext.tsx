import { PropsWithChildren, useCallback, useEffect, useState, ReactNode, useContext } from 'react';
import { createContext } from 'react'; // Fixed import
import { createRoot, Root } from 'react-dom/client';

interface PipContextType {
  openPiP: (componentToRender: ReactNode) => Promise<void>; // Added component parameter and async
  closePiP: () => void;
  isOpen: boolean;
}

export const PipContext = createContext<PipContextType>({
  openPiP: async () => {},
  closePiP: () => {},
  isOpen: false,
});

interface PipProviderProps {
  content: ReactNode;
}

export function PiPProvider({ content, children }: PropsWithChildren<PipProviderProps>) {
  const [pipContent, setPipContent] = useState<ReactNode | null>(content);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipRoot, setPipRoot] = useState<Root | null>(null);

  const openPiP = useCallback(
    async (componentToRender: ReactNode): Promise<void> => {
      if (pipWindow) return;

      //@ts-ignore
      const newPipWindow = await window.documentPictureInPicture.requestWindow({
        width: 800,
        height: 600,
      });

      // Copy all styles to PiP window
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          newPipWindow.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media.toString();
          link.href = styleSheet.href ?? '';
          newPipWindow.document.head.appendChild(link);
        }
      });

      setPipWindow(newPipWindow);
      setPipContent(componentToRender);

      newPipWindow.addEventListener('pagehide', () => {
        setPipWindow(null);
        setPipContent(null);
        setPipRoot(null);
      });
    },
    [pipWindow]
  );

  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
    }
  }, [pipWindow]);

  // Render PiP content in the PiP window
  useEffect(() => {
    if (pipWindow && pipContent && !pipRoot) {
      const newPipRoot = createRoot(pipWindow.document.body);
      setPipRoot(newPipRoot);
      
      newPipRoot.render(
        <PipContext.Provider value={{ openPiP, closePiP, isOpen: true }}>
          {pipContent}
        </PipContext.Provider>
      );
    }
  }, [pipWindow, pipContent, pipRoot, openPiP, closePiP]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pipRoot) {
        pipRoot.unmount();
      }
      if (pipWindow) {
        pipWindow.close();
      }
    };
  }, [pipRoot, pipWindow]);

  return (
    <PipContext.Provider value={{ openPiP, closePiP, isOpen: !!pipWindow }}>
      {children}
    </PipContext.Provider>
  );
}

// Hook for easy consumption
export const usePiP = () => {
  const context = useContext(PipContext);
  if (!context) {
    throw new Error('usePiP must be used within a PiPProvider');
  }
  return context;
};
