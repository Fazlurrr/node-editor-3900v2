import { toast } from 'react-toastify';
import { type Node } from 'reactflow';
import { type UpdateNode } from '@/lib/types';
import { useLoading, useSession, useStore } from '@/hooks';

export const fetchNodes = async (): Promise<Node[] | null> => {
  const { logout, user, token } = useSession.getState();

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/nodes/${user?.id}/all`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    logout();
    toast.error('Unauthorized');
    return null;
  }

  if (!response.ok) {
    const status = response.status;
    toast.error(`Error fetching nodes - Status: ${status}`);
    return null;
  }

  const nodes = await response.json();

  const processedNodes = nodes.map((node: Node) => {
    let updatedNode = node;
    // For terminal nodes, restore the parent relationship
    if (node.type === 'terminal' && node.data.terminalOf) {
      updatedNode = {
        ...node,
        parentId: node.data.terminalOf,
      };
    }
    // For block nodes, copy top-level width/height to data if available
    if (
      node.type === 'block' &&
      node.width !== undefined &&
      node.height !== undefined
    ) {
      updatedNode = {
        ...updatedNode,
        data: {
          ...updatedNode.data,
          width: node.width,
          height: node.height,
        },
      };
    }
    return updatedNode;
  });

  return processedNodes;
};

export const uploadNodes = async (nodesToAdd: Node[]): Promise<boolean> => {
  const { setNodes } = useStore.getState();
  const { logout, token } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/nodes/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nodesToAdd),
      }
    );

    if (response.status === 401) {
      logout();
      toast.error('Unauthorized');
      return false;
    }

    if (!response.ok) {
      const status = response.status;
      toast.error(`Error uploading nodes - Status: ${status}`);
      return false;
    }

    return true;
  } catch (error) {
    toast.error(`Error uploading nodes: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
    const nodes = await fetchNodes();
    if (nodes) {
      setNodes(nodes);
    }
  }
};

export const createNode = async (node: Node): Promise<Node | null> => {
  const { nodes, setNodes } = useStore.getState();
  const { logout, token } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();

  try {
    // Prepare node for storage - should already have relative positions if it's a terminal
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(node),
    });

    if (response.status === 401) {
      logout();
      toast.error('Unauthorized');
      return null;
    }

    if (!response.ok) {
      const status = response.status;
      toast.error(`Error creating node - Status: ${status}`);
      return null;
    }

    const createdNode = await response.json();
    
    if (createdNode) {
      // If this is a terminal with a parent, make sure parentId is set for ReactFlow
      if (createdNode.type === 'terminal' && createdNode.data.terminalOf) {
        createdNode.parentId = createdNode.data.terminalOf;
      }
    
      createdNode.data = {
        ...createdNode.data,
        width: createdNode.width,
        height: createdNode.height,
        customAttributes: createdNode.data.customAttributes ?? [],
      };
    
      setNodes([...nodes, createdNode]);
    }

    return createdNode as Node;
  } catch (error) {
    toast.error(`Error creating node: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
  }
};

export const updateNode = async (
  nodeToUpdateId: string,
  newNodeData?: UpdateNode
): Promise<Node | null> => {
  const { nodes, setNodes } = useStore.getState();
  const nodeToUpdate = nodes.find(n => n.id === nodeToUpdateId);

  if (!nodeToUpdate) {
    toast.error(`Node with id ${nodeToUpdateId} not found. Please try again.`);
    return null;
  }

  const { token, logout } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();

  // Create a copy of the node to update
  const updatedNodeData = { ...nodeToUpdate };

  if (newNodeData) {
    startLoading();
    // Update only the specified data properties
    updatedNodeData.data = {
      ...updatedNodeData.data,
      ...newNodeData,
      updatedAt: Date.now()
    };
  } else {
    // If no newNodeData is provided, this is a position update
    updatedNodeData.data = {
      ...updatedNodeData.data,
      updatedAt: Date.now()
    };
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nodes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedNodeData),
    });

    if (response.status === 401) {
      logout();
      toast.error('Unauthorized');
      return null;
    }

    if (!response.ok) {
      const status = response.status;
      toast.error(`Error updating node - Status: ${status}`);
      return null;
    }

    let updatedNode = await response.json();

    if (updatedNode) {
      if (
        updatedNode.type === 'block' &&
        updatedNode.width !== undefined &&
        updatedNode.height !== undefined
      ) {
        updatedNode = {
          ...updatedNode,
          data: {
            ...updatedNode.data,
            width: updatedNode.width,
            height: updatedNode.height,
          },
        };
      }
      
      const newNodes = nodes.map(node => {
        if (node.id === updatedNode.id) {
          return {
            ...updatedNode,
            selected: node.selected,
            ...(node.type === 'terminal' && node.parentId ? { parentId: node.parentId } : {})
          };
        }
        return node;
      });

      setNodes(newNodes);
    }

    return updatedNode as Node;
  } catch (error) {
    toast.error(`Error updating node: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
  }
};


