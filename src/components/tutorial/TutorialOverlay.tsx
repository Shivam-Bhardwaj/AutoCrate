"use client"

import React from 'react'

export type TutorialOverlayProps = {
  active: boolean
  stepIndex: number
  steps: Array<{
    id: string
    title: string
    description: string
    expressions?: string[]
    tips?: string[]
  }>
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onCopy?: (text: string) => void
}

export default function TutorialOverlay({
  active,
  stepIndex,
  steps,
  onClose,
  onPrev,
  onNext,
  onCopy,
}: TutorialOverlayProps) {
  if (!active || steps.length === 0) return null

  const step = steps[Math.max(0, Math.min(stepIndex, steps.length - 1))]

  return (
    <div className="absolute bottom-3 left-3 w-[360px] z-50 pointer-events-auto">
      <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Tutorial: {step.title}
          </div>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Close
          </button>
        </div>
        <div className="text-xs text-gray-700 dark:text-gray-300 mb-2">
          {step.description}
        </div>

        {step.expressions && step.expressions.length > 0 && (
          <div className="mb-2">
            <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Expressions</div>
            <div className="flex flex-wrap gap-1">
              {step.expressions.map((expr) => (
                <button
                  key={expr}
                  onClick={() => onCopy?.(expr)}
                  className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700"
                  title="Copy expression name"
                >
                  {expr}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Click to copy an expression name.</div>
          </div>
        )}

        {step.tips && step.tips.length > 0 && (
          <ul className="list-disc pl-4 text-[11px] text-gray-700 dark:text-gray-300 space-y-0.5 mb-1">
            {step.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            Step {stepIndex + 1} of {steps.length}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onPrev}
              className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={stepIndex === 0}
            >
              Prev
            </button>
            <button
              onClick={onNext}
              className="px-2 py-1 text-xs rounded border border-blue-600 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:border-gray-300"
              disabled={stepIndex >= steps.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

