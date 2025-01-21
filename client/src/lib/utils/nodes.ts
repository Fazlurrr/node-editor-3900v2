import { useSession, useStore } from '@/hooks';
import {
  AspectType,
  CustomNodeProps,
  EdgeType,
  NodeRelation,
  NodeType,
  RelationKeys,
  RelationKeysWithChildren,
} from '../types';
import { createNode, updateNode } from '@/api/nodes';
import { isBlock, isTerminal } from '.';
import { v4 as uuidv4 } from 'uuid';
import { Edge, Node } from 'reactflow';
import toast from 'react-hot-toast';

// Set properties for nodes. NodeRelation is an array of objects with nodeId, relation, and relations properties
export const handleNewNodeRelations = (newNodeRelations: NodeRelation[]) => {
  // Get nodes from app state
  const { nodes } = useStore.getState();

  // Loop through each new node relation
  for (const relation of newNodeRelations) {
    const nodeToUpdate = nodes.find(node => node.id === relation.nodeId);
    const index = nodes.findIndex(node => node.id === relation.nodeId);

    if (!nodeToUpdate || index === -1) return;

    // One to one relation
    if (relation.relation) {
      Object.keys(relation.relation).forEach(keyToUpdate => {
        // Update the node with the new relation
        nodeToUpdate.data[keyToUpdate] = relation.relation![keyToUpdate];
      });
    }

    // One to many relation
    if (relation.relations) {
      Object.keys(relation.relations).forEach(r => {
        // Update the node with the new relation
        nodeToUpdate.data[r] = [
          ...(nodeToUpdate.data[r] ?? []),
          relation.relations![r],
        ];
      });
    }

    updateNode(nodeToUpdate.id);
  }
};

// This function triggers when a node is created
export const addNode = async (aspect: AspectType, type: NodeType, position: { x: number; y: number }) => {
  const { nodes } = useStore.getState();
  const { user } = useSession.getState();

  // Label num is 0 or the highest node number even though nodes are deleted
  const labelNum =
    nodes.length === 0
      ? '0'
      : nodes
          .reduce(
            (max, obj) =>
              Math.max(
                max,
                Number(obj.data.label.charAt(obj.data.label.length - 1)) + 1
              ),
            0
          )
          .toString();

  const label =
    type === 'block'
      ? `Block${labelNum}`
      : type === 'terminal'
      ? `T${labelNum}`
      : `C${labelNum}`;

  const newNode: Node = {
    type,
    id: `${type}-${uuidv4()}`,
    position,
    data: {
      aspect,
      label,
      type,
      createdBy: user?.id,
    },
  };

  // /api/nodes POST request
  await createNode(newNode);
};

