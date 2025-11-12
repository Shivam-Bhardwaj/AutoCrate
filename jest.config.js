const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFiles: ['<rootDir>/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next/server$': '<rootDir>/test/__mocks__/next-server.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/types.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/tests/e2e/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(three)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  modulePathIgnorePatterns: ['/issues/'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  coverageThreshold: {
    global: {
      statements: 56,
      branches: 50,
      functions: 49,
      lines: 56,
    },
    'src/lib/nx-generator.ts': {
      statements: 90,
      branches: 70,
      functions: 95,
      lines: 90,
    },
    'src/lib/tutorial/schema.ts': {
      statements: 85,
      branches: 55,
      functions: 85,
      lines: 85,
    },
    'src/lib/crate-constants.ts': {
      statements: 70,
      branches: 60,
      functions: 25,
      lines: 70,
    },
    'src/components/tutorial/**/*.tsx': {
      statements: 50,
      branches: 30,
      functions: 40,
      lines: 50,
    },
    'src/components/VisualChecklist.tsx': {
      statements: 35,
      branches: 20,
      functions: 30,
      lines: 35,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
