import { CrateDimensions } from '@/types/crate';

export interface SkidDimensions {
  height: number;
  width: number;
}

export interface SkidConfiguration {
  dimensions: SkidDimensions;
  count: number;
  spacing: number; // Center-to-center spacing in inches
  requiresRubStrips: boolean;
}

// Convert kg to lbs
const kgToLbs = (kg: number): number => kg * 2.20462;

/**
 * Determines the appropriate skid size based on total loaded crate weight
 * @param weightKg Total loaded crate weight in kg
 * @returns Skid dimensions in inches (actual dimensions for nominal lumber)
 */
export function getSkidSize(weightKg: number): SkidDimensions {
  const weightLbs = kgToLbs(weightKg);

  let heightInches: number;
  let widthInches: number;

  if (weightLbs < 500) {
    // According to Table 5-3, use 3x4 for < 500 lbs
    // But we need to meet minimum 3.5" height requirement
    // Use 4x4 to ensure minimum height is met
    // Actual dimensions: nominal 4x4 = 3.5" x 3.5"
    heightInches = 3.5;
    widthInches = 3.5;
  } else if (weightLbs <= 4500) {
    // Nominal 4x4 = actual 3.5" x 3.5"
    heightInches = 3.5;
    widthInches = 3.5;
  } else if (weightLbs <= 20000) {
    // Nominal 4x6 = actual 3.5" x 5.5"
    heightInches = 3.5;
    widthInches = 5.5;
  } else if (weightLbs <= 40000) {
    // Nominal 6x6 = actual 5.5" x 5.5"
    heightInches = 5.5;
    widthInches = 5.5;
  } else if (weightLbs <= 60000) {
    // Nominal 8x8 = actual 7.25" x 7.25"
    heightInches = 7.25;
    widthInches = 7.25;
  } else {
    // For weights over 60000 lbs, default to largest size
    // Nominal 8x8 = actual 7.25" x 7.25"
    heightInches = 7.25;
    widthInches = 7.25;
  }

  // All skids must have minimum height of 3.5 inches for material handling equipment access
  if (heightInches < 3.5) {
    heightInches = 3.5;
  }

  return {
    height: heightInches,
    width: widthInches,
  };
}

/**
 * Determines the appropriate skid spacing based on skid size and crate weight
 * @param skidDimensions The dimensions of the skids (actual dimensions)
 * @param weightKg Total loaded crate weight in kg
 * @returns Center-to-center spacing in inches
 */
export function getSkidSpacing(skidDimensions: SkidDimensions, weightKg: number): number {
  const weightLbs = kgToLbs(weightKg);

  // Dimensions already in inches (actual dimensions)
  const heightInches = skidDimensions.height;
  const widthInches = skidDimensions.width;

  let spacingInches: number;

  // Apply Table 5-4 spacing requirements based on lumber size and weight
  // Using actual dimensions for the calculations
  if ((heightInches === 3.5 && widthInches === 3.5) || (heightInches === 2.5 && widthInches === 3.5)) {
    // 3x4 or 4x4 skids (actual dimensions): ≤ 30.00" spacing
    spacingInches = 30.00;
  } else if (heightInches === 3.5 && widthInches === 5.5) {
    // 4x6 skids (actual dimensions) spacing based on weight
    if (weightLbs < 6000) {
      spacingInches = 41.00;
    } else if (weightLbs <= 12000) {
      spacingInches = 28.00;
    } else {
      spacingInches = 24.00;
    }
  } else if (heightInches === 5.5 && widthInches === 5.5) {
    // 6x6 skids (actual dimensions) spacing based on weight
    if (weightLbs <= 30000) {
      spacingInches = 24.00;
    } else {
      spacingInches = 20.00;
    }
  } else if (heightInches === 7.25 && widthInches === 7.25) {
    // 8x8 skids (actual dimensions): ≤ 24.00" spacing
    spacingInches = 24.00;
  } else {
    // Default spacing for any non-standard sizes
    spacingInches = 24.00;
  }

  return spacingInches;
}

/**
 * Calculates the optimal number of skids based on crate width and spacing requirements
 * @param crateWidth Width of the crate in inches (skids are positioned along this dimension)
 * @param spacing Center-to-center spacing in inches
 * @param skidWidth Width of individual skid in inches
 * @returns Number of skids needed (minimum 3)
 */
export function calculateSkidCount(
  crateWidth: number,
  spacing: number,
  skidWidth: number
): number {
  // All values in inches
  const widthInches = crateWidth;
  const spacingInches = spacing;
  const skidWidthInches = skidWidth;

  // Start with minimum 3 skids
  let skidCount = 3;

  // Calculate how many skids we can fit with the given spacing
  // For uniform distribution: (n-1) * spacing + skidWidth <= width
  // Where n is number of skids

  // Calculate maximum skids that can fit
  const maxSkids = Math.floor((widthInches - skidWidthInches) / spacingInches) + 1;

  // Use the maximum that fits, but at least 3
  skidCount = Math.max(3, maxSkids);

  // For very wide crates, we might need more skids for proper support
  // Add a skid for every 48 inches (4 feet) of width
  const recommendedByWidth = Math.max(3, Math.ceil(widthInches / 48));

  // Use the greater of the two calculations
  skidCount = Math.max(skidCount, recommendedByWidth);

  return skidCount;
}

/**
 * Determines if rub strips are required based on crate dimensions
 * @param crateDimensions The dimensions of the crate
 * @returns true if rub strips are required
 */
export function requiresRubStrips(crateDimensions: CrateDimensions): boolean {
  // Length already in inches
  const lengthInInches = crateDimensions.length;

  // Rub strips required for bases longer than 96 inches
  return lengthInInches > 96;
}

/**
 * Determines if 4x6 skids should be replaced with 4x4 skids for lighter loads
 * According to spec: "4x6 skids for products under 4500 lbs can be replaced with equal or greater number of 4x4 skids"
 * @param weightKg Total loaded crate weight in kg
 * @param crateWidth Width of the crate in inches
 * @returns true if 4x4 replacement should be used
 */
export function shouldUse4x4Replacement(weightKg: number, crateWidth: number): boolean {
  const weightLbs = kgToLbs(weightKg);

  // Only consider replacement for weights that would normally use 4x6 (4501-20000 lbs)
  if (weightLbs <= 4500 || weightLbs > 20000) {
    return false;
  }

  // For very wide crates, 4x6 might be preferable for stability
  // For narrower crates, 4x4 replacement might be more cost-effective
  // Use replacement for crates narrower than 72 inches
  return crateWidth < 72;
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
  let skidDimensions = getSkidSize(weightKg);

  // Check if we should replace 4x6 with 4x4 for lighter loads
  if (shouldUse4x4Replacement(weightKg, crateDimensions.width) &&
      skidDimensions.height === 4 && skidDimensions.width === 6) {
    skidDimensions = { height: 4, width: 4 };
  }

  const spacing = getSkidSpacing(skidDimensions, weightKg);
  const count = calculateSkidCount(crateDimensions.width, spacing, skidDimensions.width);
  const requiresRubStripsFlag = requiresRubStrips(crateDimensions);

  return {
    dimensions: skidDimensions,
    count,
    spacing,
    requiresRubStrips: requiresRubStripsFlag,
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

  // Check minimum skid height
  const minHeightInches = 3.5;
  const heightInches = config.dimensions.height; // Already in inches
  if (heightInches < minHeightInches) {
    errors.push(`Skid height must be at least ${minHeightInches} inches`);
  }

  return errors;
}
