'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import NXToolbar from './NXToolbar';
import ResourceBar from './ResourceBar';
import ViewCube from '../viewport/ViewCube';
import TriadManipulator from '../viewport/TriadManipulator';
import InputForms from '../InputForms';
import CrateViewer3D from '../CrateViewer3D';
import { useCrateStore } from '@/store/crate-store';

interface NXInterfaceProps {
  className?: string;
}

const NXInterface: React.FC<NXInterfaceProps> = ({ className }) => {
  const { configuration } = useCrateStore();
  const [resourceBarCollapsed, setResourceBarCollapsed] = useState(false);
  const [propertiesPanelVisible, setPropertiesPanelVisible] = useState(true);

  const handleToolbarAction = useCallback((menu: string, item: string) => {
    console.log(`Toolbar action: ${menu} -> ${item}`);
    // Handle toolbar actions here
    switch (`${menu}.${item}`) {
      case 'view.fit':
        // Implement fit view
        break;
      case 'view.wireframe':
        // Toggle wireframe mode
        break;
      case 'view.shaded':
        // Toggle shaded mode
        break;
      case 'tools.measure':
        // Activate measurement tool
        break;
      default:
        break;
    }
  }, []);

  const handleViewChange = useCallback((view: string) => {
    console.log(`View changed to: ${view}`);
    // Handle view changes here
  }, []);

  const handleTransform = useCallback((transform: any) => {
    console.log('Transform:', transform);
    // Handle object transformations here
  }, []);

  return (
    <div className={cn('flex flex-col h-screen nx-background', className)}>
      {/* Top Toolbar */}
      <NXToolbar onMenuSelect={handleToolbarAction} />

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Resource Bar */}
        <ResourceBar
          isCollapsed={resourceBarCollapsed}
          onToggle={setResourceBarCollapsed}
        />

        {/* Center Viewport */}
        <div className="flex-1 relative min-w-0">
          {/* Graphics Window */}
          <div className="h-full relative">
            <CrateViewer3D configuration={configuration} />
            
            {/* View Cube (Top Right) */}
            <ViewCube onViewChange={handleViewChange} />
            
            {/* Triad Manipulator (Bottom Left) */}
            <TriadManipulator
              onTransform={handleTransform}
              position={{ x: 0, y: 0, z: 0 }}
            />
            
            {/* Status Line (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 nx-status-line">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span>X: 0.000 Y: 0.000 Z: 0.000</span>
                  <span>|</span>
                  <span>Selection: None</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>Units: Inches</span>
                  <span>|</span>
                  <span>View: Isometric</span>
                  <span>|</span>
                  <span>Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        {propertiesPanelVisible && (
          <div className="w-80 flex flex-col border-l border-nx-border">
            {/* Properties Panel Header */}
            <div className="nx-toolbar border-b border-nx-border px-3 py-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold nx-text">Properties</h3>
              <div className="flex items-center space-x-1">
                <button 
                  className="nx-button p-1 text-xs" 
                  title="Refresh Properties"
                >
                  🔄
                </button>
                <button 
                  className="nx-button p-1 text-xs"
                  onClick={() => setPropertiesPanelVisible(false)}
                  title="Close Properties Panel"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Properties Content */}
            <div className="flex-1 overflow-hidden">
              <InputForms />
            </div>
          </div>
        )}

        {/* Properties Panel Toggle (when hidden) */}
        {!propertiesPanelVisible && (
          <button
            className="w-8 h-full nx-button border-l border-nx-border flex items-center justify-center"
            onClick={() => setPropertiesPanelVisible(true)}
            title="Show Properties Panel"
          >
            <span className="transform rotate-90 text-xs">Properties</span>
          </button>
        )}
      </div>

      {/* Context Menu Overlay (when needed) */}
      <div id="nx-context-menu" className="hidden fixed z-50 nx-panel border border-nx-border shadow-elevated">
        <div className="py-1">
          <div className="px-3 py-1 hover:bg-nx-hover text-xs cursor-pointer">Copy</div>
          <div className="px-3 py-1 hover:bg-nx-hover text-xs cursor-pointer">Paste</div>
          <div className="border-t border-nx-border my-1"></div>
          <div className="px-3 py-1 hover:bg-nx-hover text-xs cursor-pointer">Properties</div>
        </div>
      </div>

      {/* Keyboard Shortcuts Overlay */}
      <div className="fixed bottom-20 right-4 nx-panel border border-nx-border p-2 text-xs nx-text-secondary hidden" id="shortcuts-help">
        <div className="space-y-1">
          <div><kbd className="bg-nx-toolbar px-1 rounded">F8</kbd> Fit View</div>
          <div><kbd className="bg-nx-toolbar px-1 rounded">MB2</kbd> Rotate View</div>
          <div><kbd className="bg-nx-toolbar px-1 rounded">Wheel</kbd> Zoom</div>
          <div><kbd className="bg-nx-toolbar px-1 rounded">Ctrl+Z</kbd> Undo</div>
          <div><kbd className="bg-nx-toolbar px-1 rounded">Ctrl+Y</kbd> Redo</div>
          <div><kbd className="bg-nx-toolbar px-1 rounded">T</kbd> Translate</div>
          <div><kbd className="bg-nx-toolbar px-1 rounded">R</kbd> Rotate</div>
          <div><kbd className="bg-nx-toolbar px-1 rounded">S</kbd> Scale</div>
        </div>
      </div>
    </div>
  );
};

export default NXInterface;