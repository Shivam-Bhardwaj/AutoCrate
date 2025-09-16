import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import { PMIAnnotations, DimensionAnnotation, GeometricTolerance, ManufacturingNote, DatumFeature } from './step-types'
import { calculateSkidRequirements } from '@/lib/domain/calculations'

export function generatePMIAnnotations(config: CrateConfiguration, dimensions: CrateDimensions): PMIAnnotations {
  const annotations: PMIAnnotations = {
    dimensions: generateDimensionAnnotations(config, dimensions),
    geometricTolerances: generateGeometricTolerances(config, dimensions),
    surfaceFinish: generateSurfaceFinishSpecs(config),
    notes: generateManufacturingNotes(config, dimensions),
    datumFeatures: generateDatumFeatures(config, dimensions)
  }

  return annotations
}

function generateDimensionAnnotations(config: CrateConfiguration, dimensions: CrateDimensions): DimensionAnnotation[] {
  const dimensions_list: DimensionAnnotation[] = []

  // Product dimensions
  dimensions_list.push({
    id: 'DIM_PRODUCT_LENGTH',
    type: 'DIMENSIONAL_SIZE',
    value: config.product.length,
    tolerance: {
      upperLimit: config.product.length + 0.125,
      lowerLimit: config.product.length - 0.125,
      unit: 'INCH'
    },
    referencedGeometry: ['PRODUCT_FACE_LENGTH_1', 'PRODUCT_FACE_LENGTH_2'],
    semanticReference: 'PRODUCT_OVERALL_LENGTH',
    position: { x: config.product.length / 2, y: 0, z: config.product.height + 2 },
    orientation: { x: 0, y: 0, z: 1 },
    textStyle: {
      font: 'Arial',
      size: 0.25,
      color: 'BLACK'
    }
  })

  dimensions_list.push({
    id: 'DIM_PRODUCT_WIDTH',
    type: 'DIMENSIONAL_SIZE',
    value: config.product.width,
    tolerance: {
      upperLimit: config.product.width + 0.125,
      lowerLimit: config.product.width - 0.125,
      unit: 'INCH'
    },
    referencedGeometry: ['PRODUCT_FACE_WIDTH_1', 'PRODUCT_FACE_WIDTH_2'],
    semanticReference: 'PRODUCT_OVERALL_WIDTH',
    position: { x: 0, y: config.product.width / 2, z: config.product.height + 2 },
    orientation: { x: 0, y: 0, z: 1 },
    textStyle: {
      font: 'Arial',
      size: 0.25,
      color: 'BLACK'
    }
  })

  dimensions_list.push({
    id: 'DIM_PRODUCT_HEIGHT',
    type: 'DIMENSIONAL_SIZE',
    value: config.product.height,
    tolerance: {
      upperLimit: config.product.height + 0.125,
      lowerLimit: config.product.height - 0.125,
      unit: 'INCH'
    },
    referencedGeometry: ['PRODUCT_FACE_BOTTOM', 'PRODUCT_FACE_TOP'],
    semanticReference: 'PRODUCT_OVERALL_HEIGHT',
    position: { x: -2, y: 0, z: config.product.height / 2 },
    orientation: { x: 0, y: 1, z: 0 },
    textStyle: {
      font: 'Arial',
      size: 0.25,
      color: 'BLACK'
    }
  })

  // Crate dimensions
  dimensions_list.push({
    id: 'DIM_CRATE_LENGTH',
    type: 'DIMENSIONAL_SIZE',
    value: dimensions.overallLength,
    tolerance: {
      upperLimit: dimensions.overallLength + 0.25,
      lowerLimit: dimensions.overallLength - 0.25,
      unit: 'INCH'
    },
    referencedGeometry: ['CRATE_FACE_LENGTH_1', 'CRATE_FACE_LENGTH_2'],
    semanticReference: 'CRATE_OVERALL_LENGTH',
    position: { x: dimensions.overallLength / 2, y: 0, z: dimensions.overallHeight + 2 },
    orientation: { x: 0, y: 0, z: 1 },
    textStyle: {
      font: 'Arial',
      size: 0.25,
      color: 'BLACK'
    }
  })

  dimensions_list.push({
    id: 'DIM_CRATE_WIDTH',
    type: 'DIMENSIONAL_SIZE',
    value: dimensions.overallWidth,
    tolerance: {
      upperLimit: dimensions.overallWidth + 0.25,
      lowerLimit: dimensions.overallWidth - 0.25,
      unit: 'INCH'
    },
    referencedGeometry: ['CRATE_FACE_WIDTH_1', 'CRATE_FACE_WIDTH_2'],
    semanticReference: 'CRATE_OVERALL_WIDTH',
    position: { x: 0, y: dimensions.overallWidth / 2, z: dimensions.overallHeight + 2 },
    orientation: { x: 0, y: 0, z: 1 },
    textStyle: {
      font: 'Arial',
      size: 0.25,
      color: 'BLACK'
    }
  })

  dimensions_list.push({
    id: 'DIM_CRATE_HEIGHT',
    type: 'DIMENSIONAL_SIZE',
    value: dimensions.overallHeight,
    tolerance: {
      upperLimit: dimensions.overallHeight + 0.25,
      lowerLimit: dimensions.overallHeight - 0.25,
      unit: 'INCH'
    },
    referencedGeometry: ['CRATE_FACE_BOTTOM', 'CRATE_FACE_TOP'],
    semanticReference: 'CRATE_OVERALL_HEIGHT',
    position: { x: -2, y: 0, z: dimensions.overallHeight / 2 },
    orientation: { x: 0, y: 1, z: 0 },
    textStyle: {
      font: 'Arial',
      size: 0.25,
      color: 'BLACK'
    }
  })

  // Clearance dimensions
  dimensions_list.push({
    id: 'DIM_CLEARANCE_WIDTH',
    type: 'DIMENSIONAL_SIZE',
    value: config.clearances.width,
    referencedGeometry: ['CLEARANCE_FACE_WIDTH_1', 'CLEARANCE_FACE_WIDTH_2'],
    semanticReference: 'INTERNAL_CLEARANCE_WIDTH',
    position: { x: 0, y: config.clearances.width / 2, z: config.product.height / 2 },
    orientation: { x: 0, y: 0, z: 1 },
    textStyle: {
      font: 'Arial',
      size: 0.2,
      color: 'BLUE'
    }
  })

  dimensions_list.push({
    id: 'DIM_CLEARANCE_LENGTH',
    type: 'DIMENSIONAL_SIZE',
    value: config.clearances.length,
    referencedGeometry: ['CLEARANCE_FACE_LENGTH_1', 'CLEARANCE_FACE_LENGTH_2'],
    semanticReference: 'INTERNAL_CLEARANCE_LENGTH',
    position: { x: config.clearances.length / 2, y: 0, z: config.product.height / 2 },
    orientation: { x: 0, y: 0, z: 1 },
    textStyle: {
      font: 'Arial',
      size: 0.2,
      color: 'BLUE'
    }
  })

  dimensions_list.push({
    id: 'DIM_CLEARANCE_HEIGHT',
    type: 'DIMENSIONAL_SIZE',
    value: config.clearances.height,
    referencedGeometry: ['CLEARANCE_FACE_BOTTOM', 'CLEARANCE_FACE_TOP'],
    semanticReference: 'INTERNAL_CLEARANCE_HEIGHT',
    position: { x: -1, y: 0, z: config.clearances.height / 2 },
    orientation: { x: 0, y: 1, z: 0 },
    textStyle: {
      font: 'Arial',
      size: 0.2,
      color: 'BLUE'
    }
  })

  return dimensions_list
}

