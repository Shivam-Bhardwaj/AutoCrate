/**
 * Performance Monitor Utility
 * Tracks calculation and render times for performance optimization
 */

export interface PerformanceMetric {
  name: string;
  category: 'calculation' | 'render' | 'api' | 'data' | 'ui';
  startTime: number;
  endTime?: number;
  duration?: number;
  memory?: {
    before: number;
    after: number;
    delta: number;
  };
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalDuration: number;
    averageDuration: number;
    slowestOperation: PerformanceMetric | null;
    fastestOperation: PerformanceMetric | null;
    memoryUsage: {
      peak: number;
      average: number;
      total: number;
    };
  };
  categories: Record<string, {
    count: number;
    totalDuration: number;
    averageDuration: number;
  }>;
  timestamp: Date;
}

class PerformanceMonitorClass {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private enabled: boolean = true;
  private maxMetrics: number = 1000; // Maximum metrics to keep in memory
  private warningThreshold: number = 1000; // Warning threshold in ms
  private criticalThreshold: number = 3000; // Critical threshold in ms

  /**
   * Start tracking a performance metric
   */
  public start(name: string, category: PerformanceMetric['category'], metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    const metric: PerformanceMetric = {
      name,
      category,
      startTime: performance.now(),
      metadata
    };

    // Capture memory before operation if available
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      metric.memory = {
        before: memory.usedJSHeapSize,
        after: 0,
        delta: 0
      };
    }

