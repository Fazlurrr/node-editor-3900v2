import React, { useContext, useState, createContext, ReactNode } from 'react';

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

  return (
    <MiniMapContext.Provider value={{ isMiniMapVisible, setMiniMapVisible }}>
      {children}
    </MiniMapContext.Provider>
  );
};
