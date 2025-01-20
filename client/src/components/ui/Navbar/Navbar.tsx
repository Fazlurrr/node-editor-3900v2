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

const navItems: NavItem[] = [
  {
    title: 'Function',
    subtitle: 'Add new function to editor',
    children: [
      {
        title: 'Block',
        description:
          'Any entity at any abstraction level. Abstraction mechanism',
        nodeType: NodeType.Block,
      },
      {
        title: 'Connector',
        description:
          'Block connection. Abstracted block with infinitesimal boundary',
        nodeType: NodeType.Connector,
      },
      {
        title: 'Terminal',
        description: 'Block port. Point where medium passes the block boundary',
        nodeType: NodeType.Terminal,
      },
    ],
  },
  {
    title: 'Product',
    subtitle: 'Add new product to editor',
    children: [
      {
        title: 'Block',
        description:
          'Any entity at any abstraction level. Abstraction mechanism',
        nodeType: NodeType.Block,
      },
      {
        title: 'Connector',
        description:
          'Block connection. Abstracted block with infinitesimal boundary',
        nodeType: NodeType.Connector,
      },
      {
        title: 'Terminal',
        description: 'Block port. Point where medium passes the block boundary',
        nodeType: NodeType.Terminal,
      },
    ],
  },
  {
    title: 'Location',
    subtitle: 'Add new location to editor',
    children: [
      {
        title: 'Block',
        description:
          'Any entity at any abstraction level. Abstraction mechanism',
        nodeType: NodeType.Block,
      },
      {
        title: 'Connector',
        description:
          'Block connection. Abstracted block with infinitesimal boundary',
        nodeType: NodeType.Connector,
      },
      {
        title: 'Terminal',
        description: 'Block port. Point where medium passes the block boundary',
        nodeType: NodeType.Terminal,
      },
    ],
  },
  {
    title: 'Empty',
    subtitle: 'Add empty node to editor',
    children: [
      {
        title: 'Block',
        description:
          'Any entity at any abstraction level. Abstraction mechanism',
        nodeType: NodeType.Block,
      },
      {
        title: 'Connector',
        description:
          'Block connection. Abstracted block with infinitesimal boundary',
        nodeType: NodeType.Connector,
      },
      {
        title: 'Terminal',
        description: 'Block port. Point where medium passes the block boundary',
        nodeType: NodeType.Terminal,
      },
    ],
  },
];

const Navbar = () => {
  const { nodes } = useStore(storeSelector, shallow);
  const { theme } = useTheme();
  const { currentPage, setDashboard } = useSession();

  return (
    <NavigationMenu className="fixed h-12 border-b border-[#9facbc] bg-white dark:bg-navbar-dark">
      <div className="flex w-full items-center justify-between ">
        <div className="flex items-center ">
          <span className="cursor-pointer" onClick={() => setDashboard(false)}>
            <img src={`/logo-${theme}.png`} alt="Logo" className="h-14 p-4" />
          </span>
          {currentPage === AppPage.Home && (
            <NavigationMenuList>
              {navItems.map(node => (
                <NavigationMenuItem key={node.title}>
                  <NavigationMenuTrigger>{node.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <h1 className="p-4 text-muted-foreground">
                      {node.subtitle}
                    </h1>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      {node.children.map(component => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          onClick={() =>
                            addNode(
                              node.title.toLowerCase() as AspectType,
                              component.nodeType
                            )
                          }
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          )}
        </div>
        <div className="flex items-center justify-center">
          {currentPage !== AppPage.Login && <ViewDashboard />}
          {currentPage === AppPage.Home && nodes.length > 0 && (
            <>
              <Reset />
              <DownloadNodes />
            </>
          )}
          {currentPage === AppPage.Home && <UploadFiles />}
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
