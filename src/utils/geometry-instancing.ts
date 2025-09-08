/**
 * PERFORMANCE: Geometry instancing utilities for 3D optimization
 *
 * This module provides instancing capabilities for repeated geometry:
 * - InstancedMesh for identical objects (skids)
 * - Geometry caching to avoid recalculation
 * - Level of Detail (LOD) system for performance scaling
 *
 * Target: Reduce draw calls from N objects to 1 instanced draw call
 */

import { Matrix4, Vector3, BoxGeometry } from 'three';
import { useMemo } from 'react';

// PERFORMANCE: Cached geometries to avoid recreation
const GEOMETRY_CACHE = new Map<string, BoxGeometry>();

export function getCachedBoxGeometry(width: number, height: number, depth: number): BoxGeometry {
  const key = `${width.toFixed(3)}-${height.toFixed(3)}-${depth.toFixed(3)}`;

  if (!GEOMETRY_CACHE.has(key)) {
    GEOMETRY_CACHE.set(key, new BoxGeometry(width, height, depth));
  }

  return GEOMETRY_CACHE.get(key)!;
}

// PERFORMANCE: Instance data calculator for skids
export function calculateSkidInstances(
  positions: number[],
  skidWidth: number,
  skidHeight: number,
  crateWidth: number
) {
  const instances = positions.map((xPos) => {
    const matrix = new Matrix4();
    matrix.setPosition(xPos, skidHeight / 2, 0);
    return matrix;
  });

  return {
    geometry: getCachedBoxGeometry(skidWidth, skidHeight, crateWidth),
    matrices: instances,
    count: positions.length,
  };
}

// PERFORMANCE: Level of Detail system
export interface LODConfig {
  highDetail: {
    distance: number;
    showGaps: boolean;
    showHover: boolean;
  };
  mediumDetail: {
    distance: number;
    showGaps: boolean;
    showHover: boolean;
  };
  lowDetail: {
    distance: number;
    showGaps: boolean;
    showHover: boolean;
  };
}

export const DEFAULT_LOD_CONFIG: LODConfig = {
  highDetail: {
    distance: 10,
    showGaps: true,
    showHover: true,
  },
  mediumDetail: {
    distance: 25,
    showGaps: true,
    showHover: false,
  },
  lowDetail: {
    distance: 50,
    showGaps: false,
    showHover: false,
  },
};

export function getLODLevel(cameraDistance: number, config: LODConfig = DEFAULT_LOD_CONFIG) {
  if (cameraDistance <= config.highDetail.distance) return 'high';
  if (cameraDistance <= config.mediumDetail.distance) return 'medium';
  return 'low';
}

export function getLODSettings(lodLevel: string, config: LODConfig = DEFAULT_LOD_CONFIG) {
  switch (lodLevel) {
    case 'high':
      return config.highDetail;
    case 'medium':
      return config.mediumDetail;
    default:
      return config.lowDetail;
  }
}

// PERFORMANCE: Frustum culling helper
export function isInViewFrustum(
  position: Vector3,
  cameraPosition: Vector3,
  maxDistance: number
): boolean {
  return position.distanceTo(cameraPosition) <= maxDistance;
}

// PERFORMANCE: Batch geometry operations
export interface BatchedGeometry {
  positions: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
  uvs: Float32Array;
}

export function createBatchedBoxes(
  boxes: Array<{ x: number; y: number; z: number; width: number; height: number; depth: number }>
): BatchedGeometry {
  // This is a simplified version - in a full implementation, you'd merge all box geometries
  // into a single geometry to reduce draw calls even further

  const verticesPerBox = 24; // 8 vertices * 3 components
  const indicesPerBox = 36; // 12 triangles * 3 indices

  const positions = new Float32Array(boxes.length * verticesPerBox);
  const indices = new Uint16Array(boxes.length * indicesPerBox);
  const normals = new Float32Array(boxes.length * verticesPerBox);
  const uvs = new Float32Array(((boxes.length * verticesPerBox) / 3) * 2);

  // Implementation would fill these arrays with merged geometry data
  // This is a placeholder for the concept

  return { positions, indices, normals, uvs };
}

// Clean up cached geometries
export function disposeGeometryCache() {
  GEOMETRY_CACHE.forEach((geometry) => geometry.dispose());
  GEOMETRY_CACHE.clear();
}

// PERFORMANCE: Memoization hook for expensive geometry calculations
export function useMemoizedGeometry<T>(factory: () => T, dependencies: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, dependencies);
}
