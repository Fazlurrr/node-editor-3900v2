import * as React from 'react';
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar"
import { storeSelector, useSession, useStore, useTheme } from '@/hooks';
import { AppPage } from '@/lib/types';
import { shallow } from 'zustand/shallow';
import { ThemeToggle, DownloadNodes, Logout, Reset, ViewDashboard, UploadFiles } from './_components';
import { toggleFullScreen } from '@/components/ui/toggleFullScreen';
import { useGridContext } from '../toogleGrid';
import { useMiniMapContext } from '../toggleMiniMap';
import HelpMenu from './HelpMenu/HelpMenu';

const Navbar = () => {
  const { nodes } = useStore(storeSelector, shallow);
  const { theme } = useTheme();
  const { currentPage, setDashboard } = useSession();
  const { isGridVisible, setGridVisible } = useGridContext();
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const { isMiniMapVisible, setMiniMapVisible } = useMiniMapContext();
  const [isHelpMenuVisible, setIsHelpMenuVisible] = React.useState(false);
  const [helpMenuPage, setHelpMenuPage] = React.useState('');

  // used for debugging
  const toggleGrid = () => {
    console.log("Current grid visibility: ", isGridVisible);
    setGridVisible(!isGridVisible);
  }

  // used for debugging
  const toggleMiniMap = () => {
    console.log("Current mini map visibility: ", isMiniMapVisible);
    setMiniMapVisible(!isMiniMapVisible);
  }

  const toggleHelpMenu = () => {
    console.log("Current Help Menu visibility: ", isHelpMenuVisible);
    setIsHelpMenuVisible(!isHelpMenuVisible);
  }

  return (
    <NavigationMenu className="fixed h-12 border-b border-[#9facbc] bg-white dark:bg-navbar-dark">
      <div className="flex w-full items-center justify-between ">
      <div className="flex items-center ">
        <span className="cursor-pointer" onClick={() => setDashboard(false)}>
        <img src={`/logo-${theme}.png`} alt="Logo" className="h-16 p-4" />
        </span>
        {currentPage === AppPage.Editor && (
        <Menubar className="border-none shadow-none bg-transparent">
          <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent className="dark:bg-navbar-dark">
                <MenubarItem>
                New Project <MenubarShortcut>Ctrl+T</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>Import File</MenubarItem>
                <MenubarItem>Export File</MenubarItem>
                <MenubarItem>
                Rename project <MenubarShortcut>Ctrl+N</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                Print... <MenubarShortcut>Ctrl+P</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent className="dark:bg-navbar-dark">
                <MenubarItem>
                Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                Redo <MenubarShortcut>Shift+Ctrl+Z</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                Cut <MenubarShortcut>Ctrl+X</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                Copy <MenubarShortcut>Ctrl+C</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                Paste <MenubarShortcut>Ctrl+V</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
              <MenubarTrigger>Settings</MenubarTrigger>
              <MenubarContent className="dark:bg-navbar-dark">
                <MenubarSub>
                <MenubarSubTrigger inset>Theme</MenubarSubTrigger>
                <MenubarSubContent className="dark:bg-navbar-dark">
                  <ThemeToggle />
                </MenubarSubContent>
                </MenubarSub>
                <MenubarCheckboxItem checked={isGridVisible} onCheckedChange={toggleGrid}>
                  {isGridVisible ? 'Grid' : 'Grid'} <MenubarShortcut>Ctrl+G</MenubarShortcut>
                </MenubarCheckboxItem>
                <MenubarCheckboxItem checked={isMiniMapVisible} onCheckedChange={toggleMiniMap}>
                  {isMiniMapVisible ? 'MiniMap' : 'MiniMap'} <MenubarShortcut>Ctrl+M</MenubarShortcut>
                </MenubarCheckboxItem>
                <MenubarSeparator />
                <MenubarCheckboxItem checked={isFullScreen} onCheckedChange={toggleFullScreen}>
                    {isFullScreen ? 'Fullscreen' : 'Fullscreen'} <MenubarShortcut>F11</MenubarShortcut>
                </MenubarCheckboxItem>
                <MenubarItem inset>Advanced Settings</MenubarItem>
              </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
              <MenubarTrigger>Help</MenubarTrigger>
              <MenubarContent className="dark:bg-navbar-dark">
                <MenubarItem onClick={() => { if (!isHelpMenuVisible) toggleHelpMenu(); setHelpMenuPage('Tutorial'); }}>Tutorial</MenubarItem>
                <MenubarItem onClick={() => window.open('https://sirius-labs.no/imf/')}>IMF Documentation</MenubarItem>
                <MenubarItem onClick={() => { if (!isHelpMenuVisible) toggleHelpMenu(); setHelpMenuPage('Credits'); }}>Credits</MenubarItem>
              </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}
        </div>
        <div className="flex items-center justify-center">
          {currentPage !== AppPage.Login && <ViewDashboard />}
          {currentPage === AppPage.Editor && nodes.length > 0 && (
            <>
              <Reset />
              <DownloadNodes />
            </>
          )}
          {currentPage === AppPage.Editor && <UploadFiles />}
          {currentPage !== AppPage.Login && <Logout />}
        </div>
      </div>
      {isHelpMenuVisible && <HelpMenu close={() => setIsHelpMenuVisible(false)} page={helpMenuPage}/>}
    </NavigationMenu>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export default Navbar;