export const deleteNode = async (nodeToDeleteId: string): Promise<string | null> => {
  //eslint-disable-next-line no-console
  console.log(`===== STARTING deleteNode for ${nodeToDeleteId} =====`);
  
  const { nodes, setNodes } = useStore.getState();
  const { token, logout } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  
  const nodeToDelete = nodes.find(node => node.id === nodeToDeleteId);

  if (!nodeToDelete?.id) {
    toast.error(`Error deleting node - ${nodeToDeleteId} not found`);
    return null;
  }

  startLoading();

  try {
    // Handle block nodes with terminals
    if (nodeToDelete.type === 'block' && nodeToDelete.data?.terminals) {
      const terminalIds = nodeToDelete.data.terminals.map((t: { id: string }) => t.id);
      
      // Create new terminal nodes with absolute positions and no parent references
      const updatedNodes = nodes.map(node => {
        if (terminalIds.includes(node.id)) {
          // Calculate absolute position
          const absolutePosition = {
            x: nodeToDelete.position.x + node.position.x,
            y: nodeToDelete.position.y + node.position.y
          };
          
          // Create a new terminal with absolute position and no parent reference
          const result = {
            ...node,
            position: absolutePosition,
            data: { ...node.data }
          };
          
          // Remove parent references completely
          delete result.parentId;
          delete result.data.terminalOf;
          
          return result;
        }
        return node;
      });
      
      // Filter out the node to delete
      const nodesWithoutDeleted = updatedNodes.filter(n => n.id !== nodeToDeleteId);
      
      // Update React state BEFORE making backend calls
      // This ensures ReactFlow's rendering is consistent
      setNodes(nodesWithoutDeleted);
      
      // Update terminals in the backend
      for (const terminalId of terminalIds) {
        const terminal = nodesWithoutDeleted.find(n => n.id === terminalId);
        if (terminal) {
          try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/nodes`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(terminal),
            });
          } catch (error) {
            //eslint-disable-next-line no-console
            console.warn(`Warning: Error updating terminal ${terminalId}:`, error);
          }
        }
      }
      
      // Delete the node from API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/nodes/${nodeToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 401) {
        logout();
        toast.error('Unauthorized');
        return null;
      }
      
      if (!response.ok) {
        const status = response.status;
        toast.error(`Error deleting node - Status: ${status}`);
        return null;
      }
    } else {
      // For non-block nodes, just update state and call the API
      setNodes(nodes.filter(n => n.id !== nodeToDeleteId));
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/nodes/${nodeToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 401) {
        logout();
        toast.error('Unauthorized');
        return null;
      }
      
      if (!response.ok) {
        const status = response.status;
        toast.error(`Error deleting node - Status: ${status}`);
        return null;
      }
    }
    
    //eslint-disable-next-line no-console
    console.log(`Node deleted successfully`);
    
    return nodeToDelete.id;
  } catch (error) {
    //eslint-disable-next-line no-console
    console.error(`Error in deleteNode:`, error);
    toast.error(`Error deleting node: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
  }
};

export const deleteNodes = async (): Promise<boolean> => {
  const { setNodes } = useStore.getState();
  const { token, user, logout } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/nodes/${user?.id}/all`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      logout();
      toast.error('Unauthorized');
      return false;
    }

    if (!response.ok) {
      const status = response.status;
      toast.error(`Error deleting nodes - Status: ${status}`);
      return false;
    }

    setNodes([]);
    return true;
  } catch (error) {
    toast.error(`Error deleting nodes: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
  }
};

export const deleteMultipleNodes = async (nodeIds: string[]): Promise<boolean> => {
  const { setNodes } = useStore.getState();
  const { token, logout } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/nodes/delete-by-ids`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nodeIds),
      }
    );

    if (response.status === 401) {
      logout();
      toast.error('Unauthorized');
      return false;
    }
    if (!response.ok) {
      toast.error(`Error deleting nodes - Status: ${response.status}`);
      return false;
    }

    const currentElements = useStore.getState().nodes;
    setNodes(currentElements.filter((node) => !nodeIds.includes(node.id)));
    return true;
  } catch (error) {
    toast.error(`Error deleting nodes: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
  }
};

