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
import { createNode, uploadNodes, updateNode, deleteNode, deleteMultipleNodes } from '@/api/nodes';
import { uploadEdges, deleteEdge, deleteMultipleEdges } from '@/api/edges';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/hooks/useStore';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'react-toastify';
import { set } from 'zod';

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
  const isBlock = (node: Node): boolean => node.type === 'block';
  const isTerminal = (node: Node): boolean => node.type === 'terminal';
  
  const [selectedElement, setSelectedElement] = useState<Node | Edge | (Node | Edge)[] | null>(null);
  const clipboardRef = useRef<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { confirmDeletion } = useSettings();
  const [offset, setOffset] = useState(22); // Initial offset value

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
    let elementsToCopy: (Node | Edge)[] = Array.isArray(element) ? [...element] : [element];

    setOffset(20); // Reset offset for new copy
    
    // Get all blocks in the selection
    const blocks = elementsToCopy.filter(el => isNode(el) && isBlock(el)) as Node[];
    
    // If there are blocks, ensure all their terminals are included (without duplicates)
    if (blocks.length > 0) {
      // Get IDs of all terminals already selected
      const selectedTerminalIds = new Set(
        elementsToCopy
          .filter(el => isNode(el) && isTerminal(el))
          .map(term => (term as Node).id)
      );
      
      // Find all terminal IDs that should be included from block references
      const blockTerminalIds = new Set(
        blocks.flatMap(block => block.data.terminals?.map((t: any) => t.id) || [])
      );
      
      // Find terminals to add (that are referenced by blocks but not already selected)
      const terminalsToAdd = nodes.filter(
        node => isTerminal(node) && 
               blockTerminalIds.has(node.id) && 
               !selectedTerminalIds.has(node.id)
      );
      
      // Add missing terminals to the selection
      if (terminalsToAdd.length > 0) {
        elementsToCopy = [...elementsToCopy, ...terminalsToAdd];
      }
    }
    
    clipboardRef.current = JSON.parse(JSON.stringify(elementsToCopy));
    clipboardRef.current = JSON.parse(JSON.stringify(element));
    setOffset(22);
    toast.success('Copied to clipboard');
  };

  const cut = (element: Node | Edge | (Node | Edge)[], onDelete: () => void) => {
    copy(element);
    onDelete();
  };

  const paste = async (onPaste?: (clipboardElement: Node | Edge | (Node | Edge)[]) => void) => {
    if (clipboardRef.current && onPaste) {
      const result = await onPaste(clipboardRef.current);
      return result;
    }
  };

  // Modified handlePaste function that only selects blocks after pasting
