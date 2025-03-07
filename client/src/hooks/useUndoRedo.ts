import { useState, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useStore } from '@/hooks'; 

const STACK_LIMIT = 10;

export function useUndoRedo() {
  const { nodes, edges, setNodes, setEdges } = useStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  }));

  const [undoStack, setUndoStack] = useState<
    { nodes: typeof nodes; edges: typeof edges }[]
  >([]);
  const [redoStack, setRedoStack] = useState<
    { nodes: typeof nodes; edges: typeof edges }[]
  >([]);

  const pushHistory = useCallback(() => {
    setUndoStack((prevUndo) => {
      const newHistory = [...prevUndo, { nodes: [...nodes], edges: [...edges] }];
      if (newHistory.length > STACK_LIMIT) {
        newHistory.shift();
      }
      return newHistory;
    });
    setRedoStack([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo; 
      const previousState = prevUndo[prevUndo.length - 1];
      setRedoStack((prevRedo) => [...prevRedo, { nodes: [...nodes], edges: [...edges] }]);
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      return prevUndo.slice(0, prevUndo.length - 1);
    });
  }, [nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo; 
      const nextState = prevRedo[prevRedo.length - 1];
      setUndoStack((prevUndo) => [...prevUndo, { nodes: [...nodes], edges: [...edges] }]);
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      return prevRedo.slice(0, prevRedo.length - 1);
    });
  }, [nodes, edges, setNodes, setEdges]);

  useHotkeys('ctrl+z', (event) => {
    event.preventDefault();
    undo();
  }, [undo]);

  useHotkeys('ctrl+shift+z', (event) => {
    event.preventDefault();
    redo();
  }, [redo]);

  return { pushHistory, undo, redo, undoStack, redoStack };
}
