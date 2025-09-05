import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputForms from '@/components/InputForms';

describe('InputForms Basic Tests', () => {
  it('should render all main tabs', () => {
    render(<InputForms />);

    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByText('Panels')).toBeInTheDocument();
    expect(screen.getByText('Fasteners')).toBeInTheDocument();
    expect(screen.getByText('Vinyl')).toBeInTheDocument();
  });

  it('should render project name input', () => {
    render(<InputForms />);

    const projectNameInput = screen.getByLabelText(/project name/i);
    expect(projectNameInput).toBeInTheDocument();
    expect(projectNameInput).toHaveValue('New Crate Project');
  });

  it('should render dimension inputs', () => {
    render(<InputForms />);

    expect(screen.getByLabelText(/length/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
    // There are multiple weight inputs - check for product weight specifically
    expect(screen.getByLabelText(/product weight/i)).toBeInTheDocument();
  });

  it('should be able to click tabs', () => {
    render(<InputForms />);

    const baseTab = screen.getByText('Base');
    const panelsTab = screen.getByText('Panels');
    const fastenersTab = screen.getByText('Fasteners');
    const vinylTab = screen.getByText('Vinyl');

    // Just verify we can click them without errors
    fireEvent.click(baseTab);
    fireEvent.click(panelsTab);
    fireEvent.click(fastenersTab);
    fireEvent.click(vinylTab);

    // If we got here without errors, the test passes
    expect(true).toBe(true);
  });
});
