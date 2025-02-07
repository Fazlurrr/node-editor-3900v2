import { useSidebar } from '@/hooks';
import type { CustomEdgeProps } from '@/lib/types';
import { getStraightPath } from 'reactflow';

const Part = (props: CustomEdgeProps) => {
  const { openSidebar } = useSidebar();

  const [pathData] = getStraightPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  });

  return (
    <g onClick={() => openSidebar({ ...props, type: 'part' })}>
      <defs>
        <marker
        id="parthead"
        markerWidth="8"
        markerHeight="5.6"
        refX="8.5"
        refY="2.8"
        orient="auto"
        markerUnits="strokeWidth"
        >
        <polygon points="4.5,0 9,2.8 4.5,5.6 0,2.8" fill="currentColor" />
        </marker>
      </defs>
      <path
        stroke="currentColor"
        strokeWidth="2"
        d={pathData}
        markerEnd="url(#parthead)"
      />
    </g>
  );
};

export default Part;
