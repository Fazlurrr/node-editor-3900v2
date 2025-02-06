import { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmationDialogProps {
  open: boolean;
  elementType: 'node' | 'edge';
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
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this {elementType}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {elementType === 'node'
              ? 'Any edges or references to this node will be deleted. You can undo this action if needed.'
              : 'This edge will be deleted. You can undo this action if needed.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter onKeyDown={handleKeyDown}>
          <AlertDialogCancel onClick={onCancel} ref={cancelButtonRef}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} ref={deleteButtonRef}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
