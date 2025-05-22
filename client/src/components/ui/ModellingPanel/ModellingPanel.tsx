import React from 'react';
import { AspectType, NavItem, NodeType } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RelationsMenu from './RelationsMenu';

const navItems: NavItem[] = [
    {
        title: 'Function',
        aspect: AspectType.Function,
        subtitle: 'Add new function to editor',
        children: [
            {
                title: 'Block',
                description:
                    'Any entity at any abstraction level. Abstraction mechanism',
                nodeType: NodeType.Block,
            },
            {
                title: 'Terminal',
                description: 'Block port. Point where medium passes the block boundary',
                nodeType: NodeType.Terminal,
            },
            {
                title: 'Connector',
                description:
                    'Block connection. Abstracted block with infinitesimal boundary',
                nodeType: NodeType.Connector,
            },
        ],
    },
    {
        title: 'Product',
        aspect: AspectType.Product,
        subtitle: 'Add new product to editor',
        children: [
            {
                title: 'Block',
                description:
                    'Any entity at any abstraction level. Abstraction mechanism',
                nodeType: NodeType.Block,
            },
            {
                title: 'Terminal',
                description: 'Block port. Point where medium passes the block boundary',
                nodeType: NodeType.Terminal,
            },
            {
                title: 'Connector',
                description:
                    'Block connection. Abstracted block with infinitesimal boundary',
                nodeType: NodeType.Connector,
            },
        ],
    },
    {
        title: 'Location',
        aspect: AspectType.Location,
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
        ],
    },
    {
        title: 'Installed',
        aspect: AspectType.Installed,
        subtitle: 'Add installed node to editor',
        children: [
            {
                title: 'Block',
                description:
                    'Any entity at any abstraction level. Abstraction mechanism',
                nodeType: NodeType.Block,
            },
            {
                title: 'Terminal',
                description: 'Block port. Point where medium passes the block boundary',
                nodeType: NodeType.Terminal,
            },
            {
                title: 'Connector',
                description:
                    'Block connection. Abstracted block with infinitesimal boundary',
                nodeType: NodeType.Connector,
            },
        ],
    },
    {
        title: 'No Aspect',
        aspect: AspectType.NoAspect,
        subtitle: 'Add empty node to editor',
        children: [
            {
                title: 'Block',
                description:
                    'Any entity at any abstraction level. Abstraction mechanism',
                nodeType: NodeType.Block,
            },
            {
                title: 'Terminal',
                description: 'Block port. Point where medium passes the block boundary',
                nodeType: NodeType.Terminal,
            },
            {
                title: 'Connector',
                description:
                    'Block connection. Abstracted block with infinitesimal boundary',
                nodeType: NodeType.Connector,
            },
        ],
    },
    {
        title: 'Unspecified Aspect',
        aspect: AspectType.UnspecifiedAspect,
        subtitle: 'Add unspecified aspect node to editor',
        children: [
            {
                title: 'Block',
                description:
                    'Any entity at any abstraction level. Abstraction mechanism',
                nodeType: NodeType.Block,
            },
            {
                title: 'Terminal',
                description: 'Block port. Point where medium passes the block boundary',
                nodeType: NodeType.Terminal,
            },
            {
                title: 'Connector',
                description:
                    'Block connection. Abstracted block with infinitesimal boundary',
                nodeType: NodeType.Connector,
            },
        ],
    },
];

const getAspectColor = (aspect: AspectType) => {
    switch (aspect) {
        case AspectType.Function:
            return '#ffff00';
        case AspectType.Product:
            return '#00ffff';
        case AspectType.Location:
            return '#ff00ff';
        case AspectType.Installed:
            return '#424bb2';
        case AspectType.NoAspect:
            return '#ffffff';
        case AspectType.UnspecifiedAspect:
            return '#cccccc';
    }
};

interface ModellingPanelProps {
  collapsed: boolean;
}

