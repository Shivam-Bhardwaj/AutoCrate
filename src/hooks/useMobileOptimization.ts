import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for mobile optimization and touch controls
 * Provides mobile-specific functionality and responsive behavior
 */

export interface TouchPoint {
  id: number
  x: number
  y: number
  clientX: number
  clientY: number
}

export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'pinch' | 'pan' | 'rotate'
  points: TouchPoint[]
  center?: { x: number; y: number }
  scale?: number
  rotation?: number
  deltaX?: number
  deltaY?: number
  velocity?: { x: number; y: number }
}

export interface UseMobileOptimizationOptions {
  // Touch gesture settings
  enablePinchZoom?: boolean
  enablePan?: boolean
  enableRotate?: boolean
  enableTap?: boolean
  enableDoubleTap?: boolean
  enableLongPress?: boolean
  
  // Gesture thresholds
  tapThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
  pinchThreshold?: number
  panThreshold?: number
  
  // Callbacks
  onTap?: (gesture: TouchGesture) => void
  onDoubleTap?: (gesture: TouchGesture) => void
  onLongPress?: (gesture: TouchGesture) => void
  onPinch?: (gesture: TouchGesture) => void
  onPan?: (gesture: TouchGesture) => void
  onRotate?: (gesture: TouchGesture) => void
  
  // Mobile-specific features
  enableHapticFeedback?: boolean
  enableOrientationLock?: boolean
  enableFullscreen?: boolean
}

