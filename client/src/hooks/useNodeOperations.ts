
import { Node, ReactFlowInstance } from "reactflow";
import { addNode, addTerminalToBlock } from '@/lib/utils/nodes';
import { updateNode } from '@/api/nodes';
import { isPointInsideNode, getSnappedPosition } from "@/lib/utils/nodes";
import { shallow } from 'zustand/shallow';
import { storeSelector, useStore} from '@/hooks';
import { useCallback, useState } from 'react';

export const useNodeOperations = (
    reactFlowWrapper: React.RefObject<HTMLDivElement>,
    reactFlowInstance: ReactFlowInstance | null,
    initialPositions: React.MutableRefObject<Record<string, { x: number; y: number }>>
) => {
    const [currentZoom ] = useState(1);
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

      return {
        onNodeDrag,
        onNodeDragStop,
        handleDrop,
      }
};