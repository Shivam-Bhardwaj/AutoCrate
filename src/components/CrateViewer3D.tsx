'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Text } from '@react-three/drei';
import { CrateConfiguration } from '@/types/crate';
import { useLogsStore } from '@/store/logs-store';
import { useEffect } from 'react';

interface CrateViewer3DProps {
  configuration: CrateConfiguration | null;
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

      {/* Floor */}
      <Box
        args={[length, panelThickness, width]}
        position={[0, skidHeight + panelThickness / 2, 0]}
      >
        <meshStandardMaterial color="#D2691E" />
      </Box>

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
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
        onCreated={() => {
          logInfo('render', '3D canvas initialized', 'WebGL renderer ready', 'CrateViewer3D');
        }}
        onPointerMissed={() => {
          logDebug('ui', 'User clicked outside 3D model', undefined, 'CrateViewer3D');
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          onChange={() => {
            logDebug(
              'ui',
              'Camera view changed',
              'User interacting with 3D controls',
              'CrateViewer3D'
            );
          }}
        />
        <Grid args={[20, 20]} />

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
