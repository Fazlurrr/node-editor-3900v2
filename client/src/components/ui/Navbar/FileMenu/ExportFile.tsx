import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Misc/button';
import { buttonVariants } from '@/lib/config.ts';
import { downloadFile } from '@/lib/utils/download';
import { TextField, MenuItem } from '@mui/material';
import DownloadImage from './DownloadImage';


interface ExportFileProps {
    close: () => void;
}

const ExportFile: React.FC<ExportFileProps> = ({close}) => {

  const [fileName, setFileName] = useState<string>('Untitled');
  const [fileType, setFileType] = useState<string>('imf');

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && fileType !== 'png' && fileType !== 'svg') {
          downloadFile(fileType, fileName);
        }
        if (event.key === 'Escape') {
          close();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [fileType, fileName, close]);

    return (
        <div className='p-4'>
            <div className='flex items-center  gap-4'>
                <TextField
                    label="Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter file name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className=" dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                    dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                    dark:[&_.MuiInputBase-input]:text-[#9facbc]
                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                    dark:[&_.MuiInputLabel-root]:text-white
                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white"
                />
                <TextField
                    select
                    label="File Type"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    variant="outlined"
                    size="small"
                    className="w-1/3 dark:[&_.MuiOutlinedInput-notchedOutline]:border-[#9facbc] 
                    dark:[&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:border-white 
                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-white
                    dark:[&_.MuiInputBase-input]:text-[#9facbc]
                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputBase-input]:text-white
                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputBase-input]:text-white
                    dark:[&_.MuiInputLabel-root]:text-white
                    dark:[&_.MuiOutlinedInput-root:hover_.MuiInputLabel-root]:text-white
                    dark:[&_.MuiOutlinedInput-root.Mui-focused_.MuiInputLabel-root]:text-white"
                >
                    <MenuItem value="imf">.imf</MenuItem>
                    <MenuItem value="rdf">.rdf</MenuItem>
                    <MenuItem value="png">.png</MenuItem>
                    <MenuItem value="svg">.svg</MenuItem>
                </TextField>
            </div>
          
          <div className="flex justify-center mt-4 gap-4">
            <Button
              className={`w-1/4 ${buttonVariants.cancel}`}
              onClick={close}
            >
                Cancel
            </Button>
            {fileType === 'png' || fileType === 'svg' ? (
              <DownloadImage fileName={fileName} fileType={fileType} />
            ) : (
              <Button
              className={`w-1/4 ${buttonVariants.confirm}`}
              onClick={() => downloadFile(fileType, fileName)}
              disabled={!fileName.trim()}
              >
              Export
              </Button>
            )}
          </div>
        </div>
    );
};

export default ExportFile;