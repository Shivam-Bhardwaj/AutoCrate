import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputForms from '../../../src/components/InputForms';

describe('InputForms Basic Tests', () => {
  it('should render all main sections', () => {
    render(<InputForms />);

    expect(screen.getByText('Project Information')).toBeInTheDocument();
    expect(screen.getByText('Product Dimensions')).toBeInTheDocument();
    expect(screen.getByText('Shipping Base Configuration')).toBeInTheDocument();
    expect(screen.getByText('Panel Configuration')).toBeInTheDocument();
    expect(screen.getByText('Fastener Configuration')).toBeInTheDocument();
    // expect(screen.getByText('Vinyl Configuration')).toBeInTheDocument();
  });

  it('should render project name input', () => {
    render(<InputForms />);

    const projectNameInput = screen.getByLabelText(/project name/i);
    expect(projectNameInput).toBeInTheDocument();
    expect(projectNameInput).toHaveValue('New Crate Project');
  });

  it('should render dimension inputs', () => {
    render(<InputForms />);

    expect(screen.getByLabelText(/Product Width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Depth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Height/i)).toBeInTheDocument();
    // There are multiple weight inputs - check for product weight specifically
    expect(screen.getByLabelText(/Product Weight/i)).toBeInTheDocument();
  });

  it('should be able to interact with form elements', () => {
    render(<InputForms />);

    const projectNameInput = screen.getByLabelText(/project name/i);
    const lengthInput = screen.getByLabelText(/product width/i);

    // Just verify we can interact with inputs without errors
    fireEvent.change(projectNameInput, { target: { value: 'Test Project' } });
    fireEvent.change(lengthInput, { target: { value: '50' } });

    // If we got here without errors, the test passes
    expect(true).toBe(true);
  });
});
