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
    partNames?: string[]
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
        const floorboardNameMatch = expr.match(/^floorboard_(\d+)$/i)
        if (floorboardNameMatch) {
          groupId = `FLOORBOARD_${floorboardNameMatch[1]}`
          label = expr.toLowerCase()
        } else {
          const idx = expr.lastIndexOf('_')
          if (idx > 0) {
            groupId = expr.slice(0, idx)
            label = expr.slice(idx + 1).replace(/_/g, ' ')
          }
        }
      }

      const group = ensureGroup(groupId.toLowerCase())
      const value = step.expressionValues?.[expr]
      group.items.push({ full: expr, label, value })
    })

    return Array.from(groups.values())
  }, [step])

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)
  const [partNamesExpanded, setPartNamesExpanded] = useState<boolean>(true)
  const [expandedPartGroupId, setExpandedPartGroupId] = useState<string | null>(null)

  type PartNameGroup = {
    id: string
    title: string
    items: string[]
  }

  const partNameGroups: PartNameGroup[] = useMemo(() => {
    if (!step || !step.partNames || step.partNames.length === 0) return []

    const groups = new Map<string, PartNameGroup>()

    const ensureGroup = (id: string, title: string) => {
      if (!groups.has(id)) {
        groups.set(id, { id, title, items: [] })
      }
      return groups.get(id)!
    }

    const getGroupForPart = (nameRaw: string): PartNameGroup => {
      const name = nameRaw.toLowerCase()

      // SHIPPING_BASE assemblies
      if (name === 'skid') {
        return ensureGroup('shipping_base_skid', 'SHIPPING_BASE • SKID_ASSEMBLY')
      }
      if (/^floorboard_\d+$/i.test(name)) {
        return ensureGroup('shipping_base_floorboards', 'SHIPPING_BASE • FLOORBOARD_ASSEMBLY')
      }

      // CRATE_CAP panel assemblies (plywood + cleats)
      if (name.startsWith('front_end_panel_') || name.startsWith('front_panel_')) {
        return ensureGroup('crate_cap_front', 'CRATE_CAP • FRONT_END_PANEL_ASSEMBLY')
      }
      if (name.startsWith('back_end_panel_') || name.startsWith('back_panel_')) {
        return ensureGroup('crate_cap_back', 'CRATE_CAP • BACK_END_PANEL_ASSEMBLY')
      }
      if (name.startsWith('left_side_panel_') || name.startsWith('left_panel_')) {
        return ensureGroup('crate_cap_left', 'CRATE_CAP • LEFT_SIDE_PANEL_ASSEMBLY')
      }
      if (name.startsWith('right_side_panel_') || name.startsWith('right_panel_')) {
        return ensureGroup('crate_cap_right', 'CRATE_CAP • RIGHT_SIDE_PANEL_ASSEMBLY')
      }
      if (name.startsWith('top_panel_')) {
        return ensureGroup('crate_cap_top', 'CRATE_CAP • TOP_PANEL_ASSEMBLY')
      }

      // DECALS (stencils/markings)
      if (name.includes('decal') || name.includes('stencil')) {
        return ensureGroup('decals', 'DECALS')
      }

      // FASTENERS (klimps, screws, nuts, bolts, washers)
      if (
        name.includes('klimp') ||
        name.includes('screw') ||
        name.includes('bolt') ||
        name.includes('nut') ||
        name.includes('washer') ||
        name.includes('fastener')
      ) {
        return ensureGroup('fasteners', 'FASTENERS')
      }

      // Fallback group for any unexpected parts
      return ensureGroup('other_parts', 'OTHER PARTS')
    }

    step.partNames.forEach(partName => {
      const group = getGroupForPart(partName)
      group.items.push(partName)
    })

    return Array.from(groups.values())
  }, [step])

  useEffect(() => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current)
      clearTimerRef.current = null
    }
    setCopiedExpression(null)
    // Reset part names dropdown and default expanded group when step changes or overlay toggles
    setPartNamesExpanded(true)
    setExpandedPartGroupId(partNameGroups[0]?.id ?? null)
  }, [active, stepIndex, partNameGroups])

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
    <div className="absolute top-3 left-3 bottom-2 w-[360px] max-w-[calc(100vw-24px)] z-50 pointer-events-auto">
      <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 h-full flex flex-col overflow-hidden min-w-0">
        {/* Header - always visible */}
        <div className="flex items-center justify-between mb-1 flex-shrink-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Template Generator: {step.title}
          </div>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Close
          </button>
        </div>

        {/* Content area - description and tips always visible */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">
            {step.description}
          </div>

          {step.partNames && step.partNames.length > 0 && (
            <div className="mb-2 flex flex-col flex-1 min-h-0 flex-shrink">
              <div className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 flex flex-col flex-1 min-h-0">
                <button
                  type="button"
                  onClick={() => setPartNamesExpanded(prev => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors hover:bg-gray-100/70 dark:hover:bg-gray-800/70 flex-shrink-0"
                >
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Part Names
                  </span>
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">
                    {partNamesExpanded ? '−' : '+'}
                  </span>
                </button>
                {partNamesExpanded && (
                  <div className="px-2 pb-2 flex flex-col gap-1 overflow-y-auto flex-1">
                    {partNameGroups.map(group => {
                      const isExpanded = expandedPartGroupId === group.id
                      return (
                        <div
                          key={group.id}
                          className="rounded border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPartGroupId(prev => (prev === group.id ? null : group.id))
                            }
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
                            <div className="px-2 pb-2 flex flex-col gap-1">
                              {group.items.map(partName => (
                                <button
                                  key={partName}
                                  onClick={() => handleCopy(partName)}
                                  aria-label={partName}
                                  title={`Copy ${partName}`}
                                  className={`px-3 py-1.5 text-xs rounded border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors text-left w-full flex items-center justify-between relative flex-shrink-0 ${
                                    copiedExpression === partName
                                      ? 'border-emerald-500 dark:border-emerald-400 shadow-inner bg-emerald-50/70 dark:bg-emerald-900/40'
                                      : 'border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <span className="block font-medium leading-tight pr-12 break-all">
                                    {partName}
                                  </span>
                                  {copiedExpression === partName && (
                                    <span className="absolute top-1.5 right-2 text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                                      Copied
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 leading-tight flex-shrink-0">
                Click any part name to copy it to your clipboard.
              </div>
              <div
                className={`transition-opacity duration-150 text-[9px] mt-1 px-2 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 leading-tight flex-shrink-0 ${
                  copiedExpression ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                aria-live="polite"
                role="status"
              >
                {copiedExpression ? `Copied ${copiedExpression} to clipboard.` : 'Copied to clipboard.'}
              </div>
            </div>
          )}

          {groupedExpressions.length > 0 && (
            <div className="mb-4 flex flex-col">
              <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Expressions</div>
              <div className="space-y-1.5 pb-2">
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
                              : 'px-2 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-1 items-stretch'
                          }
                        >
                          {group.items.map(item => (
                            <button
                              key={item.full}
                              onClick={() => handleCopy(item.full)}
                              aria-label={item.full}
                              title={`Copy ${item.full}`}
                              className={`px-2 py-1.5 text-[10px] rounded border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors text-left h-full flex flex-col justify-start relative ${
                                copiedExpression === item.full
                                  ? 'border-emerald-500 dark:border-emerald-400 shadow-inner bg-emerald-50/70 dark:bg-emerald-900/40'
                                  : 'border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <span className="block font-medium leading-tight pr-8">
                                {item.label}
                              </span>
                              {copiedExpression === item.full && (
                                <span className="absolute top-1 right-1 text-[8px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                  Copied
                                </span>
                              )}
                              {typeof item.value === 'number' && (
                                <span className="block text-[9px] text-gray-600 dark:text-gray-300 leading-tight mt-0.5">
                                  = {formatValue(item.value)}
                                </span>
                              )}
                              <span className="block text-[8px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
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
              <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-2 leading-tight">Click to copy an expression name.</div>
              <div
                className={`transition-opacity duration-150 text-[9px] mt-1.5 px-2 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 leading-tight ${
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
            <ul className="list-disc pl-4 text-[11px] text-gray-700 dark:text-gray-300 space-y-0.5 mb-4 flex-shrink-0">
              {step.tips.map((tip, i) => (
                <li key={i} className="leading-relaxed">{tip}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Navigation - always visible at bottom */}
        <div className="mt-2 flex items-center justify-between flex-shrink-0 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            Step {stepIndex + 1} of {steps.length}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onPrev}
              className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={stepIndex === 0}
            >
              Prev
            </button>
            <button
              onClick={onNext}
              className="px-2 py-1 text-xs rounded border border-blue-600 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
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
