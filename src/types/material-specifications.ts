// Comprehensive Material Specifications System for AMAT Compliance
// This module provides detailed material specifications for all components used in crate construction

export type WoodGrade =
  | 'Grade A'
  | 'Grade B'
  | 'Grade C'
  | 'Select Structural'
  | 'No.1'
  | 'No.2'
  | 'No.3'
  | 'Construction'
  | 'Standard';
export type HardwareType = 'screws' | 'nails' | 'bolts' | 'brackets' | 'plates' | 'anchors';
export type HardwareGrade =
  | 'Grade 2'
  | 'Grade 5'
  | 'Grade 8'
  | 'Stainless'
  | 'Galvanized'
  | 'Zinc Plated';
export type TreatmentType =
  | 'heat-treatment'
  | 'chemical-treatment'
  | 'pressure-treatment'
  | 'fumigation';
export type FinishType = 'paint' | 'sealant' | 'coating' | 'stain' | 'varnish';
export type ComplianceStandard = 'ISPM-15' | 'ASTM' | 'ANSI' | 'AWPA' | 'NFPA' | 'AMAT-STD';

export interface WoodSpecification {
  species: string;
  grade: WoodGrade;
  moistureContent: {
    min: number;
    max: number;
    target: number;
  };
  density: {
    min: number;
    max: number;
    unit: 'pcf';
  };
  strength: {
    bending: number; // psi
    compression: number; // psi
    shear: number; // psi
  };
  defects: {
    knots: {
      maxDiameter: number; // inches
      maxPerFoot: number;
    };
    splits: {
      maxLength: number; // inches
      maxWidth: number; // inches
    };
    warp: {
      maxCrook: number; // inches per foot
      maxBow: number; // inches per foot
      maxTwist: number; // degrees per foot
    };
  };
  certifications: string[];
  compliance: ComplianceStandard[];
}

export interface HardwareSpecification {
  type: HardwareType;
  grade: HardwareGrade;
  material: string;
  finish: string;
  dimensions: {
    diameter?: number; // inches
    length: number; // inches
    headDiameter?: number; // inches
  };
  strength: {
    tensile: number; // psi
    shear: number; // psi
  };
  corrosionResistance: {
    saltSpray: number; // hours
    humidity: number; // hours
  };
  specifications: string[];
  compliance: ComplianceStandard[];
}

export interface TreatmentSpecification {
  type: TreatmentType;
  temperature?: {
    min: number; // °C
    max: number; // °C
    duration: number; // minutes
  };
  chemicals?: {
    name: string;
    concentration: number; // percentage
    applicationMethod: string;
  }[];
  penetration: {
    minDepth: number; // mm
    uniformity: string;
  };
  certification: {
    required: boolean;
    agency: string;
    standard: string;
  };
  stamp: {
    required: boolean;
    type: string;
    location: string;
  };
  compliance: ComplianceStandard[];
}

export interface FinishSpecification {
  type: FinishType;
  material: string;
  thickness: {
    min: number; // mils
    max: number; // mils
    target: number; // mils
  };
  application: {
    method: string;
    coats: number;
    curing: {
      temperature: number; // °C
      time: number; // hours
    };
  };
  performance: {
    adhesion: number; // ASTM rating
    hardness: number; // pencil hardness
    flexibility: number; // mandrel bend test
    weathering: number; // hours UV exposure
    chemicalResistance: string[];
  };
  color: {
    standard: string;
    tolerance: string;
    gloss: {
      at60: number;
      at85: number;
    };
  };
  compliance: ComplianceStandard[];
}

export interface MaterialValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  complianceScore: number; // 0-100
}

export interface MaterialSpecificationSet {
  wood: WoodSpecification[];
  hardware: HardwareSpecification[];
  treatments: TreatmentSpecification[];
  finishes: FinishSpecification[];
}

