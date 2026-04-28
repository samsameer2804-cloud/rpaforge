import React, { useState, useMemo } from 'react';
import { FiX, FiEye, FiEyeOff, FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import ConfirmDialog from '../Common/ConfirmDialog';
import { useDebuggerStore } from '../../stores/debuggerStore';
import { useVariableStore } from '../../stores/variableStore';
import type { Variable } from '../../types/engine';
import VariableDialog, { type VariableDefinition } from '../Designer/VariableDialog';

const VariableItem: React.FC<{
  variable: Variable;
  depth?: number;
  watched?: boolean;
  onToggleWatch?: () => void;
}> = ({ variable, depth = 0, watched = false, onToggleWatch }) => {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = variable.children && variable.children.length > 0;

  const valueDisplay = useMemo(() => {
    if (variable.value === null) return 'null';
    if (variable.value === undefined) return 'undefined';
    if (typeof variable.value === 'string') {
      const truncated = variable.value.length > 30
        ? variable.value.slice(0, 30) + '...'
        : variable.value;
      return `"${truncated}"`;
    }
    if (Array.isArray(variable.value)) {
      return `Array(${variable.value.length})`;
    }
    if (typeof variable.value === 'object') {
      const keys = Object.keys(variable.value);
      const preview = keys.slice(0, 3).join(', ');
      const suffix = keys.length > 3 ? ', ...' : '';
      return `{${preview}${suffix}}`;
    }
    return String(variable.value);
  }, [variable.value]);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'string':
        return 'text-green-500';
      case 'number':
      case 'integer':
      case 'float':
        return 'text-blue-500';
      case 'boolean':
        return 'text-orange-500';
      case 'list':
      case 'dict':
      case 'object':
        return 'text-purple-500';
      case 'none':
      case 'null':
        return 'text-slate-400';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="variable-item">
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          <span className={`w-4 text-slate-400 text-xs ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
        ) : (
          <span className="w-4" />
        )}
        <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
          {variable.name}
        </span>
        <span className={`text-xs ${getTypeColor(variable.type)}`}>{valueDisplay}</span>
        <span className="ml-auto text-xs text-slate-400">{variable.type}</span>
        {onToggleWatch && (
          <button
            className={`p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
              watched ? 'text-indigo-500' : 'text-slate-400'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatch();
            }}
            title={watched ? 'Remove from watch' : 'Add to watch'}
          >
            {watched ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
          </button>
        )}
      </div>
      {isExpanded && hasChildren && (
        <div className="variable-children">
          {variable.children!.map((child: Variable, index: number) => (
            <VariableItem
              key={`${child.name}-${index}`}
              variable={child}
              depth={depth + 1}
              watched={watched}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const VariablePanel: React.FC = () => {
  const {
    variables,
    watchedVariables,
    addWatchedVariable,
    removeWatchedVariable,
    clearWatchedVariables,
  } = useDebuggerStore();

  const { 
    variables: processVariables, 
    addVariable, 
    removeVariable 
  } = useVariableStore();
  
  const [activeTab, setActiveTab] = useState<'variables' | 'watch' | 'process'>('variables');
  const [showVariableDialog, setShowVariableDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const watchedVars = useMemo(() => {
    return variables.filter((v) => watchedVariables.has(v.name));
  }, [variables, watchedVariables]);

  const variableOptions = useMemo(
    () =>
      processVariables.map((variable) => ({
        name: variable.name,
        type: variable.type,
        scope: variable.scope,
        value: variable.value,
      })),
    [processVariables]
  );

  const handleToggleWatch = (name: string) => {
    if (watchedVariables.has(name)) {
      removeWatchedVariable(name);
    } else {
      addWatchedVariable(name);
    }
  };

  const handleCreateVariable = (definition: VariableDefinition) => {
    addVariable(definition);
  };

  const getScopeBadge = (scope: string) => {
    const colors: Record<string, string> = {
      process: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      task: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    };
    return (
      <span className={`px-1.5 py-0.5 text-xs rounded ${colors[scope] || colors.task}`}>
        {scope}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {showGuide && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs text-indigo-700 dark:text-indigo-300">
              <div className="flex items-center gap-1 font-medium mb-1">
                <FiInfo className="w-3 h-3" />
                Variable Panel Guide
              </div>
              <ul className="space-y-0.5 text-[11px] opacity-80">
                <li><strong>Runtime:</strong> Variables from current execution</li>
                <li><strong>Process:</strong> Project variables</li>
                <li><strong>Watch:</strong> Track specific variables</li>
              </ul>
            </div>
            <button
              className="text-indigo-400 hover:text-indigo-600"
              onClick={() => setShowGuide(false)}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-1">
          <button
            className={`px-2 py-1 text-sm rounded ${
              activeTab === 'variables'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('variables')}
          >
            Runtime
          </button>
          <button
            className={`px-2 py-1 text-sm rounded ${
              activeTab === 'process'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('process')}
          >
            Process ({processVariables.length})
          </button>
          <button
            className={`px-2 py-1 text-sm rounded ${
              activeTab === 'watch'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab('watch')}
          >
            Watch {watchedVariables.size > 0 && `(${watchedVariables.size})`}
          </button>
        </div>
        {!showGuide && (
          <button
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            onClick={() => setShowGuide(true)}
            title="Show guide"
          >
            <FiInfo className="w-4 h-4" />
          </button>
        )}
        <div className="flex gap-1">
          {(activeTab === 'process' || activeTab === 'variables') && (
            <button
              className="p-1 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded"
              onClick={() => setShowVariableDialog(true)}
              title="Create variable"
              aria-label="Create variable"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          )}
          {activeTab === 'watch' && watchedVariables.size > 0 && (
            <button
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
              onClick={clearWatchedVariables}
              title="Clear all watches"
              aria-label="Clear all watches"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'variables' ? (
          variables.length === 0 ? (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8 px-4">
              No runtime variables
              <div className="text-xs mt-1">Variables will appear during debugging</div>
              <button
                onClick={() => setShowVariableDialog(true)}
                className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs flex items-center gap-1 mx-auto"
              >
                <FiPlus className="w-3 h-3" />
                Create process variable
              </button>
            </div>
          ) : (
            <div className="py-2">
              {variables.map((variable, index) => (
                <VariableItem
                  key={`${variable.name}-${index}`}
                  variable={variable}
                  watched={watchedVariables.has(variable.name)}
                  onToggleWatch={() => handleToggleWatch(variable.name)}
                />
              ))}
            </div>
          )
        ) : activeTab === 'process' ? (
          processVariables.length === 0 ? (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8 px-4">
              No process variables defined
              <div className="text-xs mt-1">Define variables for your automation</div>
              <button
                onClick={() => setShowVariableDialog(true)}
                className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs flex items-center gap-1 mx-auto"
              >
                <FiPlus className="w-3 h-3" />
                Create variable
              </button>
            </div>
          ) : (
            <div className="py-2">
              {processVariables.map((variable) => (
                <div
                  key={variable.id}
                  className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 group"
                >
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                    {variable.name}
                  </span>
                  <span className="text-xs text-slate-500 truncate flex-1">
                    {variable.value || <span className="italic">empty</span>}
                  </span>
                  {getScopeBadge(variable.scope)}
                  <span className="text-xs text-slate-400">{variable.type}</span>
                  <button
                    onClick={() => setDeleteConfirmId(variable.id)}
                    className="p-0.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    title="Delete variable"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : watchedVars.length === 0 ? (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8 px-4">
            No watched variables
            <div className="text-xs mt-1">
              Click the eye icon on variables to add them to watch
            </div>
          </div>
        ) : (
          <div className="py-2">
            {watchedVars.map((variable, index) => (
              <VariableItem
                key={`${variable.name}-${index}`}
                variable={variable}
                watched
                onToggleWatch={() => handleToggleWatch(variable.name)}
              />
            ))}
          </div>
        )}
      </div>

      <VariableDialog
        isOpen={showVariableDialog}
        onClose={() => setShowVariableDialog(false)}
        onCreate={handleCreateVariable}
        existingVariables={processVariables.map((v) => v.name)}
        variables={variableOptions}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        title="Delete variable"
        message="Are you sure you want to delete this variable? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (deleteConfirmId) removeVariable(deleteConfirmId);
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default VariablePanel;
