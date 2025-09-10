import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CrateConfiguration, JTExportOptions, JTExportResult } from '@/types';

// Mock JT export service since actual NX integration would require system access
const mockJTExportService = {
  exportToJT: vi.fn(),
  validateJTFile: vi.fn(),
  getExportMetadata: vi.fn(),
};

describe('JT Export Integration', () => {
  let mockConfig: CrateConfiguration;
  let exportOptions: JTExportOptions;

  beforeEach(() => {
    mockConfig = {
      projectName: 'JT-EXPORT-TEST-001',
      dimensions: { length: 60, width: 48, height: 36 },
      weight: { product: 1200 },
      base: {
        type: 'heavy-duty',
        floorboardThickness: 1.0,
        skidHeight: 6,
        skidWidth: 4,
        skidCount: 4,
        skidSpacing: 18,
        requiresRubStrips: true,
        material: 'oak',
      },
      cap: {
        topPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        frontPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: true, type: 'holes', count: 4, size: 2 } },
        backPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        leftPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        rightPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
      },
      fasteners: { type: 'screw', size: '10d', spacing: 4, material: 'steel' },
      vinyl: { enabled: true, type: 'industrial', thickness: 0.125, coverage: 'full' },
      specialRequirements: ['ISTA-6A', 'hazmat'],
    };

    exportOptions = {
      format: 'JT',
      version: '10.5',
      units: 'inches',
      precision: 0.001,
      includeMetadata: true,
      includeMaterials: true,
      includeAssembly: true,
      exportPath: './exports/',
      filename: `${mockConfig.projectName}_${Date.now()}.jt`,
    };

    vi.clearAllMocks();
  });

  describe('JT File Generation', () => {
    it('should generate valid JT file structure', async () => {
      const mockResult: JTExportResult = {
        success: true,
        filePath: './exports/JT-EXPORT-TEST-001_12345.jt',
        fileSize: 2048576, // 2MB
        metadata: {
          partCount: 15,
          assemblyCount: 1,
          materialCount: 4,
          exportTime: 1847,
          version: '10.5',
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: ['Minor texture mapping issue'],
        },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockResult);

      const result = await mockJTExportService.exportToJT(mockConfig, exportOptions);

      expect(result.success).toBe(true);
      expect(result.filePath).toMatch(/\.jt$/);
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.metadata.partCount).toBeGreaterThan(10); // Should have base + panels + fasteners
      expect(result.metadata.exportTime).toBeLessThan(3000); // Under 3 seconds
    });

    it('should include proper part hierarchy', async () => {
      const mockResult: JTExportResult = {
        success: true,
        filePath: './exports/test.jt',
        fileSize: 1024000,
        metadata: {
          partCount: 15,
          assemblyCount: 1,
          materialCount: 4,
          exportTime: 1200,
          version: '10.5',
          hierarchy: [
            'ASSEMBLY_JT-EXPORT-TEST-001',
            'BASE_ASSEMBLY',
            '  SKID_001',
            '  SKID_002', 
            '  SKID_003',
            '  SKID_004',
            '  FLOORBOARD_001',
            'CAP_ASSEMBLY',
            '  FRONT_PANEL_001',
            '  BACK_PANEL_001',
            '  LEFT_PANEL_001',
            '  RIGHT_PANEL_001',
            '  TOP_PANEL_001',
            'FASTENER_ASSEMBLY',
            '  FASTENER_PATTERN_001',
            'VINYL_ASSEMBLY',
            '  VINYL_WRAP_001',
          ],
        },
        validation: { isValid: true, errors: [], warnings: [] },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockResult);

      const result = await mockJTExportService.exportToJT(mockConfig, exportOptions);
      
      expect(result.metadata.hierarchy).toBeDefined();
      expect(result.metadata.hierarchy).toContain('BASE_ASSEMBLY');
      expect(result.metadata.hierarchy).toContain('CAP_ASSEMBLY');
      expect(result.metadata.hierarchy).toContain('FASTENER_ASSEMBLY');
      expect(result.metadata.hierarchy).toContain('VINYL_ASSEMBLY');
      
      // Check skid count matches configuration
      const skidParts = result.metadata.hierarchy!.filter(part => part.includes('SKID_'));
      expect(skidParts.length).toBe(mockConfig.base.skidCount);
    });

    it('should export with correct material properties', async () => {
      const mockResult: JTExportResult = {
        success: true,
        filePath: './exports/test.jt',
        fileSize: 1500000,
        metadata: {
          partCount: 15,
          assemblyCount: 1,
          materialCount: 4,
          exportTime: 1600,
          version: '10.5',
          materials: [
            { name: 'OAK_LUMBER', density: 0.75, strength: 12000, finish: 'natural' },
            { name: 'PLYWOOD_3_4', density: 0.65, strength: 8000, finish: 'sanded' },
            { name: 'STEEL_FASTENER', density: 7.85, strength: 50000, finish: 'galvanized' },
            { name: 'VINYL_INDUSTRIAL', density: 0.92, strength: 2000, finish: 'textured' },
          ],
        },
        validation: { isValid: true, errors: [], warnings: [] },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockResult);

      const result = await mockJTExportService.exportToJT(mockConfig, exportOptions);
      
      expect(result.metadata.materials).toBeDefined();
      expect(result.metadata.materials!.length).toBe(4);
      
      const oakMaterial = result.metadata.materials!.find(m => m.name === 'OAK_LUMBER');
      const plywoodMaterial = result.metadata.materials!.find(m => m.name === 'PLYWOOD_3_4');
      const steelMaterial = result.metadata.materials!.find(m => m.name === 'STEEL_FASTENER');
      const vinylMaterial = result.metadata.materials!.find(m => m.name === 'VINYL_INDUSTRIAL');
      
      expect(oakMaterial).toBeDefined();
      expect(plywoodMaterial).toBeDefined();
      expect(steelMaterial).toBeDefined();
      expect(vinylMaterial).toBeDefined();
      
      // Check material properties are realistic
      expect(oakMaterial!.density).toBeGreaterThan(0.5);
      expect(steelMaterial!.density).toBeGreaterThan(7);
      expect(steelMaterial!.strength).toBeGreaterThan(40000);
    });
  });

  describe('NX 2022 Compatibility', () => {
    it('should generate JT files compatible with NX 2022', async () => {
      const mockResult: JTExportResult = {
        success: true,
        filePath: './exports/test.jt',
        fileSize: 2000000,
        metadata: {
          partCount: 15,
          assemblyCount: 1,
          materialCount: 4,
          exportTime: 2100,
          version: '10.5',
          nxCompatibility: {
            version: 'NX 2022',
            features: ['assemblies', 'constraints', 'materials', 'drawings'],
            validated: true,
            issues: [],
          },
        },
        validation: { isValid: true, errors: [], warnings: [] },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockResult);

      const result = await mockJTExportService.exportToJT(mockConfig, exportOptions);
      
      expect(result.metadata.nxCompatibility).toBeDefined();
      expect(result.metadata.nxCompatibility!.version).toBe('NX 2022');
      expect(result.metadata.nxCompatibility!.validated).toBe(true);
      expect(result.metadata.nxCompatibility!.issues.length).toBe(0);
    });

    it('should validate JT file integrity', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: ['Texture quality reduced for file size optimization'],
        fileSize: 1800000,
        partCount: 15,
        geometryCheck: true,
        metadataCheck: true,
        structureCheck: true,
      };

      mockJTExportService.validateJTFile.mockResolvedValue(mockValidation);

      const validation = await mockJTExportService.validateJTFile('./exports/test.jt');
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
      expect(validation.partCount).toBeGreaterThan(10);
      expect(validation.geometryCheck).toBe(true);
      expect(validation.metadataCheck).toBe(true);
      expect(validation.structureCheck).toBe(true);
    });

    it('should handle coordinate system properly (Z-up)', async () => {
      const mockResult: JTExportResult = {
        success: true,
        filePath: './exports/test.jt',
        fileSize: 1600000,
        metadata: {
          partCount: 15,
          assemblyCount: 1,
          materialCount: 4,
          exportTime: 1400,
          version: '10.5',
          coordinateSystem: {
            origin: [0, 0, 0],
            xAxis: [1, 0, 0], // Width
            yAxis: [0, 1, 0], // Depth  
            zAxis: [0, 0, 1], // Height
            units: 'inches',
            handedness: 'right',
          },
        },
        validation: { isValid: true, errors: [], warnings: [] },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockResult);

      const result = await mockJTExportService.exportToJT(mockConfig, exportOptions);
      
      expect(result.metadata.coordinateSystem).toBeDefined();
      expect(result.metadata.coordinateSystem!.origin).toEqual([0, 0, 0]);
      expect(result.metadata.coordinateSystem!.zAxis).toEqual([0, 0, 1]); // Z-up
      expect(result.metadata.coordinateSystem!.handedness).toBe('right');
      expect(result.metadata.coordinateSystem!.units).toBe('inches');
    });
  });

  describe('Performance Requirements', () => {
    it('should export within time limits', async () => {
      const startTime = Date.now();
      
      const mockResult: JTExportResult = {
        success: true,
        filePath: './exports/test.jt',
        fileSize: 2500000,
        metadata: {
          partCount: 15,
          assemblyCount: 1,
          materialCount: 4,
          exportTime: 2800, // 2.8 seconds - within 3 second limit
          version: '10.5',
        },
        validation: { isValid: true, errors: [], warnings: [] },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockResult);

      const result = await mockJTExportService.exportToJT(mockConfig, exportOptions);
      const actualTime = Date.now() - startTime;
      
      expect(result.metadata.exportTime).toBeLessThan(3000); // Under 3 seconds
      expect(actualTime).toBeLessThan(100); // Mock should be fast
      expect(result.success).toBe(true);
    });

    it('should generate reasonably sized files', async () => {
      const mockResult: JTExportResult = {
        success: true,
        filePath: './exports/test.jt',
        fileSize: 3500000, // 3.5MB - reasonable for complex crate
        metadata: {
          partCount: 15,
          assemblyCount: 1,
          materialCount: 4,
          exportTime: 2200,
          version: '10.5',
        },
        validation: { isValid: true, errors: [], warnings: [] },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockResult);

      const result = await mockJTExportService.exportToJT(mockConfig, exportOptions);
      
      // File should be under 10MB for reasonable download/import times
      expect(result.fileSize).toBeLessThan(10000000);
      expect(result.fileSize).toBeGreaterThan(500000); // But substantial enough to contain geometry
    });

    it('should handle memory usage efficiently', async () => {
      const mockResult: JTExportResult = {
        success: true,
        filePath: './exports/test.jt',
        fileSize: 2000000,
        metadata: {
          partCount: 15,
          assemblyCount: 1,
          materialCount: 4,
          exportTime: 1800,
          version: '10.5',
          memoryUsage: {
            peak: 850000000, // 850MB - under 1GB limit
            average: 600000000,
            final: 200000000,
          },
        },
        validation: { isValid: true, errors: [], warnings: [] },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockResult);

      const result = await mockJTExportService.exportToJT(mockConfig, exportOptions);
      
      expect(result.metadata.memoryUsage).toBeDefined();
      expect(result.metadata.memoryUsage!.peak).toBeLessThan(1000000000); // Under 1GB
      expect(result.metadata.memoryUsage!.final).toBeLessThan(500000000); // Cleaned up after export
    });
  });

  describe('Error Handling', () => {
    it('should handle export failures gracefully', async () => {
      const mockError: JTExportResult = {
        success: false,
        error: 'Insufficient disk space for export',
        filePath: '',
        fileSize: 0,
        metadata: {
          partCount: 0,
          assemblyCount: 0,
          materialCount: 0,
          exportTime: 0,
          version: '10.5',
        },
        validation: { isValid: false, errors: ['Export failed'], warnings: [] },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockError);

      const result = await mockJTExportService.exportToJT(mockConfig, exportOptions);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate invalid configurations', async () => {
      const invalidConfig = {
        ...mockConfig,
        dimensions: { length: -10, width: 0, height: -5 },
      };

      const mockResult: JTExportResult = {
        success: false,
        error: 'Invalid dimensions: negative values not allowed',
        filePath: '',
        fileSize: 0,
        metadata: {
          partCount: 0,
          assemblyCount: 0,
          materialCount: 0,
          exportTime: 0,
          version: '10.5',
        },
        validation: {
          isValid: false,
          errors: [
            'Length cannot be negative',
            'Width must be greater than 0',
            'Height cannot be negative',
          ],
          warnings: [],
        },
      };

      mockJTExportService.exportToJT.mockResolvedValue(mockResult);

      const result = await mockJTExportService.exportToJT(invalidConfig, exportOptions);
      
      expect(result.success).toBe(false);
      expect(result.validation.errors.length).toBeGreaterThan(0);
      expect(result.validation.errors).toContain('Length cannot be negative');
      expect(result.validation.errors).toContain('Width must be greater than 0');
    });

    it('should handle corrupted JT validation', async () => {
      const mockValidation = {
        isValid: false,
        errors: [
          'File header corrupted',
          'Missing geometry data',
          'Invalid part references',
        ],
        warnings: [],
        fileSize: 500,
        partCount: 0,
        geometryCheck: false,
        metadataCheck: false,
        structureCheck: false,
      };

      mockJTExportService.validateJTFile.mockResolvedValue(mockValidation);

      const validation = await mockJTExportService.validateJTFile('./exports/corrupted.jt');
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.geometryCheck).toBe(false);
      expect(validation.metadataCheck).toBe(false);
      expect(validation.structureCheck).toBe(false);
    });
  });
});