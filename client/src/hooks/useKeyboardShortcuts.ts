import { useHotkeys } from 'react-hotkeys-hook';
import { useRef } from 'react';
import { Node, Edge } from 'reactflow';

export const useKeyboardShortcuts = (
  selectedElement: Node | Edge | null,
  onTriggerDelete: () => void,
  onPaste: (clipboardElement: Node | Edge) => void,
) => {
  const clipboardRef = useRef<Node | Edge | null>(null);

  useHotkeys(
    'delete, backspace',
    (event) => {
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
         target.tagName === 'TEXTAREA' ||
         target.tagName === 'SELECT' ||
         target.isContentEditable)
      ) {
        return;
      }
      if (selectedElement) {
        onTriggerDelete();
      }
    },
    { enableOnFormTags: false },
    [selectedElement]
  );

  useHotkeys(
    'ctrl+c, command+c',
    () => {
      if (selectedElement) {
        clipboardRef.current = JSON.parse(JSON.stringify(selectedElement));
      }
    },
    [selectedElement]
  );

  useHotkeys(
    'ctrl+x, command+x',
    () => {
      if (selectedElement) {
        clipboardRef.current = JSON.parse(JSON.stringify(selectedElement));
        onTriggerDelete();
      }
    },
    [selectedElement]
  );

  useHotkeys(
    'ctrl+v, command+v',
    () => {
      if (clipboardRef.current) {
        onPaste(clipboardRef.current);
      }
    },
  );
};