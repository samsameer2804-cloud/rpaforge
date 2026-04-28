import React, { useState, useEffect, useMemo } from 'react';
import { FiPause, FiPlay, FiSquare, FiActivity, FiZap } from 'react-icons/fi';
import type { ExecutionState, ExecutionSpeed } from '../../stores/processStore';
import type { ProcessMetadata } from '../../stores/processStore';
import type { Capabilities } from '../../types/engine';
import type { BridgeState } from '../../types/events';
import { useFileStore } from '../../stores/fileStore';

const TIPS = [
  'Press Ctrl+Space to quick-add activities',
  'Drag edges between blocks to connect them',
  'Use Ctrl+C/V to copy and paste blocks',
  'Double-click a block to edit its properties',
  'Press F5 to run your process',
  'Add breakpoints to debug your workflow',
  'Use the Variable Panel to watch values',
  'Export your process as Python code',
  'Save your project with Ctrl+S',
];

interface StatusBarProps {
  activeTab: 'designer' | 'debugger' | 'console';
  bridgeState: BridgeState;
  capabilities: Capabilities | null;
  executionState: ExecutionState;
  executionSpeed: ExecutionSpeed;
  metadata: ProcessMetadata | null;
  showConsole: boolean;
  onToggleConsole: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({
  activeTab,
  bridgeState,
  capabilities,
  executionState,
  executionSpeed,
  metadata,
  showConsole,
  onToggleConsole,
}) => {
  const isDirty = useFileStore((state) => state.isDirty);
  const lastSaved = useFileStore((state) => state.lastSaved);

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showTip, setShowTip] = useState(false);

  const randomTip = useMemo(() => {
    return TIPS[Math.floor(Math.random() * TIPS.length)];
  }, []);

  useEffect(() => {
    setShowTip(false);
    const timer = setTimeout(() => {
      setShowTip(true);
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentTipIndex]);

  const savedTime = lastSaved
    ? new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const getSaveIndicator = () => {
    if (isDirty) {
      return <span className="text-yellow-400">Unsaved changes</span>;
    }
    if (savedTime) {
      return <span className="text-green-400">Saved {savedTime}</span>;
    }
    return null;
  };

  const runtimeSummary = capabilities
    ? `Engine ${capabilities.version} | ${
        capabilities.features.debugger ? 'Debugger' : 'No debugger'
      } | ${capabilities.libraries.length} libraries`
    : 'Capabilities unavailable';

  const getExecutionInfo = () => {
    switch (executionState) {
      case 'running':
        return (
          <span className="flex items-center gap-2 text-green-600">
            <FiPlay className="w-3 h-3" />
            Running
            <span className="flex items-center gap-1 text-slate-500">
              <FiActivity className="w-3 h-3" />
              {executionSpeed}x
            </span>
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1 text-yellow-600">
            <FiPause className="w-3 h-3" />
            Paused
          </span>
        );
      case 'stopped':
        return (
          <span className="flex items-center gap-1 text-red-500">
            <FiSquare className="w-3 h-3" />
            Stopped
          </span>
        );
      default:
        return <span className="text-slate-500">Ready</span>;
    }
  };

  return (
    <footer className="h-6 bg-slate-100 dark:bg-slate-800 text-xs flex items-center px-4 justify-between flex-shrink-0 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          {getExecutionInfo()}
        </span>
        {metadata && <span className="text-slate-500">{metadata.name}</span>}
        <span className="text-slate-500">Bridge: {bridgeState}</span>
        {activeTab === 'designer' && executionState !== 'running' && (
          <span
            className={`text-indigo-600 dark:text-indigo-400 flex items-center gap-1 transition-opacity ${
              showTip ? 'opacity-100' : 'opacity-0'
            }`}
            title={randomTip}
          >
            <FiZap className="w-3 h-3" />
            <span className="max-w-48 truncate">{randomTip}</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {getSaveIndicator()}
        {activeTab === 'designer' && (
          <button
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            onClick={onToggleConsole}
          >
            {showConsole ? 'Hide Console' : 'Show Console'}
          </button>
        )}
        <span className="text-slate-500">{runtimeSummary}</span>
      </div>
    </footer>
  );
};

export default StatusBar;
