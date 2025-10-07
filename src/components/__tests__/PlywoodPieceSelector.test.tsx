import { render, screen, fireEvent } from '@testing-library/react'
import { PlywoodPieceSelector } from '../PlywoodPieceSelector'
import { NXBox } from '@/lib/nx-generator'

describe('PlywoodPieceSelector', () => {
  const makePiece = (overrides: Partial<NXBox> = {}): NXBox => ({
    name: overrides.name ?? 'FRONT_PANEL_PLY_1',
    type: 'plywood',
    point1: overrides.point1 ?? { x: 0, y: 0, z: 0 },
    point2: overrides.point2 ?? { x: 10, y: 1, z: 5 },
    color: overrides.color ?? '#abcdef',
    plywoodPieceIndex: overrides.plywoodPieceIndex ?? 0,
    panelName: overrides.panelName ?? 'FRONT_PANEL',
    suppressed: overrides.suppressed ?? false,
    metadata: overrides.metadata ?? '10" x 5"'
  })

  const panels: NXBox[] = [
    makePiece({ name: 'FRONT_PANEL_PLY_1', plywoodPieceIndex: 0, panelName: 'FRONT_PANEL' }),
    makePiece({ name: 'FRONT_PANEL_PLY_2', plywoodPieceIndex: 1, panelName: 'FRONT_PANEL', point1: { x: 10, y: 0, z: 0 }, point2: { x: 20, y: 1, z: 5 } }),
    makePiece({ name: 'BACK_PANEL_PLY_1', plywoodPieceIndex: 0, panelName: 'BACK_PANEL', point1: { x: 0, y: 0, z: 0 }, point2: { x: 8, y: 1, z: 5 }, color: '#ff0000' }),
    makePiece({ name: 'BACK_PANEL_PLY_2', plywoodPieceIndex: 1, panelName: 'BACK_PANEL', suppressed: true })
  ]

  it('groups pieces by panel and toggles visibility', () => {
    const onPieceToggle = jest.fn()

    render(<PlywoodPieceSelector boxes={panels} onPieceToggle={onPieceToggle} />)

    // Front panel should be selected by default
    expect(screen.getByRole('button', { name: 'FRONT' })).toBeInTheDocument()
    expect(screen.getByText(/Piece 1/)).toBeInTheDocument()
    expect(screen.getByText(/Piece 2/)).toBeInTheDocument()

    // Toggle first piece
    const firstCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(firstCheckbox)
    expect(onPieceToggle).toHaveBeenCalledWith('FRONT_PANEL_PLY_1')

    // Switch to back panel and ensure suppressed piece displays disabled checkbox
    fireEvent.click(screen.getByRole('button', { name: 'BACK' }))
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)
    expect(checkboxes[0]).not.toBeDisabled()
    expect(checkboxes[1]).toBeDisabled()
  })
})