    this.metrics.set(name, metric);
  }

  /**
   * End tracking a performance metric
   */
  public end(name: string, additionalMetadata?: Record<string, any>): PerformanceMetric | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Capture memory after operation if available
    if (metric.memory && typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      metric.memory.after = memory.usedJSHeapSize;
      metric.memory.delta = metric.memory.after - metric.memory.before;
    }

    // Merge additional metadata
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Log warning for slow operations
    if (metric.duration > this.criticalThreshold) {
      console.error(`CRITICAL: Operation "${name}" took ${metric.duration.toFixed(2)}ms`);
    } else if (metric.duration > this.warningThreshold) {
      console.warn(`WARNING: Operation "${name}" took ${metric.duration.toFixed(2)}ms`);
    }

    // Move to completed metrics
    this.metrics.delete(name);
    this.completedMetrics.push(metric);

    // Maintain max metrics limit
    if (this.completedMetrics.length > this.maxMetrics) {
      this.completedMetrics.shift();
    }

    return metric;
  }

  /**
   * Measure a synchronous function
   */
  public measure<T>(
    name: string,
    category: PerformanceMetric['category'],
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.start(name, category, metadata);
    try {
      const result = fn();
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, { success: false, error: String(error) });
      throw error;
    }
  }

  /**
   * Measure an asynchronous function
   */
  public async measureAsync<T>(
    name: string,
    category: PerformanceMetric['category'],
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, category, metadata);
    try {
      const result = await fn();
      this.end(name, { success: true });
      return result;
    } catch (error) {
      this.end(name, { success: false, error: String(error) });
      throw error;
    }
  }

  /**
   * Get a performance report
   */
  public getReport(filter?: { category?: string; minDuration?: number }): PerformanceReport {
    let metrics = [...this.completedMetrics];

    // Apply filters
    if (filter) {
      if (filter.category) {
        metrics = metrics.filter(m => m.category === filter.category);
      }
      if (filter.minDuration !== undefined) {
        metrics = metrics.filter(m => (m.duration || 0) >= filter.minDuration);
      }
    }

    // Calculate summary
    const durations = metrics.map(m => m.duration || 0);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = metrics.length > 0 ? totalDuration / metrics.length : 0;

    // Find extremes
    const slowestOperation = metrics.reduce<PerformanceMetric | null>((slowest, current) => {
      if (!slowest || (current.duration || 0) > (slowest.duration || 0)) {
        return current;
      }
      return slowest;
    }, null);

    const fastestOperation = metrics.reduce<PerformanceMetric | null>((fastest, current) => {
      if (!fastest || (current.duration || 0) < (fastest.duration || 0)) {
        return current;
      }
      return fastest;
    }, null);

    // Calculate memory usage
    const memoryDeltas = metrics
      .filter(m => m.memory)
      .map(m => m.memory!.delta);
    
    const memoryUsage = {
      peak: memoryDeltas.length > 0 ? Math.max(...memoryDeltas) : 0,
      average: memoryDeltas.length > 0 ? memoryDeltas.reduce((sum, d) => sum + d, 0) / memoryDeltas.length : 0,
      total: memoryDeltas.reduce((sum, d) => sum + d, 0)
    };

    // Group by category
    const categories: Record<string, { count: number; totalDuration: number; averageDuration: number }> = {};
    
    metrics.forEach(metric => {
      if (!categories[metric.category]) {
        categories[metric.category] = { count: 0, totalDuration: 0, averageDuration: 0 };
      }
      categories[metric.category].count++;
      categories[metric.category].totalDuration += metric.duration || 0;
    });

    // Calculate category averages
    Object.keys(categories).forEach(category => {
      categories[category].averageDuration = 
        categories[category].count > 0 
          ? categories[category].totalDuration / categories[category].count 
          : 0;
    });

    return {
      metrics,
      summary: {
        totalDuration,
        averageDuration,
        slowestOperation,
        fastestOperation,
        memoryUsage
      },
      categories,
      timestamp: new Date()
    };
  }

  /**
   * Clear all metrics
   */
  public clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Set warning threshold
   */
  public setWarningThreshold(ms: number): void {
    this.warningThreshold = ms;
  }

  /**
   * Set critical threshold
   */
  public setCriticalThreshold(ms: number): void {
    this.criticalThreshold = ms;
  }

  /**
   * Get current metrics being tracked
   */
  public getActiveMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics statistics
   */
  public getStatistics(): {
    totalMetrics: number;
    activeMetrics: number;
    completedMetrics: number;
    averageDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
  } {
    const durations = this.completedMetrics
      .map(m => m.duration || 0)
      .sort((a, b) => a - b);

    const getPercentile = (arr: number[], percentile: number): number => {
      if (arr.length === 0) return 0;
      const index = Math.ceil((percentile / 100) * arr.length) - 1;
      return arr[Math.max(0, index)];
    };

    return {
      totalMetrics: this.metrics.size + this.completedMetrics.length,
      activeMetrics: this.metrics.size,
      completedMetrics: this.completedMetrics.length,
      averageDuration: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      p50Duration: getPercentile(durations, 50),
      p95Duration: getPercentile(durations, 95),
      p99Duration: getPercentile(durations, 99)
    };
  }

  /**
   * Export metrics to JSON
   */
  public exportMetrics(): string {
    return JSON.stringify({
      active: Array.from(this.metrics.values()),
      completed: this.completedMetrics,
      report: this.getReport(),
      statistics: this.getStatistics()
    }, null, 2);
  }

  /**
   * Log performance summary to console
   */
  public logSummary(): void {
    const report = this.getReport();
    const stats = this.getStatistics();

    console.group('Performance Monitor Summary');
    console.log('Total Metrics:', stats.totalMetrics);
    console.log('Active:', stats.activeMetrics);
    console.log('Completed:', stats.completedMetrics);
    console.log('Average Duration:', stats.averageDuration.toFixed(2), 'ms');
    console.log('P50:', stats.p50Duration.toFixed(2), 'ms');
    console.log('P95:', stats.p95Duration.toFixed(2), 'ms');
    console.log('P99:', stats.p99Duration.toFixed(2), 'ms');
    
    if (report.summary.slowestOperation) {
      console.log('Slowest Operation:', report.summary.slowestOperation.name, 
        '(' + report.summary.slowestOperation.duration?.toFixed(2) + 'ms)');
    }
    
    console.group('By Category');
    Object.entries(report.categories).forEach(([category, data]) => {
      console.log(`${category}: ${data.count} ops, avg ${data.averageDuration.toFixed(2)}ms`);
    });
    console.groupEnd();
    
    console.groupEnd();
  }
}

// Create singleton instance
export const PerformanceMonitor = new PerformanceMonitorClass();

// Export for type usage
export type { PerformanceMonitorClass };

// Helper hooks for React components
export function usePerformanceMonitor() {
  return PerformanceMonitor;
}

// Helper decorator for class methods (TypeScript)
export function measurePerformance(category: PerformanceMetric['category'] = 'calculation') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const name = `${target.constructor.name}.${propertyKey}`;
      return PerformanceMonitor.measureAsync(name, category, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}