import { 
  CrateConfiguration, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  appliedMaterialsStandards 
} from '@/types/crate'
import { calculateCrateDimensions, calculateSkidRequirements } from './calculations'

// Validation rule types
interface ValidationRule {
  code: string
  message: string
  field: string
  severity: 'error' | 'warning'
  validate: (config: CrateConfiguration) => boolean
  appliedMaterialsStandard?: string
}

interface ValidationWarningRule {
  code: string
  message: string
  field: string
  suggestion?: string
  validate: (config: CrateConfiguration) => boolean
}

// Core validation rules
const validationRules: ValidationRule[] = [
  {
    code: 'INVALID_PRODUCT_DIMENSIONS',
    message: 'Product dimensions must be positive values',
    field: 'product',
    severity: 'error',
    validate: (config) => 
      config.product.length > 0 && 
      config.product.width > 0 && 
      config.product.height > 0
  },
  {
    code: 'INVALID_PRODUCT_WEIGHT',
    message: 'Product weight must be greater than 0',
    field: 'product.weight',
    severity: 'error',
    validate: (config) => config.product.weight > 0
  },
  {
    code: 'INSUFFICIENT_CLEARANCE_WIDTH',
    message: `Width clearance must be at least ${appliedMaterialsStandards.clearanceRequirements.minWidth}"`,
    field: 'clearances.width',
    severity: 'error',
    validate: (config) => config.clearances.width >= appliedMaterialsStandards.clearanceRequirements.minWidth,
    appliedMaterialsStandard: appliedMaterialsStandards.version
  },
  {
    code: 'INSUFFICIENT_CLEARANCE_LENGTH',
    message: `Length clearance must be at least ${appliedMaterialsStandards.clearanceRequirements.minLength}"`,
    field: 'clearances.length',
    severity: 'error',
    validate: (config) => config.clearances.length >= appliedMaterialsStandards.clearanceRequirements.minLength,
    appliedMaterialsStandard: appliedMaterialsStandards.version
  },
  {
    code: 'INSUFFICIENT_CLEARANCE_HEIGHT',
    message: `Height clearance must be at least ${appliedMaterialsStandards.clearanceRequirements.minHeight}"`,
    field: 'clearances.height',
    severity: 'error',
    validate: (config) => config.clearances.height >= appliedMaterialsStandards.clearanceRequirements.minHeight,
    appliedMaterialsStandard: appliedMaterialsStandards.version
  },
  {
    code: 'INSUFFICIENT_OVERHANG_FRONT',
    message: `Front overhang must be at least ${appliedMaterialsStandards.skidRequirements.minOverhang}"`,
    field: 'skids.overhang.front',
    severity: 'error',
    validate: (config) => config.skids.overhang.front >= appliedMaterialsStandards.skidRequirements.minOverhang,
    appliedMaterialsStandard: appliedMaterialsStandards.version
  },
  {
    code: 'INSUFFICIENT_OVERHANG_BACK',
    message: `Back overhang must be at least ${appliedMaterialsStandards.skidRequirements.minOverhang}"`,
    field: 'skids.overhang.back',
    severity: 'error',
    validate: (config) => config.skids.overhang.back >= appliedMaterialsStandards.skidRequirements.minOverhang,
    appliedMaterialsStandard: appliedMaterialsStandards.version
  },
  {
    code: 'EXCESSIVE_OVERHANG_FRONT',
    message: `Front overhang must not exceed ${appliedMaterialsStandards.skidRequirements.maxOverhang}"`,
    field: 'skids.overhang.front',
    severity: 'error',
    validate: (config) => config.skids.overhang.front <= appliedMaterialsStandards.skidRequirements.maxOverhang,
    appliedMaterialsStandard: appliedMaterialsStandards.version
  },
  {
    code: 'EXCESSIVE_OVERHANG_BACK',
    message: `Back overhang must not exceed ${appliedMaterialsStandards.skidRequirements.maxOverhang}"`,
    field: 'skids.overhang.back',
    severity: 'error',
    validate: (config) => config.skids.overhang.back <= appliedMaterialsStandards.skidRequirements.maxOverhang,
    appliedMaterialsStandard: appliedMaterialsStandards.version
  }
]

