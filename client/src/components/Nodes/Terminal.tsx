import Handles from './Handles';
import type { CustomNodeProps } from '@/lib/types';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '../ui/tooltip';
import { Asterisk } from 'lucide-react'; 
import { useStore } from 'reactflow';
import { selectionColor } from '@/lib/config';

const Terminal = (props: CustomNodeProps) => {
  const connectionStartHandle = useStore((store) => store.connectionStartHandle);

  const hasCustomAttributes = props.data.customAttributes && props.data.customAttributes.length > 0;
  const amountOfCustomAttributes = props.data.customAttributes ? props.data.customAttributes.length : 0;

  const terminalContent = (
    <figure id={props.data.label} className="relative m-0 p-0 block" style={{ lineHeight: 0 }}>
      <div
        className={`h-[22px] w-[22px] overflow-hidden whitespace-nowrap border-2 border-black dark:border-white bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
        style={{ 
          display: 'inline-block', 
          verticalAlign: 'top', 
          ...(props.selected ? { boxShadow: `0 0 0 2px ${selectionColor}` } : {}) 
        }}
      >
      </div>

      {hasCustomAttributes && (
        <div className="absolute -top-6 -right-10 flex items-center space-x-1 bg-white px-1 border-2 border-black rounded shadow">
          <Asterisk size={14} />
          <span className="text-xs font-bold">{amountOfCustomAttributes}</span>
        </div>
      )}

      <div
        style={{ 
          visibility: props.selected || connectionStartHandle ? 'visible' : 'hidden',
        }}
      >
        <Handles nodeId={props.data.label} />
      </div>
    </figure>
  );

  if (!props.data.customName) {
    return terminalContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="block p-0 m-0" style={{ lineHeight: 0 }}>
          {terminalContent}
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {props.data.customName}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Terminal;