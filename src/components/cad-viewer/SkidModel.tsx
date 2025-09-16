'use client'

import { useMemo } from 'react'
import { Edges } from '@react-three/drei'

interface SkidModelProps {
  length: number
  position: [number, number, number]
  material: string
}

export function SkidModel({ length, position, material }: SkidModelProps) {
  const skidColor = useMemo(() => getSkidColor(material), [material])
  const edgeColor = useMemo(() => adjustColor(skidColor, -0.25), [skidColor])

  return (
    <group position={position}>
      {/* Skid runners (2 pieces) - 4x4 lumber */}
      <mesh position={[-1.75, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 3.5, length]} />
        <meshLambertMaterial color={skidColor} />
        <Edges color={edgeColor} threshold={25} />
      </mesh>

      <mesh position={[1.75, 0, 0]} castShadow receiveShadow>
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
        >
          <boxGeometry args={[7, 1.5, 3.5]} />
          <meshLambertMaterial color={skidColor} />
          <Edges color={edgeColor} threshold={25} />
        </mesh>
      ))}
    </group>
  )
}

function getSkidColor(material: string): string {
  const colors: Record<string, string> = {
    'Standard': '#bc7e45',
    '#2': '#cc9359',
    '#1': '#ddaa70',
    'Select': '#efc389'
  }

  return colors[material] || '#bc7e45'
}

function adjustColor(hex: string, factor: number): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) {
    return hex
  }

  const num = parseInt(normalized, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff

  const adjust = (value: number) => {
    if (factor >= 0) {
      return Math.min(255, Math.round(value + (255 - value) * factor))
    }

    return Math.max(0, Math.round(value + value * factor))
  }

  r = adjust(r)
  g = adjust(g)
  b = adjust(b)

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