export const useMobileOptimization = (options: UseMobileOptimizationOptions = {}) => {
  const {
    enablePinchZoom = true,
    enablePan = true,
    enableRotate = true,
    enableTap = true,
    enableDoubleTap = true,
    enableLongPress = true,
    tapThreshold = 10,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pinchThreshold = 0.1,
    panThreshold = 5,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch,
    onPan,
    onRotate,
    enableHapticFeedback = true,
    enableOrientationLock = false,
    enableFullscreen = false
  } = options

  const [isMobile, setIsMobile] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const touchPoints = useRef<Map<number, TouchPoint>>(new Map())
  const lastTapTime = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const lastGesture = useRef<TouchGesture | null>(null)

  const shouldHandleTouchEvent = useCallback((event: TouchEvent) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return false
    }

    if (target.closest('[data-touch-default="allow"]')) {
      return false
    }

    const interactiveSelector = [
      'input',
      'textarea',
      'select',
      'button',
      'label',
      'a[href]',
      '[role="button"]',
      '[role="link"]',
      '[role="textbox"]',
      '[role="combobox"]',
      '[role="slider"]',
      '[role="switch"]',
      '[role="checkbox"]',
      '[contenteditable="true"]'
    ].join(',')

    if (target.closest(interactiveSelector)) {
      return false
    }

    return Boolean(target.closest('[data-touch-interactive="true"], canvas'))
  }, [])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      setIsMobile(isMobileDevice)
      setIsTouchDevice(isTouchCapable)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Detect orientation
  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      setOrientation(newOrientation)
      setScreenSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleOrientationChange()
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [])

  // Haptic feedback
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback || !navigator.vibrate) return

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    }

    navigator.vibrate(patterns[type])
  }, [enableHapticFeedback])

  // Fullscreen management
  const toggleFullscreen = useCallback(async () => {
    if (!enableFullscreen) return

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.warn('Fullscreen not supported:', error)
    }
  }, [enableFullscreen])

  // Touch point management
  const getTouchPoint = useCallback((touch: Touch): TouchPoint => {
    const rect = (touch.target as Element).getBoundingClientRect()
    return {
      id: touch.identifier,
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      clientX: touch.clientX,
      clientY: touch.clientY
    }
  }, [])

  const getGestureCenter = useCallback((points: TouchPoint[]): { x: number; y: number } => {
    if (points.length === 0) return { x: 0, y: 0 }
    
    const sumX = points.reduce((sum, point) => sum + point.x, 0)
    const sumY = points.reduce((sum, point) => sum + point.y, 0)
    
    return {
      x: sumX / points.length,
      y: sumY / points.length
    }
  }, [])

  const getGestureScale = useCallback((points: TouchPoint[]): number => {
    if (points.length < 2) return 1
    
    const point1 = points[0]
    const point2 = points[1]
    
    const distance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    )
    
    return distance / 100 // Normalize to reasonable scale
  }, [])

  const getGestureRotation = useCallback((points: TouchPoint[]): number => {
    if (points.length < 2) return 0
    
    const point1 = points[0]
    const point2 = points[1]
    
    return Math.atan2(point2.y - point1.y, point2.x - point1.x) * (180 / Math.PI)
  }, [])

  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const shouldHandle = shouldHandleTouchEvent(event)

    if (!shouldHandle) {
      return
    }

    event.preventDefault()

    const touches = Array.from(event.changedTouches)
    touches.forEach(touch => {
      const point = getTouchPoint(touch)
      touchPoints.current.set(touch.identifier, point)
    })

    const currentPoints = Array.from(touchPoints.current.values())

    // Long press detection
    if (enableLongPress && currentPoints.length === 1) {
      longPressTimer.current = setTimeout(() => {
        const gesture: TouchGesture = {
          type: 'long-press',
          points: currentPoints,
          center: getGestureCenter(currentPoints)
        }
        lastGesture.current = gesture
        onLongPress?.(gesture)
        triggerHapticFeedback('medium')
      }, longPressDelay)
    }
  }, [
    enableLongPress,
    longPressDelay,
    getTouchPoint,
    getGestureCenter,
    onLongPress,
    triggerHapticFeedback,
    shouldHandleTouchEvent
  ])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    const shouldHandle = touchPoints.current.size > 0 || shouldHandleTouchEvent(event)

    if (!shouldHandle) {
      return
    }

    event.preventDefault()

    // Clear long press timer if moving
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    const touches = Array.from(event.touches).filter(touch =>
      touchPoints.current.has(touch.identifier)
    )

    if (touches.length === 0) {
      return
    }

    // Update touch points
    touches.forEach(touch => {
      const point = getTouchPoint(touch)
      touchPoints.current.set(touch.identifier, point)
    })

    const allPoints = Array.from(touchPoints.current.values())

    if (allPoints.length === 2 && enablePinchZoom) {
      // Pinch gesture
      const scale = getGestureScale(allPoints)
      const rotation = getGestureRotation(allPoints)
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        const gesture: TouchGesture = {
          type: 'pinch',
          points: allPoints,
          center: getGestureCenter(allPoints),
          scale,
          rotation
        }
        lastGesture.current = gesture
        onPinch?.(gesture)
      }
    } else if (allPoints.length === 1 && enablePan) {
      // Pan gesture
      const point = allPoints[0]
      const lastPoint = lastGesture.current?.points[0]
      
      if (lastPoint) {
        const deltaX = point.x - lastPoint.x
        const deltaY = point.y - lastPoint.y
        
        if (Math.abs(deltaX) > panThreshold || Math.abs(deltaY) > panThreshold) {
          const gesture: TouchGesture = {
            type: 'pan',
            points: allPoints,
            center: getGestureCenter(allPoints),
            deltaX,
            deltaY
          }
          lastGesture.current = gesture
          onPan?.(gesture)
        }
      }
    }
  }, [
    enablePinchZoom,
    enablePan,
    pinchThreshold,
    panThreshold,
    getTouchPoint,
    getGestureScale,
    getGestureRotation,
    getGestureCenter,
    onPinch,
    onPan,
    shouldHandleTouchEvent
  ])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    const shouldHandle = touchPoints.current.size > 0 || shouldHandleTouchEvent(event)

    if (!shouldHandle) {
      return
    }

    event.preventDefault()

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    const currentPoints = Array.from(touchPoints.current.values())

    // Remove ended touches
    const endedTouches = Array.from(event.changedTouches)
    endedTouches.forEach(touch => {
      touchPoints.current.delete(touch.identifier)
    })

    // Handle tap gestures
    if (currentPoints.length === 1 && enableTap) {
      const point = currentPoints[0]
      const now = Date.now()
      
      if (now - lastTapTime.current < doubleTapDelay && enableDoubleTap) {
        // Double tap
        const gesture: TouchGesture = {
          type: 'double-tap',
          points: [point],
          center: { x: point.x, y: point.y }
        }
        lastGesture.current = gesture
        onDoubleTap?.(gesture)
        triggerHapticFeedback('light')
        lastTapTime.current = 0 // Reset to prevent triple tap
      } else {
        // Single tap
        const gesture: TouchGesture = {
          type: 'tap',
          points: [point],
          center: { x: point.x, y: point.y }
        }
        lastGesture.current = gesture
        onTap?.(gesture)
        triggerHapticFeedback('light')
        lastTapTime.current = now
      }
    }
  }, [
    enableTap,
    enableDoubleTap,
    doubleTapDelay,
    onTap,
    onDoubleTap,
    triggerHapticFeedback,
    shouldHandleTouchEvent
  ])

  // Add touch event listeners
  useEffect(() => {
    if (!isTouchDevice) return

    const element = document.documentElement
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isTouchDevice, handleTouchStart, handleTouchMove, handleTouchEnd])

  // Orientation lock
  useEffect(() => {
    if (!enableOrientationLock || !isMobile) return

    const lockOrientation = async () => {
      try {
        if ('orientation' in screen && 'lock' in screen.orientation) {
          await screen.orientation.lock('landscape')
        }
      } catch (error) {
        console.warn('Orientation lock not supported:', error)
      }
    }

    lockOrientation()
  }, [enableOrientationLock, isMobile])

  // Mobile-specific CSS classes
  const getMobileClasses = useCallback(() => {
    const classes = []
    
    if (isMobile) classes.push('mobile-device')
    if (isTouchDevice) classes.push('touch-device')
    if (orientation === 'portrait') classes.push('portrait-orientation')
    if (orientation === 'landscape') classes.push('landscape-orientation')
    if (isFullscreen) classes.push('fullscreen-mode')
    
    return classes.join(' ')
  }, [isMobile, isTouchDevice, orientation, isFullscreen])

  // Responsive breakpoints
  const getResponsiveClass = useCallback((breakpoint: 'sm' | 'md' | 'lg' | 'xl') => {
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
    
    return screenSize.width >= breakpoints[breakpoint] ? `above-${breakpoint}` : `below-${breakpoint}`
  }, [screenSize.width])

  return {
    // Device detection
    isMobile,
    isTouchDevice,
    orientation,
    screenSize,
    isFullscreen,
    
    // Gesture data
    lastGesture: lastGesture.current,
    
    // Methods
    triggerHapticFeedback,
    toggleFullscreen,
    getMobileClasses,
    getResponsiveClass,
    
    // Touch point data
    touchPoints: Array.from(touchPoints.current.values())
  }
}

export default useMobileOptimization
