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

export const onConnect = async (params: Edge | Connection) => {
  const { nodes } = useStore.getState();
  const { setParams, startConnection } = useConnection.getState();
  setParams(params);

  if (params.source === params.target) {
    toast.error('Cannot connect node to itself');
    return;
  }

  if (isTerminal(params.target as string) && isBlock(params.source as string)) {
    const terminal = nodes.find(t => t.id === params.target);

    if (terminal?.data?.terminalOf) {
      const block = nodes.find(b => b.id === terminal?.data?.terminalOf);
      toast.error(
        `Terminal ${terminal?.data?.customName === '' ? terminal?.data?.label : terminal?.data?.customName} is already a terminal of ${block?.data?.customName === '' ? terminal?.data?.terminalOf : block?.data?.customName}`
      );
      return;
    }
  }

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

  const edge = await createEdge(newEdge as Edge);

  if (edge) {
    handleNewNodeRelations(newNodeRelations as NodeRelation[]);
  }
};

export const switchEdgeDirection = async ({
  edge,
}: SwitchOptions): Promise<Edge | null> => {
  const deleted = await deleteEdge(edge.id);
  if (!deleted) {
    toast.error('Failed to delete the old edge.');
    return null;
  }

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

  const created = await createEdge(reversed as Edge);
  if (!created) {
    toast.error('Failed to create the reversed edge.');
    return null;
  }

  await updateNodeConnectionData(
    created.source,
    created.target,
    edge.type,
    edge.type
  );

  const { edges: allEdges, setEdges } = useStore.getState();
  const updatedEdges = allEdges.map(e => ({
    ...e,
    selected: e.id === created.id,
  }));
  setEdges(updatedEdges);

  return created;
};