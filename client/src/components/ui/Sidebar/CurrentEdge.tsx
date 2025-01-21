import { EdgeType, type CustomEdgeProps } from '@/lib/types';
import { cn, displayNode, isBlock, isConnector } from '@/lib/utils';
import { updateNodeConnectionData } from '@/lib/utils/nodes';
import { FC } from 'react';
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../sheet';
import { Input } from '../input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; 
import { Button } from '../button';
import { buttonVariants } from '@/lib/config';
import { useSidebar, useStore } from '@/hooks';
import { deleteEdge, updateEdge } from '@/api/edges';
import { ScrollArea } from '../scroll-area';

interface Props {
  currentEdge: CustomEdgeProps;
}

const CurrentEdge: FC<Props> = ({ currentEdge }) => {
  const { openSidebar, closeSidebar } = useSidebar();
  const { nodes } = useStore();

  const sourceNode = nodes.find(node => node.id === currentEdge.source);
  const targetNode = nodes.find(node => node.id === currentEdge.target);

  const displayName = `Edge ${sourceNode?.data.customName ? sourceNode.data.customName : sourceNode?.data.label} -> ${targetNode?.data.customName ? targetNode.data.customName : targetNode?.data.label}`;

  const handleConnectionTypeChange = async (newEdgeType: EdgeType) => {
    const edge = await updateEdge(currentEdge.id as string, newEdgeType);
    if (edge) {
      await updateNodeConnectionData(
        currentEdge.source,
        currentEdge.target,
        currentEdge.type as EdgeType,
        newEdgeType
      );

      currentEdge.type = newEdgeType;
      closeSidebar();
      setTimeout(() => {
        openSidebar(currentEdge);
      }, 300);
    }
  };

  const handleDelete = async () => {
    await deleteEdge(currentEdge.id as string);

    closeSidebar();
  };

  const sourceNodeLabel =
    sourceNode?.data?.customName === ''
      ? sourceNode?.data?.label
      : sourceNode?.data?.customName;
  const targetNodeLabel =
    targetNode?.data?.customName === ''
      ? targetNode?.data?.label
      : targetNode?.data?.customName;

  const displayFulfilledBy =
    isBlock(sourceNode?.id as string) && isBlock(targetNode?.id as string);
  const displayConnectedTo =
    isConnector(sourceNode?.id as string) ||
    isConnector(targetNode?.id as string);

  return (
    <SheetContent className="bg:background z-40 flex flex-col ">
      <SheetHeader>
        <SheetTitle className="flex items-center uppercase dark:text-white">
          <Input
            disabled={true}
            value={displayName}
            className="border-none text-lg font-semibold text-foreground"
          />
        </SheetTitle>
        <SheetDescription>
          Created:{' '}
          {new Date(currentEdge.data?.createdAt as number).toLocaleString()}
        </SheetDescription>
        <SheetDescription>
          Updated:{' '}
          {new Date(currentEdge.data?.updatedAt as number).toLocaleString()}
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="h-full">
        <div className="my-4">
          <p className="mb-2 text-sm text-muted-foreground">Source node</p>
          <Button
            variant="ghost"
            onClick={() => displayNode(currentEdge.source)}
          >
            {sourceNodeLabel}
          </Button>
        </div>
        <div className="my-4">
          <p className="mb-2 text-sm text-muted-foreground">Connection type</p>
          <Select
            disabled={currentEdge.data.lockConnection}
            value={currentEdge.type}
            onValueChange={e => handleConnectionTypeChange(e as EdgeType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={currentEdge.type} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={EdgeType.Part}>Part of</SelectItem>
                <SelectItem
                  value={EdgeType.Connected}
                  className={cn('', {
                    hidden: !displayConnectedTo,
                  })}
                >
                  Connected to
                </SelectItem>
                <SelectItem
                  value={EdgeType.Fulfilled}
                  className={cn('', {
                    hidden: !displayFulfilledBy,
                  })}
                >
                  Fulfilled by
                </SelectItem>
                <SelectItem className="hidden" value={EdgeType.Transfer}>
                  Transfer
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="my-4">
          <p className="mb-2 text-sm text-muted-foreground">Target node</p>
          <Button
            variant="ghost"
            onClick={() => displayNode(currentEdge.target)}
          >
            {targetNodeLabel}
          </Button>
        </div>
      </ScrollArea>
      <SheetFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className={buttonVariants.danger}
              variant="outline"
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this edge?</AlertDialogTitle>
              <AlertDialogDescription>
              You can undo this action if needed. 
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetFooter>
    </SheetContent>
  );
};

export default CurrentEdge;
