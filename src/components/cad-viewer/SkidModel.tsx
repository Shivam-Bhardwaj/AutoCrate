'use client'

import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { adjustColor, getSkidColor } from './utils/materialColors'

interface SkidModelProps {
  length: number
  runnerWidth: number
  runnerHeight: number
  floorboardThickness: number
  position: [number, number, number]
  material: string
  metadataId?: string
  onPointerOver?: (componentId: string, event: ThreeEvent<PointerEvent>) => void
  onPointerMove?: (componentId: string, event: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (componentId: string, event: ThreeEvent<PointerEvent>) => void
}

export function SkidModel({
  length,
  runnerWidth,
  runnerHeight,
  floorboardThickness,
  position,
  material,
  metadataId,
  onPointerOver,
  onPointerMove,
  onPointerOut
}: SkidModelProps) {
  const skidColor = useMemo(() => getSkidColor(material), [material])
  const edgeColor = useMemo(() => adjustColor(skidColor, -0.25), [skidColor])
  const runnerOffsetX = runnerWidth / 2
  const crossMemberCount = useMemo(() => Math.max(2, Math.ceil(length / 16) + 1), [length])
  const crossMemberDepth = runnerWidth
  const crossMemberWidth = runnerWidth * 2
  const crossMemberStart = useMemo(() => -length / 2 + crossMemberDepth / 2, [length, crossMemberDepth])
  const crossMemberStep = useMemo(() => {
    if (crossMemberCount <= 1) {
      return 0
    }

    return (length - crossMemberDepth) / (crossMemberCount - 1)
  }, [crossMemberCount, length, crossMemberDepth])

  return (
    <group position={position}>
      {/* Skid runners (2 pieces) - 4x4 lumber */}
      <mesh
        position={[-runnerOffsetX, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={metadataId ? event => onPointerOver?.(metadataId, event) : undefined}
        onPointerMove={metadataId ? event => onPointerMove?.(metadataId, event) : undefined}
        onPointerOut={metadataId ? event => onPointerOut?.(metadataId, event) : undefined}
      >
        <boxGeometry args={[runnerWidth, runnerHeight, length]} />
        <meshLambertMaterial color={skidColor} />
        <Edges color={edgeColor} threshold={25} />
      </mesh>
      <mesh
        position={[runnerOffsetX, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={metadataId ? event => onPointerOver?.(metadataId, event) : undefined}
        onPointerMove={metadataId ? event => onPointerMove?.(metadataId, event) : undefined}
        onPointerOut={metadataId ? event => onPointerOut?.(metadataId, event) : undefined}
      >
        <boxGeometry args={[runnerWidth, runnerHeight, length]} />
        <meshLambertMaterial color={skidColor} />
        <Edges color={edgeColor} threshold={25} />
      </mesh>

      {/* Cross members (every 16 inches) - 2x4 lumber */}
      {Array.from({ length: crossMemberCount }, (_, index) => (
        <mesh
          key={index}
          position={[
            0,
            runnerHeight / 2 + floorboardThickness / 2,
            crossMemberStart + index * crossMemberStep
          ]}
          castShadow
          receiveShadow
          onPointerOver={metadataId ? event => onPointerOver?.(metadataId, event) : undefined}
          onPointerMove={metadataId ? event => onPointerMove?.(metadataId, event) : undefined}
          onPointerOut={metadataId ? event => onPointerOut?.(metadataId, event) : undefined}
        >
          <boxGeometry args={[crossMemberWidth, floorboardThickness, crossMemberDepth]} />
          <meshLambertMaterial color={skidColor} />
          <Edges color={edgeColor} threshold={25} />
        </mesh>
      ))}
    </group>
  )
}
