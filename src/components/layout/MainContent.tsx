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
    <div className="h-full flex flex-col overflow-hidden">
      {/* 3D Viewer - Main Content */}
      <div className="flex-1 min-h-0 p-6">
        <div className="h-full rounded-2xl glass-morphism border border-white/30 backdrop-blur-2xl card-glow overflow-hidden group hover:scale-[1.02] transition-all duration-500">
          {/* Viewer Header */}
          <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-b border-white/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">3D</span>
                </div>
                <h2 className="font-bold text-xl text-white text-glow">
                  3D Crate Visualization
                </h2>
              </div>
              <div className="text-sm text-white/80 font-medium">
                Real-time rendering • {configuration.dimensions.width}" × {configuration.dimensions.length}" × {configuration.dimensions.height}"
              </div>
            </div>
          </div>

          {/* 3D Viewer Content */}
          <div className="relative" style={{ height: 'calc(100% - 72px)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-800/40"></div>
            <div className="relative z-10 h-full p-6">
              <CrateViewer3D configuration={configuration} />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Section - Collapsible Bottom Panel */}
      <div 
        className={`border-t border-white/20 glass-morphism backdrop-blur-2xl transition-all duration-500 ease-in-out ${
          logsExpanded ? 'h-64' : 'h-14'
        }`}
      >
        {/* Logs Header */}
        <button
          onClick={() => setLogsExpanded(!logsExpanded)}
          className="w-full h-14 px-6 flex items-center justify-between hover:bg-white/10 transition-all duration-300 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xs">LOG</span>
            </div>
            <h3 className="font-bold text-lg text-white text-glow">
              System Logs
            </h3>
          </div>
          {logsExpanded ? (
            <ChevronDown className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
          ) : (
            <ChevronUp className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
          )}
        </button>

        {/* Logs Content */}
        {logsExpanded && (
          <div className="h-50 overflow-hidden bg-black/20 border-t border-white/10">
            <LogsSection />
          </div>
        )}
      </div>
    </div>
  );
}