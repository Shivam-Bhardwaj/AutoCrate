import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import InputForms from '@/components/InputForms';
import { renderHook, act } from '@testing-library/react';
import { useCrateStore } from '@/store/crate-store';

describe('InputForms Component', () => {
  describe('Dimensions Tab', () => {
    it('should render dimension inputs', () => {
      render(<InputForms />);

      expect(screen.getByText('Dimensions')).toBeInTheDocument();

      // Click on Dimensions tab
      fireEvent.click(screen.getByText('Dimensions'));

      expect(screen.getByLabelText(/length/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/width/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
    });

    it('should display current dimension values from store', () => {
      const { result } = renderHook(() => useCrateStore());

      act(() => {
        result.current.updateDimensions({
          length: 1500,
          width: 900,
          height: 700,
        });
      });

      render(<InputForms />);
      fireEvent.click(screen.getByText('Dimensions'));

      const lengthInput = screen.getByLabelText(/length/i) as HTMLInputElement;
      const widthInput = screen.getByLabelText(/width/i) as HTMLInputElement;
      const heightInput = screen.getByLabelText(/height/i) as HTMLInputElement;

      expect(lengthInput.value).toBe('1500');
      expect(widthInput.value).toBe('900');
      expect(heightInput.value).toBe('700');
    });

    it('should update store when dimension values change', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useCrateStore());

      render(<InputForms />);
      fireEvent.click(screen.getByText('Dimensions'));

      const lengthInput = screen.getByLabelText(/length/i);

      await user.clear(lengthInput);
      await user.type(lengthInput, '2000');

      await waitFor(() => {
        expect(result.current.configuration.dimensions.length).toBe(2000);
      });
    });

    it('should validate dimension inputs', async () => {
      const user = userEvent.setup();

      render(<InputForms />);
      fireEvent.click(screen.getByText('Dimensions'));

      const lengthInput = screen.getByLabelText(/length/i);

      // Test negative value
      await user.clear(lengthInput);
      await user.type(lengthInput, '-100');

      // Input should not accept negative values
      expect((lengthInput as HTMLInputElement).value).not.toBe('-100');
    });
  });

  describe('Base Configuration Tab', () => {
    it('should render base configuration inputs', () => {
      render(<InputForms />);

      fireEvent.click(screen.getByText('Base'));

      expect(screen.getByLabelText(/base type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/floorboard thickness/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/skid height/i)).toBeInTheDocument();
    });

    it('should update base type', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useCrateStore());

      render(<InputForms />);
      fireEvent.click(screen.getByText('Base'));

      const baseTypeSelect = screen.getByLabelText(/base type/i);
      await user.selectOptions(baseTypeSelect, 'heavy-duty');

      await waitFor(() => {
        expect(result.current.configuration.base.type).toBe('heavy-duty');
      });
    });

    it('should update material selection', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useCrateStore());

      render(<InputForms />);
      fireEvent.click(screen.getByText('Base'));

      const materialSelect = screen.getByLabelText(/material/i);
      await user.selectOptions(materialSelect, 'oak');

      await waitFor(() => {
        expect(result.current.configuration.base.material).toBe('oak');
      });
    });
  });

  describe('Panels Tab', () => {
    it('should render panel configuration inputs', () => {
      render(<InputForms />);

      fireEvent.click(screen.getByText('Panels'));

      expect(screen.getByText(/top panel/i)).toBeInTheDocument();
      expect(screen.getByText(/front panel/i)).toBeInTheDocument();
      expect(screen.getByText(/back panel/i)).toBeInTheDocument();
    });

    it('should toggle panel enabled state', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useCrateStore());

      render(<InputForms />);
      fireEvent.click(screen.getByText('Panels'));

      // Find the top panel enabled checkbox
      const topPanelSwitch = screen.getAllByRole('switch')[0];
      await user.click(topPanelSwitch);

      await waitFor(() => {
        expect(result.current.configuration.cap.topPanel.enabled).toBe(false);
      });
    });

    it('should update panel thickness', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useCrateStore());

      render(<InputForms />);
      fireEvent.click(screen.getByText('Panels'));

      const thicknessInputs = screen.getAllByLabelText(/thickness/i);
      const topPanelThickness = thicknessInputs[0];

      await user.clear(topPanelThickness);
      await user.type(topPanelThickness, '30');

      await waitFor(() => {
        expect(result.current.configuration.cap.topPanel.thickness).toBe(30);
      });
    });
  });

  describe('Fasteners Tab', () => {
    it('should render fastener configuration inputs', () => {
      render(<InputForms />);

      fireEvent.click(screen.getByText('Fasteners'));

      expect(screen.getByLabelText(/fastener type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/spacing/i)).toBeInTheDocument();
    });

    it('should update fastener type', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useCrateStore());

      render(<InputForms />);
      fireEvent.click(screen.getByText('Fasteners'));

      const fastenerTypeSelect = screen.getByLabelText(/fastener type/i);
      await user.selectOptions(fastenerTypeSelect, 'screws');

      await waitFor(() => {
        expect(result.current.configuration.fasteners.type).toBe('screws');
      });
    });

    it('should update fastener spacing', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useCrateStore());

      render(<InputForms />);
      fireEvent.click(screen.getByText('Fasteners'));

      const spacingInput = screen.getByLabelText(/spacing/i);

      await user.clear(spacingInput);
      await user.type(spacingInput, '200');

      await waitFor(() => {
        expect(result.current.configuration.fasteners.spacing).toBe(200);
      });
    });
  });

  describe('Vinyl Tab', () => {
    it('should render vinyl configuration inputs', () => {
      render(<InputForms />);

      fireEvent.click(screen.getByText('Vinyl'));

      expect(screen.getByLabelText(/enable vinyl wrapping/i)).toBeInTheDocument();
    });

    it('should toggle vinyl enabled state', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useCrateStore());

      render(<InputForms />);
      fireEvent.click(screen.getByText('Vinyl'));

      const vinylSwitch = screen.getByLabelText(/enable vinyl wrapping/i);
      await user.click(vinylSwitch);

      await waitFor(() => {
        expect(result.current.configuration.vinyl.enabled).toBe(true);
      });
    });

    it('should show vinyl options when enabled', async () => {
      const user = userEvent.setup();

      render(<InputForms />);
      fireEvent.click(screen.getByText('Vinyl'));

      const vinylSwitch = screen.getByLabelText(/enable vinyl wrapping/i);
      await user.click(vinylSwitch);

      await waitFor(() => {
        expect(screen.getByLabelText(/vinyl type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/thickness/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/coverage/i)).toBeInTheDocument();
      });
    });

    it('should update vinyl configuration', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useCrateStore());

      render(<InputForms />);
      fireEvent.click(screen.getByText('Vinyl'));

      // Enable vinyl first
      const vinylSwitch = screen.getByLabelText(/enable vinyl wrapping/i);
      await user.click(vinylSwitch);

      // Update vinyl type
      const vinylTypeSelect = await screen.findByLabelText(/vinyl type/i);
      await user.selectOptions(vinylTypeSelect, 'vapor-barrier');

      await waitFor(() => {
        expect(result.current.configuration.vinyl.type).toBe('vapor-barrier');
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', () => {
      render(<InputForms />);

      // Check initial tab
      expect(screen.getByLabelText(/length/i)).toBeInTheDocument();

      // Switch to Base tab
      fireEvent.click(screen.getByText('Base'));
      expect(screen.getByLabelText(/base type/i)).toBeInTheDocument();

      // Switch to Panels tab
      fireEvent.click(screen.getByText('Panels'));
      expect(screen.getByText(/top panel/i)).toBeInTheDocument();

      // Switch back to Dimensions tab
      fireEvent.click(screen.getByText('Dimensions'));
      expect(screen.getByLabelText(/length/i)).toBeInTheDocument();
    });

    it('should maintain state when switching tabs', async () => {
      const user = userEvent.setup();

      render(<InputForms />);

      // Update dimension
      const lengthInput = screen.getByLabelText(/length/i);
      await user.clear(lengthInput);
      await user.type(lengthInput, '2000');

      // Switch to another tab and back
      fireEvent.click(screen.getByText('Base'));
      fireEvent.click(screen.getByText('Dimensions'));

      // Value should be preserved
      const lengthInputAfter = screen.getByLabelText(/length/i) as HTMLInputElement;
      expect(lengthInputAfter.value).toBe('2000');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<InputForms />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);

      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(<InputForms />);

      const lengthInput = screen.getByLabelText(/length/i);

      // Tab to the input
      await user.tab();
      await user.tab();
      await user.tab();

      // Check if we can type in the focused element
      await user.type(document.activeElement as HTMLElement, '1234');
    });
  });
});
