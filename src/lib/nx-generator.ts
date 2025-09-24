// NX Expression Generator with Two-Point Box Method
// Coordinate System: X=width (left/right), Y=length (front/back), Z=height (up)
// Origin at center of crate floor (Z=0)

import { PlywoodSplicer, PanelSpliceLayout } from './plywood-splicing'
import { CleatCalculator, PanelCleatLayout } from './cleat-calculator'
import { KlimpCalculator, KlimpLayout, CleatInfo } from './klimp-calculator'
import { KlimpSTEPIntegration, KlimpInstance } from './klimp-step-integration'
import { LagSTEPIntegration } from './lag-step-integration'

export interface ProductDimensions {
  length: number  // Y-axis (front to back)
  width: number   // X-axis (left to right)
  height: number  // Z-axis (vertical)
  weight: number  // pounds
}

export interface MarkingConfig {
  appliedMaterialsLogo: boolean  // Applied Materials logo (4 per crate)
  fragileStencil: boolean        // Fragile markings (4 per crate)
  handlingSymbols: boolean       // Glass, umbrella, up arrows (up to 4 per crate)
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
  markings?: MarkingConfig  // Optional marking configuration
}

export interface Point3D {
  x: number
  y: number
  z: number
}

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

export class NXGenerator {
  private boxes: NXBox[] = []
  private expressions: Map<string, number> = new Map()
  private panelSpliceLayouts: PanelSpliceLayout[] = []
  private panelCleatLayouts: PanelCleatLayout[] = []
  private klimpLayouts: KlimpLayout[] = []
  private klimpInstances: KlimpInstance[] = []
  private lagScrewCount = 0

  constructor(private config: CrateConfig) {
    this.calculate()
  }

