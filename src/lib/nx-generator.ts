// NX Expression Generator with Two-Point Box Method
// Coordinate System: X=width (left/right), Y=length (front/back), Z=height (up)
// Origin at center of crate floor (Z=0)

import { PlywoodSplicer, PanelSpliceLayout } from './plywood-splicing'
import { CleatCalculator, PanelCleatLayout, type Cleat } from './cleat-calculator'
import { KlimpCalculator, KlimpLayout, CleatInfo } from './klimp-calculator'
import { KlimpSTEPIntegration, KlimpInstance } from './klimp-step-integration'
import { LagSTEPIntegration } from './lag-step-integration'
import { PanelStopCalculator, PanelStopLayout } from './panel-stop-calculator'
import {
  PLYWOOD_STANDARDS,
  LUMBER_DIMENSIONS,
  SKID_STANDARDS,
  GEOMETRY_STANDARDS,
  MARKING_STANDARDS
} from './crate-constants'

export interface ProductDimensions {
  length: number  // Y-axis (front to back)
  width: number   // X-axis (left to right)
  height: number  // Z-axis (vertical)
  weight: number  // pounds
}

export interface MarkingConfig {
  appliedMaterialsLogo: boolean  // Deprecated - no longer used
  fragileStencil: boolean        // Fragile markings (4 per crate)
  handlingSymbols: boolean       // Glass, umbrella, up arrows (up to 4 per crate)
  autocrateText: boolean         // AUTOCRATE text centered on panels (4 per crate)
}

export interface MarkingDimensions {
  width: number
  height: number
  partNumber: string
}

export interface CrateConfig {
  product: ProductDimensions
  clearances: {
    side: number     // clearance on each side (X)
    end: number      // clearance on each end (Y)
    top: number      // clearance on top (Z)
  }
  materials: {
    skidSize: '2x4' | '3x3' | '4x4' | '4x6' | '6x6' | '8x8'
    plywoodThickness: number  // Actual plywood thickness (0.25")
    panelThickness: number    // Total panel thickness including cleats (1.0")
    cleatSize: '1x4' | '2x3' | '2x4'
    allow3x4Lumber?: boolean // Optional: allow 3x4 lumber for weights under 4500 lbs
    availableLumber?: ('2x6' | '2x8' | '2x10' | '2x12')[] // Optional: restrict available lumber sizes
  }
  hardware?: {
    lagScrewsPerVerticalCleat?: number
    lagScrewSpacing?: number
    klimpTargetSpacing?: number
  }
  geometry?: {
    sidePanelGroundClearance?: number
  }
  identifiers?: {
    basePartNumber?: string
    cratePartNumber?: string
    capPartNumber?: string
  }
  markings?: MarkingConfig  // Optional marking configuration
}

export interface Point3D {
  x: number
  y: number
  z: number
}

const PLACEHOLDER_CUBE_SIZE = 10
const MIN_DIMENSION = 0.1 // Minimum dimension value for NX compatibility (prevents zero dimensions)
const PLACEHOLDER_CUBE: Readonly<{ point1: Point3D; point2: Point3D }> = Object.freeze({
  point1: { x: 0, y: 0, z: 0 },
  point2: {
    x: PLACEHOLDER_CUBE_SIZE,
    y: PLACEHOLDER_CUBE_SIZE,
    z: PLACEHOLDER_CUBE_SIZE,
  },
})

export interface NXBox {
  name: string
  point1: Point3D
  point2: Point3D
  color?: string
  type?: 'skid' | 'floor' | 'panel' | 'cleat' | 'plywood' | 'klimp' | 'hardware'
  suppressed?: boolean
  metadata?: string
  plywoodPieceIndex?: number  // For plywood pieces, track which piece (0-5)
  panelName?: string          // Which panel this plywood belongs to
}

export interface BillOfMaterialsRow {
  item: string
  size?: string
  length?: number | string
  totalLength?: number
  thickness?: number
  quantity?: number
  packages?: number
  material: string
  note?: string
}

export interface LumberCutItem {
  description: string
  material: string
  count: number
  length: number
  width?: number
  thickness?: number
  notes?: string
}

export interface CleatCutGroupItem {
  orientation: 'horizontal' | 'vertical'
  length: number
  count: number
  types: string[]
}

export interface CleatCutGroup {
  panel: string
  items: CleatCutGroupItem[]
}

export interface PlywoodCutPiece {
  width: number
  height: number
  count: number
}

export interface PlywoodCutGroup {
  panel: string
  sheetCount: number
  isRotated: boolean
  pieces: PlywoodCutPiece[]
}

export interface LumberCutListSummary {
  totalPlywoodSheets: number
  plywoodThickness: number
  cleatBoardCount: number
  cleatLinearFeet: number
}

export interface LumberCutList {
  skids: LumberCutItem[]
  floorboards: LumberCutItem[]
  cleats: CleatCutGroup[]
  plywood: PlywoodCutGroup[]
  summary: LumberCutListSummary
}

export class NXGenerator {
  private boxes: NXBox[] = []
  private expressions: Map<string, number> = new Map()
  private panelSpliceLayouts: PanelSpliceLayout[] = []
  private panelCleatLayouts: PanelCleatLayout[] = []
  private klimpLayouts: KlimpLayout[] = []
  private klimpInstances: KlimpInstance[] = []
  private panelStopLayout: PanelStopLayout | null = null
  private lagScrewCount = 0

  // Expressions that are already defined in the NX template part and should be excluded from export
  // Add any expression names here (case-insensitive) to prevent "Rule already exists" errors.
  // To add more expressions, add them to this Set (e.g., 'some_other_expression')
  private static readonly EXCLUDED_EXPRESSIONS = new Set<string>([
    'skid_width',
    'skid_height'
    // Add more template-defined expressions here as needed
  ])

  constructor(private config: CrateConfig) {
    this.calculate()
  }

  private createPlaceholderCube(origin?: Point3D): { point1: Point3D; point2: Point3D } {
    if (!origin) {
      return {
        point1: { ...PLACEHOLDER_CUBE.point1 },
        point2: { ...PLACEHOLDER_CUBE.point2 },
      }
    }

    const { x, y, z } = origin
    return {
      point1: { x, y, z },
      point2: {
        x: x + PLACEHOLDER_CUBE_SIZE,
        y: y + PLACEHOLDER_CUBE_SIZE,
        z: z + PLACEHOLDER_CUBE_SIZE,
      },
    }
  }

  private getSkidDimensions() {
    const weight = this.config.product.weight
    const allow3x4 = this.config.materials.allow3x4Lumber || false

    // Based on Table 5-3: Lumber Size vs Product Weight
    if (weight <= 500 && allow3x4) {
      // 3x4 skids - rotated so height remains 3.5" for forklift access
      // Only use if explicitly allowed
      return { height: LUMBER_DIMENSIONS['3x4'].height, width: LUMBER_DIMENSIONS['3x4'].width, nominal: '3x4' }
    } else if (weight <= SKID_STANDARDS.LIGHTWEIGHT_WEIGHT_THRESHOLD) {
      // 4x4 skids (or replace 3x4 when not allowed)
      // Note: "Any existing crate design drawings requiring 4 x 6 skids for product under 4500lbs
      // can have the 4 x 6 skids replaced with an equal or greater number of 4 x 4 skids"
      return { height: LUMBER_DIMENSIONS['4x4'].height, width: LUMBER_DIMENSIONS['4x4'].width, nominal: '4x4' }
    } else if (weight <= 20000) {
      // 4x6 skids
      return { height: LUMBER_DIMENSIONS['4x6'].height, width: LUMBER_DIMENSIONS['4x6'].width, nominal: '4x6' }
    } else if (weight <= 40000) {
      // 6x6 skids
      return { height: LUMBER_DIMENSIONS['6x6'].height, width: LUMBER_DIMENSIONS['6x6'].width, nominal: '6x6' }
    } else if (weight <= 60000) {
      // 8x8 skids
      return { height: LUMBER_DIMENSIONS['8x8'].height, width: LUMBER_DIMENSIONS['8x8'].width, nominal: '8x8' }
    } else {
      // Maximum supported weight exceeded, default to 8x8
      return { height: LUMBER_DIMENSIONS['8x8'].height, width: LUMBER_DIMENSIONS['8x8'].width, nominal: '8x8' }
    }
  }

  private getSkidSpacing() {
    const weight = this.config.product.weight
    const skidDims = this.getSkidDimensions()

    // Based on Table 5-4: Skid Size vs Spacing
    if (skidDims.nominal === '3x4' || skidDims.nominal === '4x4') {
      // 3 or 4 x 4 skids: spaced on center from one another <= 30.00"
      return { maxSpacing: 30, count: 3 }
    } else if (skidDims.nominal === '4x6') {
      if (weight <= 6000) {
        // spaced on center from one another <= 41.00" for product weighing less than 6,000 pounds
        return { maxSpacing: 41, count: 3 }
      } else if (weight <= 12000) {
        // <= 28.00" for product weighing 6,000-12,000 pounds
        return { maxSpacing: 28, count: 4 }
      } else if (weight <= 20000) {
        // <= 24.00" for product weighing 12,000-20,000lbs
        return { maxSpacing: 24, count: 4 }
      } else {
        // Should not reach here with 4x6, but fallback
        return { maxSpacing: 24, count: 4 }
      }
    } else if (skidDims.nominal === '6x6') {
      if (weight <= 30000) {
        // must be spaced <= 24.00" for product weighing 20,000-30,000lbs
        return { maxSpacing: 24, count: 4 }
      } else {
        // <= 20.00" for product weighing 30,000-40,000lbs
        return { maxSpacing: 20, count: 5 }
      }
    } else if (skidDims.nominal === '8x8') {
      // All 8 x 8 skids must be spaced <= 24.00"
      return { maxSpacing: 24, count: 5 }
    }

    // Default fallback
    return { maxSpacing: 30, count: 3 }
  }

  private getSkidCount() {
    const spacingInfo = this.getSkidSpacing()
    const internalWidth = this.config.product.width + (2 * this.config.clearances.side)
    const skidDims = this.getSkidDimensions()

    // Calculate actual number of skids needed based on max center-to-center spacing
    // IMPORTANT: Always place skids at the extreme ends (edges)

    // Minimum 2 skids at the edges
    if (internalWidth <= spacingInfo.maxSpacing + skidDims.width) {
      return 2  // Just edge skids
    }

    // For wider crates, calculate how many skids we need
    // Available space for intermediate skids = internalWidth - 2 * (skidWidth/2 for edge skids)
    const availableSpace = internalWidth - skidDims.width

    // Calculate number of gaps needed (n skids = n-1 gaps)
    const numberOfGaps = Math.ceil(availableSpace / spacingInfo.maxSpacing)
    const requiredCount = numberOfGaps + 1

    // Ensure we have at least the minimum from the spec table
    return Math.max(requiredCount, spacingInfo.count)
  }

  private getFloorboardDimensions() {
    const weight = this.config.product.weight
    const internalLength = this.config.product.length + (2 * this.config.clearances.end)
    const availableLumber = this.config.materials.availableLumber || ['2x6', '2x8', '2x10', '2x12']

    // Define all lumber options with their properties
    const lumberOptions = [
      { nominal: '2x6', width: 5.5, thickness: 1.5, maxWeight: 2000, maxSpan: 24 },
      { nominal: '2x8', width: 7.25, thickness: 1.5, maxWeight: 4000, maxSpan: 36 },
      { nominal: '2x10', width: 9.25, thickness: 1.5, maxWeight: 8000, maxSpan: 48 },
      { nominal: '2x12', width: 11.25, thickness: 1.5, maxWeight: Infinity, maxSpan: Infinity }
    ] as const

    // Filter by available lumber sizes
    const availableOptions = lumberOptions.filter(option =>
      availableLumber.includes(option.nominal as '2x6' | '2x8' | '2x10' | '2x12')
    )

    // If no available lumber, fallback to all options
    if (availableOptions.length === 0) {
      return { width: 5.5, thickness: 1.5, nominal: '2x6' }
    }

    // Find the most appropriate lumber size from available options
    // Sort by size (smallest first for optimization: large outside, narrow inside)
    const sortedOptions = availableOptions.sort((a, b) => a.width - b.width)

    // Find the smallest available lumber that can handle the weight and span
    for (const option of sortedOptions) {
      if (weight <= option.maxWeight && internalLength <= option.maxSpan) {
        return { width: option.width, thickness: option.thickness, nominal: option.nominal }
      }
    }

    // If no option meets the requirements, use the largest available lumber
    const largestOption = sortedOptions[sortedOptions.length - 1]
    return { width: largestOption.width, thickness: largestOption.thickness, nominal: largestOption.nominal }
  }

