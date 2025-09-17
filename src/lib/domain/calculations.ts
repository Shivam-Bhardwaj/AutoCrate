import { CrateConfiguration, CrateDimensions, BOMItem, BillOfMaterials } from '@/types/crate'

// Unit conversion utilities
export const convertInchesToFeet = (inches: number): number => inches / 12
export const convertFeetToInches = (feet: number): number => feet * 12
export const convertInchesToMillimeters = (inches: number): number => inches * 25.4
export const convertMillimetersToInches = (mm: number): number => mm / 25.4

// Calculate overall crate dimensions
export const calculateCrateDimensions = (config: CrateConfiguration): CrateDimensions => {
  const { product, clearances } = config
  
  // Calculate internal dimensions (product + clearances)
  const internalWidth = product.width + (clearances.width * 2)
  const internalLength = product.length + (clearances.length * 2)
  const internalHeight = product.height + clearances.height
  
  // Calculate overall dimensions (internal + wall thickness)
  // Standard wall thickness: 1.5" for lumber construction
  const wallThickness = 1.5
  const overallWidth = internalWidth + (wallThickness * 2)
  const overallLength = internalLength + (wallThickness * 2)
  const overallHeight = internalHeight + wallThickness // Only bottom wall thickness for height
  
  return {
    overallWidth,
    overallLength,
    overallHeight,
    internalWidth,
    internalLength,
    internalHeight
  }
}

const getSkidSpecification = (
  weight: number
): { width: number; height: number } => {
  if (weight < 500) {
    return { width: 3.5, height: 1.5 }
  }

  if (weight < 1000) {
    return { width: 3.5, height: 3.5 }
  }

  if (weight < 2000) {
    return { width: 5.5, height: 3.5 }
  }

  return { width: 5.5, height: 5.5 }
}

// Calculate skid requirements based on product weight
export const calculateSkidRequirements = (config: CrateConfiguration) => {
  const { product, skids } = config
  const maxWeightPerSkid = 1000 // Applied Materials standard

  const dimensions = calculateCrateDimensions(config)
  const specification = getSkidSpecification(product.weight)

  // Calculate required number of skids
  const requiredSkids = Math.ceil(product.weight / maxWeightPerSkid)
  let count = Math.max(requiredSkids, skids.count, 1)

  if (dimensions.overallWidth <= specification.width) {
    count = 1
  }

  // Calculate skid dimensions
  const skidWidth = specification.width
  const skidHeight = specification.height
  const skidLength = dimensions.overallLength + skids.overhang.front + skids.overhang.back
  const pitch = count > 1 ? skids.pitch : 0
  const positions = count === 1
    ? [0]
    : Array.from({ length: count }, (_, index) => {
        const offset = (count - 1) / 2
        return (index - offset) * pitch
      })

  return {
    count,
    width: skidWidth,
    height: skidHeight,
    length: skidLength,
    pitch,
    overhang: skids.overhang,
    positions
  }
}

// Calculate lumber requirements for panels
export const calculatePanelRequirements = (config: CrateConfiguration) => {
  const dimensions = calculateCrateDimensions(config)
  const sheetLength = 96 // Standard 8' plywood sheet length
  const sidePanelSheetCount = Math.max(1, Math.ceil(dimensions.overallLength / sheetLength))
  const sidePanelSplices = Math.max(0, sidePanelSheetCount - 1)
  const sidePanels = 2
  const sideCleatCount = sidePanelSplices * sidePanels
  const sideCleatLength = dimensions.overallHeight - config.materials.plywood.thickness

  // Calculate panel dimensions
  const panels = {
    // Bottom panel
    bottom: {
      width: dimensions.overallWidth,
      length: dimensions.overallLength,
      thickness: config.materials.plywood.thickness
    },
    // Side panels (2 pieces)
    sides: {
      width: dimensions.overallHeight,
      length: dimensions.overallLength,
      thickness: config.materials.plywood.thickness,
      count: sidePanels,
      sheetCount: sidePanelSheetCount,
      spliceCount: sidePanelSplices,
      cleats: {
        count: sideCleatCount,
        length: sideCleatLength,
        width: config.materials.lumber.width,
        thickness: config.materials.lumber.thickness
      }
    },
    // End panels (2 pieces)
    ends: {
      width: dimensions.overallHeight,
      length: dimensions.overallWidth,
      thickness: config.materials.plywood.thickness,
      count: 2
    },
    // Top panel
    top: {
      width: dimensions.overallWidth,
      length: dimensions.overallLength,
      thickness: config.materials.plywood.thickness
    }
  }
  
  return panels
}

