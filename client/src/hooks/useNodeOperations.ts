
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
) => {
    const { nodes } =
        useStore(storeSelector, shallow);
    const onNodeDrag = useCallback(
        (_: unknown, node: Node) => {
          if (node.type !== "terminal" || !node.parentId) return;
      
          const { nodes, setNodes } = useStore.getState();
          const blockNode = nodes.find((n) => n.id === node.parentId);
      
          if (!blockNode) return;
      
          const { x: newX, y: newY } = getSnappedPosition(node, blockNode);
      
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


      const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        
        if (!reactFlowWrapper.current || !reactFlowInstance) return;
        
        const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        
        if (!data) return;
        
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });
        
        if (data.nodeType === "terminal") {
          const blockNode = nodes.find(
            (node) => isPointInsideNode(position, node) && node.type === "block"
          );
          
          if (blockNode) {
            const relativePosition = {
              x: position.x - blockNode.position.x,
              y: position.y - blockNode.position.y
            };
            
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
        
        addNode(data.aspect, data.nodeType, position);
      };

      const handleTerminalDetach = useCallback((nodeId: string) => {
          const currentNodes = useStore.getState().nodes;
          const terminalNode = currentNodes.find(n => n.id === nodeId);
          const { setNodes } = useStore.getState();
          
          if (!terminalNode || terminalNode.type !== 'terminal') return;
          
          const parentId = terminalNode.parentId;
          const parentBlock = currentNodes.find(n => n.id === parentId);
          
          if (!parentBlock) return;
          
          const updatedParent = {
            ...parentBlock,
            data: {
              ...parentBlock.data,
              terminals: parentBlock.data.terminals.filter((t: { id: string; }) => t.id !== nodeId)
            }
          };
          
          const absolutePosition = {
            x: parentBlock.position.x + terminalNode.position.x,
            y: parentBlock.position.y + terminalNode.position.y
          };
          
          const terminalWidth = terminalNode.width || 22; 
          const terminalHeight = terminalNode.height || 22; 
          const blockWidth = parentBlock.width || 110; 
          const blockHeight = parentBlock.height || 66; 
          
          const relX = terminalNode.position.x;
          const relY = terminalNode.position.y;
          const moveDistance = 11;
          
            const isOnLeft = relX <= 0;
            const isOnRight = relX + terminalWidth >= blockWidth;
            const isOnTop = relY <= 0;
            const isOnBottom = relY + terminalHeight >= blockHeight;

            const isTopLeft = isOnTop && isOnLeft;
            const isTopRight = isOnTop && isOnRight;
            const isBottomLeft = isOnBottom && isOnLeft;
            const isBottomRight = isOnBottom && isOnRight;

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
            parentId: undefined, 
            data: {
              ...terminalNode.data,
              parent: 'void',
              ...(terminalNode.data.terminalOf ? { terminalOf: undefined } : {})
            }
          };
          
          const otherNodes = currentNodes.filter(n => n.id !== nodeId && n.id !== parentId);
          setNodes([...otherNodes, updatedParent, updatedTerminal]);
      
          updateNode(updatedParent.id);
          updateNode(updatedTerminal.id);
        }, []);


      return {
        onNodeDrag,
        handleDrop,
        handleTerminalDetach,
      }
};