'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import { useState, useEffect } from 'react';

export default function TestReactThreeFiber() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('TestReactThreeFiber mounting...');
    setMounted(true);
  }, []);

  console.log('TestReactThreeFiber render, mounted:', mounted);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-yellow-100 rounded-lg flex items-center justify-center">
        <p>Client-side mounting...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Box args={[1, 1, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="orange" />
        </Box>
      </Canvas>
    </div>
  );
}
