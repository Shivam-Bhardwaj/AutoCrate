'use client'

import { Canvas, ThreeEvent, useThree } from '@react-three/fiber'
import { OrbitControls, Box, Text, Html, Edges, Plane, useGLTF, Clone } from '@react-three/drei'
import { NXBox, NXGenerator } from '@/lib/nx-generator'
import { Suspense, useState, useRef, useEffect, useMemo, useCallback, Fragment, type MutableRefObject, type ReactNode } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { MarkingVisualizer } from './MarkingVisualizer'
import { UI_CONSTANTS } from '@/lib/crate-constants'
import { KlimpModel } from './KlimpModel'
import { LagScrew3D, Washer3D } from './HardwareModel3D'

type ComponentVisibility = {
  skids: boolean
  floorboards: boolean
  frontPanel: boolean
  backPanel: boolean
  leftPanel: boolean
  rightPanel: boolean
  topPanel: boolean
  cleats: boolean
}

type PmiVisibilityState = {
  totalDimensions: boolean
  skids: boolean
  cleats: boolean
  floor: boolean
  datumPlanes: boolean
}

interface CrateVisualizerProps {
  boxes: NXBox[]
  showGrid?: boolean
  showLabels?: boolean
  generator?: NXGenerator
  showMarkings?: boolean
  visibility?: ComponentVisibility
  onToggleVisibility?: (component: keyof ComponentVisibility) => void
  onToggleMarkings?: () => void
  pmiVisibility?: PmiVisibilityState
  onTogglePmi?: (layer: keyof PmiVisibilityState) => void
  partNumbers?: {
    base?: string
    crate?: string
    cap?: string
  }
  tutorialHighlightNames?: string[]
  tutorialCallouts?: { boxName: string; label: string }[]
  hoveredPartName?: string | null
}

// Represents a selected plane with its position and normal vector
interface SelectedPlane {
  boxName: string
  faceIndex: number
  normal: THREE.Vector3
  position: THREE.Vector3
  center: THREE.Vector3
  size: { x: number; y: number; z: number }
}

// Convert dimension to nearest 1/16 inch
function toNearest16th(inches: number): string {
  const sixteenths = Math.round(inches * 16)
  const wholePart = Math.floor(sixteenths / 16)
  const fraction = sixteenths % 16

  if (fraction === 0) return `${wholePart}"`

  // Simplify fraction
  let numerator = fraction
  let denominator = 16
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(numerator, denominator)
  numerator /= divisor
  denominator /= divisor

  if (wholePart === 0) return `${numerator}/${denominator}"`
  return `${wholePart} ${numerator}/${denominator}"`
}

// Component to render measurement line
function MeasurementLine({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const points = useMemo(() => [start, end], [start, end])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#000000" linewidth={3} />
    </line>
  )
}

type SceneBounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