function generateGeometricTolerances(config: CrateConfiguration, dimensions: CrateDimensions): GeometricTolerance[] {
  const tolerances: GeometricTolerance[] = []

  // Skid flatness tolerance
  tolerances.push({
    id: 'GTOL_SKID_FLATNESS',
    type: 'FLATNESS',
    tolerance: 0.125,
    datumReferences: [],
    referencedGeometry: ['SKID_TOP_SURFACE'],
    semanticReference: 'SKID_FLATNESS_REQUIREMENT',
    symbolGeometry: {
      position: { x: 0, y: 0, z: 0.5 },
      orientation: { x: 0, y: 0, z: 1 }
    }
  })

  // Panel perpendicularity tolerance
  tolerances.push({
    id: 'GTOL_PANEL_PERPENDICULARITY',
    type: 'PERPENDICULARITY',
    tolerance: 0.25,
    datumReferences: ['DATUM_A'],
    referencedGeometry: ['SIDE_PANEL_INTERNAL_FACE'],
    semanticReference: 'PANEL_PERPENDICULARITY_REQUIREMENT',
    symbolGeometry: {
      position: { x: 0, y: 0, z: 0.5 },
      orientation: { x: 0, y: 0, z: 1 }
    }
  })

  return tolerances
}

function generateManufacturingNotes(config: CrateConfiguration, dimensions: CrateDimensions): ManufacturingNote[] {
  const notes: ManufacturingNote[] = []
  const skidRequirements = calculateSkidRequirements(config)

  // Material specifications note
  notes.push({
    id: 'NOTE_MATERIAL_SPECS',
    text: `MATERIAL SPECIFICATIONS:
- Lumber Grade: ${config.materials.lumber.grade}
- Lumber Treatment: ${config.materials.lumber.treatment}
- Plywood Grade: ${config.materials.plywood.grade}
- Hardware Coating: ${config.materials.hardware.coating}
- Standards Compliance: ${config.standards.version}`,
    type: 'MANUFACTURING_NOTE',
    referencedFeatures: ['ALL_COMPONENTS'],
    semanticReference: 'MATERIAL_SPECIFICATION_REQUIREMENTS',
    leaderLines: [],
    textPosition: { x: -5, y: -5, z: dimensions.overallHeight + 1 },
    textStyle: {
      font: 'Arial',
      size: 0.2,
      color: 'BLACK'
    }
  })

  // Assembly instructions note
  notes.push({
    id: 'NOTE_ASSEMBLY_INSTRUCTIONS',
    text: `ASSEMBLY INSTRUCTIONS:
1. Install skids with ${skidRequirements.count} count at ${skidRequirements.pitch.toFixed(2)}" pitch
2. Front overhang: ${config.skids.overhang.front}", Back overhang: ${config.skids.overhang.back}"
3. Fasten with lag screws per Applied Materials standard
4. Verify clearances: W=${config.clearances.width}", L=${config.clearances.length}", H=${config.clearances.height}"`,
    type: 'ASSEMBLY_NOTE',
    referencedFeatures: ['SKID_ASSEMBLY', 'PANEL_ASSEMBLY'],
    semanticReference: 'ASSEMBLY_PROCEDURE_REQUIREMENTS',
    leaderLines: [],
    textPosition: { x: -5, y: 5, z: dimensions.overallHeight + 1 },
    textStyle: {
      font: 'Arial',
      size: 0.2,
      color: 'BLACK'
    }
  })

  // Quality requirements note
  notes.push({
    id: 'NOTE_QUALITY_REQUIREMENTS',
    text: `QUALITY REQUIREMENTS:
- Product weight: ${config.product.weight} lbs
- Center of gravity: X=${config.product.centerOfGravity.x}, Y=${config.product.centerOfGravity.y}, Z=${config.product.centerOfGravity.z}
- Structural integrity per Applied Materials standards
- All fasteners to be properly torqued`,
    type: 'QUALITY_NOTE',
    referencedFeatures: ['STRUCTURAL_COMPONENTS'],
    semanticReference: 'QUALITY_ASSURANCE_REQUIREMENTS',
    leaderLines: [],
    textPosition: { x: 5, y: -5, z: dimensions.overallHeight + 1 },
    textStyle: {
      font: 'Arial',
      size: 0.2,
      color: 'BLACK'
    }
  })

  return notes
}

