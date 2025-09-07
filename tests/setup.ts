import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import 'resize-observer-polyfill';
import React from 'react';
// Three.js / R3F global mocks to stabilize 3D component unit tests
vi.mock('@react-three/fiber', () => {
  const Canvas: React.FC<any> = ({ children, ...props }) =>
    React.createElement(
      'div',
      { 'data-testid': 'canvas', style: { width: '800px', height: '600px' }, ...props },
      children
    );
  Canvas.displayName = 'MockCanvas';

  const primitive = (id: string) => {
    const Comp: React.FC<any> = (props) =>
      React.createElement('div', { 'data-testid': id, ...props });
    Comp.displayName = `Mock${id.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase())}`;
    return Comp;
  };

  const ambientLight = primitive('ambient-light');
  const directionalLight = primitive('directional-light');
  const group = primitive('group');

  return {
    Canvas,
    useFrame: vi.fn(),
    useThree: () => ({
      camera: {
        fov: 50,
        position: { set: vi.fn() },
        lookAt: vi.fn(),
        updateProjectionMatrix: vi.fn(),
        up: { set: vi.fn() },
      },
      size: { width: 800, height: 600 },
      gl: { setPixelRatio: vi.fn() },
      scene: {},
    }),
    ambientLight,
    directionalLight,
    group,
  };
});

// Mock crate geometry builder with deterministic simplified geometry adequate for tests
vi.mock('@/utils/geometry/crate-geometry', () => ({
  buildCrateGeometry: (config: any) => {
    // Provide minimal but diverse block sets for tests
    return {
      skids: [{ dimensions: [10, 2, 2], position: [0, 0, 0] }],
      floorboards: [{ dimensions: [10, 1, 0.75], position: [0, 0, 0.75] }],
      panels: [
        { dimensions: [10, 10], position: [0, 0, 5], orientation: 'frontback' },
        { dimensions: [10, 10], position: [0, 0, 5], orientation: 'leftright' },
        { dimensions: [10, 10], position: [0, 0, 10], orientation: 'top' },
      ],
      cleats: [],
      aabb: { min: [0, 0, 0], max: [10, 10, 10] },
    };
  },
}));

// Mock camera fitting util to no-op (avoids needing full three.js math)
vi.mock('@/utils/geometry/camera-fit', () => ({
  fitCameraToBox: () => {},
}));

// Mock validation to always accept config (bypasses complex schema requirements in tests)
vi.mock('@/utils/input-validation', () => ({
  validateCrateConfiguration: (c: any) => c,
  isValidForRendering: () => true,
}));

// Mock performance monitor
vi.mock('@/utils/performance-monitor', () => ({
  usePerformanceMonitor: () => ({ recordFrame: () => ({ fps: 60, frameTime: 16 }) }),
}));

// Mock shared materials so Box components can serialize them in data attributes
vi.mock('@/utils/materials', () => ({
  SHARED_MATERIALS: {
    SKID_WOOD: { color: '#8B4513' },
    FLOORBOARD_STANDARD: { color: '#8B4513' },
    SIDE_PANEL: { color: '#DEB887' },
    TOP_PANEL: { color: '#F5DEB3' },
    CLEAT_WOOD: { color: '#654321' },
  },
}));

vi.mock('@react-three/drei', () => {
  const simple = (id: string) => {
    const Comp: React.FC<any> = (props) =>
      React.createElement('div', { 'data-testid': id, ...props });
    Comp.displayName = `Mock${id.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase())}`;
    return Comp;
  };

  const OrbitControls = simple('orbit-controls');
  const Grid = simple('grid');
  const Box: React.FC<any> = ({ args, position, material }) =>
    React.createElement('div', {
      'data-testid': 'box',
      'data-args': JSON.stringify(args),
      'data-position': JSON.stringify(position),
      'data-material': JSON.stringify(material),
    });
  Box.displayName = 'MockBox';
  const Text: React.FC<any> = ({ children, position }) =>
    React.createElement(
      'div',
      { 'data-testid': 'text', 'data-position': JSON.stringify(position) },
      children
    );
  Text.displayName = 'MockText';
  const Html: React.FC<any> = ({ children }) =>
    React.createElement('div', { 'data-testid': 'html' }, children);
  Html.displayName = 'MockHtml';
  const Sphere: React.FC<any> = ({ children }) =>
    React.createElement('div', { 'data-testid': 'sphere' }, children);
  Sphere.displayName = 'MockSphere';
  const Line: React.FC<any> = ({ points }) =>
    React.createElement('div', { 'data-testid': 'line', 'data-points': JSON.stringify(points) });
  Line.displayName = 'MockLine';

  return { OrbitControls, Grid, Box, Text, Html, Sphere, Line };
});

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
vi.mock('next/image', () => {
  const NextImage: React.FC<any> = ({ src, alt, ...props }) =>
    React.createElement('img', { src, alt, ...props });
  NextImage.displayName = 'MockNextImage';
  return { default: NextImage };
});

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
  (HTMLCanvasElement.prototype as any).getContext = vi.fn((contextType: string) => {
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
