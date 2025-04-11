import * as React from 'react';
import { cn } from '@/lib/utils';
import { NavigationMenu, NavigationMenuLink } from '@/components/ui/Misc/navigation-menu';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger
} from "@/components/ui/Misc/menubar";
import { storeSelector, useSession, useStore, useTheme } from '@/hooks';
import { AppPage } from '@/lib/types';
import { shallow } from 'zustand/shallow';
import { Logout, ViewDashboard } from './NavButtons';
import { toggleFullScreen } from '@/components/ui/Navbar/SettingsMenu/toggleFullScreen';
import { useGridContext } from './SettingsMenu/toggleGrid';
import { useMiniMapContext } from './SettingsMenu/toggleMiniMap';
import HelpMenu from './HelpMenu/HelpMenu';
import Modal from './FileMenu/Modal';
import { toast } from 'react-toastify';
import { Check } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { useMode } from '@/hooks/useMode';
import { useEffect, useState } from 'react';
import { useFirstVisit } from '@/hooks/useLocalStorage';
import AdvancedSettingsModal from './SettingsMenu/AdvancedSettings';

const Navbar = () => {
  const { nodes } = useStore(storeSelector, shallow);
  const { theme, toggleTheme } = useTheme();
  const { currentPage, setDashboard, user } = useSession();
  const { isGridVisible, setGridVisible } = useGridContext();
  const [ isFullScreen ] = React.useState(false);
  const { isMiniMapVisible, setMiniMapVisible } = useMiniMapContext();
  const [ isHelpMenuVisible, setIsHelpMenuVisible ] = useState(false);
  const [ helpMenuPage, setHelpMenuPage ] = useState('');
  const [ isModalVisible, setIsModalVisible ] = useState(false);
  const [ modalPage, setModalPage ] = useState('');
  const { copy, cut, paste, handlePaste, handleTriggerDelete } = useClipboard();
  const { setMode } = useMode();
  const { firstVisit, setFirstVisit } = useFirstVisit();
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = React.useState(false);
  const selectedNodes = useStore(state => state.nodes.filter(n => n.selected));
  const selectedEdges = useStore(state => state.edges.filter(e => e.selected));
  const selectedElements = [...selectedNodes, ...selectedEdges];

  // Opens tutorial on first visit
  useEffect(() => {
    if (firstVisit && currentPage === AppPage.Editor) {
      toggleHelpMenu();
      setHelpMenuPage('Tutorial');
      setFirstVisit(false);
    }
  }, [firstVisit, setFirstVisit, currentPage]);

  const toggleGrid = () => {
    setGridVisible(!isGridVisible);
  };

  const toggleMiniMap = () => {
    setMiniMapVisible(!isMiniMapVisible);
  };

  const toggleHelpMenu = () => {
    setIsHelpMenuVisible(!isHelpMenuVisible);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <NavigationMenu className="fixed h-12 border-b border-[#9facbc] bg-white dark:bg-navbar-dark">
      <div className="flex w-full items-center justify-between ">
        <div className="flex items-center">
          <span className="cursor-pointer" onClick={() => setDashboard(false)}>
            <img src={`/logo-${theme}.png`} alt="Logo" className="h-16 p-4" />
          </span>
          {currentPage === AppPage.Editor && (
            <Menubar className="border-none shadow-none bg-transparent">
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer">File</MenubarTrigger>
                <MenubarContent className="dark:bg-navbar-dark">
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (nodes.length > 0) {
                        if (!isModalVisible) toggleModal();
                        setModalPage('EmptyCanvas');
                      } else {
                        toast.error('Editor is already empty');
                      }
                    }}
                  >
                    Reset Editor
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (nodes.length === 0) {
                        if (!isModalVisible) toggleModal();
                        setModalPage('ImportFile');
                      } else {
                        toast.error('Please clear the current editor before uploading new files');
                      }
                    }}
                  >
                    Import File
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (nodes.length > 0) {
                        if (!isModalVisible) toggleModal();
                        setModalPage('ExportFile');
                      } else {
                        toast.error('Cannot export an empty file');
                      }
                    }}
                  >
                    Export File
                  </MenubarItem>
                  <MenubarItem className="cursor-pointer">
                    Rename project <MenubarShortcut>Ctrl+N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem className="cursor-pointer">
                    Print... <MenubarShortcut>Ctrl+P</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer">Edit</MenubarTrigger>
                <MenubarContent className="dark:bg-navbar-dark">
                  <MenubarItem className="cursor-pointer">
                    Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem className="cursor-pointer">
                    Redo <MenubarShortcut>Shift+Ctrl+Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedElements.length > 0) {
                        handleTriggerDelete();
                      }
                    }}
                  >
                    Delete <MenubarShortcut>Backspace</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => { if (selectedElements.length > 0) cut(selectedElements, handleTriggerDelete); }}
                  >
                    Cut <MenubarShortcut>Ctrl+X</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => { if (selectedElements.length > 0) copy(selectedElements); }}
                  >
                    Copy <MenubarShortcut>Ctrl+C</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => paste(handlePaste)}
                  >
                    Paste <MenubarShortcut>Ctrl+V</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => setMode('transform')}
                  >
                    Transform Mode <MenubarShortcut>T</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer">Settings</MenubarTrigger>
                <MenubarContent className="dark:bg-navbar-dark">
                  <MenubarSub>
                    <MenubarSubTrigger inset className="cursor-pointer">Theme</MenubarSubTrigger>
                    <MenubarSubContent className="dark:bg-navbar-dark">
                      <MenubarItem
                        className={`cursor-pointer flex items-center ${theme === 'light' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                        onClick={() => toggleTheme('light')}
                      >
                        <Check size="16" className={`${theme === 'light' ? '' : 'text-transparent'} mr-2`} />
                        Light
                      </MenubarItem>
                      <MenubarItem
                        className={`cursor-pointer flex items-center ${theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                        onClick={() => toggleTheme('dark')}
                      >
                        <Check size="16" className={`${theme === 'dark' ? '' : 'text-transparent'} mr-2`} />
                        Dark
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarCheckboxItem className="cursor-pointer" checked={isGridVisible} onCheckedChange={toggleGrid}>
                    {isGridVisible ? 'Grid' : 'Grid'} <MenubarShortcut>Ctrl+Shift+G</MenubarShortcut>
                  </MenubarCheckboxItem>
                  <MenubarCheckboxItem className="cursor-pointer" checked={isMiniMapVisible} onCheckedChange={toggleMiniMap}>
                    {isMiniMapVisible ? 'MiniMap' : 'MiniMap'} <MenubarShortcut className="ml-4">Ctrl+Shift+M</MenubarShortcut>
                  </MenubarCheckboxItem>
                  <MenubarSeparator />
                  <MenubarCheckboxItem className="cursor-pointer" checked={isFullScreen} onCheckedChange={toggleFullScreen}>
                    {isFullScreen ? 'Fullscreen' : 'Fullscreen'} <MenubarShortcut>F11</MenubarShortcut>
                  </MenubarCheckboxItem>
                  <MenubarItem
                    inset
                    className="cursor-pointer"
                    onClick={() => setIsAdvancedSettingsOpen(true)}
                  >
                    Advanced Settings
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger className="cursor-pointer">Help</MenubarTrigger>
                <MenubarContent className="dark:bg-navbar-dark">
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => { if (!isHelpMenuVisible) toggleHelpMenu(); setHelpMenuPage('Tutorial'); }}
                  >
                    Tutorial
                  </MenubarItem>
                  <MenubarItem className="cursor-pointer" onClick={() => window.open('https://sirius-labs.no/imf/')}>
                    IMF Documentation
                  </MenubarItem>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={() => { if (!isHelpMenuVisible) toggleHelpMenu(); setHelpMenuPage('Credits'); }}
                  >
                    Credits
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}
        </div>
        <div className="flex items-center justify-center">
          {currentPage !== AppPage.Login && currentPage !== AppPage.Dashboard && <ViewDashboard/>}
          {currentPage === AppPage.Dashboard && 
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            Logged in as 
            <span className="font-semibold ml-1">
              {user?.username}
            </span>
          </span>}
          {currentPage !== AppPage.Login && <Logout/>}
        </div>
      </div>
      {isHelpMenuVisible && <HelpMenu close={() => setIsHelpMenuVisible(false)} page={helpMenuPage}/>}
      {isModalVisible && <Modal close={() => setIsModalVisible(false)} page={modalPage}/>}
      <AdvancedSettingsModal open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen} />
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
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer',
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