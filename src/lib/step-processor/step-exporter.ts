import { CrateConfiguration } from '@/types/crate'
import { releaseIdentity } from '@/config/release'
import { PMIAnnotations, STEPFile, STEPAP242Writer, DimensionAnnotation, GeometricTolerance, ManufacturingNote, ManufacturingData } from './step-types'

export class STEPExporter {
  async exportWithPMI(config: CrateConfiguration, annotations: PMIAnnotations): Promise<STEPFile> {
    const timestamp = new Date().toISOString()
    const filename = `autocrate_assembly_${timestamp.split('T')[0]}.stp`
    
    // Initialize STEP AP242 writer
    const stepWriter = new STEPAP242WriterImpl()
    
    // Add geometric model
    const geometryId = await stepWriter.addGeometry(config)
    
    // Add semantic PMI annotations
    for (const annotation of annotations.dimensions) {
      await stepWriter.addDimensionAnnotation(annotation)
    }

    // Add geometric tolerances (GD&T)
    for (const gtol of annotations.geometricTolerances) {
      await stepWriter.addGeometricTolerance(gtol)
    }

    // Add manufacturing notes with semantic references
    for (const note of annotations.notes) {
      await stepWriter.addNote(note)
    }

    // Add material specifications
    await stepWriter.addMaterialProperties({
      materials: [{
        name: config.materials.lumber.grade,
        density: 0.5, // Typical lumber density
        properties: {
          grade: config.materials.lumber.grade,
          treatment: config.materials.lumber.treatment,
          thickness: config.materials.lumber.thickness,
          width: config.materials.lumber.width
        },
        compliance: config.standards.version
      }, {
        name: config.materials.plywood.grade,
        density: 0.6, // Typical plywood density
        properties: {
          grade: config.materials.plywood.grade,
          thickness: config.materials.plywood.thickness
        },
        compliance: config.standards.version
      }]
    })

    // Add manufacturing metadata
    const manufacturingData: ManufacturingData = {
      partNumbers: [`CRATE-${config.product.length}x${config.product.width}x${config.product.height}`],
      bomData: [],
      manufacturingInstructions: annotations.notes.map(note => note.text),
      qualityRequirements: annotations.notes.filter(note => note.type === 'QUALITY_NOTE').map(note => note.text)
    }
    
    await stepWriter.addManufacturingMetadata(manufacturingData)

    return await stepWriter.write()
  }
}

class STEPAP242WriterImpl implements STEPAP242Writer {
  private entities: string[] = []
  private entityCounter = 1

  async addGeometry(config: CrateConfiguration): Promise<string> {
    const geometryId = `#${this.entityCounter++}`
    
    // Add basic geometric entities for the crate
    this.entities.push(`${geometryId} = CARTESIAN_POINT('Crate Origin',(0.0,0.0,0.0));`)
    
    // Add product geometry
    const productId = `#${this.entityCounter++}`
    this.entities.push(`${productId} = CARTESIAN_POINT('Product Dimensions',(${config.product.length},${config.product.width},${config.product.height}));`)
    
    // Add center of gravity
    const cogId = `#${this.entityCounter++}`
    this.entities.push(`${cogId} = CARTESIAN_POINT('Center of Gravity',(${config.product.centerOfGravity.x},${config.product.centerOfGravity.y},${config.product.centerOfGravity.z}));`)
    
    return geometryId
  }

  async addDimensionAnnotation(annotation: DimensionAnnotation): Promise<string> {
    const annotationId = `#${this.entityCounter++}`
    
    // Add dimensional annotation entity
    this.entities.push(`${annotationId} = DIMENSIONAL_SIZE('${annotation.id}',${annotation.value},'${annotation.type}');`)
    
    // Add tolerance if specified
    if (annotation.tolerance) {
      const toleranceId = `#${this.entityCounter++}`
      this.entities.push(`${toleranceId} = TOLERANCE_VALUE('${annotation.id}_TOL',${annotation.tolerance.upperLimit},${annotation.tolerance.lowerLimit},'${annotation.tolerance.unit}');`)
    }
    
    // Add semantic reference
    const semanticId = `#${this.entityCounter++}`
    this.entities.push(`${semanticId} = SEMANTIC_REFERENCE('${annotation.semanticReference}','${annotation.id}');`)
    
    return annotationId
  }

