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
  showPMI?: boolean
  showDimensions?: boolean
  showExploded?: boolean
  className?: string
}

export function CrateVisualizer({ 
  config, 
  showPMI: _showPMI = false, 
  showDimensions: _showDimensions = true,
  showExploded = false,
  className = "h-full w-full"
}: CrateVisualizerProps) {
  const dimensions = useMemo(() => calculateCrateDimensions(config), [config])
  
  return (
    <div className={className}>
      <Canvas 
        camera={{ 
          position: [40, 30, 40], 
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
            color="#ffffff"
          />
          <pointLight position={[0, 15, 0]} intensity={0.3} color="#ffffff" />
          
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
            maxDistance={200}
            minDistance={10}
            enableDamping={true}
            dampingFactor={0.05}
            screenSpacePanning={false}
            target={[0, 0, 0]}
          />
          
          {/* Professional grid and background */}
          <gridHelper args={[50, 50, '#888888', '#444444']} position={[0, -0.1, 0]} />
          <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshLambertMaterial color="#f0f0f0" />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  )
}
