import {
  MEDIUM_WEIGHT_THRESHOLD,
  HEAVY_WEIGHT_THRESHOLD,
  EXTRA_HEAVY_WEIGHT_THRESHOLD,
  SKID_SPECS,
} from '@/lib/constants';

// Skid sizing calculations
export function calculateSkidSize(weight: number) {
  // Determine skid size based on weight thresholds
  if (weight <= MEDIUM_WEIGHT_THRESHOLD) {
    return SKID_SPECS.LIGHT;
  } else if (weight <= HEAVY_WEIGHT_THRESHOLD) {
    return SKID_SPECS.MEDIUM;
  } else if (weight <= EXTRA_HEAVY_WEIGHT_THRESHOLD) {
    return SKID_SPECS.HEAVY;
  } else if (weight <= 5000) {
    return SKID_SPECS.EXTRA_HEAVY_ONE;
  } else {
    return SKID_SPECS.EXTRA_HEAVY_TWO;
  }
}

export function calculateWeightPerSkid(totalWeight: number, skidCount: number) {
  if (skidCount <= 0) {
    throw new Error('Skid count must be positive');
  }
  return totalWeight / skidCount;
}
