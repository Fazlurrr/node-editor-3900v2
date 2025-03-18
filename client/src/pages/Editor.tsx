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
import { useGridContext } from '@/components/ui/toggleGrid';
import { useClipboard } from '@/hooks/useClipboard';
import CanvasMenu from '@/components/ui/CanvasMenu';

const Editor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const initialPositions = useRef<Record<string, { x: number; y: number }>>({});
  const { isGridVisible } = useGridContext();
  const [canvasMenu, setCanvasMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
    useStore(storeSelector, shallow);
  const { selectedElement, setSelectedElement, handleTriggerDelete, handlePaste } = useClipboard();
  const { theme } = useTheme();

  const handleRightClick = useCallback(
    ({ x, y, nodeId }: { x: number; y: number; nodeId: string }) => {
      const currentNodes = useStore.getState().nodes;
      const updatedNodes = currentNodes.map((node) => ({
        ...node,
        selected: node.id === nodeId,
      }));
      setNodes(updatedNodes);
      const selectedNode = updatedNodes.find((n) => n.id === nodeId);
      if (selectedNode) {
        setSelectedElement(selectedNode);
      }
      setCanvasMenu({ x, y, nodeId });
    },
    [setNodes, setSelectedElement]
  );

  const nodeTypes = useMemo(
    () => ({
      block: (nodeProps: any) => <Block {...nodeProps} onRightClick={handleRightClick} />,
      connector: (nodeProps: any) => <Connector {...nodeProps} onRightClick={handleRightClick} />,
      terminal: (nodeProps: any) => <Terminal {...nodeProps} onRightClick={handleRightClick} />,
    }),
    [handleRightClick]
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

  const moveNodeToFront = useCallback(
    (nodeId: string) => {
      const currentNodes = useStore.getState().nodes;
      const targetNode = currentNodes.find((n) => n.id === nodeId);
      if (!targetNode) return;
      const remainingNodes = currentNodes.filter((n) => n.id !== nodeId);
      setNodes([...remainingNodes, targetNode]);
    },
    [setNodes]
  );

  const moveNodeToBack = useCallback(
    (nodeId: string) => {
      const currentNodes = useStore.getState().nodes;
      const targetNode = currentNodes.find((n) => n.id === nodeId);
      if (!targetNode) return;
      const remainingNodes = currentNodes.filter((n) => n.id !== nodeId);
      setNodes([targetNode, ...remainingNodes]);
    },
    [setNodes]
  );
  
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
    const padding = 22; // Padding for easier selection

    const inside = 
      point.x >= x - padding && 
      point.x <= x + width + padding && 
      point.y >= y - padding && 
      point.y <= y + height + padding;

      return inside;
  };

  // Function for snapping terminal to block on the outside parameter
  const getSnappedPosition = (node: Node, blockNode: Node) => {
    if (!blockNode) return { x: node.position.x, y: node.position.y };
  
    // Get dimensions
    const childWidth = node.width ?? 22;
    const childHeight = node.height ?? 22;
    const parentWidth = blockNode.width ?? 110;
    const parentHeight = blockNode.height ?? 66;
  
    // Calculate the position of the terminal's center
    const terminalCenterX = node.position.x + childWidth / 2;
    const terminalCenterY = node.position.y + childHeight / 2;
    
    // Check if terminal is inside the block
    const isInside = 
      terminalCenterX >= 0 && 
      terminalCenterX <= parentWidth && 
      terminalCenterY >= 0 && 
      terminalCenterY <= parentHeight;
    
    // If it's inside, we need to move it outside
    if (isInside) {
      // Calculate distances to each edge from the terminal's center
      const distances = [
        { edge: "left", distance: terminalCenterX },
        { edge: "right", distance: parentWidth - terminalCenterX },
        { edge: "top", distance: terminalCenterY },
        { edge: "bottom", distance: parentHeight - terminalCenterY },
      ];
  
      // Find the closest edge
      const closestEdge = distances.reduce((prev, curr) =>
        curr.distance < prev.distance ? curr : prev
      );
  
      let newX = node.position.x;
      let newY = node.position.y;
  
      // Move terminal outside through the closest edge
      switch (closestEdge.edge) {
        case "left":
          // Position terminal so its right edge touches the left edge of the block
          newX = -childWidth;
          break;
        case "right":
          // Position terminal so its left edge touches the right edge of the block
          newX = parentWidth;
          break;
        case "top":
          // Position terminal so its bottom edge touches the top edge of the block
          newY = -childHeight;
          break;
        case "bottom":
          // Position terminal so its top edge touches the bottom edge of the block
          newY = parentHeight;
          break;
      }
  
      return { x: newX, y: newY };
    }
    
    
    // Check which side of the block the terminal is on
    const isLeftSide = terminalCenterX < 0;
    const isRightSide = terminalCenterX > parentWidth;
    const isTopSide = terminalCenterY < 0;
    const isBottomSide = terminalCenterY > parentHeight;
    
    let newX = node.position.x;
    let newY = node.position.y;
    
    // Align with edges
    if (isLeftSide) {
      newX = -childWidth;
      // Allow free movement along the y-axis but constrain to block's height
      newY = Math.max(-childHeight + 1, Math.min(newY, parentHeight - 1));
    } else if (isRightSide) {
      newX = parentWidth;
      // Allow free movement along the y-axis but constrain to block's height
      newY = Math.max(-childHeight + 1, Math.min(newY, parentHeight - 1));
    } else if (isTopSide) {
      newY = -childHeight;
      // Allow free movement along the x-axis but constrain to block's width
      newX = Math.max(-childWidth + 1, Math.min(newX, parentWidth - 1));
    } else if (isBottomSide) {
      newY = parentHeight;
      // Allow free movement along the x-axis but constrain to block's width
      newX = Math.max(-childWidth + 1, Math.min(newX, parentWidth - 1));
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
    const { nodes, setNodes } = useStore.getState();
    const initialPos = initialPositions.current[node.id];
    
    if (initialPos) {
      const hasPositionChanged =
        node.position.x !== initialPos.x ||
        node.position.y !== initialPos.y;
      
      if (hasPositionChanged) {
        // Check if a terminal is being dragged onto a block
        if (node.type === "terminal" && !node.parentId) {

        const terminalWidth = node.width ?? 22;
        const terminalHeight = node.height ?? 22;
        // Calculate the position of the terminal's center
        const terminalCenterX = node.position.x + terminalWidth / 2;
        const terminalCenterY = node.position.y + terminalHeight / 2;

          // Calculate absolute position of the terminal
          const terminalCenterPosition = {
            x: terminalCenterX,
            y: terminalCenterY
          };
          
          // Find a block that the terminal might be over
          const blockNode = nodes.find(
            potentialBlock => 
              potentialBlock.type === "block" && 
              isPointInsideNode(terminalCenterPosition, potentialBlock)
          );
          
          // If we found a block, attach the terminal to it
          if (blockNode) {
            // Calculate position relative to the block
            const relativePosition = {
              x: node.position.x - blockNode.position.x,
              y: node.position.y - blockNode.position.y
            };

            // Get the snapped position relative to the block
            const snappedPosition = getSnappedPosition({
              ...node,
              position: relativePosition
            }, blockNode);
            
            // Update terminal properties
            const updatedNodes = nodes.map((n) => {
              if (n.id === node.id) {
                return {
                  ...n,
                  position: snappedPosition,        // Relative position for React Flow
                  parentId: blockNode.id,
                  data: {
                    ...n.data,
                    terminalOf: blockNode.id
                  }
                };
              }
              return n;
            });
            
            setNodes(updatedNodes);
            
            // Update block to include this terminal in its terminals array
            const blockToUpdate = nodes.find(n => n.id === blockNode.id);
            if (blockToUpdate) {
              blockToUpdate.data.terminals = Array.isArray(blockToUpdate.data.terminals)
                ? [...blockToUpdate.data.terminals, { id: node.id }]
                : [{ id: node.id }];
              
              await updateNode(blockNode.id);
            }
            
            // Update the terminal node in the backend
            await updateNode(node.id);
            delete initialPositions.current[node.id];
            return;
          }
        }
        
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

  const [currentZoom, setCurrentZoom] = useState(1);
   
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
  
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
  
    if (!data) return;
  
    const offsetX = 199 / currentZoom;
    const offsetY = 25 / currentZoom;
  
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
  
    const adjustedPosition = {
      x: position.x + offsetX,
      y: position.y - offsetY
    };
  
    if (data.nodeType === "terminal") {
      const blockNode = nodes.find(
        (node) => isPointInsideNode(adjustedPosition, node) && node.type === "block"
      );
      
      if (blockNode) {
        // Calculate position relative to the block
        const relativePosition = {
          x: adjustedPosition.x - blockNode.position.x,
          y: adjustedPosition.y - blockNode.position.y
        };
  
  
        // Create temporary node for position calculation with correct position
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
        
        addTerminalToBlock(
          blockNode.id, 
          snappedPosition,  // For React Flow rendering
          data.aspect
        );
        return;
      }
    }
    
    addNode(data.aspect, data.nodeType, adjustedPosition);
  };

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedElement(node);
  };
  

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedElement(edge);
  };

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
          deleteKeyCode={null}
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
          onMoveEnd={() => setCurrentZoom(reactFlowInstance?.getZoom() || 1)}
        >
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
        {canvasMenu && (
          <CanvasMenu
            x={canvasMenu.x}
            y={canvasMenu.y}
            onMoveToFront={() => moveNodeToFront(canvasMenu.nodeId)}
            onMoveToBack={() => moveNodeToBack(canvasMenu.nodeId)}
            onClose={() => setCanvasMenu(null)}
          />
        )}
      </div>
      <NodesPanel />
      <PropertiesPanel selectedElement={selectedElement} />
    </ThemeProvider>
  );
};

export default Editor;