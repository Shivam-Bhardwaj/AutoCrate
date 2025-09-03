import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import 'resize-observer-polyfill';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return vi.h('img', { src, alt, ...props });
  },
}));

// Mock WebGL context for Three.js testing
class MockWebGLRenderingContext {
  canvas = {
    width: 800,
    height: 600,
    style: {},
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    clientWidth: 800,
    clientHeight: 600,
  };

  getParameter = vi.fn(() => 1024);
  getExtension = vi.fn();
  getShaderPrecisionFormat = vi.fn(() => ({
    rangeMin: 1,
    rangeMax: 1,
    precision: 1,
  }));
  createShader = vi.fn();
  shaderSource = vi.fn();
  compileShader = vi.fn();
  getShaderParameter = vi.fn(() => true);
  createProgram = vi.fn();
  attachShader = vi.fn();
  linkProgram = vi.fn();
  getProgramParameter = vi.fn(() => true);
  useProgram = vi.fn();
  createBuffer = vi.fn();
  bindBuffer = vi.fn();
  bufferData = vi.fn();
  createTexture = vi.fn();
  bindTexture = vi.fn();
  texImage2D = vi.fn();
  texParameteri = vi.fn();
  viewport = vi.fn();
  clearColor = vi.fn();
  clear = vi.fn();
  enable = vi.fn();
  disable = vi.fn();
  depthFunc = vi.fn();
  depthMask = vi.fn();
  getUniformLocation = vi.fn();
  uniformMatrix4fv = vi.fn();
  drawArrays = vi.fn();
  drawElements = vi.fn();
}

// Add WebGL support to happy-dom
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
    if (
      contextType === 'webgl' ||
      contextType === 'webgl2' ||
      contextType === 'experimental-webgl'
    ) {
      return new MockWebGLRenderingContext();
    }
    return null;
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
