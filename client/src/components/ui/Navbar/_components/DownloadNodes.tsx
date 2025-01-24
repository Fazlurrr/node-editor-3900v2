import { downloadZipFile } from '@/lib/utils/download';
import { DownloadCloud } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../tooltip';

const DownloadNodes = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div 
            className="flex items-center justify-center rounded-sm p-3 hover:bg-muted"
            onClick={downloadZipFile}
          >
            <DownloadCloud
              className="size-4 hover:cursor-pointer"
            />
            <span className="sr-only">Download</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Download nodes
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DownloadNodes;
