'use client'

import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html } from '@react-three/drei'
import { CrateConfiguration } from '@/types/crate'
import { calculateCrateDimensions } from '@/lib/domain/calculations'
import { CrateAssembly } from './CrateAssembly'
import { LoadingFallback } from './LoadingFallback'

interface CrateVisualizerProps {
  config: CrateConfiguration
  showPMI?: boolean
  showDimensions?: boolean
  showExploded?: boolean
  className?: string
}

export function CrateVisualizer({ 
  config, 
  showPMI = false, 
  showDimensions = true,
  showExploded = false,
  className = "h-full w-full"
}: CrateVisualizerProps) {
  const dimensions = useMemo(() => calculateCrateDimensions(config), [config])
  
  return (
    <div className={className}>
      <Canvas 
        camera={{ 
          position: [10, 10, 10], 
          fov: 50,
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
          {/* Lighting setup for CAD visualization */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <pointLight position={[10, -10, 10]} intensity={0.3} />
          
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
            maxDistance={50}
            minDistance={2}
            enableDamping={true}
            dampingFactor={0.05}
            screenSpacePanning={false}
          />
          
          {/* Grid for reference */}
          <gridHelper args={[20, 20, '#666666', '#333333']} position={[0, -0.1, 0]} />
        </Suspense>
      </Canvas>
    </div>
  )
}
