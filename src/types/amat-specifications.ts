// AMAT Standard Packing and Crating Requirements
// Based on 0251-70054 Rev. 08 with SEMI E137 MBB compliance
// Enhanced with comprehensive material specifications

import {
  MaterialSpecificationSet,
  MaterialValidation,
  validateWoodSpecification,
  validateHardwareSpecification,
  getRecommendedMaterials,
} from './material-specifications';

export type AMATCrateStyle = 'A' | 'B' | 'C' | 'D';
export type MoistureSensitivityLevel = 'MSL1' | 'MSL2' | 'MSL3' | 'MSL4' | 'MSL5' | 'MSL6';
export type DesiccantType = 'silica-gel' | 'clay' | 'molecular-sieve' | 'calcium-oxide';
export type HumidityIndicatorType = '10%' | '20%' | '30%' | '40%' | '50%' | '60%';

// Re-export types from material-specifications for convenience
export type { MaterialSpecificationSet, MaterialValidation } from './material-specifications';

export interface AMATCrateStyleSpec {
  style: AMATCrateStyle;
  name: string;
  description: string;
  weightRange: {
    min: number;
    max: number;
  };
  features: string[];
  entryType: 'two-way' | 'four-way';
  hasFloatingDeck: boolean;
  requiresReinforcedJoists: boolean;
  panelType: 'cleated-plywood' | 'solid-lumber' | 'mixed';
  dropEndCap: boolean;
}

export interface AMATSkidSize {
  nominalSize: string;
  actualDimensions: {
    width: number;
    height: number;
  };
  weightCapacity: {
    min: number;
    max: number;
  };
}

export interface AMATMaterialSpec {
  type: 'lumber' | 'plywood' | 'foam';
  grade: string;
  requirements: string[];
  moistureContent?: number;
  density?: {
    min: number;
    max: number;
    unit: 'pcf';
  };
}

export interface AMATCleatRequirement {
  panelSizeRange: {
    min: number;
    max: number;
  };
  cleatSize: string;
  cleatDimensions: {
    width: number;
    thickness: number;
  };
}

export interface AMATMarkingRequirement {
  type: 'logo' | 'fragile' | 'handling' | 'cog' | 'shock-indicator' | 'tilt-indicator';
  required: boolean;
  condition?: string;
  specification?: string;
}

// Header and Rail Specifications for Shipping Bases
export interface HeaderSpecification {
  size: '2x4' | '2x6' | '2x8' | '2x10' | '2x12';
  dimensions: {
    width: number; // inches
    thickness: number; // inches
  };
  maxSpan: number; // maximum unsupported span in inches
  weightCapacity: number; // lbs per linear foot
  material: 'pine' | 'fir' | 'spruce' | 'treated-lumber';
}

export interface RailSpecification {
  size: '2x4' | '2x6' | '2x8';
  dimensions: {
    width: number; // inches
    thickness: number; // inches
  };
  spacing: {
    maxCenters: number; // maximum spacing between rails in inches
    recommendedCenters: number; // recommended spacing in inches
  };
  material: 'pine' | 'fir' | 'spruce' | 'treated-lumber';
}

export interface HeaderRailConfiguration {
  headers: {
    enabled: boolean;
    size: HeaderSpecification['size'];
    count: number;
    spacing: number; // inches between headers
    material: HeaderSpecification['material'];
  };
  rails: {
    enabled: boolean;
    size: RailSpecification['size'];
    count: number;
    spacing: number; // inches between rails (center-to-center)
    material: RailSpecification['material'];
  };
  autoCalculated: boolean;
}

// SEMI E137 Moisture Barrier Bag Specifications
export interface MBBSpecification {
  enabled: boolean;
  semiE137Compliant: boolean;
  bagType: 'static-shielding' | 'moisture-barrier' | 'combination';
  sealType: 'heat-seal' | 'zipper' | 'fold-over';
  thickness: number; // in mils
  materialType: 'polyethylene' | 'polyester' | 'aluminum-foil-laminate';
  moistureTransmissionRate: number; // g/m²/day at 38°C, 90% RH
  sealIntegrityTest: boolean;
  // Additional AMAT specifications
  material?: 'aluminum-polyethylene' | 'aluminum-polyester'; // Legacy AMAT material types
  sealWidth?: number; // inches - minimum seal width requirement
  targetRH?: number; // target relative humidity percentage
}

export interface DesiccantSpecification {
  type: DesiccantType;
  quantity: number; // in grams
  absorptionCapacity: number; // % at 25°C, 80% RH
  packaging: 'sachet' | 'canister' | 'strip';
  placement: 'inside-bag' | 'outside-bag' | 'both';
}

export interface HumidityIndicatorSpecification {
  type: HumidityIndicatorType;
  quantity: number;
  placement: 'inside-bag' | 'outside-bag' | 'on-product';
  reversible: boolean;
}

