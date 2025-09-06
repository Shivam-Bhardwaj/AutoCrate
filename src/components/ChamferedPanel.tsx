'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface ChamferedPanelProps {
  args: [number, number, number]; // [width, depth, height]
  position: [number, number, number];
  material: THREE.Material;
  chamferDepth: number;
  chamferAngle: number;
  panelType: 'front' | 'back' | 'left' | 'right';
}

export default function ChamferedPanel({
  args,
  position,
  material,
  chamferDepth,
  chamferAngle,
  panelType,
}: ChamferedPanelProps) {
  const geometry = useMemo(() => {
    const [width, depth, height] = args;

    // Create a box geometry and modify it for chamfering
    const geo = new THREE.BoxGeometry(width, depth, height);

    if (chamferDepth > 0 && chamferAngle > 0) {
      // Get the position attribute
      const positions = geo.attributes.position;
      const vertices = positions.array as Float32Array;

      // Calculate chamfer offset based on angle (more accurate trigonometry)
      const chamferRadians = (chamferAngle * Math.PI) / 180;
      const chamferOffset = chamferDepth * Math.tan(chamferRadians);
      const maxChamferHeight = height * 0.3; // Chamfer affects top 30% of panel

      // Modify vertices to create realistic chamfered edges
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];

        // Apply chamfering based on panel type and height
        const distanceFromTop = height / 2 - z;

        if (distanceFromTop > 0 && distanceFromTop <= maxChamferHeight) {
          const chamferFactor = distanceFromTop / maxChamferHeight;
          const edgeReduction = chamferOffset * chamferFactor * 0.5;

          switch (panelType) {
            case 'front':
            case 'back':
              // Chamfer along X axis (width) - reduce width near top edges
              if (Math.abs(x) > width * 0.3) {
                // Near side edges
                vertices[i] = x * (1 - edgeReduction * 0.4);
                vertices[i + 2] = z + chamferDepth * chamferFactor * 0.3; // Slight upward shift
              }
              break;
            case 'left':
            case 'right':
              // Chamfer along Y axis (depth) - reduce depth near top edges
              if (Math.abs(y) > depth * 0.3) {
                // Near front/back edges
                vertices[i + 1] = y * (1 - edgeReduction * 0.4);
                vertices[i + 2] = z + chamferDepth * chamferFactor * 0.3; // Slight upward shift
              }
              break;
          }
        }
      }

      // Update the geometry
      positions.needsUpdate = true;
      geo.computeVertexNormals();
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
    }

    return geo;
  }, [args, chamferDepth, chamferAngle, panelType]);

  return <mesh geometry={geometry} position={position} material={material} />;
}
