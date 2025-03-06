import { Button } from '../../button';
import { buttonVariants } from '@/lib/config.ts';
import { deleteEdges } from '@/api/edges';
import { deleteNodes } from '@/api/nodes';
import { toast } from 'react-toastify';

interface ResetEditorProps {
    close: () => void;
}

const ResetEditor: React.FC<ResetEditorProps> = ({close}) => {
    const reset = async () => {
        const deletedNodes = await deleteNodes();
        const deletedEdges = await deleteEdges();
    
        if (deletedNodes && deletedEdges) {
          toast.success('Editor reset');
        }
      };
    return (
        <div className='p-4'>
            <div className='flex justify-center text-center'>
                <div>
                    <h1 className='font-semibold'>Are you sure you want to reset the editor?</h1>
                    <p>Go to "Export File" to save your progress</p>
                </div>
            </div>
            <div className="flex justify-center mt-6 gap-4">
                <Button
                    className={`w-1/4 ${buttonVariants.cancel}`}
                    onClick={close}
                >
                    Cancel
                </Button>
                <Button
                    className={`w-1/4 ${buttonVariants.danger}`}
                    onClick={() => { reset(); close(); }}
                >
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default ResetEditor;