export interface MoistureSensitivityRequirement {
  level: MoistureSensitivityLevel;
  maxFloorLife: number; // hours
  bakingRequired: boolean;
  bakingTemp?: number; // °C
  bakingTime?: number; // hours
  reworkAllowed: boolean;
  storageHumidity: number; // % RH max
}

export interface SEMIE137Requirements {
  mbbRequired: boolean;
  desiccantRequired: boolean;
  humidityIndicatorRequired: boolean;
  sealIntegrityTestRequired: boolean;
  documentationRequired: boolean;
  traceabilityRequired: boolean;
}

// AMAT Crate Style Specifications
export const AMATCrateStyles: Record<AMATCrateStyle, AMATCrateStyleSpec> = {
  A: {
    style: 'A',
    name: 'Style A - Standard',
    description: 'Two-way entry crate with cleated plywood or solid lumber panels',
    weightRange: {
      min: 0,
      max: 5000,
    },
    features: [
      'Two-way entry design',
      'Cleated plywood or solid lumber panels',
      'Standard construction for lightweight products',
      'Cost-effective design',
    ],
    entryType: 'two-way',
    hasFloatingDeck: false,
    requiresReinforcedJoists: false,
    panelType: 'mixed',
    dropEndCap: false,
  },
  B: {
    style: 'B',
    name: 'Style B - Floating Deck',
    description: 'Drop-end cleated plywood cap with floating deck support',
    weightRange: {
      min: 5000,
      max: 10000,
    },
    features: [
      'Drop-end design for easy loading',
      'Cleated plywood cap construction',
      'Floating deck with foam cushioning',
      'Enhanced shock absorption',
    ],
    entryType: 'two-way',
    hasFloatingDeck: true,
    requiresReinforcedJoists: false,
    panelType: 'cleated-plywood',
    dropEndCap: true,
  },
  C: {
    style: 'C',
    name: 'Style C - Enhanced',
    description: 'Four-way entry crate with enhanced structural support',
    weightRange: {
      min: 10000,
      max: 20000,
    },
    features: [
      'Four-way forklift entry',
      'Enhanced structural support',
      'Suitable for medium-heavy loads',
      'Improved handling flexibility',
    ],
    entryType: 'four-way',
    hasFloatingDeck: true,
    requiresReinforcedJoists: false,
    panelType: 'cleated-plywood',
    dropEndCap: false,
  },
  D: {
    style: 'D',
    name: 'Style D - Heavy Duty',
    description: 'Heavy-duty crate for loads exceeding 20,000 lbs with reinforced joists',
    weightRange: {
      min: 20000,
      max: 100000,
    },
    features: [
      'Reinforced joist construction',
      'Heavy-duty design for extreme loads',
      'Four-way entry for maximum handling flexibility',
      'Enhanced structural integrity',
    ],
    entryType: 'four-way',
    hasFloatingDeck: true,
    requiresReinforcedJoists: true,
    panelType: 'cleated-plywood',
    dropEndCap: false,
  },
};

// AMAT Skid Sizing Requirements
export const AMATSkidSizes: AMATSkidSize[] = [
  {
    nominalSize: '3x4',
    actualDimensions: { width: 3.5, height: 2.5 },
    weightCapacity: { min: 0, max: 2000 },
  },
  {
    nominalSize: '4x4',
    actualDimensions: { width: 3.5, height: 3.5 },
    weightCapacity: { min: 2000, max: 5000 },
  },
  {
    nominalSize: '4x6',
    actualDimensions: { width: 5.5, height: 3.5 },
    weightCapacity: { min: 5000, max: 10000 },
  },
  {
    nominalSize: '6x6',
    actualDimensions: { width: 5.5, height: 5.5 },
    weightCapacity: { min: 10000, max: 20000 },
  },
  {
    nominalSize: '8x8',
    actualDimensions: { width: 7.5, height: 7.5 },
    weightCapacity: { min: 20000, max: 100000 },
  },
];

// AMAT Material Specifications
export const AMATMaterialSpecs: AMATMaterialSpec[] = [
  {
    type: 'lumber',
    grade: 'Grade #3 or higher',
    requirements: [
      'Kiln-dried or air-dried',
      'Moisture content < 19%',
      'Free from active infestation',
      'No loose knots or splits',
    ],
    moistureContent: 19,
  },
  {
    type: 'plywood',
    grade: 'C-C Plugged (Exterior) or C-D (Exposure 1)',
    requirements: [
      'Minimum 5-ply construction',
      'APA grade stamped',
      'Appropriate for intended exposure',
      'Free from delamination',
    ],
  },
  {
    type: 'foam',
    grade: 'Polyethylene (PE) or Polyurethane (PU)',
    requirements: [
      'Closed-cell structure',
      'Appropriate density for load',
      'Non-abrasive surface',
      'Chemical resistant',
    ],
    density: {
      min: 1.7,
      max: 9.0,
      unit: 'pcf',
    },
  },
];

