'use client'

import { useMemo, memo } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'
import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import { CratePanel } from './CratePanel'
import { ProductModel } from './ProductModel'
import { SkidModel } from './SkidModel'

interface CrateAssemblyProps {
  config: CrateConfiguration
  dimensions: CrateDimensions
  showExploded?: boolean
}

export const CrateAssembly = memo(function CrateAssembly({ config, dimensions, showExploded = false }: CrateAssemblyProps) {
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
  const edgeColor = adjustColor(frameColor, -0.25)

  const rails = useMemo(() => ([
    {
      key: 'front-rail',
      position: [0, 0, dimensions.overallLength / 2] as [number, number, number],
      size: [dimensions.overallWidth, frameHeight, frameThickness] as [number, number, number]
    },
    {
      key: 'back-rail',
      position: [0, 0, -dimensions.overallLength / 2] as [number, number, number],
      size: [dimensions.overallWidth, frameHeight, frameThickness] as [number, number, number]
    },
    {
      key: 'right-rail',
      position: [dimensions.overallWidth / 2, 0, 0] as [number, number, number],
      size: [frameThickness, frameHeight, dimensions.overallLength] as [number, number, number]
    },
    {
      key: 'left-rail',
      position: [-dimensions.overallWidth / 2, 0, 0] as [number, number, number],
      size: [frameThickness, frameHeight, dimensions.overallLength] as [number, number, number]
    }
  ]), [dimensions, frameHeight, frameThickness])

  return (
    <group position={position}>
      {rails.map(({ key, position: railPosition, size }) => (
        <mesh key={key} position={railPosition} castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshLambertMaterial color={frameColor} />
          <Edges color={edgeColor} threshold={25} />
        </mesh>
      ))}
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
  const edgeColor = adjustColor(frameColor, -0.25)

  return (
    <group>
      {cornerPositions.map((position, index) => (
        <mesh key={index} position={position} castShadow receiveShadow geometry={geometry} material={material_mesh}>
          <Edges color={edgeColor} threshold={25} />
        </mesh>
      ))}
    </group>
  )
})

function getLumberColor(material: string): string {
  const colors: Record<string, string> = {
    'Standard': '#c8894c',
    '#2': '#d79b63',
    '#1': '#e8ae78',
    'Select': '#f4c999'
  }

  return colors[material] || '#c8894c'
}

function adjustColor(hex: string, factor: number): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) {
    return hex
  }

  const num = parseInt(normalized, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff

  const adjust = (value: number) => {
    if (factor >= 0) {
      return Math.min(255, Math.round(value + (255 - value) * factor))
    }

    return Math.max(0, Math.round(value + value * factor))
  }

  r = adjust(r)
  g = adjust(g)
  b = adjust(b)

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
