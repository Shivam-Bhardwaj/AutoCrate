'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box, Text } from '@react-three/drei';
import { CrateConfiguration } from '@/types/crate';

interface CrateViewer3DProps {
  configuration: CrateConfiguration | null;
}

function CrateModel({ config }: { config: CrateConfiguration }) {
  const { dimensions, base, cap } = config;

  const scaleFactor = dimensions.unit === 'inch' ? 25.4 : 1;
  const length = (dimensions.length * scaleFactor) / 1000;
  const width = (dimensions.width * scaleFactor) / 1000;
  const height = (dimensions.height * scaleFactor) / 1000;

  const skidHeight = (base.skidHeight * scaleFactor) / 1000;
  const panelThickness = (cap.topPanel.thickness * scaleFactor) / 1000;

  return (
    <group>
      {/* Base/Skids */}
      <Box args={[length, skidHeight, width]} position={[0, skidHeight / 2, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>

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
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
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
