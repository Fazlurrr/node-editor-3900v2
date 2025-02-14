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

const Terminal = (props: CustomNodeProps) => {
  const connectionStartHandle = useStore((store) => store.connectionStartHandle);

  const hasCustomAttributes = props.data.customAttributes && props.data.customAttributes.length > 0;
  const amountOfCustomAttributes = props.data.customAttributes ? props.data.customAttributes.length : 0;

  // Create base terminal content
  const terminalContent = (
    <figure id={props.data.label} className="relative m-0 p-0 inline-flex flex-col">
      <div
        className={`h-[22px] w-[22px] overflow-hidden whitespace-nowrap border-2 border-black dark:border-white bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
      >
        <header className="flex h-full w-full items-center justify-center">
          <p
            className={`truncate text-center text-xs text-${props.data.aspect}-foreground-light dark:text-${props.data.aspect}-foreground-dark m-0 p-0`}
          >
            {props.data.customName === ''
              ? props.data.label.replace('terminal', 'T')
              : props.data.customName}
          </p>
        </header>
      </div>

      {hasCustomAttributes && (
        <div className="absolute -top-6 -right-10 flex items-center space-x-1 bg-white px-1 border-2 border-black rounded shadow">
          <Asterisk size={14} />
          <span className="text-xs font-bold">{amountOfCustomAttributes}</span>
        </div>
      )}

      <div style={{ visibility: props.selected || connectionStartHandle ? 'visible' : 'hidden' }}>
        <Handles nodeId={props.data.label} />
      </div>
    </figure>
  );

  // Only wrap in tooltip if we have a custom name
  if (props.data.customName !== '') {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild className="block leading-none">
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
  }

  // Return without tooltip wrapping if no custom name
  return terminalContent;
};

export default Terminal;