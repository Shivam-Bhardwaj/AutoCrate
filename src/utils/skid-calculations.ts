import { CrateDimensions } from '@/types/crate';

export interface SkidDimensions {
  height: number;
  width: number;
}

export interface SkidConfiguration {
  dimensions: SkidDimensions;
  count: number;
  spacing: number; // Center-to-center spacing in mm
  requiresRubStrips: boolean;
}

// Convert kg to lbs
const kgToLbs = (kg: number): number => kg * 2.20462;

// Convert inches to mm
const inchesToMm = (inches: number): number => inches * 25.4;

// Convert mm to inches
const mmToInches = (mm: number): number => mm / 25.4;

/**
 * Determines the appropriate skid size based on total loaded crate weight
 * @param weightKg Total loaded crate weight in kg
 * @param unit The unit system being used
 * @returns Skid dimensions in the specified unit
 */
export function getSkidSize(weightKg: number, unit: 'mm' | 'inch'): SkidDimensions {
  const weightLbs = kgToLbs(weightKg);
  
  let heightInches: number;
  let widthInches: number;
  
  if (weightLbs <= 500) {
    heightInches = 3;
    widthInches = 4;
  } else if (weightLbs <= 4500) {
    heightInches = 4;
    widthInches = 4;
  } else if (weightLbs <= 20000) {
    heightInches = 4;
    widthInches = 6;
  } else if (weightLbs <= 40000) {
    heightInches = 6;
    widthInches = 6;
  } else if (weightLbs <= 60000) {
    heightInches = 8;
    widthInches = 8;
  } else {
    // For weights over 60000 lbs, default to largest size
    heightInches = 8;
    widthInches = 8;
  }
  
  // All skids must have minimum height of 3.5 inches
  if (heightInches < 3.5) {
    heightInches = 3.5;
  }
  
  if (unit === 'mm') {
    return {
      height: Math.round(inchesToMm(heightInches)),
      width: Math.round(inchesToMm(widthInches))
    };
  }
  
  return {
    height: heightInches,
    width: widthInches
  };
}

/**
 * Determines the appropriate skid spacing based on skid size and crate weight
 * @param skidDimensions The dimensions of the skids
 * @param weightKg Total loaded crate weight in kg
 * @param unit The unit system being used
 * @returns Center-to-center spacing in the specified unit
 */
export function getSkidSpacing(
  skidDimensions: SkidDimensions, 
  weightKg: number, 
  unit: 'mm' | 'inch'
): number {
  const weightLbs = kgToLbs(weightKg);
  
  // Convert dimensions to inches for comparison
  const heightInches = unit === 'mm' ? mmToInches(skidDimensions.height) : skidDimensions.height;
  const widthInches = unit === 'mm' ? mmToInches(skidDimensions.width) : skidDimensions.width;
  
  let spacingInches: number;
  
  // Check skid sizes and apply appropriate spacing rules
  if ((heightInches === 3 && widthInches === 4) || (heightInches === 4 && widthInches === 4)) {
    spacingInches = 30;
  } else if (heightInches === 4 && widthInches === 6) {
    if (weightLbs < 6000) {
      spacingInches = 41;
    } else if (weightLbs <= 12000) {
      spacingInches = 28;
    } else {
      spacingInches = 24;
    }
  } else if (heightInches === 6 && widthInches === 6) {
    if (weightLbs <= 30000) {
      spacingInches = 24;
    } else {
      spacingInches = 20;
    }
  } else if (heightInches === 8 && widthInches === 8) {
    spacingInches = 24;
  } else {
    // Default spacing for any non-standard sizes
    spacingInches = 24;
  }
  
  if (unit === 'mm') {
    return Math.round(inchesToMm(spacingInches));
  }
  
  return spacingInches;
}

/**
 * Calculates the optimal number of skids based on crate length and spacing requirements
 * @param crateLength Length of the crate in the specified unit
 * @param spacing Center-to-center spacing in the specified unit
 * @param skidWidth Width of individual skid in the specified unit
 * @returns Number of skids needed (minimum 3)
 */
export function calculateSkidCount(
  crateLength: number, 
  spacing: number,
  skidWidth: number
): number {
  // Convert to mm for calculation if needed
  const lengthMm = crateLength;
  const spacingMm = spacing;
  const skidWidthMm = skidWidth;
  
  // Start with minimum 3 skids
  let skidCount = 3;
  
  // Calculate how many skids we can fit with the given spacing
  // For uniform distribution: (n-1) * spacing + skidWidth <= length
  // Where n is number of skids
  
  // Calculate maximum skids that can fit
  const maxSkids = Math.floor((lengthMm - skidWidthMm) / spacingMm) + 1;
  
  // Use the maximum that fits, but at least 3
  skidCount = Math.max(3, maxSkids);
  
  // For very long crates, we might need more skids for proper support
  // Add a skid for every 1200mm (about 4 feet) of length
  const recommendedByLength = Math.max(3, Math.ceil(lengthMm / 1200));
  
  // Use the greater of the two calculations
  skidCount = Math.max(skidCount, recommendedByLength);
  
  return skidCount;
}

/**
 * Determines if rub strips are required based on crate dimensions
 * @param crateDimensions The dimensions of the crate
 * @returns true if rub strips are required
 */
export function requiresRubStrips(crateDimensions: CrateDimensions): boolean {
  const lengthInInches = crateDimensions.unit === 'mm' 
    ? mmToInches(crateDimensions.length) 
    : crateDimensions.length;
  
  // Rub strips required for bases longer than 96 inches
  return lengthInInches > 96;
}

/**
 * Calculates complete skid configuration based on crate specifications
 * @param crateDimensions The dimensions of the crate
 * @param weightKg Total loaded crate weight in kg
 * @returns Complete skid configuration
 */
export function calculateSkidConfiguration(
  crateDimensions: CrateDimensions,
  weightKg: number
): SkidConfiguration {
  const skidDimensions = getSkidSize(weightKg, crateDimensions.unit);
  const spacing = getSkidSpacing(skidDimensions, weightKg, crateDimensions.unit);
  const count = calculateSkidCount(crateDimensions.length, spacing, skidDimensions.width);
  const requiresRubStripsFlag = requiresRubStrips(crateDimensions);
  
  return {
    dimensions: skidDimensions,
    count,
    spacing,
    requiresRubStrips: requiresRubStripsFlag
  };
}

/**
 * Validates skid configuration against requirements
 * @param config Skid configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateSkidConfiguration(config: SkidConfiguration): string[] {
  const errors: string[] = [];
  
  // Check minimum skid count
  if (config.count < 3) {
    errors.push('At least 3 skids are required');
  }
  
  // Check minimum skid height (converted to inches for validation)
  const minHeightInches = 3.5;
  const heightInches = config.dimensions.height / 25.4; // Assuming dimensions in mm
  if (heightInches < minHeightInches) {
    errors.push(`Skid height must be at least ${minHeightInches} inches`);
  }
  
  return errors;
}