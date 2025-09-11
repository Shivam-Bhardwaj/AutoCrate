import * as THREE from 'three';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { CrateConfiguration } from '@/types/crate';
import type { NXExportOptions } from '@/types/nx';

/**
 * STEP file exporter for AutoCrate components
 * Generates ISO 10303-214 compliant STEP files for CAD import
 */
export class STEPExporter {
  private config: CrateConfiguration;
  private options: NXExportOptions;
  private stepId: number = 1;

  constructor(config: CrateConfiguration, options: NXExportOptions) {
    this.config = config;
    this.options = options;
  }

  /**
   * Export the complete crate as STEP files
   */
  async exportSTEP(): Promise<void> {
    try {
      if (this.options.includeAssembly) {
        // Export as assembly with multiple part files
        await this.exportAssembly();
      } else {
        // Export as single merged part
        await this.exportSinglePart();
      }
    } catch (error) {
      console.error('STEP Export failed:', error);
      throw new Error(`STEP Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export as assembly with separate STEP files for each component
   */
  private async exportAssembly(): Promise<void> {
    const zip = new JSZip();

    // Generate individual component STEP files
    const components = this.generateComponents();
    
    for (const component of components) {
      const stepContent = this.generateSTEPFile(component);
      zip.file(`${component.fileName}.stp`, stepContent);
    }

    // Generate main assembly STEP file
    const assemblyContent = this.generateAssemblySTEP(components);
    zip.file(`${this.generatePartNumber()}_Assembly.stp`, assemblyContent);

    // Export as ZIP archive
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${this.generatePartNumber()}_STEP_Assembly.zip`);
  }

  /**
   * Export as single merged STEP part
   */
  private async exportSinglePart(): Promise<void> {
    const components = this.generateComponents();
    const mergedComponent = this.mergeComponents(components);
    const stepContent = this.generateSTEPFile(mergedComponent);
    
    const blob = new Blob([stepContent], { type: 'text/plain' });
    saveAs(blob, `${this.generatePartNumber()}_Complete.stp`);
  }

  /**
   * Generate component definitions with geometry
   */
  private generateComponents(): STEPComponent[] {
    const components: STEPComponent[] = [];
    const { width, length, height } = this.config.dimensions;

    // 1. Skid components (2x4 lumber)
    const skidSpacing = Math.max(24, Math.min(length - 6, 36)); // 24" to 36" spacing
    const numSkids = Math.floor((length - 6) / skidSpacing) + 1;
    
    for (let i = 0; i < numSkids; i++) {
      const skidY = -length/2 + 3 + (i * skidSpacing);
      components.push({
        name: `Skid_${String(i + 1).padStart(2, '0')}`,
        fileName: `${this.generatePartNumber()}-SKD-${String(i + 1).padStart(2, '0')}`,
        partNumber: `${this.generatePartNumber()}-001-${String(i + 1).padStart(2, '0')}`,
        material: 'Douglas_Fir_2x4',
        geometry: {
          type: 'BOX',
          dimensions: [width - 6, 3.5, 1.5], // 2x4 actual dimensions
          position: [0, skidY, 0.75],
          rotation: [0, 0, 0]
        }
      });
    }

    // 2. Floor boards (3/4" plywood)
    const floorBoardWidth = Math.min(24, width); // Standard 24" max width
    const numFloorBoards = Math.ceil(length / floorBoardWidth);
    
    for (let i = 0; i < numFloorBoards; i++) {
      const boardLength = Math.min(floorBoardWidth, length - (i * floorBoardWidth));
      const boardY = -length/2 + (i * floorBoardWidth) + boardLength/2;
      
      components.push({
        name: `Floor_Board_${String(i + 1).padStart(2, '0')}`,
        fileName: `${this.generatePartNumber()}-FLR-${String(i + 1).padStart(2, '0')}`,
        partNumber: `${this.generatePartNumber()}-002-${String(i + 1).padStart(2, '0')}`,
        material: 'CDX_Plywood_3_4',
        geometry: {
          type: 'BOX',
          dimensions: [width, boardLength, 0.75],
          position: [0, boardY, 1.125], // On top of skids
          rotation: [0, 0, 0]
        }
      });
    }

    // 3. Wall panels
    const walls = [
      { name: 'Front', position: [0, length/2, height/2], rotation: [0, 0, 0], dims: [width, 0.75, height] },
      { name: 'Back', position: [0, -length/2, height/2], rotation: [0, 0, 0], dims: [width, 0.75, height] },
      { name: 'Left', position: [-width/2, 0, height/2], rotation: [0, 0, Math.PI/2], dims: [length, 0.75, height] },
      { name: 'Right', position: [width/2, 0, height/2], rotation: [0, 0, Math.PI/2], dims: [length, 0.75, height] }
    ];

    walls.forEach((wall, index) => {
      components.push({
        name: `${wall.name}_Panel`,
        fileName: `${this.generatePartNumber()}-PNL-${String(index + 1).padStart(2, '0')}`,
        partNumber: `${this.generatePartNumber()}-00${index + 3}`,
        material: 'CDX_Plywood_3_4',
        geometry: {
          type: 'BOX',
          dimensions: wall.dims as [number, number, number],
          position: wall.position as [number, number, number],
          rotation: wall.rotation as [number, number, number]
        }
      });
    });

    // 4. Top panel (if configured)
    if (this.config.cap.topPanel) {
      components.push({
        name: 'Top_Panel',
        fileName: `${this.generatePartNumber()}-TOP-01`,
        partNumber: `${this.generatePartNumber()}-007`,
        material: 'CDX_Plywood_3_4',
        geometry: {
          type: 'BOX',
          dimensions: [width, length, 0.75],
          position: [0, 0, height + 0.375],
          rotation: [0, 0, 0]
        }
      });
    }

    return components;
  }

  /**
   * Generate STEP file content for a component
   */
  private generateSTEPFile(component: STEPComponent): string {
    const timestamp = new Date().toISOString();
    const partNumber = component.partNumber;
    
    // STEP header
    const header = [
      'ISO-10303-21;',
      'HEADER;',
      `FILE_DESCRIPTION(('AutoCrate ${component.name} - Generated by AutoCrate System'),'2;1');`,
      `FILE_NAME('${component.fileName}.stp','${timestamp}',('AutoCrate System'),('Applied Materials Corporation'),'AutoCrate v3.0','AutoCrate STEP Exporter','');`,
      `FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));`,
      'ENDSEC;',
      '',
      'DATA;'
    ].join('\n');

    // Generate geometry entities
    const entities = this.generateGeometryEntities(component);
    
    // STEP footer
    const footer = [
      'ENDSEC;',
      'END-ISO-10303-21;'
    ].join('\n');

    return header + '\n' + entities + '\n' + footer;
  }

  /**
   * Generate STEP geometry entities for a component
   */
  private generateGeometryEntities(component: STEPComponent): string {
    const entities: string[] = [];
    const { geometry } = component;
    
    // Application context
    entities.push(`#${this.getNextId()} = APPLICATION_CONTEXT('automotive design');`);
    entities.push(`#${this.getNextId()} = APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',1999,#${this.stepId - 1});`);
    
    // Product definition
    entities.push(`#${this.getNextId()} = PRODUCT('${component.partNumber}','${component.name}','AutoCrate Component',(#${this.stepId - 2}));`);
    entities.push(`#${this.getNextId()} = PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('','',#${this.stepId - 1},.NOT_KNOWN.);`);
    entities.push(`#${this.getNextId()} = PRODUCT_DEFINITION('design','',#${this.stepId - 1},#${this.stepId - 3});`);
    
    // Shape representation
    const shapeId = this.getNextId();
    entities.push(`#${shapeId} = SHAPE_REPRESENTATION('${component.name}',(#${this.getNextId() + 1}),#${this.getNextId() + 10});`);
    
    // Generate box geometry
    if (geometry.type === 'BOX') {
      const boxGeometry = this.generateBoxGeometry(geometry);
      entities.push(...boxGeometry);
    }
    
    // Geometric representation context
    entities.push(`#${this.getNextId()} = GEOMETRIC_REPRESENTATION_CONTEXT(3);`);
    entities.push(`#${this.getNextId()} = GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#${this.getNextId() + 1}));`);
    entities.push(`#${this.getNextId()} = UNCERTAINTY_ASSIGNED_VALUES_WITH_UNIT((MEASURE_WITH_UNIT(LENGTH_MEASURE(0.005),#${this.getNextId() + 2})),#${this.getNextId() + 8});`);
    entities.push(`#${this.getNextId()} = GLOBAL_UNIT_ASSIGNED_CONTEXT((#${this.getNextId() + 1},#${this.getNextId() + 2},#${this.getNextId() + 3}));`);
    entities.push(`#${this.getNextId()} = LENGTH_UNIT()(.MILLI.);`);
    entities.push(`#${this.getNextId()} = NAMED_UNIT(*)SI_UNIT($,.METRE.)LENGTH_UNIT();`);
    entities.push(`#${this.getNextId()} = NAMED_UNIT(*)SI_UNIT($,.RADIAN.)PLANE_ANGLE_UNIT();`);
    entities.push(`#${this.getNextId()} = NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT();`);
    
    // Product definition shape
    entities.push(`#${this.getNextId()} = PRODUCT_DEFINITION_SHAPE('','',#${this.stepId - 15});`);
    entities.push(`#${this.getNextId()} = SHAPE_DEFINITION_REPRESENTATION(#${this.stepId - 1},#${shapeId});`);
    
    return entities.join('\n');
  }

  /**
   * Generate box geometry entities
   */
  private generateBoxGeometry(geometry: ComponentGeometry): string[] {
    const entities: string[] = [];
    const [width, length, height] = geometry.dimensions;
    const [x, y, z] = geometry.position;
    
    // Convert inches to mm for STEP
    const widthMM = width * 25.4;
    const lengthMM = length * 25.4;
    const heightMM = height * 25.4;
    const xMM = x * 25.4;
    const yMM = y * 25.4;
    const zMM = z * 25.4;
    
    // Manifold solid brep
    entities.push(`#${this.getNextId()} = MANIFOLD_SOLID_BREP('Box',#${this.getNextId() + 1});`);
    
    // Closed shell
    entities.push(`#${this.getNextId()} = CLOSED_SHELL('Box Shell',(#${this.getNextId() + 1},#${this.getNextId() + 2},#${this.getNextId() + 3},#${this.getNextId() + 4},#${this.getNextId() + 5},#${this.getNextId() + 6}));`);
    
    // Generate 6 faces of the box
    const faces = [
      // Front face (XZ plane at +Y)
      { normal: [0, 1, 0], offset: yMM + lengthMM/2 },
      // Back face (XZ plane at -Y)
      { normal: [0, -1, 0], offset: -(yMM - lengthMM/2) },
      // Right face (YZ plane at +X)
      { normal: [1, 0, 0], offset: xMM + widthMM/2 },
      // Left face (YZ plane at -X)
      { normal: [-1, 0, 0], offset: -(xMM - widthMM/2) },
      // Top face (XY plane at +Z)
      { normal: [0, 0, 1], offset: zMM + heightMM/2 },
      // Bottom face (XY plane at -Z)
      { normal: [0, 0, -1], offset: -(zMM - heightMM/2) }
    ];
    
    faces.forEach((face, index) => {
      entities.push(`#${this.getNextId()} = ADVANCED_FACE('Face${index + 1}',(#${this.getNextId() + 1}),#${this.getNextId() + 5},.T.);`);
      entities.push(`#${this.getNextId()} = FACE_OUTER_BOUND('Bound',#${this.getNextId() + 1},.T.);`);
      entities.push(`#${this.getNextId()} = EDGE_LOOP('Loop',(#${this.getNextId() + 1}));`);
      entities.push(`#${this.getNextId()} = ORIENTED_EDGE('',*,*,#${this.getNextId() + 1},.T.);`);
      entities.push(`#${this.getNextId()} = EDGE_CURVE('Edge',#${this.getNextId() + 1},#${this.getNextId() + 2},#${this.getNextId() + 3},.T.);`);
      entities.push(`#${this.getNextId()} = PLANE('Plane',#${this.getNextId() + 1});`);
    });
    
    return entities;
  }

  /**
   * Generate assembly STEP file
   */
  private generateAssemblySTEP(components: STEPComponent[]): string {
    const timestamp = new Date().toISOString();
    const assemblyName = `${this.config.dimensions.width}x${this.config.dimensions.length}x${this.config.dimensions.height}_Crate_Assembly`;
    
    const header = [
      'ISO-10303-21;',
      'HEADER;',
      `FILE_DESCRIPTION(('AutoCrate Assembly - Complete Shipping Crate'),'2;1');`,
      `FILE_NAME('${this.generatePartNumber()}_Assembly.stp','${timestamp}',('AutoCrate System'),('Applied Materials Corporation'),'AutoCrate v3.0','AutoCrate STEP Exporter','');`,
      `FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));`,
      'ENDSEC;',
      '',
      'DATA;'
    ].join('\n');

    const entities: string[] = [];
    
    // Application context
    entities.push(`#${this.getNextId()} = APPLICATION_CONTEXT('automotive design');`);
    entities.push(`#${this.getNextId()} = APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',1999,#${this.stepId - 1});`);
    
    // Main assembly product
    entities.push(`#${this.getNextId()} = PRODUCT('${this.generatePartNumber()}','${assemblyName}','AutoCrate Shipping Crate Assembly',(#${this.stepId - 2}));`);
    entities.push(`#${this.getNextId()} = PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('','',#${this.stepId - 1},.NOT_KNOWN.);`);
    entities.push(`#${this.getNextId()} = PRODUCT_DEFINITION('design','',#${this.stepId - 1},#${this.stepId - 3});`);
    
    // Assembly structure
    components.forEach((component, index) => {
      entities.push(`#${this.getNextId()} = NEXT_ASSEMBLY_USAGE_OCCURRENCE('${component.name}','${component.partNumber} Instance','',#${this.stepId - 2},#${this.getNextId() + 1},$);`);
      entities.push(`#${this.getNextId()} = PRODUCT('${component.partNumber}','${component.name}','Component',(#${this.stepId - 7}));`);
      entities.push(`#${this.getNextId()} = PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('','',#${this.stepId - 1},.NOT_KNOWN.);`);
      entities.push(`#${this.getNextId()} = PRODUCT_DEFINITION('design','',#${this.stepId - 1},#${this.stepId - 9});`);
    });

    const footer = [
      'ENDSEC;',
      'END-ISO-10303-21;'
    ].join('\n');

    return header + '\n' + entities.join('\n') + '\n' + footer;
  }

  /**
   * Merge components into single part
   */
  private mergeComponents(components: STEPComponent[]): STEPComponent {
    return {
      name: 'Complete_Crate',
      fileName: `${this.generatePartNumber()}_Complete`,
      partNumber: this.generatePartNumber(),
      material: 'Mixed_Materials',
      geometry: {
        type: 'COMPOUND',
        components: components,
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      }
    };
  }

  /**
   * Generate part number
   */
  private generatePartNumber(): string {
    if (this.options.applyMaterialsStandards) {
      return `${this.options.partNumberPrefix}-${this.config.dimensions.width.toString().padStart(3, '0')}${this.config.dimensions.length.toString().padStart(3, '0')}${this.config.dimensions.height.toString().padStart(3, '0')}`;
    }
    return `CRATE-${this.config.dimensions.width}x${this.config.dimensions.length}x${this.config.dimensions.height}`;
  }

  /**
   * Get next STEP entity ID
   */
  private getNextId(): number {
    return this.stepId++;
  }
}

// Interface definitions
interface STEPComponent {
  name: string;
  fileName: string;
  partNumber: string;
  material: string;
  geometry: ComponentGeometry;
}

interface ComponentGeometry {
  type: 'BOX' | 'COMPOUND';
  dimensions?: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  components?: STEPComponent[];
}