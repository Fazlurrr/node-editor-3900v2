import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../../button';
import { Input } from '../../input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { buttonVariants } from '@/lib/config.ts';

import { downloadFile } from '@/lib/utils/download';
import { DownloadCloud } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../tooltip';
const DownloadNodesDialog = () => {
  const [fileName, setFileName] = useState<string>('Untitled');
  const [fileType, setFileType] = useState<string>('imf');
  
  return (
    <Dialog>
      <DialogTrigger>
      <div className="flex items-center justify-center rounded-sm p-3 hover:bg-muted">
          <DownloadCloud className="size-4 hover:cursor-pointer" />
          <span className="sr-only">Download File</span>
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center">
        <div>
          <DialogHeader>Download File</DialogHeader>
          <div className='flex flex-row gap-4 w-full'>
            <Input
          placeholder="Enter file name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
            />
            <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-1/4">.{fileType}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFileType("imf")}>.imf</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFileType("rdf")}>.rdf</DropdownMenuItem>
          </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            className={`w-1/2 mt-2 ${buttonVariants.confirm}`}
            onClick={() => downloadFile(fileType, fileName)}
            disabled={!fileName.trim()}
          >
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


const DownloadNodes = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <DownloadNodesDialog />
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
