import { useSession, useStore } from '@/hooks';
import {
  AspectType,
  EdgeType,
  NodeRelation,
  NodeType
} from '../types';
import { createNode, updateNode } from '@/api/nodes';
import { isBlock, isTerminal } from '.';
import { v4 as uuidv4 } from 'uuid';
import { Edge, Node } from 'reactflow';
import { toast } from 'react-toastify';


export const handleNewNodeRelations = (newNodeRelations: NodeRelation[]) => {
  const { nodes } = useStore.getState();

  for (const relation of newNodeRelations) {
    const nodeToUpdate = nodes.find(node => node.id === relation.nodeId);
    const index = nodes.findIndex(node => node.id === relation.nodeId);

    if (!nodeToUpdate || index === -1) return;

    if (relation.relation) {
      Object.keys(relation.relation).forEach(keyToUpdate => {
        nodeToUpdate.data[keyToUpdate] = relation.relation![keyToUpdate];
      });
    }

    if (relation.relations) {
      Object.keys(relation.relations).forEach(r => {
        nodeToUpdate.data[r] = [
          ...(nodeToUpdate.data[r] ?? []),
          relation.relations![r],
        ];
      });
    }

    updateNode(nodeToUpdate.id);
  }
};

export const getMaxNumber = (nodeType: string | undefined) => {
  const { nodes } = useStore.getState();
  return nodes.filter(node => node.type === nodeType).reduce((max, node) => {
    const match = node.data.label.match(/\d+$/);
    const currentNumber = match ? parseInt(match[0], 10) : 0;
    return Math.max(max, currentNumber);
  }, 0);
};
export const addNode = async (aspect: AspectType, type: NodeType, position: { x: number; y: number }) => {

    const { user } = useSession.getState();



  const labelNum = getMaxNumber(type) + 1; 

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

  await createNode(newNode);
};

export const addTerminalToBlock = async (
  blockNodeId: string, 
  relativePosition: { x: number; y: number },
  aspect: string
) => {
  const { nodes, setNodes } = useStore.getState();
  const { user } = useSession.getState();

  const blockNode = nodes.find(node => node.id === blockNodeId);

  if (!blockNode) {
    toast.error('Could not find block node to add terminal to. Please try again.');
    return;
  }

  const type = NodeType.Terminal;
  const labelNum = getMaxNumber(type) + 1;
  const label = `T${labelNum}`;

  const terminal: Node = {
    type: type,
    id: `${type}-${uuidv4()}`,
    position: relativePosition, 
    data: {
      aspect,
      label,
      type,
      createdBy: user?.id,
      terminalOf: blockNodeId,
    },
    parentId: blockNodeId,
    draggable: true,
    selectable: true,
  };

  const response = await createNode({
    ...terminal
  });

  if (!response) {
    toast.error("Failed to create Terminal");
    return;
  }

  blockNode.data.terminals = Array.isArray(blockNode.data.terminals)
    ? [...blockNode.data.terminals, { id: terminal.id }]
    : [{ id: terminal.id }];

  await updateNode(blockNode.id);

  setNodes([...nodes, terminal]);

  return terminal;
};

