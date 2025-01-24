import { FC } from 'react';
import { Handle, Position } from 'reactflow';

const Handles: FC<{
  nodeId: string;
}> = ({ nodeId }) => {
  const handleStyle = {
    background: 'black',  // Hvit farge på håndtakene
    border: '1px solid white',  // Svart border rundt håndtakene
    width: '7px',  // Bredden på håndtakene
    height: '7px',  // Høyden på håndtakene
    borderRadius: '50%',  // Gjør håndtakene sirkulære
    bottom: '0.5px',  // Plasseringen av håndtakene
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id={`${nodeId}_top_target`}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Top}
        id={`${nodeId}_top_source`}
        style={handleStyle}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id={`${nodeId}_bottom_target`}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${nodeId}_bottom_source`}
        style={handleStyle}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${nodeId}_left_target`}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Left}
        id={`${nodeId}_left_source`}
        style={handleStyle}
      />
      <Handle
        type="target"
        position={Position.Right}
        id={`${nodeId}_right_target`}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`${nodeId}_right_source`}
        style={handleStyle}
      />
    </>
  );
};

export default Handles;
