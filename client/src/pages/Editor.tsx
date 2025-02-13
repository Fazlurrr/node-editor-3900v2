import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  type Edge,
  type Node,
  Background,
  BackgroundVariant,
  EdgeTypes,
  NodeTypes,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import { shallow } from 'zustand/shallow';
import 'reactflow/dist/style.css';
import { Block, Connector, Terminal } from '@/components/Nodes';
import { onConnect } from '@/lib/utils/edges';
import { storeSelector, useStore, useTheme } from '@/hooks';
import {
  Connected,
  Topology,
  Fulfilled,
  Part,
  Transfer,
  Equality,
  Proxy,
  Projection,
  Specialization,
} from '@/components/Edges';
import {
  ControlsStyled,
  MiniMapStyled,
  ReactFlowStyled,
  darkTheme,
  lightTheme,
} from '@/components/ui/styled';
import { ThemeProvider } from 'styled-components';
import { Sidebar, NodesPanel } from '@/components/ui';
import { fetchNodes, updateNode } from '@/api/nodes';
import { fetchEdges } from '@/api/edges';
import { addNode, addTerminalToBlock } from '@/lib/utils/nodes';
import PropertiesPanel from '@/components/ui/PropertiesPanel/PropertiesPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { deleteNode } from '@/api/nodes';
import { deleteEdge } from '@/api/edges';
import { createNode } from '@/api/nodes';
import { v4 as uuidv4 } from 'uuid';

