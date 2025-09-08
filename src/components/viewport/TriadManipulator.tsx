'use client';

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TriadManipulatorProps {
  className?: string;
  position?: { x: number; y: number; z: number };
  onTransform?: (transform: TransformData) => void;
  visible?: boolean;
}

interface TransformData {
  translation?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

type ManipulationMode = 'translate' | 'rotate' | 'scale';
type AxisType = 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz' | 'xyz';

const TriadManipulator: React.FC<TriadManipulatorProps> = ({
  className,
  position = { x: 0, y: 0, z: 0 },
  onTransform,
  visible = true
}) => {
  const [mode, setMode] = useState<ManipulationMode>('translate');
  const [activeAxis, setActiveAxis] = useState<AxisType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleModeChange = useCallback((newMode: ManipulationMode) => {
    setMode(newMode);
    setActiveAxis(null);
  }, []);

  const handleAxisMouseDown = useCallback((axis: AxisType, event: React.MouseEvent) => {
    event.preventDefault();
    setActiveAxis(axis);
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !activeAxis || !dragStart) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    const sensitivity = 0.01;

    let transform: TransformData = {};

    switch (mode) {
      case 'translate':
        switch (activeAxis) {
          case 'x':
            transform.translation = { x: deltaX * sensitivity, y: 0, z: 0 };
            break;
          case 'y':
            transform.translation = { x: 0, y: -deltaY * sensitivity, z: 0 };
            break;
          case 'z':
            transform.translation = { x: 0, y: 0, z: deltaY * sensitivity };
            break;
          case 'xy':
            transform.translation = { x: deltaX * sensitivity, y: -deltaY * sensitivity, z: 0 };
            break;
          case 'xz':
            transform.translation = { x: deltaX * sensitivity, y: 0, z: deltaY * sensitivity };
            break;
          case 'yz':
            transform.translation = { x: 0, y: deltaX * sensitivity, z: deltaY * sensitivity };
            break;
        }
        break;
      case 'rotate':
        const rotationSensitivity = 0.1;
        switch (activeAxis) {
          case 'x':
            transform.rotation = { x: deltaY * rotationSensitivity, y: 0, z: 0 };
            break;
          case 'y':
            transform.rotation = { x: 0, y: deltaX * rotationSensitivity, z: 0 };
            break;
          case 'z':
            transform.rotation = { x: 0, y: 0, z: deltaX * rotationSensitivity };
            break;
        }
        break;
      case 'scale':
        const scaleSensitivity = 0.001;
        const scaleValue = 1 + (deltaX + deltaY) * scaleSensitivity;
        switch (activeAxis) {
          case 'x':
            transform.scale = { x: scaleValue, y: 1, z: 1 };
            break;
          case 'y':
            transform.scale = { x: 1, y: scaleValue, z: 1 };
            break;
          case 'z':
            transform.scale = { x: 1, y: 1, z: scaleValue };
            break;
          case 'xyz':
            transform.scale = { x: scaleValue, y: scaleValue, z: scaleValue };
            break;
        }
        break;
    }

    onTransform?.(transform);
  }, [isDragging, activeAxis, dragStart, mode, onTransform]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveAxis(null);
    setDragStart(null);
  }, []);

  // Attach global mouse events
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!visible) return null;

  const getAxisColor = (axis: AxisType, baseColor: string) => {
    if (activeAxis === axis || (isDragging && activeAxis === axis)) {
      return 'rgb(var(--nx-selection-orange))';
    }
    return baseColor;
  };

  return (
    <div className={cn('fixed bottom-4 left-4 z-40', className)}>
      {/* Mode Selection */}
      <div className="mb-2 flex space-x-1 bg-nx-panel border border-nx-border rounded p-1">
        <button
          className={cn('nx-button text-xs px-2 py-1', mode === 'translate' && 'nx-button-primary')}
          onClick={() => handleModeChange('translate')}
          title="Translate Mode (T)"
        >
          ↔
        </button>
        <button
          className={cn('nx-button text-xs px-2 py-1', mode === 'rotate' && 'nx-button-primary')}
          onClick={() => handleModeChange('rotate')}
          title="Rotate Mode (R)"
        >
          ↻
        </button>
        <button
          className={cn('nx-button text-xs px-2 py-1', mode === 'scale' && 'nx-button-primary')}
          onClick={() => handleModeChange('scale')}
          title="Scale Mode (S)"
        >
          ⤢
        </button>
      </div>

      {/* Triad Manipulator */}
      <div 
        ref={containerRef}
        className="relative w-24 h-24 bg-nx-panel border border-nx-border rounded"
        style={{ 
          background: 'radial-gradient(circle at center, rgba(var(--nx-panel), 0.8) 0%, rgba(var(--nx-panel), 0.4) 100%)'
        }}
      >
        <svg 
          width="96" 
          height="96" 
          viewBox="0 0 96 96" 
          className="absolute inset-0"
        >
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgb(var(--nx-grid-minor))" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="96" height="96" fill="url(#grid)" />
          
          {/* Center Origin */}
          <circle cx="48" cy="48" r="3" fill="rgb(var(--nx-text))" />
          
          {mode === 'translate' && (
            <>
              {/* X-Axis (Red) */}
              <line 
                x1="48" y1="48" x2="80" y2="48" 
                stroke={getAxisColor('x', '#FF0000')} 
                strokeWidth="3"
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('x', e as any)}
              />
              <polygon 
                points="80,48 75,45 75,51" 
                fill={getAxisColor('x', '#FF0000')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('x', e as any)}
              />
              <text x="82" y="52" fontSize="8" fill="rgb(var(--nx-text))">X</text>
              
              {/* Y-Axis (Green) */}
              <line 
                x1="48" y1="48" x2="48" y2="16" 
                stroke={getAxisColor('y', '#00FF00')} 
                strokeWidth="3"
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('y', e as any)}
              />
              <polygon 
                points="48,16 45,21 51,21" 
                fill={getAxisColor('y', '#00FF00')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('y', e as any)}
              />
              <text x="52" y="20" fontSize="8" fill="rgb(var(--nx-text))">Y</text>
              
              {/* Z-Axis (Blue) - Projected */}
              <line 
                x1="48" y1="48" x2="70" y2="26" 
                stroke={getAxisColor('z', '#0000FF')} 
                strokeWidth="3"
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('z', e as any)}
              />
              <polygon 
                points="70,26 66,28 68,32" 
                fill={getAxisColor('z', '#0000FF')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('z', e as any)}
              />
              <text x="72" y="30" fontSize="8" fill="rgb(var(--nx-text))">Z</text>

              {/* Plane Handles */}
              <rect 
                x="58" y="38" width="10" height="10" 
                fill={getAxisColor('xy', 'rgba(255,255,0,0.3)')}
                stroke={getAxisColor('xy', '#FFFF00')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('xy', e as any)}
              />
              <rect 
                x="58" y="28" width="10" height="10" 
                fill={getAxisColor('xz', 'rgba(255,0,255,0.3)')}
                stroke={getAxisColor('xz', '#FF00FF')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('xz', e as any)}
              />
              <rect 
                x="48" y="28" width="10" height="10" 
                fill={getAxisColor('yz', 'rgba(0,255,255,0.3)')}
                stroke={getAxisColor('yz', '#00FFFF')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('yz', e as any)}
              />
            </>
          )}

          {mode === 'rotate' && (
            <>
              {/* Rotation Circles */}
              <circle 
                cx="48" cy="48" r="20" 
                fill="none" 
                stroke={getAxisColor('x', '#FF0000')} 
                strokeWidth="2"
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('x', e as any)}
              />
              <circle 
                cx="48" cy="48" r="25" 
                fill="none" 
                stroke={getAxisColor('y', '#00FF00')} 
                strokeWidth="2"
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('y', e as any)}
              />
              <circle 
                cx="48" cy="48" r="30" 
                fill="none" 
                stroke={getAxisColor('z', '#0000FF')} 
                strokeWidth="2"
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('z', e as any)}
              />
              
              {/* Axis Labels */}
              <text x="68" y="52" fontSize="8" fill="#FF0000">X</text>
              <text x="50" y="25" fontSize="8" fill="#00FF00">Y</text>
              <text x="75" y="30" fontSize="8" fill="#0000FF">Z</text>
            </>
          )}

          {mode === 'scale' && (
            <>
              {/* Scale Handles */}
              <rect 
                x="72" y="44" width="8" height="8" 
                fill={getAxisColor('x', '#FF0000')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('x', e as any)}
              />
              <rect 
                x="44" y="16" width="8" height="8" 
                fill={getAxisColor('y', '#00FF00')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('y', e as any)}
              />
              <rect 
                x="66" y="22" width="8" height="8" 
                fill={getAxisColor('z', '#0000FF')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('z', e as any)}
              />
              
              {/* Uniform Scale Handle */}
              <rect 
                x="44" y="44" width="8" height="8" 
                fill={getAxisColor('xyz', 'rgb(var(--nx-selection-orange))')}
                className="cursor-pointer"
                onMouseDown={(e) => handleAxisMouseDown('xyz', e as any)}
              />
              
              {/* Connecting Lines */}
              <line x1="48" y1="48" x2="76" y2="48" stroke="#FF0000" strokeWidth="1" />
              <line x1="48" y1="48" x2="48" y2="20" stroke="#00FF00" strokeWidth="1" />
              <line x1="48" y1="48" x2="70" y2="26" stroke="#0000FF" strokeWidth="1" />
              
              {/* Labels */}
              <text x="78" y="52" fontSize="8" fill="#FF0000">X</text>
              <text x="50" y="15" fontSize="8" fill="#00FF00">Y</text>
              <text x="72" y="20" fontSize="8" fill="#0000FF">Z</text>
              <text x="36" y="52" fontSize="8" fill="rgb(var(--nx-text))">All</text>
            </>
          )}
        </svg>

        {/* Status Display */}
        {isDragging && activeAxis && (
          <div className="absolute -top-8 left-0 right-0 text-center">
            <div className="inline-block px-2 py-1 bg-nx-panel border border-nx-border rounded text-xs nx-text">
              {mode.toUpperCase()} {activeAxis.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Coordinate Display */}
      <div className="mt-2 bg-nx-panel border border-nx-border rounded p-2">
        <div className="text-xs nx-text space-y-1">
          <div>X: {position.x.toFixed(3)}</div>
          <div>Y: {position.y.toFixed(3)}</div>
          <div>Z: {position.z.toFixed(3)}</div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-1 text-[10px] nx-text-secondary">
        T: Translate | R: Rotate | S: Scale
      </div>
    </div>
  );
};

export default TriadManipulator;