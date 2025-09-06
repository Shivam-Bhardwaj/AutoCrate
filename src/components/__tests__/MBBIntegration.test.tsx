import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MBBConfigurationSection } from '@/components/MBBConfigurationSection';
import { useCrateStore } from '@/store/crate-store';

// Mock the store
vi.mock('@/store/crate-store');
vi.mock('@/store/logs-store', () => ({
  useLogsStore: () => ({
    addLog: vi.fn(),
  }),
}));

describe('MBB Integration', () => {
  it('renders when moisture bag is required', () => {
    (useCrateStore as any).mockReturnValue({
      configuration: {
        dimensions: { length: 48, width: 40, height: 40 },
        amatCompliance: {
          requiresMoistureBag: true,
          moistureSensitivityLevel: 'MSL2',
          isESDSensitive: false,
          mbbConfiguration: {
            enabled: true,
            bagType: 'moisture-barrier',
            sealType: 'heat-seal',
            thickness: 3.0,
            materialType: 'polyethylene',
            sealIntegrityTest: true,
          },
          desiccantConfiguration: {
            type: 'silica-gel',
            quantity: 100,
            packaging: 'sachet',
            placement: 'inside-bag',
          },
          humidityIndicator: {
            type: '30%',
            quantity: 1,
            placement: 'inside-bag',
            reversible: true,
          },
        },
      },
      updateAMATCompliance: vi.fn(),
    });

    render(<MBBConfigurationSection />);

    expect(screen.getByText('SEMI E137 Moisture Barrier Bag Configuration')).toBeInTheDocument();
    expect(screen.getByText('Moisture Sensitivity Level (MSL)')).toBeInTheDocument();
  });

  it('does not render when moisture bag is not required', () => {
    (useCrateStore as any).mockReturnValue({
      configuration: {
        dimensions: { length: 48, width: 40, height: 40 },
        amatCompliance: {
          requiresMoistureBag: false,
        },
      },
      updateAMATCompliance: vi.fn(),
    });

    const { container } = render(<MBBConfigurationSection />);
    expect(container.firstChild).toBeNull();
  });
});
