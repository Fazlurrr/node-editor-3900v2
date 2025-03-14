import { useHotkeys } from 'react-hotkeys-hook';
import { useClipboard } from './useClipboard';
import { Node, Edge } from 'reactflow';
import { useTransformMode } from '@/hooks/useTransformMode';
import { useGridContext } from '@/components/ui/toggleGrid';
import { useMiniMapContext } from '@/components/ui/toggleMiniMap';

export const useKeyboardShortcuts = (
  selectedElement: Node | Edge | null,
  onTriggerDelete: () => void,
  onPaste: (clipboardElement: Node | Edge) => void,
) => {
  const { copy, cut, paste } = useClipboard();
  const { transformMode, setTransformMode } = useTransformMode();
  const { isGridVisible, setGridVisible } = useGridContext();
  const { isMiniMapVisible, setMiniMapVisible } = useMiniMapContext();

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
        copy(selectedElement);
      }
    },
    [selectedElement]
  );

  useHotkeys(
    'ctrl+x, command+x',
    () => {
      if (selectedElement) {
        cut(selectedElement, onTriggerDelete);
      }
    },
    [selectedElement]
  );

  useHotkeys(
    'ctrl+v, command+v',
    () => {
      paste(onPaste);
    }
  );

  useHotkeys(
    't',
    () => {
      setTransformMode(!transformMode);
    },
    [transformMode]
  );
  useHotkeys(
    'ctrl+shift+g',
    () => {
      setGridVisible(!isGridVisible);
    },
    { preventDefault: true },
    [isGridVisible]
  );

  useHotkeys(
    'ctrl+shift+m',
    () => {
      setMiniMapVisible(!isMiniMapVisible);
    },
    { preventDefault: true },
    [isMiniMapVisible]
  );

};