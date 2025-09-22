import React from "react"

export interface ScenarioPreset {
  id: string
  name: string
  description: string
  product: {
    length: number
    width: number
    height: number
    weight: number
  }
  clearances: {
    side: number
    end: number
    top: number
  }
  allow3x4?: boolean
  lumberSizes?: Partial<Record<'2x6' | '2x8' | '2x10' | '2x12', boolean>>
  note?: string
}

interface ScenarioSelectorProps {
  scenarios: ScenarioPreset[]
  activeScenarioId: string | null
  onScenarioSelect: (scenario: ScenarioPreset) => void
}

/**
 * Quick scenario loader for non-technical reviewers.
 * Makes it easy to test pre-configured crate setups without re-entering numbers.
 */
const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  activeScenarioId,
  onScenarioSelect
}) => {
  return (
    <div data-testid="scenario-panel" className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Quick Scenarios</h3>
        <span className="text-[11px] text-gray-500">Loads sample dimensions</span>
      </div>
      <div className="space-y-1.5">
        {scenarios.map(scenario => {
          const isActive = scenario.id === activeScenarioId
          const buttonClasses = isActive
            ? 'w-full text-left rounded border px-3 py-2 transition-colors border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
            : 'w-full text-left rounded border px-3 py-2 transition-colors border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'

          return (
            <button
              key={scenario.id}
              data-testid={"scenario-" + scenario.id}
              onClick={() => onScenarioSelect(scenario)}
              aria-pressed={isActive}
              className={buttonClasses}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{scenario.name}</span>
                <span className="text-[11px] text-gray-500">
                  {scenario.product.length}" × {scenario.product.width}" × {scenario.product.height}"
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{scenario.description}</p>
              {scenario.note ? (
                <p className="text-[11px] text-gray-500 mt-1">{scenario.note}</p>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ScenarioSelector
