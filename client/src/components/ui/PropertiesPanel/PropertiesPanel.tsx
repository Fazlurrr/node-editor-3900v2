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
    <div className="h-full w-56 border bg-white dark:bg-navbar-dark fixed top-0 right-0 z-10">
      <div className="p-4 mt-14 mb-2 border-b">
        <h2 className="text-lg font-semibold text-black dark:text-white">Properties</h2>
      </div>
      <div className="p-4 overflow-auto">
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
