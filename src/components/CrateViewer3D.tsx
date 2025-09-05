'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Text, Html } from '@react-three/drei';
import { CrateConfiguration } from '@/types/crate';
import { useLogsStore } from '@/store/logs-store';
import { useEffect, useState } from 'react';
import { calculateFloorboardConfiguration } from '@/utils/floorboard-calculations';
import { calculateSkidConfiguration } from '@/utils/skid-calculations';
import { CoordinateAxes } from './CoordinateAxes';

interface CrateViewer3DProps {
  configuration: CrateConfiguration | null;
}

function FloorboardsGroup({ config }: { config: CrateConfiguration }) {
  const skidConfig = calculateSkidConfiguration(config.dimensions, config.weight.maxGross);
  const floorboardConfig = calculateFloorboardConfiguration(config.dimensions, skidConfig);

  const scaleFactor = 25.4; // inches to mm
  const [hoveredBoard, setHoveredBoard] = useState<number | null>(null);

  const skidHeight = (config.base.skidHeight * scaleFactor) / 1000;
  const thickness = (floorboardConfig.floorboardThickness * scaleFactor) / 1000;
  const boardLength = (config.dimensions.length * scaleFactor) / 1000;

  return (
    <group name="floorboards">
      {floorboardConfig.floorboards.map((board, index) => {
        const boardWidth = (board.width * scaleFactor) / 1000;

        // Calculate X position based on board position and width
        const xOffset = floorboardConfig.floorboards
          .slice(0, index)
          .reduce((sum, b) => sum + b.width, 0);
        const xPos =
          ((xOffset + board.width / 2 - config.dimensions.width / 2) * scaleFactor) / 1000;

        return (
          <group key={`floorboard-${index}`}>
            <Box
              args={[boardWidth, thickness, boardLength]}
              position={[xPos, skidHeight + thickness / 2, 0]}
              onPointerOver={() => setHoveredBoard(index)}
              onPointerOut={() => setHoveredBoard(null)}
            >
              <meshStandardMaterial
                color={board.isNarrowBoard ? '#6B3410' : '#8B4513'}
                roughness={0.9}
                metalness={0.05}
                emissive={hoveredBoard === index ? '#ff6600' : '#000000'}
                emissiveIntensity={hoveredBoard === index ? 0.2 : 0}
              />
            </Box>

            {/* Add gap between boards (1/8 inch) */}
            {index < floorboardConfig.floorboards.length - 1 && (
              <Box
                args={[0.003, thickness, boardLength]}
                position={[xPos + boardWidth / 2 + 0.0015, skidHeight + thickness / 2, 0]}
              >
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
              </Box>
            )}

            {/* Show dimensions on hover */}
            {hoveredBoard === index && (
              <Html position={[xPos, skidHeight + 0.2, 0]}>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
                  {board.nominalSize} ({board.width.toFixed(2)}&quot;)
                  {board.isNarrowBoard && ' - Narrow Board'}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function CrateModel({ config }: { config: CrateConfiguration }) {
  const { dimensions, base, cap } = config;

  // Convert inches to meters for 3D display
  const scaleFactor = 25.4;
  const length = (dimensions.length * scaleFactor) / 1000;
  const width = (dimensions.width * scaleFactor) / 1000;
  const height = (dimensions.height * scaleFactor) / 1000;

  const skidHeight = (base.skidHeight * scaleFactor) / 1000;
  const skidWidth = (base.skidWidth * scaleFactor) / 1000;
  const skidSpacing = (base.skidSpacing * scaleFactor) / 1000;
  const panelThickness = (cap.topPanel.thickness * scaleFactor) / 1000;
  // const floorThickness = (base.floorboardThickness * scaleFactor) / 1000;

  // Calculate skid positions
  const skidPositions = [];
  const totalSpan = (base.skidCount - 1) * skidSpacing;
  const startX = -totalSpan / 2;

  for (let i = 0; i < base.skidCount; i++) {
    skidPositions.push(startX + i * skidSpacing);
  }

  return (
    <group>
      {/* Individual Skids */}
      {skidPositions.map((xPos, index) => (
        <Box
          key={`skid-${index}`}
          args={[skidWidth, skidHeight, width]}
          position={[xPos, skidHeight / 2, 0]}
        >
          <meshStandardMaterial color="#8B4513" />
        </Box>
      ))}

      {/* Rub Strips if required */}
      {base.requiresRubStrips && (
        <>
          <Box
            args={[length, skidHeight * 0.3, skidWidth * 0.5]}
            position={[0, skidHeight * 0.15, width / 2 - skidWidth * 0.25]}
          >
            <meshStandardMaterial color="#6B3410" />
          </Box>
          <Box
            args={[length, skidHeight * 0.3, skidWidth * 0.5]}
            position={[0, skidHeight * 0.15, -width / 2 + skidWidth * 0.25]}
          >
            <meshStandardMaterial color="#6B3410" />
          </Box>
        </>
      )}

      {/* Individual Floorboards */}
      <FloorboardsGroup config={config} />

      {/* Front Panel */}
      <Box
        args={[length, height, panelThickness]}
        position={[0, skidHeight + height / 2, width / 2 - panelThickness / 2]}
      >
        <meshStandardMaterial color="#DEB887" transparent opacity={0.8} />
      </Box>

      {/* Back Panel */}
      <Box
        args={[length, height, panelThickness]}
        position={[0, skidHeight + height / 2, -width / 2 + panelThickness / 2]}
      >
        <meshStandardMaterial color="#DEB887" transparent opacity={0.8} />
      </Box>

      {/* Left Panel */}
      <Box
        args={[panelThickness, height, width]}
        position={[-length / 2 + panelThickness / 2, skidHeight + height / 2, 0]}
      >
        <meshStandardMaterial color="#DEB887" transparent opacity={0.8} />
      </Box>

      {/* Right Panel */}
      <Box
        args={[panelThickness, height, width]}
        position={[length / 2 - panelThickness / 2, skidHeight + height / 2, 0]}
      >
        <meshStandardMaterial color="#DEB887" transparent opacity={0.8} />
      </Box>

      {/* Top Panel */}
      <Box
        args={[length, panelThickness, width]}
        position={[0, skidHeight + height - panelThickness / 2, 0]}
      >
        <meshStandardMaterial color="#F5DEB3" transparent opacity={0.9} />
      </Box>
    </group>
  );
}

export default function CrateViewer3D({ configuration }: CrateViewer3DProps) {
  const { logInfo, logDebug, logWarning } = useLogsStore();

  useEffect(() => {
    if (configuration) {
      logDebug(
        'render',
        '3D scene updated',
        `Rendering crate: ${configuration.dimensions.length}x${configuration.dimensions.width}x${configuration.dimensions.height} inches`,
        'CrateViewer3D'
      );
    } else {
      logWarning('render', 'No configuration provided for 3D viewer', undefined, 'CrateViewer3D');
    }
  }, [configuration, logDebug, logWarning]);

  // Generate ISPM-15 warnings if configuration exists
  const ispmWarnings = configuration
    ? (() => {
        const skidConfig = calculateSkidConfiguration(
          configuration.dimensions,
          configuration.weight.maxGross
        );
        const floorboardConfig = calculateFloorboardConfiguration(
          configuration.dimensions,
          skidConfig
        );
        return floorboardConfig.warnings;
      })()
    : [];

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg relative">
      {/* ISPM-15 Compliance Warnings */}
      {ispmWarnings.length > 0 && (
        <div className="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-sm p-3 rounded-lg max-w-xs z-10">
          <h4 className="font-semibold text-yellow-900 mb-1">ISPM-15 Notice</h4>
          {ispmWarnings.map((warning, idx) => (
            <p key={idx} className="text-sm text-yellow-800">
              {warning}
            </p>
          ))}
        </div>
      )}

      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Loading 3D Viewer...</p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        }
        onCreated={(_state) => {
          // Enable better performance and compatibility
          try {
            logInfo('render', '3D canvas initialized', 'WebGL renderer ready', 'CrateViewer3D');
          } catch (error) {
            console.warn('WebGL initialization warning:', error);
          }
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Grid args={[20, 20]} />
        <CoordinateAxes size={3} />

        {configuration ? (
          <CrateModel config={configuration} />
        ) : (
          <Text position={[0, 2, 0]} fontSize={0.5} color="gray" anchorX="center" anchorY="middle">
            Configure crate to see 3D preview
          </Text>
        )}
      </Canvas>
    </div>
  );
}
