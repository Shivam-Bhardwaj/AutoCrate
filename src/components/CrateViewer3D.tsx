'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import { CrateConfiguration } from '@/types/crate';
import { useLogsStore } from '@/store/logs-store';
import { useEffect, useState, memo } from 'react';
import { Label } from '@/components/ui/label';
import { validateCrateConfiguration, isValidForRendering } from '@/utils/input-validation';
import { CrateModel } from './three/CrateModel';

interface CrateViewer3DProps {
  configuration: CrateConfiguration | null;
}

// Component visibility state
interface ComponentVisibility {
  skids: boolean;
  floor: boolean;
  panels: boolean;
  cleats: boolean;
  cog: boolean;
}

// Hover state for tooltips
interface HoverState {
  component: string | null;
  dimensions: [number, number, number] | null;
  position: [number, number, number] | null;
}

// Hover tooltip component
const HoverTooltip = ({ hoverState }: { hoverState: HoverState }) => {
  if (!hoverState.component || !hoverState.dimensions) return null;

  return (
    <Html
      position={hoverState.position || [0, 0, 0]}
      center
      distanceFactor={10}
      style={{ pointerEvents: 'none' }}
    >
      <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg border border-gray-600">
        <div className="font-semibold capitalize">{hoverState.component}</div>
        <div className="text-xs text-gray-300">
          {Math.round(hoverState.dimensions[0])}&quot; × {Math.round(hoverState.dimensions[1])}&quot; × {Math.round(hoverState.dimensions[2])}&quot;
        </div>
      </div>
    </Html>
  );
};

/**
 * Simplified 3D crate viewer component
 */
const CrateViewer3D = memo(function CrateViewer3D({ configuration }: CrateViewer3DProps) {
  const { addLog } = useLogsStore();
  const [viewMode, setViewMode] = useState<'clean' | 'full'>('full');
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [showFaceLabels, setShowFaceLabels] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showWCS, setShowWCS] = useState(false);
  const [hoverState, setHoverState] = useState<HoverState>({
    component: null,
    dimensions: null,
    position: null,
  });
  const [componentVisibility, setComponentVisibility] = useState<ComponentVisibility>({
    skids: true,
    floor: true,
    panels: false,
    cleats: false,
    cog: false,
  });

  const handleHover = (component: string, dimensions: [number, number, number], position: [number, number, number]) => {
    setHoverState({ component, dimensions, position });
  };

  const handleHoverEnd = () => {
    setHoverState({ component: null, dimensions: null, position: null });
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'clean' ? 'full' : 'clean';
    setViewMode(newMode);
    
    if (newMode === 'clean') {
      setShowFaceLabels(false);
      setShowMeasurements(false);
      setShowWCS(false);
    } else {
      setShowFaceLabels(true);
      setShowMeasurements(true);
      setShowWCS(true);
    }
    
    addLog('user', 'ui', 'View mode changed', undefined, { viewMode: newMode });
  };

  const toggleExplodeView = () => {
    const newValue = explodeFactor === 0 ? 50 : 0;
    setExplodeFactor(newValue);
    addLog('user', 'ui', 'Explode view toggled', undefined, { explodeFactor: newValue });
  };

  const toggleComponent = (component: keyof ComponentVisibility) => {
    setComponentVisibility(prev => ({
      ...prev,
      [component]: !prev[component]
    }));
    addLog('user', 'ui', 'Component visibility toggled', undefined, { 
      component, 
      visible: !componentVisibility[component] 
    });
  };

  // Validate configuration
  if (!configuration || !isValidForRendering(configuration)) {
    const validationErrors = ['Invalid crate configuration'];
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/10 rounded-lg">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Invalid crate configuration</p>
          {validationErrors && validationErrors.length > 0 && (
            <ul className="text-sm text-red-500 space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-4 max-w-xs">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">3D Viewer Controls</h3>
          <button
            onClick={toggleExplodeView}
            className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            {explodeFactor > 0 ? 'Collapse' : 'Explode'} View
          </button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Display Options</Label>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showMeasurements}
                onChange={(e) => setShowMeasurements(e.target.checked)}
                className="rounded"
              />
              Show Measurements
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showFaceLabels}
                onChange={(e) => setShowFaceLabels(e.target.checked)}
                className="rounded"
              />
              Show Face Labels
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showWCS}
                onChange={(e) => setShowWCS(e.target.checked)}
                className="rounded"
              />
              Show WCS
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleViewMode}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              viewMode === 'clean' 
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {viewMode === 'clean' ? 'Clean View' : 'Full Detail'}
          </button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Components</Label>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={componentVisibility.skids}
                onChange={() => toggleComponent('skids')}
                className="rounded"
              />
              <span className="inline-block w-3 h-3 bg-amber-900 rounded-sm mr-1" />
              Skids
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={componentVisibility.floor}
                onChange={() => toggleComponent('floor')}
                className="rounded"
              />
              <span className="inline-block w-3 h-3 bg-amber-800 rounded-sm mr-1" />
              Floor
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={componentVisibility.panels}
                onChange={() => toggleComponent('panels')}
                className="rounded"
              />
              <span className="inline-block w-3 h-3 bg-yellow-600 rounded-sm mr-1" />
              Panels
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={componentVisibility.cleats}
                onChange={() => toggleComponent('cleats')}
                className="rounded"
              />
              <span className="inline-block w-3 h-3 bg-amber-700 rounded-sm mr-1" />
              Cleats
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={componentVisibility.cog}
                onChange={() => toggleComponent('cog')}
                className="rounded"
              />
              Center Of Gravity
            </label>
          </div>
        </div>

        <div className="space-y-1 pt-2 border-t">
          <Label className="text-xs font-medium">Legend</Label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-amber-900 rounded-sm" />
              Skids
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-amber-800 rounded-sm" />
              Floor
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-yellow-600 rounded-sm" />
              Panels
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-amber-700 rounded-sm" />
              Cleats
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [2, 1.5, 2], fov: 50 }}
        className="bg-muted/5"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        <Grid
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#9ca3af"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />

        <CrateModel
          config={configuration}
          explodeFactor={explodeFactor}
          showFaceLabels={showFaceLabels}
          showMeasurements={showMeasurements}
          showWCS={showWCS}
          componentVisibility={componentVisibility}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
        />

        <HoverTooltip hoverState={hoverState} />
      </Canvas>
    </div>
  );
});

export default CrateViewer3D;