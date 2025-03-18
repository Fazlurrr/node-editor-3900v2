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

const CurrentMultipleElements: React.FC<CurrentMultipleElementsProps> = ({ selectedElements }) => {
  const nodes = selectedElements.filter((el) => 'data' in el && el.data);
  const edges = selectedElements.filter((el) => 'source' in el && 'target' in el);

  const sortedNodes = [...nodes].sort((a, b) => {
    const labelA = getElementLabel(a).toLowerCase();
    const labelB = getElementLabel(b).toLowerCase();
    return labelA.localeCompare(labelB);
  });

  const sortedEdges = [...edges].sort((a, b) => {
    const labelA = getElementLabel(a).toLowerCase();
    const labelB = getElementLabel(b).toLowerCase();
    return labelA.localeCompare(labelB);
  });

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">Multiple Elements selected</h3>
      {sortedNodes.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold">Nodes:</h4>
          <ul className="list-disc list-inside">
            {sortedNodes.map((node) => (
              <li key={node.id}>{getElementLabel(node)}</li>
            ))}
          </ul>
        </div>
      )}
      {sortedEdges.length > 0 && (
        <div>
          <h4 className="font-semibold">Edges:</h4>
          <ul className="list-disc list-inside">
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
