/**
 * Enhanced Weight Calculation Service for AMAT Compliance
 *
 * This service provides accurate weight calculations for AMAT-compliant crates
 * by considering actual material densities, hardware weights, and construction details.
 */

import {
  CrateConfiguration,
  CrateDimensions,
  ShippingBase,
  CrateCap,
  Fasteners,
} from '@/types/crate';
import {
  AMATCrateStyle,
  AMATCleatRequirement,
  AMATSkidSize,
  determineAMATCleating,
  AMATCrateStyles,
} from '@/types/amat-specifications';

// Material densities in lbs per cubic foot
export const MATERIAL_DENSITIES = {
  // Wood densities
  pine: 28,
  oak: 45,
  plywood: 35,
  osb: 40,
  'solid-wood': 35,

  // Hardware densities (approximate weights)
  nails: 0.1, // per nail
  screws: 0.05, // per screw
  bolts: 0.2, // per bolt

  // Metal hardware
  steel: 490,
  stainless: 500,
  galvanized: 485,

  // Foam densities (lbs per cubic foot)
  foam_pe: 2.2,
  foam_pu: 4.0,

  // MBB materials
  polyethylene: 58,
  polyester: 87,
  aluminum_foil: 169,

  // Desiccant materials
  silica_gel: 75,
  clay: 85,
  molecular_sieve: 80,
  calcium_oxide: 120,
} as const;

// Hardware specifications based on crate style and weight
export const HARDWARE_SPECS = {
  nails: {
    spacing: 6, // inches
    weightPerInch: 0.01, // lbs per inch of spacing
    length: 2.5, // inches
  },
  screws: {
    spacing: 8,
    weightPerInch: 0.008,
    length: 3.0,
  },
  bolts: {
    spacing: 12,
    weightPerInch: 0.02,
    length: 4.0,
  },
} as const;

// Cleating specifications by panel size
export const CLEATING_SPECS = {
  '1x2': { width: 1.5, thickness: 0.75, weightPerFoot: 0.8 },
  '1x3': { width: 2.5, thickness: 0.75, weightPerFoot: 1.2 },
  '1x4': { width: 3.5, thickness: 0.75, weightPerFoot: 1.6 },
  '1x6': { width: 5.5, thickness: 0.75, weightPerFoot: 2.4 },
} as const;

// Skid weight specifications
export const SKID_WEIGHT_SPECS = {
  '3x4': { weightPerFoot: 2.1, weightCapacity: { min: 0, max: 2000 } },
  '4x4': { weightPerFoot: 2.9, weightCapacity: { min: 2000, max: 5000 } },
  '4x6': { weightPerFoot: 4.4, weightCapacity: { min: 5000, max: 10000 } },
  '6x6': { weightPerFoot: 6.6, weightCapacity: { min: 10000, max: 20000 } },
  '8x8': { weightPerFoot: 11.7, weightCapacity: { min: 20000, max: 100000 } },
} as const;

export interface WeightBreakdown {
  panels: {
    top: number;
    front: number;
    back: number;
    left: number;
    right: number;
    total: number;
  };
  framing: {
    cleats: number;
    reinforcements: number;
    total: number;
  };
  base: {
    skids: number;
    floorboards: number;
    total: number;
  };
  hardware: {
    fasteners: number;
    brackets: number;
    total: number;
  };
  protection: {
    foam: number;
    mbb: number;
    desiccant: number;
    total: number;
  };
  accessories: {
    shockIndicators: number;
    tiltIndicators: number;
    labels: number;
    total: number;
  };
  total: number;
}

export interface EnhancedWeightCalculationOptions {
  includeFoamCushioning?: boolean;
  includeMBB?: boolean;
  includeDesiccant?: boolean;
  includeHardware?: boolean;
  includeAccessories?: boolean;
  airShipmentMode?: boolean;
}

/**
 * Calculate the weight of individual panels based on material and dimensions
 */
export function calculatePanelWeight(
  dimensions: { length: number; width: number; height: number },
  thickness: number,
  material: string
): number {
  const volumeCubicFeet = (dimensions.length * dimensions.width * thickness) / 1728; // Convert to cubic feet
  const density =
    MATERIAL_DENSITIES[material as keyof typeof MATERIAL_DENSITIES] || MATERIAL_DENSITIES.plywood;
  return volumeCubicFeet * density;
}

