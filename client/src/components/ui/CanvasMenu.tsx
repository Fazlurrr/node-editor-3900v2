import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';
import { useStore } from '@/hooks';

interface CanvasMenuProps {
  x: number;
  y: number;
  onMoveToFront: () => void;
  onMoveToBack: () => void;
  onClose: () => void;
  onTerminalDetach: () => void;
  nodeType?: string;
  hasParent?: boolean;
}

const CanvasMenu: React.FC<CanvasMenuProps> = ({
  x,
  y,
  onMoveToFront,
  onMoveToBack,
  onClose,
  onTerminalDetach,
  nodeType,
  hasParent,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const liStyle = "p-2 bg-white hover:bg-gray-100 dark:bg-[#232528] dark:hover:bg-gray-700 cursor-pointer";
  const { copy, cut, handleTriggerDelete } = useClipboard();
  const selectedNodes = useStore(state => state.nodes.filter(n => n.selected));
  const selectedEdges = useStore(state => state.edges.filter(e => e.selected));
  const selectedElements = [...selectedNodes, ...selectedEdges];

  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  return (
    <div
      ref={menuRef}
      tabIndex={0}
      className={cn('absolute border shadow-lg rounded z-50')}
      style={{ top: y, left: x, width: '150px' }}
      onBlur={onClose}
    >
      <ul>
        <li
          className={liStyle}
          onClick={() => {
            onMoveToFront();
            onClose();
          }}
        >
          Move to Front
        </li>
        <li
          className={liStyle}
          onClick={() => {
            onMoveToBack();
            onClose();
          }}
        >
          Move to Back
        </li>
        {nodeType === 'terminal' && hasParent && (
          <li
            className={liStyle}
            onClick={() => {
              onTerminalDetach();
              onClose();
            }}
          >
            Detach Terminal
          </li>
        )}
        <li
          className={liStyle}
          onClick={() => {
            if (selectedElements.length > 0) {
              copy(selectedElements);
            }
            onClose();
          }}
        >
          Copy
        </li>
        <li
          className={liStyle}
          onClick={() => {
            if (selectedElements.length > 0) {
              cut(selectedElements, handleTriggerDelete);
            }
            onClose();
          }}
        >
          Cut
        </li>
        <li
          className={cn(liStyle, "text-red-600")}
          onClick={() => {
            if (selectedElements.length > 0) {
              handleTriggerDelete();
            }
            onClose();
          }}
        >
          Delete
        </li>
      </ul>
    </div>
  );
};

export default CanvasMenu;