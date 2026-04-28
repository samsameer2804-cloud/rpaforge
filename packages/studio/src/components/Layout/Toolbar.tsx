import React, { useState } from 'react';
import {
  FiPlay,
  FiPause,
  FiSquare,
  FiCode,
  FiArrowDownCircle,
  FiArrowDownRight,
  FiArrowUpCircle,
  FiActivity,
  FiFolder,
  FiInfo,
  FiX,
} from 'react-icons/fi';
import { FaProjectDiagram } from 'react-icons/fa';
import FileMenu from '../Common/FileMenu';

import type { BridgeState } from '../../types/events';
import type { ExecutionSpeed } from '../../stores/processStore';

interface ToolbarProps {
  activeTab: 'designer' | 'debugger' | 'console';
  onTabChange: (tab: 'designer' | 'debugger' | 'console') => void;
  isConnected: boolean;
  bridgeState: BridgeState;
  isRunning: boolean;
  isPaused: boolean;
  isStepLoading: boolean;
  hasMetadata: boolean;
  hasNodes: boolean;
  executionSpeed: ExecutionSpeed;
  projectName?: string;
  projectPath?: string;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onExportCode: () => void;
  onShowMermaid?: () => void;
  onSpeedChange: (speed: ExecutionSpeed) => void;
  onStepOver?: () => void;
  onStepInto?: () => void;
  onStepOut?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTab,
  onTabChange,
  isConnected: _isConnected,
  bridgeState,
  isRunning,
  isPaused,
  isStepLoading,
  hasMetadata,
  hasNodes,
  executionSpeed,
  projectName,
  projectPath: _projectPath,
  onRun,
  onPause,
  onResume,
  onStop,
  onExportCode,
  onShowMermaid,
  onSpeedChange,
  onStepOver,
  onStepInto,
  onStepOut,
}) => {
  const [showAbout, setShowAbout] = useState(false);
  const speedOptions: ExecutionSpeed[] = [0.5, 1, 2, 5];

  const getExecutionButton = () => {
    if (isRunning) {
      if (isPaused) {
        return (
          <button
            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 flex items-center gap-1"
            onClick={onResume}
          >
            <FiPlay className="w-4 h-4" />
            Resume
          </button>
        );
      }
      return (
        <button
          className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700 flex items-center gap-1"
          onClick={onPause}
        >
          <FiPause className="w-4 h-4" />
          Pause
        </button>
      );
    }

    return (
      <button
        className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onRun}
        disabled={!hasMetadata}
        title={
          !hasMetadata
            ? 'Open or create a project to run (Ctrl+N or Ctrl+O)'
            : !hasNodes
            ? 'Add activities to the canvas first'
            : 'Run process (F5)'
          }
        aria-disabled={!hasMetadata}
      >
        <FiPlay className="w-4 h-4" />
        Run
      </button>
    );
  };

  const bridgeBadge = {
    starting: 'text-blue-400',
    ready: 'text-green-400',
    degraded: 'text-yellow-400',
    reconnecting: 'text-amber-400',
    stopped: 'text-slate-400',
  }[bridgeState];

  const bridgeLabel = bridgeState.charAt(0).toUpperCase() + bridgeState.slice(1);

  return (
    <header className="h-12 bg-slate-800 text-white flex items-center px-4 justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">RPAForge Studio</h1>
        <button
          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          onClick={() => setShowAbout(true)}
          title="About RPAForge"
          aria-label="About RPAForge"
        >
          <FiInfo className="w-4 h-4" />
        </button>
        {projectName && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700 rounded">
            <FiFolder className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium">{projectName}</span>
          </div>
        )}
        <FileMenu />
        <nav className="flex gap-1">
          {(['designer', 'debugger', 'console'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1 rounded capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs flex items-center gap-1 ${bridgeBadge}`}
          title={
            bridgeState === 'ready'
              ? 'Bridge: Python engine running. Your automation will execute.'
              : bridgeState === 'starting'
              ? 'Bridge: Starting Python engine...'
              : bridgeState === 'degraded'
              ? 'Bridge: Running with limited features. Some activities may not work.'
              : bridgeState === 'reconnecting'
              ? 'Bridge: Attempting to reconnect to Python engine...'
              : 'Bridge: Python engine stopped. Install with: pip install rpaforge'
          }
        >
          <span className={`w-2 h-2 rounded-full ${bridgeState === 'ready' ? 'bg-green-400' : bridgeState === 'degraded' ? 'bg-yellow-400' : bridgeState === 'reconnecting' ? 'bg-amber-400' : bridgeState === 'starting' ? 'bg-blue-400' : 'bg-slate-400'}`} />
          Bridge {bridgeLabel}
        </span>

        <div className="flex items-center gap-1">
          <button
            className="px-3 py-1 bg-slate-600 rounded hover:bg-slate-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onExportCode}
            disabled={!hasNodes}
            title={!hasNodes ? 'Add blocks to the diagram first' : 'Export to Python'}
            aria-disabled={!hasNodes}
          >
            <FiCode className="w-4 h-4" />
            Export
          </button>
          <button
            className="px-3 py-1 bg-slate-600 rounded hover:bg-slate-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onShowMermaid}
            disabled={!hasNodes}
            title={!hasNodes ? 'Add blocks to the diagram first' : 'View as Mermaid Diagram'}
            aria-disabled={!hasNodes}
          >
            <FaProjectDiagram className="w-4 h-4" />
            Diagram
          </button>

          <div
            className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded"
            title={isRunning ? 'Cannot change speed while process is running' : 'Execution Speed'}
          >
            <FiActivity className="w-4 h-4 text-slate-300" />
            <select
              value={executionSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value) as ExecutionSpeed)}
              className="bg-slate-600 text-white text-sm rounded px-1 py-0.5 border-none outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isRunning}
              aria-label="Execution speed"
            >
              {speedOptions.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>
          </div>
          
          {getExecutionButton()}
          {isRunning && isPaused && (
            <>
              <button
                className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onStepOver}
                disabled={isStepLoading}
                title="Step Over (F6)"
              >
                <FiArrowDownCircle className="w-4 h-4" />
                Over
              </button>
              <button
                className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onStepInto}
                disabled={isStepLoading}
                title="Step Into (F7)"
              >
                <FiArrowDownRight className="w-4 h-4" />
                Into
              </button>
              <button
                className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onStepOut}
                disabled={isStepLoading}
                title="Step Out (F8)"
              >
                <FiArrowUpCircle className="w-4 h-4" />
                Out
              </button>
            </>
          )}
          {isRunning && (
            <button
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 flex items-center gap-1"
              onClick={onStop}
            >
              <FiSquare className="w-4 h-4" />
              Stop
            </button>
          )}
        </div>
      </div>

      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">About RPAForge</h2>
              <button
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setShowAbout(false)}
              >
                <FiX className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p className="font-medium text-slate-900 dark:text-white text-base">
                RPAForge Studio — Visual RPA Automation Tool
              </p>
              <p>
                Build automation workflows by dragging activities onto the canvas.
                Activities are automation blocks that perform tasks like clicking,
                typing, reading files, and more.
              </p>
              <div className="bg-slate-50 dark:bg-slate-700 rounded p-3">
                <div className="font-medium text-slate-700 dark:text-slate-200 mb-2">Quick Start</div>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Add a <strong>Start</strong> block from the palette</li>
                  <li>Drag activities onto the canvas</li>
                  <li>Connect blocks by dragging between ports</li>
                  <li>Configure activity properties in the right panel</li>
                  <li>Press <strong>F5</strong> to run your process</li>
                </ol>
              </div>
              <p className="text-xs text-slate-400">
                Version 0.3.0 | Built on Robot Framework
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Toolbar;
