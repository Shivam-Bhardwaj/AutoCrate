'use client'

import { useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { StepBoundingBox, useStepDimensions } from './StepBoundingBox'
import { NXBox } from '@/lib/nx-generator'

interface HardwareProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  useBoundingBox?: boolean
}

/**
 * Lag Screw 3/8" x 3.00" Model
 */
export function LagScrewModel({ position, rotation = [0, 0, 0], scale = 0.1, useBoundingBox = false }: HardwareProps) {
  const [useFallback, setUseFallback] = useState(useBoundingBox)

  if (useFallback) {
    return (
      <StepBoundingBox
        stepFileName="P3959_LAG SCREW_0.38 X 3.00_INCH.stp"
        position={position}
        rotation={rotation}
        scale={scale}
      />
    )
  }

  try {
    const { scene } = useGLTF('/models/lag-screw-0-38-x-3-00.glb')

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

/**
 * Flat Washer 3/8" Model
 */
export function FlatWasherModel({ position, rotation = [0, 0, 0], scale = 0.1, useBoundingBox = false }: HardwareProps) {
  const [useFallback, setUseFallback] = useState(useBoundingBox)

  if (useFallback) {
    // Washer doesn't have geometry data, render a simple disk
    return (
      <mesh
        position={[position[0] * scale, position[2] * scale, -position[1] * scale]}
        rotation={rotation}
      >
        <cylinderGeometry args={[0.281 * scale, 0.281 * scale, 0.05 * scale, 16]} />
        <meshStandardMaterial color="#404040" metalness={0.8} roughness={0.2} />
      </mesh>
    )
  }

  try {
    const { scene } = useGLTF('/models/flat-washer-0-38-inch.glb')

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

/**
 * Generic hardware model component
 */
export function HardwareModel({
  type,
  position,
  rotation = [0, 0, 0],
  scale = 0.1
}: HardwareProps & { type: 'lag-screw' | 'washer' }) {
  switch (type) {
    case 'lag-screw':
      return <LagScrewModel position={position} rotation={rotation} scale={scale} useBoundingBox={true} />
    case 'washer':
      return <FlatWasherModel position={position} rotation={rotation} scale={scale} useBoundingBox={true} />
    default:
      return null
  }
}

// Preload hardware models (will fail gracefully if not found)
try {
  useGLTF.preload('/models/lag-screw-0-38-x-3-00.glb')
  useGLTF.preload('/models/flat-washer-0-38-inch.glb')
} catch (e) {
  // Models not available yet
}
