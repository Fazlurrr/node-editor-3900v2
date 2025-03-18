import { useSession, useStore } from '@/hooks';
import {
  AspectType,
  EdgeType,
  NodeRelation,
  NodeType
} from '../types';
// import CustomNodeProps, RelationKeys, RelationKeysWithChildren from '../types';
import { createNode, updateNode } from '@/api/nodes';
import { isBlock, isTerminal } from '.';
import { v4 as uuidv4 } from 'uuid';
import { Edge, Node } from 'reactflow';
import { toast } from 'react-toastify';


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

export const getMaxNumber = (nodeType: string | undefined) => {
  const { nodes } = useStore.getState();
  return nodes.filter(node => node.type === nodeType).reduce((max, node) => {
    const match = node.data.label.match(/\d+$/);
    const currentNumber = match ? parseInt(match[0], 10) : 0;
    return Math.max(max, currentNumber);
  }, 0);
};
// This function triggers when a node is created
export const addNode = async (aspect: AspectType, type: NodeType, position: { x: number; y: number }) => {

    const { user } = useSession.getState();

  // Filter nodes by type and find the maximum number for each type


// Determine label number based on type
  const labelNum = getMaxNumber(type) + 1; // Increment the max number found by 1 for the new node

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

  // Create the terminal node with relative position
  const terminal: Node = {
    type: type,
    id: `${type}-${uuidv4()}`,
    position: relativePosition, // This is already relative to the parent
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

  // First create the node
  const response = await createNode({
    ...terminal
  });

  if (!response) {
    toast.error("Failed to create Terminal");
    return;
  }

  // Ensure the blockNode's terminals array exists and add new terminal
  blockNode.data.terminals = Array.isArray(blockNode.data.terminals)
    ? [...blockNode.data.terminals, { id: terminal.id }]
    : [{ id: terminal.id }];

  // Immediately update the position to ensure it's stored correctly
  await updateNode(blockNode.id);

  // Add to React Flow state
  setNodes([...nodes, terminal]);

  return terminal;
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
// REMEMBER: This is commented out before we potentially reworked relation structure in back end + NodeData in types.ts
// Display node relations if they are not empty in sidebar when node is clicked on canvas & sidebar is displayed
// export const getNodeRelations = (
//   currentNode: CustomNodeProps
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
//       if (currentNode.data[key]) {
//         let children: { id: string }[];

//         if (typeof currentNode.data[key] === 'string') {
//           children = [{ id: currentNode.data[key] as string }];
//         } else {
//           children = currentNode.data[key] as { id: string }[];
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

export const isPointInsideNode = (point: { x: number; y: number }, node: Node) => {
  if (!node.position) return false;

  const { x, y } = node.position;
  const width = node.width ?? 150;
  const height = node.height ?? 150;
  const padding = 22; // Padding for easier selection

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
  
  // Find the block node
  const blockNode = nodes.find(node => node.id === blockId);
  if (!blockNode || blockNode.type !== 'block') return;

  // Create a modified block with the new dimensions for position calculations
  const modifiedBlock = {
    ...blockNode,
    width: newWidth,
    height: newHeight
  };

  // Find all terminals attached to this block
  const childTerminals = nodes.filter(
    node => node.type === 'terminal' && node.parentId === blockId
  );
  
  if (childTerminals.length === 0) return;
  
  // Create a copy of nodes to update
  const updatedNodes = [...nodes];
  
  // Update each terminal's position
  for (const terminal of childTerminals) {
    // Get the snapped position based on the new block dimensions
    const snappedPosition = getSnappedPosition(terminal, modifiedBlock);
    
    // Calculate the absolute position based on the block's position
    const absolutePosition = {
      x: blockNode.position.x + snappedPosition.x,
      y: blockNode.position.y + snappedPosition.y
    };
    
    // Find and update the terminal in our nodes copy
    const terminalIndex = updatedNodes.findIndex(node => node.id === terminal.id);
    if (terminalIndex !== -1) {
      updatedNodes[terminalIndex] = {
        ...updatedNodes[terminalIndex],
        position: snappedPosition,          // Relative position for React Flow
        positionAbsolute: absolutePosition  // Absolute position for storage
      };
      
      // Update in database if requested
      if (updateDatabase) {
        await updateNode(terminal.id);
      }
    }
  }
  
  // Update nodes state
  setNodes(updatedNodes);
};

export const useTerminalResizeHandling = () => {
  const onResize = (
    blockId: string,
    params: { width: number, height: number }
  ) => {
    // Only update the visual positions during active resize, don't update database
    updateTerminalPositionsOnBlockResize(blockId, params.width, params.height, false);
  };
  
  const onResizeEnd = async (
    blockId: string,
    params: { width: number, height: number }
  ) => {
    // Update positions and persist to database when resize ends
    await updateTerminalPositionsOnBlockResize(blockId, params.width, params.height, true);
  };
  
  return { onResize, onResizeEnd };
};

// Function for snapping terminal to block on the outside parameter
export const getSnappedPosition = (node: Node, blockNode: Node) => {
  if (!blockNode) return { x: node.position.x, y: node.position.y };

  // Get dimensions
  const childWidth = node.width ?? 22;
  const childHeight = node.height ?? 22;
  const parentWidth = blockNode.width ?? 110;
  const parentHeight = blockNode.height ?? 66;

  // Calculate the position of the terminal's center
  const terminalCenterX = node.position.x + childWidth / 2;
  const terminalCenterY = node.position.y + childHeight / 2;
  
  // Check if terminal is inside the block
  const isInside = 
    terminalCenterX >= 0 && 
    terminalCenterX <= parentWidth && 
    terminalCenterY >= 0 && 
    terminalCenterY <= parentHeight;
  
  // If it's inside, we need to move it outside
  if (isInside) {
    // Calculate distances to each edge from the terminal's center
    const distances = [
      { edge: "left", distance: terminalCenterX },
      { edge: "right", distance: parentWidth - terminalCenterX },
      { edge: "top", distance: terminalCenterY },
      { edge: "bottom", distance: parentHeight - terminalCenterY },
    ];

    // Find the closest edge
    const closestEdge = distances.reduce((prev, curr) =>
      curr.distance < prev.distance ? curr : prev
    );

    let newX = node.position.x;
    let newY = node.position.y;

    // Move terminal outside through the closest edge
    switch (closestEdge.edge) {
      case "left":
        // Position terminal so its right edge touches the left edge of the block
        newX = -childWidth;
        break;
      case "right":
        // Position terminal so its left edge touches the right edge of the block
        newX = parentWidth;
        break;
      case "top":
        // Position terminal so its bottom edge touches the top edge of the block
        newY = -childHeight;
        break;
      case "bottom":
        // Position terminal so its top edge touches the bottom edge of the block
        newY = parentHeight;
        break;
    }

    return { x: newX, y: newY };
  }
  
  
  // Check which side of the block the terminal is on
  const isLeftSide = terminalCenterX < 0;
  const isRightSide = terminalCenterX > parentWidth;
  const isTopSide = terminalCenterY < 0;
  const isBottomSide = terminalCenterY > parentHeight;
  
  let newX = node.position.x;
  let newY = node.position.y;
  
  // Align with edges
  if (isLeftSide) {
    newX = -childWidth;
    // Allow free movement along the y-axis but constrain to block's height
    newY = Math.max(-childHeight + 1, Math.min(newY, parentHeight - 1));
  } else if (isRightSide) {
    newX = parentWidth;
    // Allow free movement along the y-axis but constrain to block's height
    newY = Math.max(-childHeight + 1, Math.min(newY, parentHeight - 1));
  } else if (isTopSide) {
    newY = -childHeight;
    // Allow free movement along the x-axis but constrain to block's width
    newX = Math.max(-childWidth + 1, Math.min(newX, parentWidth - 1));
  } else if (isBottomSide) {
    newY = parentHeight;
    // Allow free movement along the x-axis but constrain to block's width
    newX = Math.max(-childWidth + 1, Math.min(newX, parentWidth - 1));
  }
  
  return { x: newX, y: newY };
};  
