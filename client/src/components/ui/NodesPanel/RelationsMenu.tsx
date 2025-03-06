import { storeSelector, useConnection, useStore } from '@/hooks';
import { EdgeType, NodeRelation } from '@/lib/types';
import { addEdge } from '@/lib/utils/edges';
import { shallow } from 'zustand/shallow';
import { toast } from 'react-toastify';
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

      useEffect(() => {
        setEdgeType(EdgeType.Topology);
      }, [setEdgeType]);

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

  const relationButton = "w-1/2 text-center text-black dark:text-white p-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700";
  const activeRelationButton = "bg-gray-200 dark:bg-gray-700";

  return (
    <div className="flex flex-wrap justify-between">
      <button
        className={`${relationButton} ${edgeType === EdgeType.Topology ? activeRelationButton : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Topology)}
      >
        Connected to
        <svg viewBox="0 0 32 8" className="w-8 h-4 mx-auto mt-1">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M0 4 L30 4"
            fill="none"
          />
        </svg>
      </button>
      <button
        className={`${relationButton} ${edgeType === EdgeType.Transfer ? activeRelationButton : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Transfer)}
      >
        Transferred to
        <svg viewBox="0 0 32 8" className="w-8 h-4 mx-auto mt-1">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M0 4 L24 4"
            fill="none"
          />
          <polygon 
            points="0,0 6,2.8 0,5.6"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            transform="translate(24 1.2)"
          />
        </svg>
      </button>
      <button
        className={`${relationButton} ${edgeType === EdgeType.Part ? activeRelationButton : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Part)}
      >
        Part of
        <svg viewBox="0 0 32 8" className="w-8 h-4 mx-auto mt-1">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M0 4 L24 4"
            fill="none"
          />
          <polygon 
            points="4.5,0 9,2.8 4.5,5.6 0,2.8"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            transform="translate(22 1.2)"
          />
        </svg>
      </button>
      <button
        className={`${relationButton} ${edgeType === EdgeType.Specialization ? activeRelationButton : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Specialization)}
      >
        Specialization
        <svg viewBox="0 0 32 8" className="w-8 h-4 mx-auto mt-1">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M0 4 L24 4"
            fill="none"
          />
          <polygon 
            points="0,0 6,2.8 0,5.6"
            fill="white"
            stroke="currentColor"
            strokeWidth="1"
            transform="translate(24 1.2)"
            className="dark:fill-black"
          />
        </svg>
      </button>
      <button
        className={`${relationButton} ${edgeType === EdgeType.Fulfilled ? activeRelationButton : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Fulfilled)}
      >
        Fulfills
        <svg viewBox="0 0 32 8" className="w-8 h-4 mx-auto mt-1">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M0 4 L24 4"
            fill="none"
            strokeDasharray="5"
          />
          <polygon 
            points="0,0 6,2.8 0,5.6"
            fill="white"
            stroke="currentColor"
            strokeWidth="1"
            transform="translate(24 1.2)"
            className="dark:fill-black"
          />
        </svg>
      </button>
      <button
        className={`${relationButton} ${edgeType === EdgeType.Proxy ? activeRelationButton : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Proxy)}
      >
        Proxy
        <svg viewBox="0 0 32 8" className="w-8 h-4 mx-auto mt-1">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M0 4 L30 4"
            fill="none"
            strokeDasharray="2"
          />
        </svg>
      </button>
      <button
        className={`${relationButton} ${edgeType === EdgeType.Projection ? activeRelationButton : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Projection)}
      >
        Projection
        <svg viewBox="0 0 32 8" className="w-8 h-4 mx-auto mt-1">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M0 4 L24 4"
            fill="none"
            strokeDasharray="2"
          />
          <polygon 
            points="0,0 6,2.8 0,5.6"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            transform="translate(24 1.2)"
          />
        </svg>
      </button>
      <button
        className={`${relationButton} ${edgeType === EdgeType.Equality ? activeRelationButton : ''}`}
        onClick={() => handleEdgeTypeSelection(EdgeType.Equality)}
      >
        Same as
        <svg viewBox="0 0 32 8" className="w-8 h-4 mx-auto mt-1">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M0 2 L30 2"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M0 5 L30 5"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
};

export default RelationsMenu;