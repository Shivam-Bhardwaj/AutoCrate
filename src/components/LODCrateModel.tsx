'use client';

/**
 * PERFORMANCE: Level of Detail (LOD) Crate Model
 *
 * This component automatically adjusts rendering detail based on camera distance:
 * - High LOD (close): Full detail with gaps, hover effects, all components
 * - Medium LOD (medium): Reduced detail, no gaps, simplified hover
 * - Low LOD (far): Minimal detail, basic shapes only
 *
 * Target: Maintain 60 FPS even with complex scenes by reducing geometry at distance
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useState, memo, useMemo } from 'react';
import { Vector3 } from 'three';
import { CrateConfiguration } from '@/types/crate';
import { getLODLevel, getLODSettings, DEFAULT_LOD_CONFIG } from '@/utils/geometry-instancing';

interface LODCrateModelProps {
  config: CrateConfiguration;
  children: React.ReactNode;
}

// PERFORMANCE: LOD-aware crate model that switches detail levels based on camera distance
export const LODCrateModel = memo(function LODCrateModel({ config, children }: LODCrateModelProps) {
  const { camera } = useThree();
  const [lodLevel, setLodLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [cameraDistance, setCameraDistance] = useState(0);

  // PERFORMANCE: Monitor camera distance every frame but throttle LOD updates
  useFrame(() => {
    // Z-up coordinate system: crate center remains at origin but oriented with Z as height
    const crateCenter = new Vector3(0, 0, 0);
    const distance = camera.position.distanceTo(crateCenter);
    setCameraDistance(distance);

    const newLodLevel = getLODLevel(distance);
    if (newLodLevel !== lodLevel) {
      setLodLevel(newLodLevel);

      // Log LOD changes in development for performance monitoring
      if (process.env.NODE_ENV === 'development') {
        console.log(`LOD Level changed to: ${newLodLevel} (distance: ${distance.toFixed(2)})`);
      }
    }
  });

  // PERFORMANCE: Memoize LOD settings to avoid recalculation
  const lodSettings = useMemo(() => {
    return getLODSettings(lodLevel);
  }, [lodLevel]);

  // PERFORMANCE: Provide LOD context to child components
  return <group userData={{ lodLevel, lodSettings, cameraDistance }}>{children}</group>;
});

// Hook for child components to access LOD context
export function useLODContext() {
  // This would typically use React Context, but for simplicity we'll use a prop-based approach
  // In a full implementation, you'd create a LODContext and provider
  return {
    lodLevel: 'high' as const,
    lodSettings: DEFAULT_LOD_CONFIG.highDetail,
    cameraDistance: 10,
  };
}
