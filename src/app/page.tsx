'use client';

import { useState } from 'react';
import InputForms from '@/components/InputForms';
import CrateViewer3D from '@/components/CrateViewer3D';
import OutputSection from '@/components/OutputSection';
import { Button } from '@/components/ui/button';
import { useCrateStore } from '@/store/crate-store';
import { LogIn, User, Menu, X } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const configuration = useCrateStore((state) => state.configuration);
  const resetConfiguration = useCrateStore((state) => state.resetConfiguration);

  const handleLogin = () => {
    // Placeholder for authentication logic
    setIsLoggedIn(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">AutoCrate</h1>
            <span className="text-sm text-gray-500">NX CAD Expression Generator</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={resetConfiguration}>
              New Project
            </Button>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="text-sm">Engineer</span>
              </div>
            ) : (
              <Button size="sm" onClick={handleLogin}>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
            <button className="lg:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input Section */}
        <div
          className={`w-full lg:w-1/4 border-r border-gray-200 bg-white ${showMobileMenu ? 'block' : 'hidden lg:block'}`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-700">Input Section</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <InputForms />
            </div>
          </div>
        </div>

        {/* Center Panel - 3D Rendering */}
        <div className="flex-1 flex flex-col">
          {/* Top - 3D Viewer */}
          <div className="flex-1 border-b border-gray-200">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-700">3D Rendering</h2>
              </div>
              <div className="flex-1 p-4">
                <CrateViewer3D configuration={configuration} />
              </div>
            </div>
          </div>

          {/* Bottom - Login Section (if not logged in) */}
          {!isLoggedIn && (
            <div className="h-1/3 bg-white">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-gray-700">Login Section</h2>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Sign in to access advanced features and save your projects
                    </p>
                    <Button onClick={handleLogin}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Login with Company Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Output Section */}
        <div
          className={`w-full lg:w-1/4 border-l border-gray-200 bg-white ${showMobileMenu ? 'hidden' : 'block'}`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-700">Output Section</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <OutputSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
