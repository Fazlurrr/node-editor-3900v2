import { useEffect, useMemo } from 'react';

import {
  type Edge,
  type Node,
  Background,
  EdgeTypes,
  NodeTypes,
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

const Home = () => {
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

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <ReactFlowStyled
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes as unknown as NodeTypes}
        edgeTypes={edgeTypes as unknown as EdgeTypes}
        onNodeDragStop={(_, node) => updateNode(node.id)}
        onDrop={(event) => {
          event.preventDefault();
          const reactFlowBounds = event.currentTarget.getBoundingClientRect();
          const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        
          if (!data) return;
        
          const position = {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          };
        
          addNode(data.aspect, data.nodeType, position);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }}
      >
        <Sidebar />
        <SelectConnection />
        <ControlsStyled />
        <MiniMapStyled />
        <Background gap={12} size={1} />
      </ReactFlowStyled>
    </ThemeProvider>
  );
};

export default Home;
