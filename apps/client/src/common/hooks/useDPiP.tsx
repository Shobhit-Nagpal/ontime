import { useState, useCallback, useRef, ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';

// Extend the Window interface for Document PiP API
declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;
      window: Window | null;
    };
  }
}

interface DocumentPictureInPictureOptions {
  width?: number;
  height?: number;
  disallowReturnToOpener?: boolean;
}

interface UsePictureInPictureOptions {
  width?: number;
  height?: number;
  disallowReturnToOpener?: boolean;
}

interface UsePictureInPictureReturn {
  openPiP: (component: ReactNode, options?: UsePictureInPictureOptions) => Promise<Window | null>;
  closePiP: () => void;
  isOpen: boolean;
  pipWindow: Window | null;
  isSupported: boolean;
}

export const usePictureInPicture = (): UsePictureInPictureReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pipWindowRef = useRef<Window | null>(null);
  const rootRef = useRef<Root | null>(null);

  const isSupported = 'documentPictureInPicture' in window;

  const openPiP = useCallback(async (
    component: ReactNode, 
    options: UsePictureInPictureOptions = {}
  ): Promise<Window | null> => {
    try {
      if (!window.documentPictureInPicture) {
        throw new Error('Document Picture-in-Picture not supported');
      }

      // Open the PiP window
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: options.width ?? 400,
        height: options.height ?? 300,
        disallowReturnToOpener: options.disallowReturnToOpener ?? false,
      });

      pipWindowRef.current = pipWindow;

      // Copy stylesheets from parent document
      const stylesheets = Array.from(
        document.head.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
          'link[rel="stylesheet"], style'
        )
      );
      
      stylesheets.forEach(sheet => {
        const clonedSheet = sheet.cloneNode(true) as HTMLElement;
        pipWindow.document.head.appendChild(clonedSheet);
      });

      // Set up the body
      pipWindow.document.body.style.cssText = `
        margin: 0;
        padding: 0;
        overflow: hidden;
        font-family: inherit;
      `;

      // Create React root and render
      const root = createRoot(pipWindow.document.body);
      rootRef.current = root;
      root.render(component);

      // Handle window close
      const handleClose = (): void => {
        if (rootRef.current) {
          rootRef.current.unmount();
          rootRef.current = null;
        }
        pipWindowRef.current = null;
        setIsOpen(false);
      };

      pipWindow.addEventListener('pagehide', handleClose);

      setIsOpen(true);
      return pipWindow;

    } catch (error) {
      console.error('Failed to open Document PiP:', error);
      throw error;
    }
  }, []);

  const closePiP = useCallback((): void => {
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
    }
  }, []);

  return {
    openPiP,
    closePiP,
    isOpen,
    pipWindow: pipWindowRef.current,
    isSupported,
  };
};
