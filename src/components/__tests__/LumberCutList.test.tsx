import { render, screen } from '@testing-library/react'
import { LumberCutList } from '../LumberCutList'
import { LumberCutList as LumberCutListData } from '@/lib/nx-generator'

const mockCutList: LumberCutListData = {
  skids: [
    { description: 'Primary skids', material: '4x4', length: 48, count: 3, notes: 'Primary skids' },
    { description: 'Secondary skids', material: '4x4', length: 36, count: 2, notes: 'Secondary skids' }
  ],
  floorboards: [
    { description: 'Full length', material: '2x6', length: 96, count: 8, notes: 'Full length' },
    { description: 'Half length', material: '2x6', length: 48, count: 2, notes: 'Half length' }
  ],
  cleats: [
    {
      panel: 'FRONT_PANEL',
      items: [
        { orientation: 'vertical', length: 72, count: 4, types: ['edge', 'intermediate'] },
        { orientation: 'horizontal', length: 48, count: 2, types: ['top', 'bottom'] }
      ]
    },
    {
      panel: 'BACK_PANEL',
      items: [
        { orientation: 'vertical', length: 72, count: 4, types: ['edge', 'intermediate'] }
      ]
    }
  ],
  plywood: [
    {
      panel: 'FRONT_PANEL',
      sheetCount: 1,
      isRotated: false,
      pieces: [
        { width: 48, height: 72, count: 1 }
      ]
    },
    {
      panel: 'TOP_PANEL',
      sheetCount: 2,
      isRotated: true,
      pieces: [
        { width: 96, height: 48, count: 1 },
        { width: 48, height: 48, count: 1 }
      ]
    }
  ],
  summary: {
    cleatLinearFeet: 45.5,
    cleatBoardCount: 6,
    totalPlywoodSheets: 3,
    plywoodThickness: 0.25
  }
}

describe('LumberCutList', () => {
  it('should render all sections', () => {
    render(<LumberCutList cutList={mockCutList} />)

    expect(screen.getByText('Skids')).toBeInTheDocument()
    expect(screen.getByText('Floorboards')).toBeInTheDocument()
    expect(screen.getByText('Cleats')).toBeInTheDocument()
    expect(screen.getByText('Plywood Panels')).toBeInTheDocument()
  })

  it('should render skid data correctly', () => {
    render(<LumberCutList cutList={mockCutList} />)

    expect(screen.getAllByText('4x4').length).toBeGreaterThan(0)
    expect(screen.getAllByText('48"').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
    expect(screen.getByText('Primary skids')).toBeInTheDocument()
  })

  it('should render floorboard data correctly', () => {
    render(<LumberCutList cutList={mockCutList} />)

    expect(screen.getAllByText('2x6').length).toBeGreaterThan(0)
    expect(screen.getAllByText('96"').length).toBeGreaterThan(0)
    expect(screen.getAllByText('8').length).toBeGreaterThan(0)
    expect(screen.getByText('Full length')).toBeInTheDocument()
  })

  it('should render cleat summary', () => {
    render(<LumberCutList cutList={mockCutList} />)

    expect(screen.getByText(/Total: 45\.5 ft/)).toBeInTheDocument()
    expect(screen.getByText(/Est\. 1x4 boards: 6/)).toBeInTheDocument()
  })

  it('should format panel names correctly', () => {
    render(<LumberCutList cutList={mockCutList} />)

    expect(screen.getAllByText('Front Panel').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Back Panel').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Top Panel').length).toBeGreaterThan(0)
  })

  it('should display cleat orientations', () => {
    render(<LumberCutList cutList={mockCutList} />)

    expect(screen.getAllByText('Vertical').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Horizontal').length).toBeGreaterThan(0)
  })

  it('should display cleat types', () => {
    render(<LumberCutList cutList={mockCutList} />)

    const edgeTypes = screen.getAllByText('Edge, Intermediate')
    expect(edgeTypes).toHaveLength(2)
    expect(screen.getByText('Top, Bottom')).toBeInTheDocument()
  })

  it('should display plywood sheet counts', () => {
    render(<LumberCutList cutList={mockCutList} />)

    expect(screen.getByText(/Sheets required: 1/)).toBeInTheDocument()
    expect(screen.getByText(/Sheets required: 2/)).toBeInTheDocument()
  })

  it('should indicate rotated panels', () => {
    render(<LumberCutList cutList={mockCutList} />)

    expect(screen.getByText(/Standard orientation/)).toBeInTheDocument()
    expect(screen.getByText(/Rotated 90° orientation/)).toBeInTheDocument()
  })

  it('should display plywood summary', () => {
    render(<LumberCutList cutList={mockCutList} />)

    expect(screen.getByText(/Total sheets: 3/)).toBeInTheDocument()
    expect(screen.getByText(/Thickness: 0\.25"/)).toBeInTheDocument()
  })

  it('should render empty sections gracefully', () => {
    const emptyCutList: LumberCutListData = {
      skids: [],
      floorboards: [],
      cleats: [],
      plywood: [],
      summary: {
        cleatLinearFeet: 0,
        cleatBoardCount: 0,
        totalPlywoodSheets: 0,
        plywoodThickness: 0.25
      }
    }

    render(<LumberCutList cutList={emptyCutList} />)

    // Should still render section headers
    expect(screen.getByText('Skids')).toBeInTheDocument()
    expect(screen.getByText('Floorboards')).toBeInTheDocument()
  })

  it('should format dimensions with proper units', () => {
    const cutList: LumberCutListData = {
      ...mockCutList,
      plywood: [
        {
          panel: 'TEST_PANEL',
          sheetCount: 1,
          isRotated: false,
          pieces: [{ width: 48.5, height: 72.25, count: 1 }]
        }
      ]
    }

    render(<LumberCutList cutList={cutList} />)

    expect(screen.getByText(/48\.5" × 72\.25"/)).toBeInTheDocument()
  })
})