// Warning rules
const warningRules: ValidationWarningRule[] = [
  {
    code: 'HEAVY_PRODUCT_SINGLE_SKID',
    message: 'Product weight exceeds recommended single skid capacity',
    field: 'product.weight',
    suggestion: 'Consider using multiple skids or higher grade lumber',
    validate: (config) => config.product.weight > appliedMaterialsStandards.skidRequirements.maxWeightPerSkid
  },
  {
    code: 'LARGE_CRATE_DIMENSIONS',
    message: 'Crate dimensions are very large',
    field: 'dimensions',
    suggestion: 'Consider modular design or special handling requirements',
    validate: (config) => {
      const dimensions = calculateCrateDimensions(config)
      return dimensions.overallWidth > 96 || dimensions.overallLength > 96 || dimensions.overallHeight > 96
    }
  },
  {
    code: 'MINIMAL_CLEARANCE',
    message: 'Clearances are at minimum required values',
    field: 'clearances',
    suggestion: 'Consider increasing clearances for easier handling',
    validate: (config) => 
      config.clearances.width === appliedMaterialsStandards.clearanceRequirements.minWidth &&
      config.clearances.length === appliedMaterialsStandards.clearanceRequirements.minLength &&
      config.clearances.height === appliedMaterialsStandards.clearanceRequirements.minHeight
  }
]

// Lumber grade validation based on weight
const validateLumberGrade = (config: CrateConfiguration): ValidationError | null => {
  const { product, materials } = config
  
  // Determine required lumber grade based on weight
  const weightThresholds = Object.entries(appliedMaterialsStandards.lumberGrades)
    .sort(([a], [b]) => Number(b) - Number(a))
  
  const requiredGrade = weightThresholds.find(([weight]) => 
    product.weight >= Number(weight)
  )?.[1]
  
  if (requiredGrade && materials.lumber.grade !== requiredGrade) {
    return {
      code: 'INSUFFICIENT_LUMBER_GRADE',
      message: `Product weight of ${product.weight} lbs requires ${requiredGrade} lumber grade`,
      field: 'materials.lumber.grade',
      severity: 'error' as const,
      appliedMaterialsStandard: appliedMaterialsStandards.version
    }
  }
  
  return null
}

// Skid count validation
const validateSkidCount = (config: CrateConfiguration): ValidationError | null => {
  const skidRequirements = calculateSkidRequirements(config)
  
  if (config.skids.count < skidRequirements.count) {
    return {
      code: 'INSUFFICIENT_SKID_COUNT',
      message: `Product weight requires at least ${skidRequirements.count} skids`,
      field: 'skids.count',
      severity: 'error' as const,
      appliedMaterialsStandard: appliedMaterialsStandards.version
    }
  }
  
  return null
}

// Center of gravity validation
const validateCenterOfGravity = (config: CrateConfiguration): ValidationError | null => {
  const { product } = config
  const { centerOfGravity } = product
  
  // Check if center of gravity is within product bounds
  if (centerOfGravity.x < 0 || centerOfGravity.x > product.length ||
      centerOfGravity.y < 0 || centerOfGravity.y > product.width ||
      centerOfGravity.z < 0 || centerOfGravity.z > product.height) {
    return {
      code: 'INVALID_CENTER_OF_GRAVITY',
      message: 'Center of gravity must be within product dimensions',
      field: 'product.centerOfGravity',
      severity: 'error' as const
    }
  }
  
  return null
}

