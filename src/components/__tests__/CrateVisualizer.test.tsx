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
          generator={generator}
          showMarkings
        />
      )
    ).not.toThrow()
  })

  it('renders tutorial callouts and combines filtered boxes', () => {
    const boxes: NXBox[] = [
      makeBox('SKID', 'skid', { x: -5, y: 0, z: 0 }, { x: 5, y: 2, z: 2 }),
      makeBox('FLOORBOARD_1', 'floor', { x: -4, y: 0, z: 2 }, { x: 4, y: 1, z: 3 }),
      {
        ...makeBox('FRONT_PANEL_PLY_1', 'plywood', { x: -6, y: 0, z: 0 }, { x: 6, y: 1, z: 10 }),
        panelName: 'FRONT_PANEL',
        plywoodPieceIndex: 0,
        suppressed: false
      }
    ]

    const { getByText } = render(
      <CrateVisualizer
        boxes={boxes}
        generator={generator}
        tutorialHighlightNames={['SKID']}
        tutorialCallouts={[{ boxName: 'SKID', label: 'Use: SKID_X1, SKID_X2' }]}
        pmiVisibility={{ totalDimensions: true, skids: true, cleats: true, floor: true, datumPlanes: true }}
      />
    )

    expect(getByText(/Use: SKID_X1, SKID_X2/)).toBeInTheDocument()
  })
})
