import React from 'react';
import { addNode } from '@/lib/utils/nodes';
import { AspectType, NavItem, NodeType } from '@/lib/types';

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
        subtitle: 'Add new location to editor',
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
        title: 'Installed',
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
        case AspectType.Empty:
            return '#cccccc';
    }
}

const NodesPanel: React.FC = () => {
        return (
            <div className="h-full w-56 text-white border border-[#9facbc] bg-white dark:bg-navbar-dark fixed top-0 left-0 z-10">
                <div className="p-4 mt-14 mb-2 border-b border-[#9facbc]">
                    <h2 className="text-lg text-black font-semibold">Elements</h2>
                </div>
                {navItems.map((node) => (
                    <div key={node.title} className="mb-1 border-b border-[#9facbc]">
                        <h3 className="ml-4 text-black">{node.title}</h3>
                        <div className="flex justify-center gap-2 pb-2">
                            {node.children.map((component) => (
                                <button
                                    key={component.title}
                                    className="w-16 h-16 text-left text-black hover:bg-gray-200"
                                    onClick={() => addNode(node.title.toLowerCase() as AspectType, component.nodeType)}
                                >
                                    {component.nodeType === NodeType.Block && (
                                        <span className={`block ml-3 w-10 h-10 border border-black`} style={{ backgroundColor: getAspectColor(node.title.toLowerCase() as AspectType) }}></span>
                                    )}
                                    {component.nodeType === NodeType.Terminal && (
                                        <span className="block ml-3 w-8 h-8 border border-gray-400" style={{ backgroundColor: getAspectColor(node.title.toLowerCase() as AspectType) }}>
                                            <span className="block mt-2 ml-6 w-4 h-4 bg-[#ffff00] border border-black" style={{ backgroundColor: getAspectColor(node.title.toLowerCase() as AspectType) }}></span>
                                        </span>
                                    )}
                                    {component.nodeType === NodeType.Connector && (
                                        <span className="block ml-5 w-6 h-6 border border-black rounded-full" style={{ backgroundColor: getAspectColor(node.title.toLowerCase() as AspectType) }}></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
};

export default NodesPanel;
