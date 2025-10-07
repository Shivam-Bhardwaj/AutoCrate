import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'
import React from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'

jest.mock('@/components/CrateVisualizer', () => ({
  __esModule: true,
  default: () => <div data-testid="crate-visualizer" />
}))

jest.mock('@/components/MarkingsSection', () => ({
  MarkingsSection: ({ onMarkingsChange }: { onMarkingsChange: (value: any) => void }) => {
    React.useEffect(() => {
      onMarkingsChange({
        appliedMaterialsLogo: true,
        fragileStencil: true,
        handlingSymbols: true
      })
    }, [onMarkingsChange])

    return <div data-testid="markings-section" />
  }
}))

jest.mock('@/components/PlywoodPieceSelector', () => ({
  PlywoodPieceSelector: ({ onPieceToggle }: { onPieceToggle: (name: string) => void }) => (
    <button data-testid="toggle-piece" onClick={() => onPieceToggle('FRONT_PANEL_PLY_1')}>
      Toggle Piece
    </button>
  )
}))

jest.mock('@/components/ErrorBoundary', () => ({
  VisualizationErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

const renderHome = () => render(
  <ThemeProvider>
    <Home />
  </ThemeProvider>
)

describe('Home Page', () => {
  it('shows scenario status and visualizer shell', async () => {
    renderHome()
    expect(await screen.findByTestId('scenario-status')).toHaveTextContent('Default Production')
    expect(screen.getByTestId('crate-visualizer')).toBeInTheDocument()
  })

  it('applies scenario presets and updates fields', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(await screen.findByTestId('scenario-lightweight-electronics'))
    expect(screen.getByTestId('scenario-status')).toHaveTextContent('Lightweight Electronics')
    expect(screen.getByTestId('input-weight')).toHaveValue('350')
  })

  it('marks status as custom when manual edits occur', async () => {
    const user = userEvent.setup()
    renderHome()

    const weightInput = await screen.findByTestId('input-weight')
    await user.clear(weightInput)
    await user.type(weightInput, '999')

    expect(screen.getByTestId('scenario-status')).toHaveTextContent('Custom values')
  })

  it('handles plywood visibility toggles and download actions', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByRole('button', { name: 'Plywood Pieces' }))
    await user.click(await screen.findByTestId('toggle-piece'))

    const createObjectURL = jest.spyOn(global.URL, 'createObjectURL')
    await user.click(screen.getByRole('button', { name: 'Export NX' }))
    await user.click(screen.getByRole('button', { name: 'Download STEP' }))
    expect(createObjectURL).toHaveBeenCalledTimes(2)
    createObjectURL.mockRestore()
  })
})
