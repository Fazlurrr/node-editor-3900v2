import React, { useContext, useState, createContext, useEffect, ReactNode } from 'react';

interface MiniMapContextType {
  isMiniMapVisible: boolean;
  setMiniMapVisible: (value: boolean) => void;
}

const defaultState = {
  isMiniMapVisible: true,
  setMiniMapVisible: () => {},
};

const MiniMapContext = createContext<MiniMapContextType>(defaultState);

export const useMiniMapContext = () => useContext(MiniMapContext);

export const MiniMapProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isMiniMapVisible, setMiniMapVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) and 'm' are pressed simultaneously
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        setMiniMapVisible(!isMiniMapVisible);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMiniMapVisible]); 

  return (
    <MiniMapContext.Provider value={{ isMiniMapVisible, setMiniMapVisible }}>
      {children}
    </MiniMapContext.Provider>
  );
};
