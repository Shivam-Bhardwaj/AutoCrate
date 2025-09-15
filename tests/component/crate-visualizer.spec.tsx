import { test, expect } from '@playwright/experimental-ct-react';
import { CrateVisualizer } from '../../src/components/cad-viewer/CrateVisualizer';
import { mockThreeJSComponents, mockChildComponents, setupComponentTest } from '../utils/component-test-utils';
import { testConfigurations } from '../fixtures/test-data';

// Setup component test environment
setupComponentTest();

test.describe('CrateVisualizer Component', () => {
  test.beforeEach(async ({ mount }) => {
    // Mock Three.js components
    jest.mock('@react-three/fiber', () => mockThreeJSComponents);
    jest.mock('@react-three/drei', () => mockThreeJSComponents);
    
    // Mock child components
    jest.mock('../../src/components/cad-viewer/CrateAssembly', () => mockChildComponents);
    jest.mock('../../src/components/cad-viewer/PMIAnnotations', () => mockChildComponents);
    jest.mock('../../src/components/cad-viewer/MeasurementTools', () => mockChildComponents);
    jest.mock('../../src/components/cad-viewer/PerformanceMonitor', () => mockChildComponents);
  });

  test('renders the 3D visualization canvas', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={testConfigurations.basic}
        showPMI={false}
        enableMeasurement={false}
      />
    );
    
    await expect(component.locator('[data-testid="three-canvas"]')).toBeVisible();
  });

  test('renders all 3D scene components', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={testConfigurations.basic}
        showPMI={false}
        enableMeasurement={false}
      />
    );
    
    await expect(component.locator('[data-testid="orbit-controls"]')).toBeVisible();
    await expect(component.locator('[data-testid="grid"]')).toBeVisible();
    await expect(component.locator('[data-testid="environment"]')).toBeVisible();
    await expect(component.locator('[data-testid="crate-assembly"]')).toBeVisible();
  });

  test('renders PMI annotations when showPMI is true', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={testConfigurations.basic}
        showPMI={true}
        enableMeasurement={false}
      />
    );
    
    await expect(component.locator('[data-testid="pmi-annotations"]')).toBeVisible();
  });

  test('does not render PMI annotations when showPMI is false', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={testConfigurations.basic}
        showPMI={false}
        enableMeasurement={false}
      />
    );
    
    await expect(component.locator('[data-testid="pmi-annotations"]')).not.toBeVisible();
  });

  test('renders measurement tools when enableMeasurement is true', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={testConfigurations.basic}
        showPMI={false}
        enableMeasurement={true}
      />
    );
    
    await expect(component.locator('[data-testid="measurement-tools"]')).toBeVisible();
  });

  test('does not render measurement tools when enableMeasurement is false', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={testConfigurations.basic}
        showPMI={false}
        enableMeasurement={false}
      />
    );
    
    await expect(component.locator('[data-testid="measurement-tools"]')).not.toBeVisible();
  });

  test('renders performance monitor when showPerformanceStats is true', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={testConfigurations.basic}
        showPMI={false}
        enableMeasurement={false}
        showPerformanceStats={true}
      />
    );
    
    await expect(component.locator('[data-testid="performance-monitor"]')).toBeVisible();
  });

  test('handles both PMI and measurements enabled', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={testConfigurations.basic}
        showPMI={true}
        enableMeasurement={true}
      />
    );
    
    await expect(component.locator('[data-testid="pmi-annotations"]')).toBeVisible();
    await expect(component.locator('[data-testid="measurement-tools"]')).toBeVisible();
  });

  test('handles undefined configuration gracefully', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={undefined as any}
        showPMI={false}
        enableMeasurement={false}
      />
    );
    
    await expect(component.locator('[data-testid="three-canvas"]')).toBeVisible();
  });

  test('updates when configuration changes', async ({ mount }) => {
    const component = await mount(
      <CrateVisualizer
        config={testConfigurations.basic}
        showPMI={false}
        enableMeasurement={false}
      />
    );
    
    await expect(component.locator('[data-testid="crate-assembly"]')).toBeVisible();
    
    // Update configuration
    await component.update(
      <CrateVisualizer
        config={testConfigurations.large}
        showPMI={false}
        enableMeasurement={false}
      />
    );
    
    await expect(component.locator('[data-testid="crate-assembly"]')).toBeVisible();
  });
});

