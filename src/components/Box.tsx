import React from 'react';
import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface BoxProps {
  position: [number, number, number];
  dimensions: [number, number, number];
  color: string;
}

const Box: React.FC<BoxProps> = ({ position, dimensions, color }) => {
  const meshRef = React.useRef<Mesh>(null);

  // Update box dimensions
  const [width, height, depth] = dimensions;

  // Create box geometry
  const geometry = new BoxGeometry(width, height, depth);

  // Create material
  const material = new MeshBasicMaterial({ color });

  // Create mesh
  const box = new Mesh(geometry, material);

  // Add mesh to scene
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return <primitive object={box} ref={meshRef} position={position} />;
};

export default Box;