// AMAT Standard Material Specifications
export const AMATWoodGrades: Record<string, WoodSpecification> = {
  'Grade A Lumber': {
    species: 'Douglas Fir, Southern Pine, Spruce-Pine-Fir',
    grade: 'Grade A',
    moistureContent: { min: 12, max: 15, target: 13 },
    density: { min: 28, max: 35, unit: 'pcf' },
    strength: { bending: 1500, compression: 1200, shear: 140 },
    defects: {
      knots: { maxDiameter: 0.5, maxPerFoot: 2 },
      splits: { maxLength: 6, maxWidth: 0.125 },
      warp: { maxCrook: 0.25, maxBow: 0.25, maxTwist: 1 },
    },
    certifications: ['SPIB', 'WCLIB', 'NGR'],
    compliance: ['AMAT-STD', 'ASTM'],
  },
  'Grade B Lumber': {
    species: 'Douglas Fir, Southern Pine, Hem-Fir',
    grade: 'Grade B',
    moistureContent: { min: 12, max: 19, target: 15 },
    density: { min: 25, max: 32, unit: 'pcf' },
    strength: { bending: 1200, compression: 1000, shear: 120 },
    defects: {
      knots: { maxDiameter: 0.75, maxPerFoot: 3 },
      splits: { maxLength: 12, maxWidth: 0.25 },
      warp: { maxCrook: 0.375, maxBow: 0.375, maxTwist: 2 },
    },
    certifications: ['SPIB', 'WCLIB'],
    compliance: ['AMAT-STD', 'ASTM'],
  },
  'Grade C Lumber': {
    species: 'Mixed Species',
    grade: 'Grade C',
    moistureContent: { min: 12, max: 19, target: 16 },
    density: { min: 20, max: 28, unit: 'pcf' },
    strength: { bending: 900, compression: 800, shear: 100 },
    defects: {
      knots: { maxDiameter: 1.0, maxPerFoot: 4 },
      splits: { maxLength: 18, maxWidth: 0.5 },
      warp: { maxCrook: 0.5, maxBow: 0.5, maxTwist: 3 },
    },
    certifications: ['Standard Grading'],
    compliance: ['AMAT-STD'],
  },
};

export const AMATHardwareSpecs: Record<string, HardwareSpecification> = {
  'Grade 5 Screws': {
    type: 'screws',
    grade: 'Grade 5',
    material: 'Medium Carbon Steel',
    finish: 'Zinc Plated',
    dimensions: { diameter: 0.25, length: 2.0, headDiameter: 0.44 },
    strength: { tensile: 120000, shear: 72000 },
    corrosionResistance: { saltSpray: 96, humidity: 1000 },
    specifications: ['ASTM A307', 'ASME B18.2.1'],
    compliance: ['AMAT-STD', 'ASTM'],
  },
  'Stainless Steel Nails': {
    type: 'nails',
    grade: 'Stainless',
    material: 'Type 304 Stainless Steel',
    finish: 'Passivated',
    dimensions: { diameter: 0.131, length: 3.0 },
    strength: { tensile: 70000, shear: 42000 },
    corrosionResistance: { saltSpray: 500, humidity: 2000 },
    specifications: ['ASTM F547', 'ASTM F1667'],
    compliance: ['AMAT-STD', 'ASTM'],
  },
  'Galvanized Brackets': {
    type: 'brackets',
    grade: 'Galvanized',
    material: 'Steel',
    finish: 'Hot-Dip Galvanized G90',
    dimensions: { length: 4.0, diameter: 0.125 },
    strength: { tensile: 58000, shear: 35000 },
    corrosionResistance: { saltSpray: 200, humidity: 1500 },
    specifications: ['ASTM A653', 'ASTM A924'],
    compliance: ['AMAT-STD', 'ASTM'],
  },
};

export const AMATTreatmentSpecs: Record<string, TreatmentSpecification> = {
  'ISPM-15 Heat Treatment': {
    type: 'heat-treatment',
    temperature: { min: 56, max: 60, duration: 30 },
    penetration: { minDepth: 2.5, uniformity: 'Uniform throughout' },
    certification: {
      required: true,
      agency: 'USDA APHIS',
      standard: 'ISPM-15',
    },
    stamp: {
      required: true,
      type: 'IPPC HT',
      location: 'Both ends of each piece',
    },
    compliance: ['ISPM-15', 'AMAT-STD'],
  },
  'Pressure Treatment': {
    type: 'pressure-treatment',
    chemicals: [{ name: 'ACQ', concentration: 0.4, applicationMethod: 'Pressure injection' }],
    penetration: { minDepth: 6.0, uniformity: 'Complete penetration' },
    certification: {
      required: true,
      agency: 'AWPA',
      standard: 'AWPA U1',
    },
    stamp: {
      required: true,
      type: 'Treatment stamp',
      location: 'Each piece',
    },
    compliance: ['AWPA', 'AMAT-STD'],
  },
};