const handlePaste = async (clipboardElement: Node | Edge | (Node | Edge)[]) => {
  if (!clipboardElement) return;

  if (Array.isArray(clipboardElement)) {
    const newElements = await handleMultiplePaste(clipboardElement);
    // Only select block nodes after pasting, not terminals or edges
    if (newElements && newElements.length > 0) {
      const currentNodes = useStore.getState().nodes;
      const currentEdges = useStore.getState().edges;
      
      // Filter for only the block nodes from new elements
      const pastedBlocks = newElements.filter(el => 
        isNode(el) && isBlock(el as Node)
      ) as Node[];
      
      // Set only blocks as selected in the context
      if (pastedBlocks.length > 0) {
        setSelectedElement(pastedBlocks);
        
        // Get IDs of pasted blocks only
        const pastedBlockIds = pastedBlocks.map(node => node.id);
        
        // Update nodes with selected state (only blocks are selected)
        const updatedNodes = currentNodes.map(node => ({
          ...node,
          selected: pastedBlockIds.includes(node.id)
        }));
        
        // No edges should be selected
        const updatedEdges = currentEdges.map(edge => ({
          ...edge,
          selected: false
        }));
        
        setNodes(updatedNodes);
        setEdges(updatedEdges);
      }
    }
  } else {
    const newElement = await handleSinglePaste(clipboardElement);
    // For single paste, keep existing behavior
    if (newElement) {
      setSelectedElement(newElement);
      
      if (isNode(newElement)) {
        const currentNodes = useStore.getState().nodes;
        const updatedNodes = currentNodes.map(node => ({
          ...node,
          selected: node.id === newElement.id
        }));
        setNodes(updatedNodes);
      } else if (isEdge(newElement)) {
        const currentEdges = useStore.getState().edges;
        const updatedEdges = currentEdges.map(edge => ({
          ...edge,
          selected: edge.id === newElement.id
        }));
        setEdges(updatedEdges);
      }
      setOffset((prevOffset) => prevOffset + 22);
    }
  }
};

  const handleMultiplePaste = async (clipboardElements: (Node | Edge)[]) => {
    const { clipboardNodes, clipboardEdges } = separateNodesAndEdges(clipboardElements);
    
    // Analyze block-terminal relationships in the clipboard
    const blocks = clipboardNodes.filter(node => isBlock(node));
    
    // Generate new IDs for all nodes
    const idMap = generateNewNodeIds(clipboardNodes);
    
    // Calculate offsets for blocks to apply to their terminals
    const blockOffsets: Record<string, {x: number, y: number}> = {};
    blocks.forEach(block => {
      blockOffsets[block.id] = { x: 22, y: 22 }; // Standard offset
    });
    
    // Create new nodes with proper positions and relationships
    const newNodes = clipboardNodes.map(node => {
      const newNode = createNewNode(node, idMap, blockOffsets);
      
      // Update terminal relationships if this is a terminal
      if (isTerminal(node) && node.data.terminalOf) {
        const newBlockId = idMap[node.data.terminalOf];
        if (newBlockId) {
          newNode.data.terminalOf = newBlockId;
        }
      }
      
      // Update block's terminals array if this is a block
      if (isBlock(node) && node.data.terminals && node.data.terminals.length > 0) {
        newNode.data.terminals = node.data.terminals.map((terminal: any) => ({
          id: idMap[terminal.id] || terminal.id // Use new ID if available, fallback to original
        })).filter((t: { id: any; }) => !!t.id); // Filter out any null/undefined IDs
      }
      
      return newNode;
    });
    
    // Update the nodes in the UI
    setNodes([...nodes, ...newNodes]);
    
    // Upload the new nodes to the server
    await uploadNodes(newNodes);
    
    // Create and upload new edges
    const newEdges = createNewEdges(clipboardEdges, idMap);
    if (newEdges.length > 0) {
      setEdges([...edges, ...newEdges]);
      await uploadEdges(newEdges);
    }
    setSelectedElement(newNodes);
    
    // Return all newly created elements for selection
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

  const createNewNode = (node: Node, idMap?: Record<string, string>, blockOffsets?: Record<string, {x: number, y: number}>) => {
    const newId = idMap ? idMap[node.id] : `${node.type}-${uuidv4()}`;
    
    // Calculate the appropriate position for the node
    let position;
    
    if (isTerminal(node) && node.data.terminalOf) {
      // For terminals: keep exact relative position to parent block
      if (blockOffsets && blockOffsets[node.data.terminalOf]) {
        position = {
          x: node.position.x, // Keep exact x position relative to parent
          y: node.position.y  // Keep exact y position relative to parent
        };
      } else {
        // Parent block not in selection, apply standard offset
        position = {
          x: node.position.x + 22,
          y: node.position.y + 22
        };
      }
    } else {
      // For blocks and other nodes, apply the standard offset
      position = {
        x: node.position.x + 22,
        y: node.position.y + 22
      };
    }
    
    return {
      ...node,
      id: newId,
      position: {
        x: node.position.x + offset,
        y: node.position.y + offset,
      },
      data: {
        ...node.data,
        label: node.data.customName?.trim() ? node.data.customName : node.data.label,
        customAttributes: node.data.customAttributes ?? [],
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
      } else {
        await deleteNode(selectedElement.id);
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