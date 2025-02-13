import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useStore } from 'reactflow';
import Handles from './Handles';
import type { CustomNodeProps } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils';
import { Asterisk } from 'lucide-react'; 
import { updateNode } from '@/api/nodes';

const Block = (props: CustomNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(props.data.customName ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const connectionStartHandle = useStore((store) => store.connectionStartHandle);

  useEffect(() => {
    setTempName(props.data.customName ?? '');
  }, [props.data.customName]);

  const handleSubmit = () => {
    if (tempName.trim() !== props.data.customName) {
      updateNode(props.id, { customName: tempName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setTempName(props.data.customName ?? '');
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Check if the node has custom attributes
  const hasCustomAttributes = props.data.customAttributes && props.data.customAttributes.length > 0;
  const amountOfCustomAttributes = props.data.customAttributes ? props.data.customAttributes.length : 0;

  

  return (
    <figure
     id={props.data.label}
      className="relative"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      <div
        className={`h-[66px] w-[110px] border-2 border-black dark:border-white
          bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
      >
        <header className="flex min-h-16 w-full items-center justify-center">
          {isEditing ? (
        <input
          ref={inputRef}
          className={`w-full h-full bg-transparent text-center focus:outline-none 
          text-${props.data.aspect}-foreground-light 
          dark:text-${props.data.aspect}-foreground-dark`}
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
        />
      
          ) : (
        <p
          className={`text-center text-${props.data.aspect}-foreground-light 
            dark:text-${props.data.aspect}-foreground-dark`}
        >
          {props.data.customName === ''
            ? capitalizeFirstLetter(props.data.label)
            : props.data.customName}
        </p>
          )}
        </header>
      </div>

      {/* Icon + Amount Indicator */}
      {hasCustomAttributes && (
        <div className="absolute -top-6 -right-10 flex items-center space-x-1 bg-white px-1 border-2 border-black rounded shadow">
          <Asterisk className="" size={14} />
          <span className="text-xs font-bold ">{amountOfCustomAttributes}</span>
        </div>
      )}

      <div style={{ visibility: props.selected || connectionStartHandle ? 'visible' : 'hidden' }}>
        <Handles nodeId={props.data.label} />
      </div>
    </figure>
  );
};

export default Block;
