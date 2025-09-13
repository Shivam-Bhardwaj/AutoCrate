'use client'

import { useMemo } from 'react'

interface SkidModelProps {
  length: number
  position: [number, number, number]
  material: string
}

export function SkidModel({ length, position, material }: SkidModelProps) {
  const skidColor = useMemo(() => getSkidColor(material), [material])
  
  return (
    <group position={position}>
      {/* Skid runners (2 pieces) - 4x4 lumber */}
      <mesh position={[-1.75, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 3.5, length]} />
        <meshLambertMaterial color={skidColor} />
      </mesh>
      
      <mesh position={[1.75, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 3.5, length]} />
        <meshLambertMaterial color={skidColor} />
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
        </mesh>
      ))}
    </group>
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