export const updateNodeRelations = async (
  currentRelation: Edge,
  nodeIdToDelete?: string
) => {
  const { nodes } = useStore.getState();

  if (isTerminal(currentRelation.source!) && isTerminal(currentRelation.target!)) {
    const sourceTerminal = nodes.find(
      terminal => terminal.id === currentRelation.source
    );

    const targetTerminal = nodes.find(
      terminal => terminal.id === currentRelation.target
    );

    if (!sourceTerminal || !targetTerminal) return;

    if (targetTerminal.id !== nodeIdToDelete) {
      targetTerminal.data.transferedBy = '';
      await updateNode(targetTerminal.id);
    }

    if (sourceTerminal.id !== nodeIdToDelete) {
      sourceTerminal.data.transfersTo = '';
      await updateNode(sourceTerminal.id);
    }

    return;
  }

  if (isTerminal(currentRelation.source!) && isBlock(currentRelation.target!)) {
    const terminal = nodes.find(node => node.id === currentRelation.source);
    const block = nodes.find(node => node.id === currentRelation.target);

    if (!terminal || !block) return;

    if (terminal.id !== nodeIdToDelete) {
      terminal.data.terminalOf = '';
      await updateNode(terminal.id);
    }

    if (block.id !== nodeIdToDelete) {
      const filteredTerminals = block.data.terminals.filter(
        (t: { id: string }) => t.id !== terminal.id
      );

      block.data.terminals = filteredTerminals.length ? filteredTerminals : [];
      await updateNode(block.id);
    }
    return;
  }

  if (isTerminal(currentRelation.target!) && isBlock(currentRelation.source!)) {
    const terminal = nodes.find(node => node.id === currentRelation.target);
    const block = nodes.find(node => node.id === currentRelation.source);

    if (!terminal || !block) return;

    if (terminal.id !== nodeIdToDelete) {
      terminal.data.terminalOf = '';
      await updateNode(terminal.id);
    }

    if (block.id !== nodeIdToDelete) {
      const filteredTerminals = block.data.terminals.filter(
        (t: { id: string }) => t.id !== terminal.id
      );
      block.data.terminals = filteredTerminals.length ? filteredTerminals : [];
      await updateNode(block.id);
    }
    return;
  }

  if (currentRelation.type === EdgeType.Connected) {
    const sourceNode = nodes.find(node => node.id === currentRelation.source);
    const targetNode = nodes.find(node => node.id === currentRelation.target);

    if (!sourceNode || !targetNode) return;

    if (sourceNode.id !== nodeIdToDelete) {
      const filteredConnectedTo = sourceNode.data.connectedTo.filter(
        (conn: { id: string }) => conn.id !== targetNode.id
      );
      sourceNode.data.connectedTo =
        filteredConnectedTo.length > 0 ? filteredConnectedTo : [];
      await updateNode(sourceNode.id);
    }

    if (targetNode.id !== nodeIdToDelete) {
      const filteredConnectedBy = targetNode.data.connectedBy.filter(
        (conn: { id: string }) => conn.id !== sourceNode.id
      );
      targetNode.data.connectedBy =
        filteredConnectedBy.length > 0 ? filteredConnectedBy : [];
      await updateNode(targetNode.id);
    }
    return;
  }

  if (currentRelation.type === EdgeType.Part) {
    const sourceNode = nodes.find(node => node.id === currentRelation.source);
    const targetNode = nodes.find(node => node.id === currentRelation.target);

    if (!sourceNode || !targetNode) return;

    if (targetNode.id !== nodeIdToDelete) {
      const filteredDirectParts = targetNode.data.directParts.filter(
        (part: { id: string }) => part.id !== currentRelation.source
      );
      targetNode.data.directParts =
        filteredDirectParts.length > 0 ? filteredDirectParts : [];

      const filteredChildren = targetNode.data.children.filter(
        (child: { id: string }) => child.id !== currentRelation.source
      );

      targetNode.data.children = filteredChildren.length
        ? filteredChildren
        : [];

      await updateNode(targetNode.id);
    }

    if (sourceNode.id !== nodeIdToDelete) {
      sourceNode.data.directPartOf = '';
      sourceNode.data.parent = 'void';
      await updateNode(sourceNode.id);
    }

    return;
  }

  if (currentRelation.type === EdgeType.Fulfilled) {
    const sourceNode = nodes.find(node => node.id === currentRelation.source);
    const targetNode = nodes.find(node => node.id === currentRelation.target);

    if (!sourceNode || !targetNode) return;

    if (targetNode.id !== nodeIdToDelete) {
      const filteredFulfills = targetNode.data.fulfills.filter(
        (node: { id: string }) => node.id !== currentRelation.source
      );
      targetNode.data.fulfills =
        filteredFulfills.length > 0 ? filteredFulfills : [];

      await updateNode(targetNode.id);
    }

    if (sourceNode.id !== nodeIdToDelete) {
      const filteredFulfilledBy = sourceNode.data.fulfilledBy.filter(
        (node: { id: string }) => node.id !== currentRelation.target
      );
      sourceNode.data.fulfilledBy =
        filteredFulfilledBy.length > 0 ? filteredFulfilledBy : [];

      await updateNode(sourceNode.id);
    }

    return;
  }
};
// REMEMBER: This is commented out before we potentially reworked relation structure in back end + NodeData in types.ts
// Display node relations if they are not empty in sidebar when node is clicked on canvas & sidebar is displayed
// export const getNodeRelations = (
//   currentElement: CustomNodeProps
// ): RelationKeysWithChildren[] => {
//   const transformableKeys: RelationKeys[] = [
//     'connectedTo',
//     'connectedBy',
//     'directParts',
//     'fulfilledBy',
//     'terminals',
//     'terminalOf',
//     'directPartOf',
//     'transfersTo',
//     'transferedBy',
//     'fulfills',
//     'topology',
//     'topologyOf',
//     'specialization',
//     'specializationOf',
//     'proxy',
//     'proxyOf',
//     'projection',
//     'projectionOf',
//     'equality',
//     'equalityOf',
//   ];

