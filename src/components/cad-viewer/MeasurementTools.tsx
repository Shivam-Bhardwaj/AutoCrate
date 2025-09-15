'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Vector3, Line3, Plane, Raycaster } from 'three'
import { useAccessibility } from '@/hooks/useAccessibility'

interface MeasurementPoint {
  position: Vector3
  id: string
  timestamp: number
}

interface Measurement {
  id: string
  points: MeasurementPoint[]
  distance?: number
  angle?: number
  type: 'distance' | 'angle' | 'area' | 'volume'
  label?: string
  color: string
  visible: boolean
}

interface MeasurementToolsProps {
  enabled: boolean
  onMeasurementComplete?: (measurement: Measurement) => void
  onMeasurementUpdate?: (measurements: Measurement[]) => void
}

export function MeasurementTools({ 
  enabled, 
  onMeasurementComplete, 
  onMeasurementUpdate 
}: MeasurementToolsProps) {
  const { camera, raycaster, mouse, scene } = useThree()
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [currentMeasurement, setCurrentMeasurement] = useState<MeasurementPoint[]>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [measurementType, setMeasurementType] = useState<'distance' | 'angle' | 'area'>('distance')
  const [hoverPoint, setHoverPoint] = useState<Vector3 | null>(null)
  
  const measurementRef = useRef<MeasurementPoint[]>([])
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']

  // Accessibility support
  const { announceToScreenReader } = useAccessibility({
    announceOnMount: enabled ? 'Measurement tools enabled. Click to place measurement points.' : undefined
  })

  const calculateDistance = useCallback((point1: Vector3, point2: Vector3): number => {
    return point1.distanceTo(point2)
  }, [])

  const calculateAngle = useCallback((p1: Vector3, p2: Vector3, p3: Vector3): number => {
    const v1 = p1.clone().sub(p2).normalize()
    const v2 = p3.clone().sub(p2).normalize()
    const dot = v1.dot(v2)
    return Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI)
  }, [])

  const getIntersectionPoint = useCallback((event: MouseEvent): Vector3 | null => {
    // Update mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Raycast to find intersection
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      return intersects[0].point
    }
    return null
  }, [camera, mouse, raycaster, scene])

  const handleClick = useCallback((event: MouseEvent) => {
    if (!enabled) return

    event.preventDefault()
    event.stopPropagation()

    const point = getIntersectionPoint(event)
    if (!point) return

    const newPoint: MeasurementPoint = {
      position: point.clone(),
      id: `point_${Date.now()}`,
      timestamp: Date.now()
    }

    if (!isMeasuring) {
      // Start new measurement
      measurementRef.current = [newPoint]
      setCurrentMeasurement([newPoint])
      setIsMeasuring(true)
      announceToScreenReader('First measurement point placed. Click to place second point.')
    } else {
      // Add point to current measurement
      measurementRef.current.push(newPoint)
      setCurrentMeasurement([...measurementRef.current])
      
      if (measurementType === 'distance' && measurementRef.current.length >= 2) {
        // Complete distance measurement
        const distance = calculateDistance(
          measurementRef.current[0].position,
          measurementRef.current[1].position
        )
        
        const measurement: Measurement = {
          id: `measurement_${Date.now()}`,
          points: [...measurementRef.current],
          distance,
          type: 'distance',
          color: colors[measurements.length % colors.length],
          visible: true
        }
        
        setMeasurements(prev => [...prev, measurement])
        onMeasurementComplete?.(measurement)
        onMeasurementUpdate?.([...measurements, measurement])
        
        // Reset for next measurement
        measurementRef.current = []
        setCurrentMeasurement([])
        setIsMeasuring(false)
        
        announceToScreenReader(`Distance measurement completed: ${distance.toFixed(2)} inches`)
      } else if (measurementType === 'angle' && measurementRef.current.length >= 3) {
        // Complete angle measurement
        const angle = calculateAngle(
          measurementRef.current[0].position,
          measurementRef.current[1].position,
          measurementRef.current[2].position
        )
        
        const measurement: Measurement = {
          id: `measurement_${Date.now()}`,
          points: [...measurementRef.current],
          angle,
          type: 'angle',
          color: colors[measurements.length % colors.length],
          visible: true
        }
        
        setMeasurements(prev => [...prev, measurement])
        onMeasurementComplete?.(measurement)
        onMeasurementUpdate?.([...measurements, measurement])
        
        // Reset for next measurement
        measurementRef.current = []
        setCurrentMeasurement([])
        setIsMeasuring(false)
        
        announceToScreenReader(`Angle measurement completed: ${angle.toFixed(1)} degrees`)
      } else {
        // Continue measurement
        const requiredPoints = measurementType === 'distance' ? 2 : 3
        const remaining = requiredPoints - measurementRef.current.length
        announceToScreenReader(`${remaining} more point${remaining > 1 ? 's' : ''} needed to complete ${measurementType} measurement.`)
      }
    }
  }, [enabled, isMeasuring, measurementType, measurements, getIntersectionPoint, calculateDistance, calculateAngle, announceToScreenReader, onMeasurementComplete, onMeasurementUpdate])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled || !isMeasuring) return

    const point = getIntersectionPoint(event)
    setHoverPoint(point)
  }, [enabled, isMeasuring, getIntersectionPoint])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    switch (event.key) {
      case 'Escape':
        if (isMeasuring) {
          measurementRef.current = []
          setCurrentMeasurement([])
          setIsMeasuring(false)
          setHoverPoint(null)
          announceToScreenReader('Measurement cancelled')
        }
        break
      case 'd':
        if (!isMeasuring) {
          setMeasurementType('distance')
          announceToScreenReader('Distance measurement mode selected')
        }
        break
      case 'a':
        if (!isMeasuring) {
          setMeasurementType('angle')
          announceToScreenReader('Angle measurement mode selected')
        }
        break
      case 'Delete':
        if (measurements.length > 0) {
          setMeasurements(prev => prev.slice(0, -1))
          announceToScreenReader('Last measurement removed')
        }
        break
    }
  }, [enabled, isMeasuring, measurements.length, announceToScreenReader])

  // Event listeners
  useEffect(() => {
    if (!enabled) return

    const canvas = document.querySelector('canvas')
    if (!canvas) return

    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleClick, handleMouseMove, handleKeyDown])

  const clearAllMeasurements = useCallback(() => {
    setMeasurements([])
    setCurrentMeasurement([])
    setIsMeasuring(false)
    setHoverPoint(null)
    announceToScreenReader('All measurements cleared')
  }, [announceToScreenReader])

  const toggleMeasurementVisibility = useCallback((measurementId: string) => {
    setMeasurements(prev => prev.map(m => 
      m.id === measurementId ? { ...m, visible: !m.visible } : m
    ))
  }, [])

  if (!enabled) return null

  return (
    <>
      {/* Measurement Points */}
      {currentMeasurement.map((point, index) => (
        <Html key={point.id} position={point.position} center>
          <div 
            className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"
            style={{ zIndex: 1000 }}
            aria-label={`Measurement point ${index + 1}`}
          />
        </Html>
      ))}

      {/* Hover Point */}
      {hoverPoint && isMeasuring && (
        <Html position={hoverPoint} center>
          <div 
            className="w-2 h-2 bg-blue-300 rounded-full border border-white shadow-md opacity-75"
            style={{ zIndex: 999 }}
            aria-hidden="true"
          />
        </Html>
      )}

      {/* Measurement Lines */}
      {currentMeasurement.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={currentMeasurement.length}
              array={new Float32Array(
                currentMeasurement.flatMap(point => [point.position.x, point.position.y, point.position.z])
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </line>
      )}

      {/* Completed Measurements */}
      {measurements.map((measurement) => {
        if (!measurement.visible) return null

        return (
          <React.Fragment key={measurement.id}>
            {/* Measurement Points */}
            {measurement.points.map((point, index) => (
              <Html key={`${measurement.id}-${point.id}`} position={point.position} center>
                <div 
                  className="w-2 h-2 rounded-full border border-white shadow-md"
                  style={{ 
                    backgroundColor: measurement.color,
                    zIndex: 1000 
                  }}
                  aria-label={`${measurement.type} measurement point ${index + 1}`}
                />
              </Html>
            ))}

            {/* Measurement Lines */}
            {measurement.points.length > 1 && (
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={measurement.points.length}
                    array={new Float32Array(
                      measurement.points.flatMap(point => [point.position.x, point.position.y, point.position.z])
                    )}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color={measurement.color} linewidth={2} />
              </line>
            )}

            {/* Measurement Labels */}
            {measurement.distance && (
              <Html 
                position={measurement.points[0].position.clone().lerp(measurement.points[1].position, 0.5)} 
                center
              >
                <div 
                  className="px-2 py-1 bg-white border border-gray-300 rounded shadow-lg text-sm font-medium"
                  style={{ 
                    color: measurement.color,
                    zIndex: 1001 
                  }}
                  aria-label={`Distance: ${measurement.distance.toFixed(2)} inches`}
                >
                  {measurement.distance.toFixed(2)}&quot;
                </div>
              </Html>
            )}

            {measurement.angle && (
              <Html 
                position={measurement.points[1].position} 
                center
              >
                <div 
                  className="px-2 py-1 bg-white border border-gray-300 rounded shadow-lg text-sm font-medium"
                  style={{ 
                    color: measurement.color,
                    zIndex: 1001 
                  }}
                  aria-label={`Angle: ${measurement.angle.toFixed(1)} degrees`}
                >
                  {measurement.angle.toFixed(1)}°
                </div>
              </Html>
            )}
          </React.Fragment>
        )
      })}

      {/* Measurement Controls UI */}
      <Html position={[0, 0, 0]} center>
        <div 
          className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 space-y-2"
          style={{ zIndex: 1002 }}
          role="toolbar"
          aria-label="Measurement Tools"
        >
          <div className="text-sm font-medium text-gray-700 mb-2">Measurement Tools</div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setMeasurementType('distance')}
              className={`px-3 py-1 text-xs rounded ${
                measurementType === 'distance' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Distance measurement mode"
            >
              Distance
            </button>
            <button
              onClick={() => setMeasurementType('angle')}
              className={`px-3 py-1 text-xs rounded ${
                measurementType === 'angle' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Angle measurement mode"
            >
              Angle
            </button>
          </div>

          <div className="text-xs text-gray-600">
            Mode: {measurementType}
          </div>

          {isMeasuring && (
            <div className="text-xs text-blue-600">
              Click to place {measurementType === 'distance' ? 'second' : 'third'} point
            </div>
          )}

          <div className="text-xs text-gray-500">
            Press ESC to cancel, D for distance, A for angle
          </div>

          {measurements.length > 0 && (
            <button
              onClick={clearAllMeasurements}
              className="w-full px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              aria-label="Clear all measurements"
            >
              Clear All ({measurements.length})
            </button>
          )}
        </div>
      </Html>
    </>
  )
}
