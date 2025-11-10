'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { NXBox } from '@/lib/nx-generator'
import { nxToThreeJS, nxCenter } from '@/lib/coordinate-transform'
import { createSimpleKlimpGeometry, VISUAL_MATERIALS } from '@/lib/visual-geometries'
import { OrientationDetector } from '@/lib/orientation-detector'

interface VisualKlimpProps {
  box: NXBox
  scale?: number
}

/**
 * Simplified klimp renderer using two boxes forming an L-shape
 * This is guaranteed to render and maintains visual accuracy with STEP file dimensions
 */
export function VisualKlimp({ box, scale = 0.1 }: VisualKlimpProps) {
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

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry}
          material={VISUAL_MATERIALS.klimp}
          castShadow
          receiveShadow
        >
          {/* Add edge highlighting for better visibility */}
          <lineSegments>
            <edgesGeometry args={[geometry]} />
            <lineBasicMaterial color="#000000" linewidth={1} />
          </lineSegments>
        </mesh>
      ))}
    </group>
  )
}