// This function is called to update props of a node when a connection is deleted or a node connected to it is deleted
export const updateNodeRelations = async (
  currentEdge: Edge,
  nodeIdToDelete?: string
) => {
  const { nodes } = useStore.getState();

  // Deleting a terminal -> terminal connection
  if (isTerminal(currentEdge.source!) && isTerminal(currentEdge.target!)) {
    const sourceTerminal = nodes.find(
      terminal => terminal.id === currentEdge.source
    );

    const targetTerminal = nodes.find(
      terminal => terminal.id === currentEdge.target
    );

    if (!sourceTerminal || !targetTerminal) return;

    if (targetTerminal.id !== nodeIdToDelete) {
      // Set transferedBy property to empty string
      targetTerminal.data.transferedBy = '';
      await updateNode(targetTerminal.id);
    }

    if (sourceTerminal.id !== nodeIdToDelete) {
      // Set transfersTo property to empty string
      sourceTerminal.data.transfersTo = '';
      await updateNode(sourceTerminal.id);
    }

    return;
  }

  // Deleting a terminal -> block connection
  if (isTerminal(currentEdge.source!) && isBlock(currentEdge.target!)) {
    const terminal = nodes.find(node => node.id === currentEdge.source);
    const block = nodes.find(node => node.id === currentEdge.target);

    if (!terminal || !block) return;

    if (terminal.id !== nodeIdToDelete) {
      // Set terminalOf property to empty string for terminal
      terminal.data.terminalOf = '';
      await updateNode(terminal.id);
    }

    if (block.id !== nodeIdToDelete) {
      const filteredTerminals = block.data.terminals.filter(
        (t: { id: string }) => t.id !== terminal.id
      );

      // Remove terminal from terminals array for block
      block.data.terminals = filteredTerminals.length ? filteredTerminals : [];
      await updateNode(block.id);
    }
    return;
  }

  // Deleting a block -> terminal connection
  if (isTerminal(currentEdge.target!) && isBlock(currentEdge.source!)) {
    const terminal = nodes.find(node => node.id === currentEdge.target);
    const block = nodes.find(node => node.id === currentEdge.source);

    if (!terminal || !block) return;

    if (terminal.id !== nodeIdToDelete) {
      // Set terminalOf property to empty string for terminal
      terminal.data.terminalOf = '';
      await updateNode(terminal.id);
    }

    if (block.id !== nodeIdToDelete) {
      const filteredTerminals = block.data.terminals.filter(
        (t: { id: string }) => t.id !== terminal.id
      );
      // Remove terminal from terminals array for block
      block.data.terminals = filteredTerminals.length ? filteredTerminals : [];
      await updateNode(block.id);
    }
    return;
  }

  // Deleting a conneected edge
  // Can be between blocks -> terminal, block -> connector, terminal -> connector
  if (currentEdge.type === EdgeType.Connected) {
    const sourceNode = nodes.find(node => node.id === currentEdge.source);
    const targetNode = nodes.find(node => node.id === currentEdge.target);

    if (!sourceNode || !targetNode) return;

    if (sourceNode.id !== nodeIdToDelete) {
      const filteredConnectedTo = sourceNode.data.connectedTo.filter(
        (conn: { id: string }) => conn.id !== targetNode.id
      );
      // Remove targetNode id from connectedTo property for source node
      sourceNode.data.connectedTo =
        filteredConnectedTo.length > 0 ? filteredConnectedTo : [];
      await updateNode(sourceNode.id);
    }

    if (targetNode.id !== nodeIdToDelete) {
      const filteredConnectedBy = targetNode.data.connectedBy.filter(
        (conn: { id: string }) => conn.id !== sourceNode.id
      );
      // Remove sourceNode id from connectedBy property for target node
      targetNode.data.connectedBy =
        filteredConnectedBy.length > 0 ? filteredConnectedBy : [];
      await updateNode(targetNode.id);
    }
    return;
  }

  // Deleting a part edge
  // Can be between block -> block, block -> connector
  if (currentEdge.type === EdgeType.Part) {
    const sourceNode = nodes.find(node => node.id === currentEdge.source);
    const targetNode = nodes.find(node => node.id === currentEdge.target);

    if (!sourceNode || !targetNode) return;

    if (targetNode.id !== nodeIdToDelete) {
      const filteredDirectParts = targetNode.data.directParts.filter(
        (part: { id: string }) => part.id !== currentEdge.source
      );
      // Remove sourceNode id from directParts property for target node
      targetNode.data.directParts =
        filteredDirectParts.length > 0 ? filteredDirectParts : [];

      const filteredChildren = targetNode.data.children.filter(
        (child: { id: string }) => child.id !== currentEdge.source
      );

      // Remove sourceNode id from children property for target node
      targetNode.data.children = filteredChildren.length
        ? filteredChildren
        : [];

      await updateNode(targetNode.id);
    }

    if (sourceNode.id !== nodeIdToDelete) {
      // Set directPartOf property to empty string for source node
      sourceNode.data.directPartOf = '';
      // Set parent property to void for source node
      sourceNode.data.parent = 'void';
      await updateNode(sourceNode.id);
    }

    return;
  }

  // Deleting a fulfilled edge
  // Can be between block -> block
  if (currentEdge.type === EdgeType.Fulfilled) {
    const sourceNode = nodes.find(node => node.id === currentEdge.source);
    const targetNode = nodes.find(node => node.id === currentEdge.target);

    if (!sourceNode || !targetNode) return;

    if (targetNode.id !== nodeIdToDelete) {
      const filteredFulfills = targetNode.data.fulfills.filter(
        (node: { id: string }) => node.id !== currentEdge.source
      );
      // Remove sourceNode id from fulfills property for target node
      targetNode.data.fulfills =
        filteredFulfills.length > 0 ? filteredFulfills : [];

      await updateNode(targetNode.id);
    }

    if (sourceNode.id !== nodeIdToDelete) {
      const filteredFulfilledBy = sourceNode.data.fulfilledBy.filter(
        (node: { id: string }) => node.id !== currentEdge.target
      );
      // Remove targetNode id from fulfilledBy property for source node
      sourceNode.data.fulfilledBy =
        filteredFulfilledBy.length > 0 ? filteredFulfilledBy : [];

      await updateNode(sourceNode.id);
    }

    return;
  }
};

