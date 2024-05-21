import { Users, User } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../tooltip';
import { useSession } from '@/hooks';

const ViewDashboard = () => {
  const { setDashboard, user } = useSession();

  if (!user) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center justify-center rounded-sm p-3 hover:bg-muted">
            {user.role === 'admin' && (
              <Users
                onClick={() => setDashboard(true)}
                className="size-4 hover:cursor-pointer"
              />
            )}
            {user.role === 'user' && (
              <User
                onClick={() => setDashboard(true)}
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
