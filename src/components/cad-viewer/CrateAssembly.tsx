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
  const explosionOffset = useMemo(() => showExploded ? 2 : 0, [showExploded])
  
  return (
    <group>
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
      
      {/* Side Panels */}
      <CratePanel
        type="side"
        dimensions={{
          width: dimensions.overallHeight,
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
          width: dimensions.overallHeight,
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
          width: dimensions.overallHeight,
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
          width: dimensions.overallHeight,
          length: dimensions.overallWidth,
          thickness: config.materials.plywood.thickness
        }}
        position={[0, dimensions.overallHeight / 2, (dimensions.overallLength / 2) + explosionOffset]}
        rotation={[0, -Math.PI / 2, 0]}
        material={config.materials.plywood.grade}
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
      
      {/* Skids */}
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
    </group>
  )
}
