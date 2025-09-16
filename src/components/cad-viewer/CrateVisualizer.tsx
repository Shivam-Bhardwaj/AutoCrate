'use client'

import { Suspense, useMemo, useRef, useEffect, memo, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload, Environment } from '@react-three/drei'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { CrateConfiguration } from '@/types/crate'
import { calculateCrateDimensions } from '@/lib/domain/calculations'
import { CrateAssembly } from './CrateAssembly'
import { LoadingFallback } from './LoadingFallback'
import { useMobileOptimization } from '@/hooks/useMobileOptimization'

// Lazy load heavy components for better performance
const PMIAnnotations = lazy(() => import('./PMIAnnotations').then(module => ({ default: module.PMIAnnotations })))
const ComponentMetadata = lazy(() => import('./ComponentMetadata').then(module => ({ default: module.ComponentMetadata })))
const PerformanceMonitor = lazy(() => import('./PerformanceMonitor').then(module => ({ default: module.PerformanceMonitor })))

interface CrateVisualizerProps {
  config: CrateConfiguration
  showExploded?: boolean
  showPMI?: boolean
  showDimensions?: boolean
  enableMeasurement?: boolean
  showPerformanceStats?: boolean
  className?: string
}

export const CrateVisualizer = memo(function CrateVisualizer({ 
  config, 
  showExploded = false,
  showPMI = false,
  showDimensions: _showDimensions = true,
  enableMeasurement = false,
  showPerformanceStats = false,
  className = "h-full w-full"
}: CrateVisualizerProps) {
  const dimensions = useMemo(() => calculateCrateDimensions(config), [config])
  const controlsRef = useRef<OrbitControlsImpl>(null)
  
  // Mobile optimization
  const { 
    isMobile, 
    isTouchDevice, 
    orientation, 
    screenSize,
    getMobileClasses,
    triggerHapticFeedback 
  } = useMobileOptimization({
    enablePinchZoom: true,
    enablePan: true,
    enableRotate: true,
    enableTap: true,
    enableDoubleTap: true,
    onDoubleTap: () => {
      // Double tap to reset camera
      if (controlsRef.current) {
        controlsRef.current.reset()
        triggerHapticFeedback('light')
      }
    }
  })
  
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
    const distance = (diagonal * 1.3) / Math.tan(fovRadians / 2)

    // Use an isometric viewing direction so the crate is immediately readable
    const isoDirection: [number, number, number] = [1.25, 1, 1.1]
    const directionLength = Math.hypot(...isoDirection)
    const scale = distance / directionLength

    return [
      isoDirection[0] * scale,
      isoDirection[1] * scale,
      isoDirection[2] * scale
    ] as [number, number, number]
  }, [dimensions])

  const controlTarget = useMemo(() => [
    0,
    dimensions.overallHeight / 2,
    0
  ] as [number, number, number], [dimensions])
  
  // Reset camera to optimal position when component mounts
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(...controlTarget)
      controlsRef.current.object.position.set(...cameraPosition)
      controlsRef.current.update()
      controlsRef.current.saveState()
    }
  }, [cameraPosition, controlTarget])
  
  return (
    <div className={`${className} ${getMobileClasses()}`} role="img" aria-label="3D Crate Visualization" tabIndex={0}>
      <Canvas 
        camera={{ 
          position: cameraPosition, 
          fov: isMobile ? 45 : 40, // Slightly wider FOV on mobile
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: !isMobile, // Disable antialiasing on mobile for better performance
          alpha: false,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: !isMobile // Disable on mobile for better performance
        }}
        performance={{ 
          min: isMobile ? 0.6 : 0.8, // Lower minimum FPS on mobile
          max: 1.0, // Target 60fps
          debounce: isMobile ? 300 : 200 // Longer debounce on mobile
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower DPR on mobile for better performance
      >
        <Suspense fallback={<LoadingFallback />}>
          <color attach="background" args={[isMobile ? '#f5f7fb' : '#eef1f7']} />
          <fog attach="fog" args={[isMobile ? '#f5f7fb' : '#eef1f7', 80, 200]} />
          {/* Optimized professional lighting setup */}
          <ambientLight intensity={isMobile ? 0.8 : 0.6} color={0xffffff} />
          <hemisphereLight
            intensity={isMobile ? 0.6 : 0.5}
            args={[0xf5f3ea, 0x4f5d75, 0.6]}
          />
          <directionalLight
            position={[35, 40, 20]}
            intensity={isMobile ? 1.25 : 1.6}
            castShadow={!isMobile} // Disable shadows on mobile
            shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]} // Smaller shadow map on mobile
            shadow-camera-far={150}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          <directionalLight
            position={[-25, 25, -15]}
            intensity={isMobile ? 0.5 : 0.75}
            color={0xfdf6ec}
          />
          <pointLight position={[0, 18, 10]} intensity={isMobile ? 0.3 : 0.5} color={0xffffff} />
          <Environment preset="city" background={false} />
          
          {/* CAD Model Components */}
          <CrateAssembly 
            config={config}
            dimensions={dimensions}
            showExploded={showExploded}
          />
          
          {/* PMI Annotations - Lazy loaded */}
          {showPMI && (
            <Suspense fallback={null}>
            <PMIAnnotations
              config={config}
              dimensions={dimensions}
              showPMI={showPMI}
              showAdvancedInfo={true}
            />
            </Suspense>
          )}
          
          {/* Component Metadata - Lazy loaded */}
          {enableMeasurement && (
            <Suspense fallback={null}>
              <ComponentMetadata 
                config={config} 
                dimensions={dimensions} 
                showMetadata={enableMeasurement} 
              />
            </Suspense>
          )}
          
          {/* Preload assets for better performance */}
          <Preload all />
          
          {/* Performance Monitor */}
          {showPerformanceStats && (
            <Suspense fallback={null}>
              <PerformanceMonitor enabled={true} showStats={true} />
            </Suspense>
          )}
          
          {/* Interactive Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true} 
            enableRotate={true}
            maxDistance={cameraPosition[0] * (isMobile ? 6 : 8)} // Reduced zoom out on mobile
            minDistance={Math.max(dimensions.overallLength, dimensions.overallWidth, dimensions.overallHeight) * (isMobile ? 0.3 : 0.5)} // Closer zoom on mobile
            enableDamping={true}
            dampingFactor={isMobile ? 0.12 : 0.08} // More damping on mobile for smoother feel
            screenSpacePanning={isMobile} // Enable screen space panning on mobile
            autoRotate={false}
            autoRotateSpeed={0.5}
            target={controlTarget}
            // Performance optimizations
            makeDefault={true}
            // Mobile-specific touch settings
            touches={{
              ONE: isMobile ? 1 : 1, // Single touch for rotation
              TWO: isMobile ? 2 : 2, // Two touches for zoom/pan
              THREE: isMobile ? 0 : 0 // Disable three-finger gestures on mobile
            }}
            // Mobile-specific sensitivity
            rotateSpeed={isMobile ? 0.8 : 1.0}
            zoomSpeed={isMobile ? 0.8 : 1.0}
            panSpeed={isMobile ? 0.8 : 1.0}
            // Mobile-specific limits
            maxPolarAngle={isMobile ? Math.PI * 0.8 : Math.PI} // Limit vertical rotation on mobile
            minPolarAngle={isMobile ? Math.PI * 0.2 : 0} // Prevent going under the model on mobile
          />
          
          {/* Professional grid and background */}
          <gridHelper 
            args={[
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 2, 
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 2, 
              0xb5bcc9,
              0x9aa3b5
            ]} 
            position={[0, -0.1, 0]} 
          />
          <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 3, 
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 3
            ]} />
            <meshLambertMaterial color={0xf6f6f8} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  )
})
