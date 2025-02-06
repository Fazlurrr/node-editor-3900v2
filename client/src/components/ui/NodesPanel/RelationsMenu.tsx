import { storeSelector, useConnection, useStore } from '@/hooks';
import { EdgeType, NodeRelation } from '@/lib/types';
import { addEdge } from '@/lib/utils/edges';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const RelationsMenu: React.FC = () => {
    const {
        connecting,
        edgeType,
        setEdgeType,
        params,
        endConnection,
      } = useConnection();
    
      const { nodes } = useStore(storeSelector, shallow);
    
      const createNewConnection = async () => {
        const newNodeRelations: NodeRelation[] = [];
    
        if (edgeType === EdgeType.Part) {
          const sourceNode = nodes.find(node => node.id === params!.source);
    
          if (
            sourceNode?.data?.directPartOf &&
            sourceNode?.data?.directPartOf !== ''
          ) {
            const partOfNode = nodes.find(
              node => node.id === sourceNode?.data?.directPartOf
            );
    
            toast.error(
              `${sourceNode.data.customName === '' ? sourceNode.data.label : sourceNode.data.customName} is already part of ${partOfNode?.data?.customName === '' ? sourceNode?.data?.label : partOfNode?.data?.customName}`
            );
            endConnection();
            return;
          }
    
          newNodeRelations.push({
            nodeId: params!.target as string,
            relations: {
              directParts: {
                id: params!.source as string,
              },
              children: {
                id: params!.source as string,
              },
            },
          });
    
          newNodeRelations.push({
            nodeId: params!.source as string,
            relation: {
              parent: params!.target as string,
              directPartOf: params!.target as string,
            },
          });
        }
    
        if (edgeType === EdgeType.Connected) {
          newNodeRelations.push({
            nodeId: params!.source as string,
            relations: {
              connectedTo: {
                id: params!.target as string,
              },
            },
          });
    
          newNodeRelations.push({
            nodeId: params!.target as string,
            relations: {
              connectedBy: {
                id: params!.source as string,
              },
            },
          });
        }
    
        if (edgeType === EdgeType.Fulfilled) {
          newNodeRelations.push({
            nodeId: params!.source as string,
            relations: {
              fulfilledBy: {
                id: params!.target as string,
              },
            },
          });
    
          newNodeRelations.push({
            nodeId: params!.target as string,
            relations: {
              fulfills: {
                id: params!.source as string,
              },
            },
          });
        }
    
        await addEdge(edgeType as EdgeType, newNodeRelations, false);
        endConnection();
      };
    
      useEffect(() => {
        if (connecting && edgeType) {
          createNewConnection();
        }
      }, [connecting, edgeType]);
  const handleEdgeTypeSelection = (edgeType: EdgeType) => {
    setEdgeType(edgeType);
  };

  return (
    <div className="flex flex-wrap justify-between">
      <button
        className={`w-1/2 text-center text-black dark:text-white mb-1 p-1 text-sm hover:bg-gray-200 ${edgeType === EdgeType.Topology ? 'bg-gray-200' : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Topology)}
      >
        Topology
        <span className="block mx-auto mt-1 w-8 h-0.5 border-t border-black"></span>
      </button>
      <button
        className={`w-1/2 text-center text-black dark:text-white mb-1 p-1 text-sm hover:bg-gray-200 ${edgeType === EdgeType.Transfer ? 'bg-gray-200' : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Transfer)}
      >
        Media Transfer
        <span className="block mx-auto mt-1 w-8 h-0.5 border-t border-black"></span>
      </button>
      <button
        className={`w-1/2 text-center text-black dark:text-white mb-1 p-1 text-sm hover:bg-gray-200 ${edgeType === EdgeType.Part ? 'bg-gray-200' : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Part)}
      >
        Partonomy
        <span className="block mx-auto mt-1 w-8 h-0.5 border-t border-black"></span>
      </button>
      <button
        className={`w-1/2 text-center text-black dark:text-white mb-1 p-1 text-sm hover:bg-gray-200 ${edgeType === EdgeType.Specialization ? 'bg-gray-200' : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Specialization)}
      >
        Specialization
        <span className="block mx-auto mt-1 w-8 h-0.5 border-t border-black"></span>
      </button>
      <button
        className={`w-1/2 text-center text-black dark:text-white mb-1 p-1 text-sm hover:bg-gray-200 ${edgeType === EdgeType.Fulfilled ? 'bg-gray-200' : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Fulfilled)}
      >
        Fulfills
        <span className="block mx-auto mt-1 w-8 h-0.5 border-t border-dotted border-black"></span>
      </button>
      <button
        className={`w-1/2 text-center text-black dark:text-white mb-1 p-1 text-sm hover:bg-gray-200 ${edgeType === EdgeType.Proxy ? 'bg-gray-200' : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Proxy)}
      >
        Proxy
        <span className="block mx-auto mt-1 w-8 h-0.5 border-t border-dotted border-black"></span>
      </button>
      <button
        className={`w-1/2 text-center text-black dark:text-white mb-1 p-1 text-sm hover:bg-gray-200 ${edgeType === EdgeType.Projection ? 'bg-gray-200' : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Projection)}
      >
        Projection
        <span className="block mx-auto mt-1 w-8 h-0.5 border-t border-dotted border-black"></span>
      </button>
      <button
        className={`w-1/2 text-center text-black dark:text-white mb-1 p-1 text-sm hover:bg-gray-200 ${edgeType === EdgeType.Equality ? 'bg-gray-200' : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Equality)}
      >
        Equality
        <span className="block mx-auto mt-1 w-8 h-0.5 border-t border-black"></span>
        <span className="block mx-auto w-8 h-0.5 border-t border-black"></span>
      </button>
    </div>
  );
};

export default RelationsMenu;