// AMAT Cleating Requirements
export const AMATCleatRequirements: AMATCleatRequirement[] = [
  {
    panelSizeRange: { min: 0, max: 24 },
    cleatSize: '1x2',
    cleatDimensions: { width: 1.5, thickness: 0.75 },
  },
  {
    panelSizeRange: { min: 24, max: 36 },
    cleatSize: '1x3',
    cleatDimensions: { width: 2.5, thickness: 0.75 },
  },
  {
    panelSizeRange: { min: 36, max: 48 },
    cleatSize: '1x4',
    cleatDimensions: { width: 3.5, thickness: 0.75 },
  },
  {
    panelSizeRange: { min: 48, max: 72 },
    cleatSize: '1x6',
    cleatDimensions: { width: 5.5, thickness: 0.75 },
  },
];

// AMAT Marking Requirements
export const AMATMarkingRequirements: AMATMarkingRequirement[] = [
  {
    type: 'logo',
    required: true,
    specification: 'AMAT logo on all four sides',
  },
  {
    type: 'fragile',
    required: true,
    specification: 'Fragile stencils on all sides for sensitive equipment',
  },
  {
    type: 'handling',
    required: true,
    specification: 'This Way Up arrows and handling symbols',
  },
  {
    type: 'cog',
    required: true,
    specification: 'Center of Gravity marking with coordinates',
  },
  {
    type: 'shock-indicator',
    required: true,
    condition: 'For crates > 150 lbs',
    specification: 'ShockWatch or equivalent indicator',
  },
  {
    type: 'tilt-indicator',
    required: true,
    condition: 'For crates > 150 lbs',
    specification: 'TiltWatch or equivalent indicator',
  },
];

// Header Specifications
export const AMATHeaderSpecifications: Record<HeaderSpecification['size'], HeaderSpecification> = {
  '2x4': {
    size: '2x4',
    dimensions: { width: 3.5, thickness: 1.5 },
    maxSpan: 48,
    weightCapacity: 200,
    material: 'pine',
  },
  '2x6': {
    size: '2x6',
    dimensions: { width: 5.5, thickness: 1.5 },
    maxSpan: 72,
    weightCapacity: 300,
    material: 'pine',
  },
  '2x8': {
    size: '2x8',
    dimensions: { width: 7.25, thickness: 1.5 },
    maxSpan: 96,
    weightCapacity: 400,
    material: 'pine',
  },
  '2x10': {
    size: '2x10',
    dimensions: { width: 9.25, thickness: 1.5 },
    maxSpan: 120,
    weightCapacity: 500,
    material: 'pine',
  },
  '2x12': {
    size: '2x12',
    dimensions: { width: 11.25, thickness: 1.5 },
    maxSpan: 144,
    weightCapacity: 600,
    material: 'pine',
  },
};

// Rail Specifications
export const AMATRailSpecifications: Record<RailSpecification['size'], RailSpecification> = {
  '2x4': {
    size: '2x4',
    dimensions: { width: 3.5, thickness: 1.5 },
    spacing: { maxCenters: 24, recommendedCenters: 16 },
    material: 'pine',
  },
  '2x6': {
    size: '2x6',
    dimensions: { width: 5.5, thickness: 1.5 },
    spacing: { maxCenters: 36, recommendedCenters: 24 },
    material: 'pine',
  },
  '2x8': {
    size: '2x8',
    dimensions: { width: 7.25, thickness: 1.5 },
    spacing: { maxCenters: 48, recommendedCenters: 32 },
    material: 'pine',
  },
};

// Helper function to determine crate style based on weight and dimensions
export function determineAMATCrateStyle(
  productWeight: number,
  _dimensions: { length: number; width: number; height: number }
): AMATCrateStyle {
  // Style D for heavy loads > 20,000 lbs
  if (productWeight > 20000) {
    return 'D';
  }

  // Style C for 10,000 - 20,000 lbs
  if (productWeight > 10000) {
    return 'C';
  }

  // Style B for 5,000 - 10,000 lbs or when floating deck is beneficial
  if (productWeight > 5000) {
    return 'B';
  }

  // Style A for lightweight products < 5,000 lbs
  return 'A';
}

// Helper function to determine skid size based on weight
export function determineAMATSkidSize(grossWeight: number): AMATSkidSize {
  const appropriateSkid = AMATSkidSizes.find(
    (skid) => grossWeight >= skid.weightCapacity.min && grossWeight <= skid.weightCapacity.max
  );

  // Default to largest size if weight exceeds all capacities
  return appropriateSkid || AMATSkidSizes[AMATSkidSizes.length - 1];
}

// Helper function to determine cleating requirements
export function determineAMATCleating(panelSize: number): AMATCleatRequirement {
  const appropriateCleat = AMATCleatRequirements.find(
    (cleat) => panelSize >= cleat.panelSizeRange.min && panelSize <= cleat.panelSizeRange.max
  );

  // Default to largest cleat size if panel exceeds all ranges
  return appropriateCleat || AMATCleatRequirements[AMATCleatRequirements.length - 1];
}