export const AMATFinishSpecs: Record<string, FinishSpecification> = {
  'Exterior Paint': {
    type: 'paint',
    material: '100% Acrylic Latex',
    thickness: { min: 2.0, max: 4.0, target: 3.0 },
    application: {
      method: 'Spray or brush',
      coats: 2,
      curing: { temperature: 20, time: 24 },
    },
    performance: {
      adhesion: 5,
      hardness: 6, // Converted from '2H' to numeric scale
      flexibility: 8, // Converted from mandrel test to numeric scale
      weathering: 1000,
      chemicalResistance: ['Water', 'Mild acids', 'Alkalis'],
    },
    color: {
      standard: 'AMAT Blue',
      tolerance: 'ΔE ≤ 1.0',
      gloss: { at60: 30, at85: 40 },
    },
    compliance: ['ASTM', 'AMAT-STD'],
  },
  'Wood Sealant': {
    type: 'sealant',
    material: 'Silicone-modified acrylic',
    thickness: { min: 1.0, max: 2.0, target: 1.5 },
    application: {
      method: 'Brush or roller',
      coats: 1,
      curing: { temperature: 20, time: 4 },
    },
    performance: {
      adhesion: 4,
      hardness: 4, // Converted from 'HB' to numeric scale
      flexibility: 6, // Converted from mandrel test to numeric scale
      weathering: 500,
      chemicalResistance: ['Water', 'UV'],
    },
    color: {
      standard: 'Clear',
      tolerance: 'None',
      gloss: { at60: 10, at85: 15 },
    },
    compliance: ['ASTM', 'AMAT-STD'],
  },
};

// Validation functions
export function validateWoodSpecification(
  spec: WoodSpecification,
  _requirements: Partial<WoodSpecification>
): MaterialValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let complianceScore = 100;

  // Check moisture content
  if (spec.moistureContent.max > 19) {
    errors.push('Moisture content exceeds maximum allowed (19%)');
    complianceScore -= 20;
  }

  // Check strength requirements
  if (spec.strength.bending < 900) {
    warnings.push('Bending strength below recommended minimum');
    complianceScore -= 10;
  }

  // Check defects
  if (spec.defects.knots.maxDiameter > 1.0) {
    errors.push('Knot size exceeds maximum allowed');
    complianceScore -= 15;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations,
    complianceScore: Math.max(0, complianceScore),
  };
}

export function validateHardwareSpecification(
  spec: HardwareSpecification,
  _requirements: Partial<HardwareSpecification>
): MaterialValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let complianceScore = 100;

  // Check corrosion resistance
  if (spec.corrosionResistance.saltSpray < 96) {
    warnings.push('Salt spray resistance below recommended minimum');
    complianceScore -= 10;
  }

  // Check strength requirements
  if (spec.strength.tensile < 58000) {
    warnings.push('Tensile strength below recommended minimum');
    complianceScore -= 15;
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    recommendations,
    complianceScore: Math.max(0, complianceScore),
  };
}

export function getRecommendedMaterials(
  crateStyle: 'A' | 'B' | 'C' | 'D',
  isInternational: boolean,
  _environmentalConditions: string
): MaterialSpecificationSet {
  const materials: MaterialSpecificationSet = {
    wood: [],
    hardware: [],
    treatments: [],
    finishes: [],
  };

  // Select wood based on crate style
  if (crateStyle === 'A') {
    materials.wood.push(AMATWoodGrades['Grade B Lumber']);
  } else {
    materials.wood.push(AMATWoodGrades['Grade A Lumber']);
  }

  // Select hardware
  if (isInternational) {
    materials.hardware.push(AMATHardwareSpecs['Stainless Steel Nails']);
  } else {
    materials.hardware.push(AMATHardwareSpecs['Grade 5 Screws']);
  }
  materials.hardware.push(AMATHardwareSpecs['Galvanized Brackets']);

  // Select treatments
  if (isInternational) {
    materials.treatments.push(AMATTreatmentSpecs['ISPM-15 Heat Treatment']);
  }
  materials.treatments.push(AMATTreatmentSpecs['Pressure Treatment']);

  // Select finishes
  materials.finishes.push(AMATFinishSpecs['Exterior Paint']);
  materials.finishes.push(AMATFinishSpecs['Wood Sealant']);

  return materials;
}

