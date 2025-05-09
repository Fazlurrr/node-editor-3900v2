import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { ResizeParams } from 'reactflow';
import { NodeResizer } from 'reactflow';
import Handles from './Handles';
import type { CustomNodeProps, CustomAttribute } from '@/lib/types';
import { Asterisk } from 'lucide-react';
import { updateNode } from '@/api/nodes';
import { selectionColor } from '@/lib/config';
import { useMode } from '@/hooks/useMode';
import { useTerminalResizeHandling } from '@/lib/utils/nodes';
import { useStore } from '@/hooks/useStore';
import { Node as RFNode } from 'reactflow';

const Block = (props: CustomNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(
    props.data.customName || props.data.label || ''
  );
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const resizeNodeRef = useRef<HTMLDivElement>(null);
  const { mode } = useMode();
  const { onResize: onTerminalResize, onResizeEnd: onTerminalResizeEnd } =
    useTerminalResizeHandling();
  const setNodes = useStore((state) => state.setNodes);

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
    const updatedName = tempName.trim();
    if (updatedName !== props.data.customName) {
      const currentElements = useStore.getState().nodes as RFNode[];
      const updatedNodes = currentElements.map((node: RFNode) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, customName: updatedName } }
          : node
      );
      setNodes(updatedNodes);
      updateNode(props.id, { customName: updatedName });
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
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [tempName, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const hasCustomAttributes =
    Array.isArray(props.data.customAttributes) &&
    props.data.customAttributes.length > 0;
  const amountOfCustomAttributes = hasCustomAttributes
    ? props.data.customAttributes.length
    : 0;

  // helper to capitalize first letter
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // build tooltip, skipping any empty fields
  const customAttrTooltip = hasCustomAttributes
    ? (props.data.customAttributes as CustomAttribute[])
        .map((attr) => {
          const lines: string[] = [];
          if (attr.name) lines.push(`Name: ${attr.name}`);
          if (attr.value) lines.push(`Value: ${attr.value}`);
          if (attr.unitOfMeasure)
            lines.push(`Unit: ${attr.unitOfMeasure}`);

          const { provenance, scope, range, regularity } =
            attr.quantityDatums;
          if (provenance)
            lines.push(`Provenance: ${capitalize(provenance)}`);
          if (scope) lines.push(`Scope: ${capitalize(scope)}`);
          if (range) lines.push(`Range: ${capitalize(range)}`);
          if (regularity)
            lines.push(`Regularity: ${capitalize(regularity)}`);

          return lines.join('\n');
        })
        .filter((txt) => txt.trim().length > 0)
        .join('\n\n')
    : '';

  const onResize = (_event: any, params: ResizeParams) => {
    if (resizeNodeRef.current) {
      resizeNodeRef.current.style.width = `${params.width}px`;
      resizeNodeRef.current.style.height = `${params.height}px`;
      onTerminalResize(props.id, params);
    }
  };

  const onResizeEnd = async (_event: any, params: ResizeParams) => {
    setDimensions({ width: params.width, height: params.height });
    try {
      await updateNode(props.id, {
        width: params.width,
        height: params.height,
      });
      onTerminalResizeEnd(props.id, params);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error updating node dimensions:', err);
    }
  };

  return (
    <figure
      id={props.data.label}
      className="relative"
      onDoubleClick={() => setIsEditing(true)}
      onMouseDownCapture={(e) => {
        if (isEditing) e.stopPropagation();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        props.onRightClick?.({
          x: e.clientX,
          y: e.clientY,
          nodeId: props.id,
        });
      }}
    >
      <NodeResizer
        minWidth={110}
        minHeight={66}
        isVisible={props.selected && mode === 'transform'}
        lineStyle={{ border: selectionColor }}
        handleStyle={{
          borderColor: 'black',
          backgroundColor: 'white',
          width: '7px',
          height: '7px',
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
      />
      <div
        ref={resizeNodeRef}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          boxShadow: props.selected
            ? `0 0 0 2px ${selectionColor}`
            : 'none',
        }}
        className={`border-2 border-black dark:border-white bg-${props.data.aspect}-light dark:bg-${props.data.aspect}-dark`}
      >
        <header className="flex items-center justify-center h-full w-full">
          {isEditing ? (
            <textarea
              ref={inputRef}
              rows={1}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-auto h-auto bg-transparent text-center text-black resize-none focus:outline-none overflow-x-hidden break-words"
              value={tempName}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 50) setTempName(value);
              }}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <p className="text-center text-black overflow-hidden break-words">
              {props.data.customName === ''
                ? props.data.label
                : props.data.customName}
            </p>
          )}
        </header>
      </div>

      {hasCustomAttributes && (
        <div
          className="absolute -top-6 -right-10 flex items-center space-x-1 bg-white dark:bg-[#232528] px-1 border-2 border-black dark:border-white rounded shadow"
          title={customAttrTooltip}
        >
          <Asterisk size={14} />
          <span className="text-xs font-bold">
            {amountOfCustomAttributes}
          </span>
        </div>
      )}

      <div style={{ visibility: mode === 'relation' ? 'visible' : 'hidden' }}>
        <Handles nodeId={props.data.label} />
      </div>
    </figure>
  );
};

export default Block;
