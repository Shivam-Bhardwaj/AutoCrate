'use client'

import { useMemo } from 'react'
import { Mesh } from 'three'

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
  type, 
  dimensions, 
  position, 
  rotation = [0, 0, 0],
  material 
}: CratePanelProps) {
  const geometry = useMemo(() => {
    return new Mesh(
      new THREE.BoxGeometry(dimensions.width, dimensions.thickness, dimensions.length),
      new THREE.MeshLambertMaterial({ 
        color: getMaterialColor(material),
        transparent: true,
        opacity: 0.8
      })
    )
  }, [dimensions, material])
  
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
    'CDX': '#8B4513', // Brown
    'BC': '#A0522D',  // Sienna
    'AC': '#D2691E',  // Chocolate
    'Standard': '#8B4513',
    '#2': '#A0522D',
    '#1': '#D2691E',
    'Select': '#F4A460'
  }
  
  return colors[material] || '#8B4513'
}
