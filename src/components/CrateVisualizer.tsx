'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Grid, Text, Html, Edges } from '@react-three/drei'
import { NXBox } from '@/lib/nx-generator'
import { Suspense, useState, useRef } from 'react'

interface CrateVisualizerProps {
  boxes: NXBox[]
  showGrid?: boolean
  showLabels?: boolean
}

// Component to render a single box from NX two-point definition
function NXBoxMesh({ box, hoveredBox, setHoveredBox }: { box: NXBox; hoveredBox: string | null; setHoveredBox: (name: string | null) => void }) {
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
      >
        <meshStandardMaterial
          color={box.color || '#8B4513'}
          opacity={1}
          transparent={false}
        />
        {/* Add edges for panels to make them more distinguishable */}
        {box.type === 'panel' && (
          <Edges
            color="#2a2a2a"
            scale={1.001}
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

export default function CrateVisualizer({ boxes, showGrid = true, showLabels = true }: CrateVisualizerProps) {
  // Filter out suppressed components and sort by render priority
  // Render order: skids first, then floorboards, then panels (so panels get hover priority)
  const visibleBoxes = boxes
    .filter(box => !box.suppressed)
    .sort((a, b) => {
      const priority: { [key: string]: number } = {
        'skid': 1,
        'floor': 2,
        'panel': 3,
        'cleat': 4
      }
      const aPriority = priority[a.type || ''] || 5
      const bPriority = priority[b.type || ''] || 5
      return aPriority - bPriority
    })
  const [hoveredBox, setHoveredBox] = useState<string | null>(null)

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

          {/* Render visible boxes only (filter out suppressed) */}
          {visibleBoxes.map((box, index) => (
            <NXBoxMesh
              key={`${box.name}-${index}`}
              box={box}
              hoveredBox={hoveredBox}
              setHoveredBox={setHoveredBox}
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
    </div>
  )
}