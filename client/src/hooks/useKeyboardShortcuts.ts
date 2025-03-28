import { useHotkeys } from 'react-hotkeys-hook';
import { useClipboard } from './useClipboard';
import { Node, Edge } from 'reactflow';
import { useMode } from '@/hooks/useMode';
import { useGridContext } from '@/components/ui/toggleGrid';
import { useMiniMapContext } from '@/components/ui/toggleMiniMap';
import { useReactFlow } from 'reactflow';

export const useKeyboardShortcuts = (
  selectedElement: Node | Edge | (Node | Edge)[] | null,
  onTriggerDelete: () => void,
  onPaste: (clipboardElement: Node | Edge | (Node | Edge)[]) => void,
  onLockToggle: () => void
) => {
  const { copy, cut, paste } = useClipboard();
  const { mode, setMode } = useMode();
  const { isGridVisible, setGridVisible } = useGridContext();
  const { isMiniMapVisible, setMiniMapVisible } = useMiniMapContext();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

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
    'v',
    () => {
      setMode('move');
    },
    [mode]
  );

  useHotkeys(
    't',
    () => {
      setMode(mode === 'transform' ? 'move' : 'transform');
    },
    [mode]
  );

  useHotkeys(
    'r',
    () => {
      setMode(mode === 'relation' ? 'move' : 'relation');
    },
    [mode]
  );

  useHotkeys(
    '.',
    () => {
      zoomIn({ duration: 100 });
    }
  );

  useHotkeys(
    '-',
    () => {
      zoomOut({ duration: 100 });
    }
  );

  useHotkeys(
    'f',
    () => {
      fitView({ duration: 300, padding: 0.1 });
    }
  );

  useHotkeys(
    'l',
    () => {
      onLockToggle();
    },
    { enableOnFormTags: false, preventDefault: true },
    [onLockToggle]
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
