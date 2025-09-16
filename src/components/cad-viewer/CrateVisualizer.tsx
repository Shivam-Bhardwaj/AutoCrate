'use client'

import { Suspense, useMemo, useRef, useEffect, memo, lazy, useState, useCallback } from 'react'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Preload } from '@react-three/drei'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { CrateConfiguration } from '@/types/crate'
import { calculateCrateDimensions } from '@/lib/domain/calculations'
import { CrateAssembly } from './CrateAssembly'
import { LoadingFallback } from './LoadingFallback'
import { useMobileOptimization } from '@/hooks/useMobileOptimization'
import { generateComponentMetadata } from './componentMetadata'

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
  const componentMetadata = useMemo(() => generateComponentMetadata(config, dimensions), [config, dimensions])
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null)
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null)
  
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
    const distance = (diagonal * 2.5) / Math.tan(fovRadians / 2) // 2.5x for better framing - shows full crate
    
    // Position camera at an optimal angle for professional 3D view
    const angle = Math.PI / 4 // 45 degrees for better perspective
    const x = distance * Math.cos(angle)
    const y = distance * 0.8 // Higher position for better overview
    const z = distance * Math.sin(angle)
    
    return [x, y, z] as [number, number, number]
  }, [dimensions])
  
  // Reset camera to optimal position when component mounts
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }, [cameraPosition])

  useEffect(() => {
    if (!enableMeasurement) {
      setHoveredComponentId(null)
      setPointerPosition(null)
    }
  }, [enableMeasurement])

  const handleComponentPointerOver = useCallback(
    (componentId: string, event: ThreeEvent<PointerEvent>) => {
      if (!enableMeasurement) return
      event.stopPropagation()
      setHoveredComponentId(componentId)
      setPointerPosition({ x: event.clientX, y: event.clientY })
    },
    [enableMeasurement]
  )

  const handleComponentPointerMove = useCallback(
    (_componentId: string, event: ThreeEvent<PointerEvent>) => {
      if (!enableMeasurement) return
      event.stopPropagation()
      setPointerPosition({ x: event.clientX, y: event.clientY })
    },
    [enableMeasurement]
  )

  const handleComponentPointerOut = useCallback(
    (componentId: string, event: ThreeEvent<PointerEvent>) => {
      if (!enableMeasurement) return
      event.stopPropagation()
      setPointerPosition(null)
      setHoveredComponentId(current => (current === componentId ? null : current))
    },
    [enableMeasurement]
  )
  
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
          {/* Optimized professional lighting setup */}
          <ambientLight intensity={isMobile ? 0.6 : 0.4} />
          <directionalLight
            position={[25, 25, 15]} 
            intensity={isMobile ? 1.2 : 1.5}
            castShadow={!isMobile} // Disable shadows on mobile
            shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]} // Smaller shadow map on mobile
            shadow-camera-far={150} 
            shadow-camera-left={-30} 
            shadow-camera-right={30} 
            shadow-camera-top={30} 
            shadow-camera-bottom={-30}
          />
          <directionalLight 
            position={[-15, 15, -10]} 
            intensity={isMobile ? 0.4 : 0.6} 
            color={0xffffff}
          />
          <pointLight position={[0, 20, 0]} intensity={isMobile ? 0.2 : 0.4} color={0xffffff} />
          
          {/* CAD Model Components */}
          <CrateAssembly
            config={config}
            dimensions={dimensions}
            showExploded={showExploded}
            onComponentPointerOver={handleComponentPointerOver}
            onComponentPointerMove={handleComponentPointerMove}
            onComponentPointerOut={handleComponentPointerOut}
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
                components={componentMetadata}
                showMetadata={enableMeasurement}
                hoveredComponentId={hoveredComponentId}
                pointerPosition={pointerPosition}
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
            target={[0, 0, 0]}
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
})