function PMIFrame({ cells, isDatumLabel = false }: { cells: string[], isDatumLabel?: boolean }) {
  if (isDatumLabel) {
    // ASME Y14.5 datum symbol: square box with filled triangle
    return (
      <div className="flex items-center gap-0">
        {/* Triangle pointing to datum */}
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-gray-900 dark:border-r-gray-100" />
        {/* Datum letter in box */}
        <div className="border-2 border-gray-900 dark:border-gray-100 bg-white dark:bg-gray-900 px-2 py-1">
          <span className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100">
            {cells[0]}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex divide-x divide-gray-700 dark:divide-gray-400 border border-gray-700 dark:border-gray-400 bg-white/90 dark:bg-gray-900/90 text-[11px] font-mono text-gray-900 dark:text-gray-100 rounded-[2px] shadow-sm">
      {cells.map((cell, index) => (
        <span key={`${cell}-${index}`} className="px-1 py-[2px] whitespace-nowrap">
          {cell}
        </span>
      ))}
    </div>
  )
}

// Component for visualizing datum planes according to ASME Y14.5
function DatumPlanes({ bounds, scale, distanceFactor, totalDimensions }: {
  bounds: SceneBounds;
  scale: number;
  distanceFactor: number;
  totalDimensions?: { overallWidth: number; overallLength: number; overallHeight: number } | null;
}) {
  // Use generator dimensions if available, fallback to bounds
  const spanX = totalDimensions?.overallWidth ?? (bounds.maxX - bounds.minX)
  const spanY = totalDimensions?.overallLength ?? (bounds.maxY - bounds.minY)
  const spanZ = totalDimensions?.overallHeight ?? (bounds.maxZ - bounds.minZ)
  const maxDimension = Math.max(spanX, spanY, spanZ)
  const planeSize = maxDimension * UI_CONSTANTS.VISUALIZATION.DATUM_PLANE_SIZE_MULTIPLIER

  const centerX = 0  // Crate is centered at origin in X
  const centerY = spanY / 2  // Center of length dimension
  const centerZ = spanZ / 2  // Center of height dimension
  const labelOffset = maxDimension * UI_CONSTANTS.VISUALIZATION.DATUM_LABEL_OFFSET_MULTIPLIER

  return (
    <>
      {/* Datum A - Bottom plane (XY plane at Z=0) */}
      <mesh position={[centerX * scale, 0, -centerY * scale]} rotation={[0, 0, 0]}>
        <planeGeometry args={[planeSize * scale, planeSize * scale]} />
        <meshBasicMaterial color="#ff0000" opacity={UI_CONSTANTS.VISUALIZATION.DATUM_PLANE_OPACITY} transparent side={THREE.DoubleSide} />
      </mesh>
      <Html
        position={[
          (centerX + labelOffset) * scale,
          (labelOffset * UI_CONSTANTS.VISUALIZATION.LABEL_OFFSET_FACTOR) * scale,
          -(centerY + labelOffset) * scale
        ]}
        center
        distanceFactor={distanceFactor}
        style={{ pointerEvents: 'none' }}
      >
        <PMIFrame cells={['A']} isDatumLabel={true} />
      </Html>

      {/* Datum B - Front plane (XZ plane at Y=0, ground level) */}
      <mesh position={[centerX * scale, 0, -centerY * scale]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[planeSize * scale, planeSize * scale]} />
        <meshBasicMaterial color="#00ff00" opacity={UI_CONSTANTS.VISUALIZATION.DATUM_PLANE_OPACITY} transparent side={THREE.DoubleSide} />
      </mesh>
      <Html
        position={[
          (centerX + labelOffset) * scale,
          labelOffset * scale,
          -centerY * scale
        ]}
        center
        distanceFactor={distanceFactor}
        style={{ pointerEvents: 'none' }}
      >
        <PMIFrame cells={['B']} isDatumLabel={true} />
      </Html>

      {/* Datum C - Left plane (YZ plane on outer face of skid) */}
      <mesh position={[(-spanX / 2) * scale, centerZ * scale, -centerY * scale]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[planeSize * scale, planeSize * scale]} />
        <meshBasicMaterial color="#0000ff" opacity={UI_CONSTANTS.VISUALIZATION.DATUM_PLANE_OPACITY} transparent side={THREE.DoubleSide} />
      </mesh>
      <Html
        position={[
          (-spanX / 2 - labelOffset) * scale,
          centerZ * scale,
          -centerY * scale
        ]}
        center
        distanceFactor={distanceFactor}
        style={{ pointerEvents: 'none' }}
      >
        <PMIFrame cells={['C']} isDatumLabel={true} />
      </Html>
    </>
  )
}

function ScenePMIOverlays({
  bounds,
  totalDimensions,
  skidInfo,
  cleatSummary,
  floorInfo,
  pmiState
}: {
  bounds: SceneBounds;
  totalDimensions: {
    overallWidth: number;
    overallLength: number;
    overallHeight: number;
  } | null;
  skidInfo: {
    count: number;
    spacing: number;
    width: number;
    length: number;
  } | null;
  cleatSummary: {
    vertical: number;
    horizontal: number;
    totalLength: number;
  } | null;
  floorInfo: {
    count: number;
    width: number;
    thickness: number;
    gap: number;
  } | null;
  pmiState: PmiVisibilityState;
}) {
  // Use actual dimensions from generator for PMI positioning
  // This ensures PMI lines update correctly when dimensions change
  const crateWidth = totalDimensions?.overallWidth ?? (bounds.maxX - bounds.minX)
  const crateLength = totalDimensions?.overallLength ?? (bounds.maxY - bounds.minY)
  const crateHeight = totalDimensions?.overallHeight ?? (bounds.maxZ - bounds.minZ)
  const maxDimension = Math.max(crateWidth, crateLength, crateHeight)

  // Scale factor must match the box rendering scale (0.1)
  // This converts from NX inches to Three.js scene units
  const scale = 0.1

  const formatInches = (value: number) => `${value.toFixed(2)}"`

  // Calculate centers based on overall dimensions
  const centerX = 0  // Crate is centered at origin in X
  const centerY = crateLength / 2  // Center of length dimension

  const annotations: ReactNode[] = []

  // Calculate dynamic distance factor for Html elements based on crate size
  // Larger crates need larger distanceFactor to keep text readable
  const distanceFactor = Math.min(20, Math.max(5, maxDimension / 10))

  if (totalDimensions && pmiState.totalDimensions) {
    // Make offsets proportional to crate dimensions
    const widthOffset = Math.max(8, crateHeight * 0.1)
    const lengthOffset = Math.max(10, crateHeight * 0.12)
    const heightOffset = Math.max(6, crateWidth * 0.08)

    // Calculate actual bounds from generator dimensions
    const minX = -crateWidth / 2
    const maxX = crateWidth / 2
    const minY = 0
    const maxY = crateLength
    const minZ = 0
    const maxZ = crateHeight

    // Width dimension (X axis)
    const widthLineStart = new THREE.Vector3(minX * scale, (maxZ + widthOffset) * scale, -centerY * scale)
    const widthLineEnd = new THREE.Vector3(maxX * scale, (maxZ + widthOffset) * scale, -centerY * scale)
    const widthLabel = widthLineStart.clone().add(widthLineEnd).multiplyScalar(0.5)
    widthLabel.y += 0.3

    const widthExtLeftStart = new THREE.Vector3(minX * scale, maxZ * scale, -centerY * scale)
    const widthExtLeftEnd = new THREE.Vector3(minX * scale, (maxZ + widthOffset) * scale, -centerY * scale)
    const widthExtRightStart = new THREE.Vector3(maxX * scale, maxZ * scale, -centerY * scale)
    const widthExtRightEnd = new THREE.Vector3(maxX * scale, (maxZ + widthOffset) * scale, -centerY * scale)

    annotations.push(
      <Fragment key="dim-width">
        <MeasurementLine start={widthExtLeftStart} end={widthExtLeftEnd} />
        <MeasurementLine start={widthExtRightStart} end={widthExtRightEnd} />
        <MeasurementLine start={widthLineStart} end={widthLineEnd} />
        <Html position={[widthLabel.x, widthLabel.y, widthLabel.z]} center distanceFactor={distanceFactor} style={{ pointerEvents: 'none' }}>
          <PMIFrame cells={[
            'WIDTH',
            formatInches(totalDimensions.overallWidth),
            '⊥ A'
          ]} />
        </Html>
      </Fragment>
    )

    // Length dimension (Y axis in NX -> -Z in Three)
    const lengthLineStart = new THREE.Vector3(centerX * scale, (maxZ + lengthOffset) * scale, -minY * scale)
    const lengthLineEnd = new THREE.Vector3(centerX * scale, (maxZ + lengthOffset) * scale, -maxY * scale)
    const lengthLabel = lengthLineStart.clone().add(lengthLineEnd).multiplyScalar(0.5)
    lengthLabel.y += 0.3

    const lengthExtFrontStart = new THREE.Vector3(centerX * scale, maxZ * scale, -minY * scale)
    const lengthExtFrontEnd = new THREE.Vector3(centerX * scale, (maxZ + lengthOffset) * scale, -minY * scale)
    const lengthExtBackStart = new THREE.Vector3(centerX * scale, maxZ * scale, -maxY * scale)
    const lengthExtBackEnd = new THREE.Vector3(centerX * scale, (maxZ + lengthOffset) * scale, -maxY * scale)

    annotations.push(
      <Fragment key="dim-length">
        <MeasurementLine start={lengthExtFrontStart} end={lengthExtFrontEnd} />
        <MeasurementLine start={lengthExtBackStart} end={lengthExtBackEnd} />
        <MeasurementLine start={lengthLineStart} end={lengthLineEnd} />
        <Html position={[lengthLabel.x, lengthLabel.y, lengthLabel.z - 0.2]} center distanceFactor={distanceFactor} style={{ pointerEvents: 'none' }}>
          <PMIFrame cells={[
            'LENGTH',
            formatInches(totalDimensions.overallLength),
            '⊥ B'
          ]} />
        </Html>
      </Fragment>
    )

    // Height dimension (Z axis)
    const heightX = maxX + heightOffset
    const heightLineStart = new THREE.Vector3(heightX * scale, minZ * scale, -maxY * scale)
    const heightLineEnd = new THREE.Vector3(heightX * scale, maxZ * scale, -maxY * scale)
    const heightLabel = heightLineStart.clone().add(heightLineEnd).multiplyScalar(0.5)
    heightLabel.x += 0.3

    const heightExtBottomStart = new THREE.Vector3(maxX * scale, minZ * scale, -maxY * scale)
    const heightExtBottomEnd = new THREE.Vector3(heightX * scale, minZ * scale, -maxY * scale)
    const heightExtTopStart = new THREE.Vector3(maxX * scale, maxZ * scale, -maxY * scale)
    const heightExtTopEnd = new THREE.Vector3(heightX * scale, maxZ * scale, -maxY * scale)

    annotations.push(
      <Fragment key="dim-height">
        <MeasurementLine start={heightExtBottomStart} end={heightExtBottomEnd} />
        <MeasurementLine start={heightExtTopStart} end={heightExtTopEnd} />
        <MeasurementLine start={heightLineStart} end={heightLineEnd} />
        <Html position={[heightLabel.x, heightLabel.y, heightLabel.z]} center distanceFactor={distanceFactor} style={{ pointerEvents: 'none' }}>
          <PMIFrame cells={[
            'HEIGHT',
            formatInches(totalDimensions.overallHeight),
            '⊥ C'
          ]} />
        </Html>
      </Fragment>
    )
  }

  if (pmiState.skids && skidInfo && totalDimensions) {
    const minZ = 0
    const maxY = crateLength
    const anchor = new THREE.Vector3(centerX * scale, minZ * scale + 0.2, -(maxY - 4) * scale)
    const labelPosition = new THREE.Vector3(centerX * scale, (minZ + 2.5) * scale, -(maxY + 8) * scale)
    annotations.push(
      <Fragment key="callout-skids">
        <MeasurementLine start={anchor} end={labelPosition} />
        <Html position={[labelPosition.x, labelPosition.y, labelPosition.z]} center distanceFactor={distanceFactor} style={{ pointerEvents: 'none' }}>
          <PMIFrame cells={[
            'SKID',
            `QTY ${skidInfo.count}`,
            `SP ${formatInches(skidInfo.spacing)}`
          ]} />
        </Html>
      </Fragment>
    )
  }

  if (pmiState.cleats && cleatSummary && totalDimensions) {
    const minX = -crateWidth / 2
    const maxZ = crateHeight
    const anchor = new THREE.Vector3((minX + 4) * scale, (maxZ - 10) * scale, -centerY * scale)
    const labelPosition = new THREE.Vector3((minX - 8) * scale, (maxZ - 6) * scale, -centerY * scale)
    annotations.push(
      <Fragment key="callout-cleats">
        <MeasurementLine start={anchor} end={labelPosition} />
        <Html position={[labelPosition.x, labelPosition.y, labelPosition.z]} center distanceFactor={distanceFactor} style={{ pointerEvents: 'none' }}>
          <PMIFrame cells={[
            'CLEAT',
            `V ${cleatSummary.vertical}`,
            `H ${cleatSummary.horizontal}`
          ]} />
        </Html>
      </Fragment>
    )
  }

  if (pmiState.floor && floorInfo && totalDimensions) {
    const minZ = 0
    const maxX = crateWidth / 2
    const anchor = new THREE.Vector3(centerX * scale, minZ * scale + 0.1, -centerY * scale)
    const labelPosition = new THREE.Vector3((maxX + 6) * scale, (minZ + 1.5) * scale, -centerY * scale)
    annotations.push(
      <Fragment key="callout-floor">
        <MeasurementLine start={anchor} end={labelPosition} />
        <Html position={[labelPosition.x, labelPosition.y, labelPosition.z]} center distanceFactor={distanceFactor} style={{ pointerEvents: 'none' }}>
          <PMIFrame cells={[
            'FLOOR',
            `QTY ${floorInfo.count}`,
            `WD ${formatInches(floorInfo.width)}`
          ]} />
        </Html>
      </Fragment>
    )
  }

  return (
    <>
      {pmiState.datumPlanes && (
        <DatumPlanes bounds={bounds} scale={scale} distanceFactor={distanceFactor} totalDimensions={totalDimensions} />
      )}
      {annotations}
    </>
  )
}

function CameraResetter({
  visibleBoxes,
  resetTrigger,
  controlsRef,
  onTargetChange
}: {
  visibleBoxes: NXBox[];
  resetTrigger: number;
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
  onTargetChange: (target: [number, number, number]) => void;
}) {
  const { camera, size } = useThree()

  useEffect(() => {
    if (resetTrigger === 0 || visibleBoxes.length === 0) return

    const scale = 0.1
    const min = new THREE.Vector3(Infinity, Infinity, Infinity)
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)

    visibleBoxes.forEach(box => {
      const xValues = [box.point1.x, box.point2.x]
      const yValues = [box.point1.y, box.point2.y]
      const zValues = [box.point1.z, box.point2.z]

      const boxMinX = Math.min(...xValues) * scale
      const boxMaxX = Math.max(...xValues) * scale
      const boxMinY = Math.min(...zValues) * scale
      const boxMaxY = Math.max(...zValues) * scale
      const boxSceneZValues = yValues.map(value => -value * scale)
      const boxMinZ = Math.min(...boxSceneZValues)
      const boxMaxZ = Math.max(...boxSceneZValues)

      min.x = Math.min(min.x, boxMinX)
      min.y = Math.min(min.y, boxMinY)
      min.z = Math.min(min.z, boxMinZ)
      max.x = Math.max(max.x, boxMaxX)
      max.y = Math.max(max.y, boxMaxY)
      max.z = Math.max(max.z, boxMaxZ)
    })

    if (!Number.isFinite(min.x) || !Number.isFinite(min.y) || !Number.isFinite(min.z)) {
      return
    }

    const center = min.clone().add(max).multiplyScalar(0.5)
    const radius = center.distanceTo(max)
    const isPerspective = (camera as THREE.PerspectiveCamera).isPerspectiveCamera
    const perspectiveCamera = camera as THREE.PerspectiveCamera
    const fov = isPerspective ? THREE.MathUtils.degToRad(perspectiveCamera.fov) : THREE.MathUtils.degToRad(45)
    const aspect = size.height === 0 ? 1 : size.width / size.height
    const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspect)
    const padding = 1.3
    const minDistance = 5

    const verticalDenominator = Math.sin(fov / 2) || 0.0001
    const horizontalDenominator = Math.sin(horizontalFov / 2) || 0.0001

    const verticalDistance = radius === 0 ? minDistance : radius / verticalDenominator
    const horizontalDistance = radius === 0 ? minDistance : radius / horizontalDenominator

    const distance = Math.max(verticalDistance, horizontalDistance, minDistance) * padding
    const direction = new THREE.Vector3(1, 1, 1).normalize()
    const newPosition = center.clone().add(direction.multiplyScalar(distance))

    camera.position.copy(newPosition)
    camera.lookAt(center)
    camera.updateProjectionMatrix()

    if (controlsRef.current) {
      controlsRef.current.target.copy(center)
      controlsRef.current.update()
    }

    onTargetChange([center.x, center.y, center.z])
  }, [visibleBoxes, resetTrigger, camera, size, controlsRef, onTargetChange])

  return null
}

