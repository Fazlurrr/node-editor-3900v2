import { useRef } from 'react';
import { Button } from './button';
import { buttonVariants } from '@/lib/config.ts';
import { X } from 'lucide-react';
import { useTheme } from '@/hooks';

interface DeleteConfirmationDialogProps {
  open: boolean;
  elementType: 'element' | 'relation';
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  elementType,
  onConfirm,
  onCancel,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();

      if (document.activeElement === cancelButtonRef.current) {
        deleteButtonRef.current?.focus();
      } else {
        cancelButtonRef.current?.focus();
      }
    }
  };

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
                      <p>{elementType === 'element'
                ? 'All relations and references to this node will be deleted. You can undo this action if needed.'
                : 'This relation will be deleted. You can undo this action if needed.'}</p>
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
