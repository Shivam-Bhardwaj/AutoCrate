/**
 * Example implementation for Applied Materials drawing generation
 * Demonstrates multi-sheet drawing package creation
 */

import { CrateConfiguration } from '@/types/crate';
import { DrawingGenerator, DrawingPackage } from './drawingGenerator';

/**
 * Example crate configuration for Applied Materials semiconductor equipment
 */
export const EXAMPLE_CRATE_CONFIG: CrateConfiguration = {
  projectName: 'CENTURA REACTION CHAMBER',
  dimensions: {
    length: 72, // inches
    width: 48,  // inches
    height: 36  // inches
  },
  base: {
    type: 'heavy-duty',
    floorboardThickness: 1.5,
    skidHeight: 4,
    skidWidth: 4,
    skidCount: 2,
    skidSpacing: 36,
    requiresRubStrips: true,
    material: 'pine'
  },
  cap: {
    topPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: true,
      ventilation: { enabled: false, type: 'slots', count: 0, size: 0 }
    },
    frontPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: true,
      ventilation: { enabled: true, type: 'slots', count: 4, size: 2 }
    },
    backPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: true,
      ventilation: { enabled: false, type: 'slots', count: 0, size: 0 }
    },
    leftPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'slots', count: 0, size: 0 }
    },
    rightPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'slots', count: 0, size: 0 }
    }
  },
  fasteners: {
    type: 'klimp',
    size: '#10',
    spacing: 6,
    material: 'galvanized'
  },
  vinyl: {
    enabled: true,
    type: 'vapor-barrier',
    thickness: 0.008,
    coverage: 'full'
  },
  weight: {
    product: 1250 // pounds
  },
  specialRequirements: [
    'MOISTURE SENSITIVE DEVICE - ESD PRECAUTIONS REQUIRED',
    'DO NOT EXCEED 45° TILT ANGLE',
    'FORKLIFT ACCESS: FOUR-WAY ENTRY',
    'SHOCK INDICATORS REQUIRED ON ALL FOUR SIDES'
  ],
  amatCompliance: {
    style: 'C',
    isInternational: true,
    requiresMoistureBag: true,
    requiresShockIndicator: true,
    requiresTiltIndicator: true,
    foamDensity: 2.0,
    desiccantUnits: 4,
    moistureSensitivityLevel: 'MSL3',
    isESDSensitive: true
  },
  centerOfGravity: {
    productCoG: { x: 36, y: 24, z: 18 },
    combinedCoG: { x: 36, y: 24, z: 22 }
  }
};

/**
 * Generate complete Applied Materials drawing package
 */
export function generateExampleDrawingPackage(): DrawingPackage {
  const generator = new DrawingGenerator(EXAMPLE_CRATE_CONFIG);
  return generator.generateDrawingPackage();
}

/**
 * Generate sample drawing package with enhanced metadata
 */
export function generateSampleDrawingPackage(
  projectName?: string,
  customConfig?: Partial<CrateConfiguration>
): {
  drawingPackage: DrawingPackage;
  sheetSummary: Array<{
    sheetNumber: number;
    title: string;
    purpose: string;
    views: string[];
    keyFeatures: string[];
  }>;
} {
  const config: CrateConfiguration = {
    ...EXAMPLE_CRATE_CONFIG,
    ...customConfig,
    projectName: projectName || EXAMPLE_CRATE_CONFIG.projectName,
    amatCompliance: {
      ...EXAMPLE_CRATE_CONFIG.amatCompliance,
      ...customConfig?.amatCompliance
    } as any
  };

  const generator = new DrawingGenerator(config);
  const drawingPackage = generator.generateDrawingPackage();
  
  const sheetSummary = [
    {
      sheetNumber: 1,
      title: 'Assembly Drawing with BOM',
      purpose: 'Overall assembly view and parts list',
      views: ['Isometric Assembly', 'Bill of Materials'],
      keyFeatures: [
        'Complete parts list with specifications',
        'Overall assembly dimensions',
        'Weight and center of gravity information',
        'Applied Materials title block'
      ]
    },
    {
      sheetNumber: 2,
      title: 'Layout Views',
      purpose: 'Orthographic projections and dimensions',
      views: ['Top View', 'Front View', 'Right Side View'],
      keyFeatures: [
        'Forklift entry dimensions',
        'Panel thickness specifications',
        'Skid spacing and clearances',
        'Third angle projection standard'
      ]
    },
    {
      sheetNumber: 3,
      title: 'Product Orientation',
      purpose: 'Product placement and handling instructions',
      views: ['Product in Crate', 'Center of Gravity'],
      keyFeatures: [
        'Product positioning guidelines',
        'Handling and lifting instructions',
        'Orientation requirements',
        'Safety and compliance notes'
      ]
    }
  ];

  return {
    drawingPackage,
    sheetSummary
  };
}