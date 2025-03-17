import React, { createContext, useContext, useRef, useState, ReactNode, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { createNode, deleteNode } from '@/api/nodes';
import { deleteEdge } from '@/api/edges';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/hooks/useStore';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { useSettings } from '@/hooks/useSettings';

interface ClipboardContextType {
  selectedElement: Node | Edge | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<Node | Edge | null>>;
  copy: (element: Node | Edge) => void;
  cut: (element: Node | Edge, onDelete: () => void) => void;
  paste: (onPaste?: (clipboardElement: Node | Edge) => void) => Promise<void>;
  handlePaste: (clipboardElement: Node | Edge) => Promise<void>;
  handleTriggerDelete: () => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const clipboardRef = useRef<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { confirmDeletion } = useSettings();

  const { nodes, setNodes, edges, setEdges } = useStore((state) => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
    edges: state.edges,
    setEdges: state.setEdges,
  }));

  const copy = (element: Node | Edge) => {
    clipboardRef.current = JSON.parse(JSON.stringify(element));
  };

  const cut = (element: Node | Edge, onDelete: () => void) => {
    clipboardRef.current = JSON.parse(JSON.stringify(element));
    onDelete(); 
  };

  const paste = async (onPaste?: (clipboardElement: Node | Edge) => void) => {
    if (clipboardRef.current && onPaste) {
      await onPaste(clipboardRef.current);
    }
  };

  const handlePaste = async (clipboardElement: Node | Edge) => {
    const clonedNode = JSON.parse(JSON.stringify(clipboardElement)) as Node;
    const { id, ...nodeWithoutId } = clonedNode;
    if (nodeWithoutId.position) {
      nodeWithoutId.position = {
        x: nodeWithoutId.position.x + 20,
        y: nodeWithoutId.position.y + 20,
      };
    }
    const newNode = { ...nodeWithoutId, id: `${clonedNode.type}-${uuidv4()}` };
    await createNode(newNode);
    setNodes([...nodes, newNode]);
  };

  const handleTriggerDelete = useCallback(() => {
    if (!selectedElement) return;
    if (confirmDeletion) {
      setShowDeleteDialog(true);
    } else {
      handleConfirmDelete();
    }
  }, [selectedElement, confirmDeletion]);

  const handleConfirmDelete = async () => {
    if (!selectedElement) return;
    if ('source' in selectedElement) {
      await deleteEdge(selectedElement.id as string);
      setEdges(edges.filter((e) => e.id !== selectedElement.id));
    } else {
      await deleteNode(selectedElement.id);
      setNodes(nodes.filter((n) => n.id !== selectedElement.id));
    }
    setShowDeleteDialog(false);
    setSelectedElement(null);
  };

  return (
    <>
      <ClipboardContext.Provider
        value={{
          selectedElement,
          setSelectedElement,
          copy,
          cut,
          paste,
          handlePaste,
          handleTriggerDelete,
        }}
      >
        {children}
      </ClipboardContext.Provider>
      {showDeleteDialog && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          elementType={selectedElement && 'source' in selectedElement ? 'element' : 'relation'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </>
  );
};

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};
