import type { CustomEdgeProps } from '@/lib/types';
import { getStraightPath } from 'reactflow';
import { selectionColor } from '@/lib/config';

const Equality = (props: CustomEdgeProps) => {

  // Distance between the two parallel lines
  const offset = 4;

  const dx = props.targetX - props.sourceX;
  const dy = props.targetY - props.sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = (dy / length) * offset;
  const perpY = (-dx / length) * offset;

  const [pathData] = getStraightPath({
    sourceX: props.sourceX + perpX / 2,
    sourceY: props.sourceY + perpY / 2,
    targetX: props.targetX + perpX / 2,
    targetY: props.targetY + perpY / 2,
  });

  const [pathData2] = getStraightPath({
    sourceX: props.sourceX - perpX / 2,
    sourceY: props.sourceY - perpY / 2,
    targetX: props.targetX - perpX / 2,
    targetY: props.targetY - perpY / 2,
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
        stroke="transparent"
        strokeWidth="20"
        d={pathData}
        fill="none"
        style={{ cursor: 'pointer' }}
      />
      <path stroke="currentColor" strokeWidth="2" d={pathData} fill="none" />
      <path stroke="currentColor" strokeWidth="2" d={pathData2} fill="none" />
    </g>
  );
};

export default Equality;