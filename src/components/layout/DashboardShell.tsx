'use client';

import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/theme-store';

interface DashboardShellProps {
  topbar: React.ReactNode;
  sidebar: React.ReactNode;
  main: React.ReactNode;
  rightPanel: React.ReactNode;
}

export default function DashboardShell({ topbar, sidebar, main, rightPanel }: DashboardShellProps) {
  const { isDarkMode } = useThemeStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Auto-collapse panels on small screens to prevent overflow
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
        setRightPanelCollapsed(true);
      }
    };
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`h-screen overflow-hidden ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      {/* CSS Grid Container - Full Viewport */}
      <div 
        className={`h-full grid grid-rows-[60px_1fr] transition-all duration-300 ${
          sidebarCollapsed && rightPanelCollapsed
            ? 'grid-cols-[60px_1fr_60px]'
            : sidebarCollapsed
            ? 'grid-cols-[60px_1fr_380px] xl:grid-cols-[60px_1fr_420px]'
            : rightPanelCollapsed
            ? 'grid-cols-[320px_1fr_60px] xl:grid-cols-[360px_1fr_60px]'
            : 'grid-cols-[320px_1fr_380px] xl:grid-cols-[360px_1fr_420px]'
        }`}
      >
        {/* Header Row - Spans Full Width */}
        <header className="col-span-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          {topbar}
        </header>

        {/* Sidebar Panel */}
        <aside 
          className={`border-r border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl transition-all duration-300 ${
            sidebarCollapsed ? 'overflow-hidden' : 'min-h-0'
          }`}
        >
          <div className="h-full overflow-y-auto">
            {sidebarCollapsed ? (
              <div className="p-3">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="w-full p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors"
                  title="Expand Configuration"
                >
                  Config
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-400"
                  title="Collapse Configuration"
                >
                  ←
                </button>
                {sidebar}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-h-0 bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
          {main}
        </main>

        {/* Right Panel */}
        <aside 
          className={`border-l border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl transition-all duration-300 ${
            rightPanelCollapsed ? 'overflow-hidden' : 'min-h-0'
          }`}
        >
          <div className="h-full overflow-y-auto">
            {rightPanelCollapsed ? (
              <div className="p-3">
                <button
                  onClick={() => setRightPanelCollapsed(false)}
                  className="w-full p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 transition-colors"
                  title="Expand Output Panel"
                >
                  Output
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setRightPanelCollapsed(true)}
                  className="absolute top-3 left-3 z-10 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-400"
                  title="Collapse Output Panel"
                >
                  →
                </button>
                {rightPanel}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}