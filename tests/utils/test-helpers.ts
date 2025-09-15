import { Page, expect } from '@playwright/test';
import { CrateConfiguration } from '../../src/types/crate';

/**
 * Test utilities and helpers for AutoCrate testing
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to the main application
   */
  async navigateToApp() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for the 3D viewer to be ready
   */
  async waitFor3DViewer() {
    await this.page.waitForSelector('[data-testid="three-canvas"]', { timeout: 10000 });
    // Wait a bit more for Three.js to initialize
    await this.page.waitForTimeout(1000);
  }

  /**
   * Fill in product dimensions
   */
  async fillProductDimensions(dimensions: { length: number; width: number; height: number; weight: number }) {
    await this.page.fill('[data-testid="product-length"]', dimensions.length.toString());
    await this.page.fill('[data-testid="product-width"]', dimensions.width.toString());
    await this.page.fill('[data-testid="product-height"]', dimensions.height.toString());
    await this.page.fill('[data-testid="product-weight"]', dimensions.weight.toString());
  }

  /**
   * Select material type
   */
  async selectMaterial(materialType: 'plywood' | 'hardwood' | 'steel') {
    await this.page.click(`[data-testid="material-${materialType}"]`);
  }

  /**
   * Configure crate settings
   */
  async configureCrate(settings: {
    clearance?: number;
    wallThickness?: number;
    baseThickness?: number;
    lidThickness?: number;
  }) {
    if (settings.clearance !== undefined) {
      await this.page.fill('[data-testid="clearance"]', settings.clearance.toString());
    }
    if (settings.wallThickness !== undefined) {
      await this.page.fill('[data-testid="wall-thickness"]', settings.wallThickness.toString());
    }
    if (settings.baseThickness !== undefined) {
      await this.page.fill('[data-testid="base-thickness"]', settings.baseThickness.toString());
    }
    if (settings.lidThickness !== undefined) {
      await this.page.fill('[data-testid="lid-thickness"]', settings.lidThickness.toString());
    }
  }

  /**
   * Export STEP file
   */
  async exportSTEP(options: {
    includePMI?: boolean;
    includeMaterials?: boolean;
    includeHardware?: boolean;
  } = {}) {
    await this.page.click('[data-testid="export-step-button"]');
    
    if (options.includePMI !== undefined) {
      await this.page.setChecked('[data-testid="include-pmi"]', options.includePMI);
    }
    if (options.includeMaterials !== undefined) {
      await this.page.setChecked('[data-testid="include-materials"]', options.includeMaterials);
    }
    if (options.includeHardware !== undefined) {
      await this.page.setChecked('[data-testid="include-hardware"]', options.includeHardware);
    }
    
    await this.page.click('[data-testid="confirm-export"]');
    
    // Wait for download to start
    const downloadPromise = this.page.waitForEvent('download');
    const download = await downloadPromise;
    
    return download;
  }

  /**
   * Export PDF
   */
  async exportPDF() {
    await this.page.click('[data-testid="export-pdf-button"]');
    
    // Wait for download to start
    const downloadPromise = this.page.waitForEvent('download');
    const download = await downloadPromise;
    
    return download;
  }

  /**
   * Toggle PMI annotations
   */
  async togglePMI(enable: boolean) {
    await this.page.setChecked('[data-testid="show-pmi"]', enable);
  }

  /**
   * Toggle measurement tools
   */
  async toggleMeasurements(enable: boolean) {
    await this.page.setChecked('[data-testid="enable-measurements"]', enable);
  }

  /**
   * Take a screenshot of the 3D viewer
   */
  async screenshot3DViewer(name: string) {
    const canvas = this.page.locator('[data-testid="three-canvas"]');
    await canvas.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * Verify 3D viewer is rendering
   */
  async verify3DViewerRendering() {
    const canvas = this.page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toBeVisible();
    
    // Check if canvas has content (not just empty)
    const canvasElement = await canvas.elementHandle();
    const context = await canvasElement?.evaluate((canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      
      // Check if canvas has been drawn on
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Check if any pixel is not transparent
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true; // Alpha channel > 0
      }
      return false;
    });
    
    expect(context).toBeTruthy();
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(url: string, method: string = 'POST') {
    return this.page.waitForResponse(response => 
      response.url().includes(url) && response.request().method() === method
    );
  }

  /**
   * Mock API responses
   */
  async mockAPIResponse(url: string, response: any, status: number = 200) {
    await this.page.route(url, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Simulate mobile viewport
   */
  async simulateMobile() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Simulate tablet viewport
   */
  async simulateTablet() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  /**
   * Simulate desktop viewport
   */
  async simulateDesktop() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  /**
   * Check accessibility
   */
  async checkAccessibility() {
    // Run axe-core accessibility tests
    const accessibilityScanResults = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as any).axe) {
          (window as any).axe.run().then(resolve);
        } else {
          resolve({ violations: [] });
        }
      });
    });
    
    return accessibilityScanResults;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    return metrics;
  }
}

/**
 * Default test configurations
 */
export const defaultTestConfig: CrateConfiguration = {
  product: {
    length: 100,
    width: 80,
    height: 60,
    weight: 500,
    description: 'Test Product'
  },
  materials: {
    plywood: {
      thickness: 0.75,
      grade: 'Marine',
      supplier: 'Test Supplier'
    },
    hardwood: {
      thickness: 1.0,
      grade: 'Oak',
      supplier: 'Test Supplier'
    },
    steel: {
      thickness: 0.125,
      grade: 'Galvanized',
      supplier: 'Test Supplier'
    }
  },
  hardware: {
    screws: {
      type: 'Wood Screws',
      size: '#8 x 1.5"',
      quantity: 24
    },
    handles: {
      type: 'Lifting Handles',
      size: 'Heavy Duty',
      quantity: 4
    }
  },
  clearance: {
    sides: 2,
    top: 3,
    bottom: 1
  }
};

/**
 * Test data fixtures
 */
export const testFixtures = {
  smallProduct: {
    length: 50,
    width: 40,
    height: 30,
    weight: 100
  },
  mediumProduct: {
    length: 100,
    width: 80,
    height: 60,
    weight: 500
  },
  largeProduct: {
    length: 200,
    width: 150,
    height: 100,
    weight: 2000
  },
  heavyProduct: {
    length: 150,
    width: 120,
    height: 80,
    weight: 5000
  }
};