// Helper function to determine header size based on crate dimensions and weight
export function determineAMATHeaderSize(
  crateDimensions: { length: number; width: number; height: number },
  productWeight: number
): HeaderSpecification['size'] {
  const maxDimension = Math.max(crateDimensions.length, crateDimensions.width);

  // For very heavy loads or large crates, use larger headers
  if (productWeight > 10000 || maxDimension > 96) {
    return '2x12';
  }
  if (productWeight > 5000 || maxDimension > 72) {
    return '2x10';
  }
  if (productWeight > 2000 || maxDimension > 48) {
    return '2x8';
  }
  if (maxDimension > 24) {
    return '2x6';
  }
  return '2x4';
}

// Helper function to determine rail size and spacing
export function determineAMATRailConfiguration(
  crateDimensions: { length: number; width: number; height: number },
  _productWeight: number
): { size: RailSpecification['size']; spacing: number; count: number } {
  const railDirection = crateDimensions.width; // Rails run along the width
  const railSpec = AMATRailSpecifications['2x6']; // Default to 2x6 for most applications

  // Calculate number of rails needed
  const maxSpacing = railSpec.spacing.maxCenters;
  const count = Math.max(2, Math.ceil(railDirection / maxSpacing) + 1);
  const spacing = railDirection / (count - 1);

  return {
    size: '2x6',
    spacing: Math.min(spacing, maxSpacing),
    count,
  };
}

// Helper function to create complete header/rail configuration
export function createHeaderRailConfiguration(
  crateDimensions: { length: number; width: number; height: number },
  productWeight: number
): HeaderRailConfiguration {
  const headerSize = determineAMATHeaderSize(crateDimensions, productWeight);
  const railConfig = determineAMATRailConfiguration(crateDimensions, productWeight);

  return {
    headers: {
      enabled: true,
      size: headerSize,
      count: 2, // Standard: headers at each end
      spacing: crateDimensions.length - AMATHeaderSpecifications[headerSize].dimensions.width,
      material: AMATHeaderSpecifications[headerSize].material,
    },
    rails: {
      enabled: true,
      size: railConfig.size,
      count: railConfig.count,
      spacing: railConfig.spacing,
      material: AMATRailSpecifications[railConfig.size].material,
    },
    autoCalculated: true,
  };
}

// Foam density selection based on product weight
export function selectFoamDensity(productWeight: number): number {
  if (productWeight < 1000) return 1.7; // Light products
  if (productWeight < 5000) return 2.2; // Medium products
  if (productWeight < 10000) return 4.0; // Heavy products
  if (productWeight < 20000) return 6.0; // Very heavy products
  return 9.0; // Extreme loads
}

// Calculate desiccant requirements based on wood moisture content
export function calculateDesiccantRequirement(
  crateVolume: number, // in cubic feet
  woodMoistureContent: number = 12 // percentage
): number {
  // Formula from AMAT spec: Units of desiccant = Volume * Moisture Factor
  const moistureFactor = (woodMoistureContent / 100) * 0.5; // Simplified formula
  const desiccantUnits = Math.ceil(crateVolume * moistureFactor);
  return Math.max(desiccantUnits, 1); // Minimum 1 unit
}

// ISPM-15 compliance check
export interface ISPM15Requirements {
  treatmentRequired: boolean;
  stampRequired: boolean;
  certificationRequired: boolean;
  debarking: boolean;
}

export function checkISPM15Compliance(isInternational: boolean): ISPM15Requirements {
  if (!isInternational) {
    return {
      treatmentRequired: false,
      stampRequired: false,
      certificationRequired: false,
      debarking: false,
    };
  }

  return {
    treatmentRequired: true, // Heat treatment or fumigation
    stampRequired: true, // IPPC stamp required
    certificationRequired: true, // Phytosanitary certificate
    debarking: true, // Bark-free wood required
  };
}

// Moisture Sensitivity Level Requirements (per SEMI E137)
export const MoistureSensitivityLevels: Record<
  MoistureSensitivityLevel,
  MoistureSensitivityRequirement
> = {
  MSL1: {
    level: 'MSL1',
    maxFloorLife: Infinity, // No restrictions
    bakingRequired: false,
    reworkAllowed: true,
    storageHumidity: 85,
  },
  MSL2: {
    level: 'MSL2',
    maxFloorLife: 8760, // 1 year
    bakingRequired: false,
    reworkAllowed: true,
    storageHumidity: 60,
  },
  MSL3: {
    level: 'MSL3',
    maxFloorLife: 168, // 1 week
    bakingRequired: true,
    bakingTemp: 125,
    bakingTime: 24,
    reworkAllowed: true,
    storageHumidity: 60,
  },
  MSL4: {
    level: 'MSL4',
    maxFloorLife: 72, // 3 days
    bakingRequired: true,
    bakingTemp: 125,
    bakingTime: 24,
    reworkAllowed: true,
    storageHumidity: 60,
  },
  MSL5: {
    level: 'MSL5',
    maxFloorLife: 48, // 2 days
    bakingRequired: true,
    bakingTemp: 125,
    bakingTime: 24,
    reworkAllowed: true,
    storageHumidity: 60,
  },
  MSL6: {
    level: 'MSL6',
    maxFloorLife: 0, // Must be reflowed immediately
    bakingRequired: true,
    bakingTemp: 125,
    bakingTime: 24,
    reworkAllowed: false,
    storageHumidity: 60,
  },
};

