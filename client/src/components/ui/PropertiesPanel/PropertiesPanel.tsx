import { Node, Edge } from 'reactflow';
import CurrentNode from './CurrentNode';
import CurrentEdge from './CurrentEdge';
import { MiniMapStyled } from '@/components/ui/styled';
import { AspectType} from '@/lib/types';
import React from 'react';
import {  MiniMapProvider ,useMiniMapContext } from '../toggleMiniMap';
import { Info } from 'lucide-react';



interface PropertiesPanelProps {
  selectedElement: Node | Edge | null;
}

function isEdgeElement(element: Node | Edge): element is Edge {
  return 'source' in element && 'target' in element;
}

const getAspectColor = (node: any): string => {
  const aspect = node.data.aspect;
  switch (aspect) {
    case AspectType.Function:
      return '#fff000';
    case AspectType.Product:
      return '#00ffff';
    case AspectType.Location:
      return '#ff00ff';
    case AspectType.Installed:
      return '#424bb2';
    case AspectType.NoAspect:
      return '#E0E0E0';
    case AspectType.UnspecifiedAspect:
      return '#9E9E9E';
    default:
      return '#f2f2f5';
  }
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElement }) => {
  const { isMiniMapVisible } = useMiniMapContext();

  return (
    <MiniMapProvider>
      <div
        className="h-full w-56 border border-[#9facbc] bg-white dark:bg-navbar-dark fixed top-0 right-0 z-10 
        flex flex-col"
      >
        <div className="pb-2 pl-4 mt-20 pt-2 mb-2 border-b border-[#9facbc]">
        <h2 className="text-lg font-semibold text-black dark:text-white">Properties</h2>
        </div>
        <div className="flex-1 overflow-auto">
        {selectedElement ? (
          isEdgeElement(selectedElement) ? (
          <CurrentEdge currentEdge={selectedElement} />
          ) : (
          <CurrentNode currentNode={selectedElement} />
          )
        ) : (
          <div className="flex items-center justify-center p-4">
              <Info name="info" className="mr-2" />
              <p className="text-normal text-black dark:text-white">No element or relation selected</p>
          </div>
        )}
        </div>
        {isMiniMapVisible && (
          
          <MiniMapStyled
            nodeColor={getAspectColor}
            pannable={true}
            zoomable={true}
            zoomStep={0.5}
            style={{
              position: 'relative',
              width: 224,
              height: 120,
              bottom: 'auto',
              right: 'auto',
              margin: 0,
              borderTop: '1px solid #9facbc',
            }}
          />
        )}
      </div>
    </MiniMapProvider>
  );
};

export default PropertiesPanel;