// Display node relations if they are not empty in sidebar when node is clicked on canvas & sidebar is displayed
export const getNodeRelations = (
  currentNode: CustomNodeProps
): RelationKeysWithChildren[] => {
  const transformableKeys: RelationKeys[] = [
    'connectedTo',
    'connectedBy',
    'directParts',
    'fulfilledBy',
    'terminals',
    'terminalOf',
    'directPartOf',
    'transfersTo',
    'transferedBy',
    'fulfills',
  ];

  return transformableKeys.reduce(
    (acc: RelationKeysWithChildren[], key: RelationKeys) => {
      if (currentNode.data[key]) {
        let children: { id: string }[];

        if (typeof currentNode.data[key] === 'string') {
          children = [{ id: currentNode.data[key] as string }];
        } else {
          children = currentNode.data[key] as { id: string }[];
        }

        acc.push({
          key,
          children,
        });
      }
      return acc;
    },
    []
  );
};

// Triggered when edge connection is updated
export const updateNodeConnectionData = async (
  sourceNodeId: string,
  targetNodeId: string,
  oldConnection: EdgeType,
  newConnection: EdgeType
): Promise<boolean> => {
  const { nodes } = useStore.getState();
  // Find source and target nodes from app state
  const targetNode = nodes.find(node => node.id === targetNodeId);
  const sourceNode = nodes.find(node => node.id === sourceNodeId);

  if (!sourceNode || !targetNode) {
    toast.error(
      'Could not find nodes to update connection data. Refresh page & try again.'
    );
    return false;
  }

  // If connection to update is part
  if (oldConnection === EdgeType.Part) {
    const filteredParts = targetNode.data.directParts.filter(
      (part: { id: string }) => part.id !== sourceNodeId
    );

    // Remove sourceNode id from directParts property for target node
    targetNode.data.directParts = filteredParts.length > 0 ? filteredParts : [];
    // Set directPartOf property to empty string for source node
    sourceNode.data.directPartOf = '';
  }
  // If connection to update is connected
  else if (oldConnection === EdgeType.Connected) {
    const filteredConnectedBy = targetNode.data.connectedBy.filter(
      (node: { id: string }) => node.id !== sourceNodeId
    );

    // Remove sourceNode id from connectedBy property for target node
    targetNode.data.connectedBy =
      filteredConnectedBy.length > 0 ? filteredConnectedBy : [];

    const filteredConnectedTo = sourceNode.data.connectedTo.filter(
      (node: { id: string }) => node.id !== targetNodeId
    );

    // Remove targetNode id from connectedTo property for source node
    sourceNode.data.connectedTo =
      filteredConnectedTo.length > 0 ? filteredConnectedTo : [];
  }
  // If connection to update is fulfilled
  else {
    const filteredFulfilledBy = sourceNode.data.fulfilledBy.filter(
      (node: { id: string }) => node.id !== targetNodeId
    );
    // Remove targetNode id from fulfilledBy property for source node
    sourceNode.data.fulfilledBy =
      filteredFulfilledBy.length > 0 ? filteredFulfilledBy : [];

    const filteredFulfills = targetNode.data.fulfills.filter(
      (node: { id: string }) => node.id !== sourceNodeId
    );
    // Remove sourceNode id from fulfills property for target node
    targetNode.data.fulfills =
      filteredFulfills.length > 0 ? filteredFulfills : [];
  }

  // If new connection is part
  if (newConnection === EdgeType.Part) {
    // Set directPartOf property to targetNodeId for source node
    sourceNode.data.directPartOf = targetNodeId;
    // Add targetNodeId to directParts property for target node
    targetNode.data.directParts = [
      ...(targetNode.data.directParts ?? []),
      {
        id: sourceNodeId,
      },
    ];
  }
  // If new connection is connected
  else if (newConnection === EdgeType.Connected) {
    // Add targetNodeId to connectedTo property for source node
    sourceNode.data.connectedTo = [
      ...(sourceNode.data.connectedTo ?? []),
      {
        id: targetNodeId,
      },
    ];
    // Add sourceNodeId to connectedBy property for target node
    targetNode.data.connectedBy = [
      ...(targetNode.data.connectedBy ?? []),
      {
        id: sourceNodeId,
      },
    ];
  }
  // If new connection is fulfilled
  else {
    // Add targetNodeId to fulfilledBy property for source node
    sourceNode.data.fulfilledBy = [
      ...(sourceNode.data.fulfilledBy ?? []),
      {
        id: targetNodeId,
      },
    ];
    // Add sourceNodeId to fulfills property for target node
    targetNode.data.fulfills = [
      ...(targetNode.data.fulfills ?? []),
      {
        id: sourceNodeId,
      },
    ];
  }
  // Update source and target node
  await updateNode(sourceNode.id);
  await updateNode(targetNode.id);

  return true;
};
