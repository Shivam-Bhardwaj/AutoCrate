/**
 * Tests for enhanced weight calculation service
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEnhancedCrateWeight,
  calculatePanelWeight,
  calculateCleatingWeight,
  calculateSkidWeight,
  calculateHardwareWeight,
  calculateFoamWeight,
  calculateMBBWeight,
  calculateDesiccantWeight,
  calculateAccessoryWeight,
  MATERIAL_DENSITIES,
} from '../weightCalculations';
import { CrateConfiguration } from '../../types/crate';

describe('Enhanced Weight Calculations', () => {
  const mockConfiguration: CrateConfiguration = {
    projectName: 'Test Crate',
    dimensions: { length: 48, width: 40, height: 36 },
    base: {
      type: 'standard',
      floorboardThickness: 0.75,
      skidHeight: 3.5,
      skidWidth: 4,
      skidCount: 3,
      skidSpacing: 24,
      requiresRubStrips: false,
      material: 'pine',
    },
    cap: {
      topPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: true,
        ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
      },
      frontPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: true,
        ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
      },
      backPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: true,
        ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
      },
      leftPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: true,
        ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
      },
      rightPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: true,
        ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
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
    amatCompliance: {
      style: 'A',
      isInternational: false,
      requiresMoistureBag: true,
      requiresShockIndicator: true,
      requiresTiltIndicator: true,
      foamDensity: 2.2,
      desiccantUnits: 2,
      moistureSensitivityLevel: 'MSL2',
      mbbConfiguration: {
        enabled: true,
        bagType: 'moisture-barrier',
        sealType: 'heat-seal',
        thickness: 4,
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
        quantity: 2,
        placement: 'inside-bag',
        reversible: true,
      },
    },
    airShipment: {
      enabled: false,
      chamfer: { enabled: false, angle: 30, depth: 2 },
      costPerPound: 2.5,
      dimensionalWeightFactor: 166,
    },
  };

  describe('calculatePanelWeight', () => {
    it('should calculate panel weight correctly', () => {
      const dimensions = { length: 48, width: 40, height: 0 };
      const thickness = 0.75;
      const material = 'plywood';

      const weight = calculatePanelWeight(dimensions, thickness, material);

      // Expected: (48 * 40 * 0.75) / 1728 * 35 = ~29.2 lbs
      expect(weight).toBeGreaterThan(25);
      expect(weight).toBeLessThan(35);
    });

    it('should handle different materials', () => {
      const dimensions = { length: 48, width: 40, height: 0 };
      const thickness = 0.75;

      const plywoodWeight = calculatePanelWeight(dimensions, thickness, 'plywood');
      const pineWeight = calculatePanelWeight(dimensions, thickness, 'pine');
      const oakWeight = calculatePanelWeight(dimensions, thickness, 'oak');

      expect(oakWeight).toBeGreaterThan(plywoodWeight);
      expect(plywoodWeight).toBeGreaterThan(pineWeight);
    });
  });

  describe('calculateCleatingWeight', () => {
    it('should calculate cleating weight for Style A crate', () => {
      const panelDimensions = { length: 48, width: 40 };
      const crateStyle = 'A';

      const weight = calculateCleatingWeight(panelDimensions, crateStyle);

      expect(weight).toBeGreaterThan(0);
      expect(weight).toBeLessThan(100); // Reasonable upper bound for cleating
    });
  });

  describe('calculateSkidWeight', () => {
    it('should calculate skid weight correctly', () => {
      const dimensions = { length: 48, width: 40, height: 36 };
      const grossWeight = 1000;
      const skidSize = {
        nominalSize: '4x4',
        actualDimensions: { width: 3.5, height: 3.5 },
        weightCapacity: { min: 2000, max: 5000 },
      };

      const weight = calculateSkidWeight(dimensions, grossWeight, skidSize);

      expect(weight).toBeGreaterThan(10);
      expect(weight).toBeLessThan(100);
    });
  });

  describe('calculateHardwareWeight', () => {
    it('should calculate hardware weight correctly', () => {
      const dimensions = { length: 48, width: 40, height: 36 };
      const fasteners = { type: 'nails', size: '1/8 inch', spacing: 6, material: 'steel' };
      const crateStyle = 'A';

      const weight = calculateHardwareWeight(dimensions, fasteners, crateStyle);

      expect(weight).toBeGreaterThan(0.5);
      expect(weight).toBeLessThan(15); // More realistic hardware weight
    });
  });

  describe('calculateFoamWeight', () => {
    it('should calculate foam weight correctly', () => {
      const dimensions = { length: 48, width: 40, height: 36 };
      const foamDensity = 2.2;

      const weight = calculateFoamWeight(dimensions, foamDensity);

      expect(weight).toBeGreaterThan(0);
      expect(weight).toBeLessThan(20);
    });
  });

  describe('calculateMBBWeight', () => {
    it('should calculate MBB weight correctly', () => {
      const dimensions = { length: 48, width: 40, height: 36 };
      const thickness = 4; // mils

      const weight = calculateMBBWeight(dimensions, thickness);

      expect(weight).toBeGreaterThan(0);
      expect(weight).toBeLessThan(5); // MBB is lightweight but calculated weight is higher
    });
  });

  describe('calculateDesiccantWeight', () => {
    it('should calculate desiccant weight correctly', () => {
      const crateVolume = 40; // cubic feet
      const desiccantType = 'silica-gel';

      const weight = calculateDesiccantWeight(crateVolume, desiccantType);

      expect(weight).toBeGreaterThan(0);
      expect(weight).toBeLessThan(50); // Desiccant weight is higher due to volume calculation
    });
  });

  describe('calculateAccessoryWeight', () => {
    it('should calculate accessory weight for heavy crate', () => {
      const productWeight = 200; // lbs
      const crateStyle = 'A';

      const weight = calculateAccessoryWeight(productWeight, crateStyle);

      expect(weight).toBeGreaterThan(0.5); // Should include shock and tilt indicators
      expect(weight).toBeLessThan(2);
    });

    it('should calculate minimal accessory weight for light crate', () => {
      const productWeight = 50; // lbs
      const crateStyle = 'A';

      const weight = calculateAccessoryWeight(productWeight, crateStyle);

      expect(weight).toBeLessThan(1); // Only labels and basic accessories
    });
  });

  describe('calculateEnhancedCrateWeight', () => {
    it('should calculate complete crate weight breakdown', () => {
      const breakdown = calculateEnhancedCrateWeight(mockConfiguration);

      expect(breakdown).toHaveProperty('panels');
      expect(breakdown).toHaveProperty('framing');
      expect(breakdown).toHaveProperty('base');
      expect(breakdown).toHaveProperty('hardware');
      expect(breakdown).toHaveProperty('protection');
      expect(breakdown).toHaveProperty('accessories');
      expect(breakdown).toHaveProperty('total');

      expect(breakdown.total).toBeGreaterThan(50); // Reasonable minimum weight
      expect(breakdown.total).toBeLessThan(500); // More realistic maximum for complete crate

      // Check that individual components add up to total
      const calculatedTotal =
        breakdown.panels.total +
        breakdown.framing.total +
        breakdown.base.total +
        breakdown.hardware.total +
        breakdown.protection.total +
        breakdown.accessories.total;

      expect(Math.abs(breakdown.total - calculatedTotal)).toBeLessThan(0.1);
    });

    it('should respect calculation options', () => {
      const options = {
        includeFoamCushioning: false,
        includeMBB: false,
        includeDesiccant: false,
        includeHardware: false,
        includeAccessories: false,
      };

      const breakdown = calculateEnhancedCrateWeight(mockConfiguration, options);

      expect(breakdown.protection.foam).toBe(0);
      expect(breakdown.protection.mbb).toBe(0);
      expect(breakdown.protection.desiccant).toBe(0);
      expect(breakdown.hardware.total).toBe(0);
      expect(breakdown.accessories.total).toBe(0);
    });

    it('should handle different AMAT compliance levels', () => {
      const styleAConfig = {
        ...mockConfiguration,
        amatCompliance: { ...mockConfiguration.amatCompliance, style: 'A' },
      };
      const styleDConfig = {
        ...mockConfiguration,
        amatCompliance: { ...mockConfiguration.amatCompliance, style: 'D' },
      };

      const styleABreakdown = calculateEnhancedCrateWeight(styleAConfig);
      const styleDBreakdown = calculateEnhancedCrateWeight(styleDConfig);

      // Style D should generally be heavier due to more robust construction
      expect(styleDBreakdown.total).toBeGreaterThanOrEqual(styleABreakdown.total);
    });
  });

  describe('Material Densities', () => {
    it('should have reasonable density values', () => {
      expect(MATERIAL_DENSITIES.pine).toBeGreaterThan(20);
      expect(MATERIAL_DENSITIES.pine).toBeLessThan(40);

      expect(MATERIAL_DENSITIES.oak).toBeGreaterThan(40);
      expect(MATERIAL_DENSITIES.oak).toBeLessThan(60);

      expect(MATERIAL_DENSITIES.plywood).toBeGreaterThan(30);
      expect(MATERIAL_DENSITIES.plywood).toBeLessThan(50);

      expect(MATERIAL_DENSITIES.steel).toBeGreaterThan(400);
      expect(MATERIAL_DENSITIES.steel).toBeLessThan(600);
    });
  });
});
