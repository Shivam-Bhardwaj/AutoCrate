'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Stage, Center } from '@react-three/drei'
import { useState, Suspense } from 'react'
import { StepFileViewer } from '@/components/StepFileViewer'
import * as THREE from 'three'

const STEP_FILES = [
  { name: 'Klimp #4', url: '/step-files/klimp-4.stp', color: '#8b7355' },
  { name: 'Lag Screw 2.50"', url: '/step-files/lag-screw-2-50.stp', color: '#606060' },
  { name: 'Lag Screw 3.00"', url: '/step-files/lag-screw-3-00.stp', color: '#606060' },
  { name: 'Flat Washer', url: '/step-files/flat-washer.stp', color: '#808080' },
  { name: 'Stencil - Fragile', url: '/step-files/stencil-fragile.stp', color: '#ff0000' },
  { name: 'Stencil - CG', url: '/step-files/stencil-cg.stp', color: '#0000ff' },
  { name: 'Stencil - Do Not Stack', url: '/step-files/stencil-do-not-stack.stp', color: '#ff8800' },
  { name: 'Stencil - Horizontal', url: '/step-files/stencil-horizontal.stp', color: '#00aa00' },
  { name: 'Stencil - Vertical', url: '/step-files/stencil-vertical.stp', color: '#00aa00' },
  { name: 'Stencil - Applied Impact', url: '/step-files/stencil-applied-impact.stp', color: '#ff00ff' }
]

export default function StepViewerPage() {
  const [selectedFile, setSelectedFile] = useState(STEP_FILES[0])
  const [scale, setScale] = useState(0.1)
  const [wireframe, setWireframe] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [loadStatus, setLoadStatus] = useState<string>('Ready')
  const [geometryInfo, setGeometryInfo] = useState<string>('')

  const handleLoad = (geometry: THREE.BufferGeometry) => {
    const vertices = geometry.attributes.position?.count || 0
    const triangles = geometry.index ? geometry.index.count / 3 : 0
    const info = `Loaded: ${vertices} vertices, ${triangles} triangles`
    setGeometryInfo(info)
    setLoadStatus('Loaded')
    console.log('STEP file loaded:', info)
  }

  const handleError = (error: Error) => {
    setLoadStatus(`Error: ${error.message}`)
    setGeometryInfo('')
    console.error('Failed to load STEP file:', error)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">STEP File Viewer</h1>
        <p className="text-gray-400 mb-6">Direct STEP file parsing using OpenCascade.js - Real CAD geometry!</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">STEP File</label>
              <select
                value={selectedFile.url}
                onChange={(e) => {
                  const file = STEP_FILES.find(f => f.url === e.target.value)
                  if (file) {
                    setSelectedFile(file)
                    setLoadStatus('Loading...')
                  }
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
              >
                {STEP_FILES.map(file => (
                  <option key={file.url} value={file.url}>
                    {file.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Scale: {scale.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.001"
                max="1"
                step="0.001"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rotation X: {rotation.x}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation.x}
                onChange={(e) => setRotation({ ...rotation, x: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rotation Y: {rotation.y}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation.y}
                onChange={(e) => setRotation({ ...rotation, y: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rotation Z: {rotation.z}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation.z}
                onChange={(e) => setRotation({ ...rotation, z: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={wireframe}
                  onChange={(e) => setWireframe(e.target.checked)}
                  className="rounded"
                />
                <span>Wireframe</span>
              </label>
            </div>

            <button
              onClick={() => setRotation({ x: 0, y: 0, z: 0 })}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Reset Rotation
            </button>

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="font-bold mb-2">Status</h3>
              <p className="text-sm text-gray-400">{loadStatus}</p>
              {geometryInfo && (
                <p className="text-sm text-green-400 mt-2">{geometryInfo}</p>
              )}
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded">
              <h3 className="font-bold text-yellow-400 mb-2">⚡ Real Geometry!</h3>
              <p className="text-sm">
                This viewer parses actual STEP file CAD geometry using OpenCascade.js.
                You're seeing the real surfaces, curves, and topology - not just bounding boxes!
              </p>
            </div>
          </div>

          {/* 3D Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} />
                <spotLight position={[0, 20, 0]} intensity={0.5} angle={0.3} />

                <Grid
                  args={[50, 50]}
                  cellSize={1}
                  cellThickness={0.5}
                  cellColor="#6b7280"
                  sectionSize={5}
                  sectionThickness={1}
                  sectionColor="#9ca3af"
                  fadeDistance={100}
                  fadeStrength={1}
                  followCamera={false}
                />

                <Suspense fallback={
                  <mesh>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshBasicMaterial color="gray" wireframe />
                  </mesh>
                }>
                  <StepFileViewer
                    stepFileUrl={selectedFile.url}
                    position={[0, 0, 0]}
                    rotation={[
                      (rotation.x * Math.PI) / 180,
                      (rotation.y * Math.PI) / 180,
                      (rotation.z * Math.PI) / 180
                    ]}
                    scale={scale}
                    color={selectedFile.color}
                    onLoad={handleLoad}
                    onError={handleError}
                  />
                </Suspense>

                {/* Axes helper */}
                <axesHelper args={[10]} />

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

            <div className="mt-4 bg-gray-800 p-4 rounded">
              <h3 className="font-bold mb-2">File Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Selected:</span> {selectedFile.name}
                </div>
                <div>
                  <span className="text-gray-400">Format:</span> ISO 10303-21 (STEP)
                </div>
                <div>
                  <span className="text-gray-400">Parser:</span> OpenCascade.js
                </div>
                <div>
                  <span className="text-gray-400">Rendering:</span> Three.js + React Three Fiber
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}