"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'

export type TutorialOverlayProps = {
  active: boolean
  stepIndex: number
  steps: Array<{
    id: string
    title: string
    description: string
    expressions?: string[]
    expressionValues?: Record<string, number>
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
  const [copiedExpression, setCopiedExpression] = useState<string | null>(null)
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current)
        clearTimerRef.current = null
      }
    }
  }, [])

  const handleCopy = (expr: string) => {
    onCopy?.(expr)
    setCopiedExpression(expr)
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current)
    }
    clearTimerRef.current = setTimeout(() => {
      setCopiedExpression(null)
      clearTimerRef.current = null
    }, 1800)
  }

  const hasSteps = steps.length > 0
  const step = hasSteps ? steps[Math.max(0, Math.min(stepIndex, steps.length - 1))] : null

  const groupedExpressions = useMemo(() => {
    if (!step || !step.expressions || step.expressions.length === 0) return []

    const prettify = (raw: string) =>
      raw
        .split('_')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')

    type Group = {
      id: string
      title: string
      items: Array<{ full: string; label: string; value?: number }>
    }

    const groups = new Map<string, Group>()

    const ensureGroup = (id: string) => {
      if (!groups.has(id)) {
        const title = id === 'general' ? 'General' : prettify(id)
        groups.set(id, { id, title, items: [] })
      }
      return groups.get(id)!
    }

    step.expressions.forEach(expr => {
      const isDerived = expr.includes('=') || expr.includes('..')
      let groupId = 'general'
      let label = expr
      if (!isDerived) {
        const idx = expr.lastIndexOf('_')
        if (idx > 0) {
          groupId = expr.slice(0, idx)
          label = expr.slice(idx + 1).replace(/_/g, ' ')
        }
      }

      const group = ensureGroup(groupId.toLowerCase())
      const value = step.expressionValues?.[expr]
      group.items.push({ full: expr, label, value })
    })

    return Array.from(groups.values())
  }, [step])

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)

  useEffect(() => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current)
      clearTimerRef.current = null
    }
    setCopiedExpression(null)
  }, [active, stepIndex])

  useEffect(() => {
    setExpandedGroupId(groupedExpressions[0]?.id ?? null)
  }, [stepIndex, groupedExpressions])

  const formatValue = (value: number) => {
    if (Number.isInteger(value)) return value.toString()
    const rounded = value.toFixed(3)
    return rounded.replace(/\.0+$/, '').replace(/\.$/, '')
  }

  if (!active || !step) return null

  return (
    <div className="absolute bottom-3 left-3 w-[360px] max-w-[calc(100vw-24px)] z-50 pointer-events-auto">
      <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-h-[min(60vh,440px)] flex flex-col">
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

        {groupedExpressions.length > 0 && (
          <div className="mb-4 flex flex-col flex-shrink-0">
            <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Expressions</div>
            <div className="space-y-1.5 overflow-y-auto pr-1 max-h-[200px] pb-2">
              {groupedExpressions.map(group => {
                const isExpanded = expandedGroupId === group.id
                const isGeneral = group.id === 'general'
                return (
                  <div key={group.id} className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40">
                    <button
                      type="button"
                      onClick={() => setExpandedGroupId(prev => (prev === group.id ? null : group.id))}
                      className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors hover:bg-gray-100/70 dark:hover:bg-gray-800/70"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        {group.title}
                      </span>
                      <span className="text-[12px] text-gray-500 dark:text-gray-400">
                        {isExpanded ? '−' : '+'}
                      </span>
                    </button>
                    {isExpanded && (
                      <div
                        className={
                          isGeneral
                            ? 'px-2 pb-2 flex flex-col gap-1'
                            : 'px-2 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-1'
                        }
                      >
                        {group.items.map(item => (
                          <button
                            key={item.full}
                            onClick={() => handleCopy(item.full)}
                            aria-label={item.full}
                            title={`Copy ${item.full}`}
                            className="px-2 py-1 text-[10px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors text-left"
                          >
                            <span className="block font-medium">{item.label}</span>
                            {typeof item.value === 'number' && (
                              <span className="block text-[9px] text-gray-600 dark:text-gray-300">
                                = {formatValue(item.value)}
                              </span>
                            )}
                            <span className="block text-[8px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.full}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-2">Click to copy an expression name.</div>
            <div
              className={`transition-opacity duration-150 text-[9px] mt-1 px-2 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 ${
                copiedExpression ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-live="polite"
              role="status"
            >
              {copiedExpression ? `Copied ${copiedExpression} to clipboard.` : 'Copied to clipboard.'}
            </div>
          </div>
        )}

        {step.tips && step.tips.length > 0 && (
          <ul className="list-disc pl-4 text-[11px] text-gray-700 dark:text-gray-300 space-y-0.5 mb-1 mt-4 flex-shrink-0">
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
