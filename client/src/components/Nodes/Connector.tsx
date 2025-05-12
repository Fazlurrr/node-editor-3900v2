import Handles from './Handles';
import type { CustomNodeProps, CustomAttribute } from '@/lib/types';
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

  const hasCustomAttributes =
    Array.isArray(props.data.customAttributes) &&
    props.data.customAttributes.length > 0;
  const amountOfCustomAttributes = hasCustomAttributes
    ? props.data.customAttributes.length
    : 0;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // build tooltip, skipping any empty fields
  const customAttrTooltip = hasCustomAttributes
    ? (props.data.customAttributes as CustomAttribute[])
        .map((attr) => {
          const lines: string[] = [];
          if (attr.name)           lines.push(`Name: ${attr.name}`);
          if (attr.value)          lines.push(`Value: ${attr.value}`);
          if (attr.unitOfMeasure)  lines.push(`Unit: ${attr.unitOfMeasure}`);

          const { provenance, scope, range, regularity } = attr.quantityDatums;
          if (provenance) lines.push(`Provenance: ${capitalize(provenance)}`);
          if (scope)      lines.push(`Scope: ${capitalize(scope)}`);
          if (range)      lines.push(`Range: ${capitalize(range)}`);
          if (regularity) lines.push(`Regularity: ${capitalize(regularity)}`);

          return lines.join('\n');
        })
        .filter((txt) => txt.trim().length > 0)
        .join('\n\n')
    : '';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <figure
            id={props.data.label}
            className="relative"
            onContextMenu={(e) => {
              e.preventDefault();
              props.onRightClick?.({
                x: e.clientX,
                y: e.clientY,
                nodeId: props.id,
              });
            }}
          >
            <div
              className={`h-[44px] w-[44px] rounded-full border-2 border-black dark:border-white bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
              style={
                props.selected
                  ? { boxShadow: `0 0 0 2px ${selectionColor}` }
                  : {}
              }
            />

            {hasCustomAttributes && (
              <div
                className="absolute -top-4 -right-9 flex items-center space-x-1 bg-white px-1 border-2 border-black rounded shadow"
                title={customAttrTooltip}
              >
                <Asterisk size={14} />
                <span className="text-xs font-bold">
                  {amountOfCustomAttributes}
                </span>
              </div>
            )}

            <div
              style={{ visibility: mode === 'relation' ? 'visible' : 'hidden' }}
            >
              <Handles nodeId={props.data.label} />
            </div>
          </figure>
        </TooltipTrigger>

        {props.data.customName !== '' && (
          <TooltipContent side="top" sideOffset={5} className="z-9999">
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