/**
 * Calculate cleating weight based on panel dimensions and AMAT requirements
 */
export function calculateCleatingWeight(
  panelDimensions: { length: number; width: number },
  _crateStyle: AMATCrateStyle
): number {
  const panelSize = Math.max(panelDimensions.length, panelDimensions.width);
  const cleatRequirement = determineAMATCleating(panelSize);
  const cleatSpec = CLEATING_SPECS[cleatRequirement.cleatSize as keyof typeof CLEATING_SPECS];

  if (!cleatSpec) return 0;

  // Calculate total cleat length (perimeter of panel, but cleats are typically spaced)
  const perimeter = 2 * (panelDimensions.length + panelDimensions.width);
  const cleatLength = perimeter * 0.7; // Account for spacing between cleats
  const cleatVolume = (cleatSpec.width * cleatSpec.thickness * cleatLength) / 144; // Convert to cubic feet
  const cleatWeight = cleatVolume * MATERIAL_DENSITIES.pine;

  // Add corner reinforcements (typically 4 per panel)
  const cornerReinforcementWeight = 4 * 0.25; // 0.25 lbs per corner

  return cleatWeight + cornerReinforcementWeight;
}

/**
 * Calculate skid weight based on dimensions and AMAT specifications
 */
export function calculateSkidWeight(
  dimensions: CrateDimensions,
  grossWeight: number,
  skidSize: AMATSkidSize
): number {
  const skidSpec = SKID_WEIGHT_SPECS[skidSize.nominalSize as keyof typeof SKID_WEIGHT_SPECS];
  if (!skidSpec) return 0;

  // Calculate total skid length (assuming 2 skids minimum)
  const skidLength = dimensions.length;
  const totalSkidLength = skidLength * 2; // 2 skids

  // Add cross braces if needed (for heavier loads)
  const crossBraces = grossWeight > 10000 ? Math.floor(dimensions.width / 24) : 0;
  const crossBraceLength = dimensions.width * crossBraces;
  const totalSkidMaterialLength = totalSkidLength + crossBraceLength;

  return (totalSkidMaterialLength * skidSpec.weightPerFoot) / 12; // Convert to lbs
}

/**
 * Calculate floorboard weight
 */
export function calculateFloorboardWeight(
  dimensions: CrateDimensions,
  thickness: number,
  material: string
): number {
  const floorboardArea = dimensions.length * dimensions.width;
  const floorboardVolume = (floorboardArea * thickness) / 1728; // Convert to cubic feet
  const density =
    MATERIAL_DENSITIES[material as keyof typeof MATERIAL_DENSITIES] || MATERIAL_DENSITIES.plywood;
  return floorboardVolume * density;
}

/**
 * Calculate hardware weight (nails, screws, bolts, brackets)
 */
export function calculateHardwareWeight(
  dimensions: CrateDimensions,
  fasteners: Fasteners,
  _crateStyle: AMATCrateStyle
): number {
  const { type, spacing } = fasteners;
  const hardwareSpec = HARDWARE_SPECS[type as keyof typeof HARDWARE_SPECS];
  if (!hardwareSpec) return 0;

  // Calculate total linear feet of fastening required
  const panelPerimeter = 2 * (dimensions.length + dimensions.width + dimensions.height);
  const totalFasteningLength = panelPerimeter * 6; // 6 sides of crate

  // Calculate number of fasteners based on spacing (more realistic count)
  const fastenerCount = Math.ceil(totalFasteningLength / spacing) * 0.3; // Reduce count for realistic usage
  const fastenerWeight = fastenerCount * MATERIAL_DENSITIES.nails;

  // Add bracket weight (typically 8 brackets for a crate)
  const bracketCount = 8;
  const bracketWeight = bracketCount * 0.15; // 0.15 lbs per bracket (lighter)

  return fastenerWeight + bracketWeight;
}

/**
 * Calculate foam cushioning weight
 */
