import React from 'react';
import { Node, Edge } from 'reactflow';
import CurrentNode from './CurrentNode';
import CurrentEdge from './CurrentEdge';

interface PropertiesPanelProps {
  selectedElement: Node | Edge | null;
}

function isEdgeElement(element: Node | Edge): element is Edge {
  return 'source' in element && 'target' in element;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElement }) => {
  return (
    <div className="h-full w-56 border border-[#9facbc] bg-white dark:bg-navbar-dark fixed top-0 right-0 z-10 
        overflow-y-auto
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-white
        [&::-webkit-scrollbar-thumb]:bg-gray-200
        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
      <div className="p-4 mt-14 mb-2 border-b border-[#9facbc]">
        <h2 className="text-lg font-semibold text-black dark:text-white">Properties</h2>
      </div>
      <div className="overflow-auto">
        {selectedElement ? (
          isEdgeElement(selectedElement) ? (
            <CurrentEdge currentEdge={selectedElement} />
          ) : (
            <CurrentNode currentNode={selectedElement} />
          )
        ) : (
          <p>No element selected</p>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
