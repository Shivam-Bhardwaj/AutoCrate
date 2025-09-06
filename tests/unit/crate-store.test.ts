import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCrateStore } from '@/store/crate-store';
import { calculateSkidConfiguration } from '@/utils/skid-calculations';

vi.mock('@/utils/skid-calculations', () => ({
  calculateSkidConfiguration: vi.fn(() => ({
    count: 3,
    spacing: 20,
    dimensions: {
      width: 4,
      height: 5,
    },
    requiresRubStrips: false,
  })),
}));

describe('CrateStore', () => {
  beforeEach(() => {
    // Reset store to default state
    useCrateStore.setState({
      configuration: {
        projectName: 'New Crate Project',
        dimensions: {
          length: 48,
          width: 40,
          height: 40,
        },
        base: {
          type: 'standard',
          floorboardThickness: 0.75,
          skidHeight: 5,
          skidWidth: 4,
          skidCount: 3,
          skidSpacing: 20,
          requiresRubStrips: false,
          material: 'pine',
        },
        cap: {
          topPanel: {
            thickness: 0.75,
            material: 'plywood',
            reinforcement: false,
            ventilation: {
              enabled: false,
              type: 'holes',
              count: 4,
              size: 2,
            },
          },
          frontPanel: {
            thickness: 0.75,
            material: 'plywood',
            reinforcement: false,
            ventilation: {
              enabled: false,
              type: 'holes',
              count: 4,
              size: 2,
            },
          },
          backPanel: {
            thickness: 0.75,
            material: 'plywood',
            reinforcement: false,
            ventilation: {
              enabled: false,
              type: 'holes',
              count: 4,
              size: 2,
            },
          },
          leftPanel: {
            thickness: 0.75,
            material: 'plywood',
            reinforcement: false,
            ventilation: {
              enabled: false,
              type: 'holes',
              count: 4,
              size: 2,
            },
          },
          rightPanel: {
            thickness: 0.75,
            material: 'plywood',
            reinforcement: false,
            ventilation: {
              enabled: false,
              type: 'holes',
              count: 4,
              size: 2,
            },
          },
        },
        fasteners: {
          type: 'nails',
          size: '1/8 inch',
          spacing: 6,
          material: 'steel',
        },
        vinyl: {
          enabled: false,
          type: 'waterproof',
          thickness: 0.008,
          coverage: 'full',
        },
        weight: {
          product: 500,
        },
        specialRequirements: [],
      },
    });
    vi.clearAllMocks();
  });
  describe('initial state', () => {
    it('should have default configuration', () => {
      const state = useCrateStore.getState();

      expect(state.configuration.dimensions.length).toBe(48);
      expect(state.configuration.dimensions.width).toBe(40);
      expect(state.configuration.dimensions.height).toBe(40);
    });

    it('should have default project name', () => {
      const state = useCrateStore.getState();
      expect(state.configuration.projectName).toBe('New Crate Project');
    });

    it('should have default weight configuration', () => {
      const state = useCrateStore.getState();

      expect(state.configuration.weight.product).toBe(500);
    });

    it('should have default base configuration', () => {
      const state = useCrateStore.getState();
      const base = state.configuration.base;

      expect(base.type).toBe('standard');
      expect(base.floorboardThickness).toBe(0.75);
      expect(base.material).toBe('pine');
      expect(base.skidHeight).toBe(5);
      expect(base.skidWidth).toBe(4);
      expect(base.skidCount).toBe(3);
      expect(base.skidSpacing).toBe(20);
      expect(base.requiresRubStrips).toBe(false);
    });

    it('should have default panel configurations', () => {
      const state = useCrateStore.getState();
      const { cap } = state.configuration;

      // Check all panels have default config
      ['topPanel', 'frontPanel', 'backPanel', 'leftPanel', 'rightPanel'].forEach((panelKey) => {
        const panel = cap[panelKey as keyof typeof cap];
        expect(panel.thickness).toBe(0.75);
        expect(panel.material).toBe('plywood');
        expect(panel.reinforcement).toBe(false);
        expect(panel.ventilation).toEqual({
          enabled: false,
          type: 'holes',
          count: 4,
          size: 2,
        });
      });
    });

    it('should have default fasteners configuration', () => {
      const state = useCrateStore.getState();
      const { fasteners } = state.configuration;

      expect(fasteners.type).toBe('nails');
      expect(fasteners.size).toBe('1/8 inch');
      expect(fasteners.spacing).toBe(6);
      expect(fasteners.material).toBe('steel');
    });

    it('should have default vinyl configuration', () => {
      const state = useCrateStore.getState();
      const { vinyl } = state.configuration;

      expect(vinyl.enabled).toBe(false);
      expect(vinyl.type).toBe('waterproof');
      expect(vinyl.thickness).toBe(0.008);
      expect(vinyl.coverage).toBe('full');
    });

    it('should have empty special requirements', () => {
      const state = useCrateStore.getState();
      expect(state.configuration.specialRequirements).toEqual([]);
    });
  });

  describe('updateDimensions', () => {
    it('should update dimensions', () => {
      const state = useCrateStore.getState();

      state.updateDimensions({
        length: 60,
        width: 50,
      });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.dimensions.length).toBe(60);
      expect(updatedState.configuration.dimensions.width).toBe(50);
      expect(updatedState.configuration.dimensions.height).toBe(40); // unchanged
    });

    it('should update single dimension', () => {
      const state = useCrateStore.getState();

      state.updateDimensions({ height: 55 });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.dimensions.length).toBe(48); // unchanged
      expect(updatedState.configuration.dimensions.width).toBe(40); // unchanged
      expect(updatedState.configuration.dimensions.height).toBe(55);
    });

    it('should recalculate skid configuration when dimensions change', () => {
      const state = useCrateStore.getState();

      state.updateDimensions({ length: 72, width: 60 });

      expect(calculateSkidConfiguration).toHaveBeenCalledWith(
        { length: 72, width: 60, height: 40 },
        600 // 500 * 1.2
      );
    });

    it('should handle all dimensions at once', () => {
      const state = useCrateStore.getState();

      state.updateDimensions({
        length: 96,
        width: 48,
        height: 72,
      });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.dimensions).toEqual({
        length: 96,
        width: 48,
        height: 72,
      });
    });
  });

  describe('updateWeight', () => {
    it('should update weight configuration', () => {
      const state = useCrateStore.getState();

      state.updateWeight({ product: 750 });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.weight.product).toBe(750);
    });

    it('should update product weight only', () => {
      const state = useCrateStore.getState();

      state.updateWeight({ product: 850 });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.weight.product).toBe(850);
    });

    it('should recalculate skid configuration when weight changes', () => {
      const state = useCrateStore.getState();

      state.updateWeight({ product: 2000 });

      expect(calculateSkidConfiguration).toHaveBeenCalledWith(
        { length: 48, width: 40, height: 40 },
        2400 // 2000 * 1.2
      );
    });
  });

  describe('updateBase', () => {
    it('should update base type', () => {
      const state = useCrateStore.getState();

      state.updateBase({ type: 'heavy-duty' });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.base.type).toBe('heavy-duty');
    });

    it('should update base material', () => {
      const state = useCrateStore.getState();

      state.updateBase({ material: 'oak' });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.base.material).toBe('oak');
    });

    it('should update multiple base properties', () => {
      const state = useCrateStore.getState();

      state.updateBase({
        type: 'reinforced',
        material: 'hardwood',
        floorboardThickness: 1.0,
      });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.base.type).toBe('reinforced');
      expect(updatedState.configuration.base.material).toBe('hardwood');
      expect(updatedState.configuration.base.floorboardThickness).toBe(1.0);
      // skidHeight is calculated automatically and can't be manually updated
      expect(updatedState.configuration.base.skidHeight).toBe(5); // Remains unchanged
    });

    it('should not allow manual update of calculated skid properties', () => {
      const state = useCrateStore.getState();
      const originalSkidHeight = state.configuration.base.skidHeight;
      const originalRequiresRubStrips = state.configuration.base.requiresRubStrips;

      // Try to manually update calculated fields (should be ignored)
      state.updateBase({
        requiresRubStrips: true,
        skidHeight: 10,
        skidWidth: 8,
        skidCount: 5,
        skidSpacing: 15,
      });

      const updatedState = useCrateStore.getState();
      // These calculated fields should remain unchanged
      expect(updatedState.configuration.base.requiresRubStrips).toBe(originalRequiresRubStrips);
      expect(updatedState.configuration.base.skidHeight).toBe(originalSkidHeight);
      expect(updatedState.configuration.base.skidWidth).toBe(4);
      expect(updatedState.configuration.base.skidCount).toBe(3);
      expect(updatedState.configuration.base.skidSpacing).toBe(20);
    });
  });

  describe('updatePanel', () => {
    it('should update panel thickness', () => {
      const state = useCrateStore.getState();

      state.updatePanel('topPanel', { thickness: 1.25 });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.cap.topPanel.thickness).toBe(1.25);
    });

    it('should update panel material', () => {
      const state = useCrateStore.getState();

      state.updatePanel('frontPanel', { material: 'osb' });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.cap.frontPanel.material).toBe('osb');
    });

    it('should update panel reinforcement', () => {
      const state = useCrateStore.getState();

      state.updatePanel('backPanel', { reinforcement: true });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.cap.backPanel.reinforcement).toBe(true);
    });

    it('should update panel ventilation', () => {
      const state = useCrateStore.getState();

      state.updatePanel('leftPanel', {
        ventilation: {
          enabled: true,
          type: 'slots',
          count: 6,
          size: 3,
        },
      });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.cap.leftPanel.ventilation).toEqual({
        enabled: true,
        type: 'slots',
        count: 6,
        size: 3,
      });
    });

    it('should update multiple panels', () => {
      const state = useCrateStore.getState();

      state.updatePanel('topPanel', { thickness: 1.0, material: 'hardwood' });
      state.updatePanel('frontPanel', { thickness: 0.5, reinforcement: true });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.cap.topPanel.thickness).toBe(1.0);
      expect(updatedState.configuration.cap.topPanel.material).toBe('hardwood');
      expect(updatedState.configuration.cap.frontPanel.thickness).toBe(0.5);
      expect(updatedState.configuration.cap.frontPanel.reinforcement).toBe(true);
    });

    it('should handle all panel types', () => {
      const state = useCrateStore.getState();
      const panels: Array<keyof typeof state.configuration.cap> = [
        'topPanel',
        'frontPanel',
        'backPanel',
        'leftPanel',
        'rightPanel',
      ];

      panels.forEach((panelKey, index) => {
        state.updatePanel(panelKey, { thickness: 0.5 + index * 0.25 });
      });

      const updatedState = useCrateStore.getState();
      panels.forEach((panelKey, index) => {
        expect(updatedState.configuration.cap[panelKey].thickness).toBe(0.5 + index * 0.25);
      });
    });
  });

  describe('updateFasteners', () => {
    it('should update fastener type', () => {
      const state = useCrateStore.getState();

      state.updateFasteners({ type: 'screws' });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.fasteners.type).toBe('screws');
    });

    it('should update fastener size', () => {
      const state = useCrateStore.getState();

      state.updateFasteners({ size: '1/4 inch' });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.fasteners.size).toBe('1/4 inch');
    });

    it('should update fastener spacing', () => {
      const state = useCrateStore.getState();

      state.updateFasteners({ spacing: 12 });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.fasteners.spacing).toBe(12);
    });

    it('should update fastener material', () => {
      const state = useCrateStore.getState();

      state.updateFasteners({ material: 'stainless' });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.fasteners.material).toBe('stainless');
    });

    it('should update multiple fastener properties', () => {
      const state = useCrateStore.getState();

      state.updateFasteners({
        type: 'bolts',
        size: '3/8 inch',
        spacing: 8,
        material: 'galvanized',
      });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.fasteners).toEqual({
        type: 'bolts',
        size: '3/8 inch',
        spacing: 8,
        material: 'galvanized',
      });
    });
  });

  describe('updateVinyl', () => {
    it('should toggle vinyl enabled', () => {
      const state = useCrateStore.getState();

      state.updateVinyl({ enabled: true });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.vinyl.enabled).toBe(true);
    });

    it('should update vinyl type', () => {
      const state = useCrateStore.getState();

      state.updateVinyl({ type: 'standard' });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.vinyl.type).toBe('standard');
    });

    it('should update vinyl thickness', () => {
      const state = useCrateStore.getState();

      state.updateVinyl({ thickness: 0.012 });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.vinyl.thickness).toBe(0.012);
    });

    it('should update vinyl coverage', () => {
      const state = useCrateStore.getState();

      state.updateVinyl({ coverage: 'partial' });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.vinyl.coverage).toBe('partial');
    });

    it('should update multiple vinyl properties', () => {
      const state = useCrateStore.getState();

      state.updateVinyl({
        enabled: true,
        type: 'reinforced',
        thickness: 0.015,
        coverage: 'full',
      });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.vinyl).toEqual({
        enabled: true,
        type: 'reinforced',
        thickness: 0.015,
        coverage: 'full',
      });
    });
  });

  describe('updateProjectName', () => {
    it('should update project name', () => {
      const state = useCrateStore.getState();

      state.updateProjectName('Custom Shipping Crate');

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.projectName).toBe('Custom Shipping Crate');
    });

    it('should handle empty project name', () => {
      const state = useCrateStore.getState();

      state.updateProjectName('');

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.projectName).toBe('');
    });

    it('should handle long project names', () => {
      const state = useCrateStore.getState();
      const longName = 'A'.repeat(200);

      state.updateProjectName(longName);

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.projectName).toBe(longName);
    });
  });

  describe('resetConfiguration', () => {
    it('should reset to default configuration', () => {
      const state = useCrateStore.getState();

      // Make some changes
      state.updateDimensions({ length: 100 });
      state.updateWeight({ product: 2000 });
      state.updateBase({ type: 'heavy-duty' });
      state.updateProjectName('Modified Project');
      state.updateVinyl({ enabled: true });

      // Reset
      state.resetConfiguration();

      // Check defaults restored
      const resetState = useCrateStore.getState();
      expect(resetState.configuration.dimensions.length).toBe(48);
      expect(resetState.configuration.weight.product).toBe(500);
      expect(resetState.configuration.base.type).toBe('standard');
      expect(resetState.configuration.projectName).toBe('New Crate Project');
      expect(resetState.configuration.vinyl.enabled).toBe(false);
    });

    it('should reset all panels to default', () => {
      const state = useCrateStore.getState();

      // Modify panels
      state.updatePanel('topPanel', { thickness: 2.0, material: 'metal' });
      state.updatePanel('frontPanel', { reinforcement: true });

      // Reset
      state.resetConfiguration();

      // Check panels restored
      const resetState = useCrateStore.getState();
      expect(resetState.configuration.cap.topPanel.thickness).toBe(0.75);
      expect(resetState.configuration.cap.topPanel.material).toBe('plywood');
      expect(resetState.configuration.cap.frontPanel.reinforcement).toBe(false);
    });

    it('should reset skid configuration on reset', () => {
      const state = useCrateStore.getState();

      // Make changes
      state.updateDimensions({ length: 100 });
      state.updateWeight({ product: 2000 });

      // Reset
      state.resetConfiguration();

      // Check skid config is reset to defaults
      const resetState = useCrateStore.getState();
      expect(resetState.configuration.base.skidHeight).toBe(5);
      expect(resetState.configuration.base.skidWidth).toBe(4);
      expect(resetState.configuration.base.skidCount).toBe(3);
      expect(resetState.configuration.base.skidSpacing).toBe(20);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple consecutive updates', () => {
      const state = useCrateStore.getState();

      state.updateDimensions({ length: 60 });
      state.updateDimensions({ width: 45 });
      state.updateDimensions({ height: 50 });

      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.dimensions).toEqual({
        length: 60,
        width: 45,
        height: 50,
      });
    });

    it('should maintain other configurations when updating one', () => {
      const state = useCrateStore.getState();

      // Set initial values
      state.updateWeight({ product: 750 });
      state.updateBase({ material: 'oak' });
      state.updateVinyl({ enabled: true });

      // Update dimensions
      state.updateDimensions({ length: 72 });

      // Check other values unchanged
      const updatedState = useCrateStore.getState();
      expect(updatedState.configuration.weight.product).toBe(750);
      expect(updatedState.configuration.base.material).toBe('oak');
      expect(updatedState.configuration.vinyl.enabled).toBe(true);
      expect(updatedState.configuration.dimensions.length).toBe(72);
    });

    it('should handle subscriptions correctly', () => {
      const listener = vi.fn();
      const unsubscribe = useCrateStore.subscribe(listener);

      const state = useCrateStore.getState();
      state.updateDimensions({ length: 60 });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
      state.updateDimensions({ length: 70 });

      // Should not be called after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
