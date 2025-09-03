import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { CrateConfiguration } from '@/types/crate';

/**
 * Custom render function that includes providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create a mock crate configuration for testing
 */
export function createMockCrateConfiguration(): CrateConfiguration {
  return {
    dimensions: {
      length: 1200,
      width: 800,
      height: 600,
      unit: 'mm',
    },
    weight: {
      product: 50,
      maxGross: 150,
    },
    base: {
      type: 'standard',
      floorboardThickness: 25,
      skidHeight: 100,
      skidWidth: 100,
      skidCount: 3,
      material: 'pine',
    },
    cap: {
      topPanel: {
        enabled: true,
        thickness: 20,
        material: 'plywood',
        ventilation: false,
      },
      frontPanel: {
        enabled: true,
        thickness: 20,
        material: 'plywood',
        ventilation: false,
      },
      backPanel: {
        enabled: true,
        thickness: 20,
        material: 'plywood',
        ventilation: false,
      },
      leftPanel: {
        enabled: true,
        thickness: 20,
        material: 'plywood',
        ventilation: false,
      },
      rightPanel: {
        enabled: true,
        thickness: 20,
        material: 'plywood',
        ventilation: false,
      },
    },
    accessories: {
      cornerProtectors: false,
      handles: false,
      labels: false,
      moisture: false,
      customMarkings: '',
    },
    fasteners: {
      type: 'nails',
      size: 'medium',
      material: 'steel',
      spacing: 150,
    },
    vinyl: {
      enabled: false,
      type: 'waterproof',
      thickness: 0.5,
      coverage: 'full',
    },
  };
}

/**
 * Helper to create partial crate configuration for testing
 */
export function createPartialCrateConfiguration(
  overrides?: Partial<CrateConfiguration>
): CrateConfiguration {
  return {
    ...createMockCrateConfiguration(),
    ...overrides,
  };
}

/**
 * Mock file for testing file downloads
 */
export function createMockFile(content: string, fileName: string): File {
  const blob = new Blob([content], { type: 'text/plain' });
  return new File([blob], fileName, { type: 'text/plain' });
}

/**
 * Helper to test file download functionality
 */
export function expectFileDownload(
  downloadFn: () => void,
  expectedFileName: string,
  expectedContent?: string
) {
  const createElementSpy = vi.spyOn(document, 'createElement');
  const link = document.createElement('a');
  const clickSpy = vi.spyOn(link, 'click');

  createElementSpy.mockReturnValueOnce(link);

  downloadFn();

  expect(link.download).toBe(expectedFileName);
  if (expectedContent) {
    expect(link.href).toContain('blob:');
  }
  expect(clickSpy).toHaveBeenCalled();

  createElementSpy.mockRestore();
  clickSpy.mockRestore();
}

/**
 * Wait for async updates in tests
 */
export async function waitForAsync(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to test form submission
 */
export async function fillAndSubmitForm(
  getByLabelText: any,
  getByRole: any,
  formData: Record<string, string | number>
) {
  for (const [label, value] of Object.entries(formData)) {
    const input = getByLabelText(new RegExp(label, 'i'));
    await userEvent.type(input, String(value));
  }

  const submitButton = getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);
}

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    return Object.keys(this.store)[index] || null;
  }
}

/**
 * Setup mock localStorage
 */
export function setupMockLocalStorage() {
  const mockStorage = new MockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
}

// Re-export everything from Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
