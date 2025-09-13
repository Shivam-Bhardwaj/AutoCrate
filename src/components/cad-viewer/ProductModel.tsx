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
  const explosionOffset = useMemo(() => showExploded ? 1 : 0, [showExploded])
  
  // Calculate color based on weight (darker for heavier products)
  const color = useMemo(() => {
    const intensity = Math.min(0.8, product.weight / 2000) // Normalize to 0-0.8
    return `hsl(200, 70%, ${50 + intensity * 30}%)` // Blue gradient
  }, [product.weight])
  
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
          opacity={0.7}
        />
      </mesh>
      
      {/* Center of gravity indicator */}
      <mesh 
        position={[
          product.centerOfGravity.x - product.width / 2,
          product.centerOfGravity.y + explosionOffset,
          product.centerOfGravity.z - product.length / 2
        ]}
      >
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshLambertMaterial color="#FF0000" />
      </mesh>
      
      {/* Weight label */}
      <mesh position={[0, product.height / 2 + 0.5 + explosionOffset, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}
