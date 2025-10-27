import { fireEvent, render, screen } from '@testing-library/react'
import { VisualChecklist } from '../VisualChecklist'

const clickYes = () => {
  fireEvent.click(screen.getByRole('button', { name: /Yes$/ }))
}

describe('VisualChecklist', () => {
  it('walks through questions and shows progress', () => {
    render(<VisualChecklist />)

    expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument()
    expect(screen.getByText(/Visual Checklist/)).toBeInTheDocument()

    clickYes()
    expect(screen.getByText(/Question 2 of/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /No$/ }))
    expect(screen.getByText(/failed/i)).toBeInTheDocument()
  })

  it('completes checklist and allows restart/close', () => {
    const handleClose = jest.fn()
    render(<VisualChecklist onClose={handleClose} />)

    const totalQuestionsText = screen.getByText(/Question 1 of/i).textContent || ''
    const totalQuestions = Number(totalQuestionsText.replace(/.*of\s(\d+).*/, '$1'))

    for (let i = 0; i < totalQuestions; i++) {
      clickYes()
    }

    expect(screen.getByText(/Visual Check Complete/)).toBeInTheDocument()
    expect(screen.getByText(/Passed/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restart Checklist' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(handleClose).toHaveBeenCalled()
  })
})
