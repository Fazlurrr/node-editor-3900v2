import { Bounce, toast, ToastContainer } from 'react-toastify';
import { getConnectedEdges, type Node } from 'reactflow';
import { type UpdateNode } from '@/lib/types';
import { deleteEdge } from './edges';
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

  return nodes;
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

    toast.success('Nodes uploaded successfully!');

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
      toast.success(`Error creating node - Status: ${status}`);
      return null;
    }

    const createdNode = await response.json();

    toast.success('Node created successfully!');
    

    if (createdNode) {
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

  if (newNodeData) {
    startLoading();
    Object.keys(newNodeData).forEach(key => {
      // @ts-ignore
      nodeToUpdate.data[key] = newNodeData[key];
    });
  }

  nodeToUpdate.data.updatedAt = Date.now();

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nodes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nodeToUpdate),
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

    const updatedNode = await response.json();

    if (newNodeData) {
      toast.success('Node updated successfully!');
    }

    if (updatedNode) {
      const newNodes = nodes.map(node => {
        if (node.id === updatedNode.id) {
          return updatedNode;
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

export const deleteNode = async (
  nodeToDeleteId: string
): Promise<string | null> => {
  const { nodes, setNodes, edges } = useStore.getState();
  const { token, logout } = useSession.getState();

  const nodeToDelete = nodes.find(node => node.id === nodeToDeleteId);

  if (!nodeToDelete?.id) {
    toast.error(`Error deleting node - ${nodeToDeleteId} not found`);
    return null;
  }

  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();

  const connectedEdges = getConnectedEdges([nodeToDelete], edges);
  for (const edge of connectedEdges) {
    await deleteEdge(edge.id as string, nodeToDeleteId);
  }

  try {
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
      toast.success(`Error deleting node - Status: ${status}`);
      return null;
    }

    toast.success('Node deleted successfully!');

    return nodeToDelete.id;
  } catch (error) {
    toast.error(`Error deleting node: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
    const nodes = await fetchNodes();
    if (nodes) {
      setNodes(nodes);
    }
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
      toast.success(`Error deleting nodes - Status: ${status}`);
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
