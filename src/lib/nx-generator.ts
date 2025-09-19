// NX Expression Generator with Two-Point Box Method
// Coordinate System: X=width (left/right), Y=length (front/back), Z=height (up)
// Origin at center of crate floor (Z=0)

import { PlywoodSplicer, PanelSpliceLayout } from './plywood-splicing'
import { CleatCalculator, PanelCleatLayout } from './cleat-calculator'

export interface ProductDimensions {
  length: number  // Y-axis (front to back)
  width: number   // X-axis (left to right)
  height: number  // Z-axis (vertical)
  weight: number  // pounds
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
  type?: 'skid' | 'floor' | 'panel' | 'cleat' | 'plywood'
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
    const panelThickness = this.config.materials.panelThickness

    // Define all lumber options with their properties
    const lumberOptions = [
      { nominal: '2x6', width: 5.5, thickness: 1.5 },
      { nominal: '2x8', width: 7.25, thickness: 1.5 },
      { nominal: '2x10', width: 9.25, thickness: 1.5 },
      { nominal: '2x12', width: 11.25, thickness: 1.5 }
    ] as const

    // Filter by available lumber sizes and sort by width (largest first for outside placement)
    const availableOptions = lumberOptions
      .filter(option => availableLumber.includes(option.nominal as '2x6' | '2x8' | '2x10' | '2x12'))
      .sort((a, b) => b.width - a.width) // Largest first

    // If no available lumber, fallback to 2x6
    if (availableOptions.length === 0) {
      availableOptions.push({ nominal: '2x6', width: 5.5, thickness: 1.5 })
    }

    // Calculate effective length - floorboards run between the inside faces of panels
    // From Y = panelThickness to Y = internalLength + panelThickness
    const effectiveLength = internalLength // Just the internal length
    const gapBetweenBoards = 0.125 // 1/8" gap between boards

    const layout: Array<{
      nominal: string
      width: number
      thickness: number
      position: number
      isCustom?: boolean
    }> = []

    let remainingLength = effectiveLength
    let currentPosition = panelThickness // Start at inside face of front panel

    // Symmetric placement algorithm: place larger boards on outside, smaller toward center
    const placedBoards: typeof layout = []

    // Continue placing boards until we can't fit any more
    while (remainingLength > 0.25 && layout.length < 40) { // Increased limit to 40 boards
      let boardPlaced = false

      // Try each available lumber size (largest first)
      for (const lumber of availableOptions) {
        const boardWithGap = lumber.width + gapBetweenBoards

        if (boardWithGap <= remainingLength) {
          layout.push({
            nominal: lumber.nominal,
            width: lumber.width,
            thickness: lumber.thickness,
            position: currentPosition
          })

          currentPosition += boardWithGap
          remainingLength -= boardWithGap
          boardPlaced = true
          break
        }
      }

      // If no standard board fits, try to add a custom board
      if (!boardPlaced) {
        // Check if remaining length can accommodate a custom board
        // Custom board must be at least 0.25" wide
        if (remainingLength >= 0.25) {
          // Account for gap if there's a next board
          const customWidth = remainingLength > gapBetweenBoards ?
                             remainingLength - gapBetweenBoards :
                             remainingLength

          // Only add custom board if it's at least 0.25" wide
          if (customWidth >= 0.25) {
            layout.push({
              nominal: 'CUSTOM',
              width: customWidth,
              thickness: availableOptions[0].thickness, // Use standard thickness
              position: currentPosition,
              isCustom: true
            })
          }
        }
        break
      }
    }

    // Create symmetric layout: larger boards on outside, smaller toward center
    const symmetricLayout: typeof layout = []

    if (layout.length === 0) {
      return symmetricLayout
    }

    // Sort boards by size (largest first for outside placement)
    const sortedBySize = [...layout].sort((a, b) => b.width - a.width)

    // For symmetric placement, we'll place boards alternating from front and back
    let frontPosition = panelThickness // Start at inside face of front panel
    let backPosition = internalLength + panelThickness   // End at inside face of back panel

    for (let i = 0; i < sortedBySize.length; i++) {
      const board = sortedBySize[i]

      if (i % 2 === 0) {
        // Place on front side (moving forward)
        symmetricLayout.push({
          ...board,
          position: frontPosition
        })
        frontPosition += board.width + gapBetweenBoards
      } else {
        // Place on back side (moving backward)
        backPosition -= board.width
        symmetricLayout.push({
          ...board,
          position: backPosition
        })
        backPosition -= gapBetweenBoards
      }
    }

    // Validate that boards don't overlap and fit within bounds
    const sortedByPosition = symmetricLayout.sort((a, b) => a.position - b.position)

    // Check for overlaps and adjust if necessary
    for (let i = 1; i < sortedByPosition.length; i++) {
      const prevBoard = sortedByPosition[i - 1]
      const currentBoard = sortedByPosition[i]
      const prevEndPosition = prevBoard.position + prevBoard.width + gapBetweenBoards

      if (currentBoard.position < prevEndPosition) {
        // Overlap detected, adjust position
        currentBoard.position = prevEndPosition
      }
    }

    return sortedByPosition
  }

  private calculate() {
    const { product, clearances, materials } = this.config

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
    this.expressions.set('floorboard_gap', 0.125)
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
            metadata: `${cleat.type} cleat (${cleat.orientation}, ${cleat.length.toFixed(1)}" x ${cleatWidth}" x ${cleatThickness}")`
          })
        }
      }
    }
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

    return bom
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