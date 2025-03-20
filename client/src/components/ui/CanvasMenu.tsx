import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

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

  const { selectedElement, copy, cut, handleTriggerDelete } = useClipboard();

  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  return (
    <div
      ref={menuRef}
      tabIndex={0}
      className={cn('absolute bg-white border shadow-lg rounded z-50')}
      style={{ top: y, left: x, width: '150px' }}
      onBlur={onClose}
    >
      <ul>
        <li
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            onMoveToFront();
            onClose();
          }}
        >
          Move to Front
        </li>
        <li
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            onMoveToBack();
            onClose();
          }}
        >
          Move to Back
        </li>
        {nodeType === 'terminal' && hasParent && (
          <li
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              onTerminalDetach();
              onClose();
            }}
          >
            Detach Terminal
          </li>
        )}
        <li
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            if (selectedElement) copy(selectedElement);
            onClose();
          }}
        >
          Copy
        </li>
        <li
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            if (selectedElement) cut(selectedElement, handleTriggerDelete);
            onClose();
          }}
        >
          Cut
        </li>
        <li
          className="p-2 hover:bg-gray-100 cursor-pointer text-red-600"
          onClick={() => {
            if (selectedElement) handleTriggerDelete();
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