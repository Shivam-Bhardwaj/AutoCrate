'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
<<<<<<< HEAD
import DashboardShell from '@/components/layout/DashboardShell';
import Topbar from '@/components/layout/Topbar';
import MainContent from '@/components/layout/MainContent';
import RightPanel from '@/components/layout/RightPanel';
import InputForms from '@/components/InputForms.clean';
=======
import InputForms from '@/components/InputForms';
import OutputSection from '@/components/OutputSection';
import LogsSection from '@/components/LogsSection';
import { Button } from '@/components/ui/button';
import { useCrateStore } from '@/store/crate-store';
import { useThemeStore } from '@/store/theme-store';
import { useLogsStore } from '@/store/logs-store';
import { Menu, X, Sun, Moon, RotateCcw, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import { APP_VERSION } from '@/utils/version';
import { TechStackDisplay } from '@/components/TechStackDisplay';
>>>>>>> 22bf0b1 (Fix build errors and add last updated to footer)

// Dynamic imports for better performance
const MobileV2 = dynamic(() => import('./mobile-v2'), {
  ssr: false,
});

export default function AutoCratePage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [_isMobile, setIsMobile] = useState(false);
  const [isHydrated, setHydrated] = useState(false);

  // Check if we're on mobile - use 480px breakpoint for mobile layout switch
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 480);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Force hydration after a timeout if it doesn't happen naturally
  useEffect(() => {
    if (!isHydrated) {
      const id = setTimeout(() => {
        try {
          setHydrated(true);
        } catch {
          /* noop */
        }
      }, 50);
      return () => clearTimeout(id);
    }
  }, [isHydrated]);

  // In test builds (E2E) always force desktop layout so selectors are stable.
  const _IS_TEST_BUILD = process.env.NODE_ENV === 'test';
  
  // Only show mobile layout after hydration and for very small screens
  if (isHydrated && _isMobile && !_IS_TEST_BUILD && typeof window !== 'undefined' && window.innerWidth < 480) {
    return <MobileV2 />;
  }

  // Render the professional dashboard layout
  return (
<<<<<<< HEAD
    <DashboardShell
      topbar={<Topbar showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />}
      sidebar={<InputForms />}
      main={<MainContent />}
      rightPanel={<RightPanel />}
    />
=======
    <div
      className={`min-h-screen md:h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      {/* Header */}
      <header
        className={`border-b px-4 py-2 md:py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1
              className={`text-xl md:text-2xl font-bold text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
              data-testid="app-title"
            >
              AutoCrate
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/docs">
              <Button
                variant="ghost"
                size="sm"
                className={`hidden sm:flex ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}
                aria-label="Open documentation"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </Link>
            <Link href="/active/documents">
              <Button
                variant="ghost"
                size="sm"
                className={`hidden sm:flex ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}
                aria-label="Open document processor"
              >
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
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
              className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input Section */}
        <div
          className={`w-full md:w-1/3 lg:w-1/4 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} ${showMobileMenu ? 'block' : 'hidden md:block'}`}
        >
          <div className="h-full flex flex-col">
            <div
              className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}
            >
              <h2
                className={`font-semibold text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                data-testid="section-product-config"
              >
                Product Configuration
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <InputForms />
            </div>
          </div>
        </div>

        {/* Center Panel - 3D Rendering */}
        <div className="flex-1 flex flex-col">
          {/* Top - 3D Viewer */}
          <div className={`flex-1 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="h-full flex flex-col">
              <div
                className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}
              >
                <h2
                  className={`font-semibold text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  data-testid="section-crate-visualization"
                >
                  Crate Visualization
                </h2>
              </div>
              <div className="flex-1 p-4">
                <div data-testid="crate-viewer-container" className="w-full h-full">
                  <CrateViewer3D configuration={configuration} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom - Logs Section */}
          <div className={`h-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="h-full flex flex-col">
              <div
                className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}
              >
                <h2
                  className={`font-semibold text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  data-testid="section-system-logs"
                >
                  System Logs
                </h2>
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
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              |
            </span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Last updated: September 10, 2025
            </span>
          </div>
        </div>
      </footer>
    </div>
>>>>>>> 22bf0b1 (Fix build errors and add last updated to footer)
  );
}