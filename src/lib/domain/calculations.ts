import { CrateConfiguration, CrateDimensions, BOMItem, BillOfMaterials } from '@/types/crate'

// Unit conversion utilities
export const convertInchesToFeet = (inches: number): number => inches / 12
export const convertFeetToInches = (feet: number): number => feet * 12
export const convertInchesToMillimeters = (inches: number): number => inches * 25.4
export const convertMillimetersToInches = (mm: number): number => mm / 25.4

// Calculate overall crate dimensions
export const calculateCrateDimensions = (config: CrateConfiguration): CrateDimensions => {
  const { product, clearances, skids } = config
  
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

// Calculate skid requirements based on product weight
export const calculateSkidRequirements = (config: CrateConfiguration) => {
  const { product, skids } = config
  const maxWeightPerSkid = 1000 // Applied Materials standard
  
  // Calculate required number of skids
  const requiredSkids = Math.ceil(product.weight / maxWeightPerSkid)
  
  // Calculate skid dimensions (standard 4x4 lumber)
  const skidWidth = 3.5 // Actual dimension of 4x4
  const skidLength = config.product.length + skids.overhang.front + skids.overhang.back
  
  return {
    count: Math.max(requiredSkids, skids.count),
    width: skidWidth,
    length: skidLength,
    pitch: skids.pitch,
    overhang: skids.overhang
  }
}

// Calculate lumber requirements for panels
export const calculatePanelRequirements = (config: CrateConfiguration) => {
  const dimensions = calculateCrateDimensions(config)
  
  // Standard lumber sizes (actual dimensions)
  const lumberSizes = {
    '2x4': { width: 3.5, thickness: 1.5 },
    '2x6': { width: 5.5, thickness: 1.5 },
    '2x8': { width: 7.25, thickness: 1.5 },
    '2x10': { width: 9.25, thickness: 1.5 },
    '2x12': { width: 11.25, thickness: 1.5 }
  }
  
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
      count: 2
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
  const cleatScrewCount = Math.ceil(dimensions.overallLength / 24) * 2 // Cleats every 2 feet
  
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
  const dimensions = calculateCrateDimensions(config)
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
      width: 3.5,
      thickness: 3.5
    }
  })
  
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
