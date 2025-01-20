import Handles from './Handles';
import { useSidebar } from '@/hooks';
import type { CustomNodeProps } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils';

const Block = (props: CustomNodeProps) => {
  const { openSidebar } = useSidebar();

  return (
    <figure id={props.data.label}>
      <div
        onClick={() => openSidebar(props)}
        className={`min-h-12 w-24 border border-black bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
      >
        <header className="flex min-h-12 w-full items-center justify-center">
          <p
            className={`text-center text-${props.data.aspect}-foreground-light dark:text-${props.data.aspect}-foreground-dark`}
          >
            {props.data.customName === ''
              ? capitalizeFirstLetter(props.data.label)
              : props.data.customName}
          </p>
        </header>
      </div>
      <Handles nodeId={props.data.label} />
    </figure>
  );
};

export default Block;
