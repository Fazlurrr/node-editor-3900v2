import { CSSTransition } from 'react-transition-group';
import { AppPage } from '@/lib/types';
import { Login, Home, Dashboard } from '@/pages';
import { useEffect } from 'react';
import { useTheme, useSession } from '@/hooks';
import { Toaster } from 'react-hot-toast';
import { Navbar, NodesPanel, Loader } from './components/ui';

const routeConfig = {
  [AppPage.Login]: Login,
  [AppPage.Home]: Home,
  [AppPage.Dashboard]: Dashboard,
};

const App: React.FC = () => {
  const { theme } = useTheme();
  const { token, dashboard, currentPage, setCurrentPage } = useSession();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!token) {
      return setCurrentPage(AppPage.Login);
    }
    if (dashboard) {
      return setCurrentPage(AppPage.Dashboard);
    }
    setCurrentPage(AppPage.Home);
  }, [dashboard, setCurrentPage, token]);

  return (
    <>
      <Toaster />
      <Navbar />
      <NodesPanel />
      {Object.entries(routeConfig).map(([page, Component]) => (
        <CSSTransition
          key={page}
          in={page === currentPage}
          timeout={300}
          classNames="page"
          unmountOnExit
        >
          <main className="page h-screen w-screen">
            <Loader />
            <Component />
          </main>
        </CSSTransition>
      ))}
    </>
  );
};

export default App;
