import { render, screen, fireEvent } from '@testing-library/react'
import ScenarioSelector, { ScenarioPreset } from '../ScenarioSelector'

describe('ScenarioSelector', () => {
  const scenarios: ScenarioPreset[] = [
    {
      id: 'default',
      name: 'Default Production',
      description: 'Baseline',
      product: { length: 100, width: 80, height: 60, weight: 1000 },
      clearances: { side: 2, end: 2, top: 3 }
    },
    {
      id: 'lightweight',
      name: 'Lightweight Electronics',
      description: 'Small and light',
      product: { length: 50, width: 30, height: 20, weight: 200 },
      clearances: { side: 1, end: 1, top: 2 },
      allow3x4: true,
      lumberSizes: { '2x6': true, '2x8': false }
    }
  ]

  it('highlights the active scenario and lists options', () => {
    const onSelect = jest.fn()

    render(
      <ScenarioSelector
        scenarios={scenarios}
        activeScenarioId="default"
        onScenarioSelect={onSelect}
      />
    )

    expect(screen.getByTestId('scenario-panel')).toBeInTheDocument()
    expect(screen.getByText('Default Production')).toBeInTheDocument()
    expect(screen.getByText('Lightweight Electronics')).toBeInTheDocument()

    const activeButton = screen.getByTestId('scenario-default')
    expect(activeButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('invokes callback when a scenario is chosen', () => {
    const onSelect = jest.fn()

    render(
      <ScenarioSelector
        scenarios={scenarios}
        activeScenarioId="default"
        onScenarioSelect={onSelect}
      />
    )

    fireEvent.click(screen.getByTestId('scenario-lightweight'))
    expect(onSelect).toHaveBeenCalledWith(scenarios[1])
  })
})
