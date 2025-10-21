'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { Group, Material, Mesh, MeshStandardMaterial } from 'three'
import { NXBox } from '@/lib/nx-generator'
import { KlimpBoundingBox, useStepDimensions } from './StepBoundingBox'
import { OrientationDetector } from '@/lib/orientation-detector'
import { StepFileViewer } from './StepFileViewer'

interface KlimpModelProps {
  box: NXBox
  scale?: number
  onError?: () => void
  useBoundingBox?: boolean  // Control whether to use bounding box, GLB, or STEP
  useStepFile?: boolean  // New prop to use actual STEP file geometry
}

// Component to load and display actual Klimp 3D model or bounding box
export function KlimpModel({ box, scale = 0.1, onError, useBoundingBox = true, useStepFile = true }: KlimpModelProps) {
  const groupRef = useRef<Group>(null)
  const [useBox, setUseBox] = useState(useBoundingBox && !useStepFile)

  // Calculate center from box data
  const center = {
    x: (box.point1.x + box.point2.x) / 2,
    y: (box.point1.y + box.point2.y) / 2,
    z: (box.point1.z + box.point2.z) / 2,
  }

  // Determine edge type from metadata
  const getEdge = (): 'top' | 'left' | 'right' => {
    if (box.metadata?.includes('left edge')) {
      return 'left'
    } else if (box.metadata?.includes('right edge')) {
      return 'right'
    }
    return 'top'
  }

  // Determine rotation based on edge type from metadata
  const getRotation = (): [number, number, number] => {
    const edge = getEdge()
    const orientation = OrientationDetector.getKlimpOrientation({
      edge,
      surfaceNormal: { x: 0, y: 0, z: 1 }
    })

    return [orientation.rotation.x, orientation.rotation.y, orientation.rotation.z]
  }

  // Use actual STEP file geometry if requested
  if (useStepFile && !useBoundingBox) {
    const rotation = getRotation()

    return (
      <StepFileViewer
        stepFileUrl="/step-files/klimp-4.stp"
        position={[center.x, center.y, center.z]}
        rotation={rotation}
        scale={scale}
        color="#8b7355"
        onError={() => {
          console.error('Failed to load STEP file, falling back to bounding box')
          setUseBox(true)
          onError?.()
        }}
      />
    )
  }

  // Use bounding box from STEP file if requested
  if (useBox) {
    const rotation = getRotation()

    return (
      <KlimpBoundingBox
        position={[center.x, center.y, center.z]}
        rotation={rotation}
        scale={scale}
      />
    )
  }

  // Otherwise try to load GLB model (original behavior)
  try {
    // Try to load the GLB model if it exists
    const { scene } = useGLTF('/models/klimp.glb', true)

    useEffect(() => {
      const group = groupRef.current
      if (group && scene) {
        // Clone the scene to avoid modifying the original
        const clonedScene = scene.clone()

        // Apply material color
        const tintMaterial = (material: Material) => {
          const clonedMaterial = material.clone()
          if (clonedMaterial instanceof MeshStandardMaterial) {
            clonedMaterial.color.setHex(0x8b7355)
          }
          return clonedMaterial
        }

        clonedScene.traverse((child) => {
          if ((child as Mesh).isMesh) {
            const mesh = child as Mesh
            if (mesh.material) {
              // Apply the bronze/metal color
              const material = mesh.material
              mesh.material = Array.isArray(material)
                ? material.map((entry) => tintMaterial(entry))
                : tintMaterial(material)
            }
          }
        })

        group.add(clonedScene)

        return () => {
          group.remove(clonedScene)
        }
      }
    }, [scene])

    const rotation = getRotation()

    return (
      <group
        ref={groupRef}
        position={[center.x * scale, center.z * scale, -center.y * scale]}
        rotation={rotation}
        scale={[scale, scale, scale]}
      />
    )
  } catch (error) {
    // If GLB model doesn't exist or fails to load, fall back to bounding box
    setUseBox(true)
    onError?.()
    return null
  }
}

// Preload the model (will fail gracefully if not found)
try {
  useGLTF.preload('/models/klimp.glb')
} catch (e) {
  // Ignore error if model doesn't exist
}

// Fallback symbolic L-shaped representation using actual STEP dimensions
export function KlimpSymbolic({ box, scale = 0.1 }: { box: NXBox; scale?: number }) {
  const stepDims = useStepDimensions('KLIMP_#4.stp')

  const center = {
    x: (box.point1.x + box.point2.x) / 2,
    y: (box.point1.y + box.point2.y) / 2,
    z: (box.point1.z + box.point2.z) / 2,
  }

  // Use actual STEP dimensions if available, otherwise fall back to box dimensions
  const size = stepDims ? {
    x: stepDims.boundingBox.dimensions.width,
    y: stepDims.boundingBox.dimensions.height,
    z: stepDims.boundingBox.dimensions.depth,
  } : {
    x: Math.abs(box.point2.x - box.point1.x),
    y: Math.abs(box.point2.y - box.point1.y),
    z: Math.abs(box.point2.z - box.point1.z),
  }

  const color = stepDims?.color || box.color

  return (
    <mesh position={[center.x * scale, center.z * scale, -center.y * scale]}>
      <boxGeometry args={[size.x * scale, size.z * scale, size.y * scale]} />
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.7}
        opacity={0.9}
        transparent
      />
    </mesh>
  )
}
