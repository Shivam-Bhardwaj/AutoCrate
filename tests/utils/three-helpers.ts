import { vi } from 'vitest';
import * as THREE from 'three';

/**
 * Mock Three.js renderer for testing
 */
export class MockRenderer {
  domElement = document.createElement('canvas');
  setSize = vi.fn();
  render = vi.fn();
  setPixelRatio = vi.fn();
  setClearColor = vi.fn();
  shadowMap = {
    enabled: false,
    type: THREE.PCFSoftShadowMap,
  };
  toneMapping = THREE.ACESFilmicToneMapping;
  toneMappingExposure = 1;
  outputColorSpace = THREE.SRGBColorSpace;
  dispose = vi.fn();
}

/**
 * Mock OrbitControls for testing
 */
export class MockOrbitControls {
  constructor(camera: any, domElement: any) {}
  update = vi.fn();
  dispose = vi.fn();
  enableDamping = true;
  dampingFactor = 0.05;
  minDistance = 1;
  maxDistance = 100;
  maxPolarAngle = Math.PI / 2;
}

/**
 * Create a test scene with basic setup
 */
export function createTestScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new MockRenderer() as any;

  return { scene, camera, renderer };
}

/**
 * Create a mock crate mesh for testing
 */
export function createMockCrateMesh(dimensions = { length: 10, width: 8, height: 6 }) {
  const geometry = new THREE.BoxGeometry(dimensions.length, dimensions.height, dimensions.width);
  const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'crate';
  return mesh;
}

/**
 * Test if a mesh has the expected dimensions
 */
export function expectMeshDimensions(
  mesh: THREE.Mesh,
  expectedDimensions: { length: number; width: number; height: number }
) {
  const geometry = mesh.geometry as THREE.BoxGeometry;
  const parameters = geometry.parameters;

  expect(parameters.width).toBeCloseTo(expectedDimensions.length);
  expect(parameters.height).toBeCloseTo(expectedDimensions.height);
  expect(parameters.depth).toBeCloseTo(expectedDimensions.width);
}

/**
 * Mock Three.js loader for testing
 */
export class MockGLTFLoader {
  load = vi.fn((url: string, onLoad: (gltf: any) => void) => {
    // Simulate async loading
    setTimeout(() => {
      onLoad({
        scene: new THREE.Group(),
        animations: [],
        cameras: [],
      });
    }, 0);
  });
}

/**
 * Helper to wait for Three.js animations
 */
export async function waitForAnimation(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to simulate mouse interaction on canvas
 */
export function simulateCanvasMouseEvent(
  canvas: HTMLCanvasElement,
  type: string,
  clientX = 0,
  clientY = 0
) {
  const event = new MouseEvent(type, {
    clientX,
    clientY,
    bubbles: true,
    cancelable: true,
  });
  canvas.dispatchEvent(event);
}

/**
 * Helper to get bounding box of a mesh or group
 */
export function getMeshBoundingBox(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  return {
    min: box.min,
    max: box.max,
    size,
    center: box.getCenter(new THREE.Vector3()),
  };
}

/**
 * Mock WebGL capabilities for testing
 */
export const mockWebGLCapabilities = {
  isWebGL2: true,
  maxTextures: 16,
  maxVertexTextures: 16,
  maxTextureSize: 16384,
  maxCubemapSize: 16384,
  maxAttributes: 16,
  maxVertexUniforms: 4096,
  maxVaryings: 32,
  maxFragmentUniforms: 4096,
  vertexTextures: true,
  floatFragmentTextures: true,
  floatVertexTextures: true,
};
