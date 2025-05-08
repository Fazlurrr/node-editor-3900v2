import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  type Edge,
  type Node,
  Background,
  BackgroundVariant,
  EdgeTypes,
  NodeTypes,
  SelectionMode,
  ReactFlowInstance,
  NodeChange
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
  ReactFlowStyled,
  darkTheme,
  lightTheme,
} from '@/components/ui/styled';
import { ThemeProvider } from 'styled-components';
import { ModellingPanel } from '@/components/ui';
import { fetchNodes } from '@/api/nodes';
import { fetchEdges } from '@/api/edges';
import PropertiesPanel from '@/components/ui/PropertiesPanel/PropertiesPanel';
import Toolbar from '@/components/ui/Toolbar/Toolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useGridContext } from '@/components/ui/Navbar/SettingsMenu/toggleGrid';
import { useClipboard } from '@/hooks/useClipboard';
import CanvasMenu from '@/components/ui/Misc/CanvasMenu';
import { useNodeOperations } from '@/hooks/useNodeOperations';
import useConnection from '@/hooks/useConnection';

import { updateNode } from '@/api/nodes';  
import { isPointInsideNode, getSnappedPosition } from '@/lib/utils/nodes';

const Editor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const { isGridVisible } = useGridContext();
  const [canvasMenu, setCanvasMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  const {
    nodes,
    setNodes,
    onNodesChange: storeOnNodesChange,
    edges,
    setEdges,
    onEdgesChange,
  } = useStore(storeSelector, shallow);

  const { 
    onNodeDrag,            
    handleDrop,
    handleTerminalDetach,
  } = useNodeOperations(reactFlowWrapper, reactFlowInstance);

  const [, setCurrentZoom] = useState<number>(1);
  const { handleTriggerDelete, handlePaste } = useClipboard();
  const { theme } = useTheme();
  const [lockState, setLockState] = useState<boolean>(false);
  const panOnDrag = [1, 2];
  const { startDraggingRelation, endDraggingRelation } = useConnection();

  useEffect(() => {
    setLockState(lockState);
  }, [lockState]);

  const handleRightClick = useCallback(
    ({ x, y, nodeId }: { x: number; y: number; nodeId: string }) => {
      const currentElements = useStore.getState().nodes;
      const updatedNodes = currentElements.map((node) => ({
        ...node,
        selected: node.id === nodeId,
      }));
      setNodes(updatedNodes);
      setCanvasMenu({ x, y, nodeId });
    },
    [setNodes]
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
      const currentElements = useStore.getState().nodes;
      const targetNode = currentElements.find((n) => n.id === nodeId);
      if (!targetNode) return;
      const remainingNodes = currentElements.filter((n) => n.id !== nodeId);
      setNodes([...remainingNodes, targetNode]);
    },
    [setNodes]
  );

  const moveNodeToBack = useCallback(
    (nodeId: string) => {
      const currentElements = useStore.getState().nodes;
      const targetNode = currentElements.find((n) => n.id === nodeId);
      if (!targetNode) return;
      const remainingNodes = currentElements.filter((n) => n.id !== nodeId);
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

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      storeOnNodesChange(changes);
      const updatedStoreNodes = useStore.getState().nodes;
  
      changes.forEach((change) => {
        if (change.type === 'position' && !change.dragging) {
          const changedNode = updatedStoreNodes.find((n) => n.id === change.id);
          if (!changedNode) return;
  
          if (changedNode.type === 'terminal' && !changedNode.parentId) {
            const blockNode = updatedStoreNodes.find(
              (potentialBlock) =>
                potentialBlock.type === 'block' &&
                isPointInsideNode(
                  {
                    x: changedNode.position.x + (changedNode.width || 22) / 2,
                    y: changedNode.position.y + (changedNode.height || 22) / 2,
                  },
                  potentialBlock
                )
            );
  
            if (blockNode) {
              const relPos = {
                x: changedNode.position.x - blockNode.position.x,
                y: changedNode.position.y - blockNode.position.y,
              };
              const snappedPos = getSnappedPosition(
                { ...changedNode, position: relPos },
                blockNode
              );
  
              const currentNodes = useStore.getState().nodes;
              let newNodes = currentNodes.map((node) =>
                node.id === changedNode.id
                  ? { ...node, position: snappedPos, parentId: blockNode.id }
                  : node
              );
  
              newNodes = newNodes.map((node) => {
                if (node.id !== blockNode.id) return node;
                return {
                  ...node,
                  data: {
                    ...node.data,
                    terminals: Array.isArray(node.data.terminals)
                      ? [...node.data.terminals, { id: changedNode.id }]
                      : [{ id: changedNode.id }],
                  },
                };
              });
  
              setNodes(newNodes);
            }
          }
  
          void updateNode(change.id);
        }
      });
    },
    [storeOnNodesChange, setNodes]
  );
  
  useKeyboardShortcuts(handleTriggerDelete, handlePaste, () => setLockState((prev) => !prev));

  const selectedElements = useMemo(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedEdges = edges.filter((e) => e.selected);
    return [...selectedNodes, ...selectedEdges];
  }, [nodes, edges]);

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <div ref={reactFlowWrapper} className="mx-56 mt-20 h-[calc(100vh-5rem)]">
        <ReactFlowStyled
          nodesDraggable={!lockState}
          nodesConnectable={!lockState}
          elementsSelectable={!lockState}
          nodes={nodes}
          edges={edges}
          selectionOnDrag 
          selectNodesOnDrag={true}
          selectionMode={SelectionMode.Partial}
          panOnDrag={panOnDrag}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          
          minZoom={0.2}

          onConnectStart={startDraggingRelation}
          onConnectEnd={endDraggingRelation}
          onConnect={onConnect}
          
          nodeTypes={nodeTypes as unknown as NodeTypes}
          edgeTypes={edgeTypes as unknown as EdgeTypes}
          
          onNodeDrag={onNodeDrag}

          deleteKeyCode={null}
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
            onTerminalDetach={() => handleTerminalDetach(canvasMenu.nodeId)}
            onClose={() => setCanvasMenu(null)}
            nodeType={nodes.find((n) => n.id === canvasMenu.nodeId)?.type}
            hasParent={!!nodes.find((n) => n.id === canvasMenu.nodeId)?.parentId}
          />
        )}
      </div>
      <Toolbar isLocked={lockState} onLockToggle={() => setLockState(!lockState)} />
      <ModellingPanel />
      <PropertiesPanel selectedElements={selectedElements} />
    </ThemeProvider>
  );
};

export default Editor;