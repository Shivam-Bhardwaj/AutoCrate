// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock the Three.js components that don't work in test environment
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => children,
  useFrame: () => {},
  useThree: () => ({
    camera: {},
    scene: {},
    gl: {},
    size: { width: 800, height: 600 }
  })
}))

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Box: () => null,
  Grid: () => null,
  Text: () => null,
  Html: () => null,
  Edges: () => null
}))

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = jest.fn()

// Suppress console errors in tests unless explicitly testing error handling
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})