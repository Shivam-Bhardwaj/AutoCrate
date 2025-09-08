const { calculateSkidConfiguration } = require('../src/utils/skid-calculations.ts');

// Test scenarios from the requirements
const testCases = [
  { weightKg: 113.4, dimensions: { length: 48, width: 40, height: 40 }, description: 'Light load (< 500lbs)' },
  { weightKg: 453.6, dimensions: { length: 48, width: 40, height: 40 }, description: 'Medium load (1000lbs)' },
  { weightKg: 2268, dimensions: { length: 48, width: 40, height: 40 }, description: 'Heavy load (5000lbs)' },
  { weightKg: 4536, dimensions: { length: 48, width: 40, height: 40 }, description: 'Very heavy load (10000lbs)' },
  { weightKg: 13608, dimensions: { length: 48, width: 40, height: 40 }, description: 'Very heavy load (30000lbs)' },
  { weightKg: 22680, dimensions: { length: 48, width: 40, height: 40 }, description: 'Maximum load (50000lbs)' },
];

console.log('Testing skid sizing logic with various scenarios:');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
  try {
    const result = calculateSkidConfiguration(testCase.dimensions, testCase.weightKg);
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Weight: ${(testCase.weightKg * 2.20462).toFixed(0)} lbs`);
    console.log(`   Skid Size: ${result.dimensions.height}"x${result.dimensions.width}"`);
    console.log(`   Spacing: ${result.spacing}" center-to-center`);
    console.log(`   Count: ${result.count} skids`);
    console.log(`   Rub Strips: ${result.requiresRubStrips ? 'Required' : 'Not required'}`);
    console.log('');
  } catch (error) {
    console.log(`Error for ${testCase.description}: ${error.message}`);
  }
});
