'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/theme-store';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { BookOpen, RotateCcw, Sun, Moon, Menu, X, Zap } from 'lucide-react';

interface TopbarProps {
  showMobileMenu?: boolean;
  setShowMobileMenu?: (show: boolean) => void;
}

export default function Topbar({ showMobileMenu, setShowMobileMenu }: TopbarProps) {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { resetConfiguration } = useCrateStore();
  const { logInfo } = useLogsStore();

  const handleReset = () => {
    resetConfiguration();
    logInfo('system', 'New project created', 'Configuration reset to defaults', 'Topbar');
  };

  return (
    <div className="flex items-center justify-between h-full px-8 relative">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
      <div className="relative z-10 flex items-center justify-between w-full">
      {/* Left Side - Logo and Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 text-transparent bg-clip-text text-glow">
              AutoCrate
            </h1>
            <p className="text-sm font-medium text-white/70">
              Engineering Excellence Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-4">
        <Link href="/docs">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex transition-all duration-300 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 hover:border-white/40 backdrop-blur-xl"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Docs
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="transition-all duration-300 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/50 hover:border-emerald-300 text-white hover:bg-emerald-400/30 backdrop-blur-xl hover:scale-105 shadow-lg"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          New Project
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="transition-all duration-300 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 hover:border-purple-300 text-white hover:bg-purple-400/30 backdrop-blur-xl hover:scale-105 shadow-lg"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Mobile Menu Toggle */}
        {setShowMobileMenu && (
          <button
            className="lg:hidden p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 backdrop-blur-xl"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        )}
      </div>
      </div>
    </div>
  );
}