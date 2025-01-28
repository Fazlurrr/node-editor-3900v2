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
import { Connected, Fulfilled, Part, Transfer } from '@/components/Edges';
import {
  ControlsStyled,
  MiniMapStyled,
  ReactFlowStyled,
  darkTheme,
  lightTheme,
} from '@/components/ui/styled';
import { ThemeProvider } from 'styled-components';
import { Sidebar, SelectConnection } from '@/components/ui';
import { fetchNodes, updateNode } from '@/api/nodes';
import { fetchEdges } from '@/api/edges';
import { addNode } from '@/lib/utils/nodes';
import PropertiesPanel from '@/components/ui/PropertiesPanel/PropertiesPanel';

const Editor = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null); // State for selected element

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
    }),
    []
  );

  const { theme } = useTheme();

  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
    useStore(storeSelector, shallow);

  useEffect(() => {
    (async () => {
      const edges = (await fetchEdges()) ?? [];
      const nodes = (await fetchNodes()) ?? [];
      setNodes(nodes as Node[]);
      setEdges(edges as Edge[]);
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
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    addNode(data.aspect, data.nodeType, position);
  };

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedElement(node); // Update selected element with the clicked node
  };

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedElement(edge); // Update selected element with the clicked edge
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
            onNodeClick={handleNodeClick} // Listen for node clicks
            onEdgeClick={handleEdgeClick} // Listen for edge clicks
            onInit={onLoad}
            snapToGrid={true}
            snapGrid={[11, 11]}
            onDrop={handleDrop}
            onDragOver={(event: React.DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
          >
            <Sidebar />
            <PropertiesPanel selectedElement={selectedElement} /> {/* Pass selected element */}
            <SelectConnection />
            <ControlsStyled style={{ position: 'absolute', top: '95%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            <MiniMapStyled />
            <Background
              color={theme === 'dark' ? '#2f3237' : '#eee'}
              gap={11}
              lineWidth={1}
              variant={BackgroundVariant.Lines}
            />
          </ReactFlowStyled>
        </div>
      </ReactFlowProvider>
    </ThemeProvider>
  );
};

export default Editor;
