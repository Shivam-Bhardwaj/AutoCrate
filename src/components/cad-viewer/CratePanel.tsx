'use client'

import { useMemo } from 'react'
import { Edges } from '@react-three/drei'

interface CratePanelProps {
  type: 'bottom' | 'top' | 'side' | 'end'
  dimensions: {
    width: number
    length: number
    thickness: number
  }
  position: [number, number, number]
  rotation?: [number, number, number]
  material: string
}

export function CratePanel({ 
  dimensions, 
  position, 
  rotation = [0, 0, 0],
  material 
}: CratePanelProps) {
  const materialColor = useMemo(() => getMaterialColor(material), [material])
  
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[dimensions.width, dimensions.thickness, dimensions.length]} />
      <meshLambertMaterial
        color={materialColor}
        transparent
        opacity={0.92}
      />
      <Edges color="#c6a46a" threshold={20} />
    </mesh>
  )
}

function getMaterialColor(material: string): string {
  const colors: Record<string, string> = {
    'CDX': '#e6cc9f', // Warm tan plywood
    'BC': '#eed7b0',  // Soft birch plywood
    'AC': '#f6e7c9',  // Premium light plywood
    'Standard': '#c8894c', // Updated lumber palette for clarity
    '#2': '#d79b63',
    '#1': '#e8ae78',
    'Select': '#f4c999'
  }

  return colors[material] || '#e0c79c'
}
