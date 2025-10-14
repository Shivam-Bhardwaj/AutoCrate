import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkingsSection } from '../MarkingsSection'
import { CrateConfig } from '@/lib/nx-generator'

describe('MarkingsSection', () => {
  const baseConfig: CrateConfig = {
    product: {
      length: 100,
      width: 80,
      height: 60,
      weight: 5000
    },
    clearances: {
      side: 2,
      end: 2,
      top: 3
    },
    materials: {
      skidSize: '4x4',
      plywoodThickness: 0.25,
      panelThickness: 1,
      cleatSize: '1x4',
      allow3x4Lumber: false
    },
    markings: {
      appliedMaterialsLogo: false,
      fragileStencil: true,
      handlingSymbols: true,
      autocrateText: true
    }
  }

  it('renders default markings summary and notifies changes', async () => {
    const onMarkingsChange = jest.fn()
    const user = userEvent.setup()

    render(<MarkingsSection config={baseConfig} onMarkingsChange={onMarkingsChange} />)

    expect(screen.getByText('Markings & Decals')).toBeInTheDocument()
    expect(screen.getByText(/Crate Height:/)).toBeInTheDocument()
    expect(screen.getByText(/Fragile \(4\)/)).toBeInTheDocument()
    expect(screen.getByText(/Handling \(4\)/)).toBeInTheDocument()
    expect(screen.getByText(/AUTOCRATE \(4\)/)).toBeInTheDocument()

    // Initial effect fires once with default markings
    expect(onMarkingsChange).toHaveBeenCalledWith({
      appliedMaterialsLogo: false,
      fragileStencil: true,
      handlingSymbols: true,
      autocrateText: true
    })

    // Toggle the fragile marking off
    const fragileCheckbox = screen.getAllByRole('checkbox')[0]
    await user.click(fragileCheckbox)

    await waitFor(() => {
      expect(onMarkingsChange).toHaveBeenLastCalledWith({
        appliedMaterialsLogo: false,
        fragileStencil: false,
        handlingSymbols: true,
        autocrateText: true
      })
    })

    expect(screen.queryByText(/Fragile \(4\)/)).not.toBeInTheDocument()
    expect(screen.getByText(/Handling \(4\)/)).toBeInTheDocument()
  })
})
