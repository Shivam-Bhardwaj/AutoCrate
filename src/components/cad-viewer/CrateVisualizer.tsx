'use client'

import { Suspense, useMemo, useRef, useEffect } from 'react'
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
  const controlsRef = useRef<any>(null)
  
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
    const distance = (diagonal * 1.8) / Math.tan(fovRadians / 2) // 1.8x for optimal framing
    
    // Position camera at an optimal angle for professional 3D view
    const angle = Math.PI / 3.5 // ~51 degrees for better perspective
    const x = distance * Math.cos(angle)
    const y = distance * 0.75 // Balanced height for optimal view
    const z = distance * Math.sin(angle)
    
    return [x, y, z] as [number, number, number]
  }, [dimensions])
  
  // Reset camera to optimal position when component mounts
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }, [cameraPosition])
  
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
          {/* Optimized professional lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[25, 25, 15]} 
            intensity={1.5}
            castShadow
            shadow-mapSize={[4096, 4096]}
            shadow-camera-far={150} 
            shadow-camera-left={-30} 
            shadow-camera-right={30} 
            shadow-camera-top={30} 
            shadow-camera-bottom={-30}
          />
          <directionalLight 
            position={[-15, 15, -10]} 
            intensity={0.6} 
            color={0xffffff}
          />
          <pointLight position={[0, 20, 0]} intensity={0.4} color={0xffffff} />
          <pointLight position={[10, 10, 10]} intensity={0.2} color={0xffffff} />
          
          {/* CAD Model Components */}
          <CrateAssembly 
            config={config}
            dimensions={dimensions}
            showExploded={showExploded}
          />
          
          {/* Interactive Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true} 
            enableRotate={true}
            maxDistance={cameraPosition[0] * 5} // Allow zooming out 5x from optimal position
            minDistance={Math.max(dimensions.overallLength, dimensions.overallWidth, dimensions.overallHeight) * 0.3} // Allow getting closer
            enableDamping={true}
            dampingFactor={0.08}
            screenSpacePanning={false}
            autoRotate={false}
            autoRotateSpeed={0.5}
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
