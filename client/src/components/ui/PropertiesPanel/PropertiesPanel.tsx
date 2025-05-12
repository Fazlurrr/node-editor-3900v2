import React from 'react';
import { Node, Edge } from 'reactflow';
import CurrentElement from './CurrentElement';
import CurrentRelation from './CurrentRelation';
import CurrentMultipleElements from './CurrentMultipleElements';
import { MiniMapStyled } from '@/components/ui/styled';
import { AspectType } from '@/lib/types';
import { MiniMapProvider, useMiniMapContext } from '../Navbar/ViewMenu/toggleMiniMap';
import { Info } from 'lucide-react';

interface PropertiesPanelProps {
  collapsed: boolean;
  selectedElements: (Node | Edge)[];
}

function isEdgeElement(element: Node | Edge): element is Edge {
  return 'source' in element && 'target' in element;
}

const getAspectColor = (node: any): string => {
  switch (node.data.aspect as AspectType) {
    case AspectType.Function:          return '#fff000';
    case AspectType.Product:           return '#00ffff';
    case AspectType.Location:          return '#ff00ff';
    case AspectType.Installed:         return '#424bb2';
    case AspectType.NoAspect:          return '#E0E0E0';
    case AspectType.UnspecifiedAspect: return '#9E9E9E';
    default:                           return '#f2f2f5';
  }
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElements, collapsed }) => {
  const { isMiniMapVisible } = useMiniMapContext();
  const isMultiple = selectedElements.length > 1;
  const singleElement = selectedElements.length === 1 ? selectedElements[0] : null;

  return (
    <MiniMapProvider>
      <div
        className={
          `
          ${collapsed ? 'w-0 overflow-hidden' : 'w-full'}
          h-full bg-white dark:bg-navbar-dark
          border-l border-[#9facbc]
          flex flex-col
        `}
      >
        <div className="relative pb-2 pl-4 pt-2 mb-2 border-b border-[#9facbc]">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Properties
          </h2>
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 overflow-auto">
              {selectedElements.length > 0 ? (
                isMultiple ? (
                  <CurrentMultipleElements selectedElements={selectedElements} />
                ) : singleElement && !isEdgeElement(singleElement) ? (
                  <CurrentElement currentElement={singleElement} />
                ) : singleElement && isEdgeElement(singleElement) ? (
                  <CurrentRelation currentRelation={singleElement} />
                ) : null
              ) : (
                <div className="flex items-center justify-center p-4">
                  <Info className="mr-2" />
                  <p className="text-black dark:text-white">
                    No element or relation selected
                  </p>
                </div>
              )}
            </div>
            {isMiniMapVisible && (
              <MiniMapStyled
                nodeColor={getAspectColor}
                pannable
                zoomable
                zoomStep={0.5}
                style={{
                  position: 'relative',
                  width: 224,
                  height: 120,
                  margin: 0,
                  borderTop: '1px solid #9facbc',
                }}
              />
            )}
          </>
        )}
      </div>
    </MiniMapProvider>
  );
};

export default PropertiesPanel;