  private getFloorboardCount() {
    // Return the actual number of floorboards calculated by the layout algorithm
    return this.getFloorboardLayout().length
  }

  private getFloorboardLayout() {
    const internalLength = this.config.product.length + (2 * this.config.clearances.end)
    const availableLumber = this.config.materials.availableLumber || ['2x6', '2x8', '2x10', '2x12']
    const panelThickness = this.config.materials.panelThickness ?? 1

    type LumberOption = { nominal: string; width: number; thickness: number }

    const lumberOptions: LumberOption[] = [
      { nominal: '2x6', width: 5.5, thickness: 1.5 },
      { nominal: '2x8', width: 7.25, thickness: 1.5 },
      { nominal: '2x10', width: 9.25, thickness: 1.5 },
      { nominal: '2x12', width: 11.25, thickness: 1.5 }
    ]

    const availableOptions = lumberOptions
      .filter(option => availableLumber.includes(option.nominal as '2x6' | '2x8' | '2x10' | '2x12'))
      .sort((a, b) => b.width - a.width)

    if (availableOptions.length === 0) {
      availableOptions.push({ nominal: '2x6', width: 5.5, thickness: 1.5 })
    }

    const unit = 0.125 // work in 1/8" increments to keep integers
    const gapBetweenBoards = 0
    const gapUnits = Math.round(gapBetweenBoards / unit)
    const lengthUnits = Math.max(0, Math.round(internalLength / unit))
    const minCustomWidth = 2.5
    const smallestAvailableWidth = availableOptions.reduce((min, option) => Math.min(min, option.width), availableOptions[0].width)
    const maxCustomWidth = Math.max(minCustomWidth, smallestAvailableWidth)
    const minCustomUnits = Math.round(minCustomWidth / unit)
    const maxCustomUnits = Math.round(maxCustomWidth / unit)
    const maxBoards = 40

    const boardOptions = availableOptions.map(option => ({
      nominal: option.nominal,
      width: option.width,
      widthUnits: Math.round(option.width / unit),
      thickness: option.thickness
    }))

    const standardThickness = availableOptions[0]?.thickness || 1.5
    const tolerance = 1e-6

    const canArrangeSymmetrically = (countSnapshot: number[], customUnits: number | null) => {
      let smallestPairWidth = Infinity
      const centerWidths: number[] = []

      for (let i = 0; i < boardOptions.length; i++) {
        const count = countSnapshot[i]
        const width = boardOptions[i].width
        const pairCount = Math.floor(count / 2)

        if (pairCount > 0) {
          smallestPairWidth = width
        }

        if (count % 2 === 1) {
          centerWidths.push(width)
        }
      }

      if (customUnits !== null) {
        const customWidth = Number((customUnits * unit).toFixed(3))
        centerWidths.push(customWidth)
      }

      if (smallestPairWidth === Infinity) {
        return true
      }

      return centerWidths.every(width => width <= smallestPairWidth + tolerance)
    }

    let bestUsedUnits = -Infinity
    let bestCounts: number[] = new Array(boardOptions.length).fill(0)
    let bestBoardTotal = 0
    let bestCustomUnits: number | null = null

    const counts = new Array(boardOptions.length).fill(0)

    const updateBest = (usedUnits: number, totalBoards: number, customUnits: number | null) => {
      if (usedUnits > lengthUnits + tolerance) {
        return
      }

      if (!canArrangeSymmetrically(counts, customUnits)) {
        return
      }

      const preferWiderBoards = () => {
        for (let i = 0; i < counts.length; i++) {
          if (counts[i] !== bestCounts[i]) {
            return counts[i] > bestCounts[i]
          }
        }
        if (customUnits !== bestCustomUnits) {
          return (customUnits ?? 0) > (bestCustomUnits ?? 0)
        }
        return false
      }

      const isBetter = (
        usedUnits > bestUsedUnits + tolerance ||
        (Math.abs(usedUnits - bestUsedUnits) <= tolerance && (
          totalBoards < bestBoardTotal ||
          (totalBoards === bestBoardTotal && preferWiderBoards())
        ))
      )

      if (isBetter) {
        bestUsedUnits = usedUnits
        bestBoardTotal = totalBoards
        bestCustomUnits = customUnits
        bestCounts = counts.slice()
      }
    }

    const evaluateCombination = (sumWidthUnits: number, totalBoards: number) => {
      if (totalBoards > maxBoards) {
        return
      }

      const usedStandardUnits = sumWidthUnits + (totalBoards > 0 ? (totalBoards - 1) * gapUnits : 0)
      updateBest(usedStandardUnits, totalBoards, null)

      if (totalBoards >= maxBoards) {
        return
      }

      const gapForCustom = totalBoards > 0 ? gapUnits : 0
      let availableUnits = lengthUnits - usedStandardUnits - gapForCustom

      if (availableUnits < minCustomUnits) {
        return
      }

      availableUnits = Math.max(0, Math.min(availableUnits, maxCustomUnits))
      let customUnits = Math.floor(availableUnits / 2) * 2

      while (customUnits >= minCustomUnits && customUnits > lengthUnits - usedStandardUnits - gapForCustom) {
        customUnits -= 2
      }

      if (customUnits >= minCustomUnits) {
        const totalUsed = usedStandardUnits + gapForCustom + customUnits
        updateBest(totalUsed, totalBoards + 1, customUnits)
      }
    }

    const search = (index: number, totalBoards: number, sumWidthUnits: number) => {
      if (index === boardOptions.length) {
        evaluateCombination(sumWidthUnits, totalBoards)
        return
      }

      const option = boardOptions[index]
      const remainingSlots = maxBoards - totalBoards

      for (let count = 0; count <= remainingSlots; count++) {
        counts[index] = count
        const newTotalBoards = totalBoards + count
        const newSumWidthUnits = sumWidthUnits + count * option.widthUnits
        const usedUnits = newSumWidthUnits + (newTotalBoards > 0 ? (newTotalBoards - 1) * gapUnits : 0)

        if (usedUnits > lengthUnits + tolerance) {
          break
        }

        search(index + 1, newTotalBoards, newSumWidthUnits)
      }

      counts[index] = 0
    }

    search(0, 0, 0)

    type BoardInfo = { nominal: string; width: number; thickness: number; isCustom?: boolean }

    const pairedBoards: BoardInfo[] = []
    const centerBoards: BoardInfo[] = []

    for (let i = 0; i < boardOptions.length; i++) {
      const option = boardOptions[i]
      const totalCount = bestCounts[i]
      const pairCount = Math.floor(totalCount / 2)

      for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
        pairedBoards.push({
          nominal: option.nominal,
          width: option.width,
          thickness: option.thickness
        })
      }

      if (totalCount % 2 === 1) {
        centerBoards.push({
          nominal: option.nominal,
          width: option.width,
          thickness: option.thickness
        })
      }
    }

    if (bestCustomUnits !== null) {
      const customWidth = Number((bestCustomUnits * unit).toFixed(3))
      centerBoards.push({
        nominal: 'CUSTOM',
        width: customWidth,
        thickness: standardThickness,
        isCustom: true
      })
    }

    let customBoard: BoardInfo | undefined
    const standardCenterBoards: BoardInfo[] = []

    for (const board of centerBoards) {
      if (board.isCustom && !customBoard) {
        customBoard = { ...board }
      } else {
        standardCenterBoards.push({ ...board })
      }
    }

    standardCenterBoards.sort((a, b) => b.width - a.width)

    const leftSequence: BoardInfo[] = pairedBoards.map(board => ({ ...board }))
    const rightSequence: BoardInfo[] = pairedBoards
      .slice()
      .reverse()
      .map(board => ({ ...board }))

    for (const board of standardCenterBoards) {
      if (leftSequence.length <= rightSequence.length) {
        leftSequence.push({ ...board })
      } else {
        rightSequence.push({ ...board })
      }
    }

    const orderedBoards: BoardInfo[] = [
      ...leftSequence.map(board => ({ ...board })),
      ...(customBoard ? [{ ...customBoard }] : []),
      ...rightSequence
        .slice()
        .reverse()
        .map(board => ({ ...board }))
    ]

    if (orderedBoards.length === 0) {
      return []
    }

    const gapCount = Math.max(0, orderedBoards.length - 1)
    const gaps = new Array(gapCount).fill(0)
    const sumWidths = orderedBoards.reduce((acc, board) => acc + board.width, 0)
    const baseGapTotal = gapBetweenBoards * gapCount
    const usedLength = sumWidths + baseGapTotal
    let leftover = Number((internalLength - usedLength).toFixed(6))

    if (leftover < 0 && Math.abs(leftover) <= 1e-4) {
      leftover = 0
    }

    if (leftover > 0 && gapCount > 0) {
      let gapIndex: number
      if (customBoard) {
        gapIndex = Math.min(gapCount - 1, leftSequence.length)
      } else {
        gapIndex = Math.min(gapCount - 1, Math.max(0, leftSequence.length - 1))
      }
      gaps[gapIndex] += leftover
    }

    const layout: Array<{
      nominal: string
      width: number
      thickness: number
      position: number
      isCustom?: boolean
    }> = []

    let currentPosition = panelThickness

    for (let i = 0; i < orderedBoards.length; i++) {
      const board = orderedBoards[i]
      layout.push({
        nominal: board.nominal,
        width: board.width,
        thickness: board.thickness,
        position: currentPosition,
        isCustom: board.isCustom
      })

      currentPosition += board.width

      if (i < gapCount) {
        currentPosition += gaps[i]
      }
    }

