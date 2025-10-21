'use client'

import { useState } from 'react'

interface ChecklistItem {
  id: string
  question: string
  category: string
  help?: string
}

const VISUAL_CHECKLIST: ChecklistItem[] = [
  // Panel Stops
  { id: 'panel-stops-visible', question: 'Panel stops visible on front panel edges?', category: 'Panel Stops', help: '3 panel stops should be visible' },
  { id: 'panel-stops-clearance', question: 'Panel stops have 1.0625" clearance from edges?', category: 'Panel Stops', help: 'About 1" gap from panel edges' },
  { id: 'panel-stops-flush', question: 'Panel stops flush with panel bottom (no gap)?', category: 'Panel Stops' },

  // Lag Screws
  { id: 'lags-end-cleats', question: 'Lag screws at start and end of each edge?', category: 'Lag Screws' },
  { id: 'lags-spacing', question: 'Lag screws spaced ~18-24" apart?', category: 'Lag Screws', help: 'Small crates: 2 lags, Medium: 3 lags, Large: 4-5 lags' },
  { id: 'lags-all-panels', question: 'All panels have lag screws on all edges?', category: 'Lag Screws' },

  // Ground Clearance
  { id: 'ground-clearance-visible', question: 'Side panels have 1/4" ground clearance visible?', category: 'Ground Clearance', help: 'Small gap under side panels' },
  { id: 'ground-clearance-uniform', question: 'Ground clearance uniform on all sides?', category: 'Ground Clearance' },

  // Component Visibility
  { id: 'toggle-panel-stops', question: 'Can toggle panel stops visibility on/off?', category: 'Controls' },
  { id: 'toggle-lags', question: 'Can toggle lag screws visibility on/off?', category: 'Controls' },
  { id: 'no-interference', question: 'No overlapping or z-fighting components?', category: 'Rendering' },

  // 3D View
  { id: 'rotate-view', question: 'Can rotate 3D view to inspect all angles?', category: '3D View' },
  { id: 'right-click-works', question: 'Right-click hides components without resetting view?', category: '3D View' },
  { id: 'edges-aligned', question: 'Edge outlines perfectly aligned with components?', category: '3D View' },

  // Exports
  { id: 'nx-export', question: 'NX export shows datum planes (X=0, Y=0, Z=0)?', category: 'Export' },
  { id: 'step-export', question: 'STEP file downloads correctly?', category: 'Export' },
]

export function VisualChecklist({ onClose }: { onClose?: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [isComplete, setIsComplete] = useState(false)

  const currentItem = VISUAL_CHECKLIST[currentIndex]
  const progress = ((currentIndex + 1) / VISUAL_CHECKLIST.length) * 100

  const handleResponse = (passed: boolean) => {
    setResults(prev => ({ ...prev, [currentItem.id]: passed }))

    if (currentIndex < VISUAL_CHECKLIST.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setResults({})
    setIsComplete(false)
  }

  const passedCount = Object.values(results).filter(Boolean).length
  const failedCount = Object.values(results).filter(v => !v).length

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Visual Check Complete!
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            )}
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <span className="text-3xl">✓</span>
                  <span className="text-2xl font-bold">{passedCount}</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-500">Passed</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <span className="text-3xl">✗</span>
                  <span className="text-2xl font-bold">{failedCount}</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-500">Failed</p>
              </div>
            </div>

            {failedCount > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5 text-xl">⚠</span>
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                      Items that need attention:
                    </h3>
                    <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-500">
                      {VISUAL_CHECKLIST.filter(item => results[item.id] === false).map(item => (
                        <li key={item.id}>• {item.question}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Restart Checklist
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {currentItem.category}
            </span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Visual Checklist
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentIndex + 1} of {VISUAL_CHECKLIST.length}</span>
            <span>{passedCount} passed • {failedCount} failed</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <p className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-3">
            {currentItem.question}
          </p>
          {currentItem.help && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              💡 {currentItem.help}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleResponse(true)}
            className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-2xl">✓</span>
            Yes
          </button>
          <button
            onClick={() => handleResponse(false)}
            className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-2xl">✗</span>
            No
          </button>
        </div>

        {/* Navigation hint */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4">
          Press Space for Yes • Press X for No
        </p>
      </div>
    </div>
  )
}

// Floating button to trigger checklist
export function VisualChecklistButton() {
  const [showChecklist, setShowChecklist] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowChecklist(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2 z-40 transition-colors"
        title="Start Visual Checklist"
      >
        <span className="text-xl">✓</span>
        Visual Check
      </button>

      {showChecklist && <VisualChecklist onClose={() => setShowChecklist(false)} />}
    </>
  )
}
