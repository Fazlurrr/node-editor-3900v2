import type { CustomEdgeProps } from '@/lib/types';
import { getStraightPath } from 'reactflow';
import { selectionColor} from '@/lib/config';

const Connected = (props: CustomEdgeProps) => {

  const [pathData] = getStraightPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  });

  return (
    <g>
      {/* Selection visualizer */}
      <path
        stroke={props.selected ? selectionColor : 'transparent'}
        strokeWidth="6"
        d={pathData}
        fill="none"
      />
      {/* Invisible path for larger clickable area */}
      <path
        
        stroke='transparent'
        strokeWidth="20"
        d={pathData}
        fill="none"
        style={{ cursor: 'pointer' }}
      />
      <path stroke="currentColor" strokeWidth="2" d={pathData} fill="none" />
    </g>
  );
};

export default Connected;