// Skid Specification Types and Interfaces
export type LumberSize = '3x4' | '4x4' | '4x6' | '6x6' | '8x8';

export interface SkidSpecification {
  lumberSize: LumberSize;
  dimensions: {
    height: number; // inches
    width: number; // inches
  };
  maxSpacing: number; // inches, center-to-center
  minHeight: number; // 3.5" minimum for material handling equipment access
  quantity: number;
  weightRange: {
    min: number; // lbs
    max: number; // lbs
  };
  requiresRubStrips: boolean;
  canReplaceWith4x4: boolean; // For 4x6 skids under 4500 lbs
}

export interface SkidSizingTable {
  [key: string]: SkidSpecification;
}

// AMAT Skid Sizing Specifications (Tables 5-3 and 5-4)
export const AMATSkidSpecifications: SkidSizingTable = {
  '3x4': {
    lumberSize: '3x4',
    dimensions: { height: 3, width: 4 },
    maxSpacing: 30.00,
    minHeight: 3.5,
    quantity: 0, // Calculated based on crate dimensions
    weightRange: { min: 0, max: 500 },
    requiresRubStrips: false, // Determined by crate length
    canReplaceWith4x4: false,
  },
  '4x4': {
    lumberSize: '4x4',
    dimensions: { height: 4, width: 4 },
    maxSpacing: 30.00,
    minHeight: 3.5,
    quantity: 0, // Calculated based on crate dimensions
    weightRange: { min: 0, max: 4500 },
    requiresRubStrips: false, // Determined by crate length
    canReplaceWith4x4: false,
  },
  '4x6': {
    lumberSize: '4x6',
    dimensions: { height: 4, width: 6 },
    maxSpacing: 41.00, // Varies by weight: <6000lbs: 41", 6000-12000lbs: 28", >12000lbs: 24"
    minHeight: 3.5,
    quantity: 0, // Calculated based on crate dimensions
    weightRange: { min: 4501, max: 20000 },
    requiresRubStrips: false, // Determined by crate length
    canReplaceWith4x4: true, // Can be replaced with 4x4 for weights < 4500 lbs
  },
  '6x6': {
    lumberSize: '6x6',
    dimensions: { height: 6, width: 6 },
    maxSpacing: 24.00, // Varies by weight: ≤30000lbs: 24", >30000lbs: 20"
    minHeight: 3.5,
    quantity: 0, // Calculated based on crate dimensions
    weightRange: { min: 20001, max: 40000 },
    requiresRubStrips: false, // Determined by crate length
    canReplaceWith4x4: false,
  },
  '8x8': {
    lumberSize: '8x8',
    dimensions: { height: 8, width: 8 },
    maxSpacing: 24.00,
    minHeight: 3.5,
    quantity: 0, // Calculated based on crate dimensions
    weightRange: { min: 40001, max: 60000 },
    requiresRubStrips: false, // Determined by crate length
    canReplaceWith4x4: false,
  },
};

/**
 * Gets the appropriate skid specification based on product weight
 * @param weightLbs Product weight in pounds
 * @returns Skid specification according to AMAT standards
 */
export function getSkidSpecificationByWeight(weightLbs: number): SkidSpecification | null {
  for (const [key, spec] of Object.entries(AMATSkidSpecifications)) {
    if (weightLbs >= spec.weightRange.min && weightLbs <= spec.weightRange.max) {
      return { ...spec };
    }
  }
  return null; // Weight exceeds maximum supported range
}

/**
 * Gets the maximum spacing for a given lumber size and weight
 * @param lumberSize The lumber size (e.g., '4x6')
 * @param weightLbs Product weight in pounds
 * @returns Maximum center-to-center spacing in inches
 */
export function getMaxSpacingForLumberSize(lumberSize: LumberSize, weightLbs: number): number {
  const spec = AMATSkidSpecifications[lumberSize];
  if (!spec) return 24.00; // Default spacing

  switch (lumberSize) {
    case '3x4':
    case '4x4':
      return 30.00;
    case '4x6':
      if (weightLbs < 6000) return 41.00;
      if (weightLbs <= 12000) return 28.00;
      return 24.00;
    case '6x6':
      if (weightLbs <= 30000) return 24.00;
      return 20.00;
    case '8x8':
      return 24.00;
    default:
      return 24.00;
  }
}