function generateDatumFeatures(config: CrateConfiguration, dimensions: CrateDimensions): DatumFeature[] {
  const datums: DatumFeature[] = []

  // Primary datum (bottom of crate)
  datums.push({
    id: 'DATUM_A',
    name: 'A',
    type: 'DATUM_PLANE',
    referencedGeometry: ['CRATE_BOTTOM_SURFACE'],
    semanticReference: 'PRIMARY_DATUM_PLANE',
    position: { x: 0, y: 0, z: 0 },
    orientation: { x: 0, y: 0, z: 1 }
  })

  // Secondary datum (front face)
  datums.push({
    id: 'DATUM_B',
    name: 'B',
    type: 'DATUM_PLANE',
    referencedGeometry: ['CRATE_FRONT_SURFACE'],
    semanticReference: 'SECONDARY_DATUM_PLANE',
    position: { x: 0, y: 0, z: 0 },
    orientation: { x: 1, y: 0, z: 0 }
  })

  // Tertiary datum (left face)
  datums.push({
    id: 'DATUM_C',
    name: 'C',
    type: 'DATUM_PLANE',
    referencedGeometry: ['CRATE_LEFT_SURFACE'],
    semanticReference: 'TERTIARY_DATUM_PLANE',
    position: { x: 0, y: 0, z: 0 },
    orientation: { x: 0, y: 1, z: 0 }
  })

  return datums
}

function generateSurfaceFinishSpecs(config: CrateConfiguration) {
  // Surface finish specifications would be generated based on material requirements
  // For now, return empty array as this is typically handled by material specifications
  return []
}
