
import { Node, ReactFlowInstance } from "reactflow";
import { addNode, addTerminalToBlock } from '@/lib/utils/nodes';
import { updateNode } from '@/api/nodes';
import { isPointInsideNode, getSnappedPosition } from "@/lib/utils/nodes";
import { shallow } from 'zustand/shallow';
import { storeSelector, useStore} from '@/hooks';
import { useCallback } from 'react';

export const useNodeOperations = (
    reactFlowWrapper: React.RefObject<HTMLDivElement>,
    reactFlowInstance: ReactFlowInstance | null,
    initialPositions: React.MutableRefObject<Record<string, { x: number; y: number }>>
) => {
    const { nodes } =
        useStore(storeSelector, shallow);
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
          
                // Update terminal in state with absolute position
                const updatedNodes = nodes.map((n) => {
                  if (n.id === terminal.id) {
                    return {
                      ...n,
                      position: terminal.position
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
          
                // Update terminal in state with both positions
                const updatedNodes = nodes.map((n) => {
                  if (n.id === node.id) {
                    return {
                      ...n,
                      position: snappedPosition,        // Relative position for React Flow
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

      const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        
        if (!reactFlowWrapper.current || !reactFlowInstance) return;
        
        const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        
        if (!data) return;
        
        // Let ReactFlow handle the basic positioning
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
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
            
            // Use your existing function for terminal positioning
            const snappedPosition = getSnappedPosition({
              id: 'temp',
              type: 'terminal',
              position: relativePosition,
              width: 22,
              height: 22,
              data
            }, blockNode);
            
            const newTerminal = await addTerminalToBlock(blockNode.id, snappedPosition, data.aspect);
            
            if (newTerminal) {
              await updateNode(newTerminal.id);
            }
            
            return;
          }
        }
        
        // Let grid snapping be handled by ReactFlow's props
        addNode(data.aspect, data.nodeType, position);
      };

      const handleTerminalDetach = useCallback((nodeId: string) => {
          const currentElements = useStore.getState().nodes;
          const terminalNode = currentElements.find(n => n.id === nodeId);
          const { setNodes } = useStore.getState();
          
          if (!terminalNode || terminalNode.type !== 'terminal') return;
          
          // Get the parent block
          const parentId = terminalNode.parentId;
          const parentBlock = currentElements.find(n => n.id === parentId);
          
          if (!parentBlock) return;
          
          // Create updated versions of the nodes
          const updatedParent = {
            ...parentBlock,
            data: {
              ...parentBlock.data,
              terminals: parentBlock.data.terminals.filter((t: { id: string; }) => t.id !== nodeId)
            }
          };
          
          // Calculate absolute position
          const absolutePosition = {
            x: parentBlock.position.x + terminalNode.position.x,
            y: parentBlock.position.y + terminalNode.position.y
          };
          
          // Determine which side of the block the terminal is on and move it farther away
          // to avoid immediate re-snapping (using the snap grid value of 11)
          const terminalWidth = terminalNode.width || 22; // Default width if not specified
          const terminalHeight = terminalNode.height || 22; // Default height if not specified
          const blockWidth = parentBlock.width || 110; // Default width if not specified
          const blockHeight = parentBlock.height || 66; // Default height if not specified
          
          // Check terminal position relative to block
          const relX = terminalNode.position.x;
          const relY = terminalNode.position.y;
          const moveDistance = 11;
          
            // Enhanced logic for corners
            const isOnLeft = relX <= 0;
            const isOnRight = relX + terminalWidth >= blockWidth;
            const isOnTop = relY <= 0;
            const isOnBottom = relY + terminalHeight >= blockHeight;

            // Check if terminal is at a corner
            const isTopLeft = isOnTop && isOnLeft;
            const isTopRight = isOnTop && isOnRight;
            const isBottomLeft = isOnBottom && isOnLeft;
            const isBottomRight = isOnBottom && isOnRight;

            // Handle corners
            if (isTopLeft) {
            absolutePosition.x -= moveDistance;
            absolutePosition.y -= moveDistance;
            } else if (isTopRight) {
            absolutePosition.x += moveDistance;
            absolutePosition.y -= moveDistance;
            } else if (isBottomLeft) {
            absolutePosition.x -= moveDistance;
            absolutePosition.y += moveDistance;
            } else if (isBottomRight) {
            absolutePosition.x += moveDistance;
            absolutePosition.y += moveDistance;
            }
            // Handle edges
            else if (isOnLeft) {
            absolutePosition.x -= moveDistance;
            } else if (isOnRight) {
            absolutePosition.x += moveDistance;
            } else if (isOnTop) {
            absolutePosition.y -= moveDistance;
            } else if (isOnBottom) {
            absolutePosition.y += moveDistance;
            }
          
          const updatedTerminal = {
            ...terminalNode,
            position: absolutePosition,
            parentId: undefined, // Remove parentId relationship
            data: {
              ...terminalNode.data,
              parent: 'void',
              // Remove terminalOf if it exists
              ...(terminalNode.data.terminalOf ? { terminalOf: undefined } : {})
            }
          };
          
          // Update the nodes
          const otherNodes = currentElements.filter(n => n.id !== nodeId && n.id !== parentId);
          setNodes([...otherNodes, updatedParent, updatedTerminal]);
      
          updateNode(updatedParent.id);
          updateNode(updatedTerminal.id);
        }, []);

        const handleSelectionDragStart = useCallback((_event: React.MouseEvent, draggedNodes: Node[]) => {
            draggedNodes.forEach((node) => {
              if (!initialPositions.current[node.id]) {
                initialPositions.current[node.id] = {
                  x: node.position.x,
                  y: node.position.y,
                };
              }
            });
          }, []);
        
          const handleSelectionDragStop = useCallback(async (event: React.MouseEvent, draggedNodes: Node[]) => {
            for (const node of draggedNodes) {
              await onNodeDragStop(event, node);
            }
          }, [onNodeDragStop]);

      return {
        onNodeDrag,
        onNodeDragStop,
        handleDrop,
        handleTerminalDetach,
        handleSelectionDragStop,
        handleSelectionDragStart
      }
};