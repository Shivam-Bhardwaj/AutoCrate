/**
 * PERFORMANCE: Shared materials for 3D rendering optimization
 *
 * This module provides a centralized material management system to:
 * - Prevent creating duplicate materials for similar geometry
 * - Enable material reuse across components
 * - Reduce memory usage and draw calls
 * - Maintain consistent visual appearance
 *
 * Target: Reduce material instances from ~20+ to <5 for typical crate
 */

import { MeshStandardMaterial, MeshBasicMaterial } from 'three';

// PERFORMANCE: Pre-created shared materials to avoid recreation on every render
export const SHARED_MATERIALS = {
  // Wood materials for different components
  SKID_WOOD: new MeshStandardMaterial({
    color: '#8B4513',
    roughness: 0.9,
    metalness: 0.05,
  }),

  FLOORBOARD_STANDARD: new MeshStandardMaterial({
    color: '#8B4513',
    roughness: 0.9,
    metalness: 0.05,
  }),

  FLOORBOARD_NARROW: new MeshStandardMaterial({
    color: '#6B3410',
    roughness: 0.9,
    metalness: 0.05,
  }),

  RUB_STRIP: new MeshStandardMaterial({
    color: '#6B3410',
    roughness: 0.9,
    metalness: 0.05,
  }),

  // Panel materials
  SIDE_PANEL: new MeshStandardMaterial({
    color: '#DEB887',
    transparent: true,
    opacity: 0.8,
    roughness: 0.7,
    metalness: 0.1,
  }),

  TOP_PANEL: new MeshStandardMaterial({
    color: '#F5DEB3',
    transparent: true,
    opacity: 0.9,
    roughness: 0.7,
    metalness: 0.1,
  }),

  // Gap material for board spacing
  BOARD_GAP: new MeshBasicMaterial({
    color: '#000000',
    opacity: 0.3,
    transparent: true,
  }),

  // Cleat material for corner reinforcements
  CLEAT_WOOD: new MeshStandardMaterial({
    color: '#654321',
    roughness: 0.8,
    metalness: 0.1,
  }),
} as const;

// PERFORMANCE: Material with hover state management
export function createHoverableMaterial(baseMaterial: MeshStandardMaterial, isHovered: boolean) {
  if (!isHovered) return baseMaterial;

  // Create temporary material for hover state
  // In production, you might want to cache these as well
  return new MeshStandardMaterial({
    color: baseMaterial.color,
    roughness: baseMaterial.roughness,
    metalness: baseMaterial.metalness,
    emissive: '#ff6600',
    emissiveIntensity: 0.2,
  });
}

// PERFORMANCE: Clean up materials when component unmounts
export function disposeMaterials() {
  Object.values(SHARED_MATERIALS).forEach((material) => {
    material.dispose();
  });
}

// Material selection helpers
export function getFloorboardMaterial(isNarrow: boolean) {
  return isNarrow ? SHARED_MATERIALS.FLOORBOARD_NARROW : SHARED_MATERIALS.FLOORBOARD_STANDARD;
}
