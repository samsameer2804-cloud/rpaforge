import React, { useState, useCallback, useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { FiX, FiCheck, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

import StatusBar from '../CodeEditor/StatusBar';
import CodeToolbar from '../CodeEditor/CodeToolbar';
import SnippetPanel from '../CodeEditor/SnippetPanel';
import VariablesPanel from '../CodeEditor/VariablesPanel';
import { useRPACompletions } from '../CodeEditor/hooks/useRPACompletions';
import { useVariableStore } from '../../stores/variableStore';
import type { Snippet } from '../CodeEditor/data/snippets';

interface PythonCodeEditorProps {
  isOpen: boolean;
  code: string;
  onClose: () => void;
  onSave: (code: string) => void;
  title?: string;
}

const PythonCodeEditor: React.FC<PythonCodeEditorProps> = ({
  isOpen,
  code: initialCode,
  onClose,
  onSave,
  title = 'Edit Python Code',
}) => {
  const [code, setCode] = useState(initialCode);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSnippetPanelOpen, setIsSnippetPanelOpen] = useState(false);
  const [isVariablesPanelOpen, setIsVariablesPanelOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [isDirty, setIsDirty] = useState(false);

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);

  const { activities, registerCompletions } = useRPACompletions();
  const variables = useVariableStore((state) => state.variables);

  const closeAllPanels = useCallback(() => {
    setIsSnippetPanelOpen(false);
    setIsVariablesPanelOpen(false);
  }, []);

  const handleSave = useCallback(() => {
    onSave(code);
    setIsDirty(false);
    onClose();
  }, [code, onSave, onClose]);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      monaco.languages.register({ id: 'python' });

      monaco.languages.setMonarchTokensProvider('python', {
        defaultToken: '',
        tokenPostfix: '.python',
        keywords: [
          'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
          'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
          'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
          'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
          'while', 'with', 'yield', 'print',
        ],
        builtins: [
          'abs', 'all', 'any', 'bin', 'bool', 'bytearray', 'bytes', 'callable',
          'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir',
          'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float', 'format',
          'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex',
          'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len',
          'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object',
          'oct', 'open', 'ord', 'pow', 'property', 'range', 'repr', 'reversed',
          'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str',
          'sum', 'super', 'tuple', 'type', 'vars', 'zip', '__import__',
        ],
        operators: [
          '+', '-', '*', '**', '/', '//', '%', '@', '<<', '>>', '&', '|', '^',
          '~', '<', '>', '<=', '>=', '==', '!=', '=', '+=', '-=', '*=', '/=',
          '//=', '%=', '**=', '@=', '&=', '|=', '^=', '>>=', '<<=',
        ],
        symbols: /[=><!~?:&|+\-*^%]+/,
        escapes: /\\(?:[abfnrtv"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        tokenizer: {
          root: [
            [/[a-zA-Z_]\w*/, {
              cases: {
                '@keywords': 'keyword',
                '@builtins': 'type.identifier',
                '@default': 'identifier',
              },
            }],
            { include: '@whitespace' },
            [/[{}()[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, {
              cases: {
                '@operators': 'operator',
                '@default': '',
              },
            }],
            [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/0[oO][0-7]+/, 'number.octal'],
            [/0[bB][01]+/, 'number.binary'],
            [/\d+/, 'number'],
            [/[;,.]/, 'delimiter'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string_double'],
            [/'/, 'string', '@string_single'],
            [/f"/, 'string', '@fstring_double'],
            [/f'/, 'string', '@fstring_single'],
          ],
          whitespace: [
            [/[ \t\r\n]+/, ''],
            [/#.*$/, 'comment'],
            [/'''/, 'comment', '@docstring_single'],
            [/"""/, 'comment', '@docstring_double'],
          ],
          docstring_single: [
            [/[^']+/, 'comment'],
            [/'''/, 'comment', '@pop'],
            [/'/, 'comment'],
          ],
          docstring_double: [
            [/[^"]+/, 'comment'],
            [/"""/, 'comment', '@pop'],
            [/"/, 'comment'],
          ],
          string_double: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, 'string', '@pop'],
          ],
          string_single: [
            [/[^\\']+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/'/, 'string', '@pop'],
          ],
          fstring_double: [
            [/[^\\{}"]+/, 'string'],
            [/{/, 'delimiter.bracket', '@fstring_expr'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, 'string', '@pop'],
          ],
          fstring_single: [
            [/[^\\{}']+/, 'string'],
            [/{/, 'delimiter.bracket', '@fstring_expr'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/'/, 'string', '@pop'],
          ],
          fstring_expr: [
            [/\}/, 'delimiter.bracket', '@pop'],
            { include: '@root' },
          ],
        },
      });

      monaco.editor.setTheme('vs-dark');

      editor.onDidChangeCursorPosition((e) => {
        setCursorPosition({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      });
    },
    []
  );

  useEffect(() => {
    if (monacoRef.current && activities.length > 0) {
      const dispose = registerCompletions(monacoRef.current);
      return dispose;
    }
  }, [activities, registerCompletions]);

  const handleFind = useCallback(() => {
    editorRef.current?.getAction('actions.find')?.run();
  }, []);

  const handleReplace = useCallback(() => {
    editorRef.current?.getAction('editor.action.startFindReplaceAction')?.run();
  }, []);

  const handleFormat = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentCode = editor.getValue();

    try {
      const result = await window.rpaforge?.editor.formatCode(currentCode);
      if (result && result.formatted_code !== currentCode) {
        const position = editor.getPosition();
        editor.setValue(result.formatted_code);
        if (position) {
          editor.setPosition(position);
        }
        setCode(result.formatted_code);
      }
    } catch (error) {
      console.error('Format failed:', error);
    }
  }, []);

  const handleInsertSnippet = useCallback((snippet: Snippet) => {
    const editor = editorRef.current;
    if (!editor) return;

    const position = editor.getPosition();
    if (!position) return;

    const range = {
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    };

    editor.executeEdits('', [
      {
        range,
        text: snippet.insertText,
      },
    ]);

    editor.focus();
  }, []);

  const handleInsertVariable = useCallback((name: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const position = editor.getPosition();
    if (!position) return;

    const range = {
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    };

    editor.executeEdits('', [
      {
        range,
        text: name,
      },
    ]);

    editor.focus();
    setIsVariablesPanelOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    },
    [onClose, handleSave]
  );

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCode(value || '');
    setIsDirty(value !== initialCode);
  }, [initialCode]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        isMaximized ? '' : 'p-4'
      }`}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col ${
          isMaximized ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[85vh]'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? (
                <FiMinimize2 className="w-5 h-5" />
              ) : (
                <FiMaximize2 className="w-5 h-5" />
              )}
            </button>
            <button
              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
              onClick={handleSave}
            >
              <FiCheck className="w-4 h-4" />
              Save
            </button>
            <button
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
              onClick={onClose}
            >
              <FiX className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>

        <div className="relative flex flex-col border-b border-slate-200 dark:border-slate-700">
          <CodeToolbar
            onFind={handleFind}
            onReplace={handleReplace}
            onFormat={handleFormat}
            onOpenSnippets={() => {
              closeAllPanels();
              setIsSnippetPanelOpen(true);
            }}
            onOpenVariables={() => {
              closeAllPanels();
              setIsVariablesPanelOpen(true);
            }}
            isSnippetPanelOpen={isSnippetPanelOpen}
            isVariablesPanelOpen={isVariablesPanelOpen}
            variableCount={variables.length}
          />
          <SnippetPanel
            isOpen={isSnippetPanelOpen}
            onClose={() => setIsSnippetPanelOpen(false)}
            onInsertSnippet={handleInsertSnippet}
          />
          <VariablesPanel
            isOpen={isVariablesPanelOpen}
            onInsertVariable={handleInsertVariable}
          />
        </div>

        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              folding: true,
              renderLineHighlight: 'line',
              tabSize: 4,
              insertSpaces: true,
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
            }}
            onMount={handleEditorDidMount}
          />
        </div>

        <StatusBar
          line={cursorPosition.line}
          column={cursorPosition.column}
          encoding="UTF-8"
          language="Python"
          isSaved={!isDirty}
        />
      </div>
    </div>
  );
};

export default PythonCodeEditor;
