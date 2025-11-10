import { fireEvent, render, screen } from '@testing-library/react'
import TutorialOverlay, { type TutorialOverlayProps } from '../TutorialOverlay'

const steps: TutorialOverlayProps['steps'] = [
  {
    id: 'step-1',
    title: 'Datum setup',
    description: 'Set origin and datum planes.',
    expressions: ['overall_width', 'SKID_X1'],
    expressionValues: { overall_width: 120, SKID_X1: -20 },
    tips: ['Primary datum at Z=0']
  },
  {
    id: 'step-2',
    title: 'Create skid block',
    description: 'Use SKID_X1..Z2 expressions',
    expressions: ['SKID_X2'],
    expressionValues: { SKID_X2: 20 }
  }
]

describe('TutorialOverlay', () => {
  it('returns null when inactive or no steps', () => {
    const { container } = render(
      <TutorialOverlay
        active={false}
        stepIndex={0}
        steps={steps}
        onClose={jest.fn()}
        onPrev={jest.fn()}
        onNext={jest.fn()}
      />
    )

    expect(container.firstChild).toBeNull()

    const { container: emptySteps } = render(
      <TutorialOverlay
        active={true}
        stepIndex={0}
        steps={[]}
        onClose={jest.fn()}
        onPrev={jest.fn()}
        onNext={jest.fn()}
      />
    )

    expect(emptySteps.firstChild).toBeNull()
  })

  it('renders grouped expressions with copy feedback and navigation', () => {
    const handleClose = jest.fn()
    const handlePrev = jest.fn()
    const handleNext = jest.fn()
    const handleCopy = jest.fn()

    const { rerender } = render(
      <TutorialOverlay
        active
        stepIndex={0}
        steps={steps}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
        onCopy={handleCopy}
      />
    )

    expect(screen.getByText('Tutorial: Datum setup')).toBeInTheDocument()
    expect(screen.getByText('Set origin and datum planes.')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()
    expect(screen.getByText(/^overall$/i)).toBeInTheDocument()
    const overallButton = screen.getByRole('button', { name: 'overall_width' })
    fireEvent.click(overallButton)
    expect(handleCopy).toHaveBeenCalledWith('overall_width')
    expect(screen.getByText('Copied overall_width to clipboard.')).toBeInTheDocument()

    const skidToggleInitial = screen.getByText(/^skid$/i).closest('button')
    expect(skidToggleInitial).toBeTruthy()
    fireEvent.click(skidToggleInitial as HTMLButtonElement)
    const skidCopyButton = screen.getByRole('button', { name: 'SKID_X1' })
    fireEvent.click(skidCopyButton)
    expect(handleCopy).toHaveBeenLastCalledWith('SKID_X1')
    expect(handleCopy).toHaveBeenCalledWith('SKID_X1')
    expect(screen.getByText('Copied SKID_X1 to clipboard.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(handleNext).toHaveBeenCalled()

    rerender(
      <TutorialOverlay
        active
        stepIndex={1}
        steps={steps}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
        onCopy={handleCopy}
      />
    )

    expect(screen.getByText('Copied to clipboard.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prev' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Prev' }))
    expect(handlePrev).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(handleClose).toHaveBeenCalled()
  })
})
