import * as THREE from 'three';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { 
  JTExportData, 
  JTMetadata, 
  JTAssemblyNode, 
  JTMaterial,
  NXExportOptions 
} from '@/types/nx';
import type { CrateConfiguration } from '@/types/crate';

export class JTExporter {
  private scene: THREE.Scene;
  private config: CrateConfiguration;
  private options: NXExportOptions;

  constructor(scene: THREE.Scene, config: CrateConfiguration, options: NXExportOptions) {
    this.scene = scene;
    this.config = config;
    this.options = options;
  }

  async exportJT(): Promise<void> {
    try {
      const exportData = await this.generateJTData();
      const jtFile = await this.createJTFile(exportData);
      
      if (this.options.includeAssembly) {
        const assemblyData = await this.generateAssemblyStructure();
        const assemblyFile = await this.createAssemblyFile(assemblyData);
        
        // Create ZIP with JT file and assembly
        const zip = new JSZip();
        zip.file('crate.jt', jtFile);
        zip.file('crate_assembly.asm', assemblyFile);
        
        if (this.options.includeDrawings) {
          const drawingFile = await this.generateDrawings();
          zip.file('crate_drawing.dwg', drawingFile);
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${this.generatePartNumber()}_export.zip`);
      } else {
        saveAs(jtFile, `${this.generatePartNumber()}.jt`);
      }
    } catch (error) {
      console.error('JT Export failed:', error);
      throw new Error(`JT Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateJTData(): Promise<JTExportData> {
    const metadata = this.createMetadata();
    const assembly = this.createAssemblyStructure();
    const materials = this.extractMaterials();
    const geometry = await this.convertGeometry();

    return {
      geometry,
      metadata,
      assembly,
      materials
    };
  }

  private createMetadata(): JTMetadata {
    const partNumber = this.generatePartNumber();
    const tcNumber = this.generateTCNumber();
    
    return {
      title: `AutoCrate Shipping Container ${this.config.dimensions.width}x${this.config.dimensions.length}x${this.config.dimensions.height}`,
      author: 'AutoCrate System',
      description: `Custom shipping crate designed for Applied Materials equipment`,
      created: new Date(),
      modified: new Date(),
      version: '1.0',
      units: 'inches',
      partNumber,
      tcNumber
    };
  }

  private createAssemblyStructure(): JTAssemblyNode[] {
    const rootNode: JTAssemblyNode = {
      id: 'root',
      name: 'Shipping Crate Assembly',
      partNumber: this.generatePartNumber(),
      tcNumber: this.generateTCNumber(),
      transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      children: []
    };

    // Add major components
    const components = this.createComponentNodes();
    rootNode.children = components;

    return [rootNode];
  }

  private createComponentNodes(): JTAssemblyNode[] {
    const components: JTAssemblyNode[] = [];

    // Floor assembly
    components.push({
      id: 'floor_assembly',
      name: 'Floor Assembly',
      partNumber: `${this.generatePartNumber()}-001`,
      tcNumber: `${this.generateTCNumber()}-001`,
      transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      children: [
        {
          id: 'skid',
          name: '2x4 Skid Structure',
          partNumber: `${this.generatePartNumber()}-001-01`,
          tcNumber: `${this.generateTCNumber()}-001-01`,
          transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
          children: []
        },
        {
          id: 'floorboards',
          name: '3/4" Plywood Flooring',
          partNumber: `${this.generatePartNumber()}-001-02`,
          tcNumber: `${this.generateTCNumber()}-001-02`,
          transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0.75, 1],
          children: []
        }
      ]
    });

    // Wall assemblies
    const walls = ['front', 'back', 'left', 'right'];
    walls.forEach((wall, index) => {
      components.push({
        id: `${wall}_wall`,
        name: `${wall.charAt(0).toUpperCase() + wall.slice(1)} Wall Assembly`,
        partNumber: `${this.generatePartNumber()}-00${index + 2}`,
        tcNumber: `${this.generateTCNumber()}-00${index + 2}`,
        transform: this.getWallTransform(wall),
        children: []
      });
    });

    // Top assembly
    if (this.config.cap.topPanel) {
      components.push({
        id: 'top_assembly',
        name: 'Top Assembly',
        partNumber: `${this.generatePartNumber()}-006`,
        tcNumber: `${this.generateTCNumber()}-006`,
        transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, this.config.dimensions.height, 1],
        children: []
      });
    }

    return components;
  }

  private getWallTransform(wall: string): number[] {
    const { width, length: depth, height } = this.config.dimensions;
    
    switch (wall) {
      case 'front':
        return [1, 0, 0, 0, 0, 1, 0, depth / 2, 0, 0, 1, height / 2, 0, 0, 0, 1];
      case 'back':
        return [1, 0, 0, 0, 0, 1, 0, -depth / 2, 0, 0, 1, height / 2, 0, 0, 0, 1];
      case 'left':
        return [0, 1, 0, -width / 2, 1, 0, 0, 0, 0, 0, 1, height / 2, 0, 0, 0, 1];
      case 'right':
        return [0, 1, 0, width / 2, 1, 0, 0, 0, 0, 0, 1, height / 2, 0, 0, 0, 1];
      default:
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }
  }

  private extractMaterials(): JTMaterial[] {
    const materials: JTMaterial[] = [];

    // Lumber material
    materials.push({
      id: 'lumber_2x4',
      name: 'Douglas Fir 2x4 Lumber',
      color: [0.8, 0.6, 0.4],
      opacity: 1.0,
      properties: {
        grade: 'Construction',
        species: 'Douglas Fir',
        moisture: '19% max',
        treatment: 'Kiln Dried'
      }
    });

    // Plywood material
    materials.push({
      id: 'plywood_34',
      name: '3/4" CDX Plywood',
      color: [0.9, 0.7, 0.5],
      opacity: 1.0,
      properties: {
        grade: 'CDX',
        species: 'Douglas Fir',
        thickness: '0.75 inches',
        glue: 'Exterior'
      }
    });

    // Hardware material
    materials.push({
      id: 'hardware_steel',
      name: 'Galvanized Steel Hardware',
      color: [0.7, 0.7, 0.7],
      opacity: 1.0,
      properties: {
        material: 'Steel',
        finish: 'Hot Dipped Galvanized',
        grade: 'A307'
      }
    });

    return materials;
  }

  private async convertGeometry(): Promise<ArrayBuffer> {
    // Create a simplified mesh representation for JT export
    const vertices: number[] = [];
    const indices: number[] = [];
    let vertexIndex = 0;

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const geometry = object.geometry;
        const position = geometry.attributes.position;
        
        if (position) {
          // Extract vertices
          for (let i = 0; i < position.count; i++) {
            vertices.push(
              position.getX(i),
              position.getY(i),
              position.getZ(i)
            );
          }

          // Extract indices
          if (geometry.index) {
            for (let i = 0; i < geometry.index.count; i++) {
              indices.push(geometry.index.getX(i) + vertexIndex);
            }
          } else {
            // Generate indices for non-indexed geometry
            for (let i = 0; i < position.count; i++) {
              indices.push(vertexIndex + i);
            }
          }

          vertexIndex += position.count;
        }
      }
    });

