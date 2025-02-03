import { storeSelector, useConnection, useStore } from '@/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

import { EdgeType, NodeRelation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { addEdge } from '@/lib/utils/edges';
import { buttonVariants } from '@/lib/config';
import { Button } from './button';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const SelectConnection = () => {
  const {
    dialogOpen,
    edgeType,
    setEdgeType,
    params,
    closeDialog,
    blockConnection,
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
    closeDialog();
  };

  useEffect(() => {
    setEdgeType(null);
  }, [dialogOpen, setEdgeType]);

  return (
    <Dialog open={dialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-muted-foreground">
            Select connection type
          </DialogTitle>
        </DialogHeader>
        <div className="flex h-full w-full flex-col items-center justify-center">
            <button
            className={cn(
              `${buttonVariants.edge} border-[#1A8923] text-[#1A8923] hover:bg-[#1A8923]`,
              {
              'border-transparent bg-[#1A8923] text-white':
                edgeType === EdgeType.Part,
              }
            )}
            onClick={() => setEdgeType(EdgeType.Part)}
            >
            Part of
            </button>
          {!blockConnection && (
            <button
              className={cn(
              `${buttonVariants.edge} border-[#016EF4] text-[#016EF4] hover:bg-[#016EF4]`,
              {
                'border-transparent bg-[#016EF4] text-white':
                edgeType === EdgeType.Connected,
              }
              )}
              onClick={() => setEdgeType(EdgeType.Connected)}
            >
              Connected to
            </button>
          )}
          {blockConnection && (
            <button
              className={cn(
              `${buttonVariants.edge} border-dotted border-[#D14600] text-[#D14600] hover:bg-[#D14600]`,
              {
                'border-transparent bg-[#D14600] text-white':
                edgeType === EdgeType.Fulfilled,
              }
              )}
              onClick={() => setEdgeType(EdgeType.Fulfilled)}
            >
              Fulfilled by
            </button>
          )}
          <Button
            onClick={() => {
              createNewConnection();
            }}
          >
            Create connection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectConnection;
