import { useHotkeys } from 'react-hotkeys-hook';
import { useClipboard } from './useClipboard';
import { useStore } from '@/hooks';
import { useMode } from '@/hooks/useMode';
import { useTogglePanel } from './useTogglePanel';
import { useGridContext } from '@/components/ui/Navbar/ViewMenu/toggleGrid';
import { useMiniMapContext } from '@/components/ui/Navbar/ViewMenu/toggleMiniMap';
import { useReactFlow } from 'reactflow';
import { switchEdgeDirection } from '@/lib/utils/edges';
import { EdgeType } from '@/lib/types';

export const useKeyboardShortcuts = (
  onTriggerDelete: () => void,
  onTerminalDetach: (selectedNodes: any) => void,
  onPaste: (clipboardElements: any) => void,
  onLockToggle: () => void,
) => {
  const { copy, cut, paste } = useClipboard();
  const { mode, setMode } = useMode();
  const { isGridVisible, setGridVisible } = useGridContext();
  const { isMiniMapVisible, setMiniMapVisible } = useMiniMapContext();
  const { toggleModelingPanel, togglePropertiesPanel } = useTogglePanel();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const selectedNodes = useStore(state => state.nodes.filter(n => n.selected));
  const selectedEdges = useStore(state => state.edges.filter(e => e.selected));
  const selectedElements = [...selectedNodes, ...selectedEdges];
  const hasSelection = selectedElements.length > 0;
  

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
      if (hasSelection) {
        onTriggerDelete();
      }
    },
    { enableOnFormTags: false },
    [hasSelection]
  );

  useHotkeys(
    'ctrl+c, command+c',
    () => {
      if (hasSelection) {
        copy(selectedElements);
      }
    },
    [hasSelection, selectedElements]
  );

  useHotkeys(
    'ctrl+x, command+x',
    () => {
      if (hasSelection) {
        cut(selectedElements, onTriggerDelete);
      }
    },
    [hasSelection, selectedElements]
  );

  useHotkeys(
    'ctrl+v, command+v',
    () => {
      paste(onPaste);
    },
    [onPaste, paste]
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
    'ctrl+shift+e',
    () => {
      toggleModelingPanel();
    },
    { preventDefault: true },
    [toggleModelingPanel]
  );

    useHotkeys(
    'ctrl+shift+p',
    () => {
      togglePropertiesPanel();
    },
    { preventDefault: true },
    [togglePropertiesPanel]
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

  useHotkeys(
    's',
    async () => {
      if (selectedEdges.length === 1) { 
        const edge = selectedEdges[0];  
        if (edge.type) {
          await switchEdgeDirection({ edge: { ...edge, type: edge.type as EdgeType } });
        }
      }
    },
    [selectedEdges] 
  );

  useHotkeys(
    'd',
    () => {
      selectedNodes
        .filter(n => n.type === 'terminal')
        .forEach(n => onTerminalDetach(n.id))
    },
    { enableOnFormTags: false, preventDefault: true },
    [selectedNodes]
  )
};
