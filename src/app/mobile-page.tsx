'use client';

import { useState, useEffect } from 'react';
import InputForms from '@/components/InputForms';
import CrateViewer3D from '@/components/CrateViewer3D';
import OutputSection from '@/components/OutputSection';
import LogsSection from '@/components/LogsSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrateStore } from '@/store/crate-store';
import { useThemeStore } from '@/store/theme-store';
import { useLogsStore } from '@/store/logs-store';
import { Sun, Moon, RotateCcw, Settings, Eye, FileOutput, ScrollText } from 'lucide-react';

export default function MobileHome() {
  const [activeTab, setActiveTab] = useState('input');
  const configuration = useCrateStore((state) => state.configuration);
  const resetConfiguration = useCrateStore((state) => state.resetConfiguration);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { logInfo } = useLogsStore();

  useEffect(() => {
    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleReset = () => {
    resetConfiguration();
    logInfo('system', 'New project created', 'Configuration reset to defaults', 'MobilePage');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <header
        className={`sticky top-0 z-50 border-b px-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              AutoCrate
            </h1>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              NX CAD Generator
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className={`h-10 w-10 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`h-10 w-10 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Content with Tabs */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <TabsList
            className={`grid w-full grid-cols-4 rounded-none ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
          >
            <TabsTrigger
              value="input"
              className="flex flex-col gap-1 h-auto py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">Input</span>
            </TabsTrigger>
            <TabsTrigger
              value="viewer"
              className="flex flex-col gap-1 h-auto py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs">3D View</span>
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="flex flex-col gap-1 h-auto py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileOutput className="h-4 w-4" />
              <span className="text-xs">Output</span>
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="flex flex-col gap-1 h-auto py-2 px-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ScrollText className="h-4 w-4" />
              <span className="text-xs">Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="input" className="h-full m-0">
              <div className={`h-full overflow-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-4">
                  <h2
                    className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Configuration
                  </h2>
                  <InputForms />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="viewer" className="h-full m-0">
              <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="h-full p-4">
                  <h2
                    className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    3D Preview
                  </h2>
                  <div className="h-[calc(100vh-220px)]">
                    <CrateViewer3D configuration={configuration} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="output" className="h-full m-0">
              <div className={`h-full overflow-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-4">
                  <h2
                    className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Generated Output
                  </h2>
                  <OutputSection />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="h-full m-0">
              <div className={`h-full overflow-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-4">
                  <h2
                    className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    System Logs
                  </h2>
                  <LogsSection />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer with version */}
      <footer
        className={`border-t px-4 py-2 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>v2.2.0</span>
      </footer>
    </div>
  );
}
