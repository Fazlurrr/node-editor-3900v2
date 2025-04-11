import Handles from './Handles';
import type { CustomNodeProps } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/Misc/tooltip';
import { Asterisk } from 'lucide-react';
import { selectionColor } from '@/lib/config';
import { useMode } from '@/hooks/useMode';

const Connector = (props: CustomNodeProps) => {
  const { mode } = useMode();

  // Check for custom attributes
  const hasCustomAttributes = props.data.customAttributes && props.data.customAttributes.length > 0;
  const amountOfCustomAttributes = props.data.customAttributes ? props.data.customAttributes.length : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
        <figure
            id={props.data.label}
            className="relative"
            onContextMenu={(e) => {
              e.preventDefault();
              props.onRightClick?.({ x: e.clientX, y: e.clientY, nodeId: props.id });
            }}
          >
            <div
              className={`h-[44px] w-[44px] overflow-hidden whitespace-nowrap rounded-full border-2 border-black dark:border-white bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
              style={props.selected ? { boxShadow: `0 0 0 2px ${selectionColor}` } : {}}
            >
            </div>

            {/* Custom Attribute Indicator */}
            {hasCustomAttributes && (
              <div className="absolute -top-4 -right-9 flex items-center space-x-1 bg-white px-1 border-2 border-black rounded shadow">
                <Asterisk size={14} />
                <span className="text-xs font-bold">{amountOfCustomAttributes}</span>
              </div>
            )}

            <div style={{ visibility: mode === 'relation' ? 'visible' : 'hidden' }}>
              <Handles nodeId={props.data.label} />
            </div>
          </figure>
        </TooltipTrigger>
        {props.data.customName !== '' && (
          <TooltipContent
            side="top"
            sideOffset={5}
            className="z-9999"
          >
          <p className="text-base text-gray-500 dark:text-white break-words whitespace-normal max-w-[200px]">
            {props.data.customName}
          </p>
        </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default Connector;
