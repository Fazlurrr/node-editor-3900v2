import { useHotkeys } from 'react-hotkeys-hook';

export const useKeyboardShortcuts = (
  selectedElement: any, 
  onTriggerDelete: () => void
) => {
  useHotkeys(
    'delete, backspace',
    (event) => {
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (selectedElement) {
        onTriggerDelete();
      }
    },
    { enableOnFormTags: false },
    [selectedElement]
  );
};
