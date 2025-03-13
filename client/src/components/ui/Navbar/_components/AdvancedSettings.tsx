import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useSettings } from '@/hooks/useSettings';

interface AdvancedSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({ open, onOpenChange }) => {
  const { confirmDeletion, setConfirmDeletion } = useSettings();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Advanced Settings</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <div className="flex items-center space-x-2">
            <label htmlFor="confirmDeletion" className="text-sm font-medium">
              Confirm Deletion
            </label>
            <input
              type="checkbox"
              id="confirmDeletion"
              checked={confirmDeletion}
              onChange={(e) => setConfirmDeletion(e.target.checked)}
            />
          </div>
          <div className="text-sm text-gray-500">
            Enabling this setting will require you to confirm before any deletion action is performed. This helps prevent accidental deletions.
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdvancedSettingsModal;
