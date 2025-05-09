// src/components/Editor.tsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  type Edge,
  type Node,
  Background,
  BackgroundVariant,
  EdgeTypes,
  NodeTypes,
  SelectionMode,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { shallow } from 'zustand/shallow';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { ReactFlowStyled, darkTheme, lightTheme } from '@/components/ui/styled';
import { ThemeProvider } from 'styled-components';
import ModellingPanel from '@/components/ui/ModellingPanel/ModellingPanel';
import PropertiesPanel from '@/components/ui/PropertiesPanel/PropertiesPanel';
import Toolbar from '@/components/ui/Toolbar/Toolbar';
import CanvasMenu from '@/components/ui/Misc/CanvasMenu';
import { fetchNodes } from '@/api/nodes';
import { fetchEdges } from '@/api/edges';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useClipboard } from '@/hooks/useClipboard';
import { useGridContext } from '@/components/ui/Navbar/SettingsMenu/toggleGrid';
import { useNodeOperations } from '@/hooks/useNodeOperations';
import useConnection from '@/hooks/useConnection';

const PANEL_WIDTH = 224;

const Editor: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const initialPositions = useRef<Record<string, { x: number; y: number }>>({});
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { isGridVisible } = useGridContext();

  const [canvasMenu, setCanvasMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
  } = useStore(storeSelector, shallow);

  const { onNodeDrag, onNodeDragStop, handleDrop, handleTerminalDetach } = useNodeOperations(
    reactFlowWrapper,
    reactFlowInstance,
    initialPositions
  );
  const [, setCurrentZoom] = useState<number>(1);
  const { handleTriggerDelete, handlePaste } = useClipboard();
  const { theme } = useTheme();
  const [lockState, setLockState] = useState<boolean>(false);
  const panOnDrag = [1, 2];
  const { startDraggingRelation, endDraggingRelation } = useConnection();


  const [isModellingCollapsed, setIsModellingCollapsed] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const current = useStore.getState().nodes;
      const updated = current.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }));
      setNodes(updated);
      setCanvasMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    },
    [setNodes]
  );

  const nodeTypes = useMemo<Record<string, React.FC<any>>>(() => ({
    block: (p: any) => <Block {...p} onRightClick={handleNodeContextMenu} />,
    connector: (p: any) => <Connector {...p} onRightClick={handleNodeContextMenu} />,
    terminal: (p: any) => <Terminal {...p} onRightClick={handleNodeContextMenu} />,
  }), [handleNodeContextMenu]);
  
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

  useEffect(() => {
    (async () => {
      const fetchedEdges = (await fetchEdges()) ?? [];
      let fetchedNodes = (await fetchNodes()) ?? [];
      fetchedNodes = fetchedNodes.map((n) =>
        n.type === 'block' && n.width && n.height
          ? { ...n, data: { ...n.data, width: n.width, height: n.height } }
          : n
      );
      setNodes(fetchedNodes as Node[]);
      setEdges(fetchedEdges as Edge[]);
    })();
  }, [setNodes, setEdges]);

  const onLoad = (inst: ReactFlowInstance) => setReactFlowInstance(inst);
  const onMoveEnd = () => setCurrentZoom(reactFlowInstance?.getZoom() || 1);

  useKeyboardShortcuts(
    handleTriggerDelete,
    handlePaste,
    () => setLockState((p) => !p)
  );

  const selectedElements = useMemo(() => {
    const selN = nodes.filter((n) => n.selected);
    const selE = edges.filter((e) => e.selected);
    return [...selN, ...selE];
  }, [nodes, edges]);

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <div
        className="mt-20 h-[calc(100vh-5rem)]"
        style={{
          display: 'grid',
          gridTemplateColumns: `
            ${isModellingCollapsed ? 0 : PANEL_WIDTH}px
            1fr
            ${isPropertiesCollapsed ? 0 : PANEL_WIDTH}px
          `,
        }}
      >
        <div className="overflow-hidden">
          <ModellingPanel
            collapsed={isModellingCollapsed}
            onToggle={() => setIsModellingCollapsed((c) => !c)}
          />
        </div>
        <div ref={reactFlowWrapper} className="relative h-full w-full">
          <ReactFlowStyled
            style={{ width: '100%', height: '100%' }}
            onNodeContextMenu={handleNodeContextMenu}
            nodesDraggable={!lockState}
            nodesConnectable={!lockState}
            elementsSelectable={!lockState}
            nodes={nodes}
            edges={edges}
            selectionOnDrag
            selectNodesOnDrag
            selectionMode={SelectionMode.Partial}
            panOnDrag={panOnDrag}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnectStart={startDraggingRelation}
            onConnectEnd={endDraggingRelation}
            onConnect={onConnect}
            nodeTypes={nodeTypes as unknown as NodeTypes}
            edgeTypes={edgeTypes as unknown as EdgeTypes}
            onNodeDrag={onNodeDrag}
            onNodeDragStart={(_, node) => {
              initialPositions.current[node.id] = {
                x: node.position.x,
                y: node.position.y,
              };
            }}
            onNodeDragStop={onNodeDragStop}
            deleteKeyCode={null}
            onInit={onLoad}
            snapToGrid
            snapGrid={[11, 11]}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onMoveEnd={onMoveEnd}
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
        </div>
        <div className="overflow-hidden">
          <PropertiesPanel
            collapsed={isPropertiesCollapsed}
            onToggle={() => setIsPropertiesCollapsed((c) => !c)}
            selectedElements={selectedElements}
          />
        </div>
      </div>

      <button
        onClick={() => setIsModellingCollapsed((c) => !c)}
        className="fixed z-49 w-6 h-12 bg-gray-200 dark:bg-neutral-700 rounded-r flex items-center justify-center"
        style={{
          top: '50%',
          left: isModellingCollapsed ? 0 : PANEL_WIDTH,
          transform: 'translateY(-50%)',
        }}
      >
        {isModellingCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>

      <button
        onClick={() => setIsPropertiesCollapsed((c) => !c)}
        className="fixed z-49 w-6 h-12 bg-gray-200 dark:bg-neutral-700 rounded-l flex items-center justify-center"
        style={{
          top: '50%',
          right: isPropertiesCollapsed ? 0 : PANEL_WIDTH,
          transform: 'translateY(-50%)',
        }}
      >
        {isPropertiesCollapsed ? (
          <ChevronLeft size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>

      {canvasMenu && (
        <div
          style={{
            position: 'fixed',
            left:   canvasMenu.x,
            top:    canvasMenu.y,
            zIndex: 9999,
          }}
        >
          <CanvasMenu
            onMoveToFront={() => { } }
            onMoveToBack={() => { } }
            onTerminalDetach={() => handleTerminalDetach(canvasMenu.nodeId)}
            onClose={() => setCanvasMenu(null)}
            nodeType={nodes.find((n) => n.id === canvasMenu.nodeId)?.type}
            hasParent={Boolean(
              nodes.find((n) => n.id === canvasMenu.nodeId)?.parentId
            )} x={0} y={0}          />
        </div>
      )}

      <Toolbar isLocked={lockState} onLockToggle={() => setLockState((p) => !p)} />
    </ThemeProvider>
  );
};

export default Editor;
