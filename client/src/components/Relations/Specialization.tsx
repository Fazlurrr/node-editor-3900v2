import type { CustomEdgeProps } from '@/lib/types';
import { getStraightPath } from 'reactflow';
import { selectionColor } from '@/lib/config';

const Specialization = (props: CustomEdgeProps) => {

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
        stroke="transparent"
        strokeWidth="20"
        d={pathData}
        fill="none"
        style={{ cursor: 'pointer' }}
      />
        <defs>
            <marker
                id="Specializationhead"
                markerWidth="8"
                markerHeight="5.6"
                refX="6"
                refY="2.8"
                orient="auto"
                markerUnits="strokeWidth"
            >
                <polygon points="0 0, 6 2.8, 0 5.6" fill="white" stroke="currentColor" className="dark:fill-black" />
            </marker>
        </defs>
        <path
            stroke="currentColor"
            strokeWidth="2"
            d={pathData}
            fill="none"
            markerEnd="url(#Specializationhead)"
        />
    </g>
);
};

export default Specialization;
