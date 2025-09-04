/**
 * Formats a decimal inch value as a fraction
 * @param decimal The decimal value in inches
 * @param showWholeNumber Whether to show the whole number part separately
 * @returns Formatted string with fractional inches
 */
export function formatInches(decimal: number, showWholeNumber: boolean = true): string {
  const whole = Math.floor(decimal);
  const fraction = decimal - whole;

  // Common fractions used in woodworking
  const fractions = [
    { value: 0, display: '' },
    { value: 0.0625, display: '1/16' },
    { value: 0.125, display: '1/8' },
    { value: 0.1875, display: '3/16' },
    { value: 0.25, display: '1/4' },
    { value: 0.3125, display: '5/16' },
    { value: 0.375, display: '3/8' },
    { value: 0.4375, display: '7/16' },
    { value: 0.5, display: '1/2' },
    { value: 0.5625, display: '9/16' },
    { value: 0.625, display: '5/8' },
    { value: 0.6875, display: '11/16' },
    { value: 0.75, display: '3/4' },
    { value: 0.8125, display: '13/16' },
    { value: 0.875, display: '7/8' },
    { value: 0.9375, display: '15/16' },
  ];

  // Find the closest fraction
  let closestFraction = fractions[0];
  let minDiff = Math.abs(fraction);

  for (const frac of fractions) {
    const diff = Math.abs(fraction - frac.value);
    if (diff < minDiff) {
      minDiff = diff;
      closestFraction = frac;
    }
  }

  // Format the result
  if (whole === 0 && closestFraction.display === '') {
    return '0';
  } else if (whole === 0) {
    return closestFraction.display;
  } else if (closestFraction.display === '') {
    return `${whole}`;
  } else if (showWholeNumber) {
    return `${whole} ${closestFraction.display}`;
  } else {
    // Convert to improper fraction
    const numerator = whole * 16 + Math.round(closestFraction.value * 16);
    return `${numerator}/16`;
  }
}

/**
 * Parses a fractional inch string to decimal
 * @param value The string value (e.g., "5 1/2", "3/4", "12")
 * @returns Decimal value in inches
 */
export function parseInches(value: string): number {
  const trimmed = value.trim();

  // Check if it's just a decimal number
  if (!trimmed.includes('/') && !trimmed.includes(' ')) {
    return parseFloat(trimmed) || 0;
  }

  // Check for mixed number (e.g., "5 1/2")
  const parts = trimmed.split(' ');
  let whole = 0;
  let fractionStr = trimmed;

  if (parts.length === 2) {
    whole = parseInt(parts[0]) || 0;
    fractionStr = parts[1];
  }

  // Parse fraction
  if (fractionStr.includes('/')) {
    const fractionParts = fractionStr.split('/');
    const numerator = parseInt(fractionParts[0]) || 0;
    const denominator = parseInt(fractionParts[1]) || 1;
    return whole + numerator / denominator;
  }

  return whole;
}
