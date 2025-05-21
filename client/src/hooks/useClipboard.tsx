import React, {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { Node, Edge } from 'reactflow';
import { createNode, uploadNodes, updateNode, deleteMultipleNodes } from '@/api/nodes';
import { uploadEdges, deleteMultipleEdges } from '@/api/edges';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/hooks/useStore';
import DeleteConfirmationDialog from '@/components/ui/Misc/DeleteConfirmationDialog';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'react-toastify';

interface ClipboardContextType {
  copy: (elements: Node | Edge | (Node | Edge)[]) => void;
  cut: (elements: Node | Edge | (Node | Edge)[], onDelete: () => void) => void;
  paste: (onPaste?: (clipboardElements: (Node | Edge)[]) => void) => Promise<void>;
  handlePaste: (clipboardElements: Node | Edge | (Node | Edge)[]) => Promise<void>;
  handleTriggerDelete: () => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isNode = (element: Node | Edge): element is Node =>
    'data' in element && !('source' in element) && typeof (element as Node).width === 'number';
  const isEdge = (element: Node | Edge): element is Edge => 'source' in element && 'target' in element;
  const isBlock = (node: Node): boolean => node.type === 'block';
  const isTerminal = (node: Node): boolean => node.type === 'terminal';
  
  const clipboardRef = useRef<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { confirmDeletion } = useSettings();

  const { nodes, setNodes, edges, setEdges } = useStore((state) => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
    edges: state.edges,
    setEdges: state.setEdges,
  }));

  const copy = (elements: Node | Edge | (Node | Edge)[]) => {
    let elementsToCopy: (Node | Edge)[] = Array.isArray(elements) ? [...elements] : [elements];
    
    const blocks = elementsToCopy.filter(el => isNode(el) && isBlock(el)) as Node[];
    
    if (blocks.length > 0) {
      const selectedTerminalIds = new Set(
        elementsToCopy
          .filter(el => isNode(el) && isTerminal(el))
          .map(term => (term as Node).id)
      );
      
      const blockTerminalIds = new Set(
        blocks.flatMap(block => block.data.terminals?.map((t: any) => t.id) || [])
      );
      
      const terminalsToAdd = nodes.filter(
        node => isTerminal(node) && 
               blockTerminalIds.has(node.id) && 
               !selectedTerminalIds.has(node.id)
      );
      
      if (terminalsToAdd.length > 0) {
        elementsToCopy = [...elementsToCopy, ...terminalsToAdd];
      }
    }
    
    clipboardRef.current = JSON.parse(JSON.stringify(elementsToCopy));
    console.log('Copied elements to clipboard:', clipboardRef.current);
    toast.success('Copied to clipboard');
  };

  const cut = (elements: Node | Edge | (Node | Edge)[], onDelete: () => void) => {
    copy(elements);
    onDelete();
  };

  const paste = async (onPaste?: (clipboardElements: (Node | Edge)[]) => void) => {
    if (clipboardRef.current && onPaste) {
      await onPaste(clipboardRef.current);
    }
  };

  const handleMultiplePaste = async (clipboardElements: (Node | Edge)[]) => {
    const { clipboardNodes, clipboardEdges } = separateNodesAndEdges(clipboardElements);
    
    const blocks = clipboardNodes.filter(node => isBlock(node));
    const idMap = generateNewNodeIds(clipboardNodes);
    console.log('Generated ID Map:', idMap);
    
    const blockOffsets: Record<string, { x: number, y: number }> = {};
    blocks.forEach(block => {
      blockOffsets[block.id] = { x: 22, y: 22 }; 
    });
    
    const newNodes = clipboardNodes.map(node => {
      const newNode = createNewNode(node, idMap, blockOffsets);
      newNode.selected = true;
      if (isTerminal(node) && node.data.terminalOf) {
        const newBlockId = idMap[node.data.terminalOf];
        if (newBlockId) {
          newNode.data.terminalOf = newBlockId;
          newNode.parentId = newBlockId;
        }
      }
      if (isBlock(node) && node.data.terminals && node.data.terminals.length > 0) {
        newNode.data.terminals = node.data.terminals
          .map((terminal: any) => ({
            id: idMap[terminal.id] || terminal.id,
          }))
          .filter((t: { id: any }) => !!t.id);
      }
    
      console.log('New Node:', newNode);
      return newNode;
    });
    
    const newEdges = createNewEdges(clipboardEdges, idMap);
    
    const currentNodes = useStore.getState().nodes;
    setNodes([...currentNodes, ...newNodes]);
    
    if (newEdges.length > 0) {
      const currentEdges = useStore.getState().edges;
      setEdges([...currentEdges, ...newEdges]);
    }
    
    await uploadNodes(newNodes);
    if (newEdges.length > 0) {
      await uploadEdges(newEdges);
    }
    
    return [...newNodes, ...newEdges];
  };
  
  const handleSinglePaste = async (clipboardElement: Node | Edge) => {
    if (isNode(clipboardElement)) {
      const newNode = createNewNode(clipboardElement);
      setNodes([...nodes, newNode]);
      await createNode(newNode);
      if (newNode.data.customAttributes && newNode.data.customAttributes.length > 0) {
        await updateNode(newNode.id, { customAttributes: newNode.data.customAttributes });
      }
      return newNode;
    } else {
      console.warn('Skipping single-edge paste because source/target nodes were not copied.');
      return null;
    }
  };
  
  const handlePaste = async (clipboardElements: Node | Edge | (Node | Edge)[]) => {
    if (!clipboardElements) return;
  
    if (Array.isArray(clipboardElements)) {
      const newElements = await handleMultiplePaste(clipboardElements);
  
      const pastedNodeIds = newElements.filter(isNode).map(node => node.id);
      const pastedEdgeIds = newElements
        .filter((el): el is Edge => 'source' in el && 'target' in el)
        .map(edge => edge.id);
  
      console.log('Pasted node IDs:', pastedNodeIds);
      console.log('Pasted edge IDs:', pastedEdgeIds);
  
      const currentElements = useStore.getState().nodes;
      const currentRelations = useStore.getState().edges;
  
      const updatedNodes = currentElements.map(node => ({
        ...node,
        selected: pastedNodeIds.includes(node.id)
      }));
      const updatedEdges = currentRelations.map(edge => ({
        ...edge,
        selected: pastedEdgeIds.includes(edge.id)
      }));
  
      setNodes(updatedNodes);
      setEdges(updatedEdges);
  
    } else {
      const newElement = await handleSinglePaste(clipboardElements);
      if (newElement && isNode(newElement)) {
        const currentElements = useStore.getState().nodes;
        const updatedNodes = currentElements.map(node => ({
          ...node,
          selected: node.id === newElement.id
        }));
        setNodes(updatedNodes);
      }
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
      const newId = `${node.type}-${uuidv4()}`;
      console.log(`Mapping node ID: ${node.id} -> ${newId}`);
      map[node.id] = newId;
      return map;
    }, {} as Record<string, string>);
  };

  const createNewNode = (
    node: Node,
    idMap?: Record<string, string>,
    blockOffsets?: Record<string, { x: number, y: number }>
  ) => {
    const newId = idMap ? idMap[node.id] : `${node.type}-${uuidv4()}`;
    
    let position;
    if (isTerminal(node) && node.data.terminalOf) {
      if (blockOffsets && blockOffsets[node.data.terminalOf]) {
        position = {
          x: node.position.x,
          y: node.position.y,
        };
      } else {
        position = {
          x: node.position.x + 22,
          y: node.position.y + 22,
        };
      }
    } else {
      position = {
        x: node.position.x + 22,
        y: node.position.y + 22,
      };
    }
    
    const newNode: Node = {
      ...node,
      id: newId,
      position,
      width: node.width ?? 110,
      height: node.height ?? 66,
      selected: true, 
      data: {
        ...node.data,
        label: node.data.customName?.trim() ? node.data.customName : node.data.label,
        customAttributes: node.data.customAttributes ?? [],
      },
    };
  
    console.log("New Node properties:", JSON.stringify(newNode, null, 2));
    console.log("New Node keys:", Object.keys(newNode));

    return newNode;
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
    const { nodes: currentElements, edges: currentRelations, setNodes} = useStore.getState();
    
    const selectedNodes = currentElements.filter(n => n.selected);
    const selectedEdges = currentRelations.filter(e => e.selected);
    const nodeIdsToDelete = new Set(selectedNodes.map(node => node.id));
  
    const blockIdsToDelete = new Set(
      selectedNodes.filter(n => n.type === 'block').map(n => n.id)
    );
  
    const updatedNodes = currentElements.map((node) => {
      if (
        node.type === 'terminal' &&
        node.parentId &&
        blockIdsToDelete.has(node.parentId) &&
        !node.selected
      ) {
        const parentBlock = currentElements.find(b => b.id === node.parentId);
        if (parentBlock) {
          const absolutePosition = {
            x: parentBlock.position.x + node.position.x,
            y: parentBlock.position.y + node.position.y,
          };
          return {
            ...node,
            position: absolutePosition,
            parentId: undefined,
            data: {
              ...node.data,
              terminalOf: undefined,
              parent: 'void', 
            },
          };
        }
      }
      return node;
    });
  
    const nodesAfterDeletion = updatedNodes.filter(n => !nodeIdsToDelete.has(n.id));
    setNodes(nodesAfterDeletion);
  
    if (nodeIdsToDelete.size > 0) {
      await deleteMultipleNodes(Array.from(nodeIdsToDelete));
    }
    const edgeIdsToDelete = selectedEdges.map(edge => edge.id);
    if (edgeIdsToDelete.length > 0) {
      await deleteMultipleEdges(edgeIdsToDelete);
    }
  
    const orphanTerminals = updatedNodes.filter(
      node =>
        node.type === 'terminal' &&
        node.parentId === undefined &&
        currentElements.some(orig => orig.id === node.id && orig.parentId)
    );
    for (const terminal of orphanTerminals) {
      await updateNode(terminal.id);
    }
  };
  
  
  const handleTriggerDelete = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => e.selected);
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
    if (confirmDeletion) {
      setShowDeleteDialog(true);
    } else {
      handleConfirmDelete();
    }
  }, [nodes, edges, confirmDeletion]);

  return (
    <>
      <ClipboardContext.Provider
        value={{
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
            nodes.some(n => n.selected) ? 'element' : 'relation'
          }
          onConfirm={async () => {
            await handleConfirmDelete();
            setShowDeleteDialog(false);
          }}
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