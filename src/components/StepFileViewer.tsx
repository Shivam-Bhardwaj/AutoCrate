'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { initializeOpenCascade, loadStepFile, createStepMaterial } from '@/lib/step-to-mesh'

interface StepFileViewerProps {
  stepFileUrl: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  color?: string
  onLoad?: (geometry: THREE.BufferGeometry) => void
  onError?: (error: Error) => void
}

/**
 * Component to load and display STEP files directly in Three.js
 * Uses OpenCascade.js to parse real CAD geometry
 */
export function StepFileViewer({
  stepFileUrl,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.1,
  color = '#8b7355',
  onLoad,
  onError
}: StepFileViewerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Material
  const material = useMemo(() => createStepMaterial(color), [color])

  useEffect(() => {
    let mounted = true

    const loadStep = async () => {
      try {
        setLoading(true)
        setError(null)

        // Initialize OpenCascade if needed
        await initializeOpenCascade()

        // Load and parse STEP file
        const result = await loadStepFile(stepFileUrl)

        if (mounted) {
          setGeometry(result.geometry)
          onLoad?.(result.geometry)

          // Center the geometry
          result.geometry.center()

          console.log(`Loaded STEP file: ${stepFileUrl}`, {
            vertices: result.geometry.attributes.position.count,
            triangles: result.geometry.index ? result.geometry.index.count / 3 : 0,
            boundingBox: result.boundingBox
          })
        }
      } catch (err) {
        if (mounted) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load STEP file'
          setError(errorMsg)
          onError?.(err instanceof Error ? err : new Error(errorMsg))
          console.error('Failed to load STEP file:', err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadStep()

    return () => {
      mounted = false
      geometry?.dispose()
    }
  }, [stepFileUrl, onLoad, onError])

  // Loading indicator
  if (loading) {
    return (
      <mesh position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="gray" wireframe />
      </mesh>
    )
  }

  // Error state
  if (error || !geometry) {
    return (
      <mesh position={position}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="red" opacity={0.5} transparent />
      </mesh>
    )
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    />
  )
}

/**
 * Alternative loader using file input
 */
export function StepFileFromBuffer({
  stepContent,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.1,
  color = '#8b7355'
}: {
  stepContent: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  color?: string
}) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const material = useMemo(() => createStepMaterial(color), [color])

  useEffect(() => {
    const parseStep = async () => {
      try {
        await initializeOpenCascade()
        const { parseStepToGeometry } = await import('@/lib/step-to-mesh')
        const result = await parseStepToGeometry(stepContent)
        result.geometry.center()
        setGeometry(result.geometry)
      } catch (err) {
        console.error('Failed to parse STEP content:', err)
      }
    }

    if (stepContent) {
      parseStep()
    }

    return () => {
      geometry?.dispose()
    }
  }, [stepContent])

  if (!geometry) return null

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    />
  )
}

/**
 * Batch loader for multiple STEP files
 */
export function useStepFiles(urls: string[]) {
  const [geometries, setGeometries] = useState<Map<string, THREE.BufferGeometry>>(new Map())
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      const newGeometries = new Map<string, THREE.BufferGeometry>()

      // Initialize OpenCascade once
      await initializeOpenCascade()

      for (let i = 0; i < urls.length; i++) {
        try {
          const result = await loadStepFile(urls[i])
          result.geometry.center()
          newGeometries.set(urls[i], result.geometry)
          setProgress((i + 1) / urls.length)
        } catch (err) {
          console.error(`Failed to load ${urls[i]}:`, err)
        }
      }

      setGeometries(newGeometries)
      setLoading(false)
    }

    if (urls.length > 0) {
      loadAll()
    }

    return () => {
      geometries.forEach(geo => geo.dispose())
    }
  }, [urls])

  return { geometries, loading, progress }
}