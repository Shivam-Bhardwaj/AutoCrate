'use client';

import { useEffect, useRef, useState } from 'react';
import { useLogsStore, LogType, LogCategory } from '@/store/logs-store';
import { useThemeStore } from '@/store/theme-store';
import { useCrateStore } from '@/store/crate-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Pause,
  Play,
  Filter,
  Bug,
  User,
  Settings,
  Search,
  X,
} from 'lucide-react';

export default function LogsSection() {
  const logs = useLogsStore((state) => state.logs);
  const getFilteredLogs = useLogsStore((state) => state.getFilteredLogs);
  const logInfo = useLogsStore((state) => state.logInfo);
  const clearLogs = useLogsStore((state) => state.clearLogs);
  const exportLogs = useLogsStore((state) => state.exportLogs);
  const setFilter = useLogsStore((state) => state.setFilter);
  const isPaused = useLogsStore((state) => state.isPaused);
  const togglePause = useLogsStore((state) => state.togglePause);
  const getLogStats = useLogsStore((state) => state.getLogStats);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const configuration = useCrateStore((state) => state.configuration);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const prevConfigRef = useRef(configuration);
  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<LogType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<LogCategory[]>([]);

  const filteredLogs = getFilteredLogs();
  const stats = getLogStats();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (logsEndRef.current && !isPaused) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  useEffect(() => {
    // Apply filters
    setFilter({
      searchTerm: searchTerm || undefined,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    });
  }, [searchTerm, selectedTypes, selectedCategories, setFilter]);

  useEffect(() => {
    // Log configuration changes with enhanced detail
    if (prevConfigRef.current !== configuration) {
      const prev = prevConfigRef.current;

      // Dimension changes
      if (prev.dimensions !== configuration.dimensions) {
        logInfo(
          'dimension',
          'Dimensions updated',
          `${configuration.dimensions.length}x${configuration.dimensions.width}x${configuration.dimensions.height} inches`,
          'CrateConfiguration'
        );
      }

      // Base changes
      if (prev.base !== configuration.base) {
        logInfo(
          'base',
          'Base configuration changed',
          `Type: ${configuration.base.type}, Skids: ${configuration.base.skidCount}`,
          'CrateConfiguration'
        );
      }

      // Panel changes
      if (prev.cap !== configuration.cap) {
        logInfo(
          'panel',
          'Panel configuration updated',
          'Panel thicknesses or materials modified',
          'CrateConfiguration'
        );
      }

      // Fastener changes
      if (prev.fasteners !== configuration.fasteners) {
        logInfo(
          'fastener',
          'Fasteners updated',
          `Type: ${configuration.fasteners.type}, Spacing: ${configuration.fasteners.spacing}`,
          'CrateConfiguration'
        );
      }

      // Vinyl changes
      if (prev.vinyl !== configuration.vinyl) {
        logInfo(
          'vinyl',
          'Vinyl settings changed',
          configuration.vinyl?.enabled
            ? `Enabled: ${configuration.vinyl?.type} (${configuration.vinyl?.coverage})`
            : 'Disabled',
          'CrateConfiguration'
        );
      }

      // Weight changes
      if (prev.weight !== configuration.weight) {
        logInfo(
          'weight',
          'Weight parameters updated',
          `Product: ${configuration.weight.product}kg`,
          'CrateConfiguration'
        );
      }

      prevConfigRef.current = configuration;
    }
  }, [configuration, logInfo]);

  const getLogIcon = (type: LogType) => {
    switch (type) {
      case 'info':
        return <Info className="h-3 w-3" />;
      case 'success':
        return <CheckCircle className="h-3 w-3" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />;
      case 'error':
        return <XCircle className="h-3 w-3" />;
      case 'debug':
        return <Bug className="h-3 w-3" />;
      case 'user':
        return <User className="h-3 w-3" />;
      case 'system':
        return <Settings className="h-3 w-3" />;
    }
  };

  const getLogColor = (type: LogType) => {
    if (isDarkMode) {
      switch (type) {
        case 'info':
          return 'text-blue-400';
        case 'success':
          return 'text-green-400';
        case 'warning':
          return 'text-yellow-400';
        case 'error':
          return 'text-red-400';
        case 'debug':
          return 'text-purple-400';
        case 'user':
          return 'text-cyan-400';
        case 'system':
          return 'text-gray-400';
      }
    } else {
      switch (type) {
        case 'info':
          return 'text-blue-600';
        case 'success':
          return 'text-green-700';
        case 'warning':
          return 'text-amber-700';
        case 'error':
          return 'text-red-600';
        case 'debug':
          return 'text-purple-600';
        case 'user':
          return 'text-cyan-600';
        case 'system':
          return 'text-gray-600';
      }
    }
  };

  const getCategoryBadgeColor = (category: LogCategory) => {
    const colors = {
      dimension: 'bg-blue-500',
      panel: 'bg-green-500',
      base: 'bg-yellow-500',
      fastener: 'bg-red-500',
      vinyl: 'bg-purple-500',
      weight: 'bg-indigo-500',
      export: 'bg-pink-500',
      import: 'bg-orange-500',
      ui: 'bg-teal-500',
      render: 'bg-cyan-700',
      calculation: 'bg-lime-500',
      validation: 'bg-rose-500',
      navigation: 'bg-violet-500',
      system: 'bg-gray-500',
      config: 'bg-amber-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleExport = () => {
    const data = exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autocrate-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleType = (type: LogType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleCategory = (category: LogCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const logTypes: LogType[] = ['info', 'success', 'warning', 'error', 'debug', 'user', 'system'];
  const logCategories: LogCategory[] = [
    'dimension',
    'panel',
    'base',
    'fastener',
    'vinyl',
    'weight',
    'export',
    'import',
    'ui',
    'render',
    'calculation',
    'validation',
    'navigation',
    'system',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced header with controls */}
      <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {filteredLogs.length} / {logs.length} entries
            </span>
            {isPaused && <span className="text-xs text-yellow-500 font-medium">PAUSED</span>}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-7 px-2 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              aria-label={showFilters ? 'Hide log filters' : 'Show log filters'}
            >
              <Filter className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePause}
              className={`h-7 px-2 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              aria-label={isPaused ? 'Resume log stream' : 'Pause log stream'}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExport}
              className={`h-7 px-2 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              aria-label="Export logs as JSON file"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearLogs}
              className={`h-7 px-2 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              aria-label="Clear all logs"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-2">
          <Search
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`h-7 pl-7 pr-7 text-xs ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className={`p-2 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Type Filters</span>
                {selectedTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedTypes([])}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {logTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      selectedTypes.includes(type)
                        ? getLogColor(type) + ' bg-opacity-20'
                        : isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Category Filters</span>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {logCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                      selectedCategories.includes(category)
                        ? getCategoryBadgeColor(category) + ' text-white'
                        : isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="flex items-center gap-3 text-xs">
          <span className={getLogColor('info')}>Info: {stats.byType.info || 0}</span>
          <span className={getLogColor('success')}>Success: {stats.byType.success || 0}</span>
          <span className={getLogColor('warning')}>Warning: {stats.byType.warning || 0}</span>
          <span className={getLogColor('error')}>Error: {stats.byType.error || 0}</span>
        </div>
      </div>

      {/* Logs list */}
      <div
        className={`flex-1 overflow-y-auto px-4 pb-2 font-mono text-xs ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
        tabIndex={0}
        role="region"
        aria-label="System and user log messages"
      >
        {filteredLogs.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {logs.length === 0 ? 'No logs to display' : 'No logs match the current filters'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-2 py-1.5 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} border-b last:border-0`}
              >
                <span
                  className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} whitespace-nowrap`}
                >
                  {mounted ? formatTime(log.timestamp) : ''}
                </span>
                <span className={getLogColor(log.type)}>{getLogIcon(log.type)}</span>
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full text-white ${getCategoryBadgeColor(log.category)}`}
                  style={{ fontSize: '10px' }}
                >
                  {log.category}
                </span>
                <div className="flex-1">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {log.message}
                  </span>
                  {log.details && (
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ({log.details})
                    </span>
                  )}
                  {log.source && (
                    <span
                      className={`ml-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}
                    >
                      [{log.source}]
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
