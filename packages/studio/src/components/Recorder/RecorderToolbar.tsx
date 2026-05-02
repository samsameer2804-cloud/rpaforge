import React from 'react';
import { FiSquare, FiPause, FiPlay, FiCircle } from 'react-icons/fi';

interface RecorderToolbarProps {
  isRecording: boolean;
  isPaused: boolean;
  actionCount: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
}

const RecorderToolbar: React.FC<RecorderToolbarProps> = ({
  isRecording,
  isPaused,
  actionCount,
  onStart,
  onStop,
  onPause,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recorder</h2>
        {isRecording && !isPaused && (
          <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
            <FiCircle className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-pulse" />
            REC
          </span>
        )}
        {isPaused && (
          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">PAUSED</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actionCount > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
            {actionCount} actions
          </span>
        )}

        {!isRecording ? (
          <button
            className="flex items-center gap-1.5 px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
            onClick={onStart}
            title="Start recording"
          >
            <FiCircle className="w-3 h-3 fill-current" />
            Start
          </button>
        ) : (
          <>
            <button
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              onClick={onPause}
              title={isPaused ? 'Resume recording' : 'Pause recording'}
            >
              {isPaused ? <FiPlay className="w-3 h-3" /> : <FiPause className="w-3 h-3" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
              onClick={onStop}
              title="Stop recording"
            >
              <FiSquare className="w-3 h-3" />
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecorderToolbar;
