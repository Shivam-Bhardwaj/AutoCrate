'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Stage, Environment } from '@react-three/drei'
import { useState, Suspense } from 'react'
import { KlimpModel } from '@/components/KlimpModel'
import { Klimp3D, LagScrew3D, Washer3D, Stencil3D, HardwareAssembly } from '@/components/HardwareModel3D'
import { NXBox } from '@/lib/nx-generator'

export default function HardwareTestPage() {
  const [renderMode, setRenderMode] = useState<'3d' | 'step' | 'glb' | 'bbox'>('3d')
  const [showKlimp, setShowKlimp] = useState(true)
  const [showLagScrew, setShowLagScrew] = useState(true)
  const [showWasher, setShowWasher] = useState(true)
  const [showStencil, setShowStencil] = useState(true)
  const [scale, setScale] = useState(1)

  // Test klimp box
  const testKlimpBox: NXBox = {
    name: 'TEST_KLIMP',
    point1: { x: -2, y: -2, z: 0 },
    point2: { x: 2, y: 2, z: 4 },
    type: 'klimp',
    metadata: 'top edge',
    color: '#8b7355'
  }

  const leftKlimpBox: NXBox = {
    ...testKlimpBox,
    metadata: 'left edge'
  }

  const rightKlimpBox: NXBox = {
    ...testKlimpBox,
    metadata: 'right edge'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Hardware 3D Test</h1>
        <p className="text-gray-400 mb-6">Testing actual 3D geometry rendering</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="font-bold mb-3">Render Mode</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={renderMode === '3d'}
                    onChange={() => setRenderMode('3d')}
                    className="mr-2"
                  />
                  <span className="text-green-400">3D Model (Visible)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={renderMode === 'step'}
                    onChange={() => setRenderMode('step')}
                    className="mr-2"
                  />
                  <span>STEP File</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={renderMode === 'glb'}
                    onChange={() => setRenderMode('glb')}
                    className="mr-2"
                  />
                  <span>GLB Model</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={renderMode === 'bbox'}
                    onChange={() => setRenderMode('bbox')}
                    className="mr-2"
                  />
                  <span>Bounding Box</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="font-bold mb-3">Component Visibility</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showKlimp}
                    onChange={(e) => setShowKlimp(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Klimp (L-bracket)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showLagScrew}
                    onChange={(e) => setShowLagScrew(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Lag Screw</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showWasher}
                    onChange={(e) => setShowWasher(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Washer</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showStencil}
                    onChange={(e) => setShowStencil(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Stencils</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="font-bold mb-2">Scale: {scale.toFixed(2)}</h3>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="bg-green-900/20 border border-green-600 p-4 rounded">
              <h3 className="font-bold text-green-400 mb-2">✓ Solution</h3>
              <p className="text-sm">
                The "3D Model (Visible)" option uses hardcoded geometry that renders immediately
                without external dependencies.
              </p>
            </div>
          </div>

          {/* Main 3D View */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <Canvas camera={{ position: [10, 10, 10], fov: 50 }} shadows>
                <ambientLight intensity={0.5} />
                <directionalLight
                  position={[10, 10, 5]}
                  intensity={1}
                  castShadow
                  shadow-mapSize-width={1024}
                  shadow-mapSize-height={1024}
                />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />

                <Grid
                  args={[20, 20]}
                  cellSize={1}
                  cellThickness={0.5}
                  cellColor="#6b7280"
                  sectionSize={5}
                  sectionThickness={1}
                  sectionColor="#9ca3af"
                  fadeDistance={30}
                  fadeStrength={1}
                  followCamera={false}
                />

                <Suspense fallback={null}>
                  {/* Klimps */}
                  {showKlimp && (
                    <group>
                      {renderMode === '3d' ? (
                        <>
                          <Klimp3D box={testKlimpBox} scale={scale * 0.1} />
                          <Klimp3D box={leftKlimpBox} scale={scale * 0.1} />
                          <Klimp3D box={rightKlimpBox} scale={scale * 0.1} />
                        </>
                      ) : (
                        <>
                          <KlimpModel
                            box={testKlimpBox}
                            scale={scale * 0.1}
                            use3DModel={false}
                            useStepFile={renderMode === 'step'}
                            useBoundingBox={renderMode === 'bbox'}
                          />
                          <KlimpModel
                            box={leftKlimpBox}
                            scale={scale * 0.1}
                            use3DModel={false}
                            useStepFile={renderMode === 'step'}
                            useBoundingBox={renderMode === 'bbox'}
                          />
                          <KlimpModel
                            box={rightKlimpBox}
                            scale={scale * 0.1}
                            use3DModel={false}
                            useStepFile={renderMode === 'step'}
                            useBoundingBox={renderMode === 'bbox'}
                          />
                        </>
                      )}
                    </group>
                  )}

                  {/* Lag Screws */}
                  {showLagScrew && renderMode === '3d' && (
                    <group>
                      <LagScrew3D
                        position={[5, 0, 0]}
                        rotation={[Math.PI / 2, 0, 0]}
                        scale={scale * 0.1}
                        length={2.5}
                      />
                      <LagScrew3D
                        position={[6, 0, 0]}
                        rotation={[Math.PI / 2, 0, 0]}
                        scale={scale * 0.1}
                        length={3.0}
                      />
                    </group>
                  )}

                  {/* Washers */}
                  {showWasher && renderMode === '3d' && (
                    <group>
                      <Washer3D position={[5, 0, 1]} scale={scale * 0.1} />
                      <Washer3D position={[6, 0, 1]} scale={scale * 0.1} />
                    </group>
                  )}

                  {/* Stencils */}
                  {showStencil && renderMode === '3d' && (
                    <group>
                      <Stencil3D
                        type="fragile"
                        position={[-5, 0, 0]}
                        rotation={[0, 0, 0]}
                        scale={scale * 0.1}
                      />
                      <Stencil3D
                        type="handling"
                        position={[-5, 0, 3]}
                        rotation={[0, 0, 0]}
                        scale={scale * 0.1}
                      />
                      <Stencil3D
                        type="doNotStack"
                        position={[-5, 0, -3]}
                        rotation={[0, 0, 0]}
                        scale={scale * 0.1}
                      />
                    </group>
                  )}
                </Suspense>

                <axesHelper args={[5]} />
                <OrbitControls makeDefault />
              </Canvas>
            </div>

            <div className="mt-4 bg-gray-800 p-4 rounded">
              <h3 className="font-bold mb-2">Status</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Mode:</span>{' '}
                  <span className={renderMode === '3d' ? 'text-green-400' : ''}>
                    {renderMode.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Components:</span>{' '}
                  {[showKlimp && 'Klimp', showLagScrew && 'Screw', showWasher && 'Washer', showStencil && 'Stencil']
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison View */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="font-bold mb-3">Rendering Methods</h3>
              <div className="space-y-3 text-sm">
                <div className="border-l-4 border-green-500 pl-3">
                  <div className="font-semibold text-green-400">3D Model ✓</div>
                  <div className="text-gray-400">Hardcoded geometry, always works</div>
                </div>
                <div className="border-l-4 border-yellow-500 pl-3">
                  <div className="font-semibold">STEP File</div>
                  <div className="text-gray-400">Requires OpenCascade.js</div>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <div className="font-semibold">GLB Model</div>
                  <div className="text-gray-400">Requires file conversion</div>
                </div>
                <div className="border-l-4 border-gray-500 pl-3">
                  <div className="font-semibold">Bounding Box</div>
                  <div className="text-gray-400">Simple placeholder</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded mt-4">
              <h3 className="font-bold mb-3">Component Info</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="font-semibold">Klimp</div>
                  <div className="text-gray-400">L-bracket, 4" × 3" × 1"</div>
                </div>
                <div>
                  <div className="font-semibold">Lag Screw</div>
                  <div className="text-gray-400">3/8" diameter, 2.5" & 3.0"</div>
                </div>
                <div>
                  <div className="font-semibold">Washer</div>
                  <div className="text-gray-400">7/16" OD, 3/16" ID</div>
                </div>
                <div>
                  <div className="font-semibold">Stencils</div>
                  <div className="text-gray-400">Fragile, Handling, etc.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}