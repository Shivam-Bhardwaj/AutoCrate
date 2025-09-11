'use client';

import React, { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { useThemeStore } from '@/store/theme-store';
import { PerformanceMonitor } from '@/utils/performanceMonitor';
import { Moon, Sun, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load heavy components with code splitting
const CrateViewer3D = dynamic(
  () => import('@/components/CrateViewer3D'),
  {
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted/10 rounded-lg">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading 3D viewer...</p>
        </div>
      </div>
    ),
    ssr: false // Disable SSR for Three.js components
  }
);

const InputFormsOptimized = dynamic(
  () => import('@/components/InputFormsOptimized'),
  {
    loading: () => (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    )
  }
);

const OutputSection = dynamic(
  () => import('@/components/OutputSection'),
  {
    loading: () => (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }
);

const KPIStrip = dynamic(
  () => import('@/components/dashboard/KPIStrip'),
  {
    loading: () => (
      <div className="grid grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-xl" />
          </div>
        ))}
      </div>
    )
  }
);

const StatusPanel = dynamic(
  () => import('@/components/dashboard/StatusPanel'),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    )
  }
);

const InsightsPanel = dynamic(
  () => import('@/components/dashboard/InsightsPanel'),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    )
  }
);

// Lazy load non-critical components
const LogsSection = lazy(() => import('@/components/LogsSection'));
const ExportDialog = lazy(() => import('@/components/ExportDialog').then(module => ({ default: module.ExportDialog })));
const NXInstructions = lazy(() => import('@/components/NXInstructions'));

// Main optimized page component
export default function OptimizedPage() {
  const { configuration, resetConfiguration } = useCrateStore();
  const { clearLogs } = useLogsStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'logs' | 'nx'>('input');
  const [showExport, setShowExport] = useState(false);

  // Measure initial render performance
  React.useEffect(() => {
    PerformanceMonitor.start('page-initial-render', 'render');
    
    // Report metrics after initial render
    const timer = setTimeout(() => {
      const metric = PerformanceMonitor.end('page-initial-render');
      if (metric) {
        console.log(`Initial render completed in ${metric.duration.toFixed(0)}ms`);
      }
      
      // Check if we're hitting 60 FPS
      let frameCount = 0;
      let lastTime = performance.now();
      const checkFPS = () => {
        frameCount++;
        const currentTime = performance.now();
        const delta = currentTime - lastTime;
        
        if (delta >= 1000) {
          const fps = Math.round((frameCount * 1000) / delta);
          console.log(`Current FPS: ${fps}`);
          frameCount = 0;
          lastTime = currentTime;
        }
        
        if (currentTime - lastTime < 5000) {
          requestAnimationFrame(checkFPS);
        }
      };
      requestAnimationFrame(checkFPS);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Memoize tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'input':
        return <InputFormsOptimized />;
      case 'output':
        return <OutputSection />;
      case 'logs':
        return (
          <Suspense fallback={<div className="p-6">Loading logs...</div>}>
            <LogsSection />
          </Suspense>
        );
      case 'nx':
        return (
          <Suspense fallback={<div className="p-6">Loading instructions...</div>}>
            <NXInstructions />
          </Suspense>
        );
      default:
        return null;
    }
  }, [activeTab]);

  // Handle tab changes
  const handleTabChange = useCallback((tab: typeof activeTab) => {
    PerformanceMonitor.start(`tab-change-${tab}`, 'ui');
    setActiveTab(tab);
    setTimeout(() => {
      const metric = PerformanceMonitor.end(`tab-change-${tab}`);
      if (metric) {
        console.log(`Tab change to ${tab} took ${metric.duration.toFixed(0)}ms`);
      }
    }, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Professional Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">AC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  AutoCrate Professional
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  3D Crate Designer & NX CAD Integration
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExport(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Export STEP
              </button>
              <button
                onClick={resetConfiguration}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={toggleTheme}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="container mx-auto px-6 py-4">
        <KPIStrip />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Input/Output */}
          <div className="col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                {(['input', 'output', 'logs', 'nx'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Tab Content */}
              <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                {tabContent}
              </div>
            </div>
          </div>

          {/* Center - 3D Viewer */}
          <div className="col-span-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  3D Visualization
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Live Preview</span>
                </div>
              </div>
              <div className="h-[calc(100%-2rem)] bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden">
                <CrateViewer3D configuration={configuration} />
              </div>
            </div>
          </div>

          {/* Right Panel - Status & Insights */}
          <div className="col-span-3 space-y-6">
            <StatusPanel />
            <InsightsPanel />
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <Suspense fallback={null}>
        <ExportDialog />
      </Suspense>
    </div>
  );
}