// Standard MBB Configurations
export const StandardMBBConfigurations: Record<string, MBBSpecification> = {
  'basic-moisture-barrier': {
    enabled: true,
    semiE137Compliant: true,
    bagType: 'moisture-barrier',
    sealType: 'heat-seal',
    thickness: 4, // mils
    materialType: 'polyethylene',
    moistureTransmissionRate: 0.1,
    sealIntegrityTest: true,
    material: 'aluminum-polyethylene',
    sealWidth: 0.5, // 1/2 inch minimum
    targetRH: 50, // 50% RH target
  },
  'static-shielding': {
    enabled: true,
    semiE137Compliant: true,
    bagType: 'static-shielding',
    sealType: 'heat-seal',
    thickness: 4, // mils
    materialType: 'polyester',
    moistureTransmissionRate: 0.05,
    sealIntegrityTest: true,
    material: 'aluminum-polyester',
    sealWidth: 0.5, // 1/2 inch minimum
    targetRH: 40, // 40% RH target
  },
  'combination-esd-moisture': {
    enabled: true,
    semiE137Compliant: true,
    bagType: 'combination',
    sealType: 'heat-seal',
    thickness: 6, // mils
    materialType: 'aluminum-foil-laminate',
    moistureTransmissionRate: 0.01,
    sealIntegrityTest: true,
    material: 'aluminum-polyethylene',
    sealWidth: 0.5, // 1/2 inch minimum
    targetRH: 30, // 30% RH target for sensitive components
  },
};

// Desiccant Type Specifications
export const DesiccantTypes: Record<
  DesiccantType,
  Omit<DesiccantSpecification, 'quantity' | 'placement'>
> = {
  'silica-gel': {
    type: 'silica-gel',
    absorptionCapacity: 20, // % at 25°C, 80% RH
    packaging: 'sachet',
  },
  clay: {
    type: 'clay',
    absorptionCapacity: 15, // % at 25°C, 80% RH
    packaging: 'sachet',
  },
  'molecular-sieve': {
    type: 'molecular-sieve',
    absorptionCapacity: 22, // % at 25°C, 80% RH
    packaging: 'canister',
  },
  'calcium-oxide': {
    type: 'calcium-oxide',
    absorptionCapacity: 25, // % at 25°C, 80% RH
    packaging: 'sachet',
  },
};

// Helper function to determine MBB requirements based on MSL
export function determineMBBRequirements(msl: MoistureSensitivityLevel): SEMIE137Requirements {
  // const _sensitivity = MoistureSensitivityLevels[msl];

  return {
    mbbRequired: msl !== 'MSL1', // MSL1 doesn't require MBB
    desiccantRequired: ['MSL3', 'MSL4', 'MSL5', 'MSL6'].includes(msl),
    humidityIndicatorRequired: ['MSL2', 'MSL3', 'MSL4', 'MSL5', 'MSL6'].includes(msl),
    sealIntegrityTestRequired: ['MSL4', 'MSL5', 'MSL6'].includes(msl),
    documentationRequired: true,
    traceabilityRequired: ['MSL5', 'MSL6'].includes(msl),
  };
}

// Calculate desiccant quantity based on package volume and MSL
export function calculateDesiccantQuantity(
  packageVolume: number, // in cubic inches
  msl: MoistureSensitivityLevel,
  desiccantType: DesiccantType = 'silica-gel'
): number {
  if (!determineMBBRequirements(msl).desiccantRequired) {
    return 0;
  }

  // Base calculation: 1g per cubic inch for silica gel
  // Adjust for different desiccant types and MSL requirements
  const baseQuantity = packageVolume * 1; // grams per cubic inch
  const desiccant = DesiccantTypes[desiccantType];

  // Adjustment factors based on MSL
  const mslMultipliers: Record<MoistureSensitivityLevel, number> = {
    MSL1: 0,
    MSL2: 0,
    MSL3: 1.0,
    MSL4: 1.2,
    MSL5: 1.5,
    MSL6: 2.0,
  };

  // Adjust for absorption capacity
  const adjustedQuantity =
    (baseQuantity * mslMultipliers[msl]) / (desiccant.absorptionCapacity / 100);

  return Math.ceil(adjustedQuantity);
}

// Calculate humidity indicator quantity
export function calculateHumidityIndicatorQuantity(
  msl: MoistureSensitivityLevel,
  packageCount: number = 1
): number {
  if (!determineMBBRequirements(msl).humidityIndicatorRequired) {
    return 0;
  }

  // Base requirement: 1 indicator per package, minimum 2 for redundancy
  return Math.max(2, packageCount);
}

