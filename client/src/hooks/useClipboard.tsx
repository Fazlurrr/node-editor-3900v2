import React, {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { Node, Edge } from 'reactflow';
import { createNode, uploadNodes, updateNode, deleteNode, deleteMultipleNodes } from '@/api/nodes';
import { uploadEdges, deleteEdge, deleteMultipleEdges } from '@/api/edges';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/hooks/useStore';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
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
  const isNode = (element: Node | Edge): element is Node => 'data' in element && !('source' in element);
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

  const handlePaste = async (clipboardElements: Node | Edge | (Node | Edge)[]) => {
    if (!clipboardElements) return;
  
    if (Array.isArray(clipboardElements)) {
      console.log('Handling multiple paste for clipboard elements:', clipboardElements);
      const newElements = await handleMultiplePaste(clipboardElements);
      if (newElements && newElements.length > 0) {
        const currentNodes = useStore.getState().nodes;
        const currentEdges = useStore.getState().edges;
        
        const typedElements = newElements as Array<Node | Edge>;
        
        const pastedBlocks = typedElements.filter((el): el is Node => {
          if (!isNode(el)) return false;
          return isBlock(el);
        });
        
        if (pastedBlocks.length > 0) {
          const pastedBlockIds = pastedBlocks.map(node => node.id);
          console.log('Pasted blocks IDs:', pastedBlockIds);
          
          const updatedNodes = currentNodes.map(node => ({
            ...node,
            selected: pastedBlockIds.includes(node.id)
          }));
          
          const updatedEdges = currentEdges.map(edge => ({
            ...edge,
            selected: false
          }));
          
          setNodes(updatedNodes);
          setEdges(updatedEdges);
        }
      }
    } else {
      const newElement = await handleSinglePaste(clipboardElements);
      if (newElement && isNode(newElement)) {
        const currentNodes = useStore.getState().nodes;
        const updatedNodes = currentNodes.map(node => ({
          ...node,
          selected: node.id === newElement.id
        }));
        setNodes(updatedNodes);
      }
    }
  };

  const handleMultiplePaste = async (clipboardElements: (Node | Edge)[]) => {
    const { clipboardNodes, clipboardEdges } = separateNodesAndEdges(clipboardElements);
    
    const blocks = clipboardNodes.filter(node => isBlock(node));
    
    const idMap = generateNewNodeIds(clipboardNodes);
    console.log('Generated ID Map:', idMap);
    
    const blockOffsets: Record<string, {x: number, y: number}> = {};
    blocks.forEach(block => {
      blockOffsets[block.id] = { x: 22, y: 22 }; // Standard offset
    });
    
    const newNodes = clipboardNodes.map(node => {
      console.log(`Creating new node for old ID ${node.id}`);
      const newNode = createNewNode(node, idMap, blockOffsets);
      console.log(`New node created. Old ID: ${node.id}, New ID: ${newNode.id}`);
      
      if (isTerminal(node) && node.data.terminalOf) {
        const newBlockId = idMap[node.data.terminalOf];
        console.log(`Mapping terminal ${node.id}: old parent ${node.data.terminalOf} -> new parent ${newBlockId}`);
        if (newBlockId) {
          newNode.data.terminalOf = newBlockId;
          newNode.parentId = newBlockId;
        }
      }
      
      if (isBlock(node) && node.data.terminals && node.data.terminals.length > 0) {
        newNode.data.terminals = node.data.terminals.map((terminal: any) => {
          const mappedId = idMap[terminal.id] || terminal.id;
          console.log(`Mapping terminal in block ${node.id}: old terminal ID ${terminal.id} -> new terminal ID ${mappedId}`);
          return { id: mappedId };
        }).filter((t: { id: any; }) => !!t.id); 
      }
      
      return newNode;
    });
    
    console.log('New Nodes after paste mapping:', newNodes);
    setNodes([...nodes, ...newNodes]);
    
    await uploadNodes(newNodes);
    
    const newEdges = createNewEdges(clipboardEdges, idMap);
    console.log('New Edges after paste mapping:', newEdges);
    if (newEdges.length > 0) {
      setEdges([...edges, ...newEdges]);
      await uploadEdges(newEdges);
    }
    return [...newNodes, ...newEdges];
  };

  const handleSinglePaste = async (clipboardElement: Node | Edge) => {
    if (isNode(clipboardElement)) {
      console.log(`Handling single paste for node ID: ${clipboardElement.id}`);
      const newNode = createNewNode(clipboardElement);
      console.log(`Created new node for single paste. Old ID: ${clipboardElement.id}, New ID: ${newNode.id}`);
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
      const newId = `${node.type}-${uuidv4()}`;
      console.log(`Mapping node ID: ${node.id} -> ${newId}`);
      map[node.id] = newId;
      return map;
    }, {} as Record<string, string>);
  };

  const createNewNode = (node: Node, idMap?: Record<string, string>, blockOffsets?: Record<string, {x: number, y: number}>) => {
    const newId = idMap ? idMap[node.id] : `${node.type}-${uuidv4()}`;
    
    let position;
    
    if (isTerminal(node) && node.data.terminalOf) {
      if (blockOffsets && blockOffsets[node.data.terminalOf]) {
        position = {
          x: node.position.x,
          y: node.position.y
        };
      } else {
        position = {
          x: node.position.x + 22,
          y: node.position.y + 22
        };
      }
    } else {
      position = {
        x: node.position.x + 22,
        y: node.position.y + 22
      };
    }
    
    return {
      ...node,
      id: newId,
      position,
      width: node.width ?? 110,
      height: node.height ?? 66,
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
    const currentNodes = useStore.getState().nodes;
    const currentEdges = useStore.getState().edges;
    const selectedNodes = currentNodes.filter(n => n.selected);
    const selectedEdges = currentEdges.filter(e => e.selected);
    const nodeIds = selectedNodes.map(node => node.id);
    const edgeIds = selectedEdges.map(edge => edge.id);
    if (nodeIds.length > 0) await deleteMultipleNodes(nodeIds);
    if (edgeIds.length > 0) await deleteMultipleEdges(edgeIds);
  
    // Clear selection on remaining nodes and edges:
    setNodes(currentNodes.filter(n => !nodeIds.includes(n.id)).map(n => ({ ...n, selected: false })));
    setEdges(currentEdges.filter(e => !edgeIds.includes(e.id)).map(e => ({ ...e, selected: false })));
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