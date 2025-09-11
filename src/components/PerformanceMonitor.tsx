'use client';

import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';
import { Card } from '@/components/ui/card';

export default function PerformanceMonitor() {
  const [fps, setFps] = useState(0);
  const [metrics, setMetrics] = useState<any>(null);
  const [bundleInfo, setBundleInfo] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Start FPS monitoring
    performanceMonitor.startFPSMonitoring((currentFps) => {
      setFps(currentFps);
    });

    // Get initial metrics
    updateMetrics();

    // Update metrics every second
    const interval = setInterval(updateMetrics, 1000);

    // Load bundle info
    performanceMonitor.getBundleSize().then(setBundleInfo);

    setIsMonitoring(true);

    return () => {
      performanceMonitor.stopFPSMonitoring();
      clearInterval(interval);
    };
  }, []);

  const updateMetrics = () => {
    const currentMetrics = performanceMonitor.getPerformanceMetrics();
    setMetrics(currentMetrics);
  };

  const generateReport = async () => {
    const report = await performanceMonitor.generatePerformanceReport();
    console.log(report);
    alert('Performance report generated! Check console for details.');
  };

  if (!isMonitoring) {
    return null;
  }

  const fpsColor = fps >= 60 ? 'text-green-500' : fps >= 30 ? 'text-yellow-500' : 'text-red-500';
  const memoryUsed = metrics?.memoryUsage?.usedJSHeapSize 
    ? (metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(1)
    : '0';
  const bundleSize = bundleInfo?.initialSize 
    ? (bundleInfo.initialSize / 1024).toFixed(1)
    : '0';

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 bg-black/90 text-white shadow-xl max-w-sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Performance Monitor</h3>
          <button 
            onClick={generateReport}
            className="text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-700"
          >
            Report
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">FPS:</span>{' '}
            <span className={`font-mono font-bold ${fpsColor}`}>{fps}</span>
          </div>
          
          <div>
            <span className="text-gray-400">Memory:</span>{' '}
            <span className="font-mono">{memoryUsed} MB</span>
          </div>
          
          <div>
            <span className="text-gray-400">Frame Time:</span>{' '}
            <span className="font-mono">
              {metrics?.frameTime?.toFixed(1) || '0'} ms
            </span>
          </div>
          
          <div>
            <span className="text-gray-400">Bundle:</span>{' '}
            <span className="font-mono">{bundleSize} KB</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              <span>60 FPS Target: {fps >= 60 ? '✅' : '❌'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Sub-200ms Response: {metrics?.responseTime < 200 ? '✅' : '❌'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
              <span>100KB Initial Bundle: {bundleInfo?.initialSize < 100 * 1024 ? '✅' : '❌'}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}