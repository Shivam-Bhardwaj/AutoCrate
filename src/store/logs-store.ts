import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface LogsStore {
  logs: LogEntry[];
  addLog: (type: LogEntry['type'], message: string, details?: string) => void;
  clearLogs: () => void;
}

export const useLogsStore = create<LogsStore>((set) => ({
  logs: [
    {
      id: '1',
      timestamp: new Date(),
      type: 'info',
      message: 'AutoCrate initialized',
      details: 'System ready for crate design',
    },
  ],

  addLog: (type, message, details) =>
    set((state) => ({
      logs: [
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          type,
          message,
          details,
        },
        ...state.logs,
      ].slice(0, 100), // Keep only the latest 100 logs
    })),

  clearLogs: () =>
    set({
      logs: [
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          type: 'info',
          message: 'Logs cleared',
        },
      ],
    }),
}));
