import { LogOut } from 'lucide-react';
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
import { buttonVariants } from '@/lib/config';

import { useSession } from '@/hooks';

const LogoutConfirm = () => {
  const { logout } = useSession();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex items-center justify-center rounded-sm p-3 hover:bg-muted">
          <LogOut className="size-4 hover:cursor-pointer" />
          <span className="sr-only">Log out</span>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          <AlertDialogDescription>
          All unsaved changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
                  <AlertDialogCancel className={buttonVariants.cancel}>    
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => logout()} className={buttonVariants.confirm}>
                    Continue
                  </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const Logout = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <LogoutConfirm />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs text-gray-500 dark:text-gray-400">Log out</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Logout;
