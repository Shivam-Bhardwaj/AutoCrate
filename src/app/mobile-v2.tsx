'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { useCrateStore } from '@/store/crate-store';
import { useThemeStore } from '@/store/theme-store';
import { useLogsStore } from '@/store/logs-store';
import { 
  Sun, Moon, Plus, Minus, RotateCcw, FileOutput, 
  ChevronUp, ChevronDown, Settings, Eye, Package,
  Maximize2, Minimize2, Download, Share2
} from 'lucide-react';
import { APP_VERSION } from '@/utils/version';
import InputForms from '@/components/InputForms.clean';
import OutputSection from '@/components/OutputSection';

// Dynamically import 3D viewer
const CrateViewer3D = dynamic(() => import('@/components/CrateViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse">
        <Package className="h-12 w-12 text-gray-400" />
      </div>
    </div>
  ),
});

export default function MobileV2() {
  const configuration = useCrateStore((state) => state.configuration);
  const updateDimensions = useCrateStore((state) => state.updateDimensions);
  const resetConfiguration = useCrateStore((state) => state.resetConfiguration);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { logInfo } = useLogsStore();

  // UI State
  const [bottomSheetHeight, setBottomSheetHeight] = useState(120); // Collapsed height
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quickEditMode, setQuickEditMode] = useState(false);
  
  // Touch handling for bottom sheet
  const touchStartY = useRef(0);
  const currentSheetHeight = useRef(120);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Quick dimension adjustment
  const adjustDimension = (dimension: 'length' | 'width' | 'height', delta: number) => {
    const current = configuration.dimensions[dimension];
    const newValue = Math.max(10, Math.min(150, current + delta));
    updateDimensions({ [dimension]: newValue });
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    currentSheetHeight.current = bottomSheetHeight;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.touches[0].clientY;
    const newHeight = Math.max(120, Math.min(window.innerHeight * 0.8, currentSheetHeight.current + deltaY));
    setBottomSheetHeight(newHeight);
    setIsExpanded(newHeight > 300);
  };

  const toggleBottomSheet = () => {
    if (isExpanded) {
      setBottomSheetHeight(120);
      setIsExpanded(false);
    } else {
      setBottomSheetHeight(window.innerHeight * 0.6);
      setIsExpanded(true);
    }
  };

  const handleGenerate = () => {
    setShowOutput(true);
    logInfo('export', 'Generated NX expressions', 'Mobile quick action');
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  };

  const handleReset = () => {
    resetConfiguration();
    logInfo('system', 'Configuration reset', 'Mobile reset action');
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Minimal Header */}
      <header className={`flex items-center justify-between px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          AutoCrate
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* 3D Viewer - Main Focus */}
      <div className="flex-1 relative" style={{ paddingBottom: `${bottomSheetHeight}px` }}>
        <CrateViewer3D configuration={configuration} />
        
        {/* Quick Dimension Controls - Floating */}
        {quickEditMode && (
          <div className={`absolute top-4 left-4 right-4 ${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur rounded-lg p-3 shadow-lg`}>
            <div className="space-y-2">
              {(['width', 'length', 'height'] as const).map((dim) => (
                <div key={dim} className="flex items-center justify-between">
                  <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {dim}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => adjustDimension(dim, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className={`w-16 text-center font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {configuration.dimensions[dim]}"
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => adjustDimension(dim, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="default"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={() => setQuickEditMode(!quickEditMode)}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="default"
            className="h-14 w-14 rounded-full shadow-xl bg-primary"
            onClick={handleGenerate}
          >
            <FileOutput className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl shadow-2xl transition-all duration-300`}
        style={{ height: `${bottomSheetHeight}px` }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onClick={toggleBottomSheet}
        >
          <div className={`w-12 h-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
        </div>

        {/* Quick Stats - Always Visible */}
        <div className="px-4 pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-sm">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {configuration.dimensions.width}" × {configuration.dimensions.length}" × {configuration.dimensions.height}"
              </span>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {configuration.weight.product}lbs
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="h-8"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-4">
              {showOutput ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      NX Expressions
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowOutput(false)}
                    >
                      Back
                    </Button>
                  </div>
                  <OutputSection />
                </div>
              ) : (
                <div>
                  <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Configuration
                  </h3>
                  <InputForms />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}