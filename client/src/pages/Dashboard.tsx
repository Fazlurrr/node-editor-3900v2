import { useSession } from '@/hooks';
import { AdminDashboard, UserDashboard } from '@/components/ui/Dashboard';

const Dashboard = () => {
  const { user } = useSession();

  if (!user || !user.role) {
    return null;
  }

  return (
    <>
      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'user' && <UserDashboard />}
    </>
  );
};

export default Dashboard;
