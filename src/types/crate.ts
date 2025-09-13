// Core domain types for AutoCrate
export interface CrateConfiguration {
  // Product specifications
  product: {
    length: number // inches
    width: number // inches
    height: number // inches
    weight: number // pounds
    centerOfGravity: {
      x: number
      y: number
      z: number
    }
  }
  
  // Clearances
  clearances: {
    width: number // inches
    length: number // inches
    height: number // inches
  }
  
  // Skid specifications
  skids: {
    overhang: {
      front: number // inches
      back: number // inches
    }
    count: number
    pitch: number // inches
  }
  
  // Material specifications
  materials: {
    lumber: {
      grade: 'Standard' | '#2' | '#1' | 'Select'
      treatment: 'Untreated' | 'Pressure Treated' | 'Fire Retardant'
    }
    plywood: {
      grade: 'CDX' | 'BC' | 'AC'
      thickness: number // inches
    }
    hardware: {
      coating: 'Galvanized' | 'Stainless Steel' | 'Zinc Plated'
    }
  }
  
  // Standards compliance
  standards: {
    appliedMaterials: boolean
    version: string
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  timestamp: Date
}

export interface ValidationError {
  code: string
  message: string
  field: string
  severity: 'error' | 'warning'
  appliedMaterialsStandard?: string
}

export interface ValidationWarning {
  code: string
  message: string
  field: string
  suggestion?: string
}

export interface CrateDimensions {
  overallWidth: number
  overallLength: number
  overallHeight: number
  internalWidth: number
  internalLength: number
  internalHeight: number
}

export interface BOMItem {
  id: string
  description: string
  quantity: number
  unit: string
  material: string
  dimensions?: {
    length?: number
    width?: number
    thickness?: number
  }
  cost?: number
}

export interface BillOfMaterials {
  items: BOMItem[]
  totalCost: number
  materialWaste: number // percentage
  generatedAt: Date
}

export interface ViewportState {
  camera: {
    position: [number, number, number]
    target: [number, number, number]
  }
  selectedComponents: string[]
  showDimensions: boolean
  showPMI: boolean
  showExploded: boolean
}

export interface ExportJob {
  id: string
  type: 'nx-expressions' | 'step-file' | 'pdf-drawing'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  downloadUrl?: string
  error?: string
  createdAt: Date
  completedAt?: Date
}

// Applied Materials Standards
export interface AppliedMaterialsStandards {
  version: string
  lumberGrades: {
    [weight: number]: string // weight threshold -> required grade
  }
  skidRequirements: {
    maxWeightPerSkid: number
    minOverhang: number
    maxOverhang: number
  }
  clearanceRequirements: {
    minWidth: number
    minLength: number
    minHeight: number
  }
  hardwareRequirements: {
    lagScrewPattern: string
    klimpSpacing: number
    washerRequirements: boolean
  }
}

// Default configuration
export const defaultCrateConfiguration: CrateConfiguration = {
  product: {
    length: 46,
    width: 38,
    height: 91.5,
    weight: 600,
    centerOfGravity: { x: 0, y: 0, z: 0 }
  },
  clearances: {
    width: 2,
    length: 2,
    height: 2
  },
  skids: {
    overhang: {
      front: 2,
      back: 2
    },
    count: 1,
    pitch: 16
  },
  materials: {
    lumber: {
      grade: 'Standard',
      treatment: 'Untreated'
    },
    plywood: {
      grade: 'CDX',
      thickness: 0.75
    },
    hardware: {
      coating: 'Galvanized'
    }
  },
  standards: {
    appliedMaterials: true,
    version: 'AMAT-0251-70054'
  }
}

// Applied Materials Standards Configuration
export const appliedMaterialsStandards: AppliedMaterialsStandards = {
  version: 'AMAT-0251-70054',
  lumberGrades: {
    0: 'Standard',
    1000: '#2',
    2000: '#1',
    3000: 'Select'
  },
  skidRequirements: {
    maxWeightPerSkid: 1000,
    minOverhang: 1,
    maxOverhang: 4
  },
  clearanceRequirements: {
    minWidth: 1,
    minLength: 1,
    minHeight: 1
  },
  hardwareRequirements: {
    lagScrewPattern: '16" OC',
    klimpSpacing: 24,
    washerRequirements: true
  }
}
