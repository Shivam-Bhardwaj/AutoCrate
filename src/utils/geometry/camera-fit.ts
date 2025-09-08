import type { PerspectiveCamera } from 'three';

export interface FitOptions {
  margin?: number; // fraction of half-size (default 0.15)
  minDistance?: number;
  maxDistance?: number;
  lockZ?: boolean; // if true keep camera above ground looking at center
}

/** Fit a perspective camera to an axis-aligned bounding box (AABB). */
export function fitCameraToBox(
  camera: PerspectiveCamera,
  aabb: {
    size: [number, number, number];
    min: [number, number, number];
    max: [number, number, number];
  },
  options: FitOptions = {}
) {
  const { size } = aabb;
  const margin = options.margin ?? 0.15;
  const aspect = camera.aspect || 1;
  const fovRad = (camera.fov * Math.PI) / 180;

  // Consider both vertical and horizontal FOV constraints
  const halfHeight = size[2] / 2;
  const halfWidth = Math.max(size[0], size[1]) / 2; // treat plan view size symmetrically

  // Distance needed for vertical framing
  const distV = halfHeight / Math.sin(fovRad / 2);
  // Horizontal FOV derived from vertical
  const hFov = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
  const distH = halfWidth / Math.sin(hFov / 2);
  let distance = Math.max(distV, distH) * (1 + margin);

  if (options.minDistance) distance = Math.max(distance, options.minDistance);
  if (options.maxDistance) distance = Math.min(distance, options.maxDistance);

  // Position camera on an isometric diagonal (X = +, Y = - for right-handed plan) above center
  const center: [number, number, number] = [
    (aabb.min[0] + aabb.max[0]) / 2,
    (aabb.min[1] + aabb.max[1]) / 2,
    (aabb.min[2] + aabb.max[2]) / 2,
  ];
  const elevation = center[2] + size[2] * 0.6; // Slightly above center

  camera.position.set(center[0] + distance, center[1] - distance, elevation + distance * 0.15);
  camera.up.set(0, 0, 1);
  camera.lookAt(center[0], center[1], center[2]);
  camera.updateProjectionMatrix();

  return { distance, center };
}
