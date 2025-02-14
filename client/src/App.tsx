import { CSSTransition } from 'react-transition-group';
import { AppPage } from '@/lib/types';
import { Login, Editor, Dashboard } from '@/pages';
import { useEffect } from 'react';
import { useTheme, useSession } from '@/hooks';
import { Bounce, ToastContainer } from 'react-toastify';
import { Navbar, Loader } from './components/ui';
import { GridProvider } from './components/ui/toogleGrid';
import { MiniMapProvider } from './components/ui/toggleMiniMap';

const routeConfig = {
  [AppPage.Login]: Login,
  [AppPage.Editor]: Editor,
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
    setCurrentPage(AppPage.Editor);
  }, [dashboard, setCurrentPage, token]);

  return (
    <MiniMapProvider>
      <GridProvider>
        <>
          <ToastContainer 
            position="top-center" 
            autoClose={4000} 
            hideProgressBar={false} 
            newestOnTop={true} 
            closeOnClick rtl={false} 
            pauseOnFocusLoss 
            draggable 
            pauseOnHover 
            theme="light" 
            transition={Bounce} 
          />
          <Navbar />
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
      </GridProvider>
    </MiniMapProvider>
  );
};

export default App;
