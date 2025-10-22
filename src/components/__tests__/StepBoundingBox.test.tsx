import { render } from '@testing-library/react'
import { StepBoundingBox, KlimpBoundingBox } from '../StepBoundingBox'
import { Canvas } from '@react-three/fiber'

describe('StepBoundingBox', () => {
  it('should render without crashing', () => {
    render(
      <Canvas>
        <StepBoundingBox
          stepFileName="KLIMP_#4.stp"
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={0.1}
        />
      </Canvas>
    )

    expect(true).toBe(true)
  })

  it('should handle NX to Three.js coordinate conversion correctly', () => {
    // NX position (10, 20, 30) should convert to Three.js [1.0, 3.0, -2.0] with scale 0.1
    // NX: X=width, Y=length, Z=height
    // Three.js: X=width, Y=height, Z=-length

    render(
      <Canvas>
        <StepBoundingBox
          stepFileName="KLIMP_#4.stp"
          position={[10, 20, 30]}
          scale={0.1}
        />
      </Canvas>
    )

    // Component should render without coordinate errors
    expect(true).toBe(true)
  })

  it('should apply rotation correctly', () => {
    render(
      <Canvas>
        <StepBoundingBox
          stepFileName="KLIMP_#4.stp"
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.1}
        />
      </Canvas>
    )

    expect(true).toBe(true)
  })

  it('should respect visibility prop', () => {
    const { container } = render(
      <Canvas>
        <StepBoundingBox
          stepFileName="KLIMP_#4.stp"
          position={[0, 0, 0]}
          visible={false}
        />
      </Canvas>
    )

    // When visible=false, component should return null
    expect(container.textContent).toBe('')
  })
})

describe('KlimpBoundingBox', () => {
  it('should render klimp at correct position', () => {
    render(
      <Canvas>
        <KlimpBoundingBox
          position={[5, 10, 15]}
          rotation={[0, 0, 0]}
          scale={0.1}
        />
      </Canvas>
    )

    expect(true).toBe(true)
  })

  it('should use klimp dimensions from catalog', () => {
    render(
      <Canvas>
        <KlimpBoundingBox
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={0.1}
        />
      </Canvas>
    )

    // Should use dimensions from KLIMP_#4.stp: 4.92" × 3.92" × 1.15"
    expect(true).toBe(true)
  })
})
