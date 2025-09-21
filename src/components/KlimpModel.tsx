'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Group, Material, Mesh, MeshStandardMaterial } from 'three'
import { NXBox } from '@/lib/nx-generator'

interface KlimpModelProps {
  box: NXBox
  scale?: number
  onError?: () => void
}

// Component to load and display actual Klimp 3D model
export function KlimpModel({ box, scale = 0.1, onError }: KlimpModelProps) {
  const groupRef = useRef<Group>(null)

  // Calculate center and rotation from box data
  const center = {
    x: (box.point1.x + box.point2.x) / 2,
    y: (box.point1.y + box.point2.y) / 2,
    z: (box.point1.z + box.point2.z) / 2,
  }

  // Determine rotation based on edge type from metadata
  const getRotation = (): [number, number, number] => {
    if (box.metadata?.includes('left edge')) {
      return [0, 0, Math.PI / 2] // 90 degrees around Z
    } else if (box.metadata?.includes('right edge')) {
      return [0, 0, -Math.PI / 2] // -90 degrees around Z
    }
    return [0, 0, 0] // Top edge, no rotation
  }

  try {
    // Try to load the GLB model if it exists
    const { scene } = useGLTF('/models/klimp.glb', true)

    useEffect(() => {
      if (groupRef.current && scene) {
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

        groupRef.current.add(clonedScene)

        return () => {
          groupRef.current?.remove(clonedScene)
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
    // If GLB model doesn't exist or fails to load, notify parent
    onError?.()
    return null
  }
}

// Preload the model
useGLTF.preload('/models/klimp.glb')

// Fallback symbolic L-shaped representation
export function KlimpSymbolic({ box, scale = 0.1 }: { box: NXBox; scale?: number }) {
  const center = {
    x: (box.point1.x + box.point2.x) / 2,
    y: (box.point1.y + box.point2.y) / 2,
    z: (box.point1.z + box.point2.z) / 2,
  }

  const size = {
    x: Math.abs(box.point2.x - box.point1.x),
    y: Math.abs(box.point2.y - box.point1.y),
    z: Math.abs(box.point2.z - box.point1.z),
  }

  return (
    <mesh position={[center.x * scale, center.z * scale, -center.y * scale]}>
      <boxGeometry args={[size.x * scale, size.z * scale, size.y * scale]} />
      <meshStandardMaterial color={box.color} metalness={0.6} roughness={0.4} />
    </mesh>
  )
}
