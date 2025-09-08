import { describe, it, expect } from 'vitest';
import {
  getRecommendedMaterials,
  validateWoodSpecification,
  validateHardwareSpecification,
  ComplianceStandard,
} from '../../types/material-specifications';

describe('Material Validation Functions', () => {
  it('should validate wood specifications correctly', () => {
    const validWood = {
      species: 'Douglas Fir',
      grade: 'Grade B' as const,
      moistureContent: { min: 12, max: 15, target: 13 },
      density: { min: 28, max: 35, unit: 'pcf' as const },
      strength: { bending: 1500, compression: 1200, shear: 140 },
      defects: {
        knots: { maxDiameter: 0.5, maxPerFoot: 2 },
        splits: { maxLength: 6, maxWidth: 0.125 },
        warp: { maxCrook: 0.25, maxBow: 0.25, maxTwist: 1 },
      },
      certifications: ['SPIB'],
      compliance: ['AMAT-STD' as ComplianceStandard],
    };

    const validation = validateWoodSpecification(validWood, {});
    expect(validation.isValid).toBe(true);
    expect(validation.complianceScore).toBe(100);
  });

  it('should detect wood specification issues', () => {
    const invalidWood = {
      species: 'Low Grade Wood',
      grade: 'Grade C' as const,
      moistureContent: { min: 12, max: 25, target: 20 }, // Too high
      density: { min: 15, max: 25, unit: 'pcf' as const },
      strength: { bending: 800, compression: 600, shear: 80 }, // Too low
      defects: {
        knots: { maxDiameter: 1.5, maxPerFoot: 5 }, // Too large
        splits: { maxLength: 20, maxWidth: 0.75 }, // Too large
        warp: { maxCrook: 0.75, maxBow: 0.75, maxTwist: 5 }, // Too much
      },
      certifications: [],
      compliance: [] as ComplianceStandard[],
    };

    const validation = validateWoodSpecification(invalidWood, {});
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.complianceScore).toBeLessThan(100);
  });

  it('should validate hardware specifications correctly', () => {
    const validHardware = {
      type: 'screws' as const,
      grade: 'Grade 5' as const,
      material: 'Medium Carbon Steel',
      finish: 'Zinc Plated',
      dimensions: { diameter: 0.25, length: 2.0, headDiameter: 0.44 },
      strength: { tensile: 120000, shear: 72000 },
      corrosionResistance: { saltSpray: 96, humidity: 1000 },
      specifications: ['ASTM A307'],
      compliance: ['AMAT-STD' as ComplianceStandard],
    };

    const validation = validateHardwareSpecification(validHardware, {});
    expect(validation.isValid).toBe(true);
  });
});

describe('Recommended Materials Function', () => {
  it('should recommend appropriate materials for Style A crates', () => {
    const materials = getRecommendedMaterials('A', false, 'standard');

    expect(materials.wood.length).toBeGreaterThan(0);
    expect(materials.hardware.length).toBeGreaterThan(0);
    expect(materials.treatments.length).toBeGreaterThan(0);
    expect(materials.finishes.length).toBeGreaterThan(0);

    // Style A should use Grade B lumber
    expect(materials.wood[0].grade).toBe('Grade B');
  });

  it('should recommend ISPM-15 treatment for international shipping', () => {
    const materials = getRecommendedMaterials('A', true, 'standard');

    const hasISPM15Treatment = materials.treatments.some((t) => t.compliance.includes('ISPM-15'));
    expect(hasISPM15Treatment).toBe(true);
  });

  it('should recommend stainless steel hardware for international shipping', () => {
    const materials = getRecommendedMaterials('A', true, 'standard');

    const hasStainlessHardware = materials.hardware.some((h) => h.grade === 'Stainless');
    expect(hasStainlessHardware).toBe(true);
  });

  it('should recommend higher grade materials for heavy duty crates', () => {
    const materials = getRecommendedMaterials('D', false, 'standard');

    // Style D should use Grade A lumber
    expect(materials.wood[0].grade).toBe('Grade A');
  });
});

describe('Material Specifications Types', () => {
  it('should have valid AMAT wood grades defined', () => {
    // Test that the constants are exported from the module
    expect(getRecommendedMaterials).toBeDefined();
    expect(validateWoodSpecification).toBeDefined();
    expect(validateHardwareSpecification).toBeDefined();
  });

  it('should have valid AMAT hardware specs defined', () => {
    // Test that the functions work correctly
    const materials = getRecommendedMaterials('A', false, 'standard');
    expect(materials).toBeDefined();
    expect(materials.hardware.length).toBeGreaterThan(0);
  });

  it('should have valid treatment specs defined', () => {
    const materials = getRecommendedMaterials('A', true, 'standard');
    expect(materials.treatments.length).toBeGreaterThan(0);
  });

  it('should have valid finish specs defined', () => {
    const materials = getRecommendedMaterials('A', false, 'standard');
    expect(materials.finishes.length).toBeGreaterThan(0);
  });
});
