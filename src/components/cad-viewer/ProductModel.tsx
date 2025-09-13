'use client'

import { useMemo } from 'react'

interface ProductModelProps {
  product: {
    length: number
    width: number
    height: number
    weight: number
    centerOfGravity: {
      x: number
      y: number
      z: number
    }
  }
  position: [number, number, number]
  showExploded?: boolean
}

export function ProductModel({ product, position, showExploded = false }: ProductModelProps) {
  const explosionOffset = useMemo(() => showExploded ? 2 : 0, [showExploded])
  
  // More realistic product color - industrial gray
  const color = useMemo(() => {
    return '#708090' // Slate gray - typical industrial equipment color
  }, [])
  
  return (
    <group position={position}>
      {/* Main product body */}
      <mesh 
        position={[0, explosionOffset, 0]}
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[product.width, product.height, product.length]} />
        <meshLambertMaterial 
          color={color}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Center of gravity indicator (small red dot) */}
      <mesh 
        position={[
          product.centerOfGravity.x - product.width / 2,
          product.centerOfGravity.y + explosionOffset,
          product.centerOfGravity.z - product.length / 2
        ]}
      >
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshLambertMaterial color="#FF0000" />
      </mesh>
    </group>
  )
}
