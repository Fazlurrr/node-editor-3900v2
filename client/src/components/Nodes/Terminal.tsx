import Handles from './Handles';
import { useSidebar } from '@/hooks';
import type { CustomNodeProps } from '@/lib/types';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '../ui/tooltip';
import { Asterisk } from 'lucide-react'; // Importing an icon

const Terminal = (props: CustomNodeProps) => {
  const { openSidebar } = useSidebar();

  // Check for custom attributes
  const hasCustomAttributes = props.data.customAttributes && props.data.customAttributes.length > 0;
  const amountOfCustomAttributes = props.data.customAttributes ? props.data.customAttributes.length : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <figure id={props.data.label} className="relative">
            <div
              onClick={() => openSidebar(props)}
              className={`h-[22px] w-[22px] overflow-hidden whitespace-nowrap border-2 border-black dark:border-white bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
            >
              <header className="flex h-full w-full items-center justify-center">
                <p
                  className={`truncate text-center text-xs text-${props.data.aspect}-foreground-light dark:text-${props.data.aspect}-foreground-dark`}
                >
                  {props.data.customName === ''
                    ? props.data.label.replace('terminal', 'T')
                    : props.data.customName}
                </p>
              </header>
            </div>

            {/* Custom Attribute Indicator */}
            {hasCustomAttributes && (
              <div className="absolute -top-6 -right-10 flex items-center space-x-1 bg-white px-1 border-2 border-black rounded shadow">
                <Asterisk size={14} />
                <span className="text-xs font-bold">{amountOfCustomAttributes}</span>
              </div>
            )}

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

export default Terminal;
