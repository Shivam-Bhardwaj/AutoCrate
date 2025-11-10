'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import stepCatalog from '@/lib/step-file-catalog.json'
import { nxToThreeJS } from '@/lib/coordinate-transform'
import { VISUAL_MATERIALS } from '@/lib/visual-geometries'

export interface StepBoundingBoxProps {
  stepFileName: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  visible?: boolean
}

/**
 * Component to render a dark bounding box from parsed STEP file dimensions
 * This replaces the actual 3D models with simple boxes for visualization
 */
export function StepBoundingBox({
  stepFileName,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.1,
  visible = true
}: StepBoundingBoxProps) {
  const catalogEntry = useMemo(() => {
    const catalog = stepCatalog as Record<string, any>
    return catalog[stepFileName]
  }, [stepFileName])

  if (!catalogEntry || !visible) {
    return null
  }

  const { dimensions, boundingBox, color, type } = catalogEntry

  // Use visual materials for stencils to ensure visibility
  const isStencil = type === 'stencil'
  const getMaterial = () => {
    if (isStencil) {
      if (stepFileName.includes('FRAGILE')) {
        return VISUAL_MATERIALS.stencilFragile.clone()
      }
      return VISUAL_MATERIALS.stencilHandling.clone()
    }
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.7,
      opacity: 0.9,
      transparent: true
    })
  }

  const material = useMemo(() => getMaterial(), [isStencil, stepFileName, color])

  // Calculate size from bounding box dimensions
  const size = {
    x: boundingBox.dimensions.width,
    y: boundingBox.dimensions.height,
    z: boundingBox.dimensions.depth,
  }

  // Convert NX coordinates to Three.js coordinates using utility
  const position3D = nxToThreeJS({ x: position[0], y: position[1], z: position[2] })

  return (
    <mesh
      position={position3D}
      rotation={rotation}
    >
      <boxGeometry args={[
        size.x * scale,
        size.z * scale,
        size.y * scale
      ]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/**
 * Hook to get STEP file dimensions from catalog
 */
export function useStepDimensions(stepFileName: string) {
  return useMemo(() => {
    const catalog = stepCatalog as Record<string, any>
    const entry = catalog[stepFileName]

    if (!entry) return null

    return {
      dimensions: entry.dimensions,
      boundingBox: entry.boundingBox,
      type: entry.type,
      color: entry.color,
      name: entry.name
    }
  }, [stepFileName])
}

/**
 * Component specifically for rendering klimp bounding boxes
 */
export function KlimpBoundingBox({
  position,
  rotation,
  scale = 0.1,
  visible = true
}: Omit<StepBoundingBoxProps, 'stepFileName'>) {
  return (
    <StepBoundingBox
      stepFileName="KLIMP_#4.stp"
      position={position}
      rotation={rotation}
      scale={scale}
      visible={visible}
    />
  )
}

/**
 * Component for rendering stencil bounding boxes
 */
export function StencilBoundingBox({
  stencilType,
  position,
  rotation,
  scale = 0.1,
  visible = true
}: Omit<StepBoundingBoxProps, 'stepFileName'> & {
  stencilType: 'fragile' | 'horizontal-handling' | 'vertical-handling' | 'cg' | 'do-not-stack' | 'applied-impact'
}) {
  const fileNameMap: Record<typeof stencilType, string> = {
    'fragile': 'STENCIL - FRAGILE.stp',
    'horizontal-handling': 'STENCIL - HORIZONTAL HANDLING.stp',
    'vertical-handling': 'STENCIL - VERTICAL HANDLING.stp',
    'cg': 'STENCIL - CG.stp',
    'do-not-stack': 'STENCIL - DO NOT STACK.stp',
    'applied-impact': 'STENCIL - APPLIED IMPACT-A.stp'
  }

  return (
    <StepBoundingBox
      stepFileName={fileNameMap[stencilType]}
      position={position}
      rotation={rotation}
      scale={scale}
      visible={visible}
    />
  )
}
