// Skid sizing calculations
export function calculateSkidSize(weight: number) {
  // Determine skid size based on weight thresholds
  if (weight <= 500) {
    return { width: 4, height: 4, quantity: 2 };
  } else if (weight <= 1000) {
    return { width: 4, height: 6, quantity: 2 };
  } else if (weight <= 2000) {
    return { width: 6, height: 6, quantity: 2 };
  } else if (weight <= 5000) {
    return { width: 6, height: 8, quantity: 3 };
  } else {
    return { width: 8, height: 8, quantity: 4 };
  }
}

export function calculateWeightPerSkid(totalWeight: number, skidCount: number) {
  if (skidCount <= 0) {
    throw new Error('Skid count must be positive');
  }
  return totalWeight / skidCount;
}