export function calculateFoamWeight(dimensions: CrateDimensions, foamDensity: number): number {
  // Calculate foam volume (typically 1-inch thick on all sides)
  const foamThickness = 1; // inches
  const innerDimensions = {
    length: dimensions.length - 2 * foamThickness,
    width: dimensions.width - 2 * foamThickness,
    height: dimensions.height - 2 * foamThickness,
  };

  // Foam volume is the difference between outer and inner dimensions
  const outerVolume = dimensions.length * dimensions.width * dimensions.height;
  const innerVolume =
    Math.max(0, innerDimensions.length) *
    Math.max(0, innerDimensions.width) *
    Math.max(0, innerDimensions.height);
  const foamVolume = (outerVolume - innerVolume) / 1728; // Convert to cubic feet

  return foamVolume * foamDensity;
}

/**
 * Calculate MBB (Moisture Barrier Bag) weight
 */
export function calculateMBBWeight(
  dimensions: CrateDimensions,
  thickness: number = 4 // mils
): number {
  // Calculate surface area of bag (needs to be larger than crate)
  const bagOversize = 4; // inches on each side
  const bagLength = dimensions.length + 2 * bagOversize;
  const bagWidth = dimensions.width + 2 * bagOversize;
  const bagHeight = dimensions.height + 2 * bagOversize;

  const surfaceArea = 2 * (bagLength * bagWidth + bagWidth * bagHeight + bagHeight * bagLength);
  const volume = (surfaceArea * thickness) / 1000000; // Convert mils to feet and calculate volume

  return volume * MATERIAL_DENSITIES.polyethylene;
}

/**
 * Calculate desiccant weight
 */
export function calculateDesiccantWeight(
  crateVolume: number, // cubic feet
  desiccantType: string = 'silica-gel'
): number {
  const desiccantDensity =
    MATERIAL_DENSITIES[desiccantType as keyof typeof MATERIAL_DENSITIES] ||
    MATERIAL_DENSITIES.silica_gel;
  // Typical desiccant quantity is 1 unit per cubic foot
  const desiccantVolume = crateVolume * 0.01; // Small volume relative to crate
  return desiccantVolume * desiccantDensity;
}

/**
 * Calculate accessory weights (shock indicators, tilt indicators, labels)
 */
export function calculateAccessoryWeight(
  productWeight: number,
  _crateStyle: AMATCrateStyle
): number {
  let accessoryWeight = 0;

  // Shock indicators (required for crates > 150 lbs)
  if (productWeight > 150) {
    accessoryWeight += 0.25; // 0.25 lbs per indicator (typically 2-4 per crate)
  }

  // Tilt indicators (required for crates > 150 lbs)
  if (productWeight > 150) {
    accessoryWeight += 0.25;
  }

  // Labels and documentation
  accessoryWeight += 0.1; // Labels, paperwork, etc.

  return accessoryWeight;
}

/**
 * Enhanced weight calculation for AMAT-compliant crates
 */
