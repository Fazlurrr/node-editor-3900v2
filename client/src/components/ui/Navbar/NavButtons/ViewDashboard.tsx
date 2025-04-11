import { Users, User } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../Misc/tooltip';
import { useSession } from '@/hooks';

const ViewDashboard = () => {
  const { setDashboard, user } = useSession();

  if (!user) return null;

  const handleSetDashboard = () => {
    setDashboard(true);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div 
            className="flex items-center justify-center rounded-sm p-3 hover:bg-muted"
            onClick={handleSetDashboard}
          >
            {user.role === 'admin' && (
              <Users
                className="size-4 hover:cursor-pointer"
              />
            )}
            {user.role === 'user' && (
              <User
                className="size-4 hover:cursor-pointer"
              />
            )}
            <span className="sr-only">Dashboard</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ViewDashboard;
