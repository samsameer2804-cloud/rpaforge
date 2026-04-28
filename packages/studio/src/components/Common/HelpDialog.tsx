import React, { useEffect } from 'react';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: 'File',
    shortcuts: [
      { key: 'Ctrl+N', description: 'New process' },
      { key: 'Ctrl+O', description: 'Open process' },
      { key: 'Ctrl+S', description: 'Save process' },
      { key: 'Ctrl+Shift+S', description: 'Save as' },
    ],
  },
  {
    title: 'Edit',
    shortcuts: [
      { key: 'Ctrl+Z', description: 'Undo' },
      { key: 'Ctrl+Shift+Z', description: 'Redo' },
      { key: 'Ctrl+C', description: 'Copy selected' },
      { key: 'Ctrl+V', description: 'Paste' },
      { key: 'Ctrl+X', description: 'Cut selected' },
      { key: 'Ctrl+D', description: 'Duplicate selected' },
    ],
  },
  {
    title: 'Canvas',
    shortcuts: [
      { key: 'Ctrl+Space', description: 'Fit canvas to view' },
      { key: 'Delete', description: 'Delete selected node/edge' },
      { key: 'Tab', description: 'Select next node' },
      { key: 'Arrow keys', description: 'Move selected node' },
    ],
  },
  {
    title: 'Run',
    shortcuts: [
      { key: 'F5', description: 'Run process' },
      { key: 'F6', description: 'Pause process' },
      { key: 'F7', description: 'Resume process' },
      { key: 'F8', description: 'Stop process' },
    ],
  },
  {
    title: 'Debug',
    shortcuts: [
      { key: 'F9', description: 'Toggle breakpoint' },
    ],
  },
];

const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {group.title}
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {group.shortcuts.map(({ key, description }) => (
                    <tr key={key} className="border-t border-slate-100 dark:border-slate-700">
                      <td className="py-1.5 pr-4 w-40">
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs">
                          {key}
                        </kbd>
                      </td>
                      <td className="py-1.5 text-slate-600 dark:text-slate-300">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpDialog;
