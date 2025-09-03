'use client';

import { useEffect, useRef } from 'react';
import { useLogsStore, LogEntry } from '@/store/logs-store';
import { useThemeStore } from '@/store/theme-store';
import { useCrateStore } from '@/store/crate-store';
import { Button } from '@/components/ui/button';
import { Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function LogsSection() {
  const logs = useLogsStore((state) => state.logs);
  const addLog = useLogsStore((state) => state.addLog);
  const clearLogs = useLogsStore((state) => state.clearLogs);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const configuration = useCrateStore((state) => state.configuration);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const prevConfigRef = useRef(configuration);

  useEffect(() => {
    // Log configuration changes
    if (prevConfigRef.current !== configuration) {
      // Check what changed
      if (prevConfigRef.current.dimensions !== configuration.dimensions) {
        addLog(
          'info',
          'Dimensions updated',
          `${configuration.dimensions.length}x${configuration.dimensions.width}x${configuration.dimensions.height} ${configuration.dimensions.unit}`
        );
      }
      if (prevConfigRef.current.base !== configuration.base) {
        addLog('info', 'Base configuration changed', `Type: ${configuration.base.type}`);
      }
      if (prevConfigRef.current.fasteners !== configuration.fasteners) {
        addLog('info', 'Fasteners updated', `Type: ${configuration.fasteners.type}`);
      }
      if (prevConfigRef.current.vinyl !== configuration.vinyl) {
        addLog(
          'info',
          'Vinyl settings changed',
          configuration.vinyl.enabled ? `Enabled: ${configuration.vinyl.type}` : 'Disabled'
        );
      }
      if (prevConfigRef.current.projectName !== configuration.projectName) {
        addLog('success', 'Project renamed', configuration.projectName);
      }
      prevConfigRef.current = configuration;
    }
  }, [configuration, addLog]);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
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
      }
    } else {
      switch (type) {
        case 'info':
          return 'text-blue-600';
        case 'success':
          return 'text-green-600';
        case 'warning':
          return 'text-yellow-600';
        case 'error':
          return 'text-red-600';
      }
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logs header with clear button */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {logs.length} entries
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={clearLogs}
          className={`h-7 px-2 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>

      {/* Logs list */}
      <div
        className={`flex-1 overflow-y-auto px-4 pb-2 font-mono text-xs ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
      >
        {logs.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No logs to display
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-2 py-1 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} border-b last:border-0`}
              >
                <span
                  className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} whitespace-nowrap`}
                >
                  {formatTime(log.timestamp)}
                </span>
                <span className={getLogColor(log.type)}>{getLogIcon(log.type)}</span>
                <div className="flex-1">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {log.message}
                  </span>
                  {log.details && (
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ({log.details})
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
