'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import InputForms from '@/components/InputForms';
import CrateViewer3D from '@/components/CrateViewer3D';
import OutputSection from '@/components/OutputSection';
import LogsSection from '@/components/LogsSection';
import { Button } from '@/components/ui/button';
import { useCrateStore } from '@/store/crate-store';
import { useThemeStore } from '@/store/theme-store';
import { useLogsStore } from '@/store/logs-store';
import { Menu, X, Sun, Moon, RotateCcw } from 'lucide-react';
import { APP_VERSION } from '@/utils/version';

// Dynamically import mobile page for better code splitting
const MobileHome = dynamic(() => import('./mobile-page'), { ssr: false });

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const configuration = useCrateStore((state) => state.configuration);
  const resetConfiguration = useCrateStore((state) => state.resetConfiguration);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { logInfo } = useLogsStore();

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [isDarkMode]);

  const handleReset = () => {
    resetConfiguration();
    logInfo('system', 'New project created', 'Configuration reset to defaults', 'MainPage');
  };

  // Return mobile layout for small screens
  if (isMobile) {
    return <MobileHome />;
  }

  return (
    <div
      className={`min-h-screen md:h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}
    >
      {/* Header */}
      <header
        className={`border-b px-4 py-2 md:py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1
              className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
            >
              AutoCrate
            </h1>
            <div className="flex flex-col">
              <span
                className={`hidden sm:inline text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                NX CAD Expression Generator
              </span>
              <span
                className={`hidden sm:inline text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
              >
                v{APP_VERSION} - Now with automatic skid sizing
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className={isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <button className="lg:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
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
              <h2 className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Input Section
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
                <h2 className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  3D Rendering
                </h2>
              </div>
              <div className="flex-1 p-4">
                <CrateViewer3D configuration={configuration} />
              </div>
            </div>
          </div>

          {/* Bottom - Logs Section */}
          <div className={`h-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="h-full flex flex-col">
              <div
                className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}
              >
                <h2 className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
              <h2 className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Output Section
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <OutputSection />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with version */}
      <footer
        className={`border-t px-4 py-2 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          v{APP_VERSION}
        </span>
      </footer>
    </div>
  );
}
