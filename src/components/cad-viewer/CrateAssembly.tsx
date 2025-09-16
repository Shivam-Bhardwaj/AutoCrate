'use client'

import { useMemo, memo } from 'react'
import * as THREE from 'three'
import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import { CratePanel } from './CratePanel'
import { ProductModel } from './ProductModel'
import { SkidModel } from './SkidModel'
import { calculateSkidRequirements } from '@/lib/domain/calculations'

interface CrateAssemblyProps {
  config: CrateConfiguration
  dimensions: CrateDimensions
  showExploded?: boolean
}

export const CrateAssembly = memo(function CrateAssembly({ config, dimensions, showExploded = false }: CrateAssemblyProps) {
  const explosionOffset = useMemo(() => showExploded ? 3 : 0, [showExploded])
  const skidRequirements = useMemo(() => calculateSkidRequirements(config), [config])
  const skidVerticalOffset = useMemo(() => {
    const combinedThickness = config.materials.plywood.thickness + skidRequirements.height
    return -(combinedThickness / 2) - (explosionOffset * 0.5)
  }, [config.materials.plywood.thickness, skidRequirements.height, explosionOffset])

  return (
    <group>
      {/* Skids (bottom support) */}
      {Array.from({ length: skidRequirements.count }, (_, index) => (
        <SkidModel
          key={index}
          length={skidRequirements.length}
          width={skidRequirements.width}
          height={skidRequirements.height}
          position={[
            skidRequirements.count === 1
              ? 0
              : (index - (skidRequirements.count - 1) / 2) * skidRequirements.pitch,
            skidVerticalOffset,
            0
          ]}
          material={config.materials.lumber.grade}
        />
      ))}
      
      {/* Bottom Panel */}
      <CratePanel
        type="bottom"
        dimensions={{
          width: dimensions.overallWidth,
          length: dimensions.overallLength,
          thickness: config.materials.plywood.thickness
        }}
        position={[0, -explosionOffset, 0]}
        material={config.materials.plywood.grade}
      />
      
      {/* Bottom Frame (2x4 lumber around bottom panel) */}
      <CrateFrame
        dimensions={dimensions}
        position={[0, config.materials.plywood.thickness / 2, 0]}
        material={config.materials.lumber.grade}
      />
      
      {/* Corner Posts (4 vertical 2x4s) */}
      <CornerPosts
        dimensions={dimensions}
        height={dimensions.overallHeight}
        material={config.materials.lumber.grade}
      />
      
      {/* Side Panels */}
      <CratePanel
        type="side"
        dimensions={{
          width: dimensions.overallHeight - config.materials.plywood.thickness,
          length: dimensions.overallLength,
          thickness: config.materials.plywood.thickness
        }}
        position={[-(dimensions.overallWidth / 2) - explosionOffset, dimensions.overallHeight / 2, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={config.materials.plywood.grade}
      />
      
      <CratePanel
        type="side"
        dimensions={{
          width: dimensions.overallHeight - config.materials.plywood.thickness,
          length: dimensions.overallLength,
          thickness: config.materials.plywood.thickness
        }}
        position={[(dimensions.overallWidth / 2) + explosionOffset, dimensions.overallHeight / 2, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        material={config.materials.plywood.grade}
      />
      
      {/* End Panels */}
      <CratePanel
        type="end"
        dimensions={{
          width: dimensions.overallHeight - config.materials.plywood.thickness,
          length: dimensions.overallWidth,
          thickness: config.materials.plywood.thickness
        }}
        position={[0, dimensions.overallHeight / 2, -(dimensions.overallLength / 2) - explosionOffset]}
        rotation={[0, Math.PI / 2, 0]}
        material={config.materials.plywood.grade}
      />
      
      <CratePanel
        type="end"
        dimensions={{
          width: dimensions.overallHeight - config.materials.plywood.thickness,
          length: dimensions.overallWidth,
          thickness: config.materials.plywood.thickness
        }}
        position={[0, dimensions.overallHeight / 2, (dimensions.overallLength / 2) + explosionOffset]}
        rotation={[0, -Math.PI / 2, 0]}
        material={config.materials.plywood.grade}
      />
      
      {/* Top Frame (2x4 lumber around top) */}
      <CrateFrame
        dimensions={dimensions}
        position={[0, dimensions.overallHeight - config.materials.plywood.thickness / 2 + explosionOffset, 0]}
        material={config.materials.lumber.grade}
      />
      
      {/* Top Panel */}
      <CratePanel
        type="top"
        dimensions={{
          width: dimensions.overallWidth,
          length: dimensions.overallLength,
          thickness: config.materials.plywood.thickness
        }}
        position={[0, dimensions.overallHeight + explosionOffset, 0]}
        material={config.materials.plywood.grade}
      />
      
      {/* Product Model */}
      <ProductModel
        product={config.product}
        position={[0, config.product.height / 2, 0]}
        showExploded={showExploded}
      />
    </group>
  )
})

// Crate Frame Component (2x4 lumber framing) - Optimized with instanced rendering
const CrateFrame = memo(function CrateFrame({ 
  dimensions, 
  position, 
  material
}: { 
  dimensions: CrateDimensions
  position: [number, number, number]
  material: string
}) {
  const frameColor = getLumberColor(material)
  const frameThickness = 1.5 // 2x4 actual thickness
  const frameHeight = 3.5 // 2x4 actual height
  
  // Memoize geometry and material for better performance
  const geometry = useMemo(() => new THREE.BoxGeometry(), [])
  const material_mesh = useMemo(() => new THREE.MeshLambertMaterial({ color: frameColor }), [frameColor])
  
  return (
    <group position={position}>
      {/* Front and back rails */}
      <mesh position={[0, 0, dimensions.overallLength / 2]} castShadow receiveShadow>
        <boxGeometry args={[dimensions.overallWidth, frameHeight, frameThickness]} />
        <meshLambertMaterial color={frameColor} />
      </mesh>
      <mesh position={[0, 0, -dimensions.overallLength / 2]} castShadow receiveShadow>
        <boxGeometry args={[dimensions.overallWidth, frameHeight, frameThickness]} />
        <meshLambertMaterial color={frameColor} />
      </mesh>
      
      {/* Left and right rails */}
      <mesh position={[dimensions.overallWidth / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameThickness, frameHeight, dimensions.overallLength]} />
        <meshLambertMaterial color={frameColor} />
      </mesh>
      <mesh position={[-dimensions.overallWidth / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[frameThickness, frameHeight, dimensions.overallLength]} />
        <meshLambertMaterial color={frameColor} />
      </mesh>
    </group>
  )
})

// Corner Posts Component (4 vertical 2x4s) - Optimized with instanced rendering
const CornerPosts = memo(function CornerPosts({ 
  dimensions, 
  height, 
  material
}: { 
  dimensions: CrateDimensions
  height: number
  material: string
}) {
  const frameColor = getLumberColor(material)
  const frameThickness = 1.5 // 2x4 actual thickness
  
  // Memoize corner positions
  const cornerPositions = useMemo((): [number, number, number][] => [
    [-dimensions.overallWidth / 2, height / 2, -dimensions.overallLength / 2],
    [dimensions.overallWidth / 2, height / 2, -dimensions.overallLength / 2],
    [-dimensions.overallWidth / 2, height / 2, dimensions.overallLength / 2],
    [dimensions.overallWidth / 2, height / 2, dimensions.overallLength / 2]
  ], [dimensions, height])
  
  // Memoize geometry and material
  const geometry = useMemo(() => new THREE.BoxGeometry(frameThickness, height, frameThickness), [frameThickness, height])
  const material_mesh = useMemo(() => new THREE.MeshLambertMaterial({ color: frameColor }), [frameColor])
  
  return (
    <group>
      {cornerPositions.map((position, index) => (
        <mesh key={index} position={position} castShadow receiveShadow geometry={geometry} material={material_mesh} />
      ))}
    </group>
  )
})

function getLumberColor(material: string): string {
  const colors: Record<string, string> = {
    'Standard': '#8B4513', // Brown
    '#2': '#A0522D',       // Sienna
    '#1': '#D2691E',       // Chocolate
    'Select': '#F4A460'    // Sandy Brown
  }
  
  return colors[material] || '#8B4513'
}