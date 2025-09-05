// Crate dimension calculations
export function calculateCrateDimensions(length: number, width: number, height: number) {
  // Validate inputs
  if (length <= 0 || width <= 0 || height <= 0) {
    throw new Error('Dimensions must be positive');
  }

  const volume = length * width * height;
  const surfaceArea = 2 * (length * width + width * height + height * length);

  return {
    volume,
    surfaceArea,
    diagonal: Math.sqrt(length * length + width * width + height * height),
  };
}

export function calculatePanelThickness(weight: number) {
  // Calculate panel thickness based on weight
  if (weight < 100) return 0.5;
  if (weight < 500) return 0.75;
  if (weight < 1000) return 1.0;
  return 1.5;
}
