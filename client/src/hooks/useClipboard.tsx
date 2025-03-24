import React, {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { Node, Edge } from 'reactflow';
import { createNode, uploadNodes, deleteNode, deleteMultipleNodes } from '@/api/nodes';
import { uploadEdges, deleteEdge, deleteMultipleEdges } from '@/api/edges';
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
  const isNode = (element: Node | Edge): element is Node => 'data' in element && !('source' in element);
  const isEdge = (element: Node | Edge): element is Edge => 'source' in element && 'target' in element;
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

  useEffect(() => {
    if (!selectedElement || Array.isArray(selectedElement)) return;

    const fresh =
      'source' in selectedElement
        ? edges.find((e) => e.id === selectedElement.id)
        : nodes.find((n) => n.id === selectedElement.id);

    if (fresh && fresh !== selectedElement) {
      setSelectedElement(fresh);
    }
  }, [nodes, edges, selectedElement]);

  const copy = (element: Node | Edge | (Node | Edge)[]) => {
    clipboardRef.current = JSON.parse(JSON.stringify(element));
    toast.success('Copied to clipboard');
  };

  const cut = (element: Node | Edge | (Node | Edge)[], onDelete: () => void) => {
    copy(element);
    onDelete();
  };

  const paste = async (onPaste?: (clipboardElement: Node | Edge | (Node | Edge)[]) => void) => {
    if (clipboardRef.current && onPaste) {
      await onPaste(clipboardRef.current);
    }
  };

  const handlePaste = async (clipboardElement: Node | Edge | (Node | Edge)[]) => {
    if (!clipboardElement) return;

    if (Array.isArray(clipboardElement)) {
      await handleMultiplePaste(clipboardElement);
    } else {
      await handleSinglePaste(clipboardElement);
    }
  };

  const handleMultiplePaste = async (clipboardElements: (Node | Edge)[]) => {
    const { clipboardNodes, clipboardEdges } = separateNodesAndEdges(clipboardElements);
    const idMap = generateNewNodeIds(clipboardNodes);

    const newNodes = clipboardNodes.map(node => createNewNode(node, idMap));
    setNodes([...nodes, ...newNodes]);
    await uploadNodes(newNodes);

    const newEdges = createNewEdges(clipboardEdges, idMap);
    if (newEdges.length > 0) {
      setEdges([...edges, ...newEdges]);
      await uploadEdges(newEdges);
    }
  };

  const handleSinglePaste = async (clipboardElement: Node | Edge) => {
    if (isNode(clipboardElement)) {
      const newNode = createNewNode(clipboardElement);
      setNodes([...nodes, newNode]);
      await createNode(newNode);
    } else {
      console.warn('Skipping single-edge paste because source/target nodes were not copied.');
    }
  };

  const separateNodesAndEdges = (elements: (Node | Edge)[]) => {
    return {
      clipboardNodes: elements.filter(isNode) as Node[],
      clipboardEdges: elements.filter(isEdge) as Edge[],
    };
  };

  const generateNewNodeIds = (nodes: Node[]) => {
    return nodes.reduce((map, node) => {
      map[node.id] = `${node.type}-${uuidv4()}`;
      return map;
    }, {} as Record<string, string>);
  };

  const createNewNode = (node: Node, idMap?: Record<string, string>) => {
    const newId = idMap ? idMap[node.id] : `${node.type}-${uuidv4()}`;
    return {
      ...node,
      id: newId,
      position: { x: node.position.x + 20, y: node.position.y + 20 },
      data: {
        ...node.data,
        label:
          node.data.customName && node.data.customName.trim() !== ''
            ? node.data.customName
            : node.data.label,
      },
    };
  };

  const createNewEdges = (edges: Edge[], idMap: Record<string, string>) => {
    return edges
      .filter(edge => idMap[edge.source] && idMap[edge.target])
      .map(edge => ({
        ...edge,
        id: `edge-${uuidv4()}`,
        source: idMap[edge.source],
        target: idMap[edge.target],
      }));
  };

  const handleConfirmDelete = async () => {
    if (!selectedElement) return;

    if (Array.isArray(selectedElement)) {
      const selectedNodes = selectedElement.filter(
        (el) => !("source" in el)
      ) as Node[];
      const selectedEdges = selectedElement.filter(
        (el) => "source" in el
      ) as Edge[];
  
      const nodeIds = selectedNodes.map((node) => node.id);
      const edgeIds = selectedEdges.map((edge) => edge.id);
  
      const nodesDeletionPromise =
        nodeIds.length > 0 ? deleteMultipleNodes(nodeIds) : Promise.resolve(true);
      const edgesDeletionPromise =
        edgeIds.length > 0 ? deleteMultipleEdges(edgeIds) : Promise.resolve(true);
  
      await Promise.all([nodesDeletionPromise, edgesDeletionPromise]);
  
      const currentNodes = useStore.getState().nodes;
      const currentEdges = useStore.getState().edges;
      setNodes(currentNodes.filter((n) => !nodeIds.includes(n.id)));
      setEdges(currentEdges.filter((e) => !edgeIds.includes(e.id)));
    } else {
      if ("source" in selectedElement) {
        await deleteEdge(selectedElement.id);
        setEdges(edges.filter((e) => e.id !== selectedElement.id));
      } else {
        await deleteNode(selectedElement.id);
        setNodes(nodes.filter((n) => n.id !== selectedElement.id));
      }
    }
    setShowDeleteDialog(false);
    setSelectedElement(null);
  };
  

  const handleTriggerDelete = useCallback(() => {
    if (!selectedElement) return;
    if (confirmDeletion) {
      setShowDeleteDialog(true);
    } else {
      handleConfirmDelete();
    }
  }, [selectedElement, confirmDeletion]);

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
              ? 'relation'
              : 'element'
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