    return layout
  }

  private calculate() {
    const { product, clearances, materials } = this.config

    this.lagScrewCount = 0

    // Internal dimensions
    const internalWidth = product.width + (2 * clearances.side)
    const internalLength = product.length + (2 * clearances.end)
    const internalHeight = product.height + clearances.top

    // Material dimensions
    const skidDims = this.getSkidDimensions()
    const floorboardDims = this.getFloorboardDimensions()
    const floorboardThickness = floorboardDims.thickness
    const plywoodThickness = materials.plywoodThickness || PLYWOOD_STANDARDS.DEFAULT_THICKNESS  // Default 0.25" plywood
    const panelThickness = materials.panelThickness || 1.0       // Total thickness including cleats

    // Overall external dimensions
    const overallWidth = internalWidth + (2 * panelThickness)
    const overallLength = internalLength + (2 * panelThickness)
    const overallHeight = internalHeight + skidDims.height + floorboardThickness + panelThickness

    // Store expressions
    this.expressions.set('product_length', product.length)
    this.expressions.set('product_width', product.width)
    this.expressions.set('product_height', product.height)
    this.expressions.set('product_weight', product.weight)

    this.expressions.set('clearance_side', clearances.side)
    this.expressions.set('clearance_end', clearances.end)
    this.expressions.set('clearance_top', clearances.top)

    this.expressions.set('internal_width', internalWidth)
    this.expressions.set('internal_length', internalLength)
    this.expressions.set('internal_height', internalHeight)

    this.expressions.set('plywood_thickness', plywoodThickness)
    this.expressions.set('panel_thickness', panelThickness)
    this.expressions.set('skid_height', skidDims.height)
    this.expressions.set('skid_width', skidDims.width)
    this.expressions.set('skid_nominal', skidDims.nominal ? skidDims.nominal.length : 0)

    // Floorboard expressions
    this.expressions.set('floorboard_width', floorboardDims.width)
    this.expressions.set('floorboard_thickness', floorboardThickness)
    this.expressions.set('floorboard_length', internalWidth)
    this.expressions.set('floorboard_gap', 0)
    this.expressions.set('floorboard_count', this.getFloorboardCount())

    this.expressions.set('overall_width', overallWidth)
    this.expressions.set('overall_length', overallLength)
    this.expressions.set('overall_height', overallHeight)

    // Store skid spacing info
    const spacingInfo = this.getSkidSpacing()
    const skidCount = this.getSkidCount()
    this.expressions.set('skid_max_spacing', spacingInfo.maxSpacing)
    this.expressions.set('skid_count', skidCount)

    // Pattern parameters for skids
    this.expressions.set('pattern_count', skidCount)

    // Calculate actual spacing between skid centers
    let actualSpacing = spacingInfo.maxSpacing
    if (skidCount > 1) {
      const totalSpanWithMaxSpacing = (skidCount - 1) * spacingInfo.maxSpacing
      if (totalSpanWithMaxSpacing > internalWidth - skidDims.width) {
        // Need to reduce spacing to fit
        actualSpacing = (internalWidth - skidDims.width) / (skidCount - 1)
      }
    }
    this.expressions.set('pattern_spacing', actualSpacing)

    // Calculate plywood splicing for panels FIRST
    this.calculatePanelSplicing()

    // Generate geometry
    this.generateShippingBase()
    this.generateCrateCap()
  }

  private generateShippingBase() {
    const skidDims = this.getSkidDimensions()
    const skidCount = this.getSkidCount()
    const internalWidth = this.expressions.get('internal_width')!
    const internalLength = this.expressions.get('internal_length')!
    const panelThickness = this.expressions.get('panel_thickness')!
    const patternSpacing = this.expressions.get('pattern_spacing')!

    // Create skids - ALWAYS place at extreme edges for multiple skids
    // Skid runs along Y-axis (front to back) - FULL LENGTH INCLUDING PANELS
    // Pattern will be along X-axis (left to right)

    // Calculate skid positions
    let skidPositions: number[] = []

    if (skidCount === 1) {
      // Single skid at center
      skidPositions = [0]
    } else if (skidCount === 2) {
      // Two skids at extreme edges
      const edgeOffset = (internalWidth / 2) - (skidDims.width / 2)
      skidPositions = [-edgeOffset, edgeOffset]
    } else {
      // Multiple skids: edges + evenly spaced intermediates
      const edgeOffset = (internalWidth / 2) - (skidDims.width / 2)

      // Calculate spacing between skids (edge to edge)
      const availableSpan = 2 * edgeOffset  // Total span from leftmost to rightmost skid center
      const actualSpacing = availableSpan / (skidCount - 1)

      for (let i = 0; i < skidCount; i++) {
        const position = -edgeOffset + (i * actualSpacing)
        skidPositions.push(position)
      }
    }

    // Create all skids based on calculated positions
    // SKIDS RUN FULL LENGTH FROM FRONT PANEL TO BACK PANEL
    // Y=0 is at the front of the crate (where skids start)
    const skidStartY = 0  // Start at Y=0 (front)
    const skidEndY = internalLength + 2 * panelThickness  // End at back panel

    for (let i = 0; i < skidPositions.length; i++) {
      const skidCenterX = skidPositions[i]
      const skidX = skidCenterX - skidDims.width / 2

      this.boxes.push({
        name: i === 0 ? 'SKID' : `SKID_PATTERN_${i}`,
        point1: { x: skidX, y: skidStartY, z: 0 },
        point2: { x: skidX + skidDims.width, y: skidEndY, z: skidDims.height },
        color: '#C8A882',
        type: 'skid',
        metadata: i === 0 ? 'Base skid (to be patterned in NX)' : `Pattern instance ${i}`
      })
    }

    // Generate floorboard components using the new layout algorithm
    const floorboardLayout = this.getFloorboardLayout()

    // Create floorboard components based on the calculated layout
    for (let i = 0; i < floorboardLayout.length; i++) {
      const board = floorboardLayout[i]

      this.boxes.push({
        name: `FLOORBOARD_${i + 1}`,
        point1: {
          x: -internalWidth/2,
          y: board.position,  // Position is already in correct Y coordinate
          z: skidDims.height
        },
        point2: {
          x: internalWidth/2,
          y: board.position + board.width,
          z: skidDims.height + board.thickness
        },
        color: board.isCustom ? '#D4B896' : '#E8D7B3', // Darker pine for custom, natural pine for standard
        type: 'floor',
        suppressed: false,
        metadata: `${board.nominal} (${board.width.toFixed(2)}" x ${board.thickness}")${board.isCustom ? ' - CUSTOM CUT' : ''}`
      })
    }

    // Create remaining suppressed floorboard placeholders up to 40 total
    for (let i = floorboardLayout.length; i < 40; i++) {
      const placeholder = this.createPlaceholderCube({
        x: -PLACEHOLDER_CUBE_SIZE / 2,
        y: -PLACEHOLDER_CUBE_SIZE / 2,
        z: skidDims.height,
      })
      this.boxes.push({
        name: `FLOORBOARD_${i + 1}`,
        point1: placeholder.point1,
        point2: placeholder.point2,
        color: '#D4C4A0',
        type: 'floor',
        suppressed: true,
        metadata: 'UNUSED - SUPPRESSED'
      })
    }
  }

  private generateCrateCap() {
    const internalWidth = this.expressions.get('internal_width')!
    const internalLength = this.expressions.get('internal_length')!
    const internalHeight = this.expressions.get('internal_height')!
    const plywoodThickness = this.expressions.get('plywood_thickness')!
    const panelThickness = this.expressions.get('panel_thickness')!
    const skidHeight = this.expressions.get('skid_height')!
    const floorboardThickness = this.expressions.get('floorboard_thickness')!

    const baseZ = skidHeight + floorboardThickness
    const sideGroundClearance = this.getSidePanelGroundClearance()
    this.expressions.set('side_panel_ground_clearance', sideGroundClearance)

    // Generate plywood pieces for each panel based on splice layouts
    // Each panel can have up to 6 plywood pieces
    for (const layout of this.panelSpliceLayouts) {
      // Determine panel position in 3D space
      let panelOriginX = 0, panelOriginY = 0, panelOriginZ = 0
      let isVerticalPanel = false

      if (layout.panelName === 'FRONT_PANEL') {
        // Plywood is behind the cleats (cleats on outside)
        panelOriginX = -internalWidth/2 - panelThickness
        panelOriginY = panelThickness - plywoodThickness  // Inner plywood surface touches floorboard edge
        panelOriginZ = skidHeight  // Sits on top of skids
      } else if (layout.panelName === 'BACK_PANEL') {
        // Back panel inner surface should be flush with inner edge of last floorboard
        // Floorboards have 1" clearance from back, so panel needs to be 1" further back
        panelOriginX = -internalWidth/2 - panelThickness
        panelOriginY = internalLength + 1  // Move 1 inch further back to align with last floorboard's inner edge
        panelOriginZ = skidHeight  // Sits on top of skids
      } else if (layout.panelName === 'LEFT_END_PANEL') {
        // Left panel inner surface remains aligned to requested internal width
        panelOriginX = -internalWidth/2 - plywoodThickness
        panelOriginY = panelThickness
        // Side panel starts at ground clearance for forklift access (fixes #90, #109)
        const groundClearance = this.getSidePanelGroundClearance()
        panelOriginZ = groundClearance
        isVerticalPanel = true
      } else if (layout.panelName === 'RIGHT_END_PANEL') {
        // Right panel inner surface remains aligned to requested internal width
        panelOriginX = internalWidth/2
        panelOriginY = panelThickness
        // Side panel starts at ground clearance for forklift access (fixes #90, #109)
        const groundClearance = this.getSidePanelGroundClearance()
        panelOriginZ = groundClearance
        isVerticalPanel = true
      } else if (layout.panelName === 'TOP_PANEL') {
        panelOriginX = -internalWidth/2 - panelThickness
        panelOriginY = 0
        panelOriginZ = baseZ + internalHeight
      }

      // Create individual plywood pieces for this panel
      let pieceIndex = 0
      for (const section of layout.sheets) {
        if (pieceIndex >= 6) break // Maximum 6 pieces per panel

        // Calculate actual 3D positions for this plywood piece
        let point1: Point3D, point2: Point3D

        if (layout.panelName === 'FRONT_PANEL' || layout.panelName === 'BACK_PANEL') {
          point1 = {
            x: panelOriginX + section.x,
            y: panelOriginY,
            z: panelOriginZ + section.y
          }
          point2 = {
            x: panelOriginX + section.x + section.width,
            y: panelOriginY + plywoodThickness,
            z: panelOriginZ + section.y + section.height
          }
        } else if (layout.panelName === 'LEFT_END_PANEL') {
          point1 = {
            x: panelOriginX,
            y: panelOriginY + section.x,
            z: panelOriginZ + section.y
          }
          point2 = {
            x: panelOriginX + plywoodThickness,
            y: panelOriginY + section.x + section.width,
            z: panelOriginZ + section.y + section.height
          }
        } else if (layout.panelName === 'RIGHT_END_PANEL') {
          point1 = {
            x: panelOriginX,
            y: panelOriginY + section.x,
            z: panelOriginZ + section.y
          }
          point2 = {
            x: panelOriginX + plywoodThickness,
            y: panelOriginY + section.x + section.width,
            z: panelOriginZ + section.y + section.height
          }
        } else if (layout.panelName === 'TOP_PANEL') {
          point1 = {
            x: panelOriginX + section.x,
            y: panelOriginY + section.y,
            z: panelOriginZ
          }
          point2 = {
            x: panelOriginX + section.x + section.width,
            y: panelOriginY + section.y + section.height,
            z: panelOriginZ + plywoodThickness
          }
        } else {
          continue
        }

        // Create the plywood piece box
        this.boxes.push({
          name: `${layout.panelName}_PLY_${pieceIndex + 1}`,
          point1: point1,
          point2: point2,
          color: pieceIndex === 0 ? '#DEB887' : pieceIndex === 1 ? '#D2B48C' :
                 pieceIndex === 2 ? '#D9C2A3' : pieceIndex === 3 ? '#E3D4B8' :
                 pieceIndex === 4 ? '#DCBF9F' : '#D7BFA5',
          type: 'plywood',
          plywoodPieceIndex: pieceIndex,
          panelName: layout.panelName,
          suppressed: pieceIndex >= layout.sheets.length, // Suppress unused pieces
          metadata: `Plywood piece ${pieceIndex + 1} of ${layout.sheets.length} (${section.width.toFixed(1)}" x ${section.height.toFixed(1)}")`
        })

        pieceIndex++
      }

      // Fill remaining slots with suppressed placeholders
      while (pieceIndex < 6) {
        const placeholder = this.createPlaceholderCube({
          x: panelOriginX,
          y: panelOriginY,
          z: panelOriginZ,
        })
        this.boxes.push({
          name: `${layout.panelName}_PLY_${pieceIndex + 1}`,
          point1: placeholder.point1,
          point2: placeholder.point2,
          color: '#D4C4A0',
          type: 'plywood',
          plywoodPieceIndex: pieceIndex,
          panelName: layout.panelName,
          suppressed: true,
          metadata: 'UNUSED - SUPPRESSED'
        })
        pieceIndex++
      }
    }

    // Generate cleats for each panel with proper 7-parameter system
    const cleatThickness = LUMBER_DIMENSIONS['1x4'].height  // 1x4 lumber thickness
    const cleatWidth = LUMBER_DIMENSIONS['1x4'].width       // 1x4 lumber width

    for (let i = 0; i < this.panelCleatLayouts.length; i++) {
      const cleatLayout = this.panelCleatLayouts[i]
      const panelLayout = this.panelSpliceLayouts[i]

      // Determine panel position for cleats - cleats are attached to OUTSIDE face of panels
      let panelOriginX = 0, panelOriginY = 0, panelOriginZ = 0

      if (cleatLayout.panelName === 'FRONT_PANEL') {
        // Front panel cleats are on the outside (front) face, flush with plywood
        panelOriginX = -internalWidth/2 - panelThickness
        panelOriginY = panelThickness - plywoodThickness - cleatThickness // Cleats on outside of plywood
        panelOriginZ = skidHeight  // Match panel position
      } else if (cleatLayout.panelName === 'BACK_PANEL') {
        // Back panel cleats are on the outside (back) face, flush with plywood
        panelOriginX = -internalWidth/2 - panelThickness
        panelOriginY = internalLength + 1 + plywoodThickness // Cleats start after plywood (panel moved 1" back)
        panelOriginZ = skidHeight  // Match panel position
      } else if (cleatLayout.panelName === 'LEFT_END_PANEL') {
        // Left panel cleats are on the outside (left) face
        panelOriginX = -internalWidth/2 - plywoodThickness - cleatThickness // Cleats on outside of panel
        panelOriginY = panelThickness
        // Match panel Z origin - starts at ground clearance (fixes #90, #109)
        const groundClearance = this.getSidePanelGroundClearance()
        panelOriginZ = groundClearance
      } else if (cleatLayout.panelName === 'RIGHT_END_PANEL') {
        // Right panel cleats are on the outside (right) face
        panelOriginX = internalWidth/2 + plywoodThickness // Cleats on outside of panel
        panelOriginY = panelThickness
        // Match panel Z origin - starts at ground clearance (fixes #90, #109)
        const groundClearance = this.getSidePanelGroundClearance()
        panelOriginZ = groundClearance
      } else if (cleatLayout.panelName === 'TOP_PANEL') {
        // Top panel cleats are on the outside (top) face
        panelOriginX = -internalWidth/2 - panelThickness  // Match panel origin
        panelOriginY = 0
        panelOriginZ = baseZ + internalHeight + panelThickness - cleatThickness // Above panel
      }

      // Create boxes for each cleat
      for (const cleat of cleatLayout.cleats) {
        let point1: Point3D, point2: Point3D

        if (cleat.orientation === 'horizontal') {
          // Horizontal cleats run along X or Y axis depending on panel
          if (cleatLayout.panelName === 'FRONT_PANEL' || cleatLayout.panelName === 'BACK_PANEL') {
            point1 = {
              x: panelOriginX + cleat.x,
              y: panelOriginY,
              z: panelOriginZ + cleat.y
            }
            point2 = {
              x: panelOriginX + cleat.x + cleat.length,
              y: panelOriginY + cleat.thickness,
              z: panelOriginZ + cleat.y + cleat.width
            }
          } else if (cleatLayout.panelName === 'LEFT_END_PANEL' || cleatLayout.panelName === 'RIGHT_END_PANEL') {
            point1 = {
              x: panelOriginX,
              y: panelOriginY + cleat.x,
              z: panelOriginZ + cleat.y
            }
            point2 = {
              x: panelOriginX + cleat.thickness,
              y: panelOriginY + cleat.x + cleat.length,
              z: panelOriginZ + cleat.y + cleat.width
            }
          } else if (cleatLayout.panelName === 'TOP_PANEL') {
            point1 = {
              x: panelOriginX + cleat.x,
              y: panelOriginY + cleat.y,
              z: panelOriginZ
            }
            point2 = {
              x: panelOriginX + cleat.x + cleat.length,
              y: panelOriginY + cleat.y + cleat.width,
              z: panelOriginZ + cleat.thickness
            }
          }
        } else {
          // Vertical cleats
          if (cleatLayout.panelName === 'FRONT_PANEL' || cleatLayout.panelName === 'BACK_PANEL') {
            point1 = {
              x: panelOriginX + cleat.x,
              y: panelOriginY,
              z: panelOriginZ + cleat.y
            }
            point2 = {
              x: panelOriginX + cleat.x + cleat.width,
              y: panelOriginY + cleat.thickness,
              z: panelOriginZ + cleat.y + cleat.length
            }
          } else if (cleatLayout.panelName === 'LEFT_END_PANEL' || cleatLayout.panelName === 'RIGHT_END_PANEL') {
            point1 = {
              x: panelOriginX,
              y: panelOriginY + cleat.x,
              z: panelOriginZ + cleat.y
            }
            point2 = {
              x: panelOriginX + cleat.thickness,
              y: panelOriginY + cleat.x + cleat.width,
              z: panelOriginZ + cleat.y + cleat.length
            }
          } else if (cleatLayout.panelName === 'TOP_PANEL') {
            point1 = {
              x: panelOriginX + cleat.x,
              y: panelOriginY + cleat.y,
              z: panelOriginZ
            }
            point2 = {
              x: panelOriginX + cleat.x + cleat.width,
              y: panelOriginY + cleat.y + cleat.length,
              z: panelOriginZ + cleat.thickness
            }
          }
        }

        if (point1! && point2!) {
          this.boxes.push({
            name: cleat.id,
            point1: point1,
            point2: point2,
            color: (cleat.type === 'splice' || cleat.id.includes('CLEAT_H_INTER')) ? '#E6C88A' :
                   '#D4A76A', // Lighter yellowish brown for splice cleats and horizontal splice cleats, consistent yellowish brown for all others
            type: 'cleat',
            suppressed: false, // Cleats are now visible
            panelName: cleatLayout.panelName,
            metadata: `${cleat.type} cleat (${cleat.orientation}, ${cleat.length.toFixed(1)}" x ${cleatWidth}" x ${cleatThickness}")`
          })
        }
      }
      const targetLagSpacing = this.getLagSpacing()

      if (cleatLayout.panelName === 'LEFT_END_PANEL' || cleatLayout.panelName === 'RIGHT_END_PANEL') {
        this.addLagHardwareForSidePanel(
          cleatLayout,
          panelOriginX,
          panelOriginY,
          panelOriginZ,
          targetLagSpacing
        )
      } else if (cleatLayout.panelName === 'FRONT_PANEL' || cleatLayout.panelName === 'BACK_PANEL') {
        this.addLagHardwareForFrontBackPanel(
          cleatLayout,
          panelOriginX,
          panelOriginY,
          panelOriginZ,
          targetLagSpacing
        )
      }
    }

    // Generate Klimp 3D boxes for front panel
    this.generateKlimpBoxes()

    // Generate Panel Stop boxes
    this.generatePanelStopBoxes()

    this.expressions.set('lag_screw_count', this.lagScrewCount)
  }
  private generateLagRowPositions(start: number, end: number, spacing: number): number[] {
    const span = end - start
    const tolerance = 1e-4
    const MIN_SPACING = 16
    const MAX_SPACING = 24
    const effectiveSpacing = Math.min(MAX_SPACING, Math.max(MIN_SPACING, spacing))

    if (end <= start + tolerance) {
      return [Number(((start + end) / 2).toFixed(4))]
    }

    // Always place screws at the extremities whenever the requested spacing can accommodate the span
    if (span <= effectiveSpacing + tolerance) {
      return [Number(start.toFixed(4)), Number(end.toFixed(4))]
    }

    let intervalCount = Math.ceil(span / effectiveSpacing)
    intervalCount = Math.max(1, intervalCount)

    let actualSpacing = span / intervalCount

    // Avoid over-tight patterns that violate the 16" minimum spacing requirement
    while (intervalCount > 1 && actualSpacing < MIN_SPACING - tolerance) {
      intervalCount -= 1
      actualSpacing = span / intervalCount
    }

    if (intervalCount <= 1) {
      return [Number(start.toFixed(4)), Number(end.toFixed(4))]
    }

    const step = span / intervalCount
    const positions = Array.from({ length: intervalCount + 1 }, (_, index) =>
      Number((start + index * step).toFixed(4))
    )

    return positions
  }

  private addLagHardwareForSidePanel(
    cleatLayout: PanelCleatLayout,
    panelOriginX: number,
    panelOriginY: number,
    panelOriginZ: number,
    targetSpacing: number,
    _maxPerCleat?: number
  ) {
    const geometry = LagSTEPIntegration.getGeometry()
    const stepPath = LagSTEPIntegration.getStepPath()
    const skidHeight = this.expressions.get('skid_height') || 0
    const isLeftPanel = cleatLayout.panelName === 'LEFT_END_PANEL'

    const headRadius = geometry.headDiameter / 2
    const shankRadius = geometry.shankDiameter / 2

    const axisTag = isLeftPanel ? '+X' : '-X'
    const axisDirection = axisTag === '+X' ? 1 : -1
    const orientation = isLeftPanel ? '+X inward' : '-X inward'

    const panelThickness = this.expressions.get('panel_thickness') || geometry.headHeight
    const outsideFaceX = isLeftPanel ? panelOriginX : panelOriginX + panelThickness

    const headOuterX = outsideFaceX - axisDirection * geometry.headHeight
    const shankInnerX = outsideFaceX + axisDirection * geometry.shankLength
    const headMinX = Math.min(headOuterX, outsideFaceX)
    const headMaxX = Math.max(headOuterX, outsideFaceX)
    const shankMinX = Math.min(shankInnerX, outsideFaceX)
    const shankMaxX = Math.max(shankInnerX, outsideFaceX)

    const minY = panelOriginY + shankRadius
    const maxY = panelOriginY + cleatLayout.panelWidth - shankRadius

    const verticalCleatCenters = cleatLayout.cleats
      .filter(cleat => cleat.orientation === 'vertical')
      .map(cleat => Number((panelOriginY + cleat.x + cleat.width / 2).toFixed(4)))
      .sort((a, b) => a - b)

    let rowPositions: number[]

    if (verticalCleatCenters.length >= 2) {
      // Place screws at first cleat center, last cleat center, and intermediates at targetSpacing
      const firstCenter = verticalCleatCenters[0]
      const lastCenter = verticalCleatCenters[verticalCleatCenters.length - 1]

      // Generate all positions from first to last cleat center
      // generateLagRowPositions already includes endpoints, so use directly
      rowPositions = this.generateLagRowPositions(firstCenter, lastCenter, targetSpacing)
    } else {
      // Fallback for panels with 0-1 vertical cleats: distribute across panel width
      rowPositions = this.generateLagRowPositions(minY, maxY, targetSpacing)
    }

    const bottomCleat = cleatLayout.cleats.find(c => c.orientation === 'horizontal' && c.position === 'bottom')
    const bottomCleatThickness = bottomCleat?.thickness ?? 0.75
    const groundClearance = this.getSidePanelGroundClearance()
    // Position lag screws flush with the top surface of the bottom cleat (not centered in thickness)
    const centerZ = groundClearance + bottomCleatThickness

    rowPositions.forEach((centerY, index) => {
      const baseName = `${cleatLayout.panelName}_LAG_${index + 1}`
      const locationNote = `Row spacing ${targetSpacing.toFixed(2)}" on center`

      const headPoint1 = {
        x: headMinX,
        y: centerY - headRadius,
        z: centerZ - headRadius
      }
      const headPoint2 = {
        x: headMaxX,
        y: centerY + headRadius,
        z: centerZ + headRadius
      }

      const shankPoint1 = {
        x: shankMinX,
        y: centerY - shankRadius,
        z: centerZ - shankRadius
      }
      const shankPoint2 = {
        x: shankMaxX,
        y: centerY + shankRadius,
        z: centerZ + shankRadius
      }

      this.boxes.push({
        name: `${baseName}_HEAD`,
        point1: headPoint1,
        point2: headPoint2,
        color: '#6B7280',
        type: 'hardware',
        suppressed: false,
        panelName: cleatLayout.panelName,
        metadata: `Lag screw head (3/8" x 3.00") on ${cleatLayout.panelName} (${orientation}, ${locationNote}, axis ${axisTag}) - STEP: "${stepPath}"`
      })

      this.boxes.push({
        name: `${baseName}_SHAFT`,
        point1: shankPoint1,
        point2: shankPoint2,
        color: '#4B5563',
        type: 'hardware',
        suppressed: false,
        panelName: cleatLayout.panelName,
        metadata: `Lag screw shank (3/8" x 3.00") on ${cleatLayout.panelName} (${orientation}, ${locationNote}, axis ${axisTag}) - STEP: "${stepPath}"`
      })

      this.lagScrewCount += 1
    })
  }

  private addLagHardwareForFrontBackPanel(
    cleatLayout: PanelCleatLayout,
    panelOriginX: number,
    panelOriginY: number,
    panelOriginZ: number,
    targetSpacing: number
  ) {
    const geometry = LagSTEPIntegration.getGeometry()
    const stepPath = LagSTEPIntegration.getStepPath()
    const isFrontPanel = cleatLayout.panelName === 'FRONT_PANEL'

    const headRadius = geometry.headDiameter / 2
    const shankRadius = geometry.shankDiameter / 2

    const axisTag = isFrontPanel ? '+Y' : '-Y'
    // Front panel screws point inward (positive Y), back panel screws point inward (negative Y)
    const axisDirection = isFrontPanel ? 1 : -1
    const orientation = isFrontPanel ? '+Y inward' : '-Y inward'

    const panelThickness = this.expressions.get('panel_thickness') || geometry.headHeight
    // Outside face: front panel is at panelOriginY (negative), back panel is at panelOriginY + panelThickness (positive)
    const outsideFaceY = isFrontPanel ? panelOriginY : panelOriginY + panelThickness

    // Head extends outward from panel face, shank extends inward
    // Front panel: head at outsideFaceY - headHeight (more negative), shank extends to outsideFaceY + shankLength (less negative, inward)
    // Back panel: head at outsideFaceY + headHeight (more positive), shank extends to outsideFaceY - shankLength (less positive, inward)
    const headOuterY = outsideFaceY - axisDirection * geometry.headHeight
    const shankInnerY = outsideFaceY + axisDirection * geometry.shankLength
    const headMinY = Math.min(headOuterY, outsideFaceY)
    const headMaxY = Math.max(headOuterY, outsideFaceY)
    const shankMinY = Math.min(shankInnerY, outsideFaceY)
    const shankMaxY = Math.max(shankInnerY, outsideFaceY)

    const minX = panelOriginX + shankRadius
    const maxX = panelOriginX + cleatLayout.panelWidth - shankRadius
    let rowPositions = this.generateLagRowPositions(minX, maxX, targetSpacing)

    const verticalCleatCenters = cleatLayout.cleats
      .filter(cleat => cleat.orientation === 'vertical')
      .map(cleat => Number((panelOriginX + cleat.x + cleat.width / 2).toFixed(4)))
      .sort((a, b) => a - b)

    if (verticalCleatCenters.length >= 2 && rowPositions.length >= 2) {
      const tolerance = 1e-4
      const firstCenter = Math.min(maxX, Math.max(minX, verticalCleatCenters[0]))
      const lastCenter = Math.min(maxX, Math.max(minX, verticalCleatCenters[verticalCleatCenters.length - 1]))

      rowPositions[0] = Number(firstCenter.toFixed(4))
      rowPositions[rowPositions.length - 1] = Number(lastCenter.toFixed(4))

      rowPositions = rowPositions
        .sort((a, b) => a - b)
        .filter((value, index, arr) => index === 0 || Math.abs(value - arr[index - 1]) > tolerance)
    }

    const floorboardThickness = this.expressions.get('floorboard_thickness') || 0
    const skidHeight = this.expressions.get('skid_height') || 0
    const centerZ = skidHeight + (floorboardThickness > 0 ? floorboardThickness / 2 : shankRadius)

    rowPositions.forEach((centerX, index) => {
      const baseName = `${cleatLayout.panelName}_LAG_${index + 1}`
      const locationNote = `Row spacing ${targetSpacing.toFixed(2)}" on center`

      const headPoint1 = {
        x: centerX - headRadius,
        y: headMinY,
        z: centerZ - headRadius
      }
      const headPoint2 = {
        x: centerX + headRadius,
        y: headMaxY,
        z: centerZ + headRadius
      }

      const shankPoint1 = {
        x: centerX - shankRadius,
        y: shankMinY,
        z: centerZ - shankRadius
      }
      const shankPoint2 = {
        x: centerX + shankRadius,
        y: shankMaxY,
        z: centerZ + shankRadius
      }

      this.boxes.push({
        name: `${baseName}_HEAD`,
        point1: headPoint1,
        point2: headPoint2,
        color: '#6B7280',
        type: 'hardware',
        suppressed: false,
        panelName: cleatLayout.panelName,
        metadata: `Lag screw head (3/8" x 3.00") on ${cleatLayout.panelName} (${orientation}, ${locationNote}, axis ${axisTag}) - STEP: "${stepPath}"`
      })

      this.boxes.push({
        name: `${baseName}_SHAFT`,
        point1: shankPoint1,
        point2: shankPoint2,
        color: '#4B5563',
        type: 'hardware',
        suppressed: false,
        panelName: cleatLayout.panelName,
        metadata: `Lag screw shank (3/8" x 3.00") on ${cleatLayout.panelName} (${orientation}, ${locationNote}, axis ${axisTag}) - STEP: "${stepPath}"`
      })

      this.lagScrewCount += 1
    })
  }


  private getLagSpacing(): number {
    const configured = this.config.hardware?.lagScrewSpacing
    if (configured === undefined || Number.isNaN(configured)) {
      return 21
    }
    const clamped = Math.min(24, Math.max(16, configured))
    return Math.round(clamped * 16) / 16
  }

  private getSidePanelGroundClearance(): number {
    const configured = this.config.geometry?.sidePanelGroundClearance
    if (configured === undefined || Number.isNaN(configured)) {
      return GEOMETRY_STANDARDS.SIDE_PANEL_GROUND_CLEARANCE
    }
    return Math.max(0, configured)
  }

  private generateKlimpBoxes() {
    // Generate 3D boxes and instances for klimps
    if (this.klimpLayouts.length === 0) {
      return
    }

    const internalWidth = this.expressions.get('internal_width')!
    const internalHeight = this.expressions.get('internal_height')!
    const panelThickness = this.expressions.get('panel_thickness')!
    const plywoodThickness = this.expressions.get('plywood_thickness')!
    const skidHeight = this.expressions.get('skid_height')!
    const floorboardThickness = this.expressions.get('floorboard_thickness')!

    const klimpLayout = this.klimpLayouts[0]

    // Get actual klimp geometry
    const klimpGeometry = KlimpSTEPIntegration.getKlimpGeometry()
    const longerSide = klimpGeometry.longerSideLength
    const shorterSide = klimpGeometry.shorterSideLength
    const klimpThickness = klimpGeometry.thickness
    const klimpWidth = klimpGeometry.width

    // Generate klimp instances for CAD
    this.klimpInstances = KlimpSTEPIntegration.generateKlimpInstances(klimpLayout.klimps)

    // Generate 3D visualization boxes for active klimps
    for (let i = 0; i < klimpLayout.klimps.length; i++) {
      const klimp = klimpLayout.klimps[i]
      const instance = this.klimpInstances[i]
      let point1: Point3D, point2: Point3D

      // Position klimps on the front panel surface with small offset to prevent Z-fighting
      // Add 0.05" offset outward from panel to ensure proper rendering without flickering
      const frontPanelY = panelThickness - plywoodThickness - 0.75 - 0.05 // Front face of front panel with anti-Z-fighting offset

      if (klimp.edge === 'top') {
        // Top edge: longer side vertical, shorter side horizontal inward
        point1 = {
          x: klimp.x - klimpWidth/2,
          y: frontPanelY,
          z: skidHeight + floorboardThickness + internalHeight - longerSide
        }
        point2 = {
          x: klimp.x + klimpWidth/2,
          y: frontPanelY + shorterSide, // Shorter side extends inward
          z: skidHeight + floorboardThickness + internalHeight
        }
      } else if (klimp.edge === 'left') {
        // Left edge: rotated 90°, longer side horizontal, shorter vertical
        point1 = {
          x: -internalWidth/2 - panelThickness,
          y: frontPanelY,
          z: skidHeight + klimp.position - klimpWidth/2
        }
        point2 = {
          x: -internalWidth/2 - panelThickness + shorterSide, // Shorter side extends inward
          y: frontPanelY + longerSide, // Longer side extends horizontally
          z: skidHeight + klimp.position + klimpWidth/2
        }
      } else { // right edge
        // Right edge: rotated -90°, longer side horizontal, shorter vertical
        point1 = {
          x: internalWidth/2 + panelThickness - shorterSide, // Shorter side extends inward
          y: frontPanelY,
          z: skidHeight + klimp.position - klimpWidth/2
        }
        point2 = {
          x: internalWidth/2 + panelThickness,
          y: frontPanelY + longerSide, // Longer side extends horizontally
          z: skidHeight + klimp.position + klimpWidth/2
        }
      }

      if (instance) {
        const center = {
          x: (point1.x + point2.x) / 2,
          y: (point1.y + point2.y) / 2,
          z: (point1.z + point2.z) / 2
        }

        this.klimpInstances[i] = {
          ...instance,
          position: center
        }
      }

      this.boxes.push({
        name: klimp.id,
        point1: point1,
        point2: point2,
        color: '#8B7355', // Bronze/metal color for klimps
        type: 'klimp',
        suppressed: false,
        metadata: `Spring clamp on ${klimp.edge} edge at position ${klimp.position.toFixed(1)}" (Instance ${i + 1}/${KlimpSTEPIntegration.getMaxKlimpCount()}) - STEP: "${KlimpSTEPIntegration.getKlimpSTEPPath()}"`
      })
    }

    // Store the count of active klimps in expressions
    this.expressions.set('klimp_instances_active', klimpLayout.klimps.length)
    this.expressions.set('klimp_instances_total', KlimpSTEPIntegration.getMaxKlimpCount())
  }

  private generatePanelStopBoxes() {
    // Generate 3D boxes for panel stops using PanelStopCalculator
    const calculator = new PanelStopCalculator(this.config)
    this.panelStopLayout = calculator.calculatePanelStops()

    // Add all panel stop boxes to the boxes array
    const panelStopBoxes = calculator.getAllPanelStops()
    this.boxes.push(...panelStopBoxes)

    // Store panel stop information in expressions
    this.expressions.set('panel_stop_count', panelStopBoxes.length)
    this.expressions.set('panel_stop_length', this.panelStopLayout.stopLength)
  }

  private calculateKlimps() {
    const internalWidth = this.expressions.get('internal_width')!
    const internalHeight = this.expressions.get('internal_height')!
    const panelThickness = this.expressions.get('panel_thickness')!
    const plywoodThickness = this.expressions.get('plywood_thickness')!
    const skidHeight = this.expressions.get('skid_height')!
    const floorboardThickness = this.expressions.get('floorboard_thickness')!

    // Get front panel dimensions and cleats
    const frontPanelLayout = this.panelSpliceLayouts.find(p => p.panelName === 'FRONT_PANEL')
    const frontCleatLayout = this.panelCleatLayouts.find(p => p.panelName === 'FRONT_PANEL')

    if (!frontPanelLayout || !frontCleatLayout) {
      return
    }

    // Extract cleat positions for klimp avoidance
    // Only include intermediate and splice cleats, NOT perimeter cleats
    // Klimps go along the edges, so edge cleats don't block them
    const topCleats: CleatInfo[] = []
    const leftCleats: CleatInfo[] = []
    const rightCleats: CleatInfo[] = []

    for (const cleat of frontCleatLayout.cleats) {
      // Skip perimeter cleats - they don't block klimps
      if (cleat.type === 'perimeter') {
        continue
      }

      // For intermediate and splice cleats, check which edge they might interfere with
      if (cleat.orientation === 'vertical') {
        // Vertical intermediate/splice cleats might interfere with top edge klimps
        topCleats.push({ position: cleat.x, width: cleat.width })
      } else if (cleat.orientation === 'horizontal') {
        // Horizontal intermediate/splice cleats might interfere with side edge klimps
        leftCleats.push({ position: cleat.y, width: cleat.width })
        rightCleats.push({ position: cleat.y, width: cleat.width })
      }
    }

    // Calculate optimal klimp positions
    const klimpTargetSpacing = this.config.hardware?.klimpTargetSpacing ?? 16 // Default to 16" for maximum klimps
    const klimpLayout = KlimpCalculator.calculateKlimpLayout(
      frontPanelLayout.panelWidth,
      frontPanelLayout.panelHeight,
      topCleats,
      leftCleats,
      rightCleats,
      klimpTargetSpacing
    )

    this.klimpLayouts = [klimpLayout]

    // Store klimp count in expressions
    this.expressions.set('klimp_count', klimpLayout.totalKlimps)
    this.expressions.set('klimp_top_count', klimpLayout.klimps.filter(k => k.edge === 'top').length)
    this.expressions.set('klimp_left_count', klimpLayout.klimps.filter(k => k.edge === 'left').length)
    this.expressions.set('klimp_right_count', klimpLayout.klimps.filter(k => k.edge === 'right').length)
  }

  private calculatePanelSplicing() {
    const internalWidth = this.expressions.get('internal_width')!
    const internalLength = this.expressions.get('internal_length')!
    const internalHeight = this.expressions.get('internal_height')!
    const panelThickness = this.expressions.get('panel_thickness')!
    const skidHeight = this.expressions.get('skid_height')!
    const floorboardThickness = this.expressions.get('floorboard_thickness')!

    // Calculate actual panel dimensions
    const frontBackWidth = internalWidth + 2 * panelThickness
    const frontBackHeight = internalHeight + floorboardThickness
    const sideWidth = internalLength
    // Side panels start at ground clearance and extend to top panel (fixes #90, #109)
    const sideGroundClearance = this.expressions.get('side_panel_ground_clearance') ?? this.getSidePanelGroundClearance()
    const sideHeight = skidHeight + internalHeight + floorboardThickness - sideGroundClearance
    const topWidth = internalWidth + 2 * panelThickness
    const topLength = internalLength + 2 * panelThickness

    // Calculate splicing layouts for all panels
    this.panelSpliceLayouts = PlywoodSplicer.calculateCrateSplicing(
      frontBackWidth,
      frontBackHeight,
      sideWidth,
      sideHeight,
      topWidth,
      topLength,
      false // No bottom panel (using floorboards instead)
    )

    // Calculate cleats for each panel
    this.panelCleatLayouts = []
    for (const layout of this.panelSpliceLayouts) {
      const cleatLayout = CleatCalculator.calculateCleatLayout(
        layout.panelName,
        layout.panelWidth,
        layout.panelHeight,
        layout.splices,
        layout.isRotated
      )
      this.panelCleatLayouts.push(cleatLayout)
    }

    // Calculate klimps after cleats are positioned
    this.calculateKlimps()

    // Store splice and cleat information in expressions for reference
    let totalSheets = 0
    let totalCleats = 0
    for (let i = 0; i < this.panelSpliceLayouts.length; i++) {
      const layout = this.panelSpliceLayouts[i]
      const cleatLayout = this.panelCleatLayouts[i]
      totalSheets += layout.sheetCount
      totalCleats += cleatLayout.cleats.length
      this.expressions.set(`${layout.panelName.toLowerCase()}_splice_count`, layout.splices.length)
      this.expressions.set(`${layout.panelName.toLowerCase()}_sheet_count`, layout.sheetCount)
      this.expressions.set(`${cleatLayout.panelName.toLowerCase()}_cleat_count`, cleatLayout.cleats.length)
    }
    this.expressions.set('total_plywood_sheets', totalSheets)
    this.expressions.set('total_cleats', totalCleats)

    // Calculate material usage
    const usage = PlywoodSplicer.calculateMaterialUsage(this.panelSpliceLayouts)
    this.expressions.set('plywood_efficiency', Math.round(usage.efficiency * 100) / 100)
    this.expressions.set('plywood_waste_area', Math.round(usage.wasteArea))

    // Calculate cleat material usage
    const cleatUsage = CleatCalculator.calculateCleatMaterial(this.panelCleatLayouts)
    this.expressions.set('cleat_linear_feet', Math.round(cleatUsage.totalLinearFeet * 100) / 100)
    this.expressions.set('cleat_1x4_count', cleatUsage.estimated1x4Count)

    // Calculate klimp material usage
    if (this.klimpLayouts.length > 0) {
      const klimpUsage = KlimpCalculator.calculateKlimpMaterial(this.klimpLayouts)
      this.expressions.set('klimp_total_count', klimpUsage.totalKlimps)
      this.expressions.set('klimp_packages', klimpUsage.estimatedPackages)
    }
  }

  getBoxes(): NXBox[] {
    return this.boxes
  }

  getExpressions(): Map<string, number> {
    return this.expressions
  }

  getPanelSpliceLayouts(): PanelSpliceLayout[] {
    return this.panelSpliceLayouts
  }

  getPanelCleatLayouts(): PanelCleatLayout[] {
    return this.panelCleatLayouts
  }

  getKlimpLayouts(): KlimpLayout[] {
    return this.klimpLayouts
  }

  getKlimpInstances(): KlimpInstance[] {
    return this.klimpInstances
  }

  getPanelStopLayout(): PanelStopLayout | null {
    return this.panelStopLayout
  }

  exportNXExpressions(): string {
    const lines: string[] = []
    const push = (line: string = '') => {
      lines.push(line)
    }

    const formatValue = (value: number): string => {
      const roundedThree = Number(value.toFixed(3))
      if (Math.abs(roundedThree - value) < 1e-6) {
        return roundedThree.toFixed(3)
      }
      if (Math.abs(value) > 0 && Math.abs(value) < 0.001) {
        return value.toFixed(6)
      }
      return value.toFixed(4)
    }

    const inferUnit = (key: string): string | null => {
      const lower = key.toLowerCase()
      if (lower.includes('weight')) return '[lbm]'
      // Rotation/angle values have no unit prefix in NX
      if (lower.includes('angle') || lower.includes('_rot')) return null
      if (lower.includes('feet') || lower.includes('foot')) return '[Ft]'
      if (lower.endsWith('_x') || lower.endsWith('_y') || lower.endsWith('_z')) return '[Inch]'
      const inchIndicators = [
        'length',
        'width',
        'height',
        'thickness',
        'spacing',
        'clearance',
        'offset',
        'radius',
        'diameter',
        'depth',
        'gap',
        'pitch',
        'span',
        'origin',
        'center',
        'position',
        'pos',
        'distance',
        'overhang',
        'projection'
      ]
      if (inchIndicators.some(indicator => lower.includes(indicator))) {
        return '[Inch]'
      }
      return null
    }

    const formatExpression = (key: string, value: number): string => {
      const unit = inferUnit(key)
      const lower = key.toLowerCase()
      // Rotation values use 1 decimal place, no unit
      const numericString = (lower.includes('angle') || lower.includes('_rot')) ? value.toFixed(1) : formatValue(value)
      return `${unit ? `${unit}` : ''}${key} = ${numericString}`
    }

    const formatBoolean = (key: string, value: boolean): string => `${key} = ${value ? 1 : 0}`
    const formatComment = (line: string) => `// ${line}`

    push('// NX Expressions - AutoCrate')
    push(`// Generated: ${new Date().toISOString()}`)
    push('')
    push('// --- COORDINATE SYSTEM & DATUM PLANES ---')
    push('// Origin: Center bottom of crate (X=0, Y=0, Z=0)')
    push('// X-axis: Width (negative = left, positive = right)')
    push('// Y-axis: Length (negative = front, positive = back)')
    push('// Z-axis: Height (upward positive)')
    push('// Units: Inches unless noted')
    push('')
    push('// --- DATUM REFERENCES ---')
    push('// Primary Datum (A): XY-plane at Z=0')
    push('// Secondary Datum (B): YZ-plane at X=0')
    push('// Tertiary Datum (C): XZ-plane at Y=0')
    push('')
    push('// --- PLYWOOD SPLICING GUIDANCE ---')
    push(`// Maximum sheet size: ${PLYWOOD_STANDARDS.SHEET_WIDTH}" x ${PLYWOOD_STANDARDS.SHEET_LENGTH}"`)
    push('// Vertical splices on RIGHT side, horizontal splices on BOTTOM')
    const totalSheets = this.expressions.get('total_plywood_sheets') ?? 0
    const efficiency = this.expressions.get('plywood_efficiency') ?? 0
    push(`// Total plywood sheets required: ${formatValue(totalSheets)}`)
    push(`// Material efficiency: ${formatValue(efficiency)}%`)
    push('')
    push('// --- SKID PATTERN GUIDANCE ---')
    push('// Create a single SKID block at the master position, then pattern along X-axis.')
    push('// Pattern count: pattern_count — spacing: pattern_spacing (center-to-center).')
    push('// Skids run along Y-axis (front to back).')
    push('')
    push('// --- KLIMP FASTENER GUIDANCE ---')
    const klimpCount = this.expressions.get('klimp_count') ?? 0
    const klimpTop = this.expressions.get('klimp_top_count') ?? 0
    const klimpLeft = this.expressions.get('klimp_left_count') ?? 0
    const klimpRight = this.expressions.get('klimp_right_count') ?? 0
    const klimpInstances = this.expressions.get('klimp_instances_active') ?? 0
    const klimpTotal = this.expressions.get('klimp_instances_total') ?? 0
    push('// L-shaped Klimp fasteners connect front panel edges. Maintain <=16" spacing and >=1" from cleats.')
    push(`// Active klimps: ${formatValue(klimpCount)} (Top: ${formatValue(klimpTop)}, Left: ${formatValue(klimpLeft)}, Right: ${formatValue(klimpRight)}).`)
    push(`// Instances available: ${formatValue(klimpInstances)} active of ${formatValue(klimpTotal)} allocated.`)
    push('// STEP file: "CAD FILES/Crate Spring Clamp.STEP" — import once and reuse.')
    push('')
    push('// --- LAG SCREW GUIDANCE ---')
    const lagCount = this.expressions.get('lag_screw_count') ?? 0
    push('// Lag screws: 3/8" x 3.00" under intermediate side cleats.')
    push(`// Total lag screws: ${formatValue(lagCount)} — STEP file: "CAD FILES/LAG SCREW_0.38 X 3.00.stp".`)
    push('')
    const floorboardCount = this.expressions.get('floorboard_count') ?? 0
    push('// --- FLOORBOARD GUIDANCE ---')
    push('// Floorboards run along X-axis, seated on skids (Z = skid_height). Maintain 1" clearance front/back.')
    push(`// Active floorboards: ${formatValue(floorboardCount)} of 40 maximum.`)
    const floorLayout = this.getFloorboardLayout()
    const lumberSizes = [...new Set(floorLayout.map(board => board.nominal))].join(', ')
    if (lumberSizes) {
      push(`// Lumber sizes used: ${lumberSizes}.`)
    }
    const customBoards = floorLayout.filter(board => board.isCustom)
    if (customBoards.length > 0) {
      const widths = customBoards.map(b => formatValue(b.width)).join(', ')
      push(`// Custom board widths: ${widths}.`)
    }

    const markingLines = this.getMarkingInstructions()
    if (markingLines.length > 0) {
      push('')
      markingLines.forEach(push)
    }

    push('')
    push('// --- AUTOGENERATED EXPRESSIONS ---')
    
    // Exclude expressions that are already defined in the template part
    // to prevent "Rule already exists" errors during import
    const excludedExpressions = NXGenerator.EXCLUDED_EXPRESSIONS
    const excludedList: string[] = []
    
    const expressionEntries = Array.from(this.expressions.entries())
      .filter(([key]) => {
        const keyLower = key.toLowerCase()
        const isExcluded = excludedExpressions.has(keyLower)
        if (isExcluded) {
          excludedList.push(key)
        }
        return !isExcluded
      })
      .sort(([a], [b]) => a.localeCompare(b))
    
    if (excludedList.length > 0) {
      push(`// Excluded template-defined expressions: ${excludedList.join(', ')}`)
      push('// These are already defined in the template part and will cause "Rule already exists" errors if exported.')
      push('')
    }
    
    for (const [key, value] of expressionEntries) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        push(formatExpression(key, value))
      }
    }

    if (this.panelSpliceLayouts.length > 0) {
      push('')
      push('// --- PANEL SPLICE LAYOUTS ---')
      for (const layout of this.panelSpliceLayouts) {
        push('')
        push(`// ${layout.panelName}`)
        push(`// Panel size: ${formatValue(layout.panelWidth)}" x ${formatValue(layout.panelHeight)}"`)
        push(`// Sheets required: ${layout.sheetCount}, splices: ${layout.splices.length}`)
        layout.splices.forEach((splice, index) => {
          push(`[Inch]${layout.panelName}_SPLICE_${index}_X = ${formatValue(splice.x)}`)
          push(`[Inch]${layout.panelName}_SPLICE_${index}_Y = ${formatValue(splice.y)}`)
          push(`${layout.panelName}_SPLICE_${index}_TYPE = "${splice.orientation}"`)
        })
        layout.sheets.forEach(section => {
          push(`[Inch]${section.id}_X = ${formatValue(section.x)}`)
          push(`[Inch]${section.id}_Y = ${formatValue(section.y)}`)
          push(`[Inch]${section.id}_WIDTH = ${formatValue(section.width)}`)
          push(`[Inch]${section.id}_HEIGHT = ${formatValue(section.height)}`)
        })
      }
    }

    if (this.boxes.length > 0) {
      push('')
      push('// --- COMPONENT POSITIONS (TWO-POINT METHOD) ---')
      for (const box of this.boxes) {
        push('')
        const descriptors: string[] = [box.name]
        if (box.panelName) {
          descriptors.push(`Panel: ${box.panelName}`)
        }
        push(formatComment(descriptors.join(' — ')))
        if (box.metadata) {
          push(formatComment(box.metadata))
        }

        if (box.type === 'plywood') {
          push(formatBoolean(`${box.name}_SUPPRESSED`, !box.suppressed)) // NX: 0=suppressed, 1=not suppressed
          push(formatExpression(`${box.name}_X1`, box.point1.x))
          push(formatExpression(`${box.name}_Y1`, box.point1.y))
          push(formatExpression(`${box.name}_Z1`, box.point1.z))
          push(formatExpression(`${box.name}_X2`, box.point2.x))
          push(formatExpression(`${box.name}_Y2`, box.point2.y))
          push(formatExpression(`${box.name}_Z2`, box.point2.z))
          push(formatExpression(`${box.name}_X`, box.point1.x))
          push(formatExpression(`${box.name}_Y`, box.point1.y))
          push(formatExpression(`${box.name}_Z`, box.point1.z))
          push(formatExpression(`${box.name}_WIDTH`, Math.max(MIN_DIMENSION, Math.abs(box.point2.x - box.point1.x))))
          push(formatExpression(`${box.name}_LENGTH`, Math.max(MIN_DIMENSION, Math.abs(box.point2.y - box.point1.y))))
          push(formatExpression(`${box.name}_HEIGHT`, Math.max(MIN_DIMENSION, Math.abs(box.point2.z - box.point1.z))))
          const plywoodThickness = this.expressions.get('plywood_thickness') ?? PLYWOOD_STANDARDS.DEFAULT_THICKNESS
          push(formatExpression(`${box.name}_THICKNESS`, plywoodThickness))
        } else if (box.type === 'cleat') {
          push(formatBoolean(`${box.name}_SUPPRESSED`, !box.suppressed)) // NX: 0=suppressed, 1=not suppressed
          push(formatExpression(`${box.name}_X1`, box.point1.x))
          push(formatExpression(`${box.name}_Y1`, box.point1.y))
          push(formatExpression(`${box.name}_Z1`, box.point1.z))
          push(formatExpression(`${box.name}_X2`, box.point2.x))
          push(formatExpression(`${box.name}_Y2`, box.point2.y))
          push(formatExpression(`${box.name}_Z2`, box.point2.z))
          push(formatExpression(`${box.name}_X`, box.point1.x))
          push(formatExpression(`${box.name}_Y`, box.point1.y))
          push(formatExpression(`${box.name}_Z`, box.point1.z))
          push(formatExpression(`${box.name}_WIDTH`, Math.max(MIN_DIMENSION, Math.abs(box.point2.x - box.point1.x))))
          push(formatExpression(`${box.name}_LENGTH`, Math.max(MIN_DIMENSION, Math.abs(box.point2.y - box.point1.y))))
          push(formatExpression(`${box.name}_HEIGHT`, Math.max(MIN_DIMENSION, Math.abs(box.point2.z - box.point1.z))))
          push(formatExpression(`${box.name}_THICKNESS`, 0.75))
        } else if (box.type === 'klimp') {
          const instanceIndex = parseInt(box.name.split('_').pop() || '0', 10) - 1
          const instance = this.klimpInstances[instanceIndex]
          const isActive = instance?.active ?? false
          push(formatBoolean(`${box.name}_ACTIVE`, isActive))
          if (isActive && instance) {
            push(`${box.name}_EDGE = "${instance.edge}"`)
            push(formatExpression(`${box.name}_POS_X`, instance.position.x))
            push(formatExpression(`${box.name}_POS_Y`, instance.position.y))
            push(formatExpression(`${box.name}_POS_Z`, instance.position.z))
            push(formatExpression(`${box.name}_ROT_X`, instance.rotation.x))
            push(formatExpression(`${box.name}_ROT_Y`, instance.rotation.y))
            push(formatExpression(`${box.name}_ROT_Z`, instance.rotation.z))
          } else {
            push(formatComment('Inactive Klimp instance for this configuration.'))
          }
        } else {
          push(formatBoolean(`${box.name}_SUPPRESSED`, !box.suppressed)) // NX: 0=suppressed, 1=not suppressed
          push(formatExpression(`${box.name}_X1`, box.point1.x))
          push(formatExpression(`${box.name}_Y1`, box.point1.y))
          push(formatExpression(`${box.name}_Z1`, box.point1.z))
          push(formatExpression(`${box.name}_X2`, box.point2.x))
          push(formatExpression(`${box.name}_Y2`, box.point2.y))
          push(formatExpression(`${box.name}_Z2`, box.point2.z))
          push(formatExpression(`${box.name}_X`, box.point1.x))
          push(formatExpression(`${box.name}_Y`, box.point1.y))
          push(formatExpression(`${box.name}_Z`, box.point1.z))
          push(formatExpression(`${box.name}_WIDTH`, Math.max(MIN_DIMENSION, Math.abs(box.point2.x - box.point1.x))))
          push(formatExpression(`${box.name}_LENGTH`, Math.max(MIN_DIMENSION, Math.abs(box.point2.y - box.point1.y))))
          push(formatExpression(`${box.name}_HEIGHT`, Math.max(MIN_DIMENSION, Math.abs(box.point2.z - box.point1.z))))
        }
      }
    }

    const maxKlimpInstances = KlimpSTEPIntegration.getMaxKlimpCount()
    if (maxKlimpInstances > 0) {
      push('')
      push('// --- KLIMP INSTANCE PLACEHOLDERS ---')
      push('// Import "CAD FILES/Crate Spring Clamp.STEP" once, then drive instances via expressions below.')
      for (let i = 0; i < maxKlimpInstances; i++) {
        push('')
        const label = `KLIMP_${i + 1}`
        const instance = this.klimpInstances[i]
        if (instance) {
          push(formatComment(label))
          push(formatBoolean(`${label}_ACTIVE`, instance.active))
          if (instance.active) {
            push(`${label}_EDGE = "${instance.edge}"`)
            push(formatExpression(`${label}_POS_X`, instance.position.x))
            push(formatExpression(`${label}_POS_Y`, instance.position.y))
            push(formatExpression(`${label}_POS_Z`, instance.position.z))
            push(formatExpression(`${label}_ROT_X`, instance.rotation.x))
            push(formatExpression(`${label}_ROT_Y`, instance.rotation.y))
            push(formatExpression(`${label}_ROT_Z`, instance.rotation.z))
          } else {
            push(formatComment('Suppressed placeholder.'))
          }
        } else {
          push(formatComment(`${label} (unused placeholder)`))
          push(formatBoolean(`${label}_ACTIVE`, false))
        }
      }
    }

    return lines.join('\n') + '\n'
  }

  generateCutList(): LumberCutList {
    const round = (value: number) => Math.round(value * 100) / 100

    const skidDims = this.getSkidDimensions()
    const skidCount = this.getSkidCount()
    const overallLength = this.expressions.get('overall_length') || 0
    const internalWidth = this.expressions.get('internal_width') || 0
    const panelThickness = this.expressions.get('panel_thickness') || 0

    const skidMaterial = skidDims.nominal
      ? `${skidDims.nominal} (${round(skidDims.width)}" × ${round(skidDims.height)}")`
      : `${round(skidDims.width)}" × ${round(skidDims.height)}"`

    const skids: LumberCutItem[] = [
      {
        description: 'Skid',
        material: skidMaterial,
        count: skidCount,
        length: round(overallLength),
        width: round(skidDims.width),
        thickness: round(skidDims.height),
        notes: 'Cut skids to overall crate length (front to back).'
      }
    ]

    const floorboardLayout = this.getFloorboardLayout()
    const floorboardGroups = new Map<string, {
      nominal: string
      width: number
      thickness: number
      count: number
      isCustom: boolean
    }>()

    for (const board of floorboardLayout) {
      const key = board.nominal === 'CUSTOM'
        ? `CUSTOM-${round(board.width)}`
        : board.nominal

      if (!floorboardGroups.has(key)) {
        floorboardGroups.set(key, {
          nominal: board.nominal,
          width: board.width,
          thickness: board.thickness,
          count: 0,
          isCustom: !!board.isCustom
        })
      }

      floorboardGroups.get(key)!.count += 1
    }

    const floorboards: LumberCutItem[] = Array.from(floorboardGroups.values()).map(group => {
      const actualWidth = round(group.width)
      const actualThickness = round(group.thickness)
      const materialLabel = group.nominal === 'CUSTOM'
        ? `Custom rip (${actualWidth}" width)`
        : `${group.nominal} (${actualWidth}" × ${actualThickness}")`

      return {
        description: group.nominal === 'CUSTOM' ? 'Custom floorboard' : `${group.nominal} floorboard`,
        material: materialLabel,
        count: group.count,
        length: round(internalWidth),
        width: actualWidth,
        thickness: actualThickness,
        notes: group.isCustom ? `Rip to ${actualWidth}" before cutting to length.` : undefined
      }
    }).sort((a, b) => (b.width || 0) - (a.width || 0))

    const cleatGroups: CleatCutGroup[] = this.panelCleatLayouts.map(layout => {
      const groupMap = new Map<string, {
        orientation: 'horizontal' | 'vertical'
        length: number
        count: number
        types: Set<string>
      }>()

      layout.cleats.forEach(cleat => {
        const length = round(cleat.length)
        const key = `${cleat.orientation}-${length}`

        if (!groupMap.has(key)) {
          groupMap.set(key, {
            orientation: cleat.orientation,
            length,
            count: 0,
            types: new Set<string>()
          })
        }

        const entry = groupMap.get(key)!
        entry.count += 1
        entry.types.add(cleat.type)
      })

      const items: CleatCutGroupItem[] = Array.from(groupMap.values()).map(entry => ({
        orientation: entry.orientation,
        length: entry.length,
        count: entry.count,
        types: Array.from(entry.types).sort()
      })).sort((a, b) => {
        if (Math.abs(b.length - a.length) > 0.01) {
          return b.length - a.length
        }
        return b.count - a.count
      })

      return {
        panel: layout.panelName,
        items
      }
    })

    const plywoodGroups: PlywoodCutGroup[] = this.panelSpliceLayouts.map(layout => {
      const sectionMap = new Map<string, {
        width: number
        height: number
        count: number
      }>()

      layout.sheets.forEach(section => {
        const width = round(section.width)
        const height = round(section.height)
        const key = `${width}x${height}`

        if (!sectionMap.has(key)) {
          sectionMap.set(key, {
            width,
            height,
            count: 0
          })
        }

        sectionMap.get(key)!.count += 1
      })

      const pieces: PlywoodCutPiece[] = Array.from(sectionMap.values()).sort((a, b) => {
        if (Math.abs(b.height - a.height) > 0.01) {
          return b.height - a.height
        }
        return b.width - a.width
      })

      return {
        panel: layout.panelName,
        sheetCount: layout.sheetCount,
        isRotated: layout.isRotated,
        pieces
      }
    })

    const cleatUsage = CleatCalculator.calculateCleatMaterial(this.panelCleatLayouts)
    const totalSheets = this.expressions.get('total_plywood_sheets') || 0

    return {
      skids,
      floorboards,
      cleats: cleatGroups,
      plywood: plywoodGroups,
      summary: {
        totalPlywoodSheets: totalSheets,
        plywoodThickness: panelThickness,
        cleatBoardCount: cleatUsage.estimated1x4Count,
        cleatLinearFeet: Math.round(cleatUsage.totalLinearFeet * 100) / 100
      }
    }
  }

  generateBOM(): BillOfMaterialsRow[] {
    const bom: BillOfMaterialsRow[] = []
    const skidCount = this.getSkidCount()
    const skidDims = this.getSkidDimensions()
    const internalLength = this.expressions.get('internal_length')!
    const internalWidth = this.expressions.get('internal_width')!
    const internalHeight = this.expressions.get('internal_height')!
    const panelThickness = this.expressions.get('panel_thickness')!

    // Skids (single component, patterned)
    bom.push({
      item: 'Skid',
      size: `${skidDims.nominal || `${skidDims.width}" x ${skidDims.height}"`}`,
      length: internalLength,
      quantity: skidCount,
      material: 'Lumber',
      note: `Min ${SKID_STANDARDS.MIN_FORKLIFT_HEIGHT}" height required for forklift access. Single component patterned ${skidCount} times.`
    })

    // Floorboards (individual lumber pieces with varied sizes)
    const floorboardLayout = this.getFloorboardLayout()
    const floorboardCount = floorboardLayout.length

    // Group floorboards by size for BOM
    const floorboardGroups = new Map<string, { count: number, width: number, thickness: number, isCustom: boolean }>()

    for (const board of floorboardLayout) {
      const key = board.nominal
      if (floorboardGroups.has(key)) {
        floorboardGroups.get(key)!.count++
      } else {
        floorboardGroups.set(key, {
          count: 1,
          width: board.width,
          thickness: board.thickness,
          isCustom: board.isCustom || false
        })
      }
    }

    // Add each floorboard size group to BOM
    for (const [nominal, group] of floorboardGroups) {
      bom.push({
        item: group.isCustom ? 'Custom Floorboard' : 'Floorboard',
        size: `${nominal} (${group.width.toFixed(2)}" x ${group.thickness}")`,
        length: internalWidth,
        quantity: group.count,
        material: 'Lumber',
        note: group.isCustom
          ? `Custom cut board. ${group.count} piece${group.count > 1 ? 's' : ''} needed.`
          : `Standard lumber. ${group.count} piece${group.count > 1 ? 's' : ''} of ${floorboardCount} total boards.`
      })
    }

    // Plywood Sheets (48x96)
    const totalSheets = this.expressions.get('total_plywood_sheets') || 0
    const efficiency = this.expressions.get('plywood_efficiency') || 0

    bom.push({
      item: `Plywood Sheet (${PLYWOOD_STANDARDS.SHEET_WIDTH}"x${PLYWOOD_STANDARDS.SHEET_LENGTH}")`,
      size: `${PLYWOOD_STANDARDS.SHEET_WIDTH}" x ${PLYWOOD_STANDARDS.SHEET_LENGTH}"`,
      thickness: panelThickness,
      quantity: totalSheets,
      material: 'Plywood',
      note: `Material efficiency: ${efficiency}%. Splices: vertical on right, horizontal on bottom.`
    })

    // Panel details with splice information
    for (const layout of this.panelSpliceLayouts) {
      const panelCount = layout.panelName.includes('FRONT') || layout.panelName.includes('BACK') ||
                         layout.panelName.includes('LEFT') || layout.panelName.includes('RIGHT') ? 1 :
                         layout.panelName === 'TOP_PANEL' ? 1 : 1

      bom.push({
        item: layout.panelName.replace(/_/g, ' '),
        size: `${layout.panelWidth.toFixed(1)}" x ${layout.panelHeight.toFixed(1)}"`,
        thickness: panelThickness,
        quantity: panelCount,
        material: 'Plywood Panel',
        note: `Requires ${layout.sheetCount} sheets, ${layout.splices.length} splices`
      })
    }

    // Cleats (using actual calculation)
    const cleatUsage = CleatCalculator.calculateCleatMaterial(this.panelCleatLayouts)
    bom.push({
      item: 'Cleats (1x4)',
      size: '1x4 x 8ft',
      totalLength: cleatUsage.totalLinearFeet,
      quantity: cleatUsage.estimated1x4Count,
      material: 'Lumber',
      note: `${cleatUsage.totalCleats} total cleats, ${cleatUsage.totalLinearFeet.toFixed(1)} linear feet`
    })

    // Klimp Fasteners
    if (this.klimpLayouts.length > 0) {
      const klimpUsage = KlimpCalculator.calculateKlimpMaterial(this.klimpLayouts)
      bom.push({
        item: 'Klimp Fasteners',
        size: 'L-shaped metal fastener',
        quantity: klimpUsage.totalKlimps,
        packages: klimpUsage.estimatedPackages,
        material: 'Hardware',
        note: `${klimpUsage.totalKlimps} klimps (${klimpUsage.estimatedPackages} packages of 25). Front panel connections.`
      })
    }

    // Panel Stops
    if (this.panelStopLayout) {
      const stopCount = this.expressions.get('panel_stop_count') || 0
      const stopLength = this.expressions.get('panel_stop_length') || 0
      bom.push({
        item: 'Panel Stops',
        size: '3/8" x 2" plywood',
        length: stopLength,
        quantity: stopCount,
        material: 'Plywood',
        note: `${stopCount} panel stops (2 on front panel edges, 1 on top panel). Prevents panel collapse during packing.`
      })
    }

    const lagScrews = this.expressions.get('lag_screw_count') || 0
    if (lagScrews > 0) {
      bom.push({
        item: 'Lag Screw',
        size: '3/8" x 3.00"',
        quantity: lagScrews,
        material: 'Hardware',
        note: 'Lag screws centered on vertical cleats.'
      })
    }

    return bom
  }

  // Calculate marking dimensions based on crate height
  getMarkingDimensions(markingType: 'logo' | 'fragile' | 'handling' | 'autocrate'): MarkingDimensions | null {
    if (!this.config.markings) {
      return null
    }

    const overallHeight = this.expressions.get('overall_height') || 0

    // Logo marking is deprecated and no longer supported
    if (markingType === 'logo') {
      return null
    }

    if (markingType === 'fragile' && this.config.markings.fragileStencil) {
      // Fragile Stencil specifications
      if (overallHeight <= 73) {
        return { width: 8.00, height: 2.31, partNumber: '0205-01930' }
      } else {
        return { width: 12.00, height: 3.50, partNumber: '0205-01930 (Scale 1.5X)' }
      }
    }

    if (markingType === 'handling' && this.config.markings.handlingSymbols) {
      // Handling Symbols specifications
      if (overallHeight <= 37) {
        return { width: 3.00, height: 8.25, partNumber: '0205-00606' }
      } else {
        return { width: 4.00, height: 11.00, partNumber: '0205-00605' }
      }
    }

    if (markingType === 'autocrate' && this.config.markings.autocrateText) {
      // AUTOCRATE text specifications - scales with crate height
      const { SMALL, MEDIUM, LARGE } = MARKING_STANDARDS.AUTOCRATE_TEXT
      if (overallHeight <= SMALL.heightThreshold) {
        return { width: SMALL.width, height: SMALL.height, partNumber: SMALL.partNumber }
      } else if (overallHeight <= MEDIUM.heightThreshold) {
        return { width: MEDIUM.width, height: MEDIUM.height, partNumber: MEDIUM.partNumber }
      } else {
        return { width: LARGE.width, height: LARGE.height, partNumber: LARGE.partNumber }
      }
    }

    return null
  }

  // Generate marking instructions for NX output
  getMarkingInstructions(): string[] {
    if (!this.config.markings) {
      return []
    }

    const lines: string[] = ['// --- MARKING AND DECAL SPECIFICATIONS ---']

    const fragileDims = this.getMarkingDimensions('fragile')
    if (fragileDims) {
      lines.push(`// Fragile Stencil (${fragileDims.partNumber})`)
      lines.push(`// Size: ${fragileDims.width}" x ${fragileDims.height}" — Center on each side and end panel (10° orientation), quantity 4.`)
    }

    const handlingDims = this.getMarkingDimensions('handling')
    if (handlingDims) {
      lines.push(`// Handling Symbols (${handlingDims.partNumber})`)
      lines.push(`// Size: ${handlingDims.width}" x ${handlingDims.height}" — Upper right corner of each side/end panel (horizontal takes priority), up to 4.`)
    }

    const autocrateDims = this.getMarkingDimensions('autocrate')
    if (autocrateDims) {
      lines.push(`// AUTOCRATE Text (${autocrateDims.partNumber})`)
      lines.push(`// Size: ${autocrateDims.width}" x ${autocrateDims.height}" — Center on each panel, bold "AUTOCRATE" text, quantity 4.`)
    }

    return lines
  }
}

// Wrapper function for API usage
export function generateNXExpressions(
  dimensions: { length: number; width: number; height: number },
  weight: number,
  materialType?: string
): string {
  const config: CrateConfig = {
    product: {
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
      weight: weight
    },
    clearances: {
      side: 2,
      end: 2,
      top: 2
    },
    materials: {
      skidSize: weight > 2000 ? '4x4' : '3x3',
      plywoodThickness: PLYWOOD_STANDARDS.DEFAULT_THICKNESS,     // 1/4" plywood
      panelThickness: 1.0,         // Total panel thickness with cleats
      cleatSize: '1x4'             // Standard 1x4 lumber cleats
    }
  }

  const generator = new NXGenerator(config)
  return generator.exportNXExpressions()
}

