import { render, screen } from '@testing-library/react'
import { MarkingVisualizer } from '../MarkingVisualizer'
import { NXGenerator, CrateConfig, NXBox } from '@/lib/nx-generator'

const baseConfig: CrateConfig = {
  product: { length: 60, width: 40, height: 35, weight: 450 },
  clearances: { side: 2, end: 2, top: 3 },
  materials: {
    skidSize: '4x4',
    plywoodThickness: 0.25,
    panelThickness: 1,
    cleatSize: '1x4',
    allow3x4Lumber: false
  },
  markings: {
    appliedMaterialsLogo: true,
    fragileStencil: true,
    handlingSymbols: true,
    autocrateText: true
  }
}

const generator = new NXGenerator(baseConfig)

const makePanel = (name: string, overrides?: Partial<NXBox>): NXBox => ({
  name,
  type: 'panel',
  point1: { x: -48, y: -1, z: 0 },
  point2: { x: 48, y: 1, z: 96 },
  color: '#ccc',
  ...overrides
})

describe('MarkingVisualizer', () => {
  it('renders markings for enabled panels', () => {
    const boxes: NXBox[] = [
      makePanel('FRONT_PANEL'),
      makePanel('BACK_PANEL')
    ]

    // Test text rendering mode (useBoundingBox=false)
    render(<MarkingVisualizer boxes={boxes} generator={generator} useBoundingBox={false} />)

    expect(screen.getAllByTestId('drei-plane').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/FRAGILE/i).length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('drei-text').length).toBeGreaterThan(0)
  })
})
