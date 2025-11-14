'use client'

import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import {
  createKlimpGeometry,
  createLagScrewGeometry,
  createWasherGeometry,
  createStencilGeometry,
  STENCIL_GEOMETRIES,
  COMPONENT_MATERIALS
} from '@/lib/hardcoded-geometries'
import { NXBox } from '@/lib/nx-generator'
import { nxToThreeJS, nxCenter } from '@/lib/coordinate-transform'

interface Hardware3DProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  isHoveredPart?: boolean
  hasHoveredPart?: boolean
}

/**
 * Visible 3D Klimp Model - L-shaped bracket
 */
export function Klimp3D({
  box,
  scale = 0.1,
  isHoveredPart = false,
  hasHoveredPart = false
}: {
  box: NXBox
  scale?: number
  isHoveredPart?: boolean
  hasHoveredPart?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create geometry once
  const geometry = useMemo(() => createKlimpGeometry(), [])

  // Calculate position from box using utility function
  const center = nxCenter(box.point1, box.point2)
  const position = nxToThreeJS(center)

  // Determine rotation based on edge
  const getRotation = (): [number, number, number] => {
    if (box.metadata?.includes('left edge')) {
      // Left edge: rotate to connect left panel to front
      return [0, 0, Math.PI / 2]
    } else if (box.metadata?.includes('right edge')) {
      // Right edge: rotate to connect right panel to front
      return [0, 0, -Math.PI / 2]
    }
    // Top edge: default orientation
    return [0, 0, 0]
  }

  const rotation = getRotation()

  // Add subtle animation for visibility
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Subtle pulsing to make it visible
      const pulseScale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.02
      meshRef.current.scale.setScalar(scale * pulseScale)
    }
  })

  // Create hovered material
  const material = useMemo(() => {
    if (isHoveredPart) {
      const hoveredMaterial = COMPONENT_MATERIALS.klimp.clone()
      if (hoveredMaterial instanceof THREE.MeshStandardMaterial) {
        hoveredMaterial.color.setHex(0x60a5fa) // Bright blue
        hoveredMaterial.emissive.setHex(0x3b82f6) // Blue glow
        hoveredMaterial.emissiveIntensity = 0.4
      }
      return hoveredMaterial
    }
    return COMPONENT_MATERIALS.klimp
  }, [isHoveredPart])

  const opacity = hasHoveredPart && !isHoveredPart ? 0.2 : 1

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
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
  )
}

/**
 * Visible 3D Lag Screw Model
 */
export function LagScrew3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.1,
  length = 3.0,
  isHoveredPart = false,
  hasHoveredPart = false
}: Hardware3DProps & { length?: number }) {
  const geometry = useMemo(() => createLagScrewGeometry(length), [length])

  // Create hovered material
  const material = useMemo(() => {
    if (isHoveredPart) {
      const hoveredMaterial = COMPONENT_MATERIALS.lagScrew.clone()
      if (hoveredMaterial instanceof THREE.MeshStandardMaterial) {
        hoveredMaterial.color.setHex(0x60a5fa) // Bright blue
        hoveredMaterial.emissive.setHex(0x3b82f6) // Blue glow
        hoveredMaterial.emissiveIntensity = 0.4
      }
      return hoveredMaterial
    }
    return COMPONENT_MATERIALS.lagScrew
  }, [isHoveredPart])

  const opacity = hasHoveredPart && !isHoveredPart ? 0.2 : 1

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position.map(p => p * scale) as [number, number, number]}
      rotation={rotation}
      scale={scale}
      castShadow
    >
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#000000" linewidth={1} opacity={opacity} transparent={opacity < 1} />
      </lineSegments>
    </mesh>
  )
}

/**
 * Visible 3D Washer Model
 */
export function Washer3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.1,
  isHoveredPart = false,
  hasHoveredPart = false
}: Hardware3DProps) {
  const geometry = useMemo(() => createWasherGeometry(), [])

  // Create hovered material
  const material = useMemo(() => {
    if (isHoveredPart) {
      const hoveredMaterial = COMPONENT_MATERIALS.washer.clone()
      if (hoveredMaterial instanceof THREE.MeshStandardMaterial) {
        hoveredMaterial.color.setHex(0x60a5fa) // Bright blue
        hoveredMaterial.emissive.setHex(0x3b82f6) // Blue glow
        hoveredMaterial.emissiveIntensity = 0.4
      }
      return hoveredMaterial
    }
    return COMPONENT_MATERIALS.washer
  }, [isHoveredPart])

  const opacity = hasHoveredPart && !isHoveredPart ? 0.2 : 1

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position.map(p => p * scale) as [number, number, number]}
      rotation={rotation}
      scale={scale}
      castShadow
    >
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#000000" linewidth={1} opacity={opacity} transparent={opacity < 1} />
      </lineSegments>
    </mesh>
  )
}

/**
 * Visible 3D Stencil Model
 */
export function Stencil3D({
  type,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.1
}: Hardware3DProps & {
  type: 'fragile' | 'handling' | 'doNotStack' | 'centerGravity'
}) {
  const geometry = useMemo(() => {
    switch (type) {
      case 'fragile':
        return STENCIL_GEOMETRIES.fragile()
      case 'handling':
        return STENCIL_GEOMETRIES.handling()
      case 'doNotStack':
        return STENCIL_GEOMETRIES.doNotStack()
      case 'centerGravity':
        return STENCIL_GEOMETRIES.centerGravity()
    }
  }, [type])

  const material = type === 'fragile'
    ? COMPONENT_MATERIALS.stencilFragile
    : COMPONENT_MATERIALS.stencilHandling

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position.map(p => p * scale) as [number, number, number]}
      rotation={rotation}
      scale={scale}
    />
  )
}

/**
 * Hardware assembly with multiple components
 */
export function HardwareAssembly({
  position = [0, 0, 0],
  scale = 0.1,
  showLabels = true
}: Hardware3DProps & { showLabels?: boolean }) {
  return (
    <group position={position}>
      {/* Lag screw with washer */}
      <LagScrew3D
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={scale}
      />
      <Washer3D
        position={[0, 0, 0.3]}
        rotation={[0, 0, 0]}
        scale={scale}
      />

      {showLabels && (
        <mesh position={[0, 1, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="white" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}