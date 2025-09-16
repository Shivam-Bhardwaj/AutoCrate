'use client'

import { useMemo } from 'react'

interface SkidModelProps {
  length: number
  width: number
  height: number
  position: [number, number, number]
  material: string
}

export function SkidModel({ length, width, height, position, material }: SkidModelProps) {
  const skidColor = useMemo(() => getSkidColor(material), [material])

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[width, height, length]} />
      <meshLambertMaterial color={skidColor} />
    </mesh>
  )
}

function getSkidColor(material: string): string {
  const colors: Record<string, string> = {
    'Standard': '#8B4513', // Brown
    '#2': '#A0522D',       // Sienna
    '#1': '#D2691E',       // Chocolate
    'Select': '#F4A460'    // Sandy Brown
  }
  
  return colors[material] || '#8B4513'
}
