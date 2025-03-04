import { Node, Edge } from 'reactflow';
import CurrentNode from './CurrentNode';
import CurrentEdge from './CurrentEdge';
import { MiniMapStyled } from '@/components/ui/styled';
import { AspectType, EdgeType } from '@/lib/types';
import { set } from 'zod';
import React from 'react';
import {  MiniMapProvider ,useMiniMapContext } from '../toggleMiniMap';

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

// const getEdgeColor = (edge: any): string => {
//   const aspect = edge.data.aspect;
//   switch (aspect) {
//     case EdgeType.Connected:
//       return '#ff6347';  
//     case EdgeType.Transfer:
//       return '#4682b4';  
//     case EdgeType.Part:
//       return '#32cd32'; 
//     case EdgeType.Specialization:
//       return '#ff69b4';
//     case EdgeType.Fulfilled:
//       return '#ff4500';
//     case EdgeType.Proxy:
//       return '#d3d3d3';
//     case EdgeType.Projection:
//       return '#d3d3d3';
//     case EdgeType.Equality:
//       return '#d3d3d3';
//     default:
//       return '#87gr34'; 
//   }
// };

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElement }) => {

  const { isMiniMapVisible } = useMiniMapContext();


  return (
    <MiniMapProvider>
      <div
        className="h-full w-56 border border-[#9facbc] bg-white dark:bg-navbar-dark fixed top-0 right-0 z-10 
        flex flex-col"
      >
        <div className="pb-2 pl-4 mt-14 mb-2 border-b border-[#9facbc]">
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
          <p className="p-4">No element selected</p>
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