  private getSkidDimensions() {
    const weight = this.config.product.weight
    const allow3x4 = this.config.materials.allow3x4Lumber || false

    // Based on Table 5-3: Lumber Size vs Product Weight
    if (weight <= 500 && allow3x4) {
      // 3x4 skids - rotated so height remains 3.5" for forklift access
      // Only use if explicitly allowed
      return { height: 3.5, width: 2.5, nominal: '3x4' }
    } else if (weight <= 4500) {
      // 4x4 skids (or replace 3x4 when not allowed)
      // Note: "Any existing crate design drawings requiring 4 x 6 skids for product under 4500lbs
      // can have the 4 x 6 skids replaced with an equal or greater number of 4 x 4 skids"
      return { height: 3.5, width: 3.5, nominal: '4x4' }
    } else if (weight <= 20000) {
      // 4x6 skids
      return { height: 3.5, width: 5.5, nominal: '4x6' }
    } else if (weight <= 40000) {
      // 6x6 skids
      return { height: 5.5, width: 5.5, nominal: '6x6' }
    } else if (weight <= 60000) {
      // 8x8 skids
      return { height: 7.25, width: 7.25, nominal: '8x8' }
    } else {
      // Maximum supported weight exceeded, default to 8x8
      return { height: 7.25, width: 7.25, nominal: '8x8' }
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
    const plywoodThickness = materials.plywoodThickness || 0.25  // Default 0.25" plywood
    const panelThickness = materials.panelThickness || 1.0       // Total thickness including cleats

    // Overall external dimensions
    const overallWidth = internalWidth + (2 * panelThickness)
    const overallLength = internalLength + (2 * panelThickness)
    const overallHeight = internalHeight + skidDims.height + floorboardDims.thickness + panelThickness

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
    this.expressions.set('floorboard_thickness', floorboardDims.thickness)
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
      this.boxes.push({
        name: `FLOORBOARD_${i + 1}`,
        point1: { x: 0, y: 0, z: skidDims.height },
        point2: { x: 0, y: 0, z: skidDims.height },
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
    const sideGroundClearance = 2  // 2 inches ground clearance for side panels

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
        // Left panel inner surface should be flush with the outer edge of floorboards
        // Floorboards run from -internalWidth/2 to internalWidth/2
        panelOriginX = -internalWidth/2 - plywoodThickness  // Panel's inner surface flush with floorboard edge
        panelOriginY = panelThickness
        panelOriginZ = sideGroundClearance
        isVerticalPanel = true
      } else if (layout.panelName === 'RIGHT_END_PANEL') {
        // Right panel inner surface should be flush with the outer edge of floorboards
        panelOriginX = internalWidth/2  // Panel's inner surface flush with floorboard edge
        panelOriginY = panelThickness
        panelOriginZ = sideGroundClearance
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
        this.boxes.push({
          name: `${layout.panelName}_PLY_${pieceIndex + 1}`,
          point1: { x: 0, y: 0, z: 0 },
          point2: { x: 0, y: 0, z: 0 },
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
    const cleatThickness = 0.75  // 1x4 lumber thickness
    const cleatWidth = 3.5       // 1x4 lumber width

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
        // Panel is at -internalWidth/2 - plywoodThickness, cleats go even further out
        panelOriginX = -internalWidth/2 - plywoodThickness - cleatThickness // Cleats on outside of panel
        panelOriginY = panelThickness
        panelOriginZ = sideGroundClearance
      } else if (cleatLayout.panelName === 'RIGHT_END_PANEL') {
        // Right panel cleats are on the outside (right) face
        // Panel is at internalWidth/2, cleats go even further out
        panelOriginX = internalWidth/2 + plywoodThickness // Cleats on outside of panel
        panelOriginY = panelThickness
        panelOriginZ = sideGroundClearance
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
      if (cleatLayout.panelName === 'LEFT_END_PANEL' || cleatLayout.panelName === 'RIGHT_END_PANEL') {
        this.addLagHardwareForSidePanel(
          cleatLayout,
          panelOriginX,
          panelOriginY,
          panelOriginZ
        )
      } else if (cleatLayout.panelName === 'BACK_PANEL') {
        this.addLagHardwareForBackPanel(
          cleatLayout,
          panelOriginX,
          panelOriginY,
          panelOriginZ
        )
      }
    }

    // Generate Klimp 3D boxes for front panel
    this.generateKlimpBoxes()

    this.expressions.set('lag_screw_count', this.lagScrewCount)
  }

  private addLagHardwareForSidePanel(
    cleatLayout: PanelCleatLayout,
    panelOriginX: number,
    panelOriginY: number,
    _panelOriginZ: number
  ) {
    const geometry = LagSTEPIntegration.getGeometry()
    const stepPath = LagSTEPIntegration.getStepPath()
    const floorboardThickness = this.expressions.get('floorboard_thickness') || 0
    const skidHeight = this.expressions.get('skid_height') || 0
    const floorboardMidZ = skidHeight + floorboardThickness / 2
    const isLeftPanel = cleatLayout.panelName === 'LEFT_END_PANEL'

    const supportCleats = cleatLayout.cleats.filter(
      cleat =>
        cleat.orientation === 'vertical' &&
        cleat.type !== 'perimeter'
    )

    supportCleats.forEach(cleat => {
      const headRadius = geometry.headDiameter / 2
      const shankRadius = geometry.shankDiameter / 2

      const centerY = panelOriginY + cleat.x + cleat.width / 2
      const centerZ = floorboardMidZ

      const outsideFaceX = isLeftPanel
        ? panelOriginX
        : panelOriginX + cleat.thickness

      const headStartX = isLeftPanel
        ? outsideFaceX - geometry.headHeight
        : outsideFaceX
      const headEndX = isLeftPanel
        ? outsideFaceX
        : outsideFaceX + geometry.headHeight

      const shankStartX = isLeftPanel
        ? outsideFaceX
        : outsideFaceX - geometry.shankLength
      const shankEndX = isLeftPanel
        ? outsideFaceX + geometry.shankLength
        : outsideFaceX

      const headPoint1 = {
        x: Math.min(headStartX, headEndX),
        y: centerY - headRadius,
        z: centerZ - headRadius
      }
      const headPoint2 = {
        x: Math.max(headStartX, headEndX),
        y: centerY + headRadius,
        z: centerZ + headRadius
      }

      const shankPoint1 = {
        x: Math.min(shankStartX, shankEndX),
        y: centerY - shankRadius,
        z: centerZ - shankRadius
      }
      const shankPoint2 = {
        x: Math.max(shankStartX, shankEndX),
        y: centerY + shankRadius,
        z: centerZ + shankRadius
      }

      const orientation = isLeftPanel ? '+X inward' : '-X inward'
      const baseName = `${cleat.id}_LAG`

      this.boxes.push({
        name: `${baseName}_HEAD`,
        point1: headPoint1,
        point2: headPoint2,
        color: '#6B7280',
        type: 'hardware',
        suppressed: false,
        panelName: cleatLayout.panelName,
        metadata: `Lag screw head (3/8" x 2.5") on ${cleat.id} (${orientation}, floorboard centerline) - STEP: "${stepPath}"`
      })

      this.boxes.push({
        name: `${baseName}_SHAFT`,
        point1: shankPoint1,
        point2: shankPoint2,
        color: '#4B5563',
        type: 'hardware',
        suppressed: false,
        panelName: cleatLayout.panelName,
        metadata: `Lag screw shank (3/8" x 2.5") on ${cleat.id} (${orientation}, floorboard centerline) - STEP: "${stepPath}"`
      })

      this.lagScrewCount += 1
    })
  }

  private addLagHardwareForBackPanel(
    cleatLayout: PanelCleatLayout,
    panelOriginX: number,
    panelOriginY: number,
    _panelOriginZ: number
  ) {
    const geometry = LagSTEPIntegration.getGeometry()
    const stepPath = LagSTEPIntegration.getStepPath()
    const floorboardThickness = this.expressions.get('floorboard_thickness') || 0
    const skidHeight = this.expressions.get('skid_height') || 0
    const floorboardMidZ = skidHeight + floorboardThickness / 2

    const supportCleats = cleatLayout.cleats.filter(
      cleat =>
        cleat.orientation === 'vertical' &&
        cleat.type !== 'perimeter'
    )

    supportCleats.forEach(cleat => {
      const headRadius = geometry.headDiameter / 2
      const shankRadius = geometry.shankDiameter / 2

      const centerX = panelOriginX + cleat.x + cleat.width / 2
      const centerZ = floorboardMidZ

      const outsideFaceY = panelOriginY + cleat.thickness

      const headPoint1 = {
        x: centerX - headRadius,
        y: outsideFaceY - geometry.headHeight,
        z: centerZ - headRadius
      }
      const headPoint2 = {
        x: centerX + headRadius,
        y: outsideFaceY,
        z: centerZ + headRadius
      }

      const shankPoint1 = {
        x: centerX - shankRadius,
        y: outsideFaceY - geometry.shankLength,
        z: centerZ - shankRadius
      }
      const shankPoint2 = {
        x: centerX + shankRadius,
        y: outsideFaceY,
        z: centerZ + shankRadius
      }

      const orientation = '-Y inward'
      const baseName = `${cleat.id}_LAG`

      this.boxes.push({
        name: `${baseName}_HEAD`,
        point1: headPoint1,
        point2: headPoint2,
        color: '#6B7280',
        type: 'hardware',
        suppressed: false,
        panelName: cleatLayout.panelName,
        metadata: `Lag screw head (3/8" x 2.5") on ${cleat.id} (${orientation}, floorboard centerline) - STEP: "${stepPath}"`
      })

      this.boxes.push({
        name: `${baseName}_SHAFT`,
        point1: shankPoint1,
        point2: shankPoint2,
        color: '#4B5563',
        type: 'hardware',
        suppressed: false,
        panelName: cleatLayout.panelName,
        metadata: `Lag screw shank (3/8" x 2.5") on ${cleat.id} (${orientation}, floorboard centerline) - STEP: "${stepPath}"`
      })

      this.lagScrewCount += 1
    })
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
    const klimpLayout = KlimpCalculator.calculateKlimpLayout(
      frontPanelLayout.panelWidth,
      frontPanelLayout.panelHeight,
      topCleats,
      leftCleats,
      rightCleats
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
    const sideHeight = internalHeight + floorboardThickness + skidHeight - 2 // Side panels extend lower
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

  exportNXExpressions(): string {
    let output = '# NX Expressions for AutoCrate\n'
    output += '# Generated: ' + new Date().toISOString() + '\n'
    output += '# Coordinate System: X=width, Y=length, Z=height\n'
    output += '# Origin at center of crate floor (Z=0)\n'
    output += '# \n'
    output += '# PLYWOOD SPLICING INFORMATION:\n'
    output += '# - Maximum sheet size: 48" x 96"\n'
    output += '# - Vertical splices positioned on RIGHT side\n'
    output += '# - Horizontal splices positioned on BOTTOM\n'
    output += `# - Total plywood sheets required: ${this.expressions.get('total_plywood_sheets') || 0}\n`
    output += `# - Material efficiency: ${this.expressions.get('plywood_efficiency') || 0}%\n`
    output += '# \n'
    output += '# SKID PATTERN INSTRUCTIONS:\n'
    output += '# - Create single SKID component at leftmost position\n'
    output += '# - Pattern along X-axis (left to right) using:\n'
    output += '#   * Count: pattern_count\n'
    output += '#   * Spacing: pattern_spacing (center-to-center)\n'
    output += '# - Skids run along Y-axis (front to back)\n'
    output += '# \n'
    output += '# KLIMP FASTENER INSTRUCTIONS:\n'
    output += '# - L-shaped fasteners connecting front panel to adjacent panels\n'
    output += '# - Positioned on top and side edges of front panel\n'
    output += '# - Maximum 16" spacing, minimum 2" apart from each other\n'
    output += '# - Minimum 1" clearance from cleats\n'
    output += `# - Total klimps: ${this.expressions.get('klimp_count') || 0}\n`
    output += `#   * Top edge: ${this.expressions.get('klimp_top_count') || 0}\n`
    output += `#   * Left edge: ${this.expressions.get('klimp_left_count') || 0}\n`
    output += `#   * Right edge: ${this.expressions.get('klimp_right_count') || 0}\n`
    output += '# \n'
    output += '# KLIMP INSTANCE MANAGEMENT:\n'
    output += `# - Total pre-allocated instances: ${this.expressions.get('klimp_instances_total') || 20}\n`
    output += `# - Active instances: ${this.expressions.get('klimp_instances_active') || 0}\n`
    output += '# - STEP file: CAD FILES/Crate Spring Clamp.STEP\n'
    output += '# - Import the STEP file once, then pattern/position instances\n'
    output += '# \n'
    output += '# LAG SCREW INSTALLATION:\n'
    output += '# - 3/8" x 2.50" lag hardware on each intermediate/splice side/back cleat (floorboard centerline, oriented inward)\n'
    output += `# - Total lag screws: ${this.expressions.get('lag_screw_count') || 0}\n`
    output += '# - STEP file: CAD FILES/LAG SCREW_0.38 X 2.50.stp\n'
    output += '# - Import once and reuse at generated positions\n'
    output += '# \n'

    // Add marking instructions if configured
    output += this.getMarkingInstructions()

    output += '# FLOORBOARD INSTRUCTIONS:\n'
    output += '# - Optimized floorboard layout using available lumber sizes\n'
    output += '# - Floorboards run along X-axis (perpendicular to skids)\n'
    output += '# - Floorboards sit on top of skids (Z position = skid_height)\n'
    output += '# - Symmetric placement: larger boards outside, smaller toward center\n'
    output += '# - 1" clearance from front and back edges for panel/cleat space\n'
    output += '# - Custom boards may be created to fill remaining gaps\n'
    output += `# - Active floorboards: ${this.expressions.get('floorboard_count')} out of 40 total\n`

    const layout = this.getFloorboardLayout()
    const lumberSizes = [...new Set(layout.map(b => b.nominal))].join(', ')
    output += `# - Lumber sizes used: ${lumberSizes}\n`

    const customBoards = layout.filter(b => b.isCustom)
    if (customBoards.length > 0) {
      output += `# - Custom boards: ${customBoards.length} (${customBoards.map(b => b.width.toFixed(2) + '"').join(', ')})\n`
    }
    output += '\n'

    // Export dimensions
    output += '# Product and Crate Dimensions\n'
    for (const [key, value] of this.expressions) {
      output += `${key}=${value.toFixed(3)}\n`
    }

    // Export panel splice details
    output += '\n# PANEL SPLICE LAYOUTS\n'
    for (const layout of this.panelSpliceLayouts) {
      output += `\n# ${layout.panelName}\n`
      output += `# Panel size: ${layout.panelWidth.toFixed(1)}" x ${layout.panelHeight.toFixed(1)}"\n`
      output += `# Sheets required: ${layout.sheetCount}\n`
      output += `# Splices: ${layout.splices.length}\n`

      // Export splice positions
      if (layout.splices.length > 0) {
        for (let i = 0; i < layout.splices.length; i++) {
          const splice = layout.splices[i]
          output += `${layout.panelName}_SPLICE_${i}_X=${splice.x.toFixed(3)}\n`
          output += `${layout.panelName}_SPLICE_${i}_Y=${splice.y.toFixed(3)}\n`
          output += `${layout.panelName}_SPLICE_${i}_TYPE="${splice.orientation}"\n`
        }
      }

      // Export sheet sections
      for (const section of layout.sheets) {
        output += `${section.id}_X=${section.x.toFixed(3)}\n`
        output += `${section.id}_Y=${section.y.toFixed(3)}\n`
        output += `${section.id}_WIDTH=${section.width.toFixed(3)}\n`
        output += `${section.id}_HEIGHT=${section.height.toFixed(3)}\n`
      }
    }

    // Export component positions
    output += '\n# Component Positions (Two Diagonal Points)\n'
    for (const box of this.boxes) {
      output += `\n# ${box.name}\n`
      if (box.name === 'SKID') {
        output += `# NOTE: Pattern this component ${this.expressions.get('pattern_count')} times along X-axis\n`
        output += `# with center-to-center spacing of ${this.expressions.get('pattern_spacing')?.toFixed(3)}" \n`
      }
      if (box.name.startsWith('FLOORBOARD_')) {
        const suppressedText = box.suppressed ? ' (SUPPRESSED)' : ' (ACTIVE)'
        const metadataText = box.metadata ? ` - ${box.metadata}` : ''
        output += `# ${box.name}${suppressedText}${metadataText}\n`
      }
      if (box.type === 'plywood') {
        const suppressedText = box.suppressed ? ' (SUPPRESSED)' : ' (ACTIVE)'
        output += `# Panel: ${box.panelName}, Piece ${(box.plywoodPieceIndex || 0) + 1}/6${suppressedText}\n`
        if (box.metadata) {
          output += `# ${box.metadata}\n`
        }
        // Export 7 parameters for plywood pieces
        output += `# 7 PLYWOOD PARAMETERS:\n`
        output += `${box.name}_X=${box.point1.x.toFixed(3)}\n`
        output += `${box.name}_Y=${box.point1.y.toFixed(3)}\n`
        output += `${box.name}_Z=${box.point1.z.toFixed(3)}\n`
        output += `${box.name}_WIDTH=${Math.abs(box.point2.x - box.point1.x).toFixed(3)}\n`
        output += `${box.name}_LENGTH=${Math.abs(box.point2.y - box.point1.y).toFixed(3)}\n`
        output += `${box.name}_HEIGHT=${Math.abs(box.point2.z - box.point1.z).toFixed(3)}\n`
        output += `${box.name}_THICKNESS=${this.expressions.get('plywood_thickness')?.toFixed(3) || '0.250'}\n`
        if (box.suppressed) {
          output += `${box.name}_SUPPRESSED=TRUE\n`
        }
      } else if (box.type === 'cleat') {
        // Export 7 parameters for cleat pieces
        const suppressedText = box.suppressed ? ' (SUPPRESSED)' : ' (ACTIVE)'
        output += `# Cleat component${suppressedText}\n`
        if (box.metadata) {
          output += `# ${box.metadata}\n`
        }
        output += `# 7 CLEAT PARAMETERS:\n`
        output += `${box.name}_X=${box.point1.x.toFixed(3)}\n`
        output += `${box.name}_Y=${box.point1.y.toFixed(3)}\n`
        output += `${box.name}_Z=${box.point1.z.toFixed(3)}\n`
        output += `${box.name}_WIDTH=${Math.abs(box.point2.x - box.point1.x).toFixed(3)}\n`
        output += `${box.name}_LENGTH=${Math.abs(box.point2.y - box.point1.y).toFixed(3)}\n`
        output += `${box.name}_HEIGHT=${Math.abs(box.point2.z - box.point1.z).toFixed(3)}\n`
        output += `${box.name}_THICKNESS=0.750\n`  // 1x4 lumber thickness
        if (box.suppressed) {
          output += `${box.name}_SUPPRESSED=TRUE\n`
        }
      } else if (box.type === 'klimp') {
        // Export klimp instance parameters
        output += `# Klimp spring clamp instance\n`
        if (box.metadata) {
          output += `# ${box.metadata}\n`
        }
        // Find the corresponding instance
        const instanceIndex = parseInt(box.name.split('_').pop() || '0') - 1
        const instance = this.klimpInstances[instanceIndex]
        if (instance) {
          output += `# Instance configuration:\n`
          output += `${box.name}_ACTIVE=${instance.active ? 'TRUE' : 'FALSE'}\n`
          output += `${box.name}_EDGE="${instance.edge}"\n`
          output += `${box.name}_POS_X=${instance.position.x.toFixed(3)}\n`
          output += `${box.name}_POS_Y=${instance.position.y.toFixed(3)}\n`
          output += `${box.name}_POS_Z=${instance.position.z.toFixed(3)}\n`
          output += `${box.name}_ROT_X=${instance.rotation.x.toFixed(1)}\n`
          output += `${box.name}_ROT_Y=${instance.rotation.y.toFixed(1)}\n`
          output += `${box.name}_ROT_Z=${instance.rotation.z.toFixed(1)}\n`
        }
      } else {
        if (box.suppressed) {
          output += `# ${box.name}_SUPPRESSED=TRUE\n`
        }
        output += `${box.name}_X1=${box.point1.x.toFixed(3)}\n`
        output += `${box.name}_Y1=${box.point1.y.toFixed(3)}\n`
        output += `${box.name}_Z1=${box.point1.z.toFixed(3)}\n`
        output += `${box.name}_X2=${box.point2.x.toFixed(3)}\n`
        output += `${box.name}_Y2=${box.point2.y.toFixed(3)}\n`
        output += `${box.name}_Z2=${box.point2.z.toFixed(3)}\n`
      }
    }

    // Export all klimp instance placeholders
    output += '\n# KLIMP INSTANCE PLACEHOLDERS\n'
    output += '# Import "CAD FILES/Crate Spring Clamp.STEP" once, then position these instances\n'
    for (let i = 0; i < KlimpSTEPIntegration.getMaxKlimpCount(); i++) {
      const instance = this.klimpInstances[i]
      if (instance) {
        output += `\n# KLIMP_${i + 1}:\n`
        output += `KLIMP_${i + 1}_ACTIVE=${instance.active ? 'TRUE' : 'FALSE'}\n`
        if (instance.active) {
          output += `KLIMP_${i + 1}_EDGE="${instance.edge}"\n`
          output += `KLIMP_${i + 1}_POS_X=${instance.position.x.toFixed(3)}\n`
          output += `KLIMP_${i + 1}_POS_Y=${instance.position.y.toFixed(3)}\n`
          output += `KLIMP_${i + 1}_POS_Z=${instance.position.z.toFixed(3)}\n`
          output += `KLIMP_${i + 1}_ROT_X=${instance.rotation.x.toFixed(1)}\n`
          output += `KLIMP_${i + 1}_ROT_Y=${instance.rotation.y.toFixed(1)}\n`
          output += `KLIMP_${i + 1}_ROT_Z=${instance.rotation.z.toFixed(1)}\n`
        } else {
          output += `# Suppressed - not used for this crate size\n`
        }
      }
    }

    return output
  }

  generateBOM() {
    const bom = []
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
      note: `Min 3.5" height required for forklift access. Single component patterned ${skidCount} times.`
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
      item: 'Plywood Sheet (48"x96")',
      size: '48" x 96"',
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

    return bom
  }

  // Calculate marking dimensions based on crate height
  getMarkingDimensions(markingType: 'logo' | 'fragile' | 'handling'): MarkingDimensions | null {
    if (!this.config.markings) {
      return null
    }

    const overallHeight = this.expressions.get('overall_height') || 0

    if (markingType === 'logo' && this.config.markings.appliedMaterialsLogo) {
      // Applied Materials Logo specifications
      if (overallHeight <= 37) {
        return { width: 5.56, height: 4.00, partNumber: '0205-02548' }
      } else if (overallHeight <= 73) {
        return { width: 8.34, height: 6.00, partNumber: '0205-02548 (Scale 1.5X)' }
      } else {
        return { width: 11.13, height: 8.00, partNumber: '0205-02548 (Scale 2.0X)' }
      }
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

    return null
  }

  // Generate marking instructions for NX output
  getMarkingInstructions(): string {
    if (!this.config.markings) {
      return ''
    }

    let instructions = '# MARKING AND DECAL SPECIFICATIONS:\n'

    const logoDims = this.getMarkingDimensions('logo')
    if (logoDims) {
      instructions += `# Applied Materials Logo (${logoDims.partNumber}):\n`
      instructions += `#   - Size: ${logoDims.width}" x ${logoDims.height}"\n`
      instructions += '#   - Position: Upper left corner of each side and end panel\n'
      instructions += '#   - Quantity: 4 per crate\n'
      instructions += '#   - Note: If space between cleats is insufficient, use smaller size\n'
    }

    const fragileDims = this.getMarkingDimensions('fragile')
    if (fragileDims) {
      instructions += `# Fragile Stencil (${fragileDims.partNumber}):\n`
      instructions += `#   - Size: ${fragileDims.width}" x ${fragileDims.height}"\n`
      instructions += '#   - Position: Center on each side and end panel\n'
      instructions += '#   - Orientation: 10 degree angle\n'
      instructions += '#   - Quantity: 4 per crate\n'
    }

    const handlingDims = this.getMarkingDimensions('handling')
    if (handlingDims) {
      instructions += `# Handling Symbols (${handlingDims.partNumber}):\n`
      instructions += `#   - Size: ${handlingDims.width}" x ${handlingDims.height}"\n`
      instructions += '#   - Position: Upper right corner of each side and end panel\n'
      instructions += '#   - Note: Horizontal orientation takes priority over vertical\n'
      instructions += '#   - Quantity: Up to 4 per crate\n'
    }

    instructions += '# \n'
    return instructions
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
      plywoodThickness: 0.25,     // 1/4" plywood
      panelThickness: 1.0,         // Total panel thickness with cleats
      cleatSize: '1x4'             // Standard 1x4 lumber cleats
    }
  }

  const generator = new NXGenerator(config)
  return generator.exportNXExpressions()
}
