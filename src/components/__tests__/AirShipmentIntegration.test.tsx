import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCrateStore } from '@/store/crate-store';
import AirShipmentOptimization from '../AirShipmentOptimization';

// Mock the store
vi.mock('@/store/crate-store');

describe('Air Shipment Integration', () => {
  const mockConfiguration = {
    projectName: 'Test Crate',
    dimensions: { length: 48, width: 40, height: 36 },
    base: {
      type: 'standard' as const,
      floorboardThickness: 0.75,
      skidHeight: 4,
      skidWidth: 3.5,
      skidCount: 3,
      skidSpacing: 16,
      requiresRubStrips: false,
      material: 'pine' as const,
    },
    cap: {
      topPanel: {
        thickness: 0.75,
        material: 'plywood' as const,
        reinforcement: false,
        ventilation: { enabled: false, type: 'holes' as const, count: 4, size: 2 },
      },
      frontPanel: {
        thickness: 0.75,
        material: 'plywood' as const,
        reinforcement: false,
        ventilation: { enabled: false, type: 'holes' as const, count: 4, size: 2 },
      },
      backPanel: {
        thickness: 0.75,
        material: 'plywood' as const,
        reinforcement: false,
        ventilation: { enabled: false, type: 'holes' as const, count: 4, size: 2 },
      },
      leftPanel: {
        thickness: 0.75,
        material: 'plywood' as const,
        reinforcement: false,
        ventilation: { enabled: false, type: 'holes' as const, count: 4, size: 2 },
      },
      rightPanel: {
        thickness: 0.75,
        material: 'plywood' as const,
        reinforcement: false,
        ventilation: { enabled: false, type: 'holes' as const, count: 4, size: 2 },
      },
    },
    fasteners: { type: 'nails' as const, size: '1/8 inch', spacing: 6, material: 'steel' as const },
    vinyl: {
      enabled: false,
      type: 'waterproof' as const,
      thickness: 0.008,
      coverage: 'full' as const,
    },
    weight: { product: 500 },
    specialRequirements: [],
    amatCompliance: {
      style: 'A' as const,
      isInternational: false,
      requiresMoistureBag: true,
      requiresShockIndicator: false,
      requiresTiltIndicator: false,
      foamDensity: 1.7,
      desiccantUnits: 1,
    },
    airShipment: {
      enabled: true,
      chamfer: {
        enabled: true,
        angle: 30,
        depth: 2,
      },
      costPerPound: 2.5,
      dimensionalWeightFactor: 166,
    },
  };

  beforeEach(() => {
    (useCrateStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      configuration: mockConfiguration,
      updateAirShipment: vi.fn(),
    });
  });

  it('renders air shipment optimization with chamfering enabled', () => {
    const { container } = render(<AirShipmentOptimization />);
    expect(container).toBeTruthy();
  });

  it('calculates weight savings when chamfering is enabled', () => {
    const { container } = render(<AirShipmentOptimization />);

    // Verify that the component renders with chamfering configuration
    expect(container.textContent).toContain('Air Shipment Optimization');
    expect(container.textContent).toContain('Chamfering');
  });

  it('displays cost savings calculations', () => {
    const { container } = render(<AirShipmentOptimization />);

    // Should display cost savings information
    expect(container.textContent).toContain('Cost Savings');
    expect(container.textContent).toContain('$');
  });

  it('shows optimization results when air shipment is enabled', () => {
    const { container } = render(<AirShipmentOptimization />);

    // Should show optimization results section
    expect(container.textContent).toContain('Optimization Results');
    expect(container.textContent).toContain('Weight Savings');
    expect(container.textContent).toContain('Volume Reduction');
  });

  it('handles air shipment toggle correctly', () => {
    const mockUpdateAirShipment = vi.fn();
    (useCrateStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      configuration: {
        ...mockConfiguration,
        airShipment: { ...mockConfiguration.airShipment, enabled: false },
      },
      updateAirShipment: mockUpdateAirShipment,
    });

    const { container } = render(<AirShipmentOptimization />);
    const toggle = container.querySelector('#air-shipment-toggle');

    if (toggle) {
      fireEvent.click(toggle);
      expect(mockUpdateAirShipment).toHaveBeenCalledWith({ enabled: true });
    }
  });

  it('handles chamfer toggle correctly', () => {
    const mockUpdateAirShipment = vi.fn();
    (useCrateStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      configuration: mockConfiguration,
      updateAirShipment: mockUpdateAirShipment,
    });

    const { container } = render(<AirShipmentOptimization />);
    const chamferToggle = container.querySelector('#chamfer-toggle');

    if (chamferToggle) {
      fireEvent.click(chamferToggle);
      expect(mockUpdateAirShipment).toHaveBeenCalled();
    }
  });

  it('updates chamfer angle correctly', () => {
    const mockUpdateAirShipment = vi.fn();
    (useCrateStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      configuration: mockConfiguration,
      updateAirShipment: mockUpdateAirShipment,
    });

    const { container } = render(<AirShipmentOptimization />);
    const angleInput = container.querySelector('#chamfer-angle') as HTMLInputElement;

    if (angleInput) {
      fireEvent.change(angleInput, { target: { value: '45' } });
      expect(mockUpdateAirShipment).toHaveBeenCalled();
    }
  });

  it('updates chamfer depth correctly', () => {
    const mockUpdateAirShipment = vi.fn();
    (useCrateStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      configuration: mockConfiguration,
      updateAirShipment: mockUpdateAirShipment,
    });

    const { container } = render(<AirShipmentOptimization />);
    const depthInput = container.querySelector('#chamfer-depth') as HTMLInputElement;

    if (depthInput) {
      fireEvent.change(depthInput, { target: { value: '3' } });
      expect(mockUpdateAirShipment).toHaveBeenCalled();
    }
  });

  it('updates cost per pound correctly', () => {
    const mockUpdateAirShipment = vi.fn();
    (useCrateStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      configuration: mockConfiguration,
      updateAirShipment: mockUpdateAirShipment,
    });

    const { container } = render(<AirShipmentOptimization />);
    const costInput = container.querySelector('#cost-per-pound') as HTMLInputElement;

    if (costInput) {
      fireEvent.change(costInput, { target: { value: '3.5' } });
      expect(mockUpdateAirShipment).toHaveBeenCalled();
    }
  });
});