// Component to render a highlighted face plane
function HighlightedFace({ plane, color }: { plane: SelectedPlane; color: string }) {
  const { position: faceCenter, size, normal } = plane
  const scale = 0.1

  // Determine plane dimensions and rotation based on normal
  let planeArgs: [number, number] = [1, 1]
  let rotation = new THREE.Euler(0, 0, 0)
  const position = faceCenter.clone()

  // Adjust position to be on the surface of the box
  const offset = 0.02 // Offset far enough to be clearly visible above surface

  if (Math.abs(normal.x) > 0.9) {
    // X-facing plane (YZ plane)
    planeArgs = [size.y * scale, size.z * scale]
    rotation = new THREE.Euler(0, Math.PI / 2 * Math.sign(normal.x), 0)
    position.x += offset * Math.sign(normal.x)
  } else if (Math.abs(normal.y) > 0.9) {
    // Y-facing plane (XZ plane) - Up/Down in Three.js
    planeArgs = [size.x * scale, size.y * scale]
    rotation = new THREE.Euler(Math.PI / 2 * -Math.sign(normal.y), 0, 0)
    position.y += offset * Math.sign(normal.y)
  } else if (Math.abs(normal.z) > 0.9) {
    // Z-facing plane (XY plane) - Forward/Back in Three.js
    planeArgs = [size.x * scale, size.z * scale]
    rotation = new THREE.Euler(0, Math.sign(normal.z) > 0 ? 0 : Math.PI, 0)
    position.z += offset * Math.sign(normal.z)
  }

  return (
    <Plane
      args={planeArgs}
      position={[position.x, position.y, position.z]}
      rotation={rotation}
    >
      <meshBasicMaterial
        color={color}
        opacity={UI_CONSTANTS.VISUALIZATION.HIGHLIGHT_PLANE_OPACITY}
        transparent
        side={THREE.DoubleSide}
      />
    </Plane>
  )
}