const ModellingPanel: React.FC<ModellingPanelProps> = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType, aspect: AspectType) => {
    const dragPreview = document.createElement("div");
    if (nodeType === NodeType.Block) {
      dragPreview.style.width = "110px";
      dragPreview.style.height = "66px";
    } else if (nodeType === NodeType.Terminal) {
      dragPreview.style.width = "22px";
      dragPreview.style.height = "22px";
    } else if (nodeType === NodeType.Connector) {
      dragPreview.style.width = "44px";
      dragPreview.style.height = "44px";
    }
    dragPreview.style.backgroundColor = getAspectColor(aspect);
    dragPreview.style.border = "1px solid black";
    dragPreview.style.borderRadius = nodeType === NodeType.Connector ? "50%" : "0";
    dragPreview.style.opacity = "0.7";

    document.body.appendChild(dragPreview);

    event.dataTransfer.setDragImage(dragPreview, 0, 0);

    setTimeout(() => document.body.removeChild(dragPreview), 0);

    // Set the drag data
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ nodeType, aspect })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const [collapseElements, setCollapseElements] = React.useState(false);
  const [collapseRelations, setCollapseRelations] = React.useState(false);

  const toggleElements = () => {
    setCollapseElements(!collapseElements);
  };

  const toggleRelations = () => {
    setCollapseRelations(!collapseRelations);
  };

  return (
    <div className="h-full w-full text-white border-r border-[#9facbc] bg-white dark:bg-navbar-dark
        overflow-y-auto
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-white
        [&::-webkit-scrollbar-thumb]:bg-gray-200
        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
        [scrollbar-width:thin]
        [scrollbar-color:lightGray_transparent]">
      <div className="pb-2 pl-4 pt-2 mb-2 border-b border-[#9facbc]" onClick={toggleElements}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg text-black dark:text-white font-semibold">Elements</h1>
          {collapseElements
            ? <ChevronUp className="text-black dark:text-white size-5 hover:cursor-pointer mr-2" />
            : <ChevronDown className="text-black dark:text-white size-5 hover:cursor-pointer mr-2" />}
        </div>
      </div>
      {!collapseElements && (
        <>
          {navItems.map((node) => (
            <div key={node.title} className="mb-1 border-b border-[#9facbc]">
              <h2 className="ml-4 text-sm text-black dark:text-white">{node.title}</h2>
              <div className="flex justify-center gap-2">
                {node.children.map((component) => (
                  <span
                    key={component.title}
                    className="flex items-center w-16 h-16 text-left text-black hover:bg-gray-200 cursor-pointer"
                    title={component.title}
                    draggable
                    onDragStart={(event) =>
                      onDragStart(event, component.nodeType, node.aspect)
                    }
                  >
                    {component.nodeType === NodeType.Block && (
                      <span
                        className="block ml-3 w-10 h-10 border border-black"
                        style={{ backgroundColor: getAspectColor(node.aspect) }}
                      />
                    )}
                    {component.nodeType === NodeType.Terminal && (
                      <span
                        className="relative ml-2 w-8 h-8 border-dashed border-2 border-gray-400"
                      >
                        <span
                          className="absolute top-1/2 left-7 transform -translate-y-1/2 w-4 h-4 border border-black"
                          style={{ backgroundColor: getAspectColor(node.aspect) }}
                        />
                      </span>
                    )}
                    {component.nodeType === NodeType.Connector && (
                      <span
                        className="block ml-5 w-6 h-6 border border-black rounded-full"
                        style={{ backgroundColor: getAspectColor(node.aspect) }}
                      />
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
      <div className="pt-1 pb-2 pl-4 mt-0 mb-2 border-b border-[#9facbc]" onClick={toggleRelations}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg text-black dark:text-white font-semibold">Relations</h1>
          {collapseRelations
            ? <ChevronUp className="text-black dark:text-white size-5 hover:cursor-pointer mr-2" />
            : <ChevronDown className="text-black dark:text-white size-5 hover:cursor-pointer mr-2" />}
        </div>
      </div>
      {!collapseRelations && <RelationsMenu />}
    </div>
  );
};

export default ModellingPanel;
