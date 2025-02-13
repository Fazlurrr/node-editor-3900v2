import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Handles from './Handles';
import type { CustomNodeProps } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils';
import { Asterisk } from 'lucide-react'; 
import { updateNode } from '@/api/nodes';
// Import useStore, storeSelector, and shallow from your hooks
import { useStore, storeSelector } from '@/hooks';
import { shallow } from 'zustand/shallow';

const Block = (props: CustomNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(props.data.customName ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Use the same selector as in editor.tsx:
  const { nodes, setNodes } = useStore(storeSelector, shallow);

  useEffect(() => {
    setTempName(props.data.customName ?? '');
  }, [props.data.customName]);

  const handleSubmit = () => {
    const trimmedName = tempName.trim();
    if (trimmedName !== props.data.customName) {
      updateNode(props.id, { customName: trimmedName }).then((updated) => {
        if (updated) {
          const updatedNodes = nodes.map((n) =>
            n.id === props.id
              ? { ...n, data: { ...n.data, customName: trimmedName } }
              : n
          );
          setNodes(updatedNodes);
        }
      });
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
              className={`absolute w-auto min-w-full bg-transparent 
                text-center focus:outline-none whitespace-nowrap overflow-visible
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

      {hasCustomAttributes && (
        <div className="absolute -top-6 -right-10 flex items-center space-x-1 bg-white px-1 border-2 border-black rounded shadow">
          <Asterisk size={14} />
          <span className="text-xs font-bold">{amountOfCustomAttributes}</span>
        </div>
      )}

      <Handles nodeId={props.data.label} />
    </figure>
  );
};

export default Block;
