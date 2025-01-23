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
          markerWidth="10"
          markerHeight="7"
          refX="5"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <svg
            className="fill-part"
            width="7px"
            height="7px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="stroke-line stroke-part stroke-2"
              d="M11.5757 1.42426C11.81 1.18995 12.1899 1.18995 12.4243 1.42426L22.5757 11.5757C22.81 11.81 22.8101 12.1899 22.5757 12.4243L12.4243 22.5757C12.19 22.81 11.8101 22.8101 11.5757 22.5757L1.42426 12.4243C1.18995 12.19 1.18995 11.8101 1.42426 11.5757L11.5757 1.42426Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </marker>
      </defs>
      <path
        className="stroke-part stroke-2"
        d={pathData}
        fill="none"
        markerEnd="url(#parthead)"
      />
    </g>
  );
};

export default Part;
