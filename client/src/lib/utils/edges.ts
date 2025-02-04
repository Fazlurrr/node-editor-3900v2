import { useConnection, useSession, useStore } from '@/hooks';
import { Connection, Edge } from 'reactflow';
import { EdgeType, NodeRelation } from '../types';
import toast from 'react-hot-toast';
import { isBlock, isConnector, isTerminal } from '.';
import { createEdge } from '@/api/edges';
import { handleNewNodeRelations } from './nodes';

// Triggered when a connection is made between two nodes
export const onConnect = async (params: Edge | Connection) => {
  const { nodes } = useStore.getState();
  const { setParams, startConnection } = useConnection.getState();
  // Store params in app state to use in other functions
  setParams(params);

  const newNodeRelations: NodeRelation[] = [];

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

    newNodeRelations.push({
      nodeId: params.target as string,
      relation: {
        terminalOf: params.source as string,
      },
    });

    newNodeRelations.push({
      nodeId: params.source as string,
      relations: {
        terminals: {
          id: params.target as string,
        },
      },
    });

    // Create edge between terminal & block with Connected type and pass the new node relations
    return addEdge(EdgeType.Connected, newNodeRelations);
  }

  // Set terminalOf property for terminal & terminals array for block
  if (isBlock(params.target as string) && isTerminal(params.source as string)) {
    const terminal = nodes.find(t => t.id === params.source);

    // If terminal is already a terminal of another block
    if (terminal?.data?.terminalOf) {
      const block = nodes.find(b => b.id === terminal?.data?.terminalOf);
      toast.error(
        `Terminal ${terminal?.data?.customName === '' ? terminal?.data?.label : terminal?.data?.customName} is already a terminal of ${block?.data?.customName === '' ? block?.data?.label : block?.data?.customName}`
      );
      return;
    }

    newNodeRelations.push({
      nodeId: params.source as string,
      relation: {
        terminalOf: params.target as string,
      },
    });

    newNodeRelations.push({
      nodeId: params.target as string,
      relations: {
        terminals: {
          id: params.source as string,
        },
      },
    });

    // Create edge between terminal & block with Connected type and pass the new node relations
    return addEdge(EdgeType.Connected, newNodeRelations);
  }

  // Set transfersTo & transferedBy property for terminals
  if (
    isTerminal(params.source as string) &&
    isTerminal(params.target as string)
  ) {
    const targetTerminal = nodes.find(node => node.id === params.target);
    const sourceTerminal = nodes.find(node => node.id === params.source);

    // If terminal is already being transferred by another terminal
    if (targetTerminal?.data.transferedBy) {
      toast.error(
        `Terminal ${targetTerminal?.data.customName === '' ? targetTerminal.data.label : targetTerminal?.data.customName} is already being transferred by another terminal`
      );
      return;
    }

    // If terminal is already transferring to another terminal
    if (sourceTerminal?.data.transfersTo) {
      toast.error(
        `Terminal ${sourceTerminal?.data.customName === '' ? sourceTerminal.data.label : sourceTerminal?.data.customName} is already transferring to another terminal`
      );
      return;
    }

    newNodeRelations.push({
      nodeId: params.source as string,
      relation: {
        transfersTo: params.target as string,
      },
    });

    newNodeRelations.push({
      nodeId: params.target as string,
      relation: {
        transferedBy: params.source as string,
      },
    });

    // Create edge between terminals with Transfer type and pass the new node relations
    return addEdge(EdgeType.Transfer, newNodeRelations);
  }

  if (
    (isTerminal(params.source as string) &&
      isConnector(params.target as string)) ||
    (isConnector(params.source as string) &&
      isTerminal(params.target as string))
  ) {
    newNodeRelations.push({
      nodeId: params.source as string,
      relations: {
        connectedTo: {
          id: params.target as string,
        },
      },
    });

    newNodeRelations.push({
      nodeId: params.target as string,
      relations: {
        connectedBy: {
          id: params.source as string,
        },
      },
    });

    // Create edge between terminal & connector with Connected type and pass the new node relations
    return addEdge(EdgeType.Connected, newNodeRelations);
  }

  if (
    isConnector(params.source as string) &&
    isConnector(params.target as string)
  ) {
    newNodeRelations.push({
      nodeId: params.source as string,
      relations: {
        connectedTo: {
          id: params.target as string,
        },
      },
    });

    newNodeRelations.push({
      nodeId: params.target as string,
      relations: {
        connectedBy: {
          id: params.source as string,
        },
      },
    });

    // Create edge between connectors with Connected type and pass the new node relations
    return addEdge(EdgeType.Connected, newNodeRelations);
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
