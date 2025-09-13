'use client'

import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CrateConfiguration } from '@/types/crate'
import { calculateCrateDimensions } from '@/lib/domain/calculations'
import { CrateAssembly } from './CrateAssembly'
import { LoadingFallback } from './LoadingFallback'

interface CrateVisualizerProps {
  config: CrateConfiguration
  showExploded?: boolean
  className?: string
}

export function CrateVisualizer({ 
  config, 
  showExploded = false,
  className = "h-full w-full"
}: CrateVisualizerProps) {
  const dimensions = useMemo(() => calculateCrateDimensions(config), [config])
  
  // Calculate optimal camera position to fit entire crate in view
  const cameraPosition = useMemo(() => {
    // Create bounding box for the entire crate
    const halfWidth = dimensions.overallWidth / 2
    const halfLength = dimensions.overallLength / 2
    const halfHeight = dimensions.overallHeight / 2
    
    // Calculate the diagonal distance from center to corner
    const diagonal = Math.sqrt(
      halfWidth * halfWidth + 
      halfLength * halfLength + 
      halfHeight * halfHeight
    )
    
    // Field of view is 40 degrees, so we need distance to fit the diagonal
    // Using trigonometry: distance = diagonal / tan(fov/2)
    const fovRadians = (40 * Math.PI) / 180
    const distance = (diagonal * 1.2) / Math.tan(fovRadians / 2) // 1.2x for padding
    
    // Position camera at an angle to show the crate nicely
    const angle = Math.PI / 4 // 45 degrees
    const x = distance * Math.cos(angle)
    const y = distance * 0.6 // Slightly lower for better view
    const z = distance * Math.sin(angle)
    
    return [x, y, z] as [number, number, number]
  }, [dimensions])
  
  return (
    <div className={className} role="img" aria-label="3D Crate Visualization" tabIndex={0}>
      <Canvas 
        camera={{ 
          position: cameraPosition, 
          fov: 40,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false
        }}
        performance={{ min: 0.5 }} // Maintain 30fps minimum
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Professional lighting setup */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[20, 20, 10]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[4096, 4096]}
            shadow-camera-far={100}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
          />
          <directionalLight 
            position={[-10, 10, -5]} 
            intensity={0.4} 
            color={0xffffff}
          />
          <pointLight position={[0, 15, 0]} intensity={0.3} color={0xffffff} />
          
          {/* CAD Model Components */}
          <CrateAssembly 
            config={config}
            dimensions={dimensions}
            showExploded={showExploded}
          />
          
          {/* Interactive Controls */}
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            maxDistance={cameraPosition[0] * 3} // Allow zooming out 3x from optimal position
            minDistance={Math.max(dimensions.overallLength, dimensions.overallWidth, dimensions.overallHeight) * 0.5} // Don't get too close
            enableDamping={true}
            dampingFactor={0.05}
            screenSpacePanning={false}
            target={[0, 0, 0]}
          />
          
          {/* Professional grid and background */}
          <gridHelper 
            args={[
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 2, 
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 2, 
              0x888888, 
              0x444444
            ]} 
            position={[0, -0.1, 0]} 
          />
          <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 3, 
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 3
            ]} />
            <meshLambertMaterial color={0xf0f0f0} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  )
}
