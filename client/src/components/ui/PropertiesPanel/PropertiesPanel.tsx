import React from 'react';
import { Node, Edge } from 'reactflow';

interface PropertiesPanelProps {
  selectedElement: Node | Edge | null; // Accept either a Node or an Edge
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElement }) => {
  return (
    <div className="h-full w-56 text-white border border-[#9facbc] bg-white dark:bg-navbar-dark fixed top-0 right-0 z-10">
      <div className="p-4 mt-14 mb-2 border-b border-[#9facbc]">
        <h2 className="text-lg text-black dark:text-white font-semibold">Properties</h2>
      </div>
      <div className="p-4">
        {selectedElement ? (
          <div>
            <p className="mb-2 text-black dark:text-white">
              <strong>ID:</strong> {selectedElement.id}
            </p>
            {'data' in selectedElement && (
              <>
                <p className="mb-2 text-black dark:text-white">
                  <strong>Label:</strong> {selectedElement.data?.label || 'N/A'}
                </p>
                <p className="mb-2 text-black dark:text-white">
                  <strong>Type:</strong> {selectedElement.type || 'Default'}
                </p>
                {'position' in selectedElement && (
                  <p className="mb-2 text-black dark:text-white">
                    <strong>Position:</strong> ({selectedElement.position.x.toFixed(2)}, {selectedElement.position.y.toFixed(2)})
                  </p>
                )}
              </>
            )}
            {'source' in selectedElement && (
              <>
                <p className="mb-2 text-black dark:text-white">
                  <strong>Source:</strong> {selectedElement.source}
                </p>
                <p className="mb-2 text-black dark:text-white">
                  <strong>Target:</strong> {selectedElement.target}
                </p>
                <p className="mb-2 text-black dark:text-white">
                  <strong>Type:</strong> {selectedElement.type || 'Default'}
                </p>
              </>
            )}
          </div>
        ) : (
          <p className="text-black dark:text-white">No element selected</p>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
