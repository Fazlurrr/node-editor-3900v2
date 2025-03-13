import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { ResizeParams } from 'reactflow';
import { useStore, NodeResizer } from 'reactflow';
import Handles from './Handles';
import type { CustomNodeProps } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils';
import { Asterisk } from 'lucide-react'; 
import { updateNode } from '@/api/nodes';
import { selectionColor } from '@/lib/config';

const Block = (props: CustomNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(props.data.customName || props.data.label || '');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const connectionStartHandle = useStore((store) => store.connectionStartHandle);

  const [dimensions, setDimensions] = useState({
    width: props.data.width || 110,
    height: props.data.height || 66,
  });

  useEffect(() => {
    setDimensions({
      width: props.data.width || 110,
      height: props.data.height || 66,
    });
  }, [props.data.width, props.data.height]);

  useEffect(() => {
    setTempName(props.data.customName || props.data.label || '');
  }, [props.data.customName, props.data.label]);

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
      setTempName(props.data.customName || props.data.label || '');
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

  const onResize = (_event: any, params: ResizeParams) => {
    setDimensions({ width: params.width, height: params.height });
  };

  const onResizeEnd = async (_event: any, params: ResizeParams) => {
    setDimensions({ width: params.width, height: params.height });
    try {
      await updateNode(props.id, { width: params.width, height: params.height });
    } catch (err) {
      console.error("Error updating node dimensions:", err);
    }
  };

  return (
    <figure
      id={props.data.label}
      className="relative"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
            }}
          >
            <NodeResizer
        minWidth={110}
        minHeight={66}
        isVisible={props.selected}
        lineStyle={{ border: selectionColor }}
        handleStyle={{ borderColor: 'black' ,backgroundColor: 'white', width: '7px', height: '7px' }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
            />
        <div
          style={{
            width: dimensions.width,
            height: dimensions.height,
            boxShadow: props.selected ? `0 0 0 2px ${selectionColor}` : 'none',
          }}
          className={`border-2 border-black dark:border-white bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
        >
          <header className="flex items-center justify-center h-full w-full">
            {isEditing ? (
              <input
                ref={inputRef}
                className="w-full h-full bg-transparent text-center focus:outline-none text-black"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <p className="text-center text-black">
                {props.data.customName === ''
                  ? capitalizeFirstLetter(props.data.label)
                  : props.data.customName}
              </p>
            )}
          </header>
        </div>

      {hasCustomAttributes && (
        <div className="absolute -top-6 -right-10 flex items-center space-x-1 bg-white dark:bg-[#232528] px-1 border-2 border-black dark:border-white rounded shadow">
          <Asterisk size={14} />
          <span className="text-xs font-bold">{amountOfCustomAttributes}</span>
        </div>
      )}

      <div style={{ visibility: props.selected || connectionStartHandle ? 'visible' : 'hidden' }}>
        <Handles nodeId={props.data.label} />
      </div>
    </figure>
  );
};

export default Block;