'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useCrateStore } from '@/store/crate-store';
import { ChevronUp, ChevronDown, Package } from 'lucide-react';

// Dynamic import for 3D viewer
const CrateViewer3D = dynamic(() => import('@/components/CrateViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
      <div className="text-center">
        <Package className="h-12 w-12 text-slate-400 mx-auto mb-2 animate-pulse" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading 3D Viewer...</p>
      </div>
    </div>
  ),
});

const LogsSection = dynamic(() => import('@/components/LogsSection'), {
  ssr: false
});

export default function MainContent() {
  const { configuration } = useCrateStore();
  const [logsExpanded, setLogsExpanded] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* 3D Viewer - Main Content */}
      <div className="flex-1 min-h-0 p-4">
        <div className="h-full rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm shadow-lg overflow-hidden">
          {/* Viewer Header */}
          <div className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-cyan-900/20 dark:to-blue-900/20 border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">3D</span>
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                  3D Crate Visualization
                </h2>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Real-time rendering • {configuration.dimensions.width}" × {configuration.dimensions.length}" × {configuration.dimensions.height}"
              </div>
            </div>
          </div>

          {/* 3D Viewer Content */}
          <div className="h-full p-4" style={{ height: 'calc(100% - 60px)' }}>
            <CrateViewer3D configuration={configuration} />
          </div>
        </div>
      </div>

      {/* Logs Section - Collapsible Bottom Panel */}
      <div 
        className={`border-t border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl transition-all duration-300 ${
          logsExpanded ? 'h-64' : 'h-12'
        }`}
      >
        {/* Logs Header */}
        <button
          onClick={() => setLogsExpanded(!logsExpanded)}
          className="w-full h-12 px-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-white text-xs">LOG</span>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              System Logs
            </h3>
          </div>
          {logsExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          )}
        </button>

        {/* Logs Content */}
        {logsExpanded && (
          <div className="h-52 overflow-hidden">
            <LogsSection />
          </div>
        )}
      </div>
    </div>
  );
}