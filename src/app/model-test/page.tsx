'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, useGLTF } from '@react-three/drei'
import { useState } from 'react'
import { KlimpModel } from '@/components/KlimpModel'
import { StencilModel } from '@/components/StencilModel'
import { HardwareModel } from '@/components/HardwareModels'
import { NXBox } from '@/lib/nx-generator'

/**
 * Model Testing Page
 * Test GLB model loading and orientations
 */
export default function ModelTestPage() {
  const [modelType, setModelType] = useState<'klimp' | 'stencil' | 'hardware'>('klimp')
  const [rotationX, setRotationX] = useState(0)
  const [rotationY, setRotationY] = useState(0)
  const [rotationZ, setRotationZ] = useState(0)
  const [useBoundingBox, setUseBoundingBox] = useState(true)

  // Test box for klimp
  const testKlimpBox: NXBox = {
    name: 'TEST_KLIMP',
    point1: { x: -2, y: -2, z: 0 },
    point2: { x: 2, y: 2, z: 4 },
    type: 'klimp',
    metadata: 'top edge'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">3D Model Test Page</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Model Type</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
            >
              <option value="klimp">Klimp</option>
              <option value="stencil">Stencil (Fragile)</option>
              <option value="hardware">Lag Screw</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useBoundingBox}
                onChange={(e) => setUseBoundingBox(e.target.checked)}
                className="rounded"
              />
              <span>Use Bounding Box</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rotation X: {rotationX}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotationX}
              onChange={(e) => setRotationX(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rotation Y: {rotationY}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotationY}
              onChange={(e) => setRotationY(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rotation Z: {rotationZ}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotationZ}
              onChange={(e) => setRotationZ(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={() => {
              setRotationX(0)
              setRotationY(0)
              setRotationZ(0)
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Reset Rotation
          </button>

          <div className="bg-gray-800 p-4 rounded mt-4">
            <h3 className="font-bold mb-2">Instructions:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Convert STEP file to GLB</li>
              <li>Place in /public/models/</li>
              <li>Uncheck "Use Bounding Box"</li>
              <li>Adjust rotation until correct</li>
              <li>Note the rotation values</li>
              <li>Update orientation detector</li>
            </ol>
          </div>
        </div>

        {/* 3D Viewer */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg" style={{ height: '600px' }}>
            <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <directionalLight position={[-10, -10, -5]} intensity={0.5} />

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

              {/* Test Model */}
              {modelType === 'klimp' && (
                <KlimpModel
                  box={testKlimpBox}
                  scale={0.1}
                  useBoundingBox={useBoundingBox}
                />
              )}

              {modelType === 'stencil' && (
                <StencilModel
                  stencilType="fragile"
                  position={[0, 0, 10]}
                  rotation={[
                    (rotationX * Math.PI) / 180,
                    (rotationY * Math.PI) / 180,
                    (rotationZ * Math.PI) / 180
                  ]}
                  scale={0.1}
                  useBoundingBox={useBoundingBox}
                />
              )}

              {modelType === 'hardware' && (
                <HardwareModel
                  type="lag-screw"
                  position={[0, 0, 5]}
                  rotation={[
                    (rotationX * Math.PI) / 180,
                    (rotationY * Math.PI) / 180,
                    (rotationZ * Math.PI) / 180
                  ]}
                  scale={0.1}
                />
              )}

              {/* Coordinate axes */}
              <axesHelper args={[5]} />

              <OrbitControls makeDefault />
            </Canvas>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="bg-red-900/20 border border-red-500 p-3 rounded">
              <div className="font-bold text-red-400">X Axis (Red)</div>
              <div>Width / Left-Right</div>
            </div>
            <div className="bg-green-900/20 border border-green-500 p-3 rounded">
              <div className="font-bold text-green-400">Y Axis (Green)</div>
              <div>Height / Up-Down</div>
            </div>
            <div className="bg-blue-900/20 border border-blue-500 p-3 rounded">
              <div className="font-bold text-blue-400">Z Axis (Blue)</div>
              <div>Depth / Front-Back</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
