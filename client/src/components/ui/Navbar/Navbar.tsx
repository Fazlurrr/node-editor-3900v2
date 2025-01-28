import * as React from 'react';

import { cn } from '@/lib/utils';
import { addNode } from '@/lib/utils/nodes';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

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
  MenubarTrigger,
} from "@/components/ui/menubar"



import { storeSelector, useSession, useStore, useTheme } from '@/hooks';
import { AppPage, AspectType, NavItem, NodeType } from '@/lib/types';
import { shallow } from 'zustand/shallow';
import {
  ThemeToggle,
  DownloadNodes,
  Logout,
  Reset,
  ViewDashboard,
  UploadFiles,
} from './_components';


const Navbar = () => {
  const { nodes } = useStore(storeSelector, shallow);
  const { theme } = useTheme();
  const { currentPage, setDashboard } = useSession();

  return (
    <NavigationMenu className="fixed h-12 border-b border-[#9facbc] bg-white dark:bg-navbar-dark">
      <div className="flex w-full items-center justify-between ">
        <div className="flex items-center ">
          <span className="cursor-pointer" onClick={() => setDashboard(false)}>
            <img src={`/logo-${theme}.png`} alt="Logo" className="h-16 p-4" />
          </span>
          {currentPage === AppPage.Editor && (
            <Menubar className="border-none drop-shadow-none bg-transparent">
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
                <MenubarSubContent>
                  <MenubarItem>Light</MenubarItem>
                  <MenubarItem>Dark</MenubarItem>
                  <MenubarItem>System</MenubarItem>
                </MenubarSubContent>
                </MenubarSub>
                <MenubarCheckboxItem checked>Toggle Grid</MenubarCheckboxItem>
                <MenubarCheckboxItem checked>Toggle Map</MenubarCheckboxItem>
                <MenubarSeparator />
                <MenubarItem inset>
                Fullscreen <MenubarShortcut>F11</MenubarShortcut>
                </MenubarItem>
                <MenubarItem inset>Advanced Settings</MenubarItem>
              </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
              <MenubarTrigger>Help</MenubarTrigger>
              <MenubarContent className="dark:bg-navbar-dark">
                <MenubarItem>Tutorial</MenubarItem>
                <MenubarItem>IMF Documentation</MenubarItem>
                <MenubarItem>Credits</MenubarItem>
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
          <ThemeToggle />
          {currentPage !== AppPage.Login && <Logout />}
        </div>
      </div>
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
