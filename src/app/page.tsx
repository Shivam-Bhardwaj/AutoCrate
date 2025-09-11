'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import InputForms from '@/components/InputForms';
import OutputSection from '@/components/OutputSection';
import LogsSection from '@/components/LogsSection';
import { Button } from '@/components/ui/button';
import { useCrateStore } from '@/store/crate-store';
import { useThemeStore } from '@/store/theme-store';
import { useLogsStore } from '@/store/logs-store';
import { Menu, X, Sun, Moon, RotateCcw, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { APP_VERSION } from '@/utils/version';
import { TechStackDisplay } from '@/components/TechStackDisplay';

// Dynamically import mobile page for better code splitting
const MobileV2 = dynamic(() => import('./mobile-v2'), { ssr: false });

// Dynamically import CrateViewer3D to avoid SSR issues with Three.js
const CrateViewer3D = dynamic(() => import('@/components/CrateViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D viewer...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [_isMobile, setIsMobile] = useState(false);
  const configuration = useCrateStore((state) => state.configuration);
  const resetConfiguration = useCrateStore((state) => state.resetConfiguration);
  const { isDarkMode, toggleTheme, isHydrated, setHydrated } = useThemeStore();
  const { logInfo } = useLogsStore();

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fallback hydration guard: if persistence rehydration fails quickly (e.g., headless E2E env), force hydration
  useEffect(() => {
    if (!isHydrated) {
      // Allow one tick for persist middleware, then force
      const id = setTimeout(() => {
        try {
          setHydrated();
        } catch {
          /* noop */
        }
      }, 50);
      return () => clearTimeout(id);
    }
  }, [isHydrated, setHydrated]);

  const handleReset = () => {
    resetConfiguration();
    logInfo('system', 'New project created', 'Configuration reset to defaults', 'MainPage');
  };

  // In test builds (E2E) always force desktop layout so selectors are stable.
  const _IS_TEST_BUILD = process.env.NODE_ENV === 'test';
  // Use new mobile experience for mobile devices
  if (_isMobile && !_IS_TEST_BUILD) {
    return <MobileV2 />;
  }

  // Previously returned a skeleton until hydration; now we always render full layout so E2E selectors are present immediately.

  return (
    <div
      className={`min-h-screen md:h-screen flex flex-col relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/2 -right-1/2 w-full h-full rounded-full ${
          isDarkMode 
            ? 'bg-gradient-to-l from-purple-500/20 to-blue-500/20 blur-3xl' 
            : 'bg-gradient-to-l from-purple-200/30 to-blue-200/30 blur-3xl'
        }`} />
        <div className={`absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full ${
          isDarkMode 
            ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 blur-3xl' 
            : 'bg-gradient-to-r from-indigo-200/30 to-cyan-200/30 blur-3xl'
        }`} />
      </div>

      {/* Header */}
      <header
        className={`backdrop-blur-xl border-b px-4 py-4 relative z-10 ${
          isDarkMode 
            ? 'bg-slate-800/80 border-slate-700/50' 
            : 'bg-white/80 border-white/50'
        } shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1
              className={`text-xl md:text-3xl font-bold text-center bg-gradient-to-r ${
                isDarkMode 
                  ? 'from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text'
                  : 'from-blue-600 via-purple-600 to-cyan-600 text-transparent bg-clip-text'
              }`}
              data-testid="app-title"
            >
              AutoCrate
            </h1>
            <p className={`text-center text-sm mt-1 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Professional Crate Design Suite
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/docs">
              <Button
                variant="ghost"
                size="sm"
                className={`hidden sm:flex transition-all duration-300 ${
                  isDarkMode 
                    ? 'hover:bg-slate-700/50 text-slate-300 hover:text-white backdrop-blur-sm' 
                    : 'hover:bg-white/50 text-slate-700 hover:text-slate-900 backdrop-blur-sm'
                }`}
                aria-label="Open documentation"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className={`transition-all duration-300 ${
                isDarkMode 
                  ? 'border-slate-600 hover:border-purple-400 hover:bg-purple-500/10 text-slate-300 hover:text-white backdrop-blur-sm' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-500/10 text-slate-700 hover:text-blue-600 backdrop-blur-sm'
              }`}
              aria-label="Create new project and reset all configuration"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
              className={`transition-all duration-300 ${
                isDarkMode 
                  ? 'border-slate-600 hover:border-yellow-400 hover:bg-yellow-500/10 text-slate-300 hover:text-yellow-300 backdrop-blur-sm' 
                  : 'border-slate-300 hover:border-purple-400 hover:bg-purple-500/10 text-slate-700 hover:text-purple-600 backdrop-blur-sm'
              }`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <button
              className="lg:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label={showMobileMenu ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {showMobileMenu ? (
                <X className={`h-6 w-6 ${isDarkMode ? 'text-gray-100' : ''}`} />
              ) : (
                <Menu className={`h-6 w-6 ${isDarkMode ? 'text-gray-100' : ''}`} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout - Desktop Only */}
      <div className="flex-1 flex overflow-hidden relative z-10 gap-6 p-6">
        {/* Left Panel - Input Section */}
        <div
          className={`w-full md:w-1/3 lg:w-1/4 backdrop-blur-xl rounded-2xl border shadow-2xl transition-all duration-500 ${
            isDarkMode 
              ? 'bg-slate-800/40 border-slate-700/50 shadow-slate-900/50' 
              : 'bg-white/40 border-white/50 shadow-slate-200/50'
          } ${showMobileMenu ? 'block' : 'hidden md:block'}`}
        >
          <div className="h-full flex flex-col">
            <div
              className={`p-6 border-b backdrop-blur-sm rounded-t-2xl ${
                isDarkMode 
                  ? 'border-slate-700/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10' 
                  : 'border-slate-200/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10'
              }`}
            >
              <h2
                className={`font-bold text-center text-lg ${
                  isDarkMode ? 'text-slate-100' : 'text-slate-800'
                }`}
                data-testid="section-product-config"
              >
                ⚙️ Product Configuration
              </h2>
              <p className={`text-center text-sm mt-2 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Design your perfect crate
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <InputForms />
            </div>
          </div>
        </div>

        {/* Center Panel - 3D Rendering */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Top - 3D Viewer */}
          <div className={`flex-1 backdrop-blur-xl rounded-2xl border shadow-2xl transition-all duration-500 ${
            isDarkMode 
              ? 'bg-slate-800/30 border-slate-700/50 shadow-slate-900/50' 
              : 'bg-white/30 border-white/50 shadow-slate-200/50'
          }`}>
            <div className="h-full flex flex-col">
              <div
                className={`p-6 border-b backdrop-blur-sm rounded-t-2xl ${
                  isDarkMode 
                    ? 'border-slate-700/50 bg-gradient-to-r from-cyan-500/10 to-purple-500/10' 
                    : 'border-slate-200/50 bg-gradient-to-r from-purple-500/10 to-cyan-500/10'
                }`}
              >
                <h2
                  className={`font-bold text-center text-lg ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}
                  data-testid="section-crate-visualization"
                >
                  🎯 3D Crate Visualization
                </h2>
                <p className={`text-center text-sm mt-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Real-time 3D rendering
                </p>
              </div>
              <div className="flex-1 p-6">
                <div data-testid="crate-viewer-container" className={`w-full h-full rounded-xl border overflow-hidden ${
                  isDarkMode 
                    ? 'border-slate-700/50 bg-slate-900/50' 
                    : 'border-slate-200/50 bg-slate-50/50'
                }`}>
                  <CrateViewer3D configuration={configuration} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom - Logs Section */}
          <div className={`h-1/3 backdrop-blur-xl rounded-2xl border shadow-2xl transition-all duration-500 ${
            isDarkMode 
              ? 'bg-slate-800/40 border-slate-700/50 shadow-slate-900/50' 
              : 'bg-white/40 border-white/50 shadow-slate-200/50'
          }`}>
            <div className="h-full flex flex-col">
              <div
                className={`p-6 border-b backdrop-blur-sm rounded-t-2xl ${
                  isDarkMode 
                    ? 'border-slate-700/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10' 
                    : 'border-slate-200/50 bg-gradient-to-r from-teal-500/10 to-emerald-500/10'
                }`}
              >
                <h2
                  className={`font-bold text-center text-lg ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}
                  data-testid="section-system-logs"
                >
                  📊 System Logs
                </h2>
                <p className={`text-center text-sm mt-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Real-time activity monitoring
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <LogsSection />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Output Section */}
        <div
          className={`w-full md:w-1/3 lg:w-1/4 border-l ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} hidden md:block`}
        >
          <div className="h-full flex flex-col">
            <div
              className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}
            >
              <h2
                className={`font-semibold text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                data-testid="section-design-analysis"
              >
                Design Analysis
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <OutputSection />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with version and tech stack */}
      <footer
        className={`border-t px-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Built with
              </span>
              <TechStackDisplay />
            </div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              v{APP_VERSION}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
