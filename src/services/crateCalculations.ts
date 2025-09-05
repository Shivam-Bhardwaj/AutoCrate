import {
  SURFACE_AREA_COEFFICIENT,
  LIGHT_WEIGHT_THRESHOLD,
  MEDIUM_WEIGHT_THRESHOLD,
  HEAVY_WEIGHT_THRESHOLD,
  LIGHT_PANEL_THICKNESS,
  PANEL_THICKNESS,
  HEAVY_PANEL_THICKNESS,
} from '@/lib/constants';

// Crate dimension calculations
export function calculateCrateDimensions(length: number, width: number, height: number) {
  // Validate inputs
  if (length <= 0 || width <= 0 || height <= 0) {
    throw new Error('Dimensions must be positive');
  }

  const volume = length * width * height;
  const surfaceArea =
    SURFACE_AREA_COEFFICIENT * (length * width + width * height + height * length);

  return {
    volume,
    surfaceArea,
    diagonal: Math.sqrt(length * length + width * width + height * height),
  };
}

export function calculatePanelThickness(weight: number) {
  // Calculate panel thickness based on weight
  if (weight < LIGHT_WEIGHT_THRESHOLD) return LIGHT_PANEL_THICKNESS;
  if (weight < MEDIUM_WEIGHT_THRESHOLD) return PANEL_THICKNESS;
  if (weight < HEAVY_WEIGHT_THRESHOLD) return 1.0;
  return HEAVY_PANEL_THICKNESS;
}
