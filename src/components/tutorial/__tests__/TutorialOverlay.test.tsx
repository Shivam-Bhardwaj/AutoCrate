import { fireEvent, render, screen } from '@testing-library/react'
import TutorialOverlay from '../TutorialOverlay'

const steps = [
  {
    id: 'step-1',
    title: 'Datum setup',
    description: 'Set origin and datum planes.',
    expressions: ['overall_width'],
    tips: ['Primary datum at Z=0']
  },
  {
    id: 'step-2',
    title: 'Create skid block',
    description: 'Use SKID_X1..Z2 expressions',
    expressions: ['SKID_X1', 'SKID_X2']
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

  it('renders current step, handles navigation, and copy button', () => {
    const handleClose = jest.fn()
    const handlePrev = jest.fn()
    const handleNext = jest.fn()
    const handleCopy = jest.fn()

    render(
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

    // Prev disabled on first step
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()

    const copyButton = screen.getByRole('button', { name: 'overall_width' })
    fireEvent.click(copyButton)
    expect(handleCopy).toHaveBeenCalledWith('overall_width')

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(handleNext).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(handleClose).toHaveBeenCalled()
  })
})
