import { Node, Edge } from 'reactflow';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';

interface CurrentMultipleElementsProps {
  selectedElements: (Node | Edge)[];
}

const getElementLabel = (element: Node | Edge): string => {
  if ('data' in element && element.data) {
    return element.data.customName || element.data.label || 'Unnamed Node';
  }
  if ('source' in element && 'target' in element) {
    return `Edge: ${element.id}`;
  }
  return 'Unknown Element';
};

const sortByLabel = (a: Node | Edge, b: Node | Edge) => {
  const labelA = getElementLabel(a).toLowerCase();
  const labelB = getElementLabel(b).toLowerCase();
  return labelA.localeCompare(labelB);
};

const CurrentMultipleElements: React.FC<CurrentMultipleElementsProps> = ({ selectedElements }) => {
  const nodes = selectedElements.filter((el) => 'data' in el && el.data) as Node[];
  const edges = selectedElements.filter((el) => 'source' in el && 'target' in el) as Edge[];

  const blocks = nodes.filter((node) => node.type === 'block').sort(sortByLabel);
  const connectors = nodes.filter((node) => node.type === 'connector').sort(sortByLabel);
  const terminals = nodes.filter((node) => node.type === 'terminal').sort(sortByLabel);
  const sortedEdges = [...edges].sort(sortByLabel);

  const [collapseElements] = React.useState(false);
  const [collapseRelations] = React.useState(false);

  return (
    <div className="px-4">
      <div className="text-lg text-black font-semibold dark:text-white mb-2 border-b border-[#9facbc] pb-2 -mx-4 px-4">
        Selected Elements
      </div>
      
      {(blocks.length || connectors.length || terminals.length) > 0 && (
        <div className="mb-2">
          {blocks.length > 0 && (
             <div className="mb-2 px-2 pb-2 border-b border-[#9facbc] -mx-4 px-4">
              <details open>
                <summary className="font-semibold flex justify-between items-start cursor-pointer">
                  <span>Blocks:</span>
                  {collapseElements ? (
                  <ChevronUp className="text-black-500 w-4 h-4" />
                  ) : (
                    <ChevronDown className="text-black-500 w-4 h-4" />
                  )}
                </summary>
                <ul className="list-disc list-outside ml-5">
                  {blocks.map((node) => (
                    <li key={node.id} className="break-words">{getElementLabel(node)}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
          {connectors.length > 0 && (
            <div className="mb-2 px-2 pb-2 border-b border-[#9facbc] -mx-4 px-4">
              <details open>
                  <summary className="font-semibold flex justify-between items-start cursor-pointer">
                    <span>Connectors:</span>
                    {collapseElements ? (
                    <ChevronUp className="text-black-500 w-4 h-4" />
                    ) : (
                      <ChevronDown className="text-black-500 w-4 h-4" />
                    )}
                  </summary>
                  <ul className="list-disc list-outside ml-5">
                    {connectors.map((node) => (
                      <li key={node.id} className="break-words">{getElementLabel(node)}</li>
                    ))}
                  </ul>
              </details>
            </div>
          )}
          {terminals.length > 0 && (
            <div className="mb-2 px-2 pb-2 border-b border-[#9facbc] -mx-4 px-4">
                <details open>
                    <summary className="font-semibold flex justify-between items-start cursor-pointer">
                      <span>Terminals:</span>
                      {collapseElements ? (
                      <ChevronUp className="text-black-500 w-4 h-4" />
                      ) : (
                        <ChevronDown className="text-black-500 w-4 h-4" />
                      )}
                    </summary>
                  <ul className="list-disc list-outside ml-5">
                    {terminals.map((node) => (
                      <li key={node.id} className="break-words">{getElementLabel(node)}</li>
                    ))}
                  </ul>
              </details>
            </div>
          )}
        </div>
      )}
      
      {sortedEdges.length > 0 && (
      <div className="mb-2 px-2 pb-2 -mx-4 px-4">
        <details open>
          <summary className="font-semibold flex justify-between items-start cursor-pointer">
            <span>Edges:</span>
            {collapseRelations ? (
            <ChevronUp className="text-black-500 w-4 h-4" />
            ) : (
              <ChevronDown className="text-black-500 w-4 h-4" />
            )}
          </summary>
          <ul className="list-disc list-outside ml-5">
            {sortedEdges.map((edge) => (
              <li key={edge.id} className="break-words">{getElementLabel(edge)}</li>
            ))}
          </ul>
        </details>
      </div>
    )}
  </div>
  );
};

export default CurrentMultipleElements;