    // Create binary buffer with geometry data
    const buffer = new ArrayBuffer(vertices.length * 4 + indices.length * 4 + 8);
    const view = new DataView(buffer);
    
    // Header
    view.setUint32(0, vertices.length, true);
    view.setUint32(4, indices.length, true);
    
    // Vertices
    let offset = 8;
    for (let i = 0; i < vertices.length; i++) {
      view.setFloat32(offset, vertices[i], true);
      offset += 4;
    }
    
    // Indices
    for (let i = 0; i < indices.length; i++) {
      view.setUint32(offset, indices[i], true);
      offset += 4;
    }

    return buffer;
  }

  private async createJTFile(exportData: JTExportData): Promise<Blob> {
    // Create JT file structure (simplified)
    const jtHeader = this.createJTHeader(exportData.metadata);
    const jtGeometry = exportData.geometry;
    const jtAssembly = this.serializeAssembly(exportData.assembly);
    const jtMaterials = this.serializeMaterials(exportData.materials);

    const totalSize = jtHeader.byteLength + jtGeometry.byteLength + 
                     jtAssembly.byteLength + jtMaterials.byteLength;
    
    const buffer = new ArrayBuffer(totalSize);
    const view = new Uint8Array(buffer);
    let offset = 0;

    // Combine all data
    view.set(new Uint8Array(jtHeader), offset);
    offset += jtHeader.byteLength;
    
    view.set(new Uint8Array(jtGeometry), offset);
    offset += jtGeometry.byteLength;
    
    view.set(new Uint8Array(jtAssembly), offset);
    offset += jtAssembly.byteLength;
    
    view.set(new Uint8Array(jtMaterials), offset);

    return new Blob([buffer], { type: 'application/octet-stream' });
  }

  private createJTHeader(metadata: JTMetadata): ArrayBuffer {
    const encoder = new TextEncoder();
    const headerData = JSON.stringify(metadata);
    const headerBytes = encoder.encode(headerData);
    
    const buffer = new ArrayBuffer(headerBytes.length + 4);
    const view = new DataView(buffer);
    
    view.setUint32(0, headerBytes.length, true);
    new Uint8Array(buffer, 4).set(headerBytes);
    
    return buffer;
  }

  private serializeAssembly(assembly: JTAssemblyNode[]): ArrayBuffer {
    const encoder = new TextEncoder();
    const assemblyData = JSON.stringify(assembly);
    const assemblyBytes = encoder.encode(assemblyData);
    
    const buffer = new ArrayBuffer(assemblyBytes.length + 4);
    const view = new DataView(buffer);
    
    view.setUint32(0, assemblyBytes.length, true);
    new Uint8Array(buffer, 4).set(assemblyBytes);
    
    return buffer;
  }

  private serializeMaterials(materials: JTMaterial[]): ArrayBuffer {
    const encoder = new TextEncoder();
    const materialsData = JSON.stringify(materials);
    const materialsBytes = encoder.encode(materialsData);
    
    const buffer = new ArrayBuffer(materialsBytes.length + 4);
    const view = new DataView(buffer);
    
    view.setUint32(0, materialsBytes.length, true);
    new Uint8Array(buffer, 4).set(materialsBytes);
    
    return buffer;
  }

  private async generateAssemblyStructure(): Promise<string> {
    // Generate NX Assembly file content
    const assemblyContent = [
      '! NX Assembly File',
      '! Generated by AutoCrate',
      `! Date: ${new Date().toISOString()}`,
      '',
      'ASSEMBLY_START',
      `NAME "${this.config.dimensions.width}x${this.config.dimensions.length}x${this.config.dimensions.height}_CRATE"`,
      `PART_NUMBER "${this.generatePartNumber()}"`,
      `TC_NUMBER "${this.generateTCNumber()}"`,
      '',
      '! Component definitions',
      'COMPONENT_START SKID',
      `PART_FILE "${this.generatePartNumber()}-001-01.prt"`,
      'TRANSFORM 0 0 0 0 0 0',
      'COMPONENT_END',
      '',
      'COMPONENT_START FLOOR',
      `PART_FILE "${this.generatePartNumber()}-001-02.prt"`,
      'TRANSFORM 0 0 0.75 0 0 0',
      'COMPONENT_END',
      '',
      'ASSEMBLY_END'
    ].join('\n');

    return assemblyContent;
  }

  private async createAssemblyFile(assemblyData: string): Promise<Blob> {
    return new Blob([assemblyData], { type: 'text/plain' });
  }

  private async generateDrawings(): Promise<Blob> {
    // Generate drawing file (simplified)
    const drawingContent = [
      '! NX Drawing File',
      '! Generated by AutoCrate',
      `! Date: ${new Date().toISOString()}`,
      '',
      'DRAWING_START',
      'SHEET_SIZE D',
      'PROJECTION_TYPE THIRD_ANGLE',
      'STANDARD ASME_Y14.5_2009',
      '',
      'TITLE_BLOCK_START',
      `PART_NUMBER "${this.generatePartNumber()}"`,
      `TC_NUMBER "${this.generateTCNumber()}"`,
      'DRAWN_BY "AutoCrate System"',
      'CHECKED_BY "QA Department"',
      'APPROVED_BY "Engineering"',
      `DATE "${new Date().toLocaleDateString()}"`,
      'SCALE "1:10"',
      'MATERIAL "Douglas Fir Lumber / CDX Plywood"',
      'FINISH "Natural"',
      'TITLE_BLOCK_END',
      '',
      'DRAWING_END'
    ].join('\n');

    return new Blob([drawingContent], { type: 'text/plain' });
  }

  private generatePartNumber(): string {
    if (this.options.applyMaterialsStandards) {
      return `0205-${this.config.dimensions.width.toString().padStart(3, '0')}${this.config.dimensions.length.toString().padStart(3, '0')}${this.config.dimensions.height.toString().padStart(3, '0')}`;
    }
    return `CRATE-${this.config.dimensions.width}x${this.config.dimensions.length}x${this.config.dimensions.height}`;
  }

  private generateTCNumber(): string {
    const timestamp = Date.now().toString().slice(-7);
    return `TC2-${timestamp}`;
  }
}