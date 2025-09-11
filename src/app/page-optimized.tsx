'use client';

import React, { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { PerformanceMonitor } from '@/utils/performanceMonitor';
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
const ExportDialog = lazy(() => import('@/components/ExportDialog'));
const NXInstructions = lazy(() => import('@/components/NXInstructions'));

// Main optimized page component
export default function OptimizedPage() {
  const { configuration } = useCrateStore();
  const { clearLogs } = useLogsStore();
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
    PerformanceMonitor.start(`tab-change-${tab}`, 'interaction');
    setActiveTab(tab);
    setTimeout(() => {
      const metric = PerformanceMonitor.end(`tab-change-${tab}`);
      if (metric) {
        console.log(`Tab change to ${tab} took ${metric.duration.toFixed(0)}ms`);
      }
    }, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="glass-morphism backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <span className="text-white text-xl font-black">AC</span>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutoCrate Pro
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Optimized Edition v2.0
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowExport(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Export
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-white/10 backdrop-blur text-slate-700 dark:text-slate-300 rounded-lg hover:bg-white/20 transition-all"
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
            <div className="glass-morphism backdrop-blur-2xl rounded-2xl overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-white/10">
                {(['input', 'output', 'logs', 'nx'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/5'
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
            <div className="glass-morphism backdrop-blur-2xl rounded-2xl p-6 h-[600px]">
              <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                3D Visualization
              </h2>
              <div className="h-[calc(100%-2rem)]">
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
      {showExport && (
        <Suspense fallback={null}>
          <ExportDialog onClose={() => setShowExport(false)} />
        </Suspense>
      )}
    </div>
  );
}