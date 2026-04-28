import { useEffect } from 'react';

export const KEYBOARD_SHORTCUTS = {
  COPY: { key: 'c', mod: true, description: 'Copy selected node' },
  PASTE: { key: 'v', mod: true, description: 'Paste copied node(s)' },
  CUT: { key: 'x', mod: true, description: 'Cut selected node' },
  DUPLICATE: { key: 'd', mod: true, description: 'Duplicate selected node' },
  UNDO: { key: 'z', mod: true, shift: false, description: 'Undo last action' },
  REDO_Y: { key: 'y', mod: true, description: 'Redo last undone action' },
  REDO_Z: { key: 'z', mod: true, shift: true, description: 'Redo last undone action (Shift+Z)' },
  QUICK_ADD: { key: ' ', mod: true, description: 'Open quick-add activity palette' },
  NAV_NEXT: { key: 'Tab', mod: false, description: 'Select next canvas node' },
  NAV_PREV: { key: 'Tab', mod: false, shift: true, description: 'Select previous canvas node' },
  NAV_CONFIRM: { key: 'Enter', mod: false, description: 'Confirm selected node (focus properties)' },
  NAV_ESCAPE: { key: 'Escape', mod: false, description: 'Clear canvas selection' },
};

export function useKeyboardShortcuts(handlers: Record<string, () => void>): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const inFormField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (inFormField) {
        return;
      }

      const isModKey = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (isModKey && key === 'c') {
        event.preventDefault();
        handlers['copy']?.();
      } else if (isModKey && key === 'v') {
        event.preventDefault();
        handlers['paste']?.();
      } else if (isModKey && key === 'x') {
        event.preventDefault();
        handlers['cut']?.();
      } else if (isModKey && key === 'd') {
        event.preventDefault();
        handlers['duplicate']?.();
      } else if (isModKey && !event.shiftKey && key === 'z') {
        event.preventDefault();
        handlers['undo']?.();
      } else if (isModKey && (key === 'y' || (event.shiftKey && key === 'z'))) {
        event.preventDefault();
        handlers['redo']?.();
      } else if (event.key === ' ' && isModKey) {
        event.preventDefault();
        handlers['quickAdd']?.();
      } else if (event.key === 'Tab' && !isModKey && !event.shiftKey) {
        event.preventDefault();
        handlers['navNext']?.();
      } else if (event.key === 'Tab' && !isModKey && event.shiftKey) {
        event.preventDefault();
        handlers['navPrev']?.();
      } else if (event.key === 'Enter' && !isModKey) {
        handlers['navConfirm']?.();
      } else if (event.key === 'Escape') {
        handlers['navEscape']?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
