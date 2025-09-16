'use client'

import { useMemo } from 'react'
import { Edges } from '@react-three/drei'
import { adjustColor, getPanelColor, type CratePanelType } from './utils/materialColors'

interface CratePanelProps {
  type: CratePanelType
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
  const materialColor = useMemo(() => getPanelColor(material, type), [material, type])
  const edgeColor = useMemo(() => adjustColor(materialColor, -0.35), [materialColor])
  
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[dimensions.width, dimensions.thickness, dimensions.length]} />
      <meshLambertMaterial
        color={materialColor}
        transparent
        opacity={0.92}
      />
      <Edges color={edgeColor} threshold={20} />
    </mesh>
  )
}

