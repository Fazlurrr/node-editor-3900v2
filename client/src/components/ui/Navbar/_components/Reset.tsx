import { Button } from '../../button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../tooltip';
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
} from '../../alert-dialog';
import { LucideMonitorX } from 'lucide-react';
import { deleteEdges } from '@/api/edges';
import { deleteNodes } from '@/api/nodes';
import toast from 'react-hot-toast';

const ResetConfirm = () => {
  const reset = async () => {
    const deletedNodes = await deleteNodes();
    const deletedEdges = await deleteEdges();

    if (deletedNodes && deletedEdges) {
      toast.success('Editor reset');
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          variant="outline"
          className="border-none bg-transparent"
          size="icon"
        >
          <LucideMonitorX className="size-4 hover:cursor-pointer" />
        </Button>
        <span className="sr-only">Reset</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to reset the editor?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will delete all edges and nodes in the editor.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => reset()}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const Reset = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <ResetConfirm />
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs text-gray-500 dark:text-gray-400">Reset editor</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default Reset;
