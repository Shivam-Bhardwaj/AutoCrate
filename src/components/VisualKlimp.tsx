'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'
import { NXBox } from '@/lib/nx-generator'
import { nxToThreeJS, nxCenter } from '@/lib/coordinate-transform'
import { createSimpleKlimpGeometry, VISUAL_MATERIALS } from '@/lib/visual-geometries'
import { OrientationDetector } from '@/lib/orientation-detector'

interface VisualKlimpProps {
  box: NXBox
  scale?: number
  isHoveredPart?: boolean
  hasHoveredPart?: boolean
}

/**
 * Simplified klimp renderer using two boxes forming an L-shape
 * This is guaranteed to render and maintains visual accuracy with STEP file dimensions
 */
export function VisualKlimp({ box, scale = 0.1, isHoveredPart = false, hasHoveredPart = false }: VisualKlimpProps) {
  // Calculate position from box using utility function
  const center = nxCenter(box.point1, box.point2)
  const position = nxToThreeJS(center)

  // Determine rotation based on edge type from metadata
  const getRotation = (): [number, number, number] => {
    const edge = box.metadata?.includes('left edge') ? 'left' :
                 box.metadata?.includes('right edge') ? 'right' : 'top'
    
    const orientation = OrientationDetector.getKlimpOrientation({
      edge,
      surfaceNormal: { x: 0, y: 0, z: 1 }
    })

    return [orientation.rotation.x, orientation.rotation.y, orientation.rotation.z]
  }

  const rotation = getRotation()

  // Create geometries once
  const geometries = useMemo(() => createSimpleKlimpGeometry(), [])

  // Create hovered material
  const hoveredMaterial = useMemo(() => {
    const material = VISUAL_MATERIALS.klimp.clone()
    if (material instanceof THREE.MeshStandardMaterial) {
      material.color.setHex(0x60a5fa) // Bright blue
      material.emissive.setHex(0x3b82f6) // Blue glow
      material.emissiveIntensity = 0.4
    }
    return material
  }, [isHoveredPart])

  const material = isHoveredPart ? hoveredMaterial : VISUAL_MATERIALS.klimp
  const opacity = hasHoveredPart && !isHoveredPart ? 0.2 : 1

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
        >
          {/* Add edge highlighting for better visibility */}
          {opacity > 0 && (
            <Edges
              geometry={geometry}
              color="#000000"
              lineWidth={1}
            />
          )}
        </mesh>
      ))}
    </group>
  )
}
