'use client'

import { useMemo } from 'react'
import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import { CratePanel } from './CratePanel'
import { ProductModel } from './ProductModel'
import { SkidModel } from './SkidModel'

interface CrateAssemblyProps {
  config: CrateConfiguration
  dimensions: CrateDimensions
  showExploded?: boolean
}

export function CrateAssembly({ config, dimensions, showExploded = false }: CrateAssemblyProps) {
  const explosionOffset = useMemo(() => showExploded ? 3 : 0, [showExploded])
  
  return (
    <group>
      {/* Skids (bottom support) */}
      {Array.from({ length: config.skids.count }, (_, index) => (
        <SkidModel
          key={index}
          length={config.product.length + config.skids.overhang.front + config.skids.overhang.back}
          position={[
            0, 
            -config.materials.plywood.thickness / 2 - explosionOffset * 0.5, 
            (index - (config.skids.count - 1) / 2) * config.skids.pitch
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
        explosionOffset={explosionOffset}
      />
      
      {/* Corner Posts (4 vertical 2x4s) */}
      <CornerPosts
        dimensions={dimensions}
        height={dimensions.overallHeight}
        material={config.materials.lumber.grade}
        explosionOffset={explosionOffset}
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
        explosionOffset={explosionOffset}
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
}

// Crate Frame Component (2x4 lumber framing)
function CrateFrame({ 
  dimensions, 
  position, 
  material, 
  explosionOffset 
}: { 
  dimensions: CrateDimensions
  position: [number, number, number]
  material: string
  explosionOffset: number
}) {
  const frameColor = getLumberColor(material)
  const frameThickness = 1.5 // 2x4 actual thickness
  const frameHeight = 3.5 // 2x4 actual height
  
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
}

// Corner Posts Component (4 vertical 2x4s)
function CornerPosts({ 
  dimensions, 
  height, 
  material, 
  explosionOffset 
}: { 
  dimensions: CrateDimensions
  height: number
  material: string
  explosionOffset: number
}) {
  const frameColor = getLumberColor(material)
  const frameThickness = 1.5 // 2x4 actual thickness
  const frameHeight = 3.5 // 2x4 actual height
  
  const cornerPositions: [number, number, number][] = [
    [-dimensions.overallWidth / 2, height / 2, -dimensions.overallLength / 2],
    [dimensions.overallWidth / 2, height / 2, -dimensions.overallLength / 2],
    [-dimensions.overallWidth / 2, height / 2, dimensions.overallLength / 2],
    [dimensions.overallWidth / 2, height / 2, dimensions.overallLength / 2]
  ]
  
  return (
    <group>
      {cornerPositions.map((position, index) => (
        <mesh key={index} position={position} castShadow receiveShadow>
          <boxGeometry args={[frameThickness, height, frameThickness]} />
          <meshLambertMaterial color={frameColor} />
        </mesh>
      ))}
    </group>
  )
}

function getLumberColor(material: string): string {
  const colors: Record<string, string> = {
    'Standard': '#8B4513', // Brown
    '#2': '#A0522D',       // Sienna
    '#1': '#D2691E',       // Chocolate
    'Select': '#F4A460'    // Sandy Brown
  }
  
  return colors[material] || '#8B4513'
}