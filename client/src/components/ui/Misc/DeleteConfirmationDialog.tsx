import { useRef } from 'react';
import { Button } from './button';
import { buttonVariants } from '@/lib/config.ts';
import { X } from 'lucide-react';
import { useTheme } from '@/hooks';
import { useSettings } from '@/hooks/useSettings'
import { useHotkeys } from 'react-hotkeys-hook';

interface DeleteConfirmationDialogProps {
  open: boolean;
  elementType: 'relation' | 'element';
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  elementType,
  onConfirm,
  onCancel,
}) => {

  useHotkeys('esc', () => onCancel());
  useHotkeys(
    'enter',
    () => {
      onConfirm();
    },
    { preventDefault: true }
  );

  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const { confirmDeletion, setConfirmDeletion } = useSettings()

  return (
    <>
      {open && (
      <>
      <div 
      className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} bg-opacity-50 fixed inset-0 z-40`}
      onClick={onCancel}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 bg-white dark:bg-[#232528] shadow-xl rounded-lg z-50 border border-[#9facbc]">
        <div className='flex justify-between items-center mb-4 p-2 pl-4 border-b border-[#9facbc] font-bold'>
              Confirm Delete
            <span className="cursor-pointer" title='Close' onClick={onCancel}>
              <X size={18} />
            </span>
        </div>
        <div className='p-4'>
              <div className='flex justify-center text-center'>
                  <div>
                      <h1 className='font-semibold'>Are you sure you want to delete this {elementType}?</h1>
                        <div className='flex gap-2 items-center justify-center'>
                        <input
                          type="checkbox"
                          id="confirmDeletion"
                          checked={!confirmDeletion}
                          onChange={(e) => setConfirmDeletion(!e.target.checked)}
                        />
                        <p className='pb-0.5'>Don't show this again?</p>
                        </div>
                  </div>
              </div>
              <div className="flex justify-center mt-6 gap-4">
                  <Button
                      className={`w-1/4 ${buttonVariants.cancel}`}
                      onClick={onCancel} ref={cancelButtonRef}
                  >
                      Cancel
                  </Button>
                  <Button
                      className={`w-1/4 ${buttonVariants.danger}`}
                      onClick={onConfirm} ref={deleteButtonRef}
                  >
                      Delete
                  </Button>
              </div>
          </div>
      </div>
      </>
      )}
    </>
  );
};

export default DeleteConfirmationDialog;
