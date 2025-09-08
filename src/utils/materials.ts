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
  // Skids (darker wood)
  SKID_WOOD: new MeshStandardMaterial({
    color: '#5D3A1A', // dark brown
    roughness: 0.9,
    metalness: 0.05,
  }),

  // Floorboards (medium warm tone)
  FLOORBOARD_STANDARD: new MeshStandardMaterial({
    color: '#888888', // neutral gray for strong contrast
    roughness: 0.6,
    metalness: 0.05,
  }),

  FLOORBOARD_NARROW: new MeshStandardMaterial({
    color: '#9A9A9A', // lighter gray variant
    roughness: 0.6,
    metalness: 0.05,
  }),

  RUB_STRIP: new MeshStandardMaterial({
    color: '#804A24',
    roughness: 0.85,
    metalness: 0.05,
  }),

  // Panel materials
  SIDE_PANEL: new MeshStandardMaterial({
    color: '#CFAF72', // tan
    roughness: 0.7,
    metalness: 0.1,
  }),

  TOP_PANEL: new MeshStandardMaterial({
    color: '#E9D3A3', // lighter wheat
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
    color: '#4A2F14', // dark accent
    roughness: 0.85,
    metalness: 0.08,
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
