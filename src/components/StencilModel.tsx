'use client'

import { useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { StencilBoundingBox } from './StepBoundingBox'

type StencilType = 'fragile' | 'horizontal-handling' | 'vertical-handling' | 'cg' | 'do-not-stack' | 'applied-impact'

interface StencilModelProps {
  stencilType: StencilType
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  useBoundingBox?: boolean
}

const STENCIL_GLB_MAP: Record<StencilType, string> = {
  'fragile': '/models/stencil-fragile.glb',
  'horizontal-handling': '/models/stencil-horizontal-handling.glb',
  'vertical-handling': '/models/stencil-vertical-handling.glb',
  'cg': '/models/stencil-cg.glb',
  'do-not-stack': '/models/stencil-do-not-stack.glb',
  'applied-impact': '/models/stencil-applied-impact-a.glb'
}

/**
 * Stencil Model Component
 * Loads GLB files for stencils, falls back to bounding boxes
 */
export function StencilModel({
  stencilType,
  position,
  rotation = [0, 0, 0],
  scale = 0.1,
  useBoundingBox = false
}: StencilModelProps) {
  const [useFallback, setUseFallback] = useState(useBoundingBox)
  const glbPath = STENCIL_GLB_MAP[stencilType]

  if (useFallback || !glbPath) {
    return (
      <StencilBoundingBox
        stencilType={stencilType}
        position={position}
        rotation={rotation}
        scale={scale}
      />
    )
  }

  try {
    const { scene } = useGLTF(glbPath)

    return (
      <primitive
        object={scene.clone()}
        position={[position[0] * scale, position[2] * scale, -position[1] * scale]}
        rotation={rotation}
        scale={[scale, scale, scale]}
      />
    )
  } catch (error) {
    setUseFallback(true)
    return null
  }
}

// Preload stencil models (will fail gracefully if not found)
Object.values(STENCIL_GLB_MAP).forEach(path => {
  try {
    useGLTF.preload(path)
  } catch (e) {
    // Model not available yet
  }
})
