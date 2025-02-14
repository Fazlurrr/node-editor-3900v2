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
import { Bounce, toast, ToastContainer } from 'react-toastify';
import { buttonVariants } from '@/lib/config.ts';

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
      <AlertDialogTrigger asChild>
        <div className="flex items-center justify-center rounded-sm p-3 hover:bg-muted">
          <LucideMonitorX className="size-4 hover:cursor-pointer" />
          <span className="sr-only">Reset</span>
        </div>
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
          <AlertDialogCancel className={buttonVariants.cancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => reset()} className={buttonVariants.danger}>
            Reset
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
