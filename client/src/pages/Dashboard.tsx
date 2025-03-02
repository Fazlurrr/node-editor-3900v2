import { useSession } from '@/hooks';
import { AdminDashboard, UserDashboard } from '@/components/ui/Dashboard';
import { storeSelector, useStore, useTheme } from '@/hooks';
import {
  ControlsStyled,
  ReactFlowStyled,
  darkTheme,
  lightTheme,
} from '@/components/ui/styled';
import { ThemeProvider } from 'styled-components';

const Dashboard = () => {
  const { user } = useSession();
  const { theme } = useTheme();

  if (!user || !user.role) {
    return null;
  }

  return (
    <>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'user' && <UserDashboard />}
      </ThemeProvider>
    </>
  );
};

export default Dashboard;
