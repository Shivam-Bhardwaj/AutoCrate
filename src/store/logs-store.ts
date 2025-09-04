import { create } from 'zustand';

export type LogType = 'info' | 'success' | 'warning' | 'error' | 'debug' | 'user' | 'system';
export type LogCategory =
  | 'dimension'
  | 'panel'
  | 'base'
  | 'fastener'
  | 'vinyl'
  | 'weight'
  | 'export'
  | 'import'
  | 'ui'
  | 'render'
  | 'calculation'
  | 'validation'
  | 'navigation'
  | 'system';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: LogType;
  category: LogCategory;
  message: string;
  details?: string;
  metadata?: Record<string, string | number | boolean | null>;
  source?: string; // Component or function that generated the log
}

export interface LogFilter {
  types?: LogType[];
  categories?: LogCategory[];
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface LogsStore {
  logs: LogEntry[];
  filter: LogFilter;
  maxLogs: number;
  isPaused: boolean;

  // Core logging functions
  addLog: (
    type: LogType,
    category: LogCategory,
    message: string,
    details?: string,
    metadata?: Record<string, string | number | boolean | null>,
    source?: string
  ) => void;

  // Convenience logging functions
  logInfo: (category: LogCategory, message: string, details?: string, source?: string) => void;
  logSuccess: (category: LogCategory, message: string, details?: string, source?: string) => void;
  logWarning: (category: LogCategory, message: string, details?: string, source?: string) => void;
  logError: (category: LogCategory, message: string, details?: string, source?: string) => void;
  logDebug: (category: LogCategory, message: string, details?: string, source?: string) => void;
  logUser: (category: LogCategory, message: string, details?: string, source?: string) => void;
  logSystem: (category: LogCategory, message: string, details?: string, source?: string) => void;

  // Log management
  clearLogs: () => void;
  exportLogs: () => string;
  setFilter: (filter: LogFilter) => void;
  togglePause: () => void;
  setMaxLogs: (max: number) => void;

  // Getters
  getFilteredLogs: () => LogEntry[];
  getLogStats: () => {
    total: number;
    byType: Record<LogType, number>;
    byCategory: Record<LogCategory, number>;
  };
}

const createLogEntry = (
  type: LogType,
  category: LogCategory,
  message: string,
  details?: string,
  metadata?: Record<string, string | number | boolean | null>,
  source?: string
): LogEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(),
  type,
  category,
  message,
  details,
  metadata,
  source,
});

export const useLogsStore = create<LogsStore>((set, get) => ({
  logs: [
    createLogEntry(
      'system',
      'system',
      'AutoCrate initialized',
      'Enhanced logging system activated with comprehensive tracking',
      { version: '2.2.0' },
      'System'
    ),
  ],

  filter: {},
  maxLogs: 500, // Increased from 100 for extensive logging
  isPaused: false,

  addLog: (type, category, message, details, metadata, source) => {
    const { isPaused, maxLogs } = get();
    if (isPaused) return;

    set((state) => ({
      logs: [
        createLogEntry(type, category, message, details, metadata, source),
        ...state.logs,
      ].slice(0, maxLogs),
    }));
  },

  // Convenience methods
  logInfo: (category, message, details, source) =>
    get().addLog('info', category, message, details, undefined, source),

  logSuccess: (category, message, details, source) =>
    get().addLog('success', category, message, details, undefined, source),

  logWarning: (category, message, details, source) =>
    get().addLog('warning', category, message, details, undefined, source),

  logError: (category, message, details, source) =>
    get().addLog('error', category, message, details, undefined, source),

  logDebug: (category, message, details, source) =>
    get().addLog('debug', category, message, details, undefined, source),

  logUser: (category, message, details, source) =>
    get().addLog('user', category, message, details, undefined, source),

  logSystem: (category, message, details, source) =>
    get().addLog('system', category, message, details, undefined, source),

  clearLogs: () => {
    set({
      logs: [
        createLogEntry(
          'info',
          'system',
          'Logs cleared',
          `Previous ${get().logs.length} entries removed`,
          undefined,
          'System'
        ),
      ],
    });
  },

  exportLogs: () => {
    const logs = get().getFilteredLogs();
    const exportData = {
      exported: new Date().toISOString(),
      count: logs.length,
      logs: logs.map((log) => ({
        ...log,
        timestamp: log.timestamp.toISOString(),
      })),
    };
    return JSON.stringify(exportData, null, 2);
  },

  setFilter: (filter) => set({ filter }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  setMaxLogs: (max) => set({ maxLogs: max }),

  getFilteredLogs: () => {
    const { logs, filter } = get();
    let filtered = [...logs];

    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter((log) => filter.types!.includes(log.type));
    }

    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter((log) => filter.categories!.includes(log.category));
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(term) ||
          log.details?.toLowerCase().includes(term) ||
          log.source?.toLowerCase().includes(term)
      );
    }

    if (filter.dateFrom) {
      filtered = filtered.filter((log) => log.timestamp >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      filtered = filtered.filter((log) => log.timestamp <= filter.dateTo!);
    }

    return filtered;
  },

  getLogStats: () => {
    const logs = get().logs;
    const stats = {
      total: logs.length,
      byType: {} as Record<LogType, number>,
      byCategory: {} as Record<LogCategory, number>,
    };

    // Initialize counters
    const types: LogType[] = ['info', 'success', 'warning', 'error', 'debug', 'user', 'system'];
    const categories: LogCategory[] = [
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

    types.forEach((type) => (stats.byType[type] = 0));
    categories.forEach((cat) => (stats.byCategory[cat] = 0));

    // Count logs
    logs.forEach((log) => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  },
}));