//   return transformableKeys.reduce(
//     (acc: RelationKeysWithChildren[], key: RelationKeys) => {
//       if (currentElement.data[key]) {
//         let children: { id: string }[];

//         if (typeof currentElement.data[key] === 'string') {
//           children = [{ id: currentElement.data[key] as string }];
//         } else {
//           children = currentElement.data[key] as { id: string }[];
//         }

//         acc.push({
//           key,
//           children,
//         });
//       }
//       return acc;
//     },
//     []
//   );
// };

// Triggered when edge connection is updated
export const updateNodeConnectionData = async (
  sourceNodeId: string,
  targetNodeId: string,
  oldConnection: EdgeType,
  newConnection: EdgeType
): Promise<boolean> => {
  const { nodes } = useStore.getState();
  const targetNode = nodes.find(node => node.id === targetNodeId);
  const sourceNode = nodes.find(node => node.id === sourceNodeId);

  if (!sourceNode || !targetNode) {
    toast.error(
      'Could not find nodes to update connection data. Refresh page & try again.'
    );
    return false;
  }

  if (oldConnection === EdgeType.Part) {
    const filteredParts = targetNode.data.directParts.filter(
      (part: { id: string }) => part.id !== sourceNodeId
    );

    targetNode.data.directParts = filteredParts.length > 0 ? filteredParts : [];
    sourceNode.data.directPartOf = '';
  }
  else if (oldConnection === EdgeType.Connected) {
    const filteredConnectedBy = targetNode.data.connectedBy.filter(
      (node: { id: string }) => node.id !== sourceNodeId
    );

    targetNode.data.connectedBy =
      filteredConnectedBy.length > 0 ? filteredConnectedBy : [];

    const filteredConnectedTo = sourceNode.data.connectedTo.filter(
      (node: { id: string }) => node.id !== targetNodeId
    );

    sourceNode.data.connectedTo =
      filteredConnectedTo.length > 0 ? filteredConnectedTo : [];
  }
  else {
    const filteredFulfilledBy = sourceNode.data.fulfilledBy.filter(
      (node: { id: string }) => node.id !== targetNodeId
    );
    sourceNode.data.fulfilledBy =
      filteredFulfilledBy.length > 0 ? filteredFulfilledBy : [];

    const filteredFulfills = targetNode.data.fulfills.filter(
      (node: { id: string }) => node.id !== sourceNodeId
    );
    targetNode.data.fulfills =
      filteredFulfills.length > 0 ? filteredFulfills : [];
  }

  if (newConnection === EdgeType.Part) {
    sourceNode.data.directPartOf = targetNodeId;
    targetNode.data.directParts = [
      ...(targetNode.data.directParts ?? []),
      {
        id: sourceNodeId,
      },
    ];
  }
  else if (newConnection === EdgeType.Connected) {
    sourceNode.data.connectedTo = [
      ...(sourceNode.data.connectedTo ?? []),
      {
        id: targetNodeId,
      },
    ];
    targetNode.data.connectedBy = [
      ...(targetNode.data.connectedBy ?? []),
      {
        id: sourceNodeId,
      },
    ];
  }
  else {
    sourceNode.data.fulfilledBy = [
      ...(sourceNode.data.fulfilledBy ?? []),
      {
        id: targetNodeId,
      },
    ];
    targetNode.data.fulfills = [
      ...(targetNode.data.fulfills ?? []),
      {
        id: sourceNodeId,
      },
    ];
  }
  await updateNode(sourceNode.id);
  await updateNode(targetNode.id);

  return true;
};

export const isPointInsideNode = (point: { x: number; y: number }, node: Node) => {
  if (!node.position) return false;

  const { x, y } = node.position;
  const width = node.width ?? 150;
  const height = node.height ?? 150;
  const padding = 22; 

  const inside = 
    point.x >= x - padding && 
    point.x <= x + width + padding && 
    point.y >= y - padding && 
    point.y <= y + height + padding;

    return inside;
};

export const updateTerminalPositionsOnBlockResize = async (
  blockId: string,
  newWidth: number,
  newHeight: number,
  updateDatabase: boolean = false
): Promise<void> => {
  const { nodes, setNodes } = useStore.getState();
  
  const blockNode = nodes.find(node => node.id === blockId);
  if (!blockNode || blockNode.type !== 'block') return;

  const modifiedBlock = {
    ...blockNode,
    width: newWidth,
    height: newHeight
  };

  const childTerminals = nodes.filter(
    node => node.type === 'terminal' && node.parentId === blockId
  );
  
  if (childTerminals.length === 0) return;
  
  const updatedNodes = [...nodes];
  
  for (const terminal of childTerminals) {
    const snappedPosition = getSnappedPosition(terminal, modifiedBlock);
    
    const absolutePosition = {
      x: blockNode.position.x + snappedPosition.x,
      y: blockNode.position.y + snappedPosition.y
    };
    
    const terminalIndex = updatedNodes.findIndex(node => node.id === terminal.id);
    if (terminalIndex !== -1) {
      updatedNodes[terminalIndex] = {
        ...updatedNodes[terminalIndex],
        position: snappedPosition,          
        positionAbsolute: absolutePosition  
      };
      
      if (updateDatabase) {
        await updateNode(terminal.id);
      }
    }
  }
  
  setNodes(updatedNodes);
};

export const useTerminalResizeHandling = () => {
  const onResize = (
    blockId: string,
    params: { width: number, height: number }
  ) => {
    updateTerminalPositionsOnBlockResize(blockId, params.width, params.height, false);
  };
  
  const onResizeEnd = async (
    blockId: string,
    params: { width: number, height: number }
  ) => {
    await updateTerminalPositionsOnBlockResize(blockId, params.width, params.height, true);
  };
  
  return { onResize, onResizeEnd };
};

export const getSnappedPosition = (node: Node, blockNode: Node) => {
  if (!blockNode) return { x: node.position.x, y: node.position.y };

  const childWidth = node.width ?? 22;
  const childHeight = node.height ?? 22;
  const parentWidth = blockNode.width ?? 110;
  const parentHeight = blockNode.height ?? 66;

  const terminalCenterX = node.position.x + childWidth / 2;
  const terminalCenterY = node.position.y + childHeight / 2;
  
  const isInside = 
    terminalCenterX >= 0 && 
    terminalCenterX <= parentWidth && 
    terminalCenterY >= 0 && 
    terminalCenterY <= parentHeight;
  
  if (isInside) {
    const distances = [
      { edge: "left", distance: terminalCenterX },
      { edge: "right", distance: parentWidth - terminalCenterX },
      { edge: "top", distance: terminalCenterY },
      { edge: "bottom", distance: parentHeight - terminalCenterY },
    ];

    const closestEdge = distances.reduce((prev, curr) =>
      curr.distance < prev.distance ? curr : prev
    );

    let newX = node.position.x;
    let newY = node.position.y;

    switch (closestEdge.edge) {
      case "left":
        newX = -childWidth;
        break;
      case "right":
        newX = parentWidth;
        break;
      case "top":
        newY = -childHeight;
        break;
      case "bottom":
        newY = parentHeight;
        break;
    }

    return { x: newX, y: newY };
  }
  
  
  const isLeftSide = terminalCenterX < 0;
  const isRightSide = terminalCenterX > parentWidth;
  const isTopSide = terminalCenterY < 0;
  const isBottomSide = terminalCenterY > parentHeight;
  
  let newX = node.position.x;
  let newY = node.position.y;
  
  if (isLeftSide) {
    newX = -childWidth;
    newY = Math.max(-childHeight + 1, Math.min(newY, parentHeight - 1));
  } else if (isRightSide) {
    newX = parentWidth;
    newY = Math.max(-childHeight + 1, Math.min(newY, parentHeight - 1));
  } else if (isTopSide) {
    newY = -childHeight;
    newX = Math.max(-childWidth + 1, Math.min(newX, parentWidth - 1));
  } else if (isBottomSide) {
    newY = parentHeight;
    newX = Math.max(-childWidth + 1, Math.min(newX, parentWidth - 1));
  }
  
  return { x: newX, y: newY };
};