const Editor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      block: Block,
      connector: Connector,
      terminal: Terminal,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      part: Part,
      connected: Connected,
      topology: Topology,
      fulfilled: Fulfilled,
      transfer: Transfer,
      equality: Equality,
      proxy: Proxy,
      projection: Projection,
      specialization: Specialization,
    }),
    []
  );

  const { theme } = useTheme();

  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
    useStore(storeSelector, shallow);

  useEffect(() => {
    (async () => {
      const fetchedEdges = (await fetchEdges()) ?? [];
      const fetchedNodes = (await fetchNodes()) ?? [];
      setNodes(fetchedNodes as Node[]);
      setEdges(fetchedEdges as Edge[]);
    })();
  }, [setNodes, setEdges]);

  const onLoad = (instance: ReactFlowInstance) => setReactFlowInstance(instance);
  
  const isPointInsideNode = (point: { x: number; y: number }, node: Node) => {
    if (!node.positionAbsolute && !node.position) return false;

    const { x, y } = node.positionAbsolute ?? node.position;
    const width = node.width ?? 150;
    const height = node.height ?? 150;

    const inside = 
      point.x >= x && 
      point.x <= x + width && 
      point.y >= y && 
      point.y <= y + height;

      return inside;
  };

  const getSnappedPosition = (node: Node, blockNode: Node) => {
    if (!blockNode) return { x: node.position.x, y: node.position.y };
  
    // Get dimensions
    const childWidth = node.width ?? 22;
    const childHeight = node.height ?? 22;
    const parentWidth = blockNode.width ?? 110;
    const parentHeight = blockNode.height ?? 66;
  
    // Calculate relative position
    const relativeX = node.position.x;
    const relativeY = node.position.y;
  
    // Calculate distances to edges
    const distances = [
      { edge: "left", distance: Math.abs(relativeX + childWidth) },
      { edge: "right", distance: Math.abs(relativeX - parentWidth) },
      { edge: "top", distance: Math.abs(relativeY + childHeight) },
      { edge: "bottom", distance: Math.abs(relativeY - parentHeight) },
    ];
  
    const closestEdge = distances.reduce((prev, curr) =>
      curr.distance < prev.distance ? curr : prev
    );
  
    let newX = relativeX;
    let newY = relativeY;
  
    // Snap to closest edge
    switch (closestEdge.edge) {
      case "left":
        newX = -childWidth;
        newY = Math.max(-childHeight, Math.min(relativeY, parentHeight));
        break;
      case "right":
        newX = parentWidth;
        newY = Math.max(-childHeight, Math.min(relativeY, parentHeight));
        break;
      case "top":
        newY = -childHeight;
        newX = Math.max(-childWidth, Math.min(relativeX, parentWidth));
        break;
      case "bottom":
        newY = parentHeight;
        newX = Math.max(-childWidth, Math.min(relativeX, parentWidth));
        break;
    }
  
    return { x: newX, y: newY };
  };
  

  const onNodeDrag = useCallback(
    (_: unknown, node: Node) => {
      if (node.type !== "terminal" || !node.parentId) return;
  
      const { nodes, setNodes } = useStore.getState();
      const blockNode = nodes.find((n) => n.id === node.parentId);
  
      if (!blockNode) return;
  
      // Get the corrected position
      const { x: newX, y: newY } = getSnappedPosition(node, blockNode);
  
      // Update node position
      const updatedNodes = nodes.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            position: { x: newX, y: newY },
          };
        }
        return n;
      });
  
      setNodes(updatedNodes);
    },
    [] // No dependencies needed since we fetch `nodes` from `useStore.getState()`
  );
   
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
  
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
  
    if (!data) return;
  
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
  
    if (data.nodeType === "terminal") {
      const blockNode = nodes.find(
        (node) => isPointInsideNode(position, node) && node.type === "block"
      );
      
      if (blockNode) {
        // Calculate position relative to the block
        const relativePosition = {
          x: position.x - blockNode.position.x,
          y: position.y - blockNode.position.y
        };
  
        // Create temporary node for position calculation
        const tempNode = {
          id: 'temp',
          type: 'terminal',
          position: relativePosition,
          width: 22,
          height: 22,
          data
        };
  
        // Get snapped position relative to block
        const snappedPosition = getSnappedPosition(tempNode, {
          ...blockNode,
          position: { x: 0, y: 0 }
        });
        
        // Pass the relative snapped position directly
        addTerminalToBlock(blockNode.id, snappedPosition, data.aspect);
        return;
      }
    }
    
    addNode(data.aspect, data.nodeType, {
      x: position.x - 25,
      y: position.y - 25
    });
  };

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedElement(node);
  };

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedElement(edge);
  };

  const handleTriggerDelete = () => {
    if (selectedElement) {
      setShowDeleteDialog(true);
    }
  };

  const handlePaste = async (clipboardElement: Node | Edge) => {
    
    const clonedNode = { ...clipboardElement } as Node;
    const { id, ...nodeWithoutId } = clonedNode;
    
    if (nodeWithoutId.position) {
      nodeWithoutId.position = {
        x: nodeWithoutId.position.x + 20,
        y: nodeWithoutId.position.y + 20,
      };
    }
    
    const newNode = { ...nodeWithoutId, id: `${clonedNode.type}-${uuidv4()}` };
      await createNode(newNode);
  };
  
  useKeyboardShortcuts(selectedElement, handleTriggerDelete, handlePaste);

  const handleConfirmDelete = async () => {
    if (!selectedElement) return;
    if ('source' in selectedElement) {
      await deleteEdge(selectedElement.id as string);
    } else {
      await deleteNode(selectedElement.id);
    }
    setShowDeleteDialog(false);
    setSelectedElement(null);
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <ReactFlowProvider>
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
          <ReactFlowStyled
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes as unknown as NodeTypes}
            edgeTypes={edgeTypes as unknown as EdgeTypes}
            onNodeDragStop={(_, node) => updateNode(node.id)}
            onNodeDrag={onNodeDrag}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onPaneClick={() => setSelectedElement(null)}
            onInit={onLoad}
            snapToGrid={true}
            snapGrid={[11, 11]}
            onDrop={handleDrop}
            onDragOver={(event: React.DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
          >
            <NodesPanel />
            <Sidebar />
            <PropertiesPanel selectedElement={selectedElement} />
            <ControlsStyled
              style={{
                position: 'absolute',
                top: '95%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <MiniMapStyled />
            <Background
              color={theme === 'dark' ? '#2f3237' : '#eee'}
              gap={11}
              lineWidth={1}
              variant={BackgroundVariant.Lines}
            />
          </ReactFlowStyled>
        </div>
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          elementType={selectedElement && 'source' in selectedElement ? 'edge' : 'node'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      </ReactFlowProvider>
    </ThemeProvider>
  );
};

export default Editor;