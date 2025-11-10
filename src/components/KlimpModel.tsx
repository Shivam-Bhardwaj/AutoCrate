'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { Group, Material, Mesh, MeshStandardMaterial } from 'three'
import { NXBox } from '@/lib/nx-generator'
import { KlimpBoundingBox, useStepDimensions } from './StepBoundingBox'
import { OrientationDetector } from '@/lib/orientation-detector'
import { StepFileViewer } from './StepFileViewer'
import { Klimp3D } from './HardwareModel3D'
import { VisualKlimp } from './VisualKlimp'
import { nxToThreeJS, nxCenter } from '@/lib/coordinate-transform'

interface KlimpModelProps {
  box: NXBox
  scale?: number
  onError?: () => void
  useBoundingBox?: boolean  // Control whether to use bounding box, GLB, or STEP
  useStepFile?: boolean  // New prop to use actual STEP file geometry
  use3DModel?: boolean  // Use hardcoded 3D model
  useVisualModel?: boolean  // Use simplified visual model (default: true)
}

// Component to load and display actual Klimp 3D model or bounding box
// Defaults to VisualKlimp (simplified, guaranteed to render) for reliable visual representation
export function KlimpModel({ 
  box, 
  scale = 0.1, 
  onError, 
  useBoundingBox = false, 
  useStepFile = false, 
  use3DModel = false,
  useVisualModel = true  // Default to visual model for reliability
}: KlimpModelProps) {
  const groupRef = useRef<Group>(null)
  const [useBox, setUseBox] = useState(useBoundingBox && !useStepFile)

  // Calculate center from box data using utility function
  const center = nxCenter(box.point1, box.point2)

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

  // Default: Use VisualKlimp (simplified, guaranteed to render)
  if (useVisualModel && !use3DModel && !useStepFile && !useBox) {
    return <VisualKlimp box={box} scale={scale} />
  }

  // Use hardcoded 3D model if explicitly requested
  if (use3DModel) {
    return <Klimp3D box={box} scale={scale} />
  }

  // Use actual STEP file geometry if requested
  if (useStepFile && !useBoundingBox) {
    const rotation = getRotation()
    const position = nxToThreeJS(center)

    return (
      <StepFileViewer
        stepFileUrl="/step-files/klimp-4.stp"
        position={position}
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
      if (!group || typeof (group as unknown as { add?: unknown }).add !== 'function') {
        return
      }

      if (scene) {
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

        ;(group as Group).add(clonedScene)

        return () => {
          if (typeof (group as unknown as { remove?: unknown }).remove === 'function') {
            ;(group as Group).remove(clonedScene)
          }
        }
      }
    }, [scene])

    const rotation = getRotation()
    const position = nxToThreeJS(center)

    return (
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={[scale, scale, scale]}
      />
    )
  } catch (error) {
    // If GLB model doesn't exist or fails to load, fall back to VisualKlimp
    console.warn('GLB model failed to load, falling back to VisualKlimp')
    return <VisualKlimp box={box} scale={scale} />
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

  const center = nxCenter(box.point1, box.point2)

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
  const position = nxToThreeJS(center)

  return (
    <mesh position={position}>
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
