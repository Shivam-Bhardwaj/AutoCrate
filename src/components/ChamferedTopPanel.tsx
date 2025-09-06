'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface ChamferedTopPanelProps {
  args: [number, number, number]; // [length, width, thickness]
  position: [number, number, number];
  material: THREE.Material;
  chamferDepth: number;
  chamferAngle: number;
}

export default function ChamferedTopPanel({
  args,
  position,
  material,
  chamferDepth,
  chamferAngle,
}: ChamferedTopPanelProps) {
  const geometry = useMemo(() => {
    const [length, width, thickness] = args;

    // Create a box geometry for the top panel
    const geo = new THREE.BoxGeometry(length, width, thickness);

    if (chamferDepth > 0 && chamferAngle > 0) {
      // Get the position attribute
      const positions = geo.attributes.position;
      const vertices = positions.array as Float32Array;

      // Calculate chamfer offset based on angle (more accurate)
      const chamferRadians = (chamferAngle * Math.PI) / 180;
      const chamferOffset = chamferDepth * Math.tan(chamferRadians);
      const maxEdgeDistance = Math.min(length, width) * 0.2; // Affects outer 20% of panel

      // Modify vertices to create realistic chamfered edges on the top panel
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];

        // Calculate distance from nearest edge
        const distFromEdgeX = Math.min(
          Math.abs(x - -length / 2), // Left edge
          Math.abs(x - length / 2) // Right edge
        );
        const distFromEdgeY = Math.min(
          Math.abs(y - -width / 2), // Front edge
          Math.abs(y - width / 2) // Back edge
        );
        const minDistFromEdge = Math.min(distFromEdgeX, distFromEdgeY);

        // Apply chamfering to edges
        if (minDistFromEdge <= maxEdgeDistance && z > 0) {
          const edgeFactor = 1 - minDistFromEdge / maxEdgeDistance;
          const edgeReduction = chamferOffset * edgeFactor * 0.3;

          // Reduce thickness near edges (creates beveled edge effect)
          vertices[i + 2] = z - chamferDepth * edgeFactor * 0.6;

          // Slightly reduce dimensions for visual chamfer effect
          if (distFromEdgeX <= maxEdgeDistance) {
            const xEdgeFactor = 1 - distFromEdgeX / maxEdgeDistance;
            vertices[i] = x * (1 - edgeReduction * 0.2 * xEdgeFactor);
          }
          if (distFromEdgeY <= maxEdgeDistance) {
            const yEdgeFactor = 1 - distFromEdgeY / maxEdgeDistance;
            vertices[i + 1] = y * (1 - edgeReduction * 0.2 * yEdgeFactor);
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
  }, [args, chamferDepth, chamferAngle]);

  return <mesh geometry={geometry} position={position} material={material} />;
}
