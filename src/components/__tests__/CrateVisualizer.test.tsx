import { render } from '@testing-library/react'
import CrateVisualizer from '../CrateVisualizer'
import { NXGenerator, CrateConfig, NXBox } from '@/lib/nx-generator'

const generator = new NXGenerator({
  product: { length: 60, width: 40, height: 35, weight: 450 },
  clearances: { side: 2, end: 2, top: 3 },
  materials: {
    skidSize: '4x4',
    plywoodThickness: 0.25,
    panelThickness: 1,
    cleatSize: '1x4',
    allow3x4Lumber: false
  }
} as CrateConfig)

const makeBox = (name: string, type: NXBox['type'], point1: NXBox['point1'], point2: NXBox['point2']): NXBox => ({
  name,
  type,
  point1,
  point2,
  color: '#ccc'
})

describe('CrateVisualizer', () => {
  it('renders without crashing using mocked drei primitives', () => {
    const boxes: NXBox[] = [
      makeBox('SKID', 'skid', { x: -10, y: 0, z: 0 }, { x: 10, y: 2, z: 2 }),
      makeBox('FRONT_PANEL', 'panel', { x: -20, y: -1, z: 0 }, { x: 20, y: 1, z: 40 })
    ]

    expect(() =>
      render(
        <CrateVisualizer
          boxes={boxes}
          showGrid
          showLabels
          showOutlines
          generator={generator}
          showMarkings
        />
      )
    ).not.toThrow()
  })
})
