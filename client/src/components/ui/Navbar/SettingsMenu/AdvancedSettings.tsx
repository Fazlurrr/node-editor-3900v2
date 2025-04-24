import React from 'react'
import { X } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/hooks';
import { useHotkeys } from 'react-hotkeys-hook'


interface AdvancedSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { confirmDeletion, setConfirmDeletion } = useSettings()
  const { theme } = useTheme();

  const handleClose = () => {
    onOpenChange(false)
  }

  useHotkeys('esc', () => handleClose());

  if (!open) {
    return null
  }

  return (
    <>
      <div
        className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} bg-opacity-50 fixed inset-0 z-40`} 
        onClick={handleClose}
      />
      <div
        className="
          fixed
          top-1/2 left-1/2
          transform -translate-x-1/2 -translate-y-1/2
          w-1/4
          bg-white dark:bg-[#232528]
          shadow-xl
          rounded-lg
          z-50
          border
          border-[#9facbc]
        "
      >
        <div
          className="
            flex
            justify-between
            items-center
            mb-4
            p-2
            pl-4
            border-b
            border-[#9facbc]
            font-bold
          "
        >
          Advanced Settings
          <span className="cursor-pointer" title="Close" onClick={handleClose}>
            <X size={18} />
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-2">
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
          <p className="text-sm text-gray-500">
            Enabling this setting will require you to confirm before any
            deletion action is performed. This helps prevent accidental
            deletions.
          </p>
        </div>
      </div>
    </>
  )
}

export default AdvancedSettingsModal
