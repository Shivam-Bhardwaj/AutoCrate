'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ViewCubeProps {
  className?: string;
  onViewChange?: (view: string) => void;
}

type ViewDirection = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 
                   'front-top-right' | 'front-top-left' | 'front-bottom-right' | 'front-bottom-left' |
                   'back-top-right' | 'back-top-left' | 'back-bottom-right' | 'back-bottom-left' |
                   'isometric';

interface CubeFace {
  id: ViewDirection;
  label: string;
  position: string;
  rotation?: string;
}

const ViewCube: React.FC<ViewCubeProps> = ({ className, onViewChange }) => {
  const [hoveredFace, setHoveredFace] = useState<ViewDirection | null>(null);
  const [isHomeView, setIsHomeView] = useState(false);

  // Define cube faces and their orientations
  const cubeFaces: CubeFace[] = [
    { id: 'front', label: 'FRONT', position: 'translateZ(20px)', rotation: 'rotateY(0deg)' },
    { id: 'back', label: 'BACK', position: 'translateZ(-20px)', rotation: 'rotateY(180deg)' },
    { id: 'right', label: 'RIGHT', position: 'translateX(20px)', rotation: 'rotateY(90deg)' },
    { id: 'left', label: 'LEFT', position: 'translateX(-20px)', rotation: 'rotateY(-90deg)' },
    { id: 'top', label: 'TOP', position: 'translateY(-20px)', rotation: 'rotateX(90deg)' },
    { id: 'bottom', label: 'BOTTOM', position: 'translateY(20px)', rotation: 'rotateX(-90deg)' }
  ];

  // Corner and edge positions for navigation
  const corners = [
    { id: 'front-top-right' as ViewDirection, position: 'top: 2px; right: 2px;' },
    { id: 'front-top-left' as ViewDirection, position: 'top: 2px; left: 2px;' },
    { id: 'front-bottom-right' as ViewDirection, position: 'bottom: 2px; right: 2px;' },
    { id: 'front-bottom-left' as ViewDirection, position: 'bottom: 2px; left: 2px;' }
  ];

  const handleFaceClick = useCallback((view: ViewDirection) => {
    onViewChange?.(view);
    setIsHomeView(view === 'isometric');
  }, [onViewChange]);

  const handleHomeClick = useCallback(() => {
    handleFaceClick('isometric');
  }, [handleFaceClick]);

  return (
    <div className={cn('fixed top-4 right-4 z-50', className)}>
      {/* View Cube Container */}
      <div className="relative">
        {/* Main Cube */}
        <div 
          className="w-16 h-16 relative preserve-3d cursor-pointer"
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Cube Faces */}
          {cubeFaces.map((face) => (
            <div
              key={face.id}
              className={cn(
                'absolute w-16 h-16 border border-nx-border bg-nx-panel hover:bg-nx-toolbar',
                'flex items-center justify-center text-[8px] font-bold nx-text',
                'transition-all duration-200 select-none',
                hoveredFace === face.id && 'bg-nx-siemens-blue text-white',
                'backface-visibility-hidden'
              )}
              style={{
                transform: `${face.position} ${face.rotation || ''}`,
                backfaceVisibility: 'hidden'
              }}
              onClick={() => handleFaceClick(face.id)}
              onMouseEnter={() => setHoveredFace(face.id)}
              onMouseLeave={() => setHoveredFace(null)}
            >
              {face.label}
            </div>
          ))}

          {/* Corner Navigation Points */}
          {corners.map((corner) => (
            <div
              key={corner.id}
              className="absolute w-3 h-3 hover:bg-nx-selection-orange rounded cursor-pointer"
              style={{ 
                ...corner.position as any,
                zIndex: 10,
                background: hoveredFace === corner.id ? 'rgb(var(--nx-selection-orange))' : 'transparent'
              }}
              onClick={() => handleFaceClick(corner.id)}
              onMouseEnter={() => setHoveredFace(corner.id)}
              onMouseLeave={() => setHoveredFace(null)}
              title={`${corner.id.replace(/-/g, ' ')} view`}
            />
          ))}
        </div>

        {/* Home Button */}
        <div className="mt-1 flex justify-center">
          <button
            className={cn(
              'w-8 h-6 text-xs nx-button flex items-center justify-center',
              isHomeView && 'nx-button-primary'
            )}
            onClick={handleHomeClick}
            title="Home View (Isometric)"
          >
            🏠
          </button>
        </div>

        {/* View Orientation Indicators */}
        <div className="mt-1 text-center">
          <div className="text-[8px] nx-text-secondary">
            {hoveredFace ? hoveredFace.toUpperCase().replace(/-/g, ' ') : 'VIEW CUBE'}
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="mt-2 space-y-1">
        {/* Compass */}
        <div className="relative w-16 h-16 border border-nx-border bg-nx-panel rounded-full flex items-center justify-center">
          <div className="absolute top-1 text-xs font-bold nx-text">N</div>
          <div className="absolute bottom-1 text-xs font-bold nx-text">S</div>
          <div className="absolute left-1 text-xs font-bold nx-text">W</div>
          <div className="absolute right-1 text-xs font-bold nx-text">E</div>
          <div className="w-2 h-2 bg-nx-siemens-blue rounded-full"></div>
        </div>

        {/* View Mode Buttons */}
        <div className="space-y-1">
          <button
            className="w-16 h-6 nx-button text-xs flex items-center justify-center"
            onClick={() => handleFaceClick('front')}
            title="Front View"
          >
            FRONT
          </button>
          <button
            className="w-16 h-6 nx-button text-xs flex items-center justify-center"
            onClick={() => handleFaceClick('top')}
            title="Top View"
          >
            TOP
          </button>
          <button
            className="w-16 h-6 nx-button text-xs flex items-center justify-center"
            onClick={() => handleFaceClick('right')}
            title="Right View"
          >
            RIGHT
          </button>
        </div>

        {/* Fit View Button */}
        <button
          className="w-16 h-6 nx-button text-xs flex items-center justify-center"
          onClick={() => onViewChange?.('fit')}
          title="Fit View (F8)"
        >
          FIT
        </button>
      </div>
    </div>
  );
};

export default ViewCube;