'use client'

import { useMemo, memo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'
import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import { calculateSkidRequirements } from '@/lib/domain/calculations'
import { CratePanel } from './CratePanel'
import { ProductModel } from './ProductModel'
import { SkidModel } from './SkidModel'
import { adjustColor, getLumberColor } from './utils/materialColors'

type ComponentPointerHandler = (componentId: string, event: ThreeEvent<PointerEvent>) => void

interface CrateAssemblyProps {
  config: CrateConfiguration
  dimensions: CrateDimensions
  showExploded?: boolean
  onComponentPointerOver?: ComponentPointerHandler
  onComponentPointerMove?: ComponentPointerHandler
  onComponentPointerOut?: ComponentPointerHandler
}

export const CrateAssembly = memo(function CrateAssembly({
  config,
  dimensions,
  showExploded = false,
  onComponentPointerOver,
  onComponentPointerMove,
  onComponentPointerOut
}: CrateAssemblyProps) {
  const explosionOffset = useMemo(() => (showExploded ? 3 : 0), [showExploded])
  const skidRequirements = useMemo(() => calculateSkidRequirements(config), [config])
  const floorboardThickness = config.materials.lumber.thickness
  const bottomPanelThickness = config.materials.plywood.thickness
  const frameHeight = 3.5
  const skidVerticalOffset = useMemo(
    () =>
      -bottomPanelThickness / 2 - floorboardThickness - skidRequirements.height / 2 -
      explosionOffset * 0.5,
    [bottomPanelThickness, floorboardThickness, skidRequirements.height, explosionOffset]
  )
  const bottomPanelPositionY = useMemo(
    () => -bottomPanelThickness / 2 - explosionOffset,
    [bottomPanelThickness, explosionOffset]
  )
  const bottomFramePositionY = useMemo(() => frameHeight / 2, [frameHeight])
  const topFramePositionY = useMemo(
    () => dimensions.overallHeight - bottomPanelThickness / 2 + explosionOffset,
    [dimensions.overallHeight, bottomPanelThickness, explosionOffset]
  )
  const topPanelPositionY = useMemo(
    () => dimensions.overallHeight + explosionOffset,
    [dimensions.overallHeight, explosionOffset]
  )

  return (
    <group>
      {/* Skids (bottom support) */}
      {skidRequirements.positions.map((positionZ, index) => (
        <SkidModel
          key={index}
          length={skidRequirements.length}
          runnerWidth={skidRequirements.width}
          runnerHeight={skidRequirements.height}
          floorboardThickness={floorboardThickness}
          position={[0, skidVerticalOffset, positionZ]}
          material={config.materials.lumber.grade}
          metadataId="skids"
          onPointerOver={onComponentPointerOver}
          onPointerMove={onComponentPointerMove}
          onPointerOut={onComponentPointerOut}
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
        position={[0, bottomPanelPositionY, 0]}
        material={config.materials.plywood.grade}
        metadataId="bottom-panel"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
      />

      {/* Bottom Frame (2x4 lumber around bottom panel) */}
      <CrateFrame
        dimensions={dimensions}
        position={[0, bottomFramePositionY, 0]}
        material={config.materials.lumber.grade}
        metadataId="bottom-frame"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
      />

      {/* Corner Posts (4 vertical 2x4s) */}
      <CornerPosts
        dimensions={dimensions}
        height={dimensions.overallHeight}
        material={config.materials.lumber.grade}
        metadataId="corner-posts"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
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
        metadataId="side-panel-1"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
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
        metadataId="side-panel-2"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
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
        metadataId="end-panel-1"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
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
        metadataId="end-panel-2"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
      />

      {/* Top Frame (2x4 lumber around top) */}
      <CrateFrame
        dimensions={dimensions}
        position={[0, topFramePositionY, 0]}
        material={config.materials.lumber.grade}
        metadataId="top-frame"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
      />

      {/* Top Panel */}
      <CratePanel
        type="top"
        dimensions={{
          width: dimensions.overallWidth,
          length: dimensions.overallLength,
          thickness: config.materials.plywood.thickness
        }}
        position={[0, topPanelPositionY, 0]}
        material={config.materials.plywood.grade}
        metadataId="top-panel"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
      />

      {/* Product Model */}
      <ProductModel
        product={config.product}
        position={[0, config.product.height / 2, 0]}
        showExploded={showExploded}
        metadataId="product"
        onPointerOver={onComponentPointerOver}
        onPointerMove={onComponentPointerMove}
        onPointerOut={onComponentPointerOut}
      />
    </group>
  )
})

// Crate Frame Component (2x4 lumber framing)
const CrateFrame = memo(function CrateFrame({
  dimensions,
  position,
  material,
  metadataId,
  onPointerOver,
  onPointerMove,
  onPointerOut
}: {
  dimensions: CrateDimensions
  position: [number, number, number]
  material: string
  metadataId?: string
  onPointerOver?: ComponentPointerHandler
  onPointerMove?: ComponentPointerHandler
  onPointerOut?: ComponentPointerHandler
}) {
  const frameColor = getLumberColor(material)
  const frameThickness = 1.5 // 2x4 actual thickness
  const frameHeight = 3.5 // 2x4 actual height
  const edgeColor = adjustColor(frameColor, -0.25)

  const rails = useMemo(
    () => [
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
    ],
    [dimensions, frameHeight, frameThickness]
  )

  return (
    <group position={position}>
      {rails.map(({ key, position: railPosition, size }) => (
        <mesh
          key={key}
          position={railPosition}
          castShadow
          receiveShadow
          onPointerOver={metadataId ? event => onPointerOver?.(metadataId, event) : undefined}
          onPointerMove={metadataId ? event => onPointerMove?.(metadataId, event) : undefined}
          onPointerOut={metadataId ? event => onPointerOut?.(metadataId, event) : undefined}
        >
          <boxGeometry args={size} />
          <meshLambertMaterial color={frameColor} />
          <Edges color={edgeColor} threshold={25} />
        </mesh>
      ))}
    </group>
  )
})

// Corner Posts Component (4 vertical 2x4s)
const CornerPosts = memo(function CornerPosts({
  dimensions,
  height,
  material,
  metadataId,
  onPointerOver,
  onPointerMove,
  onPointerOut
}: {
  dimensions: CrateDimensions
  height: number
  material: string
  metadataId?: string
  onPointerOver?: ComponentPointerHandler
  onPointerMove?: ComponentPointerHandler
  onPointerOut?: ComponentPointerHandler
}) {
  const frameColor = getLumberColor(material)
  const frameThickness = 1.5 // 2x4 actual thickness

  const cornerPositions = useMemo((): [number, number, number][] => [
    [-dimensions.overallWidth / 2, height / 2, -dimensions.overallLength / 2],
    [dimensions.overallWidth / 2, height / 2, -dimensions.overallLength / 2],
    [-dimensions.overallWidth / 2, height / 2, dimensions.overallLength / 2],
    [dimensions.overallWidth / 2, height / 2, dimensions.overallLength / 2]
  ], [dimensions, height])

  const geometry = useMemo(() => new THREE.BoxGeometry(frameThickness, height, frameThickness), [frameThickness, height])
  const materialInstance = useMemo(() => new THREE.MeshLambertMaterial({ color: frameColor }), [frameColor])
  const edgeColor = adjustColor(frameColor, -0.25)

  return (
    <group>
      {cornerPositions.map((position, index) => (
        <mesh
          key={index}
          position={position}
          castShadow
          receiveShadow
          geometry={geometry}
          material={materialInstance}
          onPointerOver={metadataId ? event => onPointerOver?.(metadataId, event) : undefined}
          onPointerMove={metadataId ? event => onPointerMove?.(metadataId, event) : undefined}
          onPointerOut={metadataId ? event => onPointerOut?.(metadataId, event) : undefined}
        >
          <Edges color={edgeColor} threshold={25} />
        </mesh>
      ))}
    </group>
  )
})
