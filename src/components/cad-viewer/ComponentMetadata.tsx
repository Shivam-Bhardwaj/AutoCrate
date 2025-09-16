'use client'

import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import type { ComponentInfo } from './componentMetadata'

interface ComponentMetadataProps {
  components: ComponentInfo[]
  showMetadata: boolean
  hoveredComponentId: string | null
  pointerPosition: { x: number; y: number } | null
}

export function ComponentMetadata({
  components,
  showMetadata,
  hoveredComponentId,
  pointerPosition
}: ComponentMetadataProps) {
  const componentMap = useMemo(() => {
    const map = new Map<string, ComponentInfo>()
    components.forEach(component => {
      map.set(component.id, component)
    })
    return map
  }, [components])

  if (!showMetadata || !hoveredComponentId || !pointerPosition) {
    return null
  }

  const component = componentMap.get(hoveredComponentId)

  if (!component) {
    return null
  }

  return (
    <Html fullscreen zIndexRange={[1000, 0]}>
      <div
        className="pointer-events-none fixed z-50 min-w-64 max-w-md"
        style={{
          top: pointerPosition.y + 12,
          left: pointerPosition.x + 12
        }}
        role="tooltip"
        aria-live="polite"
      >
        <div className="rounded-lg border border-gray-200 bg-white/95 p-4 shadow-2xl backdrop-blur-sm">
          <div className="border-b border-gray-200 pb-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">{formatComponentType(component.type)}</p>
            <h3 className="text-lg font-semibold text-slate-900">{component.name}</h3>
          </div>

          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dimensions</h4>
              <p>
                {component.dimensions.length}″ × {component.dimensions.width}″ × {component.dimensions.height}″
              </p>
            </div>

            {component.material && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Material</h4>
                <p>
                  {component.material.type} — {component.material.grade}
                  {component.material.thickness !== undefined && ` (${component.material.thickness}″)`}
                </p>
              </div>
            )}

            {(component.weight || component.cost) && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Properties</h4>
                <ul className="space-y-1">
                  {component.weight !== undefined && (
                    <li>Weight: {component.weight.toFixed(1)} lbs</li>
                  )}
                  {component.cost !== undefined && component.cost > 0 && (
                    <li>Cost: ${component.cost.toFixed(2)}</li>
                  )}
                </ul>
              </div>
            )}

            {component.specifications.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Specifications</h4>
                <ul className="space-y-1">
                  {component.specifications.slice(0, 3).map((specification, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{specification}</span>
                    </li>
                  ))}
                  {component.specifications.length > 3 && (
                    <li className="text-xs text-slate-500">
                      +{component.specifications.length - 3} additional specification(s)
                    </li>
                  )}
                </ul>
              </div>
            )}

            {component.manufacturingNotes.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Manufacturing Notes</h4>
                <ul className="space-y-1">
                  {component.manufacturingNotes.slice(0, 2).map((note, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-amber-500">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                  {component.manufacturingNotes.length > 2 && (
                    <li className="text-xs text-slate-500">
                      +{component.manufacturingNotes.length - 2} additional note(s)
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Html>
  )
}

function formatComponentType(type: ComponentInfo['type']): string {
  return type
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

