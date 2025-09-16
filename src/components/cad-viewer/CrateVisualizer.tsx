'use client'

import { Suspense, useMemo, useRef, useEffect, memo, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload, Environment, ContactShadows } from '@react-three/drei'
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
  className = 'h-full w-full'
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
      if (controlsRef.current) {
        controlsRef.current.reset()
        triggerHapticFeedback('light')
      }
    }
  })

  // Calculate optimal camera position to fit entire crate in view
  const cameraPosition = useMemo(() => {
    const halfWidth = dimensions.overallWidth / 2
    const halfLength = dimensions.overallLength / 2
    const halfHeight = dimensions.overallHeight / 2

    const diagonal = Math.sqrt(
      halfWidth * halfWidth +
      halfLength * halfLength +
      halfHeight * halfHeight
    )

    const fovRadians = (40 * Math.PI) / 180
    const distance = (diagonal * 1.3) / Math.tan(fovRadians / 2)

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

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(...controlTarget)
      controlsRef.current.object.position.set(...cameraPosition)
      controlsRef.current.update()
      controlsRef.current.saveState()
    }
  }, [cameraPosition, controlTarget])

  const backgroundColor = useMemo(() => (isMobile ? '#f7f9fc' : '#eef2fa'), [isMobile])
  const fogSettings = useMemo(
    () => ({
      near: isMobile ? 70 : 80,
      far: isMobile ? 180 : 220
    }),
    [isMobile]
  )

  return (
    <div className={`${className} ${getMobileClasses()}`} role="img" aria-label="3D Crate Visualization" tabIndex={0}>
      <Canvas
        camera={{
          position: cameraPosition,
          fov: isMobile ? 45 : 40,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: !isMobile
        }}
        performance={{
          min: isMobile ? 0.6 : 0.8,
          max: 1.0,
          debounce: isMobile ? 300 : 200
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        <Suspense fallback={<LoadingFallback />}>
          <color attach="background" args={[backgroundColor]} />
          <fog attach="fog" args={[backgroundColor, fogSettings.near, fogSettings.far]} />

          {/* Optimized professional lighting setup */}
          <ambientLight intensity={isMobile ? 0.75 : 0.65} color={0xffffff} />
          <hemisphereLight intensity={isMobile ? 0.65 : 0.55} args={[0xf2f6ff, 0x4f5d75, 0.65]} />
          <directionalLight
            position={[35, 40, 20]}
            intensity={isMobile ? 1.2 : 1.45}
            castShadow={!isMobile}
            shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]}
            shadow-camera-far={150}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          <directionalLight
            position={[-25, 25, -15]}
            intensity={isMobile ? 0.45 : 0.7}
            color={0xfdf6ec}
          />
          <spotLight
            position={[10, 45, 35]}
            angle={0.4}
            penumbra={0.5}
            intensity={isMobile ? 0.35 : 0.55}
            castShadow={!isMobile}
          />
          <pointLight position={[0, 22, 10]} intensity={isMobile ? 0.28 : 0.45} color={0xffffff} />
          <Environment preset="apartment" background={false} />

          {/* CAD Model Components */}
          <CrateAssembly config={config} dimensions={dimensions} showExploded={showExploded} />

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
              <ComponentMetadata config={config} dimensions={dimensions} showMetadata={enableMeasurement} />
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
            maxDistance={cameraPosition[0] * (isMobile ? 6 : 8)}
            minDistance={Math.max(dimensions.overallLength, dimensions.overallWidth, dimensions.overallHeight) * (isMobile ? 0.3 : 0.5)}
            enableDamping={true}
            dampingFactor={isMobile ? 0.12 : 0.08}
            screenSpacePanning={isMobile}
            autoRotate={false}
            autoRotateSpeed={0.5}
            target={controlTarget}
            makeDefault={true}
            touches={{
              ONE: isMobile ? 1 : 1,
              TWO: isMobile ? 2 : 2,
              THREE: isMobile ? 0 : 0
            }}
            rotateSpeed={isMobile ? 0.8 : 1.0}
            zoomSpeed={isMobile ? 0.8 : 1.0}
            panSpeed={isMobile ? 0.8 : 1.0}
            maxPolarAngle={isMobile ? Math.PI * 0.8 : Math.PI}
            minPolarAngle={isMobile ? Math.PI * 0.2 : 0}
          />

          {/* Professional grid and background */}
          <gridHelper
            args={[
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 2,
              Math.max(dimensions.overallLength, dimensions.overallWidth) * 2,
              0xbfc6d6,
              0xa5aec2
            ]}
            position={[0, -0.1, 0]}
          />
          <ContactShadows
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, -0.99, 0]}
            opacity={isMobile ? 0.45 : 0.6}
            width={Math.max(dimensions.overallLength, dimensions.overallWidth) * 1.2}
            height={Math.max(dimensions.overallLength, dimensions.overallWidth) * 1.2}
            blur={isMobile ? 2.2 : 2.6}
            far={25}
          />
          <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry
              args={[
                Math.max(dimensions.overallLength, dimensions.overallWidth) * 3,
                Math.max(dimensions.overallLength, dimensions.overallWidth) * 3
              ]}
            />
            <meshLambertMaterial color={0xf5f7fb} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  )
})
