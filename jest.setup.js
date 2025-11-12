// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

class MockHeaders {
  constructor(init = {}) {
    this.map = new Map()

    if (init instanceof MockHeaders) {
      for (const [key, value] of init) {
        this.set(key, value)
      }
    } else if (Array.isArray(init)) {
      for (const [key, value] of init) {
        this.set(key, value)
      }
    } else {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value)
      })
    }
  }

  set(key, value) {
    this.map.set(String(key).toLowerCase(), String(value))
  }

  get(key) {
    const value = this.map.get(String(key).toLowerCase())
    return value === undefined ? null : value
  }

  has(key) {
    return this.map.has(String(key).toLowerCase())
  }

  entries() {
    return this.map.entries()
  }

  [Symbol.iterator]() {
    return this.entries()
  }
}

class MockResponse {
  constructor(body = null, init = {}) {
    this.bodyRaw = body
    this.status = init.status ?? 200
    this.headers = init.headers instanceof MockHeaders ? init.headers : new MockHeaders(init.headers ?? {})
    this.ok = this.status >= 200 && this.status < 300
    this.body = body
  }

  static json(body, init = {}) {
    const headers = init.headers instanceof MockHeaders ? init.headers : new MockHeaders(init.headers ?? {})
    headers.set('content-type', 'application/json')
    const serialized = typeof body === 'string' ? body : JSON.stringify(body)
    return new MockResponse(serialized, { ...init, headers })
  }

  json() {
    if (typeof this.bodyRaw === 'string') {
      try {
        return Promise.resolve(JSON.parse(this.bodyRaw))
      } catch (error) {
        return Promise.resolve(this.bodyRaw)
      }
    }
    return Promise.resolve(this.bodyRaw)
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = MockHeaders
}
if (typeof global.Response === 'undefined') {
  global.Response = MockResponse
}

if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve(
      MockResponse.json({ lastUpdate: new Date().toISOString() })
    )
  )
}

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

const mockedUseGLTF = () => ({ scene: {} })
mockedUseGLTF.preload = jest.fn()

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Box: () => null,
  Grid: () => null,
  Text: ({ children }) => <span data-testid="drei-text">{children}</span>,
  Html: ({ children }) => <span>{children}</span>,
  Edges: () => null,
  Plane: ({ children }) => <div data-testid="drei-plane">{children}</div>,
  Clone: () => null,
  useGLTF: mockedUseGLTF
}))

// Mock Three.js BufferGeometryUtils ES module
jest.mock('three/examples/jsm/utils/BufferGeometryUtils.js', () => ({
<<<<<<< HEAD
  mergeGeometries: jest.fn((geometries) => geometries?.[0] || null)
=======
  mergeGeometries: jest.fn((geometries) => {
    // Return a mock geometry that mimics THREE.BufferGeometry
    const mockGeometry = {
      attributes: {},
      rotateZ: jest.fn(),
      center: jest.fn(),
      translate: jest.fn(),
      dispose: jest.fn()
    }
    return mockGeometry
  })
>>>>>>> origin/main
}))

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = jest.fn()

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn()
  })
}

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
