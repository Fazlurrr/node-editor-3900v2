import { useSidebar } from '@/hooks';
import type { CustomEdgeProps } from '@/lib/types';
import { getStraightPath } from 'reactflow';
import { selectionColor } from '@/lib/config';

const Proxy = (props: CustomEdgeProps) => {
  const { openSidebar } = useSidebar();

  const [pathData] = getStraightPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  });

  return (
    <g onClick={() => openSidebar({ ...props, type: 'proxy' })}>
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
      <path stroke="currentColor" strokeWidth="2" d={pathData} fill="none" strokeDasharray={2}/>
    </g>
  );
};

export default Proxy;