'use client';

import { memo, useMemo } from 'react';
import { CrateConfiguration } from '@/types/crate';
import { 
  buildSimpleCrateGeometry, 
  scaleForVisualization 
} from '@/utils/geometry/simple-crate-geometry';
import { calculateSkidConfiguration } from '@/utils/skid-calculations';
import { validateCoGStability } from '@/services/cog-calculator';

// Import individual renderer components
import { SkidsRenderer } from './SkidsRenderer';
import { FloorRenderer } from './FloorRenderer';
import { PanelsRenderer } from './PanelsRenderer';
import { CleatsRenderer } from './CleatsRenderer';
import { CoGIndicator } from './CoGIndicator';
import { CoordinateAxes } from '../CoordinateAxes';
import { MeasurementLines } from '../MeasurementLines';

// Component visibility state
interface ComponentVisibility {
  skids: boolean;
  floor: boolean;
  panels: boolean;
  cleats: boolean;
  cog: boolean;
}

interface CrateModelProps {
  config: CrateConfiguration;
  explodeFactor?: number;
  showFaceLabels?: boolean;
  showMeasurements?: boolean;
  showWCS?: boolean;
  componentVisibility: ComponentVisibility;
  onHover: (component: string, dimensions: [number, number, number], position: [number, number, number]) => void;
  onHoverEnd: () => void;
}

/**
 * Main 3D crate model component that orchestrates all sub-renderers
 */
export const CrateModel = memo(function CrateModel({
  config,
  explodeFactor = 0,
  showFaceLabels = true,
  showMeasurements = true,
  showWCS = false,
  componentVisibility,
  onHover,
  onHoverEnd,
}: CrateModelProps) {
  // Calculate skid configuration if weight is provided
  const skidConfig = useMemo(() => {
    if (config.weight?.product) {
      return calculateSkidConfiguration(config.dimensions, config.weight.product);
    }
    return undefined;
  }, [config.dimensions, config.weight?.product]);

  // Build and scale geometry
  const geometryInches = useMemo(
    () => buildSimpleCrateGeometry(config, skidConfig),
    [config, skidConfig]
  );
  
  const geometry = useMemo(
    () => scaleForVisualization(geometryInches),
    [geometryInches]
  );

  // Calculate CoG stability
  const cogStability = useMemo(() => {
    if (config.centerOfGravity?.combinedCoG && config.dimensions) {
      return validateCoGStability(config.centerOfGravity.combinedCoG, config.dimensions);
    }
    return null;
  }, [config.centerOfGravity?.combinedCoG, config.dimensions]);

  return (
    <group>
      {/* Coordinate Axes */}
      {showWCS && <CoordinateAxes />}

      {/* Measurement Lines */}
      {showMeasurements && (
        <MeasurementLines
          width={config.dimensions.width}
          depth={config.dimensions.length}
          height={config.dimensions.height}
        />
      )}

      {/* Skids */}
      <SkidsRenderer
        skids={geometry.skids}
        skidConfig={skidConfig}
        crateDepth={config.dimensions.length}
        visible={componentVisibility.skids}
        onHover={onHover}
        onHoverEnd={onHoverEnd}
      />

      {/* Floor Boards */}
      <FloorRenderer
        floorBoards={geometry.floorBoards}
        visible={componentVisibility.floor}
        onHover={onHover}
        onHoverEnd={onHoverEnd}
      />

      {/* Panels */}
      <PanelsRenderer
        panels={geometry.panels}
        config={config}
        explodeFactor={explodeFactor}
        visible={componentVisibility.panels}
        showFaceLabels={showFaceLabels}
        onHover={onHover}
        onHoverEnd={onHoverEnd}
      />

      {/* Cleats */}
      <CleatsRenderer
        cleats={geometry.cleats}
        visible={componentVisibility.cleats}
        onHover={onHover}
        onHoverEnd={onHoverEnd}
      />

      {/* Center of Gravity */}
      <CoGIndicator
        config={config}
        cogStability={cogStability}
        visible={componentVisibility.cog}
        onHover={onHover}
        onHoverEnd={onHoverEnd}
      />
    </group>
  );
});