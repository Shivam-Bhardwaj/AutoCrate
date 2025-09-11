'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useCrateStore } from '@/store/crate-store';
import { useLogsStore } from '@/store/logs-store';
import { WorkerManager } from '@/workers/workerManager';
import { CacheManager } from '@/utils/cache';
import { PerformanceMonitor } from '@/utils/performanceMonitor';

interface ComputeResults {
  dimensions: {
    external: { width: number; length: number; height: number };
    internal: { width: number; length: number; height: number };
  };
  weight: {
    product: number;
    estimatedGross: number;
    safetyFactor: number;
    breakdown?: any;
  };
  bom: Array<{
    item: string;
    material: string;
    quantity: number;
    cost: number;
    total: number;
  }>;
  nxExpressions: string[];
  summary: {
    baseType: string;
    panelMaterial: string;
    fastenerType: string;
    vinyl: string;
    totalCost: number;
  };
  compliance?: any;
  cost?: any;
  performance?: {
    calculationTime: number;
    lastUpdated: Date;
    fromCache?: boolean;
  };
}

export function useCrateEngineOptimized() {
  const { configuration } = useCrateStore();
  const { logInfo, logError } = useLogsStore();
  const [isComputing, setIsComputing] = useState(false);
  const [results, setResults] = useState<ComputeResults | null>(null);
  const [computeVersion, setComputeVersion] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  
  // Refs for optimization
  const workerManager = useRef<WorkerManager | null>(null);
  const cacheManager = useRef<CacheManager | null>(null);
  const computeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastConfigHash = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize managers
  useEffect(() => {
    if (!workerManager.current) {
      workerManager.current = WorkerManager.getInstance();
    }
    if (!cacheManager.current) {
      cacheManager.current = CacheManager.getInstance();
    }

    return () => {
      // Cleanup on unmount
      if (computeTimeoutRef.current) {
        clearTimeout(computeTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const runComputePipeline = useCallback(async () => {
    if (isComputing) {
      // Cancel previous computation if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    // Create new abort controller for this computation
    abortControllerRef.current = new AbortController();
    const currentAbortSignal = abortControllerRef.current.signal;

    setIsComputing(true);
    setProgress(0);
    setProgressMessage('Initializing...');
    
    PerformanceMonitor.start('compute-pipeline-optimized', 'calculation');
    
    try {
      // Generate cache key
      const cacheKey = CacheManager.generateConfigKey(configuration);
      
      // Check if configuration has changed
      if (cacheKey === lastConfigHash.current && results) {
        logInfo('system', 'Using existing results', 'Configuration unchanged', 'CrateEngine');
        setIsComputing(false);
        return;
      }
      
      lastConfigHash.current = cacheKey;
      
      // Check cache first
      const cachedResults = cacheManager.current?.get<ComputeResults>(cacheKey);
      if (cachedResults) {
        const performanceMetric = PerformanceMonitor.end('compute-pipeline-optimized');
        logInfo('system', 'Cache hit', `Results loaded from cache in ${performanceMetric?.duration.toFixed(0)}ms`, 'CrateEngine');
        
        setResults({
          ...cachedResults,
          performance: {
            ...cachedResults.performance!,
            fromCache: true,
            calculationTime: performanceMetric?.duration || 0
          }
        });
        setComputeVersion(prev => prev + 1);
        setIsComputing(false);
        setProgress(100);
        setProgressMessage('Loaded from cache');
        return;
      }

      logInfo('system', 'Starting compute pipeline', 'Using Web Workers for calculations...', 'CrateEngine');

      // Use Web Worker for heavy calculations
      const workerResults = await workerManager.current!.calculate(
        configuration,
        (progress, message) => {
          if (currentAbortSignal.aborted) return;
          setProgress(progress);
          setProgressMessage(message || 'Processing...');
        }
      );

      // Check if aborted
      if (currentAbortSignal.aborted) {
        logInfo('system', 'Computation aborted', 'Previous calculation was cancelled', 'CrateEngine');
        return;
      }

      const performanceMetric = PerformanceMonitor.end('compute-pipeline-optimized');
      
      const computedResults: ComputeResults = {
        ...workerResults,
        performance: {
          calculationTime: performanceMetric?.duration || 0,
          lastUpdated: new Date(),
          fromCache: false
        }
      };

      // Cache the results
      cacheManager.current?.set(cacheKey, computedResults, {
        ttl: 5 * 60 * 1000 // Cache for 5 minutes
      });

      setResults(computedResults);
      setComputeVersion(prev => prev + 1);
      setProgress(100);
      setProgressMessage('Complete');

      logInfo('system', 'Pipeline complete', `All calculations finished in ${performanceMetric?.duration.toFixed(0)}ms (Web Worker)`, 'CrateEngine');

      // Log cache stats
      const cacheStats = cacheManager.current?.getStats();
      if (cacheStats) {
        logInfo('system', 'Cache stats', `Memory: ${cacheStats.memorySizeMB}MB, Entries: ${cacheStats.totalEntries}, Utilization: ${cacheStats.utilization}%`, 'CacheManager');
      }

    } catch (error) {
      if (error instanceof Error && error.message === 'Task cancelled') {
        logInfo('system', 'Computation cancelled', 'Task was cancelled by user or system', 'CrateEngine');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logError('system', 'Pipeline failed', errorMessage, 'CrateEngine');
        PerformanceMonitor.end('compute-pipeline-optimized', { error: errorMessage });
      }
    } finally {
      setIsComputing(false);
      abortControllerRef.current = null;
    }
  }, [configuration, isComputing, results, logInfo, logError]);

  // Debounced execution when configuration changes (300ms as per requirements)
  useEffect(() => {
    if (computeTimeoutRef.current) {
      clearTimeout(computeTimeoutRef.current);
    }

    computeTimeoutRef.current = setTimeout(() => {
      runComputePipeline();
    }, 300); // 300ms debounce as per requirements

    return () => {
      if (computeTimeoutRef.current) {
        clearTimeout(computeTimeoutRef.current);
      }
    };
  }, [configuration, runComputePipeline]);

  // Initial computation
  useEffect(() => {
    if (results === null) {
      runComputePipeline();
    }
  }, [runComputePipeline, results]);

  // Cache invalidation on significant changes
  const invalidateCache = useCallback((pattern?: RegExp) => {
    cacheManager.current?.invalidate(pattern);
    logInfo('system', 'Cache invalidated', pattern ? `Pattern: ${pattern}` : 'All entries cleared', 'CacheManager');
  }, [logInfo]);

  // Get worker status
  const getWorkerStatus = useCallback(() => {
    return workerManager.current?.getStatus() || {
      totalWorkers: 0,
      availableWorkers: 0,
      busyWorkers: 0,
      pendingTasks: 0
    };
  }, []);

  return {
    results,
    isComputing,
    computeVersion,
    progress,
    progressMessage,
    forceRecompute: runComputePipeline,
    invalidateCache,
    getWorkerStatus,
    cacheStats: cacheManager.current?.getStats()
  };
}