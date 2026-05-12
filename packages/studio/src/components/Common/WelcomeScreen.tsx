import { useEffect, useState } from 'react'
import Joyride from 'react-joyride'
import { FiFolder, FiFolderPlus, FiPlay, FiX } from 'react-icons/fi'

interface WelcomeScreenProps {
  onNewProcess: () => void
  onOpenProcess: () => void
  onDismiss: () => void
}

const tutorialSteps = [
  {
    target: '[data-tour="activity-palette"]',
    content: 'This is the Activity Palette. Drag activities into your workflow.',
  },
  {
    target: '[data-tour="workflow-canvas"]',
    content: 'Build your automation workflows visually on the canvas.',
  },
  {
    target: '[data-tour="property-panel"]',
    content: 'Configure activity properties and parameters here.',
  },
  {
    target: '[data-tour="debugger-panel"]',
    content: 'Debug workflows step-by-step using the debugger panel.',
  },
  {
    target: '[data-tour="run-button"]',
    content: 'Run your workflow from this button.',
  },
]

export function WelcomeScreen({
  onNewProcess,
  onOpenProcess,
  onDismiss,
}: WelcomeScreenProps) {
  const [dontShow, setDontShow] = useState(false)
  const [runTutorial, setRunTutorial] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(
      'rpaforge_onboarding_complete'
    )

    if (!completed) {
      setRunTutorial(true)
    }
  }, [])

  const handleJoyrideCallback = (data: any) => {
    const { status } = data

    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem(
        'rpaforge_onboarding_complete',
        'true'
      )
    }
  }

  const handleDismiss = () => {
    if (dontShow) {
      localStorage.setItem('rpaforge_welcomed', '1')
    }

    onDismiss()
  }

  return (
    <>
      <Joyride
        steps={tutorialSteps}
        run={runTutorial}
        continuous
        showSkipButton
        callback={handleJoyrideCallback}
      />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiPlay className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Welcome to RPAForge
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Build powerful automation workflows visually. Drag
              activities onto the canvas, connect them, and run your
              process.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => {
                handleDismiss()
                onNewProcess()
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
            >
              <FiFolderPlus className="w-5 h-5 text-indigo-500 flex-shrink-0" />

              <div>
                <div className="font-medium text-slate-800 dark:text-slate-100">
                  Create New Process
                </div>

                <div className="text-xs text-slate-500">
                  Start with a blank canvas
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                handleDismiss()
                onOpenProcess()
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
            >
              <FiFolder className="w-5 h-5 text-slate-500 flex-shrink-0" />

              <div>
                <div className="font-medium text-slate-800 dark:text-slate-100">
                  Open Existing Process
                </div>

                <div className="text-xs text-slate-500">
                  Browse and open a saved process
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <input
              type="checkbox"
              id="dont-show"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="rounded"
            />

            <label htmlFor="dont-show">
              Don't show this again
            </label>
          </div>
        </div>
      </div>
    </>
  )
}