  async addGeometricTolerance(gtol: GeometricTolerance): Promise<string> {
    const gtolId = `#${this.entityCounter++}`
    
    // Add geometric tolerance entity
    this.entities.push(`${gtolId} = GEOMETRIC_TOLERANCE('${gtol.id}','${gtol.type}',${gtol.tolerance});`)
    
    // Add datum references
    for (const datumRef of gtol.datumReferences) {
      const datumId = `#${this.entityCounter++}`
      this.entities.push(`${datumId} = DATUM_REFERENCE('${datumRef}','${gtol.id}');`)
    }
    
    // Add semantic reference
    const semanticId = `#${this.entityCounter++}`
    this.entities.push(`${semanticId} = SEMANTIC_REFERENCE('${gtol.semanticReference}','${gtol.id}');`)
    
    return gtolId
  }

  async addNote(note: ManufacturingNote): Promise<string> {
    const noteId = `#${this.entityCounter++}`
    
    // Add note entity
    this.entities.push(`${noteId} = MANUFACTURING_NOTE('${note.id}','${note.text.replace(/'/g, "''")}','${note.type}');`)
    
    // Add semantic reference
    const semanticId = `#${this.entityCounter++}`
    this.entities.push(`${semanticId} = SEMANTIC_REFERENCE('${note.semanticReference}','${note.id}');`)
    
    return noteId
  }

  async addMaterialProperties(properties: any): Promise<string> {
    const materialId = `#${this.entityCounter++}`
    
    // Add material properties
    for (const material of properties.materials) {
      const matId = `#${this.entityCounter++}`
      this.entities.push(`${matId} = MATERIAL_PROPERTY('${material.name}',${material.density},'${material.compliance}');`)
    }
    
    return materialId
  }

  async addManufacturingMetadata(metadata: ManufacturingData): Promise<string> {
    const metadataId = `#${this.entityCounter++}`
    
    // Add part numbers
    for (const partNumber of metadata.partNumbers) {
      const partId = `#${this.entityCounter++}`
      this.entities.push(`${partId} = PART_NUMBER('${partNumber}');`)
    }
    
    // Add manufacturing instructions
    for (const instruction of metadata.manufacturingInstructions) {
      const instId = `#${this.entityCounter++}`
      this.entities.push(`${instId} = MANUFACTURING_INSTRUCTION('${instruction.replace(/'/g, "''")}');`)
    }
    
    return metadataId
  }

  async write(): Promise<STEPFile> {
    const timestamp = new Date().toISOString()
    const filename = `autocrate_assembly_${timestamp.split('T')[0]}.stp`
    
    // Build complete STEP file content
    const stepContent = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('AutoCrate STEP Export with PMI'),'2;1');
FILE_NAME('${filename}','${timestamp}',('${releaseIdentity.label}'),('Applied Materials'),'','','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;

DATA;
/* AutoCrate Configuration Data with PMI Annotations */
/* Generated: ${timestamp} */
/* Standard: AMAT-0251-70054 */
/* Version: ${releaseIdentity.version} */
/* STEP Version: AP242 */
/* PMI Included: TRUE */

${this.entities.join('\n')}

ENDSEC;
END-ISO-10303-21;
`

    return {
      content: stepContent,
      filename: filename,
      metadata: {
        version: releaseIdentity.version,
        schema: 'AUTOMOTIVE_DESIGN',
        generatedAt: timestamp,
        standardsCompliance: 'AMAT-0251-70054',
        pmiIncluded: true
      }
    }
  }
}
