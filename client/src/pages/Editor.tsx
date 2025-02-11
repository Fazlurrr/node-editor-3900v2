import { useEffect, useMemo, useRef, useState } from 'react';
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
import { addNode } from '@/lib/utils/nodes';
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
  const initialPositions = useRef<Record<string, { x: number; y: number }>>({});

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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!reactFlowWrapper.current || !reactFlowInstance) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));

    if (!data) return;

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left - 25,
      y: event.clientY - reactFlowBounds.top - 25,
    });

    addNode(data.aspect, data.nodeType, position);
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
          onNodeDragStart={(_, node) => {
            initialPositions.current[node.id] = {
              x: node.position.x,
              y: node.position.y,
            };
          }}
          onNodeDragStop={(_, node) => {
            const initialPos = initialPositions.current[node.id];
            if (initialPos) {
              const hasPositionChanged =
                node.position.x !== initialPos.x ||
                node.position.y !== initialPos.y;
              if (hasPositionChanged) {
                updateNode(node.id);
              }
              delete initialPositions.current[node.id];
            }
          }}
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