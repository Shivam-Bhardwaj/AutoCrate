// Jest configuration for Puppeteer E2E tests
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  // Increase timeout to accommodate first-time production server spin-up on CI
  testTimeout: 120000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverage: false,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '../../test-results',
        outputName: 'e2e-results.xml',
      },
    ],
  ],
};
