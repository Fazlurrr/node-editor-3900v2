import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../tooltip';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggleTheme = () => {
    // Toggle between 'light' og 'dark'
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme(newTheme);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div 
            className="flex items-center justify-center rounded-sm p-3 hover:bg-muted"
            onClick={handleToggleTheme}
          >
            <Moon
              className={`size-4 rotate-0 scale-100 transition-all ${theme === 'dark' ? 'dark:-rotate-90 dark:scale-0' : ''}`}
            />
            <Sun
              className={`absolute size-4 rotate-90 scale-0 transition-all ${theme === 'dark' ? 'dark:rotate-0 dark:scale-100' : ''}`}
            />
            <span className="sr-only">Toggle theme</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Toggle theme
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggle;
