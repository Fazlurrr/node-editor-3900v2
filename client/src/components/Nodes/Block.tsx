import Handles from './Handles';
import { useSidebar } from '@/hooks';
import type { CustomNodeProps } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils';
import { Asterisk } from 'lucide-react'; // Importing an icon

const Block = (props: CustomNodeProps) => {
  const { openSidebar } = useSidebar();

  // Check if the node has custom attributes
  const hasCustomAttributes = props.data.customAttributes && props.data.customAttributes.length > 0;
  const amountOfCustomAttributes = props.data.customAttributes ? props.data.customAttributes.length : 0;

  return (
    <figure id={props.data.label} className="relative">
      <div
        onClick={() => openSidebar(props)}
        className={`h-[66px] w-[110px] border border-black 
          bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
      >
        <header className="flex min-h-16 w-full items-center justify-center">
          <p
            className={`text-center text-${props.data.aspect}-foreground-light dark:text-${props.data.aspect}-foreground-dark`}
          >
            {props.data.customName === ''
              ? capitalizeFirstLetter(props.data.label)
              : props.data.customName}
          </p>
        </header>
      </div>

      {/* Icon + Amount Indicator */}
      {hasCustomAttributes && (
        <div className="absolute -top-6 -right-10 flex items-center space-x-1 bg-white px-1 border-2 border-black rounded shadow">
          <Asterisk className="" size={14} />
          <span className="text-xs font-bold ">{amountOfCustomAttributes}</span>
        </div>
      )}

      <Handles nodeId={props.data.label} />
    </figure>
  );
};

export default Block;