// Function to check if a box matches a part name
function boxMatchesPartName(box: NXBox, partName: string): boolean {
  const partLower = partName.toLowerCase()
  const boxNameLower = box.name.toLowerCase()
  
  // Direct name match
  if (boxNameLower === partLower) {
    return true
  }
  
  // Match floorboard_N pattern
  if (partLower.startsWith('floorboard_')) {
    const match = partLower.match(/floorboard_(\d+)/)
    if (match) {
      const index = parseInt(match[1], 10)
      // Check if box name contains the floorboard index
      if (box.type === 'floor' && (boxNameLower.includes(`floorboard_${index}`) || boxNameLower.includes(`floorboard${index}`))) {
        return true
      }
    }
  }
  
  // Match panel plywood pieces (e.g., front_end_panel_ply_1)
  const plyMatch = partLower.match(/(front_end_panel|back_end_panel|left_side_panel|right_side_panel|top_panel)_ply_(\d+)/)
  if (plyMatch) {
    const panelName = plyMatch[1]
    const pieceIndex = parseInt(plyMatch[2], 10) - 1 // Convert to 0-indexed
    
    // Map part name panel to box panelName
    const panelNameMap: Record<string, string> = {
      'front_end_panel': 'FRONT_PANEL',
      'back_end_panel': 'BACK_PANEL',
      'left_side_panel': 'LEFT_END_PANEL',
      'right_side_panel': 'RIGHT_END_PANEL',
      'top_panel': 'TOP_PANEL'
    }
    
    const expectedPanelName = panelNameMap[panelName]
    if (box.type === 'plywood' && box.panelName === expectedPanelName && box.plywoodPieceIndex === pieceIndex) {
      return true
    }
  }
  
  // Match cleats (e.g., front_end_panel_cleat_...)
  if (partLower.includes('cleat') && box.type === 'cleat') {
    // Check if panel names match
    const panelMatch = partLower.match(/(front_end_panel|back_end_panel|left_side_panel|right_side_panel|top_panel|front_panel|back_panel|left_end_panel|right_end_panel|left_panel|right_panel)_cleat/)
    if (panelMatch) {
      const panelName = panelMatch[1]
      const panelNameMap: Record<string, string> = {
        'front_end_panel': 'FRONT_PANEL',
        'front_panel': 'FRONT_PANEL',
        'back_end_panel': 'BACK_PANEL',
        'back_panel': 'BACK_PANEL',
        'left_side_panel': 'LEFT_END_PANEL',
        'left_end_panel': 'LEFT_END_PANEL',
        'left_panel': 'LEFT_END_PANEL',
        'right_side_panel': 'RIGHT_END_PANEL',
        'right_end_panel': 'RIGHT_END_PANEL',
        'right_panel': 'RIGHT_END_PANEL',
        'top_panel': 'TOP_PANEL'
      }
      const expectedPanelName = panelNameMap[panelName]
      if (box.panelName === expectedPanelName) {
        return true
      }
    }
    // Also check direct name match for cleats
    if (boxNameLower.includes(partLower) || partLower.includes(boxNameLower)) {
      return true
    }
  }
  
  // Match skid
  if (partLower === 'skid' && box.type === 'skid') {
    return true
  }
  
  // Match decals/stencils
  if ((partLower.includes('decal') || partLower.includes('stencil')) && 
      (box.metadata?.toLowerCase().includes('decal') || box.metadata?.toLowerCase().includes('stencil'))) {
    // Try to match specific decal names
    if (partLower.includes('fragile') && box.metadata?.toLowerCase().includes('fragile')) return true
    if (partLower.includes('handling') && box.metadata?.toLowerCase().includes('handling')) return true
    if (partLower.includes('autocrate') && box.metadata?.toLowerCase().includes('autocrate')) return true
    if (partLower.includes('do_not_stack') && box.metadata?.toLowerCase().includes('do not stack')) return true
    if (partLower.includes('cg') && box.metadata?.toLowerCase().includes('cg')) return true
    if (partLower.includes('applied_impact') && box.metadata?.toLowerCase().includes('applied impact')) return true
  }
  
  // Match fasteners
  if ((partLower.includes('klimp') || partLower.includes('screw') || partLower.includes('bolt') || partLower.includes('nut') || partLower.includes('fastener')) &&
      (box.type === 'klimp' || box.type === 'hardware' || box.metadata?.toLowerCase().includes('fastener'))) {
    // Try to match specific fastener names
    if (partLower.includes('klimp') && box.type === 'klimp') return true
    if (partLower.includes('lag_screw') && box.name?.toLowerCase().includes('lag')) return true
    if (partLower.includes('nut') && box.name?.toLowerCase().includes('nut')) return true
  }
  
  return false
}

