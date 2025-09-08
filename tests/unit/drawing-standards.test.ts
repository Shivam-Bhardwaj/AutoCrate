import { describe, it, expect, beforeEach } from 'vitest';
import { DrawingGenerator } from '@/services/drawingGenerator';
import { TitleBlockGenerator } from '@/services/titleBlockGenerator';
import type { CrateConfiguration, DrawingSheet, TitleBlock } from '@/types';

describe('Drawing Standards Validation', () => {
  let mockConfig: CrateConfiguration;
  let drawingGen: DrawingGenerator;
  let titleBlockGen: TitleBlockGenerator;

  beforeEach(() => {
    mockConfig = {
      projectName: 'DRAWING-STD-TEST-001',
      dimensions: { length: 72, width: 48, height: 40 },
      weight: { product: 2000, maxGross: 2500 },
      base: {
        type: 'heavy-duty',
        floorboardThickness: 1.0,
        skidHeight: 6,
        skidWidth: 4,
        skidCount: 5,
        skidSpacing: 16,
        requiresRubStrips: true,
        material: 'oak',
      },
      cap: {
        topPanel: { thickness: 1.0, material: 'plywood', reinforcement: true, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        frontPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: true, type: 'slots', count: 6, size: 2 } },
        backPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        leftPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        rightPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
      },
      fasteners: { type: 'bolt', size: '12d', spacing: 4, material: 'steel' },
      vinyl: { enabled: true, type: 'heavy-duty', thickness: 0.25, coverage: 'full' },
      specialRequirements: ['ISTA-6A', 'ISTA-6B', 'hazmat', 'export'],
    };

    drawingGen = new DrawingGenerator(mockConfig);
    titleBlockGen = new TitleBlockGenerator(mockConfig);
  });

  describe('ASME Y14.5-2009 Compliance', () => {
    it('should format dimensions per ASME Y14.5-2009', () => {
      const drawing = drawingGen.generateDrawing();
      
      drawing.dimensions.forEach(dim => {
        // Decimal format: X.XX or XX.XX
        expect(dim.value).toMatch(/^\d{1,3}\.\d{2}$/);
        
        // Tolerance format: ±X.XX
        expect(dim.tolerance).toMatch(/^±\s*\d+\.\d{2}$/);
        
        // Unit specification
        expect(dim.units).toBe('in');
        
        // Valid dimension types
        const validTypes = ['length', 'width', 'height', 'thickness', 'diameter', 'radius', 'angle'];
        expect(validTypes).toContain(dim.type);
      });
    });

    it('should use proper geometric tolerancing symbols', () => {
      const drawing = drawingGen.generateDrawing();
      
      // Check for GD&T symbols in annotations
      const gdtSymbols = ['⌖', '⊥', '∥', '○', '◎', '⌯'];
      
      drawing.annotations.forEach(annotation => {
        if (annotation.type === 'geometric_tolerance') {
          const hasValidSymbol = gdtSymbols.some(symbol => 
            annotation.text.includes(symbol)
          );
          expect(hasValidSymbol).toBe(true);
        }
      });
    });

    it('should include proper datum references', () => {
      const drawing = drawingGen.generateDrawing();
      
      // Find datum annotations
      const datumAnnotations = drawing.annotations.filter(a => a.type === 'datum');
      
      expect(datumAnnotations.length).toBeGreaterThan(0);
      
      datumAnnotations.forEach(datum => {
        // Datum labels should be single letters A, B, C, etc.
        expect(datum.text).toMatch(/^[A-Z]$/);
        expect(datum.position).toBeDefined();
        expect(datum.position.x).toBeTypeOf('number');
        expect(datum.position.y).toBeTypeOf('number');
      });
    });

    it('should validate surface finish specifications', () => {
      const drawing = drawingGen.generateDrawing();
      
      const surfaceFinishes = drawing.annotations.filter(a => a.type === 'surface_finish');
      
      expect(surfaceFinishes.length).toBeGreaterThan(0);
      
      surfaceFinishes.forEach(finish => {
        // Surface finish should follow ASME B46.1 format: Ra XX
        expect(finish.text).toMatch(/^Ra\s+\d+(\.\d+)?$/);
        
        // Common surface finish values (microinches)
        const finishValue = parseFloat(finish.text.split(' ')[1]);
        expect(finishValue).toBeGreaterThan(0);
        expect(finishValue).toBeLessThanOrEqual(1000);
      });
    });

    it('should include material specifications per ASTM standards', () => {
      const drawing = drawingGen.generateDrawing();
      
      expect(drawing.materialCallouts).toBeDefined();
      
      // Check plywood specification
      if (drawing.materialCallouts.plywood) {
        const plywoodSpec = drawing.materialCallouts.plywood;
        expect(plywoodSpec.specification).toMatch(/^APA\s/); // APA standards
        expect(plywoodSpec.grade).toMatch(/^[A-D]-[A-D]$/); // Grade format A-A, B-B, etc.
        expect(plywoodSpec.thickness).toBeDefined();
      }
      
      // Check lumber specification  
      if (drawing.materialCallouts.lumber) {
        const lumberSpec = drawing.materialCallouts.lumber;
        expect(lumberSpec.species).toMatch(/^(Pine|Oak|Maple|Birch)$/);
        expect(lumberSpec.grade).toMatch(/^(Select|#1|#2|#3|Construction|Utility)$/);
        expect(lumberSpec.moistureContent).toMatch(/^\d+%\s+max$/);
      }
    });
  });

  describe('Applied Materials Standards', () => {
    it('should generate proper part numbers (0205-XXXXX format)', () => {
      const titleBlock = titleBlockGen.generateTitleBlock();
      
      expect(titleBlock.partNumber).toMatch(/^0205-\d{5}$/);
      
      // Part number should be unique and within valid range
      const partNum = parseInt(titleBlock.partNumber.split('-')[1]);
      expect(partNum).toBeGreaterThan(0);
      expect(partNum).toBeLessThanOrEqual(99999);
    });

    it('should generate proper TC numbers (TC2-XXXXXXX format)', () => {
      const titleBlock = titleBlockGen.generateTitleBlock();
      
      expect(titleBlock.tcNumber).toMatch(/^TC2-\d{7}$/);
      
      // TC number should be unique
      const tcNum = parseInt(titleBlock.tcNumber.split('-')[1]);
      expect(tcNum).toBeGreaterThan(0);
      expect(tcNum).toBeLessThanOrEqual(9999999);
    });

    it('should include required approval signatures', () => {
      const titleBlock = titleBlockGen.generateTitleBlock();
      
      expect(titleBlock.approvals).toBeDefined();
      expect(titleBlock.approvals.designer).toBeDefined();
      expect(titleBlock.approvals.checker).toBeDefined();
      expect(titleBlock.approvals.approver).toBeDefined();
      
      // Check signature format
      expect(titleBlock.approvals.designer.name).toMatch(/^[A-Z][a-z]+\s[A-Z][a-z]+$/);
      expect(titleBlock.approvals.designer.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(titleBlock.approvals.designer.title).toMatch(/^(Design Engineer|Sr\. Design Engineer|Principal Engineer)$/);
    });

    it('should validate Applied Materials material standards', () => {
      const drawing = drawingGen.generateDrawing();
      
      // Approved materials list
      const approvedMaterials = [
        'Douglas Fir', 'Southern Pine', 'White Oak', 'Red Oak',
        'APA Plywood Grade A-A', 'APA Plywood Grade A-B', 'APA Plywood Grade B-B',
        'Galvanized Steel', 'Stainless Steel 316', 'Aluminum 6061-T6'
      ];
      
      Object.values(drawing.materialCallouts).forEach(material => {
        const isApproved = approvedMaterials.some(approved => 
          material.specification?.includes(approved) || 
          material.type?.includes(approved.toLowerCase().replace(/\s+/g, '_'))
        );
        expect(isApproved).toBe(true);
      });
    });

    it('should include proper revision control', () => {
      const titleBlock = titleBlockGen.generateTitleBlock();
      
      expect(titleBlock.revision).toBeDefined();
      expect(titleBlock.revision.current).toMatch(/^[A-Z]\d*$/); // A, B, C or A1, B2, etc.
      expect(titleBlock.revision.history).toBeDefined();
      expect(Array.isArray(titleBlock.revision.history)).toBe(true);
      
      if (titleBlock.revision.history.length > 0) {
        titleBlock.revision.history.forEach(rev => {
          expect(rev.revision).toMatch(/^[A-Z]\d*$/);
          expect(rev.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
          expect(rev.description).toBeDefined();
          expect(rev.by).toMatch(/^[A-Z]{2,3}$/); // Initials
        });
      }
    });
  });

  describe('Drawing Layout Standards', () => {
    it('should generate proper sheet sizes', () => {
      const drawing = drawingGen.generateDrawing();
      
      // Standard ANSI sheet sizes
      const validSizes = ['A', 'B', 'C', 'D', 'E'];
      expect(validSizes).toContain(drawing.sheetSize);
      
      // Verify dimensions match ANSI standards
      const sheetDimensions: { [key: string]: { width: number; height: number } } = {
        'A': { width: 11, height: 8.5 },
        'B': { width: 17, height: 11 },
        'C': { width: 22, height: 17 },
        'D': { width: 34, height: 22 },
        'E': { width: 44, height: 34 },
      };
      
      const expectedDims = sheetDimensions[drawing.sheetSize];
      expect(drawing.sheetDimensions.width).toBe(expectedDims.width);
      expect(drawing.sheetDimensions.height).toBe(expectedDims.height);
    });

    it('should place views according to third-angle projection', () => {
      const drawing = drawingGen.generateDrawing();
      
      expect(drawing.projectionType).toBe('third-angle');
      
      // Verify view placement follows third-angle projection rules
      const frontView = drawing.views.find(v => v.name === 'FRONT');
      const topView = drawing.views.find(v => v.name === 'TOP');
      const rightView = drawing.views.find(v => v.name === 'RIGHT');
      
      if (frontView && topView) {
        expect(topView.position.y).toBeGreaterThan(frontView.position.y); // Top view above front
        expect(Math.abs(topView.position.x - frontView.position.x)).toBeLessThan(1); // Aligned vertically
      }
      
      if (frontView && rightView) {
        expect(rightView.position.x).toBeGreaterThan(frontView.position.x); // Right view to the right
        expect(Math.abs(rightView.position.y - frontView.position.y)).toBeLessThan(1); // Aligned horizontally
      }
    });

    it('should include required title block information', () => {
      const titleBlock = titleBlockGen.generateTitleBlock();
      
      // Required fields per Applied Materials standards
      expect(titleBlock.title).toBeDefined();
      expect(titleBlock.partNumber).toBeDefined();
      expect(titleBlock.tcNumber).toBeDefined();
      expect(titleBlock.material).toBeDefined();
      expect(titleBlock.finish).toBeDefined();
      expect(titleBlock.scale).toBeDefined();
      expect(titleBlock.weight).toBeDefined();
      expect(titleBlock.drawnBy).toBeDefined();
      expect(titleBlock.checkedBy).toBeDefined();
      expect(titleBlock.approvedBy).toBeDefined();
      expect(titleBlock.date).toBeDefined();
      
      // Validate field formats
      expect(titleBlock.scale).toMatch(/^\d+:\d+$|^FULL$/); // 1:1, 2:1, FULL, etc.
      expect(titleBlock.weight).toMatch(/^\d+(\.\d+)?\s*LBS$/);
      expect(titleBlock.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should maintain proper line weights and types', () => {
      const drawing = drawingGen.generateDrawing();
      
      drawing.views.forEach(view => {
        view.entities.forEach(entity => {
          // Validate line weight values
          const validWeights = [0.1, 0.15, 0.2, 0.25, 0.3, 0.5, 0.7, 1.0];
          expect(validWeights).toContain(entity.lineWeight);
          
          // Validate line types
          const validTypes = ['continuous', 'hidden', 'center', 'cutting', 'phantom'];
          expect(validTypes).toContain(entity.lineType);
          
          // Object lines should be thick (0.5-1.0)
          if (entity.type === 'object') {
            expect(entity.lineWeight).toBeGreaterThanOrEqual(0.5);
          }
          
          // Hidden lines should be medium (0.25-0.3)
          if (entity.lineType === 'hidden') {
            expect(entity.lineWeight).toBeLessThanOrEqual(0.3);
            expect(entity.lineWeight).toBeGreaterThanOrEqual(0.25);
          }
          
          // Center lines should be thin (0.1-0.15)
          if (entity.lineType === 'center') {
            expect(entity.lineWeight).toBeLessThanOrEqual(0.15);
          }
        });
      });
    });
  });

  describe('Quality Assurance', () => {
    it('should validate drawing completeness', () => {
      const drawing = drawingGen.generateDrawing();
      
      // Must have minimum required views
      expect(drawing.views.length).toBeGreaterThanOrEqual(3);
      
      // Must have dimensions
      expect(drawing.dimensions.length).toBeGreaterThan(0);
      
      // Must have title block
      expect(drawing.titleBlock).toBeDefined();
      
      // Must have material callouts
      expect(drawing.materialCallouts).toBeDefined();
      expect(Object.keys(drawing.materialCallouts).length).toBeGreaterThan(0);
    });

    it('should check for dimension accuracy', () => {
      const drawing = drawingGen.generateDrawing();
      
      // Overall dimensions should match configuration
      const lengthDim = drawing.dimensions.find(d => d.type === 'length');
      const widthDim = drawing.dimensions.find(d => d.type === 'width');
      const heightDim = drawing.dimensions.find(d => d.type === 'height');
      
      if (lengthDim) {
        expect(parseFloat(lengthDim.value)).toBeCloseTo(mockConfig.dimensions.length, 2);
      }
      if (widthDim) {
        expect(parseFloat(widthDim.value)).toBeCloseTo(mockConfig.dimensions.width, 2);
      }
      if (heightDim) {
        expect(parseFloat(heightDim.value)).toBeCloseTo(mockConfig.dimensions.height, 2);
      }
    });

    it('should validate Bill of Materials accuracy', () => {
      const drawing = drawingGen.generateDrawing();
      
      expect(drawing.billOfMaterials).toBeDefined();
      expect(drawing.billOfMaterials.items.length).toBeGreaterThan(0);
      
      drawing.billOfMaterials.items.forEach(item => {
        // Each BOM item should have required fields
        expect(item.itemNumber).toMatch(/^\d+$/);
        expect(item.partNumber).toMatch(/^0205-\d{5}$/);
        expect(item.description).toBeDefined();
        expect(item.material).toBeDefined();
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.weight).toBeGreaterThan(0);
        
        // Unit should be valid
        const validUnits = ['EA', 'LBS', 'FT', 'IN', 'SQ FT', 'BD FT'];
        expect(validUnits).toContain(item.unit);
      });
      
      // Total weight should match configuration
      const totalWeight = drawing.billOfMaterials.items
        .reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      
      expect(totalWeight).toBeCloseTo(mockConfig.weight.product, 50); // Within 50 lbs tolerance
    });

    it('should verify drawing consistency', () => {
      const drawing1 = drawingGen.generateDrawing();
      const drawing2 = drawingGen.generateDrawing();
      
      // Same configuration should produce consistent drawings
      expect(drawing1.dimensions.length).toBe(drawing2.dimensions.length);
      expect(drawing1.views.length).toBe(drawing2.views.length);
      expect(drawing1.sheetSize).toBe(drawing2.sheetSize);
      
      // Part numbers should be consistent
      expect(drawing1.titleBlock.partNumber).toBe(drawing2.titleBlock.partNumber);
      expect(drawing1.titleBlock.tcNumber).toBe(drawing2.titleBlock.tcNumber);
    });
  });
});