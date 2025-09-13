import '@testing-library/jest-dom'

// Mock WebGL for Three.js tests
global.WebGLRenderingContext = class WebGLRenderingContext {}
global.WebGL2RenderingContext = class WebGL2RenderingContext {}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
