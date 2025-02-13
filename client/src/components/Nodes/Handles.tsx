import { FC } from 'react';
import { Handle, Position } from 'reactflow';

const Handles: FC<{
  nodeId: string;
}> = ({ nodeId }) => {
  const handleStyle = {
    background: 'black',
    border: '1px solid white',
    width: '7px',
    height: '7px', 
    borderRadius: '50%',
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
