import { FC } from 'react';
import { Handle, Position } from 'reactflow';
import useConnection from '@/hooks/useConnection';

const Handles: FC<{
  nodeId: string;
}> = ({ nodeId }) => {
  const draggingRelation = useConnection(state => state.draggingRelation);

  return (
    <>
      <style>
        {`
          .handle {
            background: black;
            border: 1px solid white;
            width: 7px;
            height: 7px;
            border-radius: 50%;
          }
          
          .handle::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 30px;
            height: 30px;
            background: transparent;
            cursor: crosshair;
            pointer-events: all;
            border-radius: 50%;
          }
        `}
      </style>

      {/* Target Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id={`${nodeId}_top_target`}
        className="handle"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id={`${nodeId}_bottom_target`}
        className="handle"
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${nodeId}_left_target`}
        className="handle"
      />
      <Handle
        type="target"
        position={Position.Right}
        id={`${nodeId}_right_target`}
        className="handle"
      />

      {/* Source Handles */}
      <Handle
        type="source"
        position={Position.Top}
        id={`${nodeId}_top_source`}
        className="handle"
        hidden={draggingRelation}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${nodeId}_bottom_source`}
        className="handle"
        hidden={draggingRelation}
      />
      <Handle
        type="source"
        position={Position.Left}
        id={`${nodeId}_left_source`}
        className="handle"
        hidden={draggingRelation}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`${nodeId}_right_source`}
        className="handle"
        hidden={draggingRelation}
      />
    </>
  );
};

export default Handles;