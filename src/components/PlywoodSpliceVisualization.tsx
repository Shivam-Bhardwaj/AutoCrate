'use client'

import React from 'react'
import { PanelSpliceLayout } from '@/lib/plywood-splicing'

interface PlywoodSpliceVisualizationProps {
  layouts: PanelSpliceLayout[]
}

export const PlywoodSpliceVisualization: React.FC<PlywoodSpliceVisualizationProps> = ({ layouts }) => {
  if (!layouts || layouts.length === 0) {
    return null
  }

  const scale = 0.5 // Scale factor for visualization

  return (
    <div className="space-y-6">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Plywood Splice Layouts (48" x 96" sheets)
      </div>

      {layouts.map((layout) => {
        const visualWidth = layout.panelWidth * scale
        const visualHeight = layout.panelHeight * scale

        return (
          <div key={layout.panelName} className="space-y-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {layout.panelName.replace(/_/g, ' ')} - {layout.panelWidth.toFixed(1)}" x {layout.panelHeight.toFixed(1)}"
              <span className="ml-2 text-gray-500">
                ({layout.sheetCount} sheets, {layout.splices.length} splices)
              </span>
            </div>

            <div className="relative inline-block bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <svg
                width={visualWidth + 20}
                height={visualHeight + 20}
                viewBox={`-10 -10 ${visualWidth + 20} ${visualHeight + 20}`}
                className="border border-gray-300 dark:border-gray-600"
              >
                {/* Panel outline */}
                <rect
                  x="0"
                  y="0"
                  width={visualWidth}
                  height={visualHeight}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-700 dark:text-gray-300"
                />

                {/* Plywood sections */}
                {layout.sheets.map((section) => (
                  <g key={section.id}>
                    <rect
                      x={section.x * scale}
                      y={section.y * scale}
                      width={section.width * scale}
                      height={section.height * scale}
                      fill="rgba(139, 92, 246, 0.1)"
                      stroke="rgb(139, 92, 246)"
                      strokeWidth="0.5"
                      className="hover:fill-purple-200 dark:hover:fill-purple-800 transition-colors"
                    />
                    <text
                      x={(section.x + section.width / 2) * scale}
                      y={(section.y + section.height / 2) * scale}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[10px] fill-gray-600 dark:fill-gray-400"
                    >
                      {section.width.toFixed(0)}" x {section.height.toFixed(0)}"
                    </text>
                  </g>
                ))}

                {/* Splice lines */}
                {layout.splices.map((splice, index) => (
                  <line
                    key={`splice-${index}`}
                    x1={splice.orientation === 'vertical' ? splice.x * scale : 0}
                    y1={splice.orientation === 'horizontal' ? splice.y * scale : splice.y * scale}
                    x2={splice.orientation === 'vertical' ? splice.x * scale : visualWidth}
                    y2={splice.orientation === 'horizontal' ? splice.y * scale : (splice.y + layout.panelHeight) * scale}
                    stroke="red"
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                    opacity="0.7"
                  />
                ))}

                {/* Splice indicators */}
                {layout.splices.map((splice, index) => {
                  const labelX = splice.orientation === 'vertical'
                    ? splice.x * scale + 5
                    : visualWidth - 30
                  const labelY = splice.orientation === 'horizontal'
                    ? splice.y * scale - 5
                    : splice.y * scale + 10

                  return (
                    <text
                      key={`label-${index}`}
                      x={labelX}
                      y={labelY}
                      className="text-[9px] fill-red-600 dark:fill-red-400 font-semibold"
                    >
                      {splice.orientation === 'vertical' ? 'V' : 'H'}-Splice
                    </text>
                  )
                })}

                {/* Legend for sheet boundaries */}
                <text
                  x={visualWidth / 2}
                  y={-5}
                  textAnchor="middle"
                  className="text-[10px] fill-gray-500 dark:fill-gray-400"
                >
                  Blue: Sheet boundaries | Red dashed: Splice lines
                </text>
              </svg>
            </div>
          </div>
        )
      })}

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
        <div className="font-semibold mb-1">Splicing Rules:</div>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
          <li>Maximum sheet size: 48" x 96"</li>
          <li>Vertical splices positioned on RIGHT side</li>
          <li>Horizontal splices positioned on BOTTOM</li>
          <li>Optimized for minimum number of splices</li>
        </ul>
      </div>
    </div>
  )
}