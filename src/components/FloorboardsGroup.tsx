import React from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping } from 'three';

const skidTexture = '/textures/skid_texture.jpg';
const floorboardTexture = '/textures/floorboard_texture.jpg';

export function FloorboardsGroup() {
  // Load textures
  const [skidTex, floorTex] = useLoader(TextureLoader, [skidTexture, floorboardTexture]);

  // Repeat textures to cover larger area
  skidTex.wrapS = RepeatWrapping;
  skidTex.wrapT = RepeatWrapping;
  floorTex.wrapS = RepeatWrapping;
  floorTex.wrapT = RepeatWrapping;

  // Adjust repeat rate to match floor and skid dimensions
  skidTex.repeat.set(1, 1);
  floorTex.repeat.set(2, 2);

  return (
    <>
      {/* Skids */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <boxBufferGeometry args={[2, 0.2, 0.2]} />
        <meshStandardMaterial map={skidTex} />
      </mesh>

      {/* Floorboards - FIXED ORIENTATION */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
        <planeBufferGeometry args={[4, 2]} />
        <meshStandardMaterial map={floorTex} />
      </mesh>
    </>
  );
}
