/**
 * PERFORMANCE: 3D Rendering Performance Monitor
 *
 * This utility provides runtime performance monitoring for 3D scenes:
 * - FPS tracking with averages and minimums
 * - Frame time measurements
 * - Draw call counting (when available)
 * - Memory usage tracking
 * - Performance warnings and suggestions
 *
 * Target: Maintain 60 FPS (16.67ms per frame) with early warning system
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  averageFps: number;
  minFps: number;
  maxFrameTime: number;
  memoryUsage?: number;
  drawCalls?: number;
}

export interface PerformanceThresholds {
  targetFps: number;
  warningFps: number;
  criticalFps: number;
  maxFrameTime: number;
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  targetFps: 60,
  warningFps: 45,
  criticalFps: 30,
  maxFrameTime: 16.67, // 60 FPS target
};

class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  private startTime = performance.now();
  private maxSamples = 60; // Track last 60 frames

  private thresholds = DEFAULT_THRESHOLDS;
  private isEnabled = false;

  constructor() {
    // Only enable in development by default
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  enable(enabled = true) {
    this.isEnabled = enabled;
    if (enabled) {
      console.log('3D Performance Monitor enabled');
      console.log(
        `Target: ${this.thresholds.targetFps} FPS (${this.thresholds.maxFrameTime}ms per frame)`
      );
    }
  }

  updateThresholds(thresholds: Partial<PerformanceThresholds>) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  recordFrame() {
    if (!this.isEnabled) return null;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    if (this.frameCount === 0) {
      // Skip first frame (initialization)
      this.frameCount++;
      return null;
    }

    // Record frame time
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    this.frameCount++;

    return this.getMetrics();
  }

  getMetrics(): PerformanceMetrics {
    if (this.frameTimes.length === 0) {
      return {
        fps: 0,
        frameTime: 0,
        averageFps: 0,
        minFps: 0,
        maxFrameTime: 0,
      };
    }

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const maxFrameTime = Math.max(...this.frameTimes);
    const _minFrameTime = Math.min(...this.frameTimes);

    const currentFps = 1000 / this.frameTimes[this.frameTimes.length - 1];
    const avgFps = 1000 / avgFrameTime;
    const minFps = 1000 / maxFrameTime;

    // Estimate memory usage if available
    const memoryUsage = (performance as { memory?: { usedJSHeapSize: number } }).memory
      ?.usedJSHeapSize;

    return {
      fps: Math.round(currentFps),
      frameTime: Math.round(this.frameTimes[this.frameTimes.length - 1] * 100) / 100,
      averageFps: Math.round(avgFps),
      minFps: Math.round(minFps),
      maxFrameTime: Math.round(maxFrameTime * 100) / 100,
      memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024 / 1024) : undefined,
    };
  }

  checkPerformanceWarnings(metrics: PerformanceMetrics): string[] {
    const warnings: string[] = [];

    if (metrics.fps < this.thresholds.criticalFps) {
      warnings.push(`Critical FPS: ${metrics.fps} (target: ${this.thresholds.targetFps})`);
    } else if (metrics.fps < this.thresholds.warningFps) {
      warnings.push(`Low FPS: ${metrics.fps} (target: ${this.thresholds.targetFps})`);
    }

    if (metrics.maxFrameTime > this.thresholds.maxFrameTime * 2) {
      warnings.push(
        `High frame time: ${metrics.maxFrameTime}ms (target: ${this.thresholds.maxFrameTime}ms)`
      );
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      warnings.push(`High memory usage: ${metrics.memoryUsage}MB`);
    }

    return warnings;
  }

  getOptimizationSuggestions(metrics: PerformanceMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.fps < this.thresholds.targetFps) {
      suggestions.push('Consider reducing scene complexity or enabling LOD');

      if (metrics.frameTime > 20) {
        suggestions.push('Frame time too high - check for unnecessary calculations in render loop');
      }

      suggestions.push('Verify React.memo is used on expensive components');
      suggestions.push('Check if geometry is being recreated on every render');
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      suggestions.push('Consider disposing unused geometries and materials');
    }

    return suggestions;
  }

  logSummary() {
    if (!this.isEnabled) return;

    const metrics = this.getMetrics();
    const warnings = this.checkPerformanceWarnings(metrics);
    const suggestions = this.getOptimizationSuggestions(metrics);

    console.group('3D Performance Summary');
    console.log(`FPS: ${metrics.fps} (avg: ${metrics.averageFps}, min: ${metrics.minFps})`);
    console.log(`Frame Time: ${metrics.frameTime}ms (max: ${metrics.maxFrameTime}ms)`);

    if (metrics.memoryUsage) {
      console.log(`Memory: ${metrics.memoryUsage}MB`);
    }

    if (warnings.length > 0) {
      console.warn('Performance Warnings:', warnings);
    }

    if (suggestions.length > 0) {
      console.info('Optimization Suggestions:', suggestions);
    }

    console.groupEnd();
  }

  reset() {
    this.frameTimes = [];
    this.frameCount = 0;
    this.startTime = performance.now();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components
export function usePerformanceMonitor(enabled = true) {
  if (enabled) {
    performanceMonitor.enable(true);
  }

  return {
    recordFrame: () => performanceMonitor.recordFrame(),
    getMetrics: () => performanceMonitor.getMetrics(),
    logSummary: () => performanceMonitor.logSummary(),
  };
}

// Frame rate calculator utility
export function calculateTargetFrameTime(targetFps: number): number {
  return 1000 / targetFps;
}

// Performance grade calculator
export function getPerformanceGrade(fps: number, targetFps = 60): 'A' | 'B' | 'C' | 'D' | 'F' {
  const percentage = (fps / targetFps) * 100;

  if (percentage >= 90) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 45) return 'D';
  return 'F';
}