export function calculateEnhancedCrateWeight(
  configuration: CrateConfiguration,
  options: EnhancedWeightCalculationOptions = {}
): WeightBreakdown {
  const {
    includeFoamCushioning = true,
    includeMBB = true,
    includeDesiccant = true,
    includeHardware = true,
    includeAccessories = true,
    airShipmentMode: _airShipmentMode = false,
  } = options;

  const { dimensions, base, cap, fasteners, weight, amatCompliance } = configuration;
  const crateStyle = amatCompliance?.style || 'A';
  const productWeight = weight.product;

  // Calculate panel weights
  const panelWeights = {
    top: calculatePanelWeight(
      { length: dimensions.length, width: dimensions.width, height: 0 },
      cap.topPanel.thickness,
      cap.topPanel.material
    ),
    front: calculatePanelWeight(
      { length: dimensions.length, width: 0, height: dimensions.height },
      cap.frontPanel.thickness,
      cap.frontPanel.material
    ),
    back: calculatePanelWeight(
      { length: dimensions.length, width: 0, height: dimensions.height },
      cap.backPanel.thickness,
      cap.backPanel.material
    ),
    left: calculatePanelWeight(
      { length: 0, width: dimensions.width, height: dimensions.height },
      cap.leftPanel.thickness,
      cap.leftPanel.material
    ),
    right: calculatePanelWeight(
      { length: 0, width: dimensions.width, height: dimensions.height },
      cap.rightPanel.thickness,
      cap.rightPanel.material
    ),
  };

  const totalPanelWeight = Object.values(panelWeights).reduce((sum, weight) => sum + weight, 0);

  // Calculate framing weight (cleats and reinforcements)
  const cleatingWeight = Object.values(cap).reduce((sum, panel) => {
    if (panel.reinforcement) {
      return (
        sum +
        calculateCleatingWeight({ length: dimensions.length, width: dimensions.width }, crateStyle)
      );
    }
    return sum;
  }, 0);

  const totalFramingWeight = cleatingWeight;

  // Calculate base weight (skids and floorboards)
  const skidWeight = calculateSkidWeight(dimensions, productWeight * 1.2, {
    nominalSize: `${base.skidWidth}x${base.skidHeight}`,
    actualDimensions: { width: base.skidWidth, height: base.skidHeight },
    weightCapacity: { min: 0, max: productWeight * 1.2 },
  } as AMATSkidSize);

  const floorboardWeight = calculateFloorboardWeight(
    dimensions,
    base.floorboardThickness,
    base.material
  );

  const totalBaseWeight = skidWeight + floorboardWeight;

  // Calculate hardware weight
  const hardwareWeight = includeHardware
    ? calculateHardwareWeight(dimensions, fasteners, crateStyle)
    : 0;

  // Calculate protection materials weight
  let protectionWeight = 0;

  if (includeFoamCushioning && amatCompliance?.foamDensity) {
    protectionWeight += calculateFoamWeight(dimensions, amatCompliance.foamDensity);
  }

  if (includeMBB && amatCompliance?.requiresMoistureBag) {
    protectionWeight += calculateMBBWeight(dimensions);
  }

  if (includeDesiccant && amatCompliance?.desiccantUnits) {
    const crateVolume = (dimensions.length * dimensions.width * dimensions.height) / 1728;
    protectionWeight += calculateDesiccantWeight(crateVolume);
  }

  // Calculate accessory weight
  const accessoryWeight = includeAccessories
    ? calculateAccessoryWeight(productWeight, crateStyle)
    : 0;

  // Calculate totals
  const totalWeight =
    totalPanelWeight +
    totalFramingWeight +
    totalBaseWeight +
    hardwareWeight +
    protectionWeight +
    accessoryWeight;

  return {
    panels: {
      ...panelWeights,
      total: totalPanelWeight,
    },
    framing: {
      cleats: cleatingWeight,
      reinforcements: 0, // Will be calculated separately if needed
      total: totalFramingWeight,
    },
    base: {
      skids: skidWeight,
      floorboards: floorboardWeight,
      total: totalBaseWeight,
    },
    hardware: {
      fasteners: hardwareWeight * 0.8, // 80% of hardware weight is fasteners
      brackets: hardwareWeight * 0.2, // 20% is brackets
      total: hardwareWeight,
    },
    protection: {
      foam:
        includeFoamCushioning && amatCompliance?.foamDensity
          ? calculateFoamWeight(dimensions, amatCompliance.foamDensity)
          : 0,
      mbb: includeMBB && amatCompliance?.requiresMoistureBag ? calculateMBBWeight(dimensions) : 0,
      desiccant:
        includeDesiccant && amatCompliance?.desiccantUnits
          ? calculateDesiccantWeight(
              (dimensions.length * dimensions.width * dimensions.height) / 1728
            )
          : 0,
      total: protectionWeight,
    },
    accessories: {
      shockIndicators: productWeight > 150 ? 0.25 : 0,
      tiltIndicators: productWeight > 150 ? 0.25 : 0,
      labels: 0.1,
      total: accessoryWeight,
    },
    total: totalWeight,
  };
}

/**
 * Calculate dimensional weight for air freight
 */
export function calculateDimensionalWeight(
  dimensions: CrateDimensions,
  dimensionalWeightFactor: number = 166
): number {
  const volumeCubicFeet = (dimensions.length * dimensions.width * dimensions.height) / 1728;
  return volumeCubicFeet * dimensionalWeightFactor;
}

/**
 * Calculate total billable weight (actual vs dimensional, whichever is greater)
 */
export function calculateBillableWeight(actualWeight: number, dimensionalWeight: number): number {
  return Math.max(actualWeight, dimensionalWeight);
}
