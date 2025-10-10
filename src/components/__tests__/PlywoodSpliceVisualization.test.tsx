import { render, screen } from '@testing-library/react'
import { PlywoodSpliceVisualization } from '../PlywoodSpliceVisualization'
import { PanelSpliceLayout } from '@/lib/plywood-splicing'

describe('PlywoodSpliceVisualization', () => {
  const layout: PanelSpliceLayout = {
    panelName: 'FRONT_PANEL',
    panelWidth: 96,
    panelHeight: 48,
    sheetCount: 2,
    splices: [
      { x: 48, y: 0, orientation: 'vertical' },
      { x: 0, y: 24, orientation: 'horizontal' }
    ],
    sheets: [
      {
        id: 'FRONT_PANEL_S0_0',
        x: 0,
        y: 0,
        width: 48,
        height: 24,
        sheetX: 0,
        sheetY: 0,
        sheetId: 0
      },
      {
        id: 'FRONT_PANEL_S0_1',
        x: 48,
        y: 0,
        width: 48,
        height: 24,
        sheetX: 0,
        sheetY: 0,
        sheetId: 1
      }
    ],
    isRotated: false,
    pieces: []
  } as unknown as PanelSpliceLayout

  it('renders panel overview and splice rules', () => {
    render(<PlywoodSpliceVisualization layouts={[layout]} />)

    expect(screen.getByText((content) => content.includes('FRONT PANEL'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.toLowerCase().includes('sheet boundaries'))).toBeInTheDocument()
    expect(screen.getByText(/Splicing Rules/)).toBeInTheDocument()
  })

  it('returns null when there are no layouts', () => {
    const { container } = render(<PlywoodSpliceVisualization layouts={[]} />)
    expect(container.firstChild).toBeNull()
  })
})

