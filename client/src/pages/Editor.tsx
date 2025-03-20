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
  ReactFlowStyled,
  darkTheme,
  lightTheme,
} from '@/components/ui/styled';
import { ThemeProvider } from 'styled-components';
import { NodesPanel } from '@/components/ui';
import { fetchNodes } from '@/api/nodes';
import { fetchEdges } from '@/api/edges';
import PropertiesPanel from '@/components/ui/PropertiesPanel/PropertiesPanel';
import Toolbar from '@/components/ui/Toolbar/Toolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useGridContext } from '@/components/ui/toggleGrid';
import { useClipboard } from '@/hooks/useClipboard';
import CanvasMenu from '@/components/ui/CanvasMenu';
import { useNodeOperations } from '@/hooks/useNodeOperations';

const Editor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const initialPositions = useRef<Record<string, { x: number; y: number }>>({});
  const { isGridVisible } = useGridContext();
  const [canvasMenu, setCanvasMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const { 
    onNodeDrag, 
    onNodeDragStop, 
    handleDrop,
    handleTerminalDetach,
  } = useNodeOperations(reactFlowWrapper, reactFlowInstance, initialPositions);
  const [, setCurrentZoom] = useState<number>(1);
  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
    useStore(storeSelector, shallow);
  const { selectedElement, setSelectedElement, handleTriggerDelete, handlePaste } = useClipboard();
  const { theme } = useTheme();
  const [lockState, setLockState] = useState<boolean>(false);

  useEffect(() => {
    setLockState(lockState);
  }, [lockState]);

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

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedElement(node);
  };
  

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedElement(edge);
  };

  useKeyboardShortcuts(selectedElement, handleTriggerDelete, handlePaste, () => setLockState(prev => !prev));

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <div ref={reactFlowWrapper} className='mx-56 mt-20 h-[calc(100vh-5rem)]'>
        <ReactFlowStyled
          nodesDraggable={!lockState}
          nodesConnectable={!lockState}
          elementsSelectable={!lockState}
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
      <NodesPanel />
      <PropertiesPanel selectedElement={selectedElement} />
    </ThemeProvider>
  );
};

export default Editor;