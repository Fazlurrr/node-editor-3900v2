import { useSidebar } from '@/hooks';
import type { CustomEdgeProps } from '@/lib/types';
import { getStraightPath } from 'reactflow';


const Fulfilled = (props: CustomEdgeProps) => {
  const { openSidebar } = useSidebar();

  const [pathData] = getStraightPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  });

  return (
    <g onClick={() => openSidebar({ ...props, type: 'fulfilled' })}>
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
        id="fulfilledhead"
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
        strokeDasharray={5}
        markerEnd="url(#fulfilledhead)"
      />
    </g>
  );
};

export default Fulfilled;
