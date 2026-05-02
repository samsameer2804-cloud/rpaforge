import React, { useEffect, useRef } from 'react';

interface SelectorEditorProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
}

const SelectorEditor: React.FC<SelectorEditorProps> = ({
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 500,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (onDebouncedChange) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onDebouncedChange(newValue);
      }, debounceMs);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
        Selector (XPath or CSS)
      </label>
      <textarea
        className="w-full h-20 px-3 py-2 text-xs font-mono rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
        placeholder="//button[@id='submit'] or .submit-btn"
        value={value}
        onChange={handleChange}
        spellCheck={false}
      />
    </div>
  );
};

export default SelectorEditor;
