import { useConnection, useSession, useStore } from '@/hooks';
import { Connection, Edge } from 'reactflow';
import { EdgeType, NodeRelation } from '../types';
import { toast } from 'react-toastify';
import { isBlock, isTerminal } from '.';
import { createEdge, deleteEdge } from '@/api/edges';
import { handleNewNodeRelations } from './nodes';
import { updateNodeConnectionData } from './nodes';

interface SwitchOptions {
  edge: Edge & { type: EdgeType };
}

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

export const switchEdgeDirection = async ({
  edge,
}: SwitchOptions): Promise<Edge | null> => {
  // 1) remove the old edge on the backend + store
  const deleted = await deleteEdge(edge.id);
  if (!deleted) {
    toast.error('Failed to delete the old edge.');
    return null;
  }

  // 2) build a reversed‐endpoint payload
  //    swap handles by regex, recompute the ReactFlow id
  const handlePattern = /(.+)_(top|bottom|left|right)_(source|target)$/;

  const targetMatch = handlePattern.exec(edge.targetHandle!);
  const newSourceHandle = targetMatch
    ? `${targetMatch[1]}_${targetMatch[2]}_source`
    : edge.targetHandle!;

  const sourceMatch = handlePattern.exec(edge.sourceHandle!);
  const newTargetHandle = sourceMatch
    ? `${sourceMatch[1]}_${sourceMatch[2]}_target`
    : edge.sourceHandle!;

  const newSource = edge.target;
  const newTarget = edge.source;
  const newId = `reactflow__edge-${newSource}${newSourceHandle}-${newTarget}${newTargetHandle}`;
  const now = Date.now();

  const reversed: Partial<Edge> = {
    id: newId,
    source: newSource,
    target: newTarget,
    sourceHandle: newSourceHandle,
    targetHandle: newTargetHandle,
    type: edge.type,
    data: {
      ...edge.data,
      createdAt: now,
      updatedAt: now,
    },
  };

  // 3) POST the new edge
  const created = await createEdge(reversed as Edge);
  if (!created) {
    toast.error('Failed to create the reversed edge.');
    return null;
  }

  // 4) sync your per-node metadata
  await updateNodeConnectionData(
    created.source,
    created.target,
    edge.type,
    edge.type
  );

  // 5) mark the new one as selected (and clear selection on the rest)
  const { edges: allEdges, setEdges } = useStore.getState();
  const updatedEdges = allEdges.map(e => ({
    ...e,
    selected: e.id === created.id,
  }));
  setEdges(updatedEdges);

  return created;
};