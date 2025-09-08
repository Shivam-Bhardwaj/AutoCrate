'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Html, Sphere } from '@react-three/drei';
import { CrateConfiguration } from '@/types/crate';
import { useLogsStore } from '@/store/logs-store';
import { useEffect, useState, useMemo, memo } from 'react';
// Simple, correct geometry implementation
import {
  buildSimpleCrateGeometry,
  scaleForVisualization,
  INCH_TO_3D,
  PANEL_THICKNESS,
} from '@/utils/geometry/simple-crate-geometry';
import { CoordinateAxes } from './CoordinateAxes';
import { MeasurementLines } from './MeasurementLines';
import { validateCrateConfiguration, isValidForRendering } from '@/utils/input-validation';
import { SHARED_MATERIALS } from '@/utils/materials';
import { usePerformanceMonitor } from '@/utils/performance-monitor';
import { useFrame, useThree } from '@react-three/fiber';
import { validateCoGStability } from '@/services/cog-calculator';
import { calculateSkidConfiguration } from '@/utils/skid-calculations';

interface CrateViewer3DProps {
  configuration: CrateConfiguration | null;
}

// Component visibility state
interface ComponentVisibility {
  skids: boolean;
  floor: boolean;
  panels: boolean;
  cleats: boolean;
  cog: boolean;
}

// Hover state for tooltips
interface HoverState {
  component: string | null;
  dimensions: [number, number, number] | null;
  position: [number, number, number] | null;
}

// Hover tooltip component
const HoverTooltip = ({ hoverState }: { hoverState: HoverState }) => {
  if (!hoverState.component || !hoverState.dimensions) return null;

  return (
    <Html
      position={hoverState.position || [0, 0, 0]}
      center
      distanceFactor={10}
      style={{ pointerEvents: 'none' }}
    >
      <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg border border-gray-600">
        <div className="font-semibold capitalize">{hoverState.component}</div>
        <div className="text-xs text-gray-300">
          {Math.round(hoverState.dimensions[0])}" × {Math.round(hoverState.dimensions[1])}" × {Math.round(hoverState.dimensions[2])}"
        </div>
      </div>
    </Html>
  );
};

const CrateModel = memo(function CrateModel({
  config,
  _explodeFactor = 0,
  showFaceLabels = true,
  _showMeasurements = true,
  componentVisibility,
  onHover,
  onHoverEnd,
}: {
  config: CrateConfiguration;
  _explodeFactor?: number;
  showFaceLabels?: boolean;
  _showMeasurements?: boolean;
  componentVisibility: ComponentVisibility;
  onHover: (component: string, dimensions: [number, number, number], position: [number, number, number]) => void;
  onHoverEnd: () => void;
}) {
  // Build and scale geometry
  const skidConfig = useMemo(() => {
    if (config.weight?.product) {
      return calculateSkidConfiguration(config.dimensions, config.weight.product);
    }
    return undefined;
  }, [config.dimensions, config.weight?.product]);

  const geometryInches = buildSimpleCrateGeometry(config, skidConfig);
  const geometry = scaleForVisualization(geometryInches);
  // Explode view calculations
  const explodeDistance = 2 * INCH_TO_3D;
  const factor = _explodeFactor / 100;

  const frontPosition: [number, number, number] = [
    geometry.panels.front.position[0],
    geometry.panels.front.position[1] + factor * explodeDistance,
    geometry.panels.front.position[2]
  ];
  const backPosition: [number, number, number] = [
    geometry.panels.back.position[0],
    geometry.panels.back.position[1] - factor * explodeDistance,
    geometry.panels.back.position[2]
  ];
  const leftPosition: [number, number, number] = [
    geometry.panels.left.position[0] - factor * explodeDistance,
    geometry.panels.left.position[1],
    geometry.panels.left.position[2]
  ];
  const rightPosition: [number, number, number] = [
    geometry.panels.right.position[0] + factor * explodeDistance,
    geometry.panels.right.position[1],
    geometry.panels.right.position[2]
  ];
  const topPosition: [number, number, number] = [
    geometry.panels.top.position[0],
    geometry.panels.top.position[1],
    geometry.panels.top.position[2] + factor * explodeDistance
  ];

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
      {componentVisibility.skids && geometry.skids.map((block, i) => (
        <Box
          key={`skid-${i}`}
          args={block.dimensions}
          position={block.position}
          material={SHARED_MATERIALS.SKID_WOOD}
          onPointerOver={() => {
            // Show actual lumber dimensions: width × length × height
            const actualWidth = skidConfig ? skidConfig.dimensions.width : 3.5;
            const actualLength = config.dimensions.length; // Skid spans full crate length
            const actualHeight = skidConfig ? skidConfig.dimensions.height : 3.5;
            onHover('Skid', [actualWidth, actualLength, actualHeight], block.position);
          }}
          onPointerOut={onHoverEnd}
        />
      ))}

      {/* Floor */}
      {componentVisibility.floor && (
        <Box
          args={geometry.floor.dimensions}
          position={geometry.floor.position}
          material={SHARED_MATERIALS.FLOORBOARD_STANDARD}
          onPointerOver={() => onHover('Floor', geometry.floor.dimensions, geometry.floor.position)}
          onPointerOut={onHoverEnd}
        />
      )}

      {/* Panels - properly oriented as walls */}
      {componentVisibility.panels && (
        <>
          <Box
            args={geometry.panels.front.dimensions}
            position={frontPosition}
            material={SHARED_MATERIALS.SIDE_PANEL}
            onPointerOver={() => onHover('Front Panel', geometry.panels.front.dimensions, frontPosition)}
            onPointerOut={onHoverEnd}
          />
          <Box
            args={geometry.panels.back.dimensions}
            position={backPosition}
            material={SHARED_MATERIALS.SIDE_PANEL}
            onPointerOver={() => onHover('Back Panel', geometry.panels.back.dimensions, backPosition)}
            onPointerOut={onHoverEnd}
          />
          <Box
            args={geometry.panels.left.dimensions}
            position={leftPosition}
            material={SHARED_MATERIALS.SIDE_PANEL}
            onPointerOver={() => onHover('Left Panel', geometry.panels.left.dimensions, leftPosition)}
            onPointerOut={onHoverEnd}
          />
          <Box
            args={geometry.panels.right.dimensions}
            position={rightPosition}
            material={SHARED_MATERIALS.SIDE_PANEL}
            onPointerOver={() => onHover('Right Panel', geometry.panels.right.dimensions, rightPosition)}
            onPointerOut={onHoverEnd}
          />
          <Box
            args={geometry.panels.top.dimensions}
            position={topPosition}
            material={SHARED_MATERIALS.SIDE_PANEL}
            onPointerOver={() => onHover('Top Panel', geometry.panels.top.dimensions, topPosition)}
            onPointerOut={onHoverEnd}
          />
        </>
      )}
      {/* Front Face Label - Essential for orientation */}
      {showFaceLabels && (() => {
        const { width, length, height } = config.dimensions;
        const maxDim = Math.max(width, length, height);

        // Calculate proportional font size based on crate dimensions
        const fontSize = Math.max(8, Math.min(16, 8 + (maxDim / 100) * 2));
        const distanceFactor = Math.max(10, Math.min(20, 10 + (maxDim / 50) * 2));

        return (
          <Html
            position={[0, (PANEL_THICKNESS / 2) * INCH_TO_3D, (config.dimensions.height / 2) * INCH_TO_3D]}
            center
            distanceFactor={distanceFactor}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#1f2937',
                fontSize: `${fontSize}px`,
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: '3px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(0,0,0,0.1)',
                transform: 'rotateX(-5deg)',
              }}
            >
              FRONT
            </div>
          </Html>
        );
      })()}
      {/* Cleats */}
      {componentVisibility.cleats && geometry.cleats.map((block, i) => (
        <Box
          key={`cleat-${i}`}
          args={block.dimensions}
          position={block.position}
          material={SHARED_MATERIALS.CLEAT_WOOD}
          onPointerOver={() => onHover('Cleat', block.dimensions, block.position)}
          onPointerOut={onHoverEnd}
        />
      ))}

      {/* CoG Visualization */}
      {componentVisibility.cog && config.centerOfGravity?.combinedCoG && (
        <group>
          <Sphere
            args={[4 * INCH_TO_3D]} // 4 inch radius sphere
            position={[
              config.centerOfGravity.combinedCoG.x * INCH_TO_3D,
              config.centerOfGravity.combinedCoG.y * INCH_TO_3D,
              config.centerOfGravity.combinedCoG.z * INCH_TO_3D,
            ]}
            onPointerOver={() => {
              if (config.centerOfGravity?.combinedCoG) {
                onHover('Center of Gravity', [8, 8, 8], [
                  config.centerOfGravity.combinedCoG.x * INCH_TO_3D,
                  config.centerOfGravity.combinedCoG.y * INCH_TO_3D,
                  config.centerOfGravity.combinedCoG.z * INCH_TO_3D,
                ]);
              }
            }}
            onPointerOut={onHoverEnd}
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
    const distance = maxDim * INCH_TO_3D * 2.5; // Slightly closer for better view

    // Position camera to show correct axis directions when viewing from front
    // Camera positioned at [0, distance, distance] with Z-up shows:
    // - Positive X (red/Width) pointing right on screen
    // - Positive Y (green/Depth) pointing away from viewer (into screen)
    // - Positive Z (blue/Height) pointing up
    camera.position.set(0, distance, distance);
    camera.lookAt(0, 0, 0); // Look at origin (front-center of crate)
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
  const [showMeasurements, setShowMeasurements] = useState(false); // Hidden by default to reduce clutter
  const [showFaceLabels, setShowFaceLabels] = useState(true); // Show FRONT label by default for orientation
  const [showWCS, setShowWCS] = useState(true); // Show World Coordinate System by default
  
  // Component visibility state
  const [componentVisibility, setComponentVisibility] = useState<ComponentVisibility>({
    skids: true,
    floor: true,
    panels: true,
    cleats: true,
    cog: true,
  });
  
  // Hover state for tooltips
  const [hoverState, setHoverState] = useState<HoverState>({
    component: null,
    dimensions: null,
    position: null,
  });

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
    <div className="w-full h-full nx-viewport nx-grid-major relative">
      {/* Explode View Controls */}
      <div className="absolute top-4 left-4 nx-panel border border-nx-border p-3 rounded z-10 space-y-3">
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
            className="nx-button-primary text-xs"
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showWCS"
              checked={showWCS}
              onChange={(e) => setShowWCS(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showWCS" className="text-xs font-medium text-gray-700">
              Show WCS
            </label>
          </div>
          {/* Turn All Off Button */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                setShowMeasurements(false);
                setShowFaceLabels(false);
                setShowWCS(false);
                setExplodeFactor(0); // Reset to assembled view
                setComponentVisibility({
                  skids: false,
                  floor: false,
                  panels: false,
                  cleats: false,
                  cog: false,
                });
                logInfo('render', 'All display elements turned off', 'Clean view mode activated', 'CrateViewer3D');
              }}
              className="w-full px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 transition-colors"
              aria-label="Turn off all display elements for clean view"
            >
              Turn All Off
            </button>
            <button
              onClick={() => {
                setShowMeasurements(true);
                setShowFaceLabels(true);
                setShowWCS(true);
                setComponentVisibility({
                  skids: true,
                  floor: true,
                  panels: true,
                  cleats: true,
                  cog: true,
                });
                logInfo('render', 'All display elements turned on', 'Full detail view activated', 'CrateViewer3D');
              }}
              className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors"
              aria-label="Turn on all display elements for full detail view"
            >
              Turn All On
            </button>
          </div>
        </div>
        
        {/* Component Visibility Toggles */}
        <div className="space-y-2 border-t pt-2">
          <div className="text-xs font-semibold text-gray-700 mb-2">Components:</div>
          {Object.entries(componentVisibility).map(([component, isVisible]) => (
            <div key={component} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`show${component}`}
                checked={isVisible}
                onChange={(e) => setComponentVisibility(prev => ({
                  ...prev,
                  [component]: e.target.checked
                }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={`show${component}`} className="text-xs font-medium text-gray-700 capitalize">
                {component === 'cog' ? 'CoG' : component}
              </label>
            </div>
          ))}
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
          {showWCS && <CoordinateAxes size={1} />}
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
                  _showMeasurements={showMeasurements}
                  componentVisibility={componentVisibility}
                  onHover={(component, dimensions, position) => 
                    setHoverState({ component, dimensions, position })
                  }
                  onHoverEnd={() => setHoverState({ component: null, dimensions: null, position: null })}
                />
                <HoverTooltip hoverState={hoverState} />
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