// MBB Validation Rules
export interface MBBValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  complianceScore: number;
}

// Validate MBB configuration against AMAT requirements
export function validateMBBConfiguration(
  mbbConfig: MBBSpecification,
  packageVolume: number, // cubic inches
  shippingDuration: number = 30 // days
): MBBValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let complianceScore = 100;

  // Check minimum seal width (1/2 inch = 0.5 inches)
  if (mbbConfig.sealWidth && mbbConfig.sealWidth < 0.5) {
    errors.push('Seal width must be at least 1/2 inch (0.5")');
    complianceScore -= 30;
  }

  // Check maximum humidity (50% RH)
  if (mbbConfig.targetRH && mbbConfig.targetRH > 50) {
    errors.push('Target relative humidity cannot exceed 50% RH');
    complianceScore -= 25;
  }

  // Check minimum thickness requirements
  if (mbbConfig.thickness < 2) {
    errors.push('MBB thickness must be at least 2 mils');
    complianceScore -= 20;
  }

  // Check moisture transmission rate
  if (mbbConfig.moistureTransmissionRate > 0.1) {
    warnings.push(
      'Moisture transmission rate is high - consider upgrading to better barrier material'
    );
    complianceScore -= 10;
  }

  // Validate desiccant requirements if applicable
  if (mbbConfig.targetRH) {
    const requiredDesiccant = calculateDesiccantForMBB(
      packageVolume,
      shippingDuration,
      mbbConfig.targetRH
    );
    if (requiredDesiccant > 0) {
      warnings.push(
        `Consider ${requiredDesiccant}g of desiccant for ${shippingDuration} day shipment`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    complianceScore: Math.max(0, complianceScore),
  };
}

// Calculate desiccant requirements for MBB
// Formula: Units = (Volume × 0.01) × (Days/30) × MoistureFactor
export function calculateDesiccantForMBB(
  packageVolume: number, // cubic inches
  shippingDuration: number = 30, // days
  targetRH: number = 50 // target relative humidity percentage
): number {
  const baseFactor = 0.01; // volume factor
  const durationFactor = shippingDuration / 30; // normalize to 30 days
  const moistureFactor = Math.max(1, (100 - targetRH) / 50); // moisture sensitivity factor

  const desiccantGrams = packageVolume * baseFactor * durationFactor * moistureFactor;
  return Math.ceil(desiccantGrams);
}

// Get recommended MBB configuration based on product type and MSL
export function getRecommendedMBBConfiguration(
  msl: MoistureSensitivityLevel,
  isESDSensitive: boolean = false
): string {
  if (msl === 'MSL1') {
    return 'basic-moisture-barrier'; // Even for MSL1, may want basic protection
  }

  if (isESDSensitive) {
    return 'combination-esd-moisture';
  }

  if (['MSL5', 'MSL6'].includes(msl)) {
    return 'combination-esd-moisture'; // Highest protection for most sensitive
  }

  return 'static-shielding'; // Good balance for MSL2-4
}

// Chamfer Configuration Interfaces
export interface ChamferConfiguration {
  enabled: boolean;
  angle: number; // degrees, typically 45°
  depth: number; // inches, based on crate size
  airShipmentMode: boolean;
  weightReductionTarget: number; // percentage target for weight reduction
}

export interface ChamferDimensions {
  horizontalDepth: number; // horizontal projection of chamfer
  verticalDepth: number; // vertical projection of chamfer
  faceLength: number; // length of chamfered face
  volumeReduction: number; // cubic inches removed
}

export interface ChamferWeightSavings {
  originalWeight: number;
  chamferedWeight: number;
  weightReduction: number; // absolute weight reduction in lbs
  weightReductionPercentage: number;
  shippingCostSavings: number; // estimated cost savings for air shipment
}

// Chamfer specifications based on crate style and size
export interface ChamferSpec {
  crateStyle: AMATCrateStyle;
  minCrateSize: number; // minimum crate dimension (inches) for this spec
  angle: number; // standard chamfer angle in degrees
  depthRatio: number; // depth as ratio of crate dimension
  maxDepth: number; // maximum chamfer depth in inches
  weightReductionFactor: number; // multiplier for weight reduction calculation
}

// AMAT Chamfer Specifications
export const AMATChamferSpecs: ChamferSpec[] = [
  {
    crateStyle: 'A',
    minCrateSize: 24,
    angle: 45,
    depthRatio: 0.05,
    maxDepth: 2.0,
    weightReductionFactor: 0.15,
  },
  {
    crateStyle: 'B',
    minCrateSize: 36,
    angle: 45,
    depthRatio: 0.06,
    maxDepth: 3.0,
    weightReductionFactor: 0.18,
  },
  {
    crateStyle: 'C',
    minCrateSize: 48,
    angle: 45,
    depthRatio: 0.07,
    maxDepth: 4.0,
    weightReductionFactor: 0.22,
  },
  {
    crateStyle: 'D',
    minCrateSize: 60,
    angle: 45,
    depthRatio: 0.08,
    maxDepth: 6.0,
    weightReductionFactor: 0.25,
  },
];

// Helper function to calculate chamfer dimensions
export function calculateChamferDimensions(
  crateDimensions: { length: number; width: number; height: number },
  chamferConfig: ChamferConfiguration,
  crateStyle: AMATCrateStyle
): ChamferDimensions {
  const spec = AMATChamferSpecs.find((s) => s.crateStyle === crateStyle);
  if (!spec) {
    throw new Error(`No chamfer specification found for crate style ${crateStyle}`);
  }

  // Calculate chamfer depth based on smallest crate dimension
  const smallestDimension = Math.min(
    crateDimensions.length,
    crateDimensions.width,
    crateDimensions.height
  );
  const calculatedDepth = Math.min(smallestDimension * spec.depthRatio, spec.maxDepth);

  // Calculate horizontal and vertical projections based on angle
  const angleRad = (chamferConfig.angle * Math.PI) / 180;
  const horizontalDepth = calculatedDepth * Math.cos(angleRad);
  const verticalDepth = calculatedDepth * Math.sin(angleRad);

  // Calculate volume reduction (simplified as triangular prism)
  // Assuming chamfer on all 12 edges of the crate
  const edgeLengths = [
    crateDimensions.length * 4, // 4 edges of length
    crateDimensions.width * 4, // 4 edges of width
    crateDimensions.height * 4, // 4 edges of height
  ];
  const totalEdgeLength = edgeLengths.reduce((sum, length) => sum + length, 0);
  const volumeReduction = 0.5 * horizontalDepth * verticalDepth * totalEdgeLength;

  return {
    horizontalDepth,
    verticalDepth,
    faceLength: calculatedDepth,
    volumeReduction,
  };
}

// Helper function to calculate weight savings from chamfer
export function calculateChamferWeightSavings(
  originalWeight: number,
  crateDimensions: { length: number; width: number; height: number },
  chamferConfig: ChamferConfiguration,
  crateStyle: AMATCrateStyle,
  materialDensity: number = 35 // lbs/cubic foot for typical wood
): ChamferWeightSavings {
  if (!chamferConfig.enabled) {
    return {
      originalWeight,
      chamferedWeight: originalWeight,
      weightReduction: 0,
      weightReductionPercentage: 0,
      shippingCostSavings: 0,
    };
  }

  const spec = AMATChamferSpecs.find((s) => s.crateStyle === crateStyle);
  if (!spec) {
    throw new Error(`No chamfer specification found for crate style ${crateStyle}`);
  }

  const chamferDimensions = calculateChamferDimensions(crateDimensions, chamferConfig, crateStyle);

  // Calculate weight reduction based on volume reduction and material density
  const volumeReductionCubicFeet = chamferDimensions.volumeReduction / 1728; // Convert cubic inches to cubic feet
  const weightReduction = volumeReductionCubicFeet * materialDensity * spec.weightReductionFactor;

  const chamferedWeight = originalWeight - weightReduction;
  const weightReductionPercentage = (weightReduction / originalWeight) * 100;

  // Estimate shipping cost savings for air shipment (simplified calculation)
  // Assuming $2-5 per pound for air freight depending on route
  const airFreightRate = chamferConfig.airShipmentMode ? 3.5 : 0;
  const shippingCostSavings = weightReduction * airFreightRate;

  return {
    originalWeight,
    chamferedWeight: Math.max(chamferedWeight, originalWeight * 0.7), // Minimum 70% of original weight
    weightReduction,
    weightReductionPercentage: Math.min(
      weightReductionPercentage,
      chamferConfig.weightReductionTarget
    ),
    shippingCostSavings,
  };
}

// Helper function to determine appropriate chamfer configuration
export function determineChamferConfiguration(
  crateStyle: AMATCrateStyle,
  crateDimensions: { length: number; width: number; height: number },
  productWeight: number,
  isAirShipment: boolean = false
): ChamferConfiguration {
  const spec = AMATChamferSpecs.find((s) => s.crateStyle === crateStyle);
  if (!spec) {
    return {
      enabled: false,
      angle: 45,
      depth: 0,
      airShipmentMode: false,
      weightReductionTarget: 0,
    };
  }

  // Check if crate is large enough for chamfer
  const smallestDimension = Math.min(
    crateDimensions.length,
    crateDimensions.width,
    crateDimensions.height
  );
  if (smallestDimension < spec.minCrateSize) {
    return {
      enabled: false,
      angle: 45,
      depth: 0,
      airShipmentMode: isAirShipment,
      weightReductionTarget: 0,
    };
  }

  // Calculate appropriate chamfer depth
  const calculatedDepth = Math.min(smallestDimension * spec.depthRatio, spec.maxDepth);

  return {
    enabled: true,
    angle: spec.angle,
    depth: calculatedDepth,
    airShipmentMode: isAirShipment,
    weightReductionTarget: isAirShipment
      ? spec.weightReductionFactor * 100
      : spec.weightReductionFactor * 50,
  };
}

// Update AMAT specifications interface to include comprehensive materials
export interface AMATSpecifications {
  crateStyle: AMATCrateStyle;
  skidSize: AMATSkidSize;
  materialSpecs: AMATMaterialSpec[];
  comprehensiveMaterials: MaterialSpecificationSet;
  materialValidation: MaterialValidation;
  cleating: AMATCleatRequirement;
  markings: AMATMarkingRequirement[];
  mbbRequirements: MBBSpecification;
  desiccantRequirements: DesiccantSpecification;
  humidityIndicatorRequirements: HumidityIndicatorSpecification;
  moistureSensitivity: MoistureSensitivityRequirement;
  ispm15Requirements: ISPM15Requirements;
  chamferConfiguration: ChamferConfiguration;
}

// Helper function to create complete AMAT specifications with comprehensive materials
export function createAMATSpecifications(
  productWeight: number,
  dimensions: { length: number; width: number; height: number },
  options: {
    msl?: MoistureSensitivityLevel;
    isInternational?: boolean;
    isESDSensitive?: boolean;
    isAirShipment?: boolean;
  } = {}
): AMATSpecifications {
  const crateStyle = determineAMATCrateStyle(productWeight, dimensions);
  const skidSize = determineAMATSkidSize(productWeight);
  const cleating = determineAMATCleating(Math.max(dimensions.length, dimensions.width));
  const chamferConfig = determineChamferConfiguration(
    crateStyle,
    dimensions,
    productWeight,
    options.isAirShipment
  );

  // Get comprehensive material specifications
  const comprehensiveMaterials = getRecommendedMaterials(
    crateStyle,
    options.isInternational || false,
    'standard'
  );

  // Validate materials
  const woodValidation = validateWoodSpecification(comprehensiveMaterials.wood[0], {});
  const hardwareValidation = validateHardwareSpecification(comprehensiveMaterials.hardware[0], {});

  const materialValidation: MaterialValidation = {
    isValid: woodValidation.isValid && hardwareValidation.isValid,
    errors: [...woodValidation.errors, ...hardwareValidation.errors],
    warnings: [...woodValidation.warnings, ...hardwareValidation.warnings],
    recommendations: [...woodValidation.recommendations, ...hardwareValidation.recommendations],
    complianceScore: Math.min(woodValidation.complianceScore, hardwareValidation.complianceScore),
  };

  return {
    crateStyle,
    skidSize,
    materialSpecs: AMATMaterialSpecs,
    comprehensiveMaterials,
    materialValidation,
    cleating,
    markings: AMATMarkingRequirements,
    mbbRequirements:
      StandardMBBConfigurations[
        getRecommendedMBBConfiguration(options.msl || 'MSL1', options.isESDSensitive)
      ],
    desiccantRequirements: {
      type: 'silica-gel',
      quantity: calculateDesiccantQuantity(
        dimensions.length * dimensions.width * dimensions.height,
        options.msl || 'MSL1'
      ),
      absorptionCapacity: 20,
      packaging: 'sachet',
      placement: 'inside-bag',
    },
    humidityIndicatorRequirements: {
      type: '30%',
      quantity: calculateHumidityIndicatorQuantity(options.msl || 'MSL1'),
      placement: 'inside-bag',
      reversible: true,
    },
    moistureSensitivity: MoistureSensitivityLevels[options.msl || 'MSL1'],
    ispm15Requirements: checkISPM15Compliance(options.isInternational || false),
    chamferConfiguration: chamferConfig,
  };
}

// Helper function to validate material compliance
export function validateMaterialCompliance(
  materials: MaterialSpecificationSet,
  requirements: {
    isInternational?: boolean;
    environmentalConditions?: string;
  }
): MaterialValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let complianceScore = 100;

  // Validate wood specifications
  materials.wood.forEach((wood) => {
    const validation = validateWoodSpecification(wood, {});
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);
    recommendations.push(...validation.recommendations);
    complianceScore = Math.min(complianceScore, validation.complianceScore);
  });

  // Validate hardware specifications
  materials.hardware.forEach((hardware) => {
    const validation = validateHardwareSpecification(hardware, {});
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);
    recommendations.push(...validation.recommendations);
    complianceScore = Math.min(complianceScore, validation.complianceScore);
  });

  // Check ISPM-15 compliance for international shipping
  if (requirements.isInternational) {
    const hasISPM15Treatment = materials.treatments.some((t) => t.compliance.includes('ISPM-15'));
    if (!hasISPM15Treatment) {
      errors.push('ISPM-15 treatment required for international shipping');
      complianceScore -= 30;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations,
    complianceScore: Math.max(0, complianceScore),
  };
}
