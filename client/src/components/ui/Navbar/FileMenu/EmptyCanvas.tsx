import { Button } from '../../button';
import { buttonVariants } from '@/lib/config.ts';
import { deleteEdges } from '@/api/edges';
import { deleteNodes } from '@/api/nodes';
import { toast } from 'react-toastify';

interface EmptyCanvasProps {
    close: () => void;
}

const EmptyCanvas: React.FC<EmptyCanvasProps> = ({close}) => {
    const reset = async () => {
        const deletedNodes = await deleteNodes();
        const deletedEdges = await deleteEdges();
    
        if (deletedNodes && deletedEdges) {
          toast.success('Editor reset');
        }
      };
    return (
        <div className='p-4'>
            <div className='flex justify-center'>
                <h1>Are you sure you want to reset the editor?</h1>
            </div>
            <div className="flex justify-center mt-4 gap-4">
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

export default EmptyCanvas;