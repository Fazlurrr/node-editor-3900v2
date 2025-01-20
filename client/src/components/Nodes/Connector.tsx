import Handles from './Handles';
import { useSidebar } from '@/hooks';
import type { CustomNodeProps } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

const Connector = (props: CustomNodeProps) => {
  const { openSidebar } = useSidebar();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <figure id={props.data.label}>
            <div
              onClick={() => openSidebar(props)}
              className={`h-8 w-8 overflow-hidden whitespace-nowrap rounded-full border border-black bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
            >
              <header className="flex h-full w-full items-center justify-center">
              <p
                className={`truncate text-center text-${props.data.aspect}-foreground-light dark:text-${props.data.aspect}-foreground-dark`}
              >
                {props.data.customName === ''
                ? props.data.label
                : props.data.customName}
              </p>
              </header>
            </div>

            <Handles nodeId={props.data.label} />
          </figure>
        </TooltipTrigger>
        {props.data.customName !== '' && (
          <TooltipContent>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {props.data.customName}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default Connector;
