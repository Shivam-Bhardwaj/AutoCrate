// Test script to verify skid dimensions are working correctly
const { calculateSkidConfiguration } = require('./src/utils/skid-calculations.ts');

console.log('Testing Skid Dimension Calculations:');
console.log('=====================================');

// Test cases with different weights
const testCases = [
  { weightKg: 113.4, description: 'Light load (< 500 lbs)' },
  { weightKg: 453.6, description: 'Medium load (~1000 lbs)' },
  { weightKg: 2268, description: 'Heavy load (~5000 lbs)' },
  { weightKg: 4536, description: 'Very heavy load (~10000 lbs)' },
];

testCases.forEach((testCase, index) => {
  try {
    const dimensions = { length: 48, width: 40, height: 40 };
    const result = calculateSkidConfiguration(dimensions, testCase.weightKg);

    console.log(`\n${index + 1}. ${testCase.description}`);
    console.log(`   Weight: ${(testCase.weightKg * 2.20462).toFixed(0)} lbs`);
    console.log(`   Skid Dimensions: ${result.dimensions.width}" × ${result.dimensions.height}"`);
    console.log(`   Skid Count: ${result.count}`);
    console.log(`   Spacing: ${result.spacing}" center-to-center`);

    // Verify dimensions are reasonable
    const isValidWidth = [3, 4, 6, 8].includes(result.dimensions.width);
    const isValidHeight = [3.5, 4, 6, 8].includes(result.dimensions.height);

    console.log(`   ✓ Valid lumber dimensions: ${isValidWidth && isValidHeight ? 'YES' : 'NO'}`);

  } catch (error) {
    console.log(`Error for ${testCase.description}: ${error.message}`);
  }
});

console.log('\nExpected Results:');
console.log('- Light loads should use 4" × 4" lumber');
console.log('- Medium loads should use 4" × 4" lumber');
console.log('- Heavy loads should use 4" × 6" lumber');
console.log('- Very heavy loads should use 6" × 6" lumber');
