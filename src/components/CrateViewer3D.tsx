'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Html, Sphere, Line } from '@react-three/drei';
import { CrateConfiguration } from '@/types/crate';
import { useLogsStore } from '@/store/logs-store';
import { useEffect, useState, useMemo, memo } from 'react';
// Simple, correct geometry implementation
import {
  buildSimpleCrateGeometry,
  scaleForVisualization,
  INCH_TO_3D,
} from '@/utils/geometry/simple-crate-geometry';
import { CoordinateAxes } from './CoordinateAxes';
import { MeasurementLines } from './MeasurementLines';
import { validateCrateConfiguration, isValidForRendering } from '@/utils/input-validation';
import { SHARED_MATERIALS } from '@/utils/materials';
import { usePerformanceMonitor } from '@/utils/performance-monitor';
import { useFrame, useThree } from '@react-three/fiber';
import { validateCoGStability } from '@/services/cog-calculator';

interface CrateViewer3DProps {
  configuration: CrateConfiguration | null;
}

const CrateModel = memo(function CrateModel({
  config,
  _explodeFactor = 0,
  showFaceLabels = true,
}: {
  config: CrateConfiguration;
  _explodeFactor?: number;
  showFaceLabels?: boolean;
}) {
  // Build and scale geometry
  const geometryInches = buildSimpleCrateGeometry(config);
  const geometry = scaleForVisualization(geometryInches);

  // Calculate CoG stability for visualization
  const cogStability = useMemo(() => {
    if (config.centerOfGravity?.combinedCoG) {
      return validateCoGStability(config.centerOfGravity.combinedCoG, config.dimensions);
    }
    return null;
  }, [config.centerOfGravity, config.dimensions]);

  return (
    <group position={[0, 0, 0]}>
      {/* The origin is now at the center of the crate floor. All component positions are relative to this. */}
      {/* Skids */}
      {geometry.skids.map((block, i) => (
        <Box
          key={`skid-${i}`}
          args={block.dimensions}
          position={block.position}
          material={SHARED_MATERIALS.SKID_WOOD}
        />
      ))}

      {/* Floor */}
      <Box
        args={geometry.floor.dimensions}
        position={geometry.floor.position}
        material={SHARED_MATERIALS.FLOORBOARD_STANDARD}
      />

      {/* Panels - properly oriented as walls */}
      <Box
        args={geometry.panels.front.dimensions}
        position={geometry.panels.front.position}
        material={SHARED_MATERIALS.SIDE_PANEL}
      />
      <Box
        args={geometry.panels.back.dimensions}
        position={geometry.panels.back.position}
        material={SHARED_MATERIALS.SIDE_PANEL}
      />
      <Box
        args={geometry.panels.left.dimensions}
        position={geometry.panels.left.position}
        material={SHARED_MATERIALS.SIDE_PANEL}
      />
      <Box
        args={geometry.panels.right.dimensions}
        position={geometry.panels.right.position}
        material={SHARED_MATERIALS.SIDE_PANEL}
      />
      <Box
        args={geometry.panels.top.dimensions}
        position={geometry.panels.top.position}
        material={SHARED_MATERIALS.SIDE_PANEL}
      />
      {/* Panel Labels - Balloon Style */}
      {showFaceLabels &&
        (() => {
          const { width, length, height } = config.dimensions;
          const maxDim = Math.max(width, length, height);

          // Calculate proportional offset and font size - much smaller and further away
          const labelOffset = Math.max(15, Math.min(30, maxDim * 0.5));
          const fontSize = Math.max(9, Math.min(11, 9 + (maxDim / 200) * 2));
          const distanceFactor = Math.max(15, Math.min(25, 15 + (maxDim / 100) * 10));

          const labels: {
            text: string;
            pos: [number, number, number];
            lineEnd?: [number, number, number];
          }[] = [
            {
              text: 'Front',
              pos: [0, (length / 2 + labelOffset) * INCH_TO_3D, (height / 2) * INCH_TO_3D],
              lineEnd: [0, (length / 2 + 1) * INCH_TO_3D, (height / 2) * INCH_TO_3D],
            },
            {
              text: 'Back',
              pos: [0, (-length / 2 - labelOffset) * INCH_TO_3D, (height / 2) * INCH_TO_3D],
              lineEnd: [0, (-length / 2 - 1) * INCH_TO_3D, (height / 2) * INCH_TO_3D],
            },
            {
              text: 'Left',
              pos: [(-width / 2 - labelOffset) * INCH_TO_3D, 0, (height / 2) * INCH_TO_3D],
              lineEnd: [(-width / 2 - 1) * INCH_TO_3D, 0, (height / 2) * INCH_TO_3D],
            },
            {
              text: 'Right',
              pos: [(width / 2 + labelOffset) * INCH_TO_3D, 0, (height / 2) * INCH_TO_3D],
              lineEnd: [(width / 2 + 1) * INCH_TO_3D, 0, (height / 2) * INCH_TO_3D],
            },
            {
              text: 'Top',
              pos: [0, 0, (height + labelOffset) * INCH_TO_3D],
              lineEnd: [0, 0, (height + 1) * INCH_TO_3D],
            },
          ];
          return (
            <>
              {labels.map((l) => (
                <group key={l.text}>
                  {/* Connecting line from label to face */}
                  {l.lineEnd && (
                    <Line
                      points={[l.lineEnd, l.pos]}
                      color="#94a3b8"
                      lineWidth={1}
                      opacity={0.4}
                      transparent
                    />
                  )}
                  {/* Balloon label */}
                  <Html position={l.pos} center distanceFactor={distanceFactor}>
                    <div
                      style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.85)',
                        color: 'white',
                        fontSize: `${fontSize}px`,
                        fontWeight: '500',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {l.text}
                    </div>
                  </Html>
                </group>
              ))}
            </>
          );
        })()}
      {/* Cleats */}
      {geometry.cleats.map((block, i) => (
        <Box
          key={`cleat-${i}`}
          args={block.dimensions}
          position={block.position}
          material={SHARED_MATERIALS.CLEAT_WOOD}
        />
      ))}

      {/* CoG Visualization */}
      {config.centerOfGravity?.combinedCoG && (
        <group>
          <Sphere
            args={[4 * INCH_TO_3D]} // 4 inch radius sphere
            position={[
              config.centerOfGravity.combinedCoG.x * INCH_TO_3D,
              config.centerOfGravity.combinedCoG.y * INCH_TO_3D,
              config.centerOfGravity.combinedCoG.z * INCH_TO_3D,
            ]}
          >
            <meshStandardMaterial
              color={
                cogStability?.isStable
                  ? '#22c55e' // green for stable
                  : cogStability && cogStability.stabilityScore > 50
                    ? '#eab308' // yellow for caution
                    : '#ef4444' // red for unstable
              }
              emissive={
                cogStability?.isStable
                  ? '#166534' // dark green
                  : cogStability && cogStability.stabilityScore > 50
                    ? '#a16207' // dark yellow
                    : '#991b1b' // dark red
              }
              emissiveIntensity={0.2}
            />
          </Sphere>

          {/* CoG Label */}
          <Html
            position={[
              config.centerOfGravity.combinedCoG.x * INCH_TO_3D,
              config.centerOfGravity.combinedCoG.y * INCH_TO_3D,
              (config.centerOfGravity.combinedCoG.z + 8) * INCH_TO_3D,
            ]}
            center
            distanceFactor={10}
          >
            <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
              CoG: ({config.centerOfGravity.combinedCoG.x.toFixed(1)},{' '}
              {config.centerOfGravity.combinedCoG.y.toFixed(1)},{' '}
              {config.centerOfGravity.combinedCoG.z.toFixed(1)})
            </div>
          </Html>
        </group>
      )}

      {/* Overall dimensions label - positioned behind and to the side */}
      <Html
        position={[
          config.dimensions.width * 0.8 * INCH_TO_3D,
          -(config.dimensions.length * 0.8) * INCH_TO_3D,
          config.dimensions.height * 0.3 * INCH_TO_3D,
        ]}
        center
        distanceFactor={25}
      >
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            color: 'white',
            padding: '2px 5px',
            borderRadius: '2px',
            fontSize: '9px',
            fontWeight: '400',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          {config.dimensions.length}&quot; × {config.dimensions.width}&quot; ×{' '}
          {config.dimensions.height}&quot;
        </div>
      </Html>
      {/* TODO: Add Klimp Fastener Visualization */}
      {/* TODO: Add Decal Visualization */}
    </group>
  );
});

// Simple camera positioning
const AutoFitCamera = ({ config }: { config: CrateConfiguration }) => {
  const { camera } = useThree();

  useEffect(() => {
    const { width, length, height } = config.dimensions;
    const maxDim = Math.max(width, length, height);
    const distance = maxDim * INCH_TO_3D * 3;

    camera.position.set(distance, -distance, distance);
    camera.lookAt(0, 0, (height * INCH_TO_3D) / 2);
    camera.updateProjectionMatrix();
  }, [config, camera]);

  return null;
};

// PERFORMANCE: Internal performance monitoring component
const PerformanceTracker = memo(function PerformanceTracker() {
  const { recordFrame } = usePerformanceMonitor(process.env.NODE_ENV === 'development');

  useFrame(() => {
    const metrics = recordFrame();

    // Log performance warnings periodically (every 2 seconds)
    if (metrics && performance.now() % 2000 < 16) {
      const { fps, frameTime } = metrics;
      if (fps < 45) {
        console.warn(`Performance Warning: ${fps} FPS (${frameTime}ms per frame)`);
      }
    }
  });

  return null; // This component doesn't render anything
});

// PERFORMANCE: Memoized main component to prevent unnecessary re-renders of entire 3D scene
const CrateViewer3D = memo(function CrateViewer3D({ configuration }: CrateViewer3DProps) {
  const { logInfo, logDebug, logWarning, logError } = useLogsStore();
  const [explodeFactor, setExplodeFactor] = useState(0); // 0-100%
  const [renderError, setRenderError] = useState<string | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showFaceLabels, setShowFaceLabels] = useState(true);

  // PERFORMANCE: Memoize validation to avoid re-validation on every render
  const { validatedConfig, canRender } = useMemo(() => {
    try {
      const config = validateCrateConfiguration(configuration);
      const canRenderResult = isValidForRendering(config);
      return {
        validatedConfig: config,
        canRender: canRenderResult,
      };
    } catch (error) {
      console.error('Configuration validation error:', error);
      setRenderError(
        `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        validatedConfig: null,
        canRender: false,
      };
    }
  }, [configuration]);

  // Auto-calculate camera position based on crate dimensions for optimal viewing distance
  const cameraPosition = [3, -3, 2]; // starter; AutoFitCamera will override

  useEffect(() => {
    if (validatedConfig && canRender) {
      logDebug(
        'render',
        '3D scene updated',
        `Rendering crate: ${validatedConfig.dimensions.length}x${validatedConfig.dimensions.width}x${validatedConfig.dimensions.height} inches`,
        'CrateViewer3D'
      );
    } else if (!canRender && configuration) {
      logWarning(
        'render',
        'Invalid configuration values detected, using defaults',
        undefined,
        'CrateViewer3D'
      );
    } else {
      logWarning('render', 'No configuration provided for 3D viewer', undefined, 'CrateViewer3D');
    }
  }, [validatedConfig, canRender, configuration, logDebug, logWarning]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg relative">
      {/* Explode View Controls */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg z-10 space-y-3">
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={() => {
              try {
                setExplodeFactor(explodeFactor === 0 ? 100 : 0);
                logInfo(
                  'render',
                  `Explode view ${explodeFactor === 0 ? 'enabled' : 'disabled'}`,
                  undefined,
                  'CrateViewer3D'
                );
              } catch (error) {
                console.error('Explode view toggle error:', error);
                logError(
                  'render',
                  'Failed to toggle explode view',
                  error instanceof Error ? error.message : 'Unknown error',
                  'CrateViewer3D'
                );
              }
            }}
            className="px-3 py-1 bg-blue-700 text-white text-sm rounded hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors"
            aria-label={
              explodeFactor === 0 ? 'Enable exploded crate view' : 'Reset to assembled crate view'
            }
          >
            {explodeFactor === 0 ? 'Explode View' : 'Reset View'}
          </button>
        </div>
        {explodeFactor > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700" htmlFor="explodeRange">
              Explode: {explodeFactor}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={explodeFactor}
              onChange={(e) => {
                try {
                  setExplodeFactor(Number(e.target.value));
                } catch (error) {
                  console.error('Explode factor change error:', error);
                }
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              id="explodeRange"
              aria-label="Exploded view separation percentage"
            />
          </div>
        )}
        {/* Display Toggles */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showMeasurements"
              checked={showMeasurements}
              onChange={(e) => setShowMeasurements(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showMeasurements" className="text-xs font-medium text-gray-700">
              Show Measurements
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showFaceLabels"
              checked={showFaceLabels}
              onChange={(e) => setShowFaceLabels(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showFaceLabels" className="text-xs font-medium text-gray-700">
              Show Face Labels
            </label>
          </div>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-[10px] leading-tight">
          {[
            ['Skids', '#5D3A1A'],
            ['Floor', '#A0662B'],
            ['Panels', '#CFAF72'],
            ['Cleats', '#4A2F14'],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-sm border"
                style={{ backgroundColor: color as string }}
              />
              <span className="text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {renderError && (
        <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm p-3 rounded-lg max-w-xs z-10">
          <h4 className="font-semibold text-red-100 mb-1">Render Error</h4>
          <p className="text-sm text-red-200">{renderError}</p>
        </div>
      )}

      <Canvas
        // Ensure canvas always fills available space
        style={{ width: '100%', height: '100%' }}
        camera={{
          position: cameraPosition as [number, number, number],
          fov: 50,
          up: [0, 0, 1],
        }}
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onCreated={(state) => {
          try {
            // PERFORMANCE: Enable better performance and compatibility
            // Target: 60 FPS rendering with automatic fallback for low-end devices
            if (process.env.NODE_ENV === 'development') {
              console.log('3D Performance Target: 60 FPS (<16.67ms per frame)');
            }
            // Ensure the renderer is properly initialized
            state.gl.setPixelRatio(window.devicePixelRatio);
            logInfo('render', '3D canvas initialized', 'WebGL renderer ready', 'CrateViewer3D');
          } catch (error) {
            console.error('WebGL initialization error:', error);
            setRenderError(
              `WebGL initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            logError(
              'render',
              'WebGL initialization failed',
              error instanceof Error ? error.message : 'Unknown error',
              'CrateViewer3D'
            );
          }
        }}
        onError={(error) => {
          console.error('Canvas error:', error);
          setRenderError(
            `Canvas error: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
          logError(
            'render',
            'Canvas error occurred',
            error instanceof Error ? error.message : 'Unknown error',
            'CrateViewer3D'
          );
        }}
      >
        {/* PERFORMANCE: Real-time performance monitoring */}
        <PerformanceTracker />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Grid args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} />
        <group position={[0, 0, 0]}>
          <CoordinateAxes size={1} />
        </group>
        {validatedConfig && (
          <MeasurementLines
            width={validatedConfig.dimensions.width}
            depth={validatedConfig.dimensions.length}
            height={validatedConfig.dimensions.height}
            visible={showMeasurements}
          />
        )}

        {validatedConfig && canRender ? (
          (() => {
            return (
              <>
                <AutoFitCamera config={validatedConfig} />
                <CrateModel
                  config={validatedConfig}
                  _explodeFactor={explodeFactor}
                  showFaceLabels={showFaceLabels}
                />
              </>
            );
          })()
        ) : (
          <Html position={[0, 0, 2]} center distanceFactor={10}>
            <div style={{ color: 'gray', fontSize: '20px', fontWeight: 'bold' }}>
              {renderError ? 'Error loading 3D preview' : 'Configure crate to see 3D preview'}
            </div>
          </Html>
        )}
      </Canvas>
    </div>
  );
});

export default CrateViewer3D;
