'use client'

import { Canvas, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Box, Grid, Text, Html, Edges, Plane } from '@react-three/drei'
import { NXBox } from '@/lib/nx-generator'
import { Suspense, useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

interface CrateVisualizerProps {
  boxes: NXBox[]
  showGrid?: boolean
  showLabels?: boolean
  showOutlines?: boolean
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
      <lineBasicMaterial color="#0066CC" linewidth={3} />
    </line>
  )
}

// Component to render a highlighted face plane
function HighlightedFace({ plane }: { plane: SelectedPlane }) {
  const { center, size, normal } = plane
  const scale = 0.1

  // Determine plane dimensions and rotation based on normal
  let planeArgs: [number, number] = [1, 1]
  let rotation = new THREE.Euler(0, 0, 0)
  let position = center.clone()

  // Adjust position to be on the surface of the box
  const offset = 0.001 // Small offset to prevent z-fighting

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
        color="#FFD700"
        opacity={0.5}
        transparent
        side={THREE.DoubleSide}
      />
    </Plane>
  )
}

// Component to render a single box from NX two-point definition
function NXBoxMesh({
  box,
  hoveredBox,
  setHoveredBox,
  onHide,
  showOutlines,
  selectedPlanes,
  onPlaneClick
}: {
  box: NXBox;
  hoveredBox: string | null;
  setHoveredBox: (name: string | null) => void;
  onHide: (boxName: string) => void;
  showOutlines: boolean;
  selectedPlanes: SelectedPlane[];
  onPlaneClick: (plane: SelectedPlane) => void;
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
          onHide(box.name)
        }}
      >
        <meshStandardMaterial
          color={box.color || '#F4E4BC'}
          opacity={1}
          transparent={false}
        />
        {/* Add edges based on showOutlines prop or for panels */}
        {(showOutlines || box.type === 'panel') && (
          <Edges
            color={box.type === 'panel' ? '#4a4a4a' : '#666666'}
            scale={1.001}
            linewidth={1}
          />
        )}
      </Box>

      {isHovered && (
        <Html
          position={[center.x * scale, (center.z * scale) + (size.z * scale / 2) + 0.5, -center.y * scale]}
          center
          distanceFactor={10}
          occlude={false}
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg pointer-events-none">
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

export default function CrateVisualizer({ boxes, showGrid = true, showLabels = true, showOutlines = false }: CrateVisualizerProps) {
  const [hiddenComponents, setHiddenComponents] = useState<Set<string>>(new Set())
  const [hoveredBox, setHoveredBox] = useState<string | null>(null)
  const [showHiddenList, setShowHiddenList] = useState(false)
  const [selectedPlanes, setSelectedPlanes] = useState<SelectedPlane[]>([])
  const [measurementDistance, setMeasurementDistance] = useState<number | null>(null)

  // Filter out suppressed components and user-hidden components, then sort by render priority
  // Render order: skids first, then floorboards, then panels (so panels get hover priority)
  const visibleBoxes = boxes
    .filter(box => !box.suppressed && !hiddenComponents.has(box.name))
    .sort((a, b) => {
      const priority: { [key: string]: number } = {
        'skid': 1,
        'floor': 2,
        'panel': 3,
        'cleat': 4,
        'plywood': 5
      }
      const aPriority = priority[a.type || ''] || 6
      const bPriority = priority[b.type || ''] || 6
      return aPriority - bPriority
    })

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

  // Handle plane selection
  const handlePlaneClick = (plane: SelectedPlane) => {
    setSelectedPlanes(prev => {
      // Check if this plane is already selected
      const existingIndex = prev.findIndex(p =>
        p.boxName === plane.boxName && p.faceIndex === plane.faceIndex
      )

      if (existingIndex >= 0) {
        // Deselect if clicking same plane
        const newSelection = prev.filter((_, i) => i !== existingIndex)
        setMeasurementDistance(null)
        return newSelection
      }

      // Add new plane
      let newSelection = [...prev, plane]

      // Keep only last 2 selections
      if (newSelection.length > 2) {
        newSelection = newSelection.slice(-2)
      }

      // Check if we have two parallel planes
      if (newSelection.length === 2) {
        const [plane1, plane2] = newSelection

        // Check if planes are parallel (normals are parallel)
        const dotProduct = Math.abs(plane1.normal.dot(plane2.normal))

        // Planes are parallel if dot product is close to 1 (same direction) or -1 (opposite direction)
        if (Math.abs(dotProduct) > 0.99) {
          // Calculate distance between parallel planes
          // Distance is the projection of the vector between centers onto the normal
          const centerDiff = plane2.position.clone().sub(plane1.position)
          const distance = Math.abs(centerDiff.dot(plane1.normal)) / 0.1 // Convert back to inches
          setMeasurementDistance(distance)
        } else {
          // Not parallel
          setMeasurementDistance(null)
        }
      } else {
        setMeasurementDistance(null)
      }

      return newSelection
    })
  }

  // Clear selections
  const clearSelections = () => {
    setSelectedPlanes([])
    setMeasurementDistance(null)
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
    <div className="w-full h-full bg-gray-100 rounded-lg relative">
      <Canvas
        camera={{
          position: [15, 10, 15],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

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
          {visibleBoxes.map((box, index) => (
            <NXBoxMesh
              key={`${box.name}-${index}`}
              box={box}
              hoveredBox={hoveredBox}
              setHoveredBox={setHoveredBox}
              onHide={handleHideComponent}
              showOutlines={showOutlines}
              selectedPlanes={selectedPlanes}
              onPlaneClick={handlePlaneClick}
            />
          ))}

          {/* Render selected face planes */}
          {selectedPlanes.map((plane, index) => (
            <HighlightedFace key={`plane-${index}`} plane={plane} />
          ))}

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
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={50}
            minDistance={2}
            target={[0, 3, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Hidden Components Panel */}
      {hiddenComponents.size > 0 && (
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Hidden Components ({hiddenComponents.size})
            </h3>
            <button
              onClick={() => setShowHiddenList(!showHiddenList)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showHiddenList ? 'Hide' : 'Show'}
            </button>
          </div>

          {showHiddenList && (
            <>
              <div className="max-h-48 overflow-y-auto">
                {Array.from(hiddenComponents).map(name => (
                  <div
                    key={name}
                    className="flex justify-between items-center py-1 text-xs"
                  >
                    <span className="text-gray-600 dark:text-gray-400 truncate mr-2">
                      {name}
                    </span>
                    <button
                      onClick={() => handleShowComponent(name)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Show
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleShowAll}
                className="mt-2 w-full text-xs bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700"
              >
                Show All
              </button>
            </>
          )}
        </div>
      )}

      {/* Measurement Status */}
      {selectedPlanes.length > 0 && (
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Measurement Mode
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {selectedPlanes.map((plane, index) => (
              <div key={index}>
                Plane {index + 1}: {plane.boxName}
              </div>
            ))}
            <div className="pt-1 border-t border-gray-300 dark:border-gray-600">
              {selectedPlanes.length === 1 && 'Select another plane to measure'}
              {selectedPlanes.length === 2 && measurementDistance === null && 'Selected planes are not parallel'}
              {selectedPlanes.length === 2 && measurementDistance !== null && (
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  Distance: {toNearest16th(measurementDistance)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={clearSelections}
            className="mt-2 text-xs bg-red-600 text-white rounded px-2 py-1 hover:bg-red-700"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded px-2 py-1">
        Click faces to measure • Right-click to hide component
      </div>
    </div>
  )
}