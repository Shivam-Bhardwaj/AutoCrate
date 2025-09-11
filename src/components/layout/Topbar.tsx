'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/theme-store';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { BookOpen, RotateCcw, Sun, Moon, Menu, X } from 'lucide-react';

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
    <div className="flex items-center justify-between h-full px-6">
      {/* Left Side - Logo and Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-lg font-bold">🏗️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 text-transparent bg-clip-text">
              AutoCrate
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Professional Engineering Suite
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-3">
        <Link href="/docs">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="transition-all duration-300 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          New Project
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="transition-all duration-300 border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Mobile Menu Toggle */}
        {setShowMobileMenu && (
          <button
            className="lg:hidden p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}