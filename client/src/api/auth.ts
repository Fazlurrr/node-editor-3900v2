import { useLoading, useSession } from '@/hooks';
import { Role, User, UserWithToken } from '@/lib/types';
import toast from 'react-hot-toast';

export const login = async (
  username: string,
  password: string
): Promise<boolean> => {
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();
  try {
    const { setUser, setToken } = useSession.getState();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage = errorBody || 'Error logging in. Please try again.';

      toast.error(errorMessage);
      return false;
    }

    const data = (await response.json()) as UserWithToken;

    setUser(data.user);
    setToken(data.token);

    return true;
  } catch (error) {
    toast.error('Error logging in. Please try again.');
    throw new Error(`Error logging in: ${error}`);
  } finally {
    stopLoading();
  }
};

export const register = async (
  username: string,
  password: string,
  role: Role
): Promise<boolean> => {
  const { token } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          password,
          role,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage =
        errorBody || 'Error registering user. Please try again.';

      toast.error(errorMessage);
      return false;
    }
    return true;
  } catch (error) {
    toast.error('Error registering user. Please try again.');
    throw new Error(`Error registering user: ${error}`);
  } finally {
    stopLoading();
  }
};

export const fetchAllUsers = async (): Promise<User[]> => {
  const { token } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage =
        errorBody || 'Error fetching users. Please try again.';

      toast.error(errorMessage);
      return [];
    }

    return (await response.json()) as User[];
  } catch (error) {
    toast.error('Error fetching users. Please try again.');
    throw new Error(`Error fetching users: ${error}`);
  } finally {
    stopLoading();
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const { token } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/users/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage =
        errorBody || 'Error deleting user. Please try again.';

      toast.error(errorMessage);
      return false;
    }

    toast.success('User deleted successfully.');
    return true;
  } catch (error) {
    toast.error('Error deleting user. Please try again.');
    throw new Error(`Error deleting user: ${error}`);
  } finally {
    stopLoading();
  }
};

export const updatePassword = async (
  id: string,
  newPassword: string,
  currentPassword = ''
) => {
  const { token } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/users/${id}/password`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword, currentPassword }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage =
        errorBody || 'Error updating password. Please try again.';

      toast.error(errorMessage);
      return false;
    }

    toast.success('Password updated successfully.');
    return true;
  } catch (error) {
    toast.error('Error updating password. Please try again.');
    throw new Error(`Error updating password: ${error}`);
  } finally {
    stopLoading();
  }
};

export const updateUserRole = async (id: string, role: Role) => {
  const { token } = useSession.getState();
  const { startLoading, stopLoading } = useLoading.getState();
  startLoading();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/users/${id}/role`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage =
        errorBody || 'Error updating role. Please try again.';

      toast.error(errorMessage);
      return false;
    }

    toast.success('Role updated successfully.');
    return true;
  } catch (error) {
    toast.error('Error updating role. Please try again.');
    throw new Error(`Error updating role: ${error}`);
  } finally {
    stopLoading();
  }
};
