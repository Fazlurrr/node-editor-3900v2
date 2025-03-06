import { Moon, Sun, Check } from 'lucide-react';
import { useTheme } from '@/hooks';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col w-full">
      {(['light', 'dark'] as const).map((item) => (
        <button
          key={item}
          className={`flex items-center justify-between p-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 
                      ${theme === item ? 'bg-blue-100 dark:bg-blue-900' : ''}`
                    }
          onClick={() => toggleTheme(item)}
        >
          <span className="flex items-center">
            {item === 'light' && <Sun className="w-4 h-4 text-yellow-400 mr-2" />}
            {item === 'dark' && <Moon className="w-4 h-4 text-gray-400 mr-2" />}
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </span>
          {theme === item && <Check className="w-4 h-4 text-green-400" />}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;



