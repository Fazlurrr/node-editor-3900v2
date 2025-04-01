import { useConnection, useSession, useStore } from '@/hooks';
import { Connection, Edge } from 'reactflow';
import { EdgeType, NodeRelation } from '../types';
import { toast } from 'react-toastify';
import { isBlock, isTerminal } from '.';
import { createEdge } from '@/api/edges';
import { handleNewNodeRelations } from './nodes';

// Triggered when a connection is made between two nodes
export const onConnect = async (params: Edge | Connection) => {
  const { nodes } = useStore.getState();
  const { setParams, startConnection } = useConnection.getState();
  // Store params in app state to use in other functions
  setParams(params);

  if (params.source === params.target) {
    toast.error('Cannot connect node to itself');
    return;
  }

  // Set terminalOf property for terminal & terminals array for block
  if (isTerminal(params.target as string) && isBlock(params.source as string)) {
    const terminal = nodes.find(t => t.id === params.target);

    // If terminal is already a terminal of another block
    if (terminal?.data?.terminalOf) {
      const block = nodes.find(b => b.id === terminal?.data?.terminalOf);
      toast.error(
        `Terminal ${terminal?.data?.customName === '' ? terminal?.data?.label : terminal?.data?.customName} is already a terminal of ${block?.data?.customName === '' ? terminal?.data?.terminalOf : block?.data?.customName}`
      );
      return;
    }
  }

  // If none of the above conditions are met, open dialog to select edge type
  return startConnection(
    isBlock(params.source as string) && isBlock(params.target as string)
  );
};

export const addEdge = async (
  edgeType: EdgeType,
  newNodeRelations: NodeRelation[],
  lockConnection = true
) => {
  const { edges } = useStore.getState();
  const { params } = useConnection.getState();
  const { user } = useSession.getState();

  const currentDate = Date.now();
  const id = edges.length.toString();

  const newEdge = {
    ...params,
    // Id needs to be this format for reactflow to render the edge between nodes
    id: `reactflow__edge-${params!.source}${params!.sourceHandle}-${params!.target}${params!.targetHandle}`,
    type: edgeType,
    data: {
      id,
      label: `Edge ${id}`,
      lockConnection,
      createdAt: currentDate,
      updatedAt: currentDate,
      createdBy: user?.id,
    },
  };

  // /api/edges POST request
  const edge = await createEdge(newEdge as Edge);

  if (edge) {
    // Update node relations with new node relations
    handleNewNodeRelations(newNodeRelations as NodeRelation[]);
  }
};
