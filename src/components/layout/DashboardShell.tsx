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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default collapsed for dashboard view
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
    <div className={`h-screen overflow-hidden relative ${isDarkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900' : 'bg-engineering'}`}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-white/20"></div>
      {/* CSS Grid Container - Full Viewport */}
      <div 
        className={`relative z-10 h-full grid grid-rows-[70px_1fr] transition-all duration-500 ease-in-out ${
          sidebarCollapsed && rightPanelCollapsed
            ? 'grid-cols-[80px_1fr_80px]'
            : sidebarCollapsed
            ? 'grid-cols-[80px_1fr_400px] xl:grid-cols-[80px_1fr_450px]'
            : rightPanelCollapsed
            ? 'grid-cols-[350px_1fr_80px] xl:grid-cols-[380px_1fr_80px]'
            : 'grid-cols-[350px_1fr_400px] xl:grid-cols-[380px_1fr_450px]'
        }`}
      >
        {/* Header Row - Spans Full Width */}
        <header className={`col-span-3 border-b border-white/20 ${isDarkMode ? 'glass-morphism-dark' : 'glass-morphism'} backdrop-blur-2xl`}>
          {topbar}
        </header>

        {/* Sidebar Panel */}
        <aside 
          className={`border-r border-white/20 ${isDarkMode ? 'glass-morphism-dark' : 'glass-morphism'} backdrop-blur-2xl transition-all duration-500 ease-in-out ${
            sidebarCollapsed ? 'overflow-hidden' : 'min-h-0'
          } card-glow`}
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
        <main className="min-h-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
          <div className="relative z-10 h-full">
            {main}
          </div>
        </main>

        {/* Right Panel */}
        <aside 
          className={`border-l border-white/20 ${isDarkMode ? 'glass-morphism-dark' : 'glass-morphism'} backdrop-blur-2xl transition-all duration-500 ease-in-out ${
            rightPanelCollapsed ? 'overflow-hidden' : 'min-h-0'
          } card-glow`}
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