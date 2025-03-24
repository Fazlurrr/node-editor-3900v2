import { useLoading, useSession, useStore } from '@/hooks';
import { EdgeType, EdgeWithEdgeId } from '@/lib/types';
import { updateNodeRelations } from '@/lib/utils/nodes';
import { toast } from 'react-toastify';
import { type Edge } from 'reactflow';

export const fetchEdges = async (): Promise<Edge[] | null> => {
  const { logout, user, token } = useSession.getState();

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/edges/${user?.id}/all`,
    {
      headers: {
        'Content-Type': 'application/json',
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
    toast.error(`Error fetching edges - Status: ${status}`);
    return null;
  }

  const edges = await response.json();

  return edges;
};

export const createEdge = async (edge: Edge): Promise<Edge | null> => {
  const { startLoading, stopLoading } = useLoading.getState();
  const { edges, setEdges } = useStore.getState();
  const { token, logout } = useSession.getState();

  startLoading();

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/edges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(edge),
    });

    if (response.status === 401) {
      logout();
      toast.error('Unauthorized');
      return null;
    }

    if (!response.ok) {
      const status = response.status;
      toast.error(`Error creating edge - Status: ${status}`);
      return null;
    }

    const createdEdge = await response.json();

    if (createdEdge) {
      createdEdge.id = createdEdge.id.toString();
      const newEdges = edges.concat(createdEdge as Edge);
      setEdges(newEdges);
    }

    return createdEdge as Edge;
  } catch (error) {
    toast.error(`Error creating edge: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
  }
};

export const uploadEdges = async (edgesToAdd: Edge[]): Promise<boolean> => {
  const { setEdges } = useStore.getState();
  const { token, logout } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();

  startLoading();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/edges/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(edgesToAdd),
      }
    );

    if (response.status === 401) {
      logout();
      toast.error('Unauthorized');
      return false;
    }

    if (!response.ok) {
      const status = response.status;
      toast.error(`Error uploading edges - Status: ${status}`);
      return false;
    }

    return true;
  } catch (error) {
    toast.error(`Error uploading edges: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
    const edges = await fetchEdges();
    if (edges) {
      setEdges(edges);
    }
  }
};

export const deleteEdge = async (
  edgeIdToDelete: string,
  nodeToDeleteId?: string
): Promise<string | null> => {
  const { edges, setEdges } = useStore.getState();
  const edgeToDelete = edges.find(
    edge => edge.id === edgeIdToDelete
  ) as EdgeWithEdgeId;

  if (!edgeToDelete.id) {
    toast.error(`Error deleting edge - ${edgeIdToDelete} not found`);
    return null;
  }

  const { token, logout } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();

  startLoading();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/edges/${edgeToDelete.id}`,
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
      toast.error(`Error deleting edge - Status: ${status}`);
      return null;
    }

    const edges = await fetchEdges();

    if (edges) {
      setEdges(edges);
    }

    return edgeIdToDelete;
  } catch (error) {
    toast.error(`Error deleting edge: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
    updateNodeRelations(edgeToDelete, nodeToDeleteId);
  }
};

export const updateEdge = async (
  edgeToUpdateId: string,
  newConnection: EdgeType
): Promise<Edge | null> => {
  const { edges, setEdges } = useStore.getState();
  const edgeToUpdate = edges.find(edge => edge.id === edgeToUpdateId);

  if (!edgeToUpdate) {
    toast.error(`Error updating edge - ${edgeToUpdateId} not found`);
    return null;
  }

  const { token, logout } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();

  startLoading();

  edgeToUpdate.type = newConnection;
  edgeToUpdate.data.updatedAt = Date.now();

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/edges`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(edgeToUpdate),
    });

    if (response.status === 401) {
      logout();
      toast.error('Unauthorized');
      return null;
    }

    if (!response.ok) {
      const status = response.status;
      toast.error(`Error updating edge - Status: ${status}`);
      return null;
    }

    const updatedEdge = await response.json();

    if (updatedEdge) {
      const newEdges = edges.map(edge => {
        if (edge.id === updatedEdge.id) {
          return updatedEdge;
        }
        return edge;
      });

      setEdges(newEdges);
    }

    return updatedEdge as Edge;
  } catch (error) {
    toast.error(`Error updating edge: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
  }
};
export const deleteEdges = async (): Promise<boolean> => {
  const { setEdges } = useStore.getState();
  const { token, user, logout } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();

  startLoading();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/edges/${user?.id}/all`,
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
      toast.error(`Error deleting edges - Status: ${status}`);
      return false;
    }

    setEdges([]);
    return true;
  } catch (error) {
    toast.error(`Error deleting edges: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
  }
};

export const deleteMultipleEdges = async (edgeIds: string[]): Promise<boolean> => {
  const { setEdges } = useStore.getState();
  const { token, logout } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/edges/delete-by-ids`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(edgeIds),
      }
    );

    if (response.status === 401) {
      logout();
      toast.error('Unauthorized');
      return false;
    }
    if (!response.ok) {
      toast.error(`Error deleting edges - Status: ${response.status}`);
      return false;
    }

    const currentEdges = useStore.getState().edges;
    setEdges(currentEdges.filter((edge) => !edgeIds.includes(edge.id)));
    return true;
  } catch (error) {
    toast.error(`Error deleting edges: ${(error as Error).message}`);
    throw error;
  } finally {
    stopLoading();
  }
};

