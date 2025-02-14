import React, { useContext, useState, createContext, useEffect, ReactNode } from 'react';

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

export const GridProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isGridVisible, setGridVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) and 'G' are pressed simultaneously
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        setGridVisible(!isGridVisible);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGridVisible]); 

  return (
    <GridContext.Provider value={{ isGridVisible, setGridVisible }}>
      {children}
    </GridContext.Provider>
  );
};
