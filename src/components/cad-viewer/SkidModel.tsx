'use client'

import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { adjustColor, getSkidColor } from './utils/materialColors'

interface SkidModelProps {
  length: number
  position: [number, number, number]
  material: string
  metadataId?: string
  onPointerOver?: (componentId: string, event: ThreeEvent<PointerEvent>) => void
  onPointerMove?: (componentId: string, event: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (componentId: string, event: ThreeEvent<PointerEvent>) => void
}

export function SkidModel({
  length,
  position,
  material,
  metadataId,
  onPointerOver,
  onPointerMove,
  onPointerOut
}: SkidModelProps) {
  const skidColor = useMemo(() => getSkidColor(material), [material])
  const edgeColor = useMemo(() => adjustColor(skidColor, -0.25), [skidColor])

  return (
    <group position={position}>
      {/* Skid runners (2 pieces) - 4x4 lumber */}
      <mesh
        position={[-1.75, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={metadataId ? event => onPointerOver?.(metadataId, event) : undefined}
        onPointerMove={metadataId ? event => onPointerMove?.(metadataId, event) : undefined}
        onPointerOut={metadataId ? event => onPointerOut?.(metadataId, event) : undefined}
      >
        <boxGeometry args={[3.5, 3.5, length]} />
        <meshLambertMaterial color={skidColor} />
        <Edges color={edgeColor} threshold={25} />
      </mesh>
      <mesh
        position={[1.75, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={metadataId ? event => onPointerOver?.(metadataId, event) : undefined}
        onPointerMove={metadataId ? event => onPointerMove?.(metadataId, event) : undefined}
        onPointerOut={metadataId ? event => onPointerOut?.(metadataId, event) : undefined}
      >
        <boxGeometry args={[3.5, 3.5, length]} />
        <meshLambertMaterial color={skidColor} />
        <Edges color={edgeColor} threshold={25} />
      </mesh>

      {/* Cross members (every 16 inches) - 2x4 lumber */}
      {Array.from({ length: Math.floor(length / 16) + 1 }, (_, index) => (
        <mesh
          key={index}
          position={[0, 1.75, (index * 16) - length / 2]}
          castShadow
          receiveShadow
          onPointerOver={metadataId ? event => onPointerOver?.(metadataId, event) : undefined}
          onPointerMove={metadataId ? event => onPointerMove?.(metadataId, event) : undefined}
          onPointerOut={metadataId ? event => onPointerOut?.(metadataId, event) : undefined}
        >
          <boxGeometry args={[7, 1.5, 3.5]} />
          <meshLambertMaterial color={skidColor} />
          <Edges color={edgeColor} threshold={25} />
        </mesh>
      ))}
    </group>
  )
}
