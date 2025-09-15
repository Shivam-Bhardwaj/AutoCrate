import { test, expect } from '@playwright/experimental-ct-react';
import { DesignStudio } from '../../src/components/design-studio/DesignStudio';
import { setupComponentTest } from '../utils/component-test-utils';
import { testConfigurations } from '../fixtures/test-data';

// Setup component test environment
setupComponentTest();

test.describe('DesignStudio Component', () => {
  test('renders design studio interface', async ({ mount }) => {
    const component = await mount(
      <DesignStudio
        config={testConfigurations.basic}
        onConfigChange={() => {}}
        onExport={() => {}}
      />
    );
    
    await expect(component.locator('[data-testid="design-studio"]')).toBeVisible();
  });

  test('renders configuration panel', async ({ mount }) => {
    const component = await mount(
      <DesignStudio
        config={testConfigurations.basic}
        onConfigChange={() => {}}
        onExport={() => {}}
      />
    );
    
    await expect(component.locator('[data-testid="configuration-panel"]')).toBeVisible();
  });

  test('renders export panel', async ({ mount }) => {
    const component = await mount(
      <DesignStudio
        config={testConfigurations.basic}
        onConfigChange={() => {}}
        onExport={() => {}}
      />
    );
    
    await expect(component.locator('[data-testid="export-panel"]')).toBeVisible();
  });

  test('renders material optimizer', async ({ mount }) => {
    const component = await mount(
      <DesignStudio
        config={testConfigurations.basic}
        onConfigChange={() => {}}
        onExport={() => {}}
      />
    );
    
    await expect(component.locator('[data-testid="material-optimizer"]')).toBeVisible();
  });

  test('renders validation panel', async ({ mount }) => {
    const component = await mount(
      <DesignStudio
        config={testConfigurations.basic}
        onConfigChange={() => {}}
        onExport={() => {}}
      />
    );
    
    await expect(component.locator('[data-testid="validation-panel"]')).toBeVisible();
  });

  test('handles configuration changes', async ({ mount }) => {
    let configChangeCalled = false;
    const handleConfigChange = () => {
      configChangeCalled = true;
    };

    const component = await mount(
      <DesignStudio
        config={testConfigurations.basic}
        onConfigChange={handleConfigChange}
        onExport={() => {}}
      />
    );
    
    // Simulate configuration change
    await component.locator('[data-testid="product-length"]').fill('150');
    
    expect(configChangeCalled).toBe(true);
  });

  test('handles export requests', async ({ mount }) => {
    let exportCalled = false;
    const handleExport = () => {
      exportCalled = true;
    };

    const component = await mount(
      <DesignStudio
        config={testConfigurations.basic}
        onConfigChange={() => {}}
        onExport={handleExport}
      />
    );
    
    // Simulate export request
    await component.locator('[data-testid="export-step-button"]').click();
    
    expect(exportCalled).toBe(true);
  });

  test('displays validation errors', async ({ mount }) => {
    const invalidConfig = {
      ...testConfigurations.basic,
      product: {
        ...testConfigurations.basic.product,
        length: -10 // Invalid negative dimension
      }
    };

    const component = await mount(
      <DesignStudio
        config={invalidConfig}
        onConfigChange={() => {}}
        onExport={() => {}}
      />
    );
    
    await expect(component.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('shows loading state during operations', async ({ mount }) => {
    const component = await mount(
      <DesignStudio
        config={testConfigurations.basic}
        onConfigChange={() => {}}
        onExport={() => {}}
        isLoading={true}
      />
    );
    
    await expect(component.locator('[data-testid="loading-indicator"]')).toBeVisible();
  });

  test('handles different viewport sizes', async ({ mount }) => {
    const component = await mount(
      <DesignStudio
        config={testConfigurations.basic}
        onConfigChange={() => {}}
        onExport={() => {}}
      />
    );
    
    // Test mobile viewport
    await component.locator('[data-testid="design-studio"]').evaluate((el: HTMLElement) => {
      el.style.width = '375px';
    });
    
    await expect(component.locator('[data-testid="design-studio"]')).toBeVisible();
    
    // Test desktop viewport
    await component.locator('[data-testid="design-studio"]').evaluate((el: HTMLElement) => {
      el.style.width = '1920px';
    });
    
    await expect(component.locator('[data-testid="design-studio"]')).toBeVisible();
  });
});


