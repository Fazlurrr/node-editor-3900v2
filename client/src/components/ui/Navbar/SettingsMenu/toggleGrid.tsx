import React, { useContext, useState, createContext, ReactNode } from 'react';

interface GridContextType {
  isGridVisible: boolean;
  setGridVisible: (value: boolean) => void;
}

const defaultState = {
  isGridVisible: true,
  setGridVisible: () => {},
};

const GridContext = createContext<GridContextType>(defaultState);

export const useGridContext = () => useContext(GridContext);

export const GridProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Keep the same default (true), but remove the old keydown side-effect
  const [isGridVisible, setGridVisible] = useState(true);

  return (
    <GridContext.Provider value={{ isGridVisible, setGridVisible }}>
      {children}
    </GridContext.Provider>
  );
};
