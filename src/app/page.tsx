'use client'

import { useState, useEffect, useRef } from 'react'
import CrateVisualizer from '@/components/CrateVisualizer'
import { NXGenerator, CrateConfig } from '@/lib/nx-generator'
import { PlywoodPieceSelector } from '@/components/PlywoodPieceSelector'

export default function Home() {
  // Store input values as strings for better input handling
  const [inputValues, setInputValues] = useState({
    length: '135',
    width: '135',
    height: '135',
    weight: '10000',
    sideClearance: '2',
    endClearance: '2',
    topClearance: '3'
  })

  // State for 3x4 lumber permission toggle
  const [allow3x4Lumber, setAllow3x4Lumber] = useState(false)

  // State for display options
  const [displayOptions, setDisplayOptions] = useState({
    // Component visibility toggles
    visibility: {
      skids: true,
      floorboards: true,
      frontPanel: true,
      backPanel: true,
      leftPanel: true,
      rightPanel: true,
      topPanel: true,
      cleats: true
    },
    // Lumber size preferences
    lumberSizes: {
      '2x6': true,
      '2x8': true,
      '2x10': true,
      '2x12': true
    }
  })

  const [config, setConfig] = useState<CrateConfig>({
    product: {
      length: 135,
      width: 135,
      height: 135,
      weight: 10000
    },
    clearances: {
      side: 2,
      end: 2,
      top: 3
    },
    materials: {
      skidSize: '4x4',
      panelThickness: 1,
      cleatSize: '2x4',
      allow3x4Lumber: false
    }
  })

  const [generator, setGenerator] = useState<NXGenerator>(() => new NXGenerator(config))
  const [activeTab, setActiveTab] = useState<'visualization' | 'expressions' | 'bom' | 'plywood'>('visualization')
  const [showMobileInputs, setShowMobileInputs] = useState(false)
  // Initialize all plywood pieces as visible by default
  const [plywoodPieceVisibility, setPlywoodPieceVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    // Set all plywood pieces to visible by default
    for (let i = 1; i <= 6; i++) {
      initial[`FRONT_PANEL_PLY_${i}`] = true
      initial[`BACK_PANEL_PLY_${i}`] = true
      initial[`LEFT_END_PANEL_PLY_${i}`] = true
      initial[`RIGHT_END_PANEL_PLY_${i}`] = true
      initial[`TOP_PANEL_PLY_${i}`] = true
    }
    return initial
  })
  const debounceTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // Update generator when config changes or 3x4 lumber permission changes
  useEffect(() => {
    // Filter available lumber sizes based on toggles
    const availableLumber = Object.entries(displayOptions.lumberSizes)
      .filter(([_size, enabled]) => enabled)
      .map(([size, _enabled]) => size as '2x6' | '2x8' | '2x10' | '2x12')

    setGenerator(new NXGenerator({
      ...config,
      materials: {
        ...config.materials,
        allow3x4Lumber: allow3x4Lumber,
        availableLumber: availableLumber
      }
    }))
  }, [config, allow3x4Lumber, displayOptions.lumberSizes])

  const handleInputChange = (field: keyof typeof inputValues, value: string) => {
    // Update input value immediately
    setInputValues(prev => ({ ...prev, [field]: value }))

    // Clear existing timeout for this field
    if (debounceTimeoutRef.current[field]) {
      clearTimeout(debounceTimeoutRef.current[field])
    }

    // Debounce the config update
    debounceTimeoutRef.current[field] = setTimeout(() => {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        // Check if it's a clearance field or product field
        if (field === 'sideClearance' || field === 'endClearance' || field === 'topClearance') {
          const clearanceField = field === 'sideClearance' ? 'side' :
                                 field === 'endClearance' ? 'end' : 'top'
          setConfig(prev => ({
            ...prev,
            clearances: { ...prev.clearances, [clearanceField]: numValue }
          }))
        } else {
          setConfig(prev => ({
            ...prev,
            product: { ...prev.product, [field]: numValue }
          }))
        }
      }
    }, 500) // 500ms delay before updating config
  }

  const handleInputBlur = (field: keyof typeof inputValues) => {
    // Immediately update config on blur
    const value = inputValues[field]
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      // Check if it's a clearance field or product field
      if (field === 'sideClearance' || field === 'endClearance' || field === 'topClearance') {
        const clearanceField = field === 'sideClearance' ? 'side' :
                               field === 'endClearance' ? 'end' : 'top'
        setConfig(prev => ({
          ...prev,
          clearances: { ...prev.clearances, [clearanceField]: numValue }
        }))
      } else {
        setConfig(prev => ({
          ...prev,
          product: { ...prev.product, [field]: numValue }
        }))
      }
    }
  }

  const downloadExpressions = () => {
    const expressions = generator.exportNXExpressions()
    const blob = new Blob([expressions], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crate_expressions_${Date.now()}.exp`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadBOM = () => {
    const bom = generator.generateBOM()
    const csv = 'Item,Size,Quantity,Material\n' +
      bom.map(row => `${row.item},"${row.size}",${row.quantity},${row.material}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crate_bom_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Helper functions for display options
  const toggleComponentVisibility = (component: keyof typeof displayOptions.visibility) => {
    setDisplayOptions(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [component]: !prev.visibility[component]
      }
    }))
  }

  const toggleLumberSize = (size: keyof typeof displayOptions.lumberSizes) => {
    setDisplayOptions(prev => ({
      ...prev,
      lumberSizes: {
        ...prev.lumberSizes,
        [size]: !prev.lumberSizes[size]
      }
    }))
  }

  // Filter boxes based on visibility settings
  const getFilteredBoxes = () => {
    return generator.getBoxes().filter(box => {
      // Check component visibility
      if (box.type === 'skid' && !displayOptions.visibility.skids) return false
      if (box.type === 'floor' && !displayOptions.visibility.floorboards) return false
      if (box.type === 'cleat' && !displayOptions.visibility.cleats) return false

      // Handle plywood pieces based on individual selection
      if (box.type === 'plywood') {
        // Don't show suppressed pieces
        if (box.suppressed) return false
        // Check panel visibility based on panel name
        if (box.panelName === 'FRONT_PANEL' && !displayOptions.visibility.frontPanel) return false
        if (box.panelName === 'BACK_PANEL' && !displayOptions.visibility.backPanel) return false
        if (box.panelName === 'LEFT_END_PANEL' && !displayOptions.visibility.leftPanel) return false
        if (box.panelName === 'RIGHT_END_PANEL' && !displayOptions.visibility.rightPanel) return false
        if (box.panelName === 'TOP_PANEL' && !displayOptions.visibility.topPanel) return false
        // Check individual piece visibility (default to true if not set)
        if (plywoodPieceVisibility[box.name] === false) return false
        return true
      }

      // Legacy panel visibility (for non-plywood mode)
      if (box.name === 'FRONT_PANEL' && !displayOptions.visibility.frontPanel) return false
      if (box.name === 'BACK_PANEL' && !displayOptions.visibility.backPanel) return false
      if (box.name === 'LEFT_END_PANEL' && !displayOptions.visibility.leftPanel) return false
      if (box.name === 'RIGHT_END_PANEL' && !displayOptions.visibility.rightPanel) return false
      if (box.name === 'TOP_PANEL' && !displayOptions.visibility.topPanel) return false

      return true
    })
  }

  const handlePlywoodPieceToggle = (pieceName: string) => {
    setPlywoodPieceVisibility(prev => ({
      ...prev,
      [pieceName]: !prev[pieceName]
    }))
  }

  return (
    <main className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Compact Header */}
      <div className="bg-white shadow-sm px-4 py-1.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileInputs(!showMobileInputs)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileInputs ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">AutoCrate NX Generator</h1>
              <p className="text-xs text-gray-600 hidden lg:block">Two Diagonal Points Method</p>
            </div>
          </div>
          <div className="flex gap-1 lg:gap-2">
            <button
              onClick={downloadExpressions}
              className="bg-blue-600 text-white px-2 lg:px-3 py-1 text-xs lg:text-sm rounded hover:bg-blue-700"
            >
              Export NX
            </button>
            <button
              onClick={downloadBOM}
              className="bg-green-600 text-white px-2 lg:px-3 py-1 text-xs lg:text-sm rounded hover:bg-green-700"
            >
              Export BOM
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 flex gap-2 p-2 min-h-0">
        {/* Left Panel - Inputs */}
        <div className={`${showMobileInputs ? 'block' : 'hidden'} lg:block w-64 bg-white rounded-lg shadow-sm p-2 overflow-y-auto flex-shrink-0`}>
          {/* Product Dimensions */}
          <div className="mb-2">
            <h3 className="text-sm font-semibold mb-1.5">Product Dimensions</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-xs text-gray-600">Length (Y)"</label>
                <input
                  type="text"
                  value={inputValues.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  onBlur={() => handleInputBlur('length')}
                  className="w-full text-sm border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Width (X)"</label>
                <input
                  type="text"
                  value={inputValues.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  onBlur={() => handleInputBlur('width')}
                  className="w-full text-sm border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Height (Z)"</label>
                <input
                  type="text"
                  value={inputValues.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  onBlur={() => handleInputBlur('height')}
                  className="w-full text-sm border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Weight (lbs)</label>
                <input
                  type="text"
                  value={inputValues.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  onBlur={() => handleInputBlur('weight')}
                  className="w-full text-sm border rounded px-2 py-1"
                />
              </div>
            </div>
          </div>

          {/* Clearances */}
          <div className="mb-2">
            <h3 className="text-sm font-semibold mb-1.5">Clearances (inches)</h3>
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-xs text-gray-600">Side</label>
                <input
                  type="text"
                  value={inputValues.sideClearance}
                  onChange={(e) => handleInputChange('sideClearance', e.target.value)}
                  onBlur={() => handleInputBlur('sideClearance')}
                  className="w-full text-sm border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">End</label>
                <input
                  type="text"
                  value={inputValues.endClearance}
                  onChange={(e) => handleInputChange('endClearance', e.target.value)}
                  onBlur={() => handleInputBlur('endClearance')}
                  className="w-full text-sm border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Top</label>
                <input
                  type="text"
                  value={inputValues.topClearance}
                  onChange={(e) => handleInputChange('topClearance', e.target.value)}
                  onBlur={() => handleInputBlur('topClearance')}
                  className="w-full text-sm border rounded px-2 py-1"
                />
              </div>
            </div>
          </div>

          {/* Calculated Dimensions */}
          <div className="mb-2 p-1.5 bg-gray-50 rounded">
            <h3 className="text-sm font-semibold mb-0.5">Calculated</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Overall:</span>
                <span className="font-medium">
                  {generator.getExpressions().get('overall_width')?.toFixed(1)}" ×
                  {generator.getExpressions().get('overall_length')?.toFixed(1)}" ×
                  {generator.getExpressions().get('overall_height')?.toFixed(1)}"
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skid:</span>
                <span className="font-medium">
                  {(() => {
                    const skidWidth = generator.getExpressions().get('skid_width');
                    if (skidWidth === 3.5) return '4x4 lumber';
                    if (skidWidth === 2.5) return '3x4 lumber';
                    if (skidWidth === 5.5) return '6x6 lumber';
                    if (skidWidth === 7.25) return '8x8 lumber';
                    return `${skidWidth?.toFixed(1)}"`;
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Materials Toggle */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">3x4 Lumber</span>
              <button
                onClick={() => setAllow3x4Lumber(!allow3x4Lumber)}
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                  allow3x4Lumber ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allow3x4Lumber ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {allow3x4Lumber ? 'For products < 500 lbs' : '4x4 for all < 4500 lbs'}
            </p>
          </div>

          {/* Display Options */}
          <div>
            <h3 className="text-sm font-semibold mb-1.5">Display Options</h3>

            {/* Component Visibility */}
            <div className="space-y-0.5 mb-1.5">
              {Object.entries(displayOptions.visibility).map(([component, isVisible]) => {
                // Format display names
                const displayName = component === 'frontPanel' ? 'Front Panel' :
                                   component === 'backPanel' ? 'Back Panel' :
                                   component === 'leftPanel' ? 'Left Panel' :
                                   component === 'rightPanel' ? 'Right Panel' :
                                   component === 'topPanel' ? 'Top Panel' :
                                   component === 'floorboards' ? 'Floorboards' :
                                   component === 'skids' ? 'Skids' :
                                   component === 'cleats' ? 'Cleats' : component;

                return (
                  <label key={component} className="flex items-center justify-between text-xs">
                    <span>{displayName}</span>
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleComponentVisibility(component as keyof typeof displayOptions.visibility)}
                      className="h-3 w-3"
                    />
                  </label>
                )
              })}
            </div>

            {/* Lumber Sizes */}
            <div className="space-y-0.5">
              <p className="text-xs font-medium">Floor Sizes</p>
              {Object.entries(displayOptions.lumberSizes).map(([size, isSelected]) => (
                <label key={size} className="flex items-center justify-between text-xs">
                  <span>{size}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleLumberSize(size as keyof typeof displayOptions.lumberSizes)}
                    className="h-3 w-3"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Visualization/Output */}
        <div className={`${showMobileInputs ? 'hidden' : 'block'} lg:block flex-1 bg-white rounded-lg shadow-sm flex flex-col min-h-0`}>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('visualization')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'visualization'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                3D View
              </button>
              <button
                onClick={() => setActiveTab('expressions')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'expressions'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                NX Expressions
              </button>
              <button
                onClick={() => setActiveTab('bom')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'bom'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                BOM
              </button>
              <button
                onClick={() => setActiveTab('plywood')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'plywood'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Plywood Pieces
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 min-h-0 overflow-hidden">
            {activeTab === 'visualization' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0">
                  <CrateVisualizer boxes={getFilteredBoxes()} />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Rotate: Left drag | Pan: Right drag | Zoom: Scroll
                </p>
              </div>
            )}

            {activeTab === 'expressions' && (
              <div className="h-full overflow-y-auto overflow-x-auto">
                <pre className="text-xs bg-gray-50 p-3 rounded font-mono whitespace-pre">
                  {generator.exportNXExpressions()}
                </pre>
              </div>
            )}

            {activeTab === 'bom' && (
              <div className="h-full overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {generator.generateBOM().map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-xs">{item.item}</td>
                        <td className="px-3 py-2 text-xs">{item.size}</td>
                        <td className="px-3 py-2 text-xs">{item.quantity}</td>
                        <td className="px-3 py-2 text-xs">{item.material}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'plywood' && (
              <div className="h-full overflow-auto">
                <PlywoodPieceSelector
                  boxes={generator.getBoxes()}
                  onPieceToggle={handlePlywoodPieceToggle}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}