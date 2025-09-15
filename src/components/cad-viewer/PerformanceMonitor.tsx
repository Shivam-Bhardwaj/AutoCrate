'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stats } from '@react-three/drei'

interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  drawCalls: number
  triangles: number
}

interface PerformanceMonitorProps {
  enabled?: boolean
  showStats?: boolean
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
}

export function PerformanceMonitor({ 
  enabled = true, 
  showStats = false,
  onMetricsUpdate 
}: PerformanceMonitorProps) {
  const { gl, scene } = useThree()
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0
  })
  
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const fpsHistoryRef = useRef<number[]>([])
  
  useFrame((state, delta) => {
    if (!enabled) return
    
    frameCountRef.current++
    const currentTime = performance.now()
    const deltaTime = currentTime - lastTimeRef.current
    
    // Update FPS every second
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / deltaTime)
      const frameTime = deltaTime / frameCountRef.current
      
      // Keep FPS history for smoothing
      fpsHistoryRef.current.push(fps)
      if (fpsHistoryRef.current.length > 10) {
        fpsHistoryRef.current.shift()
      }
      
      const avgFps = Math.round(
        fpsHistoryRef.current.reduce((sum, f) => sum + f, 0) / fpsHistoryRef.current.length
      )
      
      // Get WebGL info
      const info = gl.info
      const memoryInfo = (performance as any).memory
      
      const newMetrics: PerformanceMetrics = {
        fps: avgFps,
        frameTime: Math.round(frameTime * 100) / 100,
        memoryUsage: memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0,
        drawCalls: info.render.calls,
        triangles: info.render.triangles
      }
      
      setMetrics(newMetrics)
      onMetricsUpdate?.(newMetrics)
      
      // Reset counters
      frameCountRef.current = 0
      lastTimeRef.current = currentTime
    }
  })
  
  // Performance warnings
  useEffect(() => {
    if (metrics.fps < 30 && metrics.fps > 0) {
      console.warn(`Low FPS detected: ${metrics.fps}fps. Consider reducing quality settings.`)
    }
    
    if (metrics.memoryUsage > 100) {
      console.warn(`High memory usage: ${metrics.memoryUsage}MB. Consider optimizing assets.`)
    }
    
    if (metrics.drawCalls > 100) {
      console.warn(`High draw calls: ${metrics.drawCalls}. Consider using instanced rendering.`)
    }
  }, [metrics])
  
  if (!enabled) return null
  
  return (
    <>
      {showStats && <Stats />}
      
      {/* Performance overlay */}
      <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
        <div>FPS: {metrics.fps}</div>
        <div>Frame: {metrics.frameTime}ms</div>
        <div>Memory: {metrics.memoryUsage}MB</div>
        <div>Draw Calls: {metrics.drawCalls}</div>
        <div>Triangles: {metrics.triangles.toLocaleString()}</div>
      </div>
    </>
  )
}

// Performance optimization hook
export function usePerformanceOptimization() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high')
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  
  // Auto-adjust quality based on performance
  useEffect(() => {
    if (!metrics) return
    
    if (metrics.fps < 30 && quality === 'high') {
      setQuality('medium')
      console.log('Auto-adjusting quality to medium due to low FPS')
    } else if (metrics.fps < 20 && quality === 'medium') {
      setQuality('low')
      console.log('Auto-adjusting quality to low due to very low FPS')
    } else if (metrics.fps > 50 && quality === 'low') {
      setQuality('medium')
      console.log('Auto-adjusting quality to medium due to good FPS')
    } else if (metrics.fps > 55 && quality === 'medium') {
      setQuality('high')
      console.log('Auto-adjusting quality to high due to excellent FPS')
    }
  }, [metrics, quality])
  
  const getQualitySettings = () => {
    switch (quality) {
      case 'high':
        return {
          shadowMapSize: 2048,
          antialias: true,
          pixelRatio: 2,
          maxLights: 4
        }
      case 'medium':
        return {
          shadowMapSize: 1024,
          antialias: true,
          pixelRatio: 1.5,
          maxLights: 3
        }
      case 'low':
        return {
          shadowMapSize: 512,
          antialias: false,
          pixelRatio: 1,
          maxLights: 2
        }
    }
  }
  
  return {
    quality,
    setQuality,
    metrics,
    setMetrics,
    qualitySettings: getQualitySettings()
  }
}
