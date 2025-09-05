// Jest configuration for Puppeteer E2E tests
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  testTimeout: 60000,
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
