'use client'

import { useMemo } from 'react'

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
        opacity={0.8}
      />
    </mesh>
  )
}

function getMaterialColor(material: string): string {
  const colors: Record<string, string> = {
    'CDX': '#D2B48C', // Tan - realistic plywood color
    'BC': '#DEB887',  // Burlywood - better plywood
    'AC': '#F5DEB3',  // Wheat - high grade plywood
    'Standard': '#8B4513', // Brown lumber
    '#2': '#A0522D',  // Sienna lumber
    '#1': '#D2691E',  // Chocolate lumber
    'Select': '#F4A460' // Sandy brown lumber
  }
  
  return colors[material] || '#D2B48C'
}
