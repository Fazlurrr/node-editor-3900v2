import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const toggleFullScreen = (): void => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err: Error) => {
      toast.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  } else if (document.exitFullscreen) {
    document.exitFullscreen().catch((err: Error) => {
      toast.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
    });
  }
};

const FullScreenToggle = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
      const handleFullScreenChange = () => {
          setIsFullScreen(!!document.fullscreenElement);
      };

      document.addEventListener('fullscreenchange', handleFullScreenChange);
      return () => {
          document.removeEventListener('fullscreenchange', handleFullScreenChange);
      };
  }, []);
};

export default FullScreenToggle;