// Component to render a single box from NX two-point definition
function NXBoxMesh({
  box,
  hoveredBox,
  setHoveredBox,
  onHide,
  selectedPlanes,
  onPlaneClick,
  highlighted = false,
  isHoveredPart = false,
  hasHoveredPart = false
}: {
  box: NXBox;
  hoveredBox: string | null;
  setHoveredBox: (name: string | null) => void;
  onHide: (boxName: string) => void;
  selectedPlanes: SelectedPlane[];
  onPlaneClick: (plane: SelectedPlane) => void;
  highlighted?: boolean;
  isHoveredPart?: boolean;
  hasHoveredPart?: boolean;
}) {
  const isHovered = hoveredBox === box.name
  // Calculate center and size from two diagonal points
  const center = {
    x: (box.point1.x + box.point2.x) / 2,
    y: (box.point1.y + box.point2.y) / 2,
    z: (box.point1.z + box.point2.z) / 2,
  }

  const size = {
    x: Math.abs(box.point2.x - box.point1.x),
    y: Math.abs(box.point2.y - box.point1.y),
    z: Math.abs(box.point2.z - box.point1.z),
  }

  // Convert inches to display units (scale down for better viewing)
  const scale = 0.1

  // Handle click on box faces
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()

    // Get the face that was clicked
    const faceIndex = event.faceIndex
    if (faceIndex === undefined) return

    // Calculate face normal and center based on face index
    // In Three.js Box geometry, faces are ordered: +X, -X, +Y, -Y, +Z, -Z (each has 2 triangles)
    const faceNormalIndex = Math.floor(faceIndex / 2)

    let normal: THREE.Vector3
    let faceCenter: THREE.Vector3

    switch (faceNormalIndex) {
      case 0: // +X face
        normal = new THREE.Vector3(1, 0, 0)
        faceCenter = new THREE.Vector3(center.x + size.x/2, center.z, -center.y)
        break
      case 1: // -X face
        normal = new THREE.Vector3(-1, 0, 0)
        faceCenter = new THREE.Vector3(center.x - size.x/2, center.z, -center.y)
        break
      case 2: // +Y face (up in Three.js, Z in NX)
        normal = new THREE.Vector3(0, 1, 0)
        faceCenter = new THREE.Vector3(center.x, center.z + size.z/2, -center.y)
        break
      case 3: // -Y face (down in Three.js, -Z in NX)
        normal = new THREE.Vector3(0, -1, 0)
        faceCenter = new THREE.Vector3(center.x, center.z - size.z/2, -center.y)
        break
      case 4: // +Z face (forward in Three.js, -Y in NX)
        normal = new THREE.Vector3(0, 0, 1)
        faceCenter = new THREE.Vector3(center.x, center.z, -center.y + size.y/2)
        break
      case 5: // -Z face (backward in Three.js, +Y in NX)
        normal = new THREE.Vector3(0, 0, -1)
        faceCenter = new THREE.Vector3(center.x, center.z, -center.y - size.y/2)
        break
      default:
        return
    }

    onPlaneClick({
      boxName: box.name,
      faceIndex: faceNormalIndex,
      normal,
      position: faceCenter.multiplyScalar(scale),
      center: new THREE.Vector3(center.x, center.z, -center.y).multiplyScalar(scale),
      size
    })
  }

  // Format dimensions for tooltip
  const formatDimension = (value: number) => value.toFixed(2)
  const dimensions = `${formatDimension(size.x)}" x ${formatDimension(size.z)}" x ${formatDimension(size.y)}"`

  // Get material type based on component type
  const getMaterialType = (type?: string) => {
    switch (type) {
      case 'skid':
      case 'floor':
      case 'cleat':
        return 'LUMBER'
      case 'panel':
        return 'PLYWOOD'
      case 'klimp':
      case 'hardware':
        return 'HARDWARE'
      default:
        return 'LUMBER'
    }
  }

  return (
    <group>
      <Box
        position={[center.x * scale, center.z * scale, -center.y * scale]}
        args={[size.x * scale, size.z * scale, size.y * scale]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredBox(box.name)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHoveredBox(null)
        }}
        onContextMenu={(e) => {
          e.stopPropagation()
          e.nativeEvent.preventDefault() // Prevent default context menu and camera reset
          onHide(box.name)
        }}
      >
        <meshStandardMaterial
          color={highlighted ? '#fde68a' : (box.color || '#F4E4BC')}
          opacity={hasHoveredPart && !isHoveredPart ? 0.2 : 1}
          transparent={hasHoveredPart && !isHoveredPart}
          emissive={highlighted ? new THREE.Color('#f59e0b') : new THREE.Color('#000000')}
          emissiveIntensity={highlighted ? 0.2 : 0}
        />
        <Edges
          color='#1f2937'
        />
      </Box>

      {isHovered && (
        <Html
          position={[center.x * scale, (center.z * scale) + (size.z * scale / 2) + 0.5, -center.y * scale]}
          center
          distanceFactor={10}
          occlude={false}
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg pointer-events-none" role="tooltip" aria-label={`Component information: ${box.name}`}>
            <div className="font-semibold text-center mb-1">{box.name}</div>
            <div className="text-center mb-1">{dimensions}</div>
            <div className="text-center text-gray-300">{getMaterialType(box.type)}</div>
            {box.metadata && (
              <div className="text-center text-xs text-gray-400 mt-1">{box.metadata}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

export default function CrateVisualizer({ boxes, showGrid = true, showLabels = true, generator, showMarkings = true, visibility, onToggleVisibility, onToggleMarkings, pmiVisibility, onTogglePmi, partNumbers, tutorialHighlightNames = [], tutorialCallouts = [], hoveredPartName = null }: CrateVisualizerProps) {
  const [hiddenComponents, setHiddenComponents] = useState<Set<string>>(new Set())
  const [hoveredBox, setHoveredBox] = useState<string | null>(null)
  const [showHiddenList, setShowHiddenList] = useState(false)
  const [selectedPlanes, setSelectedPlanes] = useState<SelectedPlane[]>([])
  const [measurementDistance, setMeasurementDistance] = useState<number | null>(null)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0)
  const [controlTarget, setControlTarget] = useState<[number, number, number]>([0, 3, 0])
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const highlightColors = ['#00FF00', '#008CFF']
  const tutorialHighlightSet = useMemo(() => new Set(tutorialHighlightNames || []), [tutorialHighlightNames])

  const componentVisibility: ComponentVisibility = useMemo(
    () =>
      visibility ?? {
        skids: true,
        floorboards: true,
        frontPanel: true,
        backPanel: true,
        leftPanel: true,
        rightPanel: true,
        topPanel: true,
        cleats: true,
      },
    [visibility],
  )

  const pmiState: PmiVisibilityState = pmiVisibility ?? {
    totalDimensions: true,
    skids: false,
    cleats: false,
    floor: false,
    datumPlanes: false,
  }

  const derivedPartNumbers = {
    base: partNumbers?.base?.trim() || 'N/A',
    crate: partNumbers?.crate?.trim() || 'N/A',
    cap: partNumbers?.cap?.trim() || 'N/A',
  }

  const visibilityLabels: Record<keyof ComponentVisibility, string> = {
    skids: 'Skids',
    floorboards: 'Floorboards',
    frontPanel: 'Front Panel',
    backPanel: 'Back Panel',
    leftPanel: 'Left Panel',
    rightPanel: 'Right Panel',
    topPanel: 'Top Panel',
    cleats: 'Cleats',
  }

  const pmiLabels: Record<keyof PmiVisibilityState, string> = {
    totalDimensions: 'Dimensions',
    skids: 'Skids',
    cleats: 'Cleats',
    floor: 'Floor',
    datumPlanes: 'Datum Planes',
  }

  const clearSelections = useCallback(() => {
    setSelectedPlanes([])
    setMeasurementDistance(null)
    setSelectionError(null)
  }, [])

  const handleResetView = useCallback(() => {
    setHiddenComponents(new Set())
    setShowHiddenList(false)
    clearSelections()
    setResetCameraTrigger(prev => prev + 1)
  }, [clearSelections])

  const totalDimensions = useMemo(() => {
    if (!generator) {
      return null
    }
    const expressions = generator.getExpressions()
    return {
      overallWidth: expressions.get('overall_width') ?? 0,
      overallLength: expressions.get('overall_length') ?? 0,
      overallHeight: expressions.get('overall_height') ?? 0,
      internalWidth: expressions.get('internal_width') ?? 0,
      internalLength: expressions.get('internal_length') ?? 0,
      internalHeight: expressions.get('internal_height') ?? 0,
    }
  }, [generator])

  const skidInfo = useMemo(() => {
    if (!generator) {
      return null
    }
    const expressions = generator.getExpressions()
    return {
      count: expressions.get('skid_count') ?? 0,
      spacing: expressions.get('pattern_spacing') ?? 0,
      width: expressions.get('skid_width') ?? 0,
      length: expressions.get('internal_length') ?? 0,
    }
  }, [generator])

  const floorInfo = useMemo(() => {
    if (!generator) {
      return null
    }
    const expressions = generator.getExpressions()
    return {
      count: expressions.get('floorboard_count') ?? 0,
      width: expressions.get('floorboard_width') ?? 0,
      thickness: expressions.get('floorboard_thickness') ?? 0,
      gap: expressions.get('floorboard_gap') ?? 0,
    }
  }, [generator])

  const cleatSummary = useMemo(() => {
    if (!generator) {
      return null
    }
    const layouts = generator.getPanelCleatLayouts()
    let vertical = 0
    let horizontal = 0
    let totalLength = 0

    layouts.forEach(layout => {
      layout.cleats.forEach(cleat => {
        if (cleat.orientation === 'vertical') {
          vertical += 1
        } else if (cleat.orientation === 'horizontal') {
          horizontal += 1
        }
        totalLength += cleat.length
      })
    })

    return { vertical, horizontal, totalLength }
  }, [generator])

  const formatDimension = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return 'N/A'
    }
    return toNearest16th(value)
  }

  // Filter out suppressed components and user-hidden components, then sort by render priority
  // Render order: skids first, then floorboards, then panels (so panels get hover priority)
  const visibleBoxes = useMemo(() => {
    // Helper function to check if a box should be visible based on componentVisibility
    const isComponentVisible = (box: NXBox): boolean => {
      // Map box type and name to visibility key
      if (box.type === 'skid') {
        return componentVisibility.skids
      } else if (box.type === 'floor') {
        return componentVisibility.floorboards
      } else if (box.type === 'cleat') {
        return componentVisibility.cleats
      } else if (box.type === 'panel') {
        // Map panel names to visibility keys
        const nameLower = box.name.toLowerCase()
        if (nameLower.includes('front')) return componentVisibility.frontPanel
        if (nameLower.includes('back')) return componentVisibility.backPanel
        if (nameLower.includes('left')) return componentVisibility.leftPanel
        if (nameLower.includes('right')) return componentVisibility.rightPanel
        if (nameLower.includes('top')) return componentVisibility.topPanel
        // Default to visible if we can't determine panel type
        return true
      }
      // For other types (klimp, hardware, etc.), default to visible
      return true
    }

    return boxes
      .filter(box => !box.suppressed && !hiddenComponents.has(box.name) && isComponentVisible(box))
      .sort((a, b) => {
        const priority: { [key: string]: number } = {
          'skid': 1,
          'floor': 2,
        'panel': 3,
        'cleat': 4,
        'plywood': 5,
        'klimp': 6,
        'hardware': 7
      }
        const aPriority = priority[a.type || ''] || 6
        const bPriority = priority[b.type || ''] || 6
        return aPriority - bPriority
      })
  }, [boxes, hiddenComponents, componentVisibility])

  const sceneBounds = useMemo<SceneBounds | null>(() => {
    if (visibleBoxes.length === 0) {
      return null
    }

    const bounds: SceneBounds = {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
      minZ: Number.POSITIVE_INFINITY,
      maxZ: Number.NEGATIVE_INFINITY
    }

    visibleBoxes.forEach(box => {
      const xValues = [box.point1.x, box.point2.x]
      const yValues = [box.point1.y, box.point2.y]
      const zValues = [box.point1.z, box.point2.z]

      bounds.minX = Math.min(bounds.minX, ...xValues)
      bounds.maxX = Math.max(bounds.maxX, ...xValues)
      bounds.minY = Math.min(bounds.minY, ...yValues)
      bounds.maxY = Math.max(bounds.maxY, ...yValues)
      bounds.minZ = Math.min(bounds.minZ, ...zValues)
      bounds.maxZ = Math.max(bounds.maxZ, ...zValues)
    })

    if (!Number.isFinite(bounds.minX) || !Number.isFinite(bounds.minY) || !Number.isFinite(bounds.minZ)) {
      return null
    }

    return bounds
  }, [visibleBoxes])

  const handleHideComponent = (boxName: string) => {
    setHiddenComponents(prev => {
      const newSet = new Set(prev)
      newSet.add(boxName)
      return newSet
    })
  }

  const handleShowComponent = (boxName: string) => {
    setHiddenComponents(prev => {
      const newSet = new Set(prev)
      newSet.delete(boxName)
      return newSet
    })
  }

  const handleShowAll = () => {
    setHiddenComponents(new Set())
  }

  useEffect(() => {
    if (!controlsRef.current) return
    controlsRef.current.target.set(controlTarget[0], controlTarget[1], controlTarget[2])
    controlsRef.current.update()
  }, [controlTarget])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHiddenComponents(new Set())
        setShowHiddenList(false)
        clearSelections()
        setResetCameraTrigger(prev => prev + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [clearSelections])

  // Handle plane selection
  const handlePlaneClick = (plane: SelectedPlane) => {
    setSelectedPlanes(prev => {
      const existingIndex = prev.findIndex(p =>
        p.boxName === plane.boxName && p.faceIndex === plane.faceIndex
      )

      if (existingIndex >= 0) {
        const updatedSelection = prev.filter((_, i) => i !== existingIndex)
        setMeasurementDistance(null)
        setSelectionError(null)
        return updatedSelection
      }

      const candidateSelection = [...prev, plane]
      const trimmedSelection = candidateSelection.slice(-2)

      if (trimmedSelection.length < 2) {
        setMeasurementDistance(null)
        setSelectionError(null)
        return trimmedSelection
      }

      const [firstPlane, secondPlane] = trimmedSelection
      const normalizedFirst = firstPlane.normal.clone().normalize()
      const normalizedSecond = secondPlane.normal.clone().normalize()
      const dotProduct = Math.abs(normalizedFirst.dot(normalizedSecond))
      const isParallel = dotProduct > 0.99

      if (!isParallel) {
        setSelectionError('Selected faces must be parallel')
        if (prev.length < 2) {
          setMeasurementDistance(null)
        }
        return prev
      }

      const centerDiff = secondPlane.position.clone().sub(firstPlane.position)
      const distance = Math.abs(centerDiff.dot(normalizedFirst)) / 0.1
      setMeasurementDistance(distance)
      setSelectionError(null)

      return trimmedSelection
    })
  }

  // Prevent default context menu on canvas
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLCanvasElement) {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-100 rounded-lg relative" role="region" aria-label="3D crate visualization">
      <Canvas
        camera={{
          position: [15, 10, 15],
          fov: UI_CONSTANTS.CAMERA.FOV,
          near: UI_CONSTANTS.CAMERA.NEAR_PLANE,
          far: UI_CONSTANTS.CAMERA.FAR_PLANE
        }}
        aria-label="Interactive 3D crate model"
      >
        <Suspense fallback={null}>
          <CameraResetter
            visibleBoxes={visibleBoxes}
            resetTrigger={resetCameraTrigger}
            controlsRef={controlsRef}
            onTargetChange={setControlTarget}
          />
          {/* Lighting */}
          <ambientLight intensity={UI_CONSTANTS.LIGHTING.AMBIENT_INTENSITY} />
          <directionalLight position={[10, 10, 5]} intensity={UI_CONSTANTS.LIGHTING.DIRECTIONAL_INTENSITY} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={UI_CONSTANTS.LIGHTING.POINT_LIGHT_INTENSITY} />

          {/* Removed grid - was distracting from the crate visualization */}

          {/* Coordinate axes - small reference arrows at origin */}
          {showLabels && (
            <>
              {/* X axis - Red */}
              <mesh position={[0.5, 0.1, 0]}>
                <boxGeometry args={[1, 0.02, 0.02]} />
                <meshBasicMaterial color="red" />
              </mesh>
              <Text
                position={[1.2, 0.1, 0]}
                fontSize={0.2}
                color="red"
              >
                X
              </Text>

              {/* Y axis - Green (Z in NX) */}
              <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.02, 1, 0.02]} />
                <meshBasicMaterial color="green" />
              </mesh>
              <Text
                position={[0, 1.3, 0]}
                fontSize={0.2}
                color="green"
              >
                Z
              </Text>

              {/* Z axis - Blue (Y in NX) - pointing backward */}
              <mesh position={[0, 0.1, -0.5]}>
                <boxGeometry args={[0.02, 0.02, 1]} />
                <meshBasicMaterial color="blue" />
              </mesh>
              <Text
                position={[0, 0.1, -1.2]}
                fontSize={0.2}
                color="blue"
              >
                Y
              </Text>
            </>
          )}

          {/* Render visible boxes only (filter out suppressed and hidden) */}
          {visibleBoxes.map((box, index) => {
            // Handle different hardware types
            if (box.type === 'klimp') {
              return (
                <KlimpModel
                  key={`${box.name}-${index}`}
                  box={box}
                />
              )
            } else if (box.type === 'hardware' && (box.name?.toLowerCase().includes('lag') || box.name?.toLowerCase().includes('screw'))) {
              // Render lag screw at box position
              const center = {
                x: (box.point1.x + box.point2.x) / 2,
                y: (box.point1.y + box.point2.y) / 2,
                z: (box.point1.z + box.point2.z) / 2,
              }
              return (
                <LagScrew3D
                  key={`${box.name}-${index}`}
                  position={[center.x, center.y, center.z]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.1}
                  length={2.5}
                />
              )
            } else if (box.type === 'hardware' && box.name?.toLowerCase().includes('washer')) {
              // Render washer at box position
              const center = {
                x: (box.point1.x + box.point2.x) / 2,
                y: (box.point1.y + box.point2.y) / 2,
                z: (box.point1.z + box.point2.z) / 2,
              }
              return (
                <Washer3D
                  key={`${box.name}-${index}`}
                  position={[center.x, center.y, center.z]}
                  scale={0.1}
                />
              )
            } else {
              // Default rendering for other box types with tutorial highlights
              const isHoveredPart = hoveredPartName ? boxMatchesPartName(box, hoveredPartName) : false
              return (
                <NXBoxMesh
                  key={`${box.name}-${index}`}
                  box={box}
                  hoveredBox={hoveredBox}
                  setHoveredBox={setHoveredBox}
                  onHide={handleHideComponent}
                  selectedPlanes={selectedPlanes}
                  onPlaneClick={handlePlaneClick}
                  highlighted={tutorialHighlightSet.has(box.name)}
                  isHoveredPart={isHoveredPart}
                  hasHoveredPart={!!hoveredPartName}
                />
              )
            }
          })}

          {/* Render markings if generator is provided */}
          {generator && showMarkings && (
            <MarkingVisualizer boxes={visibleBoxes} generator={generator} />
          )}

          {/* Render selected face planes */}
          {selectedPlanes.map((plane, index) => (
            <HighlightedFace
              key={`plane-${index}`}
              plane={plane}
              color={highlightColors[index] ?? '#00FF00'}
            />
          ))}

          {sceneBounds && totalDimensions && (
            <ScenePMIOverlays
              key={`pmi-${totalDimensions.overallWidth}-${totalDimensions.overallLength}-${totalDimensions.overallHeight}`}
              bounds={sceneBounds}
              totalDimensions={totalDimensions}
              skidInfo={skidInfo}
              cleatSummary={cleatSummary}
              floorInfo={floorInfo}
              pmiState={pmiState}
            />
          )}

          {/* Tutorial callouts */}
          {tutorialCallouts.map((c, idx) => {
            const box = visibleBoxes.find(b => b.name === c.boxName)
            if (!box) return null
            const center = {
              x: (box.point1.x + box.point2.x) / 2,
              y: (box.point1.y + box.point2.y) / 2,
              z: (box.point1.z + box.point2.z) / 2,
            }
            const scale = 0.1
            return (
              <Html
                key={`callout-${c.boxName}-${idx}`}
                position={[center.x * scale, (center.z * scale) + 0.8, -center.y * scale]}
                center
                distanceFactor={10}
              >
                <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded px-2 py-1 shadow">
                  {c.label}
                </div>
              </Html>
            )
          })}

          {/* Render measurement line between parallel planes */}
          {selectedPlanes.length === 2 && measurementDistance !== null && (
            <group>
              <Html
                position={[
                  (selectedPlanes[0].position.x + selectedPlanes[1].position.x) / 2,
                  (selectedPlanes[0].position.y + selectedPlanes[1].position.y) / 2,
                  (selectedPlanes[0].position.z + selectedPlanes[1].position.z) / 2
                ]}
                center
                distanceFactor={10}
              >
                <div className="bg-blue-600 text-white text-lg font-bold rounded-lg px-3 py-2 shadow-lg pointer-events-none">
                  {toNearest16th(measurementDistance)}
                </div>
              </Html>

              {/* Draw line between plane centers */}
              <MeasurementLine
                start={selectedPlanes[0].position}
                end={selectedPlanes[1].position}
              />
            </group>
          )}

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={50}
            minDistance={2}
            target={controlTarget}
          />
        </Suspense>
      </Canvas>

      {/* Overlay Panels - Hidden on mobile */}
      <div className="hidden lg:flex absolute top-2 right-2 w-64 flex-col gap-2 pointer-events-auto" role="complementary" aria-label="Visualization controls">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Visibility</h3>
            <button
              onClick={handleResetView}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              aria-label="Reset camera view and show all components"
            >
              Reset view
            </button>
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Component visibility toggles">
            {(Object.keys(componentVisibility) as (keyof ComponentVisibility)[]).map(key => {
              const isEnabled = componentVisibility[key]
              return (
                <button
                  key={key}
                  onClick={() => onToggleVisibility?.(key)}
                  className={`px-2 py-1.5 text-xs rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                    isEnabled
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:border-blue-400 dark:hover:bg-gray-700'
                  }`}
                  aria-label={`${isEnabled ? 'Hide' : 'Show'} ${visibilityLabels[key]}`}
                  aria-pressed={isEnabled}
                >
                  {visibilityLabels[key]}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              onClick={() => onToggleMarkings?.()}
              className={`px-2 py-1.5 text-xs rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                showMarkings
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:border-blue-400 dark:hover:bg-gray-700'
              }`}
              aria-label={showMarkings ? 'Hide markings' : 'Show markings'}
              aria-pressed={showMarkings}
            >
              {showMarkings ? 'Markings On' : 'Markings Off'}
            </button>
          </div>
        </div>

        {/* PMI Visibility Controls */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">PMI Visibility</h3>
          <div className="flex flex-wrap gap-1" role="group" aria-label="PMI visibility toggles">
            {(Object.keys(pmiLabels) as (keyof PmiVisibilityState)[]).map(layer => {
              const active = pmiState[layer]
              return (
                <button
                  key={layer}
                  onClick={() => onTogglePmi?.(layer)}
                  className={`px-2 py-1.5 text-xs rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:border-blue-400 dark:hover:bg-gray-700'
                  }`}
                  aria-label={`${active ? 'Hide' : 'Show'} ${pmiLabels[layer]}`}
                  aria-pressed={active}
                >
                  {pmiLabels[layer]}
                </button>
              )
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400" role="note" aria-label="Interaction hints">
            Click faces to measure • Right-click to hide component • Esc to reset view
          </div>
        </div>

        {hiddenComponents.size > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Hidden Components ({hiddenComponents.size})
              </h3>
              <button
                onClick={() => setShowHiddenList(!showHiddenList)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                aria-label={showHiddenList ? 'Hide hidden components list' : 'Show hidden components list'}
                aria-expanded={showHiddenList}
              >
                {showHiddenList ? 'Hide' : 'Show'}
              </button>
            </div>
            {showHiddenList && (
              <>
                <div className="max-h-40 overflow-y-auto space-y-1 text-xs" role="list" aria-label="Hidden components">
                  {Array.from(hiddenComponents).map(name => (
                    <div key={name} className="flex justify-between items-center" role="listitem">
                      <span className="text-gray-600 dark:text-gray-400 truncate mr-2">{name}</span>
                      <button
                        onClick={() => handleShowComponent(name)}
                        className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                        aria-label={`Show ${name}`}
                      >
                        Show
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleShowAll}
                  className="mt-2 w-full text-xs bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  aria-label="Show all hidden components"
                >
                  Show All
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {selectedPlanes.length > 0 && (
        <div className="hidden lg:block absolute bottom-20 left-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-3" role="status" aria-live="polite" aria-atomic="true">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Measurement Mode
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {selectedPlanes.map((plane, index) => (
              <div key={index}>
                Plane {index + 1}: {plane.boxName}
              </div>
            ))}
            <div className="pt-1 border-t border-gray-300 dark:border-gray-700">
              {selectionError && (
                <span className="font-semibold text-red-600 dark:text-red-400" role="alert">
                  {selectionError}
                </span>
              )}
              {!selectionError && selectedPlanes.length === 1 && 'Select another plane to measure'}
              {!selectionError && selectedPlanes.length === 2 && measurementDistance !== null && (
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  Distance: {toNearest16th(measurementDistance)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={clearSelections}
            className="mt-2 text-xs bg-red-600 text-white rounded px-2 py-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            aria-label="Clear measurement selection"
          >
            Clear Selection
          </button>
        </div>
      )}

    </div>
  )
}

