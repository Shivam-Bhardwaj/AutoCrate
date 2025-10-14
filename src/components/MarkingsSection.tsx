'use client'

import { useState, useEffect } from 'react'
import { MarkingConfig, MarkingDimensions, NXGenerator, CrateConfig } from '@/lib/nx-generator'

interface MarkingsSectionProps {
  config: CrateConfig
  onMarkingsChange: (markings: MarkingConfig) => void
}

export function MarkingsSection({ config, onMarkingsChange }: MarkingsSectionProps) {
  const [markings, setMarkings] = useState<MarkingConfig>({
    appliedMaterialsLogo: false,
    fragileStencil: true,
    handlingSymbols: true,
    autocrateText: true
  })

  // Create a generator instance to calculate marking dimensions
  const generator = new NXGenerator({
    ...config,
    markings
  })

  // Get marking dimensions for display
  const fragileDims = generator.getMarkingDimensions('fragile')
  const handlingDims = generator.getMarkingDimensions('handling')
  const autocrateDims = generator.getMarkingDimensions('autocrate')

  // Calculate overall crate height for reference
  const overallHeight = config.product.height + config.clearances.top +
    (generator.getExpressions().get('skid_height') || 3.5) +
    (generator.getExpressions().get('floorboard_thickness') || 1.5) +
    config.materials.panelThickness

  useEffect(() => {
    onMarkingsChange(markings)
  }, [markings, onMarkingsChange])

  const toggleMarking = (type: 'fragile' | 'handling' | 'autocrate') => {
    setMarkings(prev => ({
      ...prev,
      appliedMaterialsLogo: false,
      fragileStencil: type === 'fragile' ? !prev.fragileStencil : prev.fragileStencil,
      handlingSymbols: type === 'handling' ? !prev.handlingSymbols : prev.handlingSymbols,
      autocrateText: type === 'autocrate' ? !prev.autocrateText : prev.autocrateText
    }))
  }

  const formatDimensions = (dims: MarkingDimensions | null) => {
    if (!dims) return 'N/A'
    return `${dims.width}" x ${dims.height}"`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Markings & Decals
      </h3>

      <div className="text-xs text-gray-600 dark:text-gray-400">
        Crate Height: {overallHeight.toFixed(1)}"
      </div>

      {/* Fragile Stencil */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={markings.fragileStencil}
          onChange={() => toggleMarking('fragile')}
          className="mt-1 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fragile Stencil
          </label>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {fragileDims && (
              <>
                <div>Size: {formatDimensions(fragileDims)}</div>
                <div>P/N: {fragileDims.partNumber}</div>
                <div>Position: Center of each panel at 10° angle (4 per crate)</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Handling Symbols */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={markings.handlingSymbols}
          onChange={() => toggleMarking('handling')}
          className="mt-1 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Handling Symbols
          </label>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {handlingDims && (
              <>
                <div>Size: {formatDimensions(handlingDims)}</div>
                <div>P/N: {handlingDims.partNumber}</div>
                <div>Position: Upper right corner of each panel (up to 4 per crate)</div>
                <div>Includes: Glass, Umbrella, Up Arrows</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AUTOCRATE Text */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={markings.autocrateText}
          onChange={() => toggleMarking('autocrate')}
          className="mt-1 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            AUTOCRATE Text
          </label>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {autocrateDims && (
              <>
                <div>Size: {formatDimensions(autocrateDims)}</div>
                <div>P/N: {autocrateDims.partNumber}</div>
                <div>Position: Center of each panel (4 per crate)</div>
                <div>Text: Bold "AUTOCRATE" lettering</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div className="font-medium mb-1">Summary:</div>
          <div>Total Markings: {
            (markings.fragileStencil ? 4 : 0) +
            (markings.handlingSymbols ? 4 : 0) +
            (markings.autocrateText ? 4 : 0)
          }</div>
          <div className="mt-1">
            {!markings.fragileStencil && !markings.handlingSymbols && !markings.autocrateText &&
              'No markings selected'}
            {markings.fragileStencil && 'Fragile (4) '}
            {markings.handlingSymbols && 'Handling (4) '}
            {markings.autocrateText && 'AUTOCRATE (4)'}
          </div>
        </div>
      </div>
    </div>
  )
}