'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import { CrateConfiguration } from '@/types/crate';

interface CrateViewer3DSimpleProps {
  configuration: CrateConfiguration | null;
}

// Simple crate model component
function SimpleCrateModel({ config }: { config: CrateConfiguration }) {
  const { dimensions } = config;

  // Convert inches to a reasonable display scale
  const scale = 0.1; // Scale factor for display
  const length = Math.max(dimensions.length || 48, 1) * scale;
  const width = Math.max(dimensions.width || 40, 1) * scale;
  const height = Math.max(dimensions.height || 36, 1) * scale;

  return (
    <group>
      {/* Main crate box */}
      <Box args={[length, width, height]} position={[0, 0, height / 2]}>
        <meshStandardMaterial color="#8B4513" transparent opacity={0.8} />
      </Box>

      {/* Base/Skid */}
      <Box args={[length + 0.2, width + 0.2, 0.3]} position={[0, 0, 0.15]}>
        <meshStandardMaterial color="#654321" />
      </Box>

      {/* Labels */}
      <Text
        position={[0, 0, height + 0.5]}
        fontSize={0.5}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        {dimensions.length}&quot; x {dimensions.width}&quot; x {dimensions.height}&quot;
      </Text>
    </group>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Initializing 3D Scene...</p>
      </div>
    </div>
  );
}

export default function CrateViewer3DSimple({ configuration }: CrateViewer3DSimpleProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ensure we only render on client side
  if (!isClient) {
    return <LoadingFallback />;
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg relative">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [8, 8, 8], fov: 50 }}
          shadows
          dpr={[1, 2]}
          onCreated={(state) => {
            console.log('Canvas created successfully');
            state.gl.setClearColor('#f5f5f5');
          }}
          onError={(error) => {
            console.error('Canvas error:', error);
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 0, 2]}
          />

          {configuration ? (
            <SimpleCrateModel config={configuration} />
          ) : (
            <group>
              <Box args={[4, 3, 2]} position={[0, 0, 1]}>
                <meshStandardMaterial color="#8B4513" transparent opacity={0.8} />
              </Box>
              <Text
                position={[0, 0, 3]}
                fontSize={0.5}
                color="gray"
                anchorX="center"
                anchorY="middle"
              >
                Configure crate to see preview
              </Text>
            </group>
          )}
        </Canvas>
      </Suspense>

      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        Simple 3D Viewer • Click and drag to rotate
      </div>
    </div>
  );
}
