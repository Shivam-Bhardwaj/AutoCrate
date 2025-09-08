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
    <div className="flex flex-col h-full panel">
      {/* Enhanced header with controls */}
      <div className="px-6 py-4 border-b border-borders">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-caption text-text-secondary">
              {filteredLogs.length} / {logs.length} entries
            </span>
            {isPaused && <span className="text-caption text-warning font-medium px-2 py-1 bg-warning-bg rounded-md">PAUSED</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline h-8 px-3"
              aria-label={showFilters ? 'Hide log filters' : 'Show log filters'}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={togglePause}
              className="btn btn-outline h-8 px-3"
              aria-label={isPaused ? 'Resume log stream' : 'Pause log stream'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              className="btn btn-outline h-8 px-3"
              aria-label="Export logs as JSON file"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearLogs}
              className="btn btn-outline h-8 px-3"
              aria-label="Clear all logs"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary"
          />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input h-10 pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 bg-surface border border-borders rounded-md mb-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-body font-semibold text-text-primary">Type Filters</span>
                {selectedTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedTypes([])}
                    className="text-small text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {logTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1.5 text-small rounded-md transition-colors font-medium ${
                      selectedTypes.includes(type)
                        ? 'bg-primary text-primary-contrast'
                        : 'bg-surface-accent text-text-primary hover:bg-surface-accent-hover'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-body font-semibold text-text-primary">Category Filters</span>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-small text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {logCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1.5 text-small rounded-md transition-colors font-medium ${
                      selectedCategories.includes(category)
                        ? 'bg-secondary text-secondary-contrast'
                        : 'bg-surface-accent text-text-primary hover:bg-surface-accent-hover'
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
        <div className="flex items-center gap-4 text-caption">
          <span className="text-info">Info: {stats.byType.info || 0}</span>
          <span className="text-success">Success: {stats.byType.success || 0}</span>
          <span className="text-warning">Warning: {stats.byType.warning || 0}</span>
          <span className="text-error">Error: {stats.byType.error || 0}</span>
        </div>
      </div>

      {/* Logs list */}
      <div
        className="flex-1 overflow-y-auto px-6 pb-4 font-mono text-body leading-relaxed bg-surface"
        tabIndex={0}
        role="complementary"
        aria-label="System and user log messages"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            {logs.length === 0 ? 'No logs to display' : 'No logs match the current filters'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 py-3 px-4 bg-background border border-borders rounded-md hover:bg-surface-accent transition-colors"
              >
                <span className="text-text-secondary whitespace-nowrap font-mono text-small">
                  {mounted ? formatTime(log.timestamp) : ''}
                </span>
                <span className="text-text-primary mt-0.5">{getLogIcon(log.type)}</span>
                <span className="px-2 py-1 text-caption rounded-md font-medium bg-surface-accent text-text-primary">
                  {log.category}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-text-primary font-medium">
                    {log.message}
                  </span>
                  {log.details && (
                    <span className="ml-2 text-text-secondary font-normal">
                      ({log.details})
                    </span>
                  )}
                  {log.source && (
                    <span className="ml-2 text-caption text-text-secondary font-normal">
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
