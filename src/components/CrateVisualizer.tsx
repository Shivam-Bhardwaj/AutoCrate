'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Grid, Text, Html, Edges } from '@react-three/drei'
import { NXBox } from '@/lib/nx-generator'
import { Suspense, useState, useRef, useEffect } from 'react'

interface CrateVisualizerProps {
  boxes: NXBox[]
  showGrid?: boolean
  showLabels?: boolean
  showOutlines?: boolean
}

// Component to render a single box from NX two-point definition
function NXBoxMesh({
  box,
  hoveredBox,
  setHoveredBox,
  onHide,
  showOutlines
}: {
  box: NXBox;
  hoveredBox: string | null;
  setHoveredBox: (name: string | null) => void;
  onHide: (boxName: string) => void;
  showOutlines: boolean;
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
            />
          ))}

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

      {/* Instructions */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded px-2 py-1">
        Right-click to hide component
      </div>
    </div>
  )
}