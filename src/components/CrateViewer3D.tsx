'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Html, Sphere } from '@react-three/drei';
import { CrateConfiguration, Block } from '@/types/crate';
import { useLogsStore } from '@/store/logs-store';
import { useEffect, useState, useMemo, memo } from 'react';
// Geometry now centralized in buildCrateGeometry (outputs meters)
import { buildCrateGeometry } from '@/utils/geometry/crate-geometry';
import { fitCameraToBox } from '@/utils/geometry/camera-fit';
import { CoordinateAxes } from './CoordinateAxes';
import { validateCrateConfiguration, isValidForRendering } from '@/utils/input-validation';
import { INCHES_TO_MM, MM_TO_METERS, PANEL_THICKNESS } from '@/lib/constants';
import { SHARED_MATERIALS } from '@/utils/materials';
import { usePerformanceMonitor } from '@/utils/performance-monitor';
import { useFrame, useThree } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';
import { validateCoGStability } from '@/services/cog-calculator';

interface CrateViewer3DProps {
  configuration: CrateConfiguration | null;
}

const CrateModel = memo(function CrateModel({
  config,
  geometry,
  _explodeFactor = 0,
}: {
  config: CrateConfiguration;
  geometry: ReturnType<typeof buildCrateGeometry>;
  _explodeFactor?: number;
}) {
  interface OrientedBlock extends Block {
    orientation?: 'frontback' | 'leftright' | 'top';
  }

  const categorized = geometry;

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
      {categorized.skids.map((block, i) => (
        <Box
          key={`skid-${i}`}
          args={[
            (block.dimensions[0] * INCHES_TO_MM) / MM_TO_METERS,
            (block.dimensions[1] * INCHES_TO_MM) / MM_TO_METERS,
            (block.dimensions[2] * INCHES_TO_MM) / MM_TO_METERS,
          ]}
          position={[
            (block.position[0] * INCHES_TO_MM) / MM_TO_METERS,
            (block.position[1] * INCHES_TO_MM) / MM_TO_METERS,
            (block.position[2] * INCHES_TO_MM) / MM_TO_METERS,
          ]}
          material={SHARED_MATERIALS.SKID_WOOD}
        />
      ))}
      {/* Floorboards */}
      {categorized.floorboards.map((block, i) => (
        <Box
          key={`floor-${i}`}
          args={[
            (block.dimensions[0] * INCHES_TO_MM) / MM_TO_METERS,
            (block.dimensions[1] * INCHES_TO_MM) / MM_TO_METERS,
            (block.dimensions[2] * INCHES_TO_MM) / MM_TO_METERS,
          ]}
          position={[
            (block.position[0] * INCHES_TO_MM) / MM_TO_METERS,
            (block.position[1] * INCHES_TO_MM) / MM_TO_METERS,
            (block.position[2] * INCHES_TO_MM) / MM_TO_METERS,
          ]}
          material={SHARED_MATERIALS.FLOORBOARD_STANDARD}
        />
      ))}
      {/* Panels */}
      {categorized.panels.map((block, i) => {
        // Re-map dimensions based on orientation so thickness aligns with panel normal
        const thickness = (0.75 * INCHES_TO_MM) / MM_TO_METERS;
        let args: [number, number, number];
        const dim0 = (block.dimensions[0] * INCHES_TO_MM) / MM_TO_METERS;
        const dim1 = (block.dimensions[1] * INCHES_TO_MM) / MM_TO_METERS;
        if ((block as OrientedBlock).orientation === 'frontback') {
          // X = panel width, Y = thickness, Z = panel height
          args = [dim0, thickness, dim1];
        } else if ((block as OrientedBlock).orientation === 'leftright') {
          // X = thickness, Y = panel length, Z = panel height (dim0 represents length for side panels)
          args = [thickness, dim0, dim1];
        } else {
          // top panel: X = width, Y = length, Z = thickness (already dim0=width, dim1=length)
          args = [dim0, dim1, thickness];
        }
        return (
          <Box
            key={`panel-${i}`}
            args={args}
            position={[
              (block.position[0] * INCHES_TO_MM) / MM_TO_METERS,
              (block.position[1] * INCHES_TO_MM) / MM_TO_METERS,
              (block.position[2] * INCHES_TO_MM) / MM_TO_METERS,
            ]}
            material={SHARED_MATERIALS.SIDE_PANEL}
          />
        );
      })}
      {/* Panel Labels */}
      {(() => {
        const { width, length, height } = config.dimensions;
        const labels: { text: string; pos: [number, number, number] }[] = [
          {
            text: 'Front',
            pos: [
              0,
              ((length / 2 + 1) * INCHES_TO_MM) / MM_TO_METERS,
              ((height / 2) * INCHES_TO_MM) / MM_TO_METERS,
            ],
          },
          {
            text: 'Back',
            pos: [
              0,
              ((-length / 2 - 1) * INCHES_TO_MM) / MM_TO_METERS,
              ((height / 2) * INCHES_TO_MM) / MM_TO_METERS,
            ],
          },
          {
            text: 'Left',
            pos: [
              ((-width / 2 - 1) * INCHES_TO_MM) / MM_TO_METERS,
              0,
              ((height / 2) * INCHES_TO_MM) / MM_TO_METERS,
            ],
          },
          {
            text: 'Right',
            pos: [
              ((width / 2 + 1) * INCHES_TO_MM) / MM_TO_METERS,
              0,
              ((height / 2) * INCHES_TO_MM) / MM_TO_METERS,
            ],
          },
          { text: 'Top', pos: [0, 0, ((height + 1) * INCHES_TO_MM) / MM_TO_METERS] },
        ];
        return labels.map((l) => (
          <Html key={l.text} position={l.pos} center distanceFactor={25}>
            <div className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm tracking-wide">
              {l.text}
            </div>
          </Html>
        ));
      })()}
      {/* Cleats */}
      {categorized.cleats.map((block, i) => (
        <Box
          key={`cleat-${i}`}
          args={[
            (block.dimensions[0] * INCHES_TO_MM) / MM_TO_METERS,
            (block.dimensions[1] * INCHES_TO_MM) / MM_TO_METERS,
            (block.dimensions[2] * INCHES_TO_MM) / MM_TO_METERS,
          ]}
          position={[
            (block.position[0] * INCHES_TO_MM) / MM_TO_METERS,
            (block.position[1] * INCHES_TO_MM) / MM_TO_METERS,
            (block.position[2] * INCHES_TO_MM) / MM_TO_METERS,
          ]}
          material={SHARED_MATERIALS.CLEAT_WOOD}
        />
      ))}

      {/* CoG Visualization */}
      {config.centerOfGravity?.combinedCoG && (
        <group>
          <Sphere
            args={[0.1]} // 0.1 meter radius (about 4 inches)
            position={[
              (config.centerOfGravity.combinedCoG.x * INCHES_TO_MM) / MM_TO_METERS,
              (config.centerOfGravity.combinedCoG.y * INCHES_TO_MM) / MM_TO_METERS,
              (config.centerOfGravity.combinedCoG.z * INCHES_TO_MM) / MM_TO_METERS,
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
              (config.centerOfGravity.combinedCoG.x * INCHES_TO_MM) / MM_TO_METERS,
              (config.centerOfGravity.combinedCoG.y * INCHES_TO_MM) / MM_TO_METERS,
              (config.centerOfGravity.combinedCoG.z * INCHES_TO_MM) / MM_TO_METERS + 0.2,
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

      <Html position={[0, 0, config.dimensions.height + 1]}>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
          {config.dimensions.length}&quot; x {config.dimensions.width}&quot; x{' '}
          {config.dimensions.height}&quot;
        </div>
      </Html>
      {/* TODO: Add Klimp Fastener Visualization */}
      {/* TODO: Add Decal Visualization */}
    </group>
  );
});

// Automatically fits the camera to the crate dimensions so the model isn't tiny on first load
const AutoFitCamera = ({
  aabb,
  enabled,
}: {
  aabb: ReturnType<typeof buildCrateGeometry>['aabb'] | null;
  enabled: boolean;
}) => {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!enabled || !aabb) return;
    const perspective = camera as PerspectiveCamera;
    perspective.aspect = size.width / size.height;
    fitCameraToBox(perspective, aabb, { margin: 0.2, minDistance: 0.5 });
  }, [aabb, enabled, camera, size]);
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
          <CoordinateAxes size={3} />
        </group>

        {validatedConfig && canRender ? (
          (() => {
            const geometry = buildCrateGeometry(validatedConfig);
            return (
              <>
                <AutoFitCamera aabb={geometry.aabb} enabled={true} />
                <CrateModel
                  config={validatedConfig}
                  geometry={geometry}
                  _explodeFactor={explodeFactor}
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
