import { useState } from 'react';
import { Button } from '../../button';
import { buttonVariants } from '@/lib/config.ts';
import { downloadFile } from '@/lib/utils/download';
import { TextField, MenuItem } from '@mui/material';


const ExportFile: React.FC = () => {
    const [fileName, setFileName] = useState<string>('Untitled');
    const [fileType, setFileType] = useState<string>('imf');

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
                />
                <TextField
                    select
                    label="File Type"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    variant="outlined"
                    size="small"
                    className="w-1/4"
                >
                    <MenuItem value="imf">.imf</MenuItem>
                    <MenuItem value="rdf">.rdf</MenuItem>
                </TextField>
            </div>
          
          <div className="flex justify-center mt-4 gap-4">
            <Button
              className={`w-1/4 ${buttonVariants.cancel}`}
              onClick={() => setFileName('')}
            >
                Cancel
            </Button>
            <Button
              className={`w-1/4 ${buttonVariants.confirm}`}
              onClick={() => downloadFile(fileType, fileName)}
              disabled={!fileName.trim()}
            >
              Download
            </Button>
          </div>
        </div>
    );
};

export default ExportFile;