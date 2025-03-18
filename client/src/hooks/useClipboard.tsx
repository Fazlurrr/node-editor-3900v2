import React, { createContext, useContext, useRef, useState, ReactNode, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { createNode, deleteNode } from '@/api/nodes';
import { uploadEdges, deleteEdge } from '@/api/edges';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/hooks/useStore';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'react-toastify';


interface ClipboardContextType {
  selectedElement: Node | Edge | (Node | Edge)[] | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<Node | Edge | (Node | Edge)[] | null>>;
  copy: (element: Node | Edge | (Node | Edge)[]) => void;
  cut: (element: Node | Edge | (Node | Edge)[], onDelete: () => void) => void;
  paste: (onPaste?: (clipboardElement: Node | Edge | (Node | Edge)[]) => void) => Promise<void>;
  handlePaste: (clipboardElement: Node | Edge | (Node | Edge)[]) => Promise<void>;
  handleTriggerDelete: () => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedElement, setSelectedElement] = useState<Node | Edge | (Node | Edge)[] | null>(null);
  const clipboardRef = useRef<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { confirmDeletion } = useSettings();

  const { nodes, setNodes, edges, setEdges } = useStore((state) => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
    edges: state.edges,
    setEdges: state.setEdges,
  }));

  const copy = (element: Node | Edge | (Node | Edge)[]) => {
    clipboardRef.current = JSON.parse(JSON.stringify(element));
    toast.success('Copied to clipboard');
  };

  const cut = (element: Node | Edge | (Node | Edge)[], onDelete: () => void) => {
    copy(element);
    onDelete(); 
    toast.success('Cut to clipboard');
  };

  const paste = async (onPaste?: (clipboardElement: Node | Edge | (Node | Edge)[]) => void) => {
    if (clipboardRef.current && onPaste) {
      await onPaste(clipboardRef.current);
      toast.success('Pasted from clipboard');
    }
  };

  const handlePaste = async (clipboardElement: Node | Edge | (Node | Edge)[]) => {
    if (Array.isArray(clipboardElement)) {
      const clipboardNodes = clipboardElement.filter(elem => 'data' in elem && !('source' in elem)) as Node[];
      const clipboardEdges = clipboardElement.filter(elem => 'source' in elem && 'target' in elem) as Edge[];
      
      const idMap: Record<string, string> = {};
      const newNodes = clipboardNodes.map(node => {
        const newId = `${node.type}-${uuidv4()}`;
        idMap[node.id] = newId;
        return {
          ...node,
          id: newId,
          position: { x: node.position.x + 20, y: node.position.y + 20 },
        };
      });

      setNodes([...nodes, ...newNodes]);
      await Promise.all(newNodes.map(n => createNode(n)));

      const newEdges = clipboardEdges
        .filter(edge => idMap[edge.source] && idMap[edge.target])
        .map(edge => ({
          ...edge,
          id: `edge-${uuidv4()}`,
          source: idMap[edge.source],
          target: idMap[edge.target],
        }));

      setEdges([...edges, ...newEdges]);
      if (newEdges.length > 0) await uploadEdges(newEdges);
    } else {
      if ('data' in clipboardElement && !('source' in clipboardElement)) {
        const newNodeId = `${clipboardElement.type}-${uuidv4()}`;
        const newNode = {
          ...clipboardElement,
          id: newNodeId,
          position: {
            x: clipboardElement.position.x + 20,
            y: clipboardElement.position.y + 20,
          },
        } as Node;
        setNodes([...nodes, newNode]);
        await createNode(newNode);
      } else if ('source' in clipboardElement && 'target' in clipboardElement) {
        console.warn('Skipping single-edge paste because source/target nodes were not copied.');
      }
    }
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
    if (Array.isArray(selectedElement)) {
      let updatedEdges = edges;
      let updatedNodes = nodes;
      for (const element of selectedElement) {
        if ('source' in element) {
          await deleteEdge(element.id as string);
          updatedEdges = updatedEdges.filter(e => e.id !== element.id);
        } else {
          await deleteNode(element.id);
          updatedNodes = updatedNodes.filter(n => n.id !== element.id);
        }
      }
      setEdges(updatedEdges);
      setNodes(updatedNodes);
    } else {
      if ('source' in selectedElement) {
        await deleteEdge(selectedElement.id as string);
        setEdges(edges.filter(e => e.id !== selectedElement.id));
      } else {
        await deleteNode(selectedElement.id);
        setNodes(nodes.filter(n => n.id !== selectedElement.id));
      }
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
          elementType={
            selectedElement && !Array.isArray(selectedElement) && 'source' in selectedElement
              ? 'element'
              : 'relation'
          }
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
