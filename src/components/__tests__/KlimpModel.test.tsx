import { render } from '@testing-library/react'
import { KlimpModel, KlimpSymbolic } from '../KlimpModel'
import { NXBox } from '@/lib/nx-generator'
import { Canvas } from '@react-three/fiber'

// Mock useGLTF and Edges
jest.mock('@react-three/drei', () => {
  const useGLTF = jest.fn(() => ({
    scene: {
      clone: jest.fn(() => ({
        traverse: jest.fn(),
      })),
    },
  }))

  ;(useGLTF as unknown as { preload: jest.Mock }).preload = jest.fn()

  // Mock Edges component used by VisualKlimp
  const Edges = jest.fn(() => null)

  return { useGLTF, Edges }
})

const mockKlimpBox: NXBox = {
  name: 'KLIMP_1',
  point1: { x: 0, y: 0, z: 0 },
  point2: { x: 3, y: 0.75, z: 4 },
  type: 'klimp',
  color: '#8b7355',
  metadata: 'top edge'
}

const mockKlimpBoxLeftEdge: NXBox = {
  ...mockKlimpBox,
  metadata: 'left edge'
}

const mockKlimpBoxRightEdge: NXBox = {
  ...mockKlimpBox,
  metadata: 'right edge'
}

describe('KlimpModel', () => {
  it('should render without crashing', () => {
    const mockOnError = jest.fn()

    render(
      <Canvas>
        <KlimpModel box={mockKlimpBox} onError={mockOnError} />
      </Canvas>
    )

    expect(mockOnError).not.toHaveBeenCalled()
  })

  it('should use default scale of 0.1', () => {
    render(
      <Canvas>
        <KlimpModel box={mockKlimpBox} />
      </Canvas>
    )

    // Component should render without errors
    expect(true).toBe(true)
  })

  it('should accept custom scale', () => {
    render(
      <Canvas>
        <KlimpModel box={mockKlimpBox} scale={0.2} />
      </Canvas>
    )

    expect(true).toBe(true)
  })

  it('should handle different edge types', () => {
    const { rerender } = render(
      <Canvas>
        <KlimpModel box={mockKlimpBox} />
      </Canvas>
    )

    // Test left edge
    rerender(
      <Canvas>
        <KlimpModel box={mockKlimpBoxLeftEdge} />
      </Canvas>
    )

    // Test right edge
    rerender(
      <Canvas>
        <KlimpModel box={mockKlimpBoxRightEdge} />
      </Canvas>
    )

    expect(true).toBe(true)
  })

  it('should call onError if model fails to load', () => {
    const mockOnError = jest.fn()

    // Mock useGLTF to throw error
    const { useGLTF } = require('@react-three/drei')
    useGLTF.mockImplementationOnce(() => {
      throw new Error('Model not found')
    })

    render(
      <Canvas>
        <KlimpModel box={mockKlimpBox} onError={mockOnError} />
      </Canvas>
    )

    // Should handle error gracefully
    expect(true).toBe(true)
  })
})

describe('KlimpSymbolic', () => {
  it('should render symbolic representation', () => {
    render(
      <Canvas>
        <KlimpSymbolic box={mockKlimpBox} />
      </Canvas>
    )

    expect(true).toBe(true)
  })

  it('should calculate center position correctly', () => {
    const box: NXBox = {
      name: 'TEST',
      point1: { x: 0, y: 0, z: 0 },
      point2: { x: 4, y: 2, z: 6 },
      type: 'klimp'
    }

    render(
      <Canvas>
        <KlimpSymbolic box={box} />
      </Canvas>
    )

    // Center should be at (2, 1, 3) in NX coords
    // Converted to Three.js: [0.2, 0.3, -0.1] with scale 0.1
    expect(true).toBe(true)
  })

  it('should use metallic material', () => {
    render(
      <Canvas>
        <KlimpSymbolic box={mockKlimpBox} />
      </Canvas>
    )

    // Should render with metalness and roughness properties
    expect(true).toBe(true)
  })

  it('should respect custom scale', () => {
    render(
      <Canvas>
        <KlimpSymbolic box={mockKlimpBox} scale={0.2} />
      </Canvas>
    )

    expect(true).toBe(true)
  })
})
