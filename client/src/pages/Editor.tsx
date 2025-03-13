import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  type Edge,
  type Node,
  Background,
  BackgroundVariant,
  EdgeTypes,
  NodeTypes,
  ReactFlowInstance
} from 'reactflow';
import { shallow } from 'zustand/shallow';
import 'reactflow/dist/style.css';
import { Block, Connector, Terminal } from '@/components/Nodes';
import { onConnect } from '@/lib/utils/edges';
import { storeSelector, useStore, useTheme } from '@/hooks';
import {
  Connected,
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
  ReactFlowStyled,
  darkTheme,
  lightTheme,
} from '@/components/ui/styled';
import { ThemeProvider } from 'styled-components';
import { NodesPanel } from '@/components/ui';
import { fetchNodes, updateNode } from '@/api/nodes';
import { fetchEdges } from '@/api/edges';
import { addNode, addTerminalToBlock } from '@/lib/utils/nodes';
import PropertiesPanel from '@/components/ui/PropertiesPanel/PropertiesPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useGridContext } from '@/components/ui/toogleGrid';
import { useClipboard } from '@/hooks/useClipboard';

const Editor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const initialPositions = useRef<Record<string, { x: number; y: number }>>({});
  const { isGridVisible } = useGridContext();

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
      let fetchedNodes = (await fetchNodes()) ?? [];

      fetchedNodes = fetchedNodes.map((node) => {
        if (node.type === 'block' && node.width && node.height) {
          return {
            ...node,
            data: {
              ...node.data,
              width: node.width,
              height: node.height,
            },
          };
        }
        return node;
      });

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
  
      // Get the snapped position relative to parent
      const { x: newX, y: newY } = getSnappedPosition(node, blockNode);
  
      // Update node position for visual feedback
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
    []
  );

  const onNodeDragStop = async (_: unknown, node: Node) => {
    const { nodes } = useStore.getState();
    const initialPos = initialPositions.current[node.id];
    if (initialPos) {
      const hasPositionChanged =
        node.position.x !== initialPos.x ||
        node.position.y !== initialPos.y;
      if (hasPositionChanged) {
        if (node.type === "block") {
          // Update the block's position
          await updateNode(node.id);
      
          // Update all child terminals with their absolute positions
          const childTerminals = nodes.filter(
            n => n.type === "terminal" && n.parentId === node.id
          );
      
          for (const terminal of childTerminals) {
            // Calculate absolute position based on parent block's position
            const absolutePosition = {
              x: node.position.x + terminal.position.x,
              y: node.position.y + terminal.position.y
            };
      
            // Update terminal in state with absolute position
            const updatedNodes = nodes.map((n) => {
              if (n.id === terminal.id) {
                return {
                  ...n,
                  position: terminal.position,
                  positionAbsolute: absolutePosition
                };
              }
              return n;
            });
            setNodes(updatedNodes);
      
            // Update in backend
            await updateNode(terminal.id);
          }
        } else if (node.type === "terminal" && node.parentId) {
          const blockNode = nodes.find((n) => n.id === node.parentId);
          if (blockNode) {
            // Get the final snapped position relative to parent
            const snappedPosition = getSnappedPosition(node, blockNode);
            
            // Calculate the absolute position based on the snapped position
            const absolutePosition = {
              x: blockNode.position.x + snappedPosition.x,
              y: blockNode.position.y + snappedPosition.y
            };
      
            // Update terminal in state with both positions
            const updatedNodes = nodes.map((n) => {
              if (n.id === node.id) {
                return {
                  ...n,
                  position: snappedPosition,        // Relative position for React Flow
                  positionAbsolute: absolutePosition // Absolute position for storage
                };
              }
              return n;
            });
            setNodes(updatedNodes);
      
            // Update in backend
            await updateNode(node.id);
          }
        } else {
          // For all other nodes
          await updateNode(node.id);
        }
      }
      delete initialPositions.current[node.id];
    }
  };

   
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
        const snappedPosition = getSnappedPosition(tempNode, blockNode);
        
        // Calculate absolute position for storage
        const absolutePosition = {
          x: blockNode.position.x + snappedPosition.x,
          y: blockNode.position.y + snappedPosition.y
        };
        
        addTerminalToBlock(
          blockNode.id, 
          snappedPosition,  // For React Flow rendering
          absolutePosition, // For storage
          data.aspect
        );
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

  const { selectedElement, setSelectedElement, handleTriggerDelete, handlePaste } = useClipboard();
  
  useKeyboardShortcuts(selectedElement, handleTriggerDelete, handlePaste);


  return (
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
          <div ref={reactFlowWrapper} className='mx-56 h-full'>
            <ReactFlowStyled
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes as unknown as NodeTypes}
              edgeTypes={edgeTypes as unknown as EdgeTypes}
              onNodeDragStart={(_, node) => {
                initialPositions.current[node.id] = {
                  x: node.position.x,
                  y: node.position.y,
                };
              }}
              onNodeDragStop={onNodeDragStop}
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
              <PropertiesPanel selectedElement={selectedElement} />
              <ControlsStyled
                style={{
                  position: 'absolute',
                  top: '95%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              {isGridVisible && (
                <Background
                  color={theme === 'dark' ? '#2f3237' : '#eee'}
                  gap={11}
                  lineWidth={1}
                  variant={BackgroundVariant.Lines}
                />
              )}
            </ReactFlowStyled>
          </div>
      </ThemeProvider>
  );
};

export default Editor;