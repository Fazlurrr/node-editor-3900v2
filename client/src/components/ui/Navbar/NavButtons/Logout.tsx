import { LogOut, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../Misc/tooltip';
import { buttonVariants } from '@/lib/config';
import { Button } from '@/components/ui/Misc/button';
import { useSession } from '@/hooks';
import { useState } from 'react';
import { useTheme } from '@/hooks';

const LogoutConfirm = () => {
  const { logout } = useSession();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div 
        className="flex items-center justify-center rounded-sm p-3 hover:bg-muted"
        onClick={() => setOpen(true)}
      >
        <LogOut className="size-4 hover:cursor-pointer" />
        <span className="sr-only">Log out</span>
      </div>

      {open && (
        <>
          <div 
            className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} bg-opacity-50 fixed inset-0 z-40`}
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 bg-white dark:bg-[#232528] shadow-xl rounded-lg z-50 border border-[#9facbc]">
            <div className='flex justify-between items-center mb-4 p-2 pl-4 border-b border-[#9facbc] font-bold dark:text-white'>
              Confirm Logout
              <span className="cursor-pointer" title='Close' onClick={() => setOpen(false)}>
                <X size={18} className="dark:text-[#9facbc] hover:dark:text-white" />
              </span>
            </div>
            <div className='p-4'>
              <div className='flex justify-center text-center'>
                <h1 className='dark:text-[#9facbc]'>
                  Are you sure you want to log out?<br />
                  All unsaved changes will be lost.
                </h1>
              </div>
              <div className="flex justify-center mt-6 gap-4">
                <Button
                  className={`w-1/4 ${buttonVariants.cancel}`}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className={`w-1/4 ${buttonVariants.confirm}`}
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
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