// Main validation function
export const validateCrateConfiguration = (config: CrateConfiguration): ValidationResult => {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Run core validation rules
  for (const rule of validationRules) {
    if (!rule.validate(config)) {
      const error: ValidationError = {
        code: rule.code,
        message: rule.message,
        field: rule.field,
        severity: rule.severity
      }
      if (rule.appliedMaterialsStandard) {
        error.appliedMaterialsStandard = rule.appliedMaterialsStandard
      }
      errors.push(error)
    }
  }
  
  // Run warning rules
  for (const rule of warningRules) {
    if (rule.validate(config)) {
      const warning: ValidationWarning = {
        code: rule.code,
        message: rule.message,
        field: rule.field
      }
      if (rule.suggestion) {
        warning.suggestion = rule.suggestion
      }
      warnings.push(warning)
    }
  }
  
  // Run specialized validations
  const lumberGradeError = validateLumberGrade(config)
  if (lumberGradeError) {
    errors.push(lumberGradeError)
  }
  
  const skidCountError = validateSkidCount(config)
  if (skidCountError) {
    errors.push(skidCountError)
  }
  
  const cogError = validateCenterOfGravity(config)
  if (cogError) {
    errors.push(cogError)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    timestamp: new Date()
  }
}

// Real-time validation for specific fields
export const validateField = (config: CrateConfiguration, field: string): ValidationError[] => {
  const fullValidation = validateCrateConfiguration(config)
  
  return fullValidation.errors.filter(error => 
    error.field === field || error.field.startsWith(field + '.')
  )
}

// Get validation explanation for a specific error
export const getValidationExplanation = (errorCode: string): string => {
  const explanations: Record<string, string> = {
    'INVALID_PRODUCT_DIMENSIONS': 'Product dimensions must be positive values to ensure proper crate sizing.',
    'INVALID_PRODUCT_WEIGHT': 'Product weight must be greater than zero for structural calculations.',
    'INSUFFICIENT_CLEARANCE_WIDTH': 'Width clearance ensures the product fits properly and allows for handling.',
    'INSUFFICIENT_CLEARANCE_LENGTH': 'Length clearance ensures the product fits properly and allows for handling.',
    'INSUFFICIENT_CLEARANCE_HEIGHT': 'Height clearance ensures the product fits properly and allows for handling.',
    'INSUFFICIENT_OVERHANG_FRONT': 'Front overhang provides proper support and handling clearance.',
    'INSUFFICIENT_OVERHANG_BACK': 'Back overhang provides proper support and handling clearance.',
    'EXCESSIVE_OVERHANG_FRONT': 'Excessive front overhang can cause structural issues and handling problems.',
    'EXCESSIVE_OVERHANG_BACK': 'Excessive back overhang can cause structural issues and handling problems.',
    'INSUFFICIENT_LUMBER_GRADE': 'Lumber grade must match the structural requirements based on product weight.',
    'INSUFFICIENT_SKID_COUNT': 'Number of skids must support the total product weight safely.',
    'INVALID_CENTER_OF_GRAVITY': 'Center of gravity must be within the product dimensions for stability.'
  }
  
  return explanations[errorCode] || 'This validation ensures compliance with engineering standards.'
}

// Performance-optimized validation for real-time updates
export const validateConfigurationFast = (config: CrateConfiguration): ValidationResult => {
  // Use a simplified validation for real-time updates
  const errors: ValidationError[] = []
  
  // Only check critical validations for performance
  if (config.product.weight <= 0) {
    errors.push({
      code: 'INVALID_PRODUCT_WEIGHT',
      message: 'Product weight must be greater than 0',
      field: 'product.weight',
      severity: 'error'
    })
  }
  
  if (config.clearances.width < appliedMaterialsStandards.clearanceRequirements.minWidth) {
    errors.push({
      code: 'INSUFFICIENT_CLEARANCE_WIDTH',
      message: `Width clearance must be at least ${appliedMaterialsStandards.clearanceRequirements.minWidth}"`,
      field: 'clearances.width',
      severity: 'error',
      appliedMaterialsStandard: appliedMaterialsStandards.version
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
    timestamp: new Date()
  }
}
