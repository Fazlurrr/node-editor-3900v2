import { storeSelector, useConnection, useStore } from '@/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

import { EdgeType, NodeRelation } from '@/lib/types';
import { addEdge, cn } from '@/lib/utils';
import { buttonVariants } from '@/lib/config';
import { Button } from './button';
import { shallow } from 'zustand/shallow';
import toast from 'react-hot-toast';

const SelectConnection = () => {
  const { dialogOpen, edgeType, setEdgeType, params, closeDialog } =
    useConnection();
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
          `${sourceNode.data.customName ?? sourceNode.id} is already part of ${partOfNode?.data?.customName ?? sourceNode?.data?.directPartOf}`
        );
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

    // Only possible for block to block connections
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

    await addEdge(edgeType, newNodeRelations, false);
    closeDialog();
  };

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
              `${buttonVariants.edge} border-green-400 text-green-400 hover:bg-green-400 `,
              {
                'border-transparent bg-green-400 text-white':
                  edgeType === EdgeType.Part,
              }
            )}
            onClick={() => setEdgeType(EdgeType.Part)}
          >
            Part of
          </button>
          <button
            className={cn(
              `${buttonVariants.edge} border-dotted border-amber-300 text-amber-300 hover:bg-amber-300`,
              {
                'border-transparent bg-amber-300 text-white':
                  edgeType === EdgeType.Fulfilled,
              }
            )}
            onClick={() => setEdgeType(EdgeType.Fulfilled)}
          >
            Fulfilled by
          </button>
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
