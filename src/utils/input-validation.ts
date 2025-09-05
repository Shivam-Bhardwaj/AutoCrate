import { CrateConfiguration } from '@/types/crate';

// Constants for validation ranges
const MIN_DIMENSION = 0.1; // Minimum dimension in inches
const MAX_DIMENSION = 1000; // Maximum dimension in inches (reasonable limit)
const MIN_WEIGHT = 0.1; // Minimum weight in lbs
const MAX_WEIGHT = 100000; // Maximum weight in lbs (100,000 lbs)
const MIN_THICKNESS = 0.01; // Minimum thickness in inches
const MAX_THICKNESS = 10; // Maximum thickness in inches
const MIN_SKID_COUNT = 2; // Minimum number of skids
const MAX_SKID_COUNT = 10; // Maximum number of skids

/**
 * Clamps a numeric value between min and max bounds
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Validates and clamps dimension values for 3D rendering
 */
export function validateDimension(value: number | undefined, defaultValue: number): number {
  if (value === undefined || value === null || isNaN(value)) {
    return defaultValue;
  }
  return clampValue(value, MIN_DIMENSION, MAX_DIMENSION);
}

/**
 * Validates and clamps weight values
 */
export function validateWeight(value: number | undefined, defaultValue: number): number {
  if (value === undefined || value === null || isNaN(value)) {
    return defaultValue;
  }
  return clampValue(value, MIN_WEIGHT, MAX_WEIGHT);
}

/**
 * Validates and clamps thickness values
 */
export function validateThickness(value: number | undefined, defaultValue: number): number {
  if (value === undefined || value === null || isNaN(value)) {
    return defaultValue;
  }
  return clampValue(value, MIN_THICKNESS, MAX_THICKNESS);
}

/**
 * Validates and clamps skid count
 */
export function validateSkidCount(value: number | undefined, defaultValue: number): number {
  if (value === undefined || value === null || isNaN(value)) {
    return defaultValue;
  }
  return Math.round(clampValue(value, MIN_SKID_COUNT, MAX_SKID_COUNT));
}

/**
 * Validates and sanitizes a complete crate configuration for 3D rendering
 */
export function validateCrateConfiguration(
  config: CrateConfiguration | null
): CrateConfiguration | null {
  if (!config) return null;

  return {
    ...config,
    dimensions: {
      length: validateDimension(config.dimensions.length, 48),
      width: validateDimension(config.dimensions.width, 40),
      height: validateDimension(config.dimensions.height, 36),
    },
    weight: {
      maxGross: validateWeight(config.weight.maxGross, 1000),
      product: validateWeight(config.weight.product, 800),
    },
    base: {
      ...config.base,
      skidHeight: validateThickness(config.base.skidHeight, 4),
      skidWidth: validateThickness(config.base.skidWidth, 6),
      skidSpacing: validateDimension(config.base.skidSpacing, 20),
      skidCount: validateSkidCount(config.base.skidCount, 3),
      floorboardThickness: validateThickness(config.base.floorboardThickness, 1.5),
    },
    cap: {
      ...config.cap,
      topPanel: {
        ...config.cap.topPanel,
        thickness: validateThickness(config.cap.topPanel.thickness, 0.75),
      },
    },
  };
}

/**
 * Checks if a configuration has valid values for 3D rendering
 */
export function isValidForRendering(config: CrateConfiguration | null): boolean {
  if (!config) return false;

  const { dimensions, weight, base } = config;

  return (
    dimensions.length > 0 &&
    dimensions.width > 0 &&
    dimensions.height > 0 &&
    weight.maxGross > 0 &&
    base.skidHeight > 0 &&
    base.skidWidth > 0 &&
    base.skidCount >= 2 &&
    !isNaN(dimensions.length) &&
    !isNaN(dimensions.width) &&
    !isNaN(dimensions.height)
  );
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .trim()
    .slice(0, 100); // Limit length
}

/**
 * Validates numeric input from form fields
 */
export function parseNumericInput(value: string | number, defaultValue: number): number {
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}