// Calculate lumber requirements for framing
export const calculateFramingRequirements = (config: CrateConfiguration) => {
  const dimensions = calculateCrateDimensions(config)
  
  // Standard 2x4 framing
  const framingLumber = {
    // Bottom frame (perimeter)
    bottomFrame: {
      length: (dimensions.overallWidth * 2) + (dimensions.overallLength * 2),
      count: 1
    },
    // Corner posts (4 pieces)
    cornerPosts: {
      length: dimensions.overallHeight,
      count: 4
    },
    // Top frame (perimeter)
    topFrame: {
      length: (dimensions.overallWidth * 2) + (dimensions.overallLength * 2),
      count: 1
    },
    // Intermediate supports (based on length)
    intermediateSupports: {
      length: dimensions.overallHeight,
      count: Math.max(0, Math.floor(dimensions.overallLength / 48) - 1) // Every 4 feet
    }
  }
  
  return framingLumber
}

// Calculate hardware requirements
export const calculateHardwareRequirements = (config: CrateConfiguration) => {
  const dimensions = calculateCrateDimensions(config)
  const panels = calculatePanelRequirements(config)

  // Lag screws for framing (every 16" on center)
  const lagScrewSpacing = 16
  const lagScrewCount = Math.ceil((dimensions.overallWidth + dimensions.overallLength) * 2 / lagScrewSpacing) * 2 // Top and bottom frames

  // Klimp fasteners for panels (every 24" on center)
  const klimpSpacing = 24
  const panelPerimeter = (dimensions.overallWidth + dimensions.overallLength) * 2
  const klimpCount = Math.ceil(panelPerimeter / klimpSpacing) * 4 // 4 panels (sides and ends)
  
  // Flat washers (one per lag screw)
  const washerCount = lagScrewCount
  
  // Cleat screws (for internal cleats)
  const cleatData = panels.sides.cleats
  const screwsPerCleat = cleatData.count > 0
    ? Math.max(4, Math.ceil(cleatData.length / 16) * 2)
    : 0
  const cleatScrewCount = cleatData.count * screwsPerCleat

  return {
    lagScrews: {
      count: lagScrewCount,
      size: '1/2" x 4"',
      type: 'Lag Screw'
    },
    klimps: {
      count: klimpCount,
      size: '1/4" x 2"',
      type: 'Klimp Fastener'
    },
    washers: {
      count: washerCount,
      size: '1/2"',
      type: 'Flat Washer'
    },
    cleatScrews: {
      count: cleatScrewCount,
      size: '3/8" x 2"',
      type: 'Wood Screw'
    }
  }
}

// Generate complete Bill of Materials
export const generateBillOfMaterials = (config: CrateConfiguration): BillOfMaterials => {
  const panels = calculatePanelRequirements(config)
  const framing = calculateFramingRequirements(config)
  const hardware = calculateHardwareRequirements(config)
  const skids = calculateSkidRequirements(config)
  
  const items: BOMItem[] = []
  
  // Plywood panels
  items.push({
    id: 'plywood-bottom',
    description: `Plywood Panel - Bottom (${config.materials.plywood.grade})`,
    quantity: 1,
    unit: 'each',
    material: 'Plywood',
    dimensions: {
      length: panels.bottom.length,
      width: panels.bottom.width,
      thickness: panels.bottom.thickness
    }
  })
  
  items.push({
    id: 'plywood-sides',
    description: `Plywood Panel - Sides (${config.materials.plywood.grade})`,
    quantity: panels.sides.count,
    unit: 'each',
    material: 'Plywood',
    dimensions: {
      length: panels.sides.length,
      width: panels.sides.width,
      thickness: panels.sides.thickness
    }
  })
  
  items.push({
    id: 'plywood-ends',
    description: `Plywood Panel - Ends (${config.materials.plywood.grade})`,
    quantity: panels.ends.count,
    unit: 'each',
    material: 'Plywood',
    dimensions: {
      length: panels.ends.length,
      width: panels.ends.width,
      thickness: panels.ends.thickness
    }
  })
  
  items.push({
    id: 'plywood-top',
    description: `Plywood Panel - Top (${config.materials.plywood.grade})`,
    quantity: 1,
    unit: 'each',
    material: 'Plywood',
    dimensions: {
      length: panels.top.length,
      width: panels.top.width,
      thickness: panels.top.thickness
    }
  })
  
  // Framing lumber
  items.push({
    id: 'framing-2x4',
    description: `2x4 Framing Lumber (${config.materials.lumber.grade})`,
    quantity: Math.ceil((framing.bottomFrame.length + framing.topFrame.length + 
                        (framing.cornerPosts.length * framing.cornerPosts.count) +
                        (framing.intermediateSupports.length * framing.intermediateSupports.count)) / 96), // 8-foot lengths
    unit: 'each',
    material: 'Lumber',
    dimensions: {
      length: 96, // 8 feet
      width: 3.5,
      thickness: 1.5
    }
  })
  
  // Skids
  items.push({
    id: 'skid-lumber',
    description: `Skid Lumber (${config.materials.lumber.grade})`,
    quantity: Math.ceil((skids.length * skids.count) / 96), // 8-foot lengths
    unit: 'each',
    material: 'Lumber',
    dimensions: {
      length: 96, // 8 feet
      width: skids.width,
      thickness: skids.height
    }
  })

  if (panels.sides.cleats.count > 0) {
    items.push({
      id: 'side-cleats',
      description: `Side Panel Cleats (${config.materials.lumber.grade})`,
      quantity: panels.sides.cleats.count,
      unit: 'each',
      material: 'Lumber',
      dimensions: {
        length: panels.sides.cleats.length,
        width: panels.sides.cleats.width,
        thickness: panels.sides.cleats.thickness
      }
    })
  }
  
  // Hardware
  items.push({
    id: 'lag-screws',
    description: hardware.lagScrews.type,
    quantity: hardware.lagScrews.count,
    unit: 'each',
    material: config.materials.hardware.coating
  })
  
  items.push({
    id: 'klimps',
    description: hardware.klimps.type,
    quantity: hardware.klimps.count,
    unit: 'each',
    material: config.materials.hardware.coating
  })
  
  items.push({
    id: 'washers',
    description: hardware.washers.type,
    quantity: hardware.washers.count,
    unit: 'each',
    material: config.materials.hardware.coating
  })
  
  items.push({
    id: 'cleat-screws',
    description: hardware.cleatScrews.type,
    quantity: hardware.cleatScrews.count,
    unit: 'each',
    material: config.materials.hardware.coating
  })
  
  // Calculate material waste (estimated 10% for lumber, 5% for plywood)
  const lumberWaste = 0.10
  const plywoodWaste = 0.05
  const totalWaste = (lumberWaste + plywoodWaste) / 2 // Average
  
  return {
    items,
    totalCost: 0, // Will be calculated with pricing data
    materialWaste: totalWaste * 100, // Convert to percentage
    generatedAt: new Date()
  }
}

// Calculate material efficiency
export const calculateMaterialEfficiency = (config: CrateConfiguration): number => {
  const bom = generateBillOfMaterials(config)
  return 100 - bom.materialWaste // Efficiency percentage
}

// Calculate estimated weight of crate
export const calculateCrateWeight = (config: CrateConfiguration): number => {
  const bom = generateBillOfMaterials(config)
  
  // Estimated weights (pounds per cubic foot)
  const materialWeights = {
    'Plywood': 2.5, // CDX plywood
    'Lumber': 2.8,  // Softwood lumber
    'Hardware': 0.1 // Minimal weight
  }
  
  let totalWeight = 0
  
  for (const item of bom.items) {
    if (item.dimensions) {
      const volume = (item.dimensions.length || 0) * 
                    (item.dimensions.width || 0) * 
                    (item.dimensions.thickness || 0) / 144 // Convert to cubic feet
      const weight = volume * (materialWeights[item.material as keyof typeof materialWeights] || 0)
      totalWeight += weight * item.quantity
    }
  }
  
  return totalWeight
}
