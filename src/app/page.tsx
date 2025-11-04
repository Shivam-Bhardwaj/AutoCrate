'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import CrateVisualizer from '@/components/CrateVisualizer'
import { NXGenerator, CrateConfig, MarkingConfig, BillOfMaterialsRow } from '@/lib/nx-generator'
import { PlywoodPieceSelector } from '@/components/PlywoodPieceSelector'
import { StepGenerator } from '@/lib/step-generator'
import { VisualizationErrorBoundary } from '@/components/ErrorBoundary'
import { MarkingsSection } from '@/components/MarkingsSection'
import ScenarioSelector, { ScenarioPreset } from '@/components/ScenarioSelector'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LumberCutList } from '@/components/LumberCutList'
import { ChangeTracker } from '@/components/ChangeTracker'
import { PART_NUMBER_STANDARDS, FASTENER_STANDARDS, UI_CONSTANTS, GEOMETRY_STANDARDS, PLYWOOD_STANDARDS, VALIDATION_RULES } from '@/lib/crate-constants'
import { buildFullTutorial, getStepHighlightTargets, buildCallouts } from '@/lib/tutorial/schema'
import TutorialOverlay from '@/components/tutorial/TutorialOverlay'

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'default',
    name: 'Default Production',
    description: 'Large cubic crate suitable for the general AutoCrate setup.',
    product: UI_CONSTANTS.DEFAULT_PRODUCT,
    clearances: GEOMETRY_STANDARDS.DEFAULT_CLEARANCES,
    allow3x4: false,
    lumberSizes: { '2x6': true, '2x8': true, '2x10': true, '2x12': true },
    note: 'Matches the initial values used throughout the documentation.'
  },
  {
    id: 'lightweight-electronics',
    name: 'Lightweight Electronics',
    description: 'Compact build optimised for 3x4 lumber and tighter clearances.',
    product: { length: 60, width: 40, height: 36, weight: 350 },
    clearances: { side: 1.5, end: 1.5, top: 2 },
    allow3x4: true,
    lumberSizes: { '2x6': true, '2x8': false, '2x10': false, '2x12': false },
    note: 'Enables the 3x4 toggle to demonstrate lighter skid configurations.'
  },
  {
    id: 'heavy-industrial',
    name: 'Heavy Industrial',
    description: 'High-mass equipment requiring 6x6 skids and generous clearances.',
    product: { length: 130, width: 120, height: 84, weight: 18000 },
    clearances: { side: 3, end: 4, top: 6 },
    allow3x4: false,
    lumberSizes: { '2x6': false, '2x8': true, '2x10': true, '2x12': true },
    note: 'Great for verifying heavy-load calculations and skid spacing.'
  },
  {
    id: 'tall-precision',
    name: 'Tall Precision Module',
    description: 'Tall payload with higher top clearance for overhead fixtures.',
    product: { length: 96, width: 72, height: 110, weight: 8000 },
    clearances: { side: 2, end: 3, top: 8 },
    allow3x4: false,
    lumberSizes: { '2x6': true, '2x8': true, '2x10': true, '2x12': false },
    note: 'Use to check plywood splicing and cap calculations for tall crates.'
  }
]

const PRODUCT_SLIDER_CONFIG = {
  length: {
    min: VALIDATION_RULES.DIMENSIONS.MIN_LENGTH,
    max: VALIDATION_RULES.DIMENSIONS.MAX_LENGTH,
    step: 1,
    fallback: UI_CONSTANTS.DEFAULT_PRODUCT.length
  },
  width: {
    min: VALIDATION_RULES.DIMENSIONS.MIN_WIDTH,
    max: VALIDATION_RULES.DIMENSIONS.MAX_WIDTH,
    step: 1,
    fallback: UI_CONSTANTS.DEFAULT_PRODUCT.width
  },
  height: {
    min: VALIDATION_RULES.DIMENSIONS.MIN_HEIGHT,
    max: VALIDATION_RULES.DIMENSIONS.MAX_HEIGHT,
    step: 1,
    fallback: UI_CONSTANTS.DEFAULT_PRODUCT.height
  },
  weight: {
    min: VALIDATION_RULES.WEIGHT.MIN,
    max: VALIDATION_RULES.WEIGHT.MAX,
    step: 50,
    fallback: UI_CONSTANTS.DEFAULT_PRODUCT.weight
  }
} as const

type ProductField = keyof typeof PRODUCT_SLIDER_CONFIG

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function Home() {
  // Store input values as strings for better input handling
  const [inputValues, setInputValues] = useState({
    length: String(UI_CONSTANTS.DEFAULT_PRODUCT.length),
    width: String(UI_CONSTANTS.DEFAULT_PRODUCT.width),
    height: String(UI_CONSTANTS.DEFAULT_PRODUCT.height),
    weight: String(UI_CONSTANTS.DEFAULT_PRODUCT.weight),
    sideClearance: String(GEOMETRY_STANDARDS.DEFAULT_CLEARANCES.side),
    endClearance: String(GEOMETRY_STANDARDS.DEFAULT_CLEARANCES.end),
    topClearance: String(GEOMETRY_STANDARDS.DEFAULT_CLEARANCES.top)
  })

  // State for 3x4 lumber permission toggle
  const [allow3x4Lumber, setAllow3x4Lumber] = useState(false)

  // Mobile drawer states
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // State for markings configuration
  const [markings, setMarkings] = useState<MarkingConfig>({
    appliedMaterialsLogo: true,
    fragileStencil: true,
    handlingSymbols: true,
    autocrateText: true
  })

  const [partNumbers, setPartNumbers] = useState<{
    base: string
    crate: string
    cap: string
  }>({
    base: PART_NUMBER_STANDARDS.PLACEHOLDER,
    crate: PART_NUMBER_STANDARDS.PLACEHOLDER,
    cap: PART_NUMBER_STANDARDS.PLACEHOLDER
  })

  const [lagSpacing, setLagSpacing] = useState<number>(FASTENER_STANDARDS.LAG_SCREW.DEFAULT_SPACING)
  const [klimpTargetSpacing, setKlimpTargetSpacing] = useState<number>(16) // Target spacing for klimps (16-24"), default to minimum for max klimps
  const [sideGroundClearance, setSideGroundClearance] = useState<number>(GEOMETRY_STANDARDS.SIDE_PANEL_GROUND_CLEARANCE)

  const [pmiVisibility, setPmiVisibility] = useState({
    totalDimensions: true,
    skids: false,
    cleats: false,
    floor: false,
    datumPlanes: true
  })

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
    },
    showMarkings: true
  })

  const [config, setConfig] = useState<CrateConfig>({
    product: UI_CONSTANTS.DEFAULT_PRODUCT,
    clearances: GEOMETRY_STANDARDS.DEFAULT_CLEARANCES,
    materials: {
      skidSize: '4x4',
      plywoodThickness: PLYWOOD_STANDARDS.DEFAULT_THICKNESS,
      panelThickness: GEOMETRY_STANDARDS.DEFAULT_PANEL_THICKNESS,
      cleatSize: '1x4',
      allow3x4Lumber: false
    },
    hardware: {
      lagScrewSpacing: FASTENER_STANDARDS.LAG_SCREW.DEFAULT_SPACING
    },
    geometry: {
      sidePanelGroundClearance: GEOMETRY_STANDARDS.SIDE_PANEL_GROUND_CLEARANCE
    },
    identifiers: {
      basePartNumber: PART_NUMBER_STANDARDS.PLACEHOLDER,
      cratePartNumber: PART_NUMBER_STANDARDS.PLACEHOLDER,
      capPartNumber: PART_NUMBER_STANDARDS.PLACEHOLDER
    }
  })

  const [generator, setGenerator] = useState<NXGenerator>(() => new NXGenerator(config))
  // Tutorial state
  const [tutorialActive, setTutorialActive] = useState(false)
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'visualization' | 'expressions' | 'bom' | 'plywood' | 'lumber'>('visualization')
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>('default')
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
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const lumberCutList = useMemo(() => generator.generateCutList(), [generator])
  const tutorialSteps = useMemo(() => buildFullTutorial(generator, generator.getBoxes()), [generator])
  useEffect(() => {
    if (tutorialStepIndex > tutorialSteps.length - 1) {
      setTutorialStepIndex(Math.max(0, tutorialSteps.length - 1))
    }
  }, [tutorialSteps, tutorialStepIndex])

  // Auto-enable tutorial via ?tutorial=1
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('tutorial') === '1') {
      setTutorialActive(true)
      setTutorialStepIndex(0)
    }
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  const getSliderValue = (field: ProductField) => {
    const raw = parseFloat(inputValues[field])
    if (!Number.isFinite(raw)) {
      return PRODUCT_SLIDER_CONFIG[field].fallback
    }
    const { min, max } = PRODUCT_SLIDER_CONFIG[field]
    return clamp(raw, min, max)
  }

  const handleProductSliderChange = (field: ProductField, value: number) => {
    setActiveScenarioId(null)
    setInputValues(prev => ({ ...prev, [field]: value.toString() }))

    if (debounceTimeoutRef.current[field]) {
      clearTimeout(debounceTimeoutRef.current[field])
      delete debounceTimeoutRef.current[field]
    }

    setConfig(prev => ({
      ...prev,
      product: { ...prev.product, [field]: value }
    }))
  }

  const applyScenario = (scenario: ScenarioPreset) => {
    setActiveScenarioId(scenario.id)

    // Clear any pending debounced updates so the scenario wins
    Object.values(debounceTimeoutRef.current).forEach(timeout => clearTimeout(timeout))
    debounceTimeoutRef.current = {}

    setInputValues({
      length: scenario.product.length.toString(),
      width: scenario.product.width.toString(),
      height: scenario.product.height.toString(),
      weight: scenario.product.weight.toString(),
      sideClearance: scenario.clearances.side.toString(),
      endClearance: scenario.clearances.end.toString(),
      topClearance: scenario.clearances.top.toString()
    })

    setConfig(prev => ({
      ...prev,
      product: {
        ...prev.product,
        ...scenario.product
      },
      clearances: {
        ...prev.clearances,
        ...scenario.clearances
      },
      materials: {
        ...prev.materials,
        allow3x4Lumber: scenario.allow3x4 ?? prev.materials.allow3x4Lumber
      }
    }))

    setAllow3x4Lumber(scenario.allow3x4 ?? false)

    if (scenario.lumberSizes) {
      setDisplayOptions(prev => ({
        ...prev,
        lumberSizes: {
          ...prev.lumberSizes,
          ...scenario.lumberSizes
        }
      }))
    }
  }

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
      },
      markings: markings,
      hardware: {
        ...(config.hardware ?? {}),
        lagScrewSpacing: lagSpacing,
        klimpTargetSpacing: klimpTargetSpacing
      },
      geometry: {
        ...(config.geometry ?? {}),
        sidePanelGroundClearance: sideGroundClearance
      },
      identifiers: {
        ...(config.identifiers ?? {}),
        basePartNumber: partNumbers.base,
        cratePartNumber: partNumbers.crate,
        capPartNumber: partNumbers.cap
      }
    }))
  }, [config, allow3x4Lumber, displayOptions.lumberSizes, lagSpacing, klimpTargetSpacing, sideGroundClearance, partNumbers, markings])

  const handleInputChange = (field: keyof typeof inputValues, value: string) => {
    // Update input value immediately
    setActiveScenarioId(null)
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
    }, UI_CONSTANTS.VISUALIZATION.DEBOUNCE_DELAY_MS)
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
    const header = [
      `# Base Part Number: ${partNumbers.base}`,
      `# Crate Part Number: ${partNumbers.crate}`,
      `# Cap Part Number: ${partNumbers.cap}`,
      ''
    ].join('\n')
    const expressions = `${header}${generator.exportNXExpressions()}`
    const blob = new Blob([expressions], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crate_expressions_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadBOM = () => {
    const bom: BillOfMaterialsRow[] = generator.generateBOM()
    const header = ['Item', 'Size', 'Length', 'Quantity', 'Material', 'Note']
    const csvLines: string[] = [
      'Metadata,Value',
      `Base Part Number,${partNumbers.base}`,
      `Crate Part Number,${partNumbers.crate}`,
      `Cap Part Number,${partNumbers.cap}`,
      '',
      header.join(',')
    ]

    bom.forEach(row => {
      const size = row.size ? `"${String(row.size).replace(/"/g, '')}"` : ''
      const lengthValue = row.length !== undefined && row.length !== null
        ? (typeof row.length === 'number' ? row.length.toFixed(2) : String(row.length))
        : ''
      const noteValue = row.note ? `"${row.note.replace(/"/g, '')}"` : ''

      csvLines.push([
        row.item ?? '',
        size,
        String(lengthValue ?? ''),
        String(row.quantity ?? ''),
        row.material ?? '',
        noteValue
      ].join(','))
    })

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' })
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

  const togglePmiLayer = (layer: keyof typeof pmiVisibility) => {
    if (layer === 'totalDimensions') {
      return
    }
    setPmiVisibility(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }))
  }

  // Filter boxes based on visibility settings
  // Respects the crate assembly hierarchy:
  // - CRATE_CAP contains 5 panel assemblies (FRONT, BACK, LEFT, RIGHT, TOP)
  // - Each panel assembly includes: plywood pieces + cleats + panel stops
  // - SHIPPING_BASE contains: skids + floorboards
  const getFilteredBoxes = () => {
    return generator.getBoxes().filter(box => {
      // SHIPPING_BASE components (independent visibility)
      if (box.type === 'skid' && !displayOptions.visibility.skids) return false
      if (box.type === 'floor' && !displayOptions.visibility.floorboards) return false

      // CRATE_CAP panel assembly visibility
      // Each panel is a complete sub-assembly: plywood + cleats + panel stops

      // Check if parent panel assembly is visible
      if (box.panelName === 'FRONT_PANEL' && !displayOptions.visibility.frontPanel) return false
      if (box.panelName === 'BACK_PANEL' && !displayOptions.visibility.backPanel) return false
      if (box.panelName === 'LEFT_END_PANEL' && !displayOptions.visibility.leftPanel) return false
      if (box.panelName === 'RIGHT_END_PANEL' && !displayOptions.visibility.rightPanel) return false
      if (box.panelName === 'TOP_PANEL' && !displayOptions.visibility.topPanel) return false

      // Within visible panel assemblies, apply component-specific filters
      if (box.type === 'plywood') {
        // Don't show suppressed pieces
        if (box.suppressed) return false
        // Check individual piece visibility (default to true if not set)
        if (plywoodPieceVisibility[box.name] === false) return false
        return true
      }

      // Cleats are part of their parent panel assembly
      // Global cleats toggle allows showing/hiding all cleats across all visible panels
      if (box.type === 'cleat') {
        if (!displayOptions.visibility.cleats) return false
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

  const downloadStepFile = () => {
    // Get filtered boxes for STEP generation
    const boxes = getFilteredBoxes()

    // Generate STEP file content (AP242 with PMI metadata)
    const stepGenerator = new StepGenerator(boxes, { includePMI: true })
    const stepContent = stepGenerator.generate()

    // Create blob and download link
    const blob = new Blob([stepContent], { type: 'application/STEP' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'crate_model.stp'

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    URL.revokeObjectURL(url)
  }


  return (
    <main className="h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden flex flex-col transition-colors duration-300">
      {/* Compact change tracker */}
      <ChangeTracker />
      {/* Compact Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none px-4 py-1.5 flex-shrink-0 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">AutoCrate</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 hidden lg:block">Two Diagonal Points Method</p>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => { setTutorialActive(prev => !prev); setTutorialStepIndex(0) }}
              className={`px-3 py-1 text-sm rounded transition-colors ${tutorialActive ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'}`}
              title="Toggle Tutorial Mode"
            >
              {tutorialActive ? 'Tutorial: On' : 'Start Tutorial'}
            </button>
            <button
              onClick={downloadExpressions}
              className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              Export NX
            </button>
            <button
              onClick={downloadBOM}
              className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
            >
              Export BOM
            </button>
            <button
              onClick={downloadStepFile}
              className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors"
            >
              Download STEP
            </button>
            <a
              href="/issues"
              className="bg-orange-600 text-white px-3 py-1 text-sm rounded hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors inline-block"
            >
              Issues
            </a>
            <a
              href="/docs"
              className="bg-gray-600 text-white px-3 py-1 text-sm rounded hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors inline-block"
            >
              Docs
            </a>
          </div>

          {/* Mobile actions */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Mobile dropdown menu */}
              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => { downloadExpressions(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export NX
                  </button>
                  <button
                    onClick={() => { downloadBOM(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Export BOM
                  </button>
                  <button
                    onClick={() => { downloadStepFile(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Download STEP
                  </button>
                  <a
                    href="/issues"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Issues
                  </a>
                  <a
                    href="/docs"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Docs
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 min-h-0 overflow-hidden relative">
        {/* Desktop Left Panel - Inputs */}
        <aside
          className="hidden lg:flex flex-col w-72 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none p-2 md:p-3 flex-shrink-0 transition-colors overflow-y-auto"
          style={{
            maxHeight: 'calc(100vh - 7rem)',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
        >
          <div className="flex-1 flex flex-col gap-3">
            <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Part Numbers</h3>
              <div className="mt-1 space-y-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Base</span>
                  <input
                    value={partNumbers.base}
                    onChange={(e) => setPartNumbers(prev => ({ ...prev, base: e.target.value }))}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={PART_NUMBER_STANDARDS.PLACEHOLDER}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Crate</span>
                  <input
                    value={partNumbers.crate}
                    onChange={(e) => setPartNumbers(prev => ({ ...prev, crate: e.target.value }))}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={PART_NUMBER_STANDARDS.PLACEHOLDER}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Cap</span>
                  <input
                    value={partNumbers.cap}
                    onChange={(e) => setPartNumbers(prev => ({ ...prev, cap: e.target.value }))}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={PART_NUMBER_STANDARDS.PLACEHOLDER}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Product Dimensions</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Length (Y)"</span>
                    <input
                      data-testid="input-length"
                      type="text"
                      value={inputValues.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      onBlur={() => handleInputBlur('length')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <input
                    data-testid="slider-length"
                    type="range"
                    min={PRODUCT_SLIDER_CONFIG.length.min}
                    max={PRODUCT_SLIDER_CONFIG.length.max}
                    step={PRODUCT_SLIDER_CONFIG.length.step}
                    value={getSliderValue('length')}
                    onChange={(event) => {
                      const numericValue = Number(event.target.value)
                      if (!Number.isNaN(numericValue)) {
                        handleProductSliderChange('length', numericValue)
                      }
                    }}
                    className="w-full cursor-pointer accent-blue-600"
                    aria-label="Length in inches"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Width (X)"</span>
                    <input
                      data-testid="input-width"
                      type="text"
                      value={inputValues.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      onBlur={() => handleInputBlur('width')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <input
                    data-testid="slider-width"
                    type="range"
                    min={PRODUCT_SLIDER_CONFIG.width.min}
                    max={PRODUCT_SLIDER_CONFIG.width.max}
                    step={PRODUCT_SLIDER_CONFIG.width.step}
                    value={getSliderValue('width')}
                    onChange={(event) => {
                      const numericValue = Number(event.target.value)
                      if (!Number.isNaN(numericValue)) {
                        handleProductSliderChange('width', numericValue)
                      }
                    }}
                    className="w-full cursor-pointer accent-blue-600"
                    aria-label="Width in inches"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Height (Z)"</span>
                    <input
                      data-testid="input-height"
                      type="text"
                      value={inputValues.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      onBlur={() => handleInputBlur('height')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <input
                    data-testid="slider-height"
                    type="range"
                    min={PRODUCT_SLIDER_CONFIG.height.min}
                    max={PRODUCT_SLIDER_CONFIG.height.max}
                    step={PRODUCT_SLIDER_CONFIG.height.step}
                    value={getSliderValue('height')}
                    onChange={(event) => {
                      const numericValue = Number(event.target.value)
                      if (!Number.isNaN(numericValue)) {
                        handleProductSliderChange('height', numericValue)
                      }
                    }}
                    className="w-full cursor-pointer accent-blue-600"
                    aria-label="Height in inches"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Weight (lb)</span>
                    <input
                      data-testid="input-weight"
                      type="text"
                      value={inputValues.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      onBlur={() => handleInputBlur('weight')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <input
                    data-testid="slider-weight"
                    type="range"
                    min={PRODUCT_SLIDER_CONFIG.weight.min}
                    max={PRODUCT_SLIDER_CONFIG.weight.max}
                    step={PRODUCT_SLIDER_CONFIG.weight.step}
                    value={getSliderValue('weight')}
                    onChange={(event) => {
                      const numericValue = Number(event.target.value)
                      if (!Number.isNaN(numericValue)) {
                        handleProductSliderChange('weight', numericValue)
                      }
                    }}
                    className="w-full cursor-pointer accent-blue-600"
                    aria-label="Weight in pounds"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Clearances</h3>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Side</span>
                  <input
                    data-testid="input-side-clearance"
                    type="text"
                    value={inputValues.sideClearance}
                    onChange={(e) => handleInputChange('sideClearance', e.target.value)}
                    onBlur={() => handleInputBlur('sideClearance')}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">End</span>
                  <input
                    data-testid="input-end-clearance"
                    type="text"
                    value={inputValues.endClearance}
                    onChange={(e) => handleInputChange('endClearance', e.target.value)}
                    onBlur={() => handleInputBlur('endClearance')}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Top</span>
                  <input
                    data-testid="input-top-clearance"
                    type="text"
                    value={inputValues.topClearance}
                    onChange={(e) => handleInputChange('topClearance', e.target.value)}
                    onBlur={() => handleInputBlur('topClearance')}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">3x4 Lumber</h3>
                <button
                  data-testid="toggle-3x4"
                  onClick={() => setAllow3x4Lumber(!allow3x4Lumber)}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${allow3x4Lumber ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allow3x4Lumber ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" data-testid="toggle-3x4-status">
                {allow3x4Lumber ? 'For products < 500 lbs' : '4x4 for all < 4500 lbs'}
              </p>
            </section>

            <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Lag Screws</h3>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Spacing (inches on-center)</span>
              </div>
              <div className="mt-2 space-y-2">
                <input
                  type="range"
                  min={18}
                  max={24}
                  step={0.0625}
                  value={lagSpacing}
                  onChange={event => {
                    const raw = Number(event.target.value)
                    if (!Number.isNaN(raw)) {
                      const snapped = Math.round(raw * 16) / 16
                      setLagSpacing(Math.min(24, Math.max(18, snapped)))
                    }
                  }}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={18}
                    max={24}
                    step={0.0625}
                    value={lagSpacing}
                    onChange={event => {
                      const raw = Number(event.target.value)
                      if (!Number.isNaN(raw)) {
                        const snapped = Math.round(raw * 16) / 16
                        setLagSpacing(Math.min(24, Math.max(18, snapped)))
                      }
                    }}
                    className="w-20 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{lagSpacing.toFixed(2)}" O.C.</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Side fasteners stay centred in the cleat, with spacing adjustable between {FASTENER_STANDARDS.LAG_SCREW.MIN_SPACING}" and {FASTENER_STANDARDS.LAG_SCREW.MAX_SPACING}" in 1/16" increments.
              </p>
            </section>

            <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Klimps (Spring Clamps)</h3>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Target spacing (inches)</span>
              </div>
              <div className="mt-2 space-y-2">
                <input
                  type="range"
                  min={16}
                  max={24}
                  step={0.5}
                  value={klimpTargetSpacing}
                  onChange={event => {
                    const raw = Number(event.target.value)
                    if (!Number.isNaN(raw)) {
                      setKlimpTargetSpacing(Math.min(24, Math.max(16, raw)))
                    }
                  }}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={16}
                    max={24}
                    step={0.5}
                    value={klimpTargetSpacing}
                    onChange={event => {
                      const raw = Number(event.target.value)
                      if (!Number.isNaN(raw)) {
                        setKlimpTargetSpacing(Math.min(24, Math.max(16, raw)))
                      }
                    }}
                    className="w-20 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{klimpTargetSpacing.toFixed(1)}" target</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Lower values = more klimps, higher values = fewer klimps. Actual spacing will be symmetric and stay within {FASTENER_STANDARDS.KLIMP.EDGE_MIN_SPACING}"-{FASTENER_STANDARDS.KLIMP.EDGE_MAX_SPACING}" range.
              </p>
            </section>

            <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Side Panel Ground Clearance</h3>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">inches above skid datum</span>
              </div>
              <div className="mt-2 space-y-2">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.0625}
                  value={sideGroundClearance}
                  onChange={event => {
                    const raw = Number(event.target.value)
                    if (!Number.isNaN(raw)) {
                      const snapped = Math.round(raw * 16) / 16
                      setSideGroundClearance(Math.max(0, snapped))
                    }
                  }}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.0625}
                    value={sideGroundClearance}
                    onChange={event => {
                      const raw = Number(event.target.value)
                      if (!Number.isNaN(raw)) {
                        const snapped = Math.round(raw * 16) / 16
                        setSideGroundClearance(Math.max(0, snapped))
                      }
                    }}
                    className="w-20 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{sideGroundClearance.toFixed(3)}"</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Sets the height of the side panels above the skid deck (0" = flush). Screws target the bottom cleat centre and continue into the skid.
              </p>
            </section>

            <details className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <summary className="cursor-pointer select-none px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">Markings &amp; Labels</summary>
              <div className="px-2 pb-2 pt-1">
                <MarkingsSection config={config} onMarkingsChange={setMarkings} />
              </div>
            </details>

            <details className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <summary className="cursor-pointer select-none px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">Quick Scenarios</summary>
              <div className="px-2 pb-2 pt-1 space-y-2">
                <ScenarioSelector
                  scenarios={SCENARIO_PRESETS}
                  activeScenarioId={activeScenarioId}
                  onScenarioSelect={applyScenario}
                  showHeading={false}
                />
                <div className="text-[11px] text-gray-500 dark:text-gray-400" data-testid="scenario-status">
                  {activeScenarioId ? `Active scenario: ${SCENARIO_PRESETS.find(preset => preset.id === activeScenarioId)?.name ?? 'Custom'}` : 'Active scenario: Custom values'}
                </div>
              </div>
            </details>
          </div>
        </aside>

        {/* Main Panel - Visualization/Output (always visible) */}
        <div
          className="flex flex-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none flex-col min-h-0 transition-colors"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Tabs - Hidden on mobile for cleaner view */}
          <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <nav
              className="flex overflow-x-auto scrollbar-thin"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x'
              }}
            >
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
                onClick={() => setActiveTab('lumber')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'lumber'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Cut List
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

          {/* Tab Content - On mobile, always show 3D view for clean interface */}
          <div
            className="flex-1 p-2 md:p-3 lg:p-4 min-h-0 flex flex-col overflow-hidden"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Mobile: Always show 3D view regardless of activeTab */}
            <div className="lg:hidden flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden" data-testid="crate-visualizer">
                <VisualizationErrorBoundary>
                  <div className="relative w-full h-full">
                    <CrateVisualizer
                      boxes={getFilteredBoxes()}
                      generator={generator}
                      showMarkings={displayOptions.showMarkings}
                      visibility={displayOptions.visibility}
                      onToggleVisibility={toggleComponentVisibility}
                      onToggleMarkings={() => setDisplayOptions(prev => ({ ...prev, showMarkings: !prev.showMarkings }))}
                      pmiVisibility={pmiVisibility}
                      onTogglePmi={togglePmiLayer}
                      partNumbers={partNumbers}
                      tutorialHighlightNames={tutorialActive && tutorialSteps.length > 0 ? getStepHighlightTargets(tutorialSteps[tutorialStepIndex], generator.getBoxes()) : []}
                      tutorialCallouts={tutorialActive && tutorialSteps.length > 0 ? buildCallouts(tutorialSteps[tutorialStepIndex], generator.getBoxes()).slice(0, 8) : []}
                    />
                    <TutorialOverlay
                      active={tutorialActive}
                      stepIndex={tutorialStepIndex}
                      steps={tutorialSteps}
                      onClose={() => setTutorialActive(false)}
                      onPrev={() => setTutorialStepIndex(s => Math.max(0, s - 1))}
                      onNext={() => setTutorialStepIndex(s => Math.min(tutorialSteps.length - 1, s + 1))}
                      onCopy={(text) => navigator.clipboard?.writeText(text)}
                    />
                  </div>
                </VisualizationErrorBoundary>
              </div>
            </div>

            {/* Desktop: Show selected tab content */}
            <div className="hidden lg:flex lg:flex-col flex-1 min-h-0">
              {activeTab === 'visualization' && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
                  <div className="flex-1 min-h-0 overflow-hidden" data-testid="crate-visualizer">
                    <VisualizationErrorBoundary>
                      <div className="relative w-full h-full">
                        <CrateVisualizer
                          boxes={getFilteredBoxes()}
                          generator={generator}
                          showMarkings={displayOptions.showMarkings}
                          visibility={displayOptions.visibility}
                          onToggleVisibility={toggleComponentVisibility}
                          onToggleMarkings={() => setDisplayOptions(prev => ({ ...prev, showMarkings: !prev.showMarkings }))}
                          pmiVisibility={pmiVisibility}
                          onTogglePmi={togglePmiLayer}
                          partNumbers={partNumbers}
                          tutorialHighlightNames={tutorialActive && tutorialSteps.length > 0 ? getStepHighlightTargets(tutorialSteps[tutorialStepIndex], generator.getBoxes()) : []}
                          tutorialCallouts={tutorialActive && tutorialSteps.length > 0 ? buildCallouts(tutorialSteps[tutorialStepIndex], generator.getBoxes()).slice(0, 8) : []}
                        />
                        <TutorialOverlay
                          active={tutorialActive}
                          stepIndex={tutorialStepIndex}
                          steps={tutorialSteps}
                          onClose={() => setTutorialActive(false)}
                          onPrev={() => setTutorialStepIndex(s => Math.max(0, s - 1))}
                          onNext={() => setTutorialStepIndex(s => Math.min(tutorialSteps.length - 1, s + 1))}
                          onCopy={(text) => navigator.clipboard?.writeText(text)}
                        />
                      </div>
                    </VisualizationErrorBoundary>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Rotate: Left drag | Pan: Right drag | Zoom: Scroll
                  </p>
                </div>
              )}

              {activeTab === 'expressions' && (
                <div className="flex-1 min-h-0 overflow-auto rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <pre className="text-[10px] sm:text-xs text-gray-800 dark:text-gray-100 p-2 md:p-3 font-mono whitespace-pre-wrap break-words overflow-x-auto">
                    {generator.exportNXExpressions()}
                  </pre>
                </div>
              )}

              {activeTab === 'bom' && (
                <div className="flex-1 min-h-0 overflow-auto border border-gray-200 dark:border-gray-700 rounded">
                  <div className="overflow-x-auto">
                    <table data-testid="bom-table" className="w-full text-sm min-w-[600px]">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                        <tr>
                          <th className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                          <th className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Size</th>
                          <th className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                          <th className="px-2 md:px-3 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Material</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        {generator.generateBOM().map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.item}</td>
                            <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.size}</td>
                            <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.quantity}</td>
                            <td className="px-2 md:px-3 py-2 text-[10px] md:text-xs">{item.material}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'lumber' && (
                <div className="flex-1 min-h-0 overflow-auto">
                  <LumberCutList cutList={lumberCutList} />
                </div>
              )}

              {activeTab === 'plywood' && (
                <div className="flex-1 min-h-0 overflow-auto">
                  <PlywoodPieceSelector
                    boxes={generator.getBoxes()}
                    onPieceToggle={handlePlywoodPieceToggle}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div className="lg:hidden">
          {/* Mobile drawer toggle button */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${mobileDrawerOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-sm font-medium">
              {mobileDrawerOpen ? 'Hide Controls' : 'Show Controls'}
            </span>
          </button>

          {/* Backdrop overlay */}
          {mobileDrawerOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close drawer"
            />
          )}

          {/* Mobile drawer panel */}
          <div
            className={`fixed inset-x-0 bottom-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg transition-transform duration-300 rounded-t-xl ${
              mobileDrawerOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{
              maxHeight: '70vh',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Drawer handle */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>

            {/* Drawer content */}
            <div className="px-4 pb-20 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 2rem)' }}>
              {/* Quick access to essential inputs */}
              <section className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Essential Dimensions</h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Length (Y)"</span>
                    <input
                      type="text"
                      value={inputValues.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      onBlur={() => handleInputBlur('length')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Width (X)"</span>
                    <input
                      type="text"
                      value={inputValues.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      onBlur={() => handleInputBlur('width')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Height (Z)"</span>
                    <input
                      type="text"
                      value={inputValues.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      onBlur={() => handleInputBlur('height')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Weight (lb)</span>
                    <input
                      type="text"
                      value={inputValues.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      onBlur={() => handleInputBlur('weight')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </section>

              {/* Clearances */}
              <section className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Clearances</h3>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Side</span>
                    <input
                      type="text"
                      value={inputValues.sideClearance}
                      onChange={(e) => handleInputChange('sideClearance', e.target.value)}
                      onBlur={() => handleInputBlur('sideClearance')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">End</span>
                    <input
                      type="text"
                      value={inputValues.endClearance}
                      onChange={(e) => handleInputChange('endClearance', e.target.value)}
                      onBlur={() => handleInputBlur('endClearance')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Top</span>
                    <input
                      type="text"
                      value={inputValues.topClearance}
                      onChange={(e) => handleInputChange('topClearance', e.target.value)}
                      onBlur={() => handleInputBlur('topClearance')}
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </section>

              {/* Additional Options */}
              <details className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                  Advanced Settings
                </summary>
                <div className="p-3 space-y-3">
                  {/* Part Numbers */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Part Numbers</h4>
                    <div className="space-y-2">
                      <input
                        value={partNumbers.base}
                        onChange={(e) => setPartNumbers(prev => ({ ...prev, base: e.target.value }))}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                        placeholder="Base Part Number"
                      />
                      <input
                        value={partNumbers.crate}
                        onChange={(e) => setPartNumbers(prev => ({ ...prev, crate: e.target.value }))}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                        placeholder="Crate Part Number"
                      />
                      <input
                        value={partNumbers.cap}
                        onChange={(e) => setPartNumbers(prev => ({ ...prev, cap: e.target.value }))}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                        placeholder="Cap Part Number"
                      />
                    </div>
                  </div>

                  {/* 3x4 Lumber Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">3x4 Lumber</span>
                    <button
                      onClick={() => setAllow3x4Lumber(!allow3x4Lumber)}
                      className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${allow3x4Lumber ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allow3x4Lumber ? 'translate-x-5' : 'translate-x-0.5'}`}
                      />
                    </button>
                  </div>

                  {/* View Controls */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">3D View Controls</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={displayOptions.visibility.skids}
                          onChange={() => toggleComponentVisibility('skids')}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">Show Skids</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={displayOptions.visibility.floorboards}
                          onChange={() => toggleComponentVisibility('floorboards')}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">Show Floorboards</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={displayOptions.visibility.topPanel}
                          onChange={() => toggleComponentVisibility('topPanel')}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">Show Top Panel</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={displayOptions.visibility.cleats}
                          onChange={() => toggleComponentVisibility('cleats')}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">Show Cleats</span>
                      </label>
                    </div>
                  </div>

                  {/* Quick Scenarios */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Quick Scenarios</h4>
                    <ScenarioSelector
                      scenarios={SCENARIO_PRESETS}
                      activeScenarioId={activeScenarioId}
                      onScenarioSelect={applyScenario}
                      showHeading={false}
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
