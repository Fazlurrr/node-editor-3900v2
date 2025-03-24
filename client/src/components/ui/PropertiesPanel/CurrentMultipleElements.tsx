import { Node, Edge } from 'reactflow';

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

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">Multiple Elements selected</h3>
      
      {(blocks.length || connectors.length || terminals.length) > 0 && (
        <div className="mb-4">
          {blocks.length > 0 && (
            <div className="mb-2">
              <h5 className="font-semibold">Blocks:</h5>
              <ul className="list-disc list-outside ml-4">
                {blocks.map((node) => (
                  <li key={node.id}>{getElementLabel(node)}</li>
                ))}
              </ul>
            </div>
          )}
          {connectors.length > 0 && (
            <div className="mb-2">
              <h5 className="font-semibold">Connectors:</h5>
              <ul className="list-disc list-outside ml-4">
                {connectors.map((node) => (
                  <li key={node.id}>{getElementLabel(node)}</li>
                ))}
              </ul>
            </div>
          )}
          {terminals.length > 0 && (
            <div>
              <h5 className="font-semibold">Terminals:</h5>
              <ul className="list-disc list-outside ml-4">
                {terminals.map((node) => (
                  <li key={node.id}>{getElementLabel(node)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {sortedEdges.length > 0 && (
        <div>
          <h4 className="font-semibold">Edges:</h4>
          <ul className="list-disc list-outside ml-4">
            {sortedEdges.map((edge) => (
              <li key={edge.id}>{getElementLabel(edge)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrentMultipleElements;
