// STEP AP242 Type Definitions
export interface STEPFile {
  content: string
  filename: string
  metadata: {
    version: string
    schema: string
    generatedAt: string
    standardsCompliance: string
    pmiIncluded: boolean
  }
}

export interface PMIAnnotations {
  dimensions: DimensionAnnotation[]
  geometricTolerances: GeometricTolerance[]
  surfaceFinish: SurfaceFinishSpec[]
  notes: ManufacturingNote[]
  datumFeatures: DatumFeature[]
}

export interface DimensionAnnotation {
  id: string
  type: 'DIMENSIONAL_SIZE' | 'DIMENSIONAL_LOCATION' | 'DIMENSIONAL_ANGLE'
  value: number
  tolerance?: {
    upperLimit: number
    lowerLimit: number
    unit: string
  }
  referencedGeometry: string[]
  semanticReference: string
  position: {
    x: number
    y: number
    z: number
  }
  orientation: {
    x: number
    y: number
    z: number
  }
  textStyle: {
    font: string
    size: number
    color: string
  }
}

export interface GeometricTolerance {
  id: string
  type: 'FLATNESS' | 'PERPENDICULARITY' | 'PARALLELISM' | 'CYLINDRICITY' | 'ROUNDNESS'
  tolerance: number
  datumReferences: string[]
  referencedGeometry: string[]
  semanticReference: string
  symbolGeometry: {
    position: { x: number; y: number; z: number }
    orientation: { x: number; y: number; z: number }
  }
}

export interface SurfaceFinishSpec {
  id: string
  surface: string
  roughness: number
  unit: string
  method: string
  referencedGeometry: string[]
  semanticReference: string
}

export interface ManufacturingNote {
  id: string
  text: string
  type: 'MANUFACTURING_NOTE' | 'ASSEMBLY_NOTE' | 'QUALITY_NOTE'
  referencedFeatures: string[]
  semanticReference: string
  leaderLines: {
    start: { x: number; y: number; z: number }
    end: { x: number; y: number; z: number }
  }[]
  textPosition: { x: number; y: number; z: number }
  textStyle: {
    font: string
    size: number
    color: string
  }
}

export interface DatumFeature {
  id: string
  name: string
  type: 'DATUM_PLANE' | 'DATUM_AXIS' | 'DATUM_POINT'
  referencedGeometry: string[]
  semanticReference: string
  position: { x: number; y: number; z: number }
  orientation: { x: number; y: number; z: number }
}

export interface STEPAP242Writer {
  addGeometry(geometry: any): Promise<string>
  addDimensionAnnotation(annotation: DimensionAnnotation): Promise<string>
  addGeometricTolerance(gtol: GeometricTolerance): Promise<string>
  addNote(note: ManufacturingNote): Promise<string>
  addMaterialProperties(properties: any): Promise<string>
  addManufacturingMetadata(metadata: any): Promise<string>
  write(): Promise<STEPFile>
}

export interface ManufacturingData {
  partNumbers: string[]
  bomData: any[]
  manufacturingInstructions: string[]
  qualityRequirements: string[]
}
