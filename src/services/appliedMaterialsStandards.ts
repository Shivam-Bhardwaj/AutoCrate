import type { 
  AppliedMaterialsStandards,
  MaterialSpecification,
  FastenerSpecification,
  TCEngineeringNumber,
  TitleBlockData
} from '@/types/nx';
import type { CrateConfiguration } from '@/types/crate';

export class AppliedMaterialsStandardsService {
  private static readonly PART_NUMBER_PREFIX = '0205';
  private static readonly TC_PREFIX = 'TC2';
  private static readonly REVISION_INITIAL = 'A';

  private config: CrateConfiguration;
  private partNumberSequence: number;

  constructor(config: CrateConfiguration) {
    this.config = config;
    this.partNumberSequence = 1;
  }

  getStandards(): AppliedMaterialsStandards {
    return {
      partNumberFormat: this.getPartNumberFormat(),
      tcEngineeringFormat: this.getTCEngineeringFormat(),
      titleBlockTemplate: this.getTitleBlockTemplate(),
      materialSpecifications: this.getMaterialSpecifications(),
      fastenerSpecifications: this.getFastenerSpecifications(),
      complianceStandards: this.getComplianceStandards()
    };
  }

  generatePartNumber(componentType?: string): string {
    const dimensions = `${this.config.dimensions.width.toString().padStart(3, '0')}${this.config.dimensions.length.toString().padStart(3, '0')}${this.config.dimensions.height.toString().padStart(3, '0')}`;
    const sequence = this.partNumberSequence.toString().padStart(2, '0');
    this.partNumberSequence++;
    
    return `${AppliedMaterialsStandardsService.PART_NUMBER_PREFIX}-${dimensions}-${sequence}`;
  }

  generateTCNumber(): TCEngineeringNumber {
    const timestamp = Date.now();
    const sequence = timestamp.toString().slice(-7);
    const revision = AppliedMaterialsStandardsService.REVISION_INITIAL;
    const fullNumber = `${AppliedMaterialsStandardsService.TC_PREFIX}-${sequence}-${revision}`;
    
    return {
      prefix: AppliedMaterialsStandardsService.TC_PREFIX,
      sequence,
      revision,
      fullNumber
    };
  }

  createTitleBlock(drawingTitle: string, partNumber?: string): TitleBlockData {
    const tcNumber = this.generateTCNumber();
    
    return {
      projectName: drawingTitle,
      partNumber: partNumber || this.generatePartNumber(),
      tcNumber: tcNumber.fullNumber,
      revision: AppliedMaterialsStandardsService.REVISION_INITIAL,
      drawnBy: 'AutoCrate Engineering',
      checkedBy: 'AMAT Quality Assurance',
      approvedBy: 'AMAT Engineering Manager',
      date: new Date(),
      scale: this.calculateOptimalScale(),
      material: this.getPrimaryMaterial(),
      finish: this.getRequiredFinish()
    };
  }

  private getPartNumberFormat(): string {
    return `${AppliedMaterialsStandardsService.PART_NUMBER_PREFIX}-WWWDDDHHH-SS`;
  }

  private getTCEngineeringFormat(): string {
    return `${AppliedMaterialsStandardsService.TC_PREFIX}-NNNNNNN-R`;
  }

  private getTitleBlockTemplate(): string {
    return 'APPLIED_MATERIALS_STANDARD_TITLE_BLOCK_D_SIZE';
  }

  private getMaterialSpecifications(): MaterialSpecification[] {
    const specs: MaterialSpecification[] = [];

    // Primary lumber specification
    specs.push({
      id: 'lumber_2x4_df',
      name: 'Douglas Fir 2x4 Lumber',
      type: 'lumber',
      grade: 'Construction',
      dimensions: '1.5" x 3.5" (nominal 2x4)',
      supplier: 'Pre-approved lumber supplier',
      specifications: {
        species: 'Douglas Fir (Pseudotsuga menziesii)',
        gradingStandard: 'WWPA Grading Rules',
        moistureContent: '19% maximum',
        treatment: 'Kiln Dried',
        surfacing: 'S4S (Surfaced 4 Sides)',
        lengthTolerance: '+0", -1/8"',
        straightness: '1/4" maximum bow in 8 feet',
        defects: 'Construction grade allows limited knots',
        density: '32 lb/ft³ at 12% MC',
        ispm15Compliance: true,
        amatApproved: true
      }
    });

    // Plywood specification
    specs.push({
      id: 'plywood_cdx_34',
      name: '3/4" CDX Plywood',
      type: 'plywood',
      grade: 'CDX Exterior',
      dimensions: '3/4" x 48" x 96"',
      supplier: 'Pre-approved plywood supplier',
      specifications: {
        standard: 'PS 1-19 Construction Sheathing',
        faceGrade: 'C',
        backGrade: 'D',
        interiorGrade: 'X (Exterior Glue)',
        glueType: 'Waterproof Bond (WBP)',
        species: 'Douglas Fir',
        plies: 7,
        thicknessTolerance: '+0.000", -0.031"',
        squareness: '1/16" maximum in 48"',
        warp: '1/4" maximum in 8 feet',
        formaldehyde: 'No added formaldehyde',
        ispm15Compliance: true,
        amatApproved: true,
        fireRating: 'Class C',
        thermalConductivity: '0.80 BTU-in/hr-ft²-°F'
      }
    });

    // Corner block lumber
    specs.push({
      id: 'lumber_2x2_df',
      name: 'Douglas Fir 2x2 Corner Blocks',
      type: 'lumber',
      grade: 'Construction',
      dimensions: '1.5" x 1.5" (nominal 2x2)',
      supplier: 'Pre-approved lumber supplier',
      specifications: {
        species: 'Douglas Fir (Pseudotsuga menziesii)',
        gradingStandard: 'WWPA Grading Rules',
        moistureContent: '19% maximum',
        treatment: 'Kiln Dried',
        surfacing: 'S4S (Surfaced 4 Sides)',
        lengthStandard: '8 feet nominal',
        ismp15Compliance: true,
        amatApproved: true
      }
    });

    return specs;
  }

  private getFastenerSpecifications(): FastenerSpecification[] {
    const specs: FastenerSpecification[] = [];

    // Primary lag bolts for skid attachment
    specs.push({
      id: 'lag_bolt_38x6',
      type: 'lag_bolt',
      size: '3/8" x 6"',
      material: 'Steel',
      finish: 'Hot Dipped Galvanized',
      quantity: 12,
      location: 'Skid to floor attachment'
    });

    // Wood screws for panel attachment
    specs.push({
      id: 'wood_screw_10x25',
      type: 'screw',
      size: '#10 x 2-1/2"',
      material: 'Steel',
      finish: 'Hot Dipped Galvanized',
      quantity: 48,
      location: 'Panel to frame attachment'
    });

    // Corner reinforcement screws
    specs.push({
      id: 'wood_screw_10x3',
      type: 'screw',
      size: '#10 x 3"',
      material: 'Steel',
      finish: 'Hot Dipped Galvanized',
      quantity: 32,
      location: 'Corner block attachment'
    });

    // Pneumatic nails for assembly
    specs.push({
      id: 'framing_nail_3',
      type: 'nail',
      size: '3" 16d',
      material: 'Steel',
      finish: 'Hot Dipped Galvanized',
      quantity: 24,
      location: 'Frame assembly'
    });

    return specs;
  }

  private getComplianceStandards(): string[] {
    return [
      'ASME Y14.5-2009 - Dimensioning and Tolerancing',
      'ASME Y14.100-2017 - Engineering Drawing Practices',
      'ISPM-15 - International Standards for Phytosanitary Measures',
      'NMFC Item 400 - National Motor Freight Classification',
      'ISTA Procedure 2A - Packaged-Product Integrity Testing',
      'MIL-STD-810G - Environmental Test Methods',
      'Applied Materials Packaging Specification AMAT-PKG-001',
      'Applied Materials Material Standards AMAT-MAT-002',
      'RoHS Compliance Directive 2011/65/EU',
      'CARB Phase 2 Formaldehyde Emissions',
      'FSC Chain of Custody Certification',
      'PEFC Sustainable Forest Management'
    ];
  }

  private calculateOptimalScale(): string {
    const maxDimension = Math.max(this.config.dimensions.width, this.config.dimensions.length, this.config.dimensions.height);
    
    if (maxDimension <= 24) return '1:2';
    if (maxDimension <= 48) return '1:4';
    if (maxDimension <= 72) return '1:6';
    if (maxDimension <= 96) return '1:8';
    return '1:10';
  }

  private getPrimaryMaterial(): string {
    return 'Douglas Fir Lumber / CDX Plywood';
  }

  private getRequiredFinish(): string {
    return 'Natural - No Applied Finish';
  }

  // Quality control methods
  validatePartNumber(partNumber: string): boolean {
    const pattern = new RegExp(`^${AppliedMaterialsStandardsService.PART_NUMBER_PREFIX}-\\d{9}-\\d{2}$`);
    return pattern.test(partNumber);
  }

  validateTCNumber(tcNumber: string): boolean {
    const pattern = new RegExp(`^${AppliedMaterialsStandardsService.TC_PREFIX}-\\d{7}-[A-Z]$`);
    return pattern.test(tcNumber);
  }

  // Documentation generation methods
  generateMaterialSpecSheet(materialId: string): string {
    const material = this.getMaterialSpecifications().find(m => m.id === materialId);
    if (!material) {
      throw new Error(`Material specification not found: ${materialId}`);
    }

    return [
      'APPLIED MATERIALS MATERIAL SPECIFICATION',
      '=' .repeat(50),
      '',
      `Material ID: ${material.id}`,
      `Name: ${material.name}`,
      `Type: ${material.type.toUpperCase()}`,
      `Grade: ${material.grade}`,
      `Dimensions: ${material.dimensions}`,
      `Supplier: ${material.supplier}`,
      '',
      'SPECIFICATIONS:',
      ...Object.entries(material.specifications).map(([key, value]) => 
        `${key}: ${value}`
      ),
      '',
      'COMPLIANCE:',
      ...this.getComplianceStandards().filter(std => 
        std.includes('Material') || std.includes('ISPM') || std.includes('RoHS')
      ),
      '',
      `Generated: ${new Date().toISOString()}`,
      'Document Control: AMAT-ENG-AUTOCRATE'
    ].join('\n');
  }

  generateFastenerSpecSheet(fastenerId: string): string {
    const fastener = this.getFastenerSpecifications().find(f => f.id === fastenerId);
    if (!fastener) {
      throw new Error(`Fastener specification not found: ${fastenerId}`);
    }

    return [
      'APPLIED MATERIALS FASTENER SPECIFICATION',
      '=' .repeat(50),
      '',
      `Fastener ID: ${fastener.id}`,
      `Type: ${fastener.type.toUpperCase()}`,
      `Size: ${fastener.size}`,
      `Material: ${fastener.material}`,
      `Finish: ${fastener.finish}`,
      `Quantity Required: ${fastener.quantity}`,
      `Location: ${fastener.location}`,
      '',
      'PERFORMANCE REQUIREMENTS:',
      'Corrosion Resistance: ASTM A153 Class C',
      'Tensile Strength: Grade 2 minimum',
      'Thread Class: 2A external, 2B internal',
      'Installation Torque: Per AMAT standards',
      '',
      'QUALITY REQUIREMENTS:',
      'Supplier Certification Required',
      'Lot Traceability Required',
      'Third Party Testing: Annual',
      'Receiving Inspection: 100%',
      '',
      `Generated: ${new Date().toISOString()}`,
      'Document Control: AMAT-ENG-AUTOCRATE'
    ].join('\n');
  }

  // Cost estimation methods
  estimateMaterialCosts(): Record<string, number> {
    const costs: Record<string, number> = {};
    
    // Lumber costs (per board foot)
    const lumber2x4Volume = this.calculateLumberVolume();
    costs['lumber_2x4'] = lumber2x4Volume * 1.25; // $1.25/bf
    
    // Plywood costs (per sheet)
    const plywoodSheets = this.calculatePlywoodSheets();
    costs['plywood_3_4'] = plywoodSheets * 45.00; // $45/sheet
    
    // Hardware costs
    costs['lag_bolts'] = 12 * 2.50; // $2.50 each
    costs['wood_screws'] = 80 * 0.15; // $0.15 each
    costs['nails'] = 24 * 0.05; // $0.05 each
    
    // Labor estimate
    costs['fabrication_labor'] = 4.5 * 75.00; // 4.5 hours at $75/hr
    
    // Total cost calculation
    costs['subtotal'] = Object.entries(costs).reduce((sum, [key, value]) => {
      return key !== 'subtotal' ? sum + value : sum;
    }, 0);
    
    costs['overhead'] = costs['subtotal'] * 0.15; // 15% overhead
    costs['total'] = costs['subtotal'] + costs['overhead'];
    
    return costs;
  }

  private calculateLumberVolume(): number {
    // Calculate board feet of lumber needed
    const { width, length } = this.config.dimensions;
    const skidRunnerLength = width / 12; // Convert to feet
    const skidCrossMemberLength = (length - 7) / 12; // Account for runner thickness
    
    // 2x4 lumber: 2" x 4" x length (board feet)
    const runnerBoardFeet = 2 * (2 * 4 * skidRunnerLength) / 12;
    const crossMemberBoardFeet = 2 * (2 * 4 * skidCrossMemberLength) / 12;
    
    return runnerBoardFeet + crossMemberBoardFeet;
  }

  private calculatePlywoodSheets(): number {
    const { width, length, height } = this.config.dimensions;
    
    // Standard sheet size: 48" x 96"
    const sheetArea = 48 * 96;
    
    // Calculate required area for each component
    const floorArea = width * length;
    const wallAreas = 2 * (width * height) + 2 * (length * height);
    const topArea = this.config.cap.topPanel ? width * length : 0;
    
    const totalArea = floorArea + wallAreas + topArea;
    
    // Add 15% waste factor
    const adjustedArea = totalArea * 1.15;
    
    return Math.ceil(adjustedArea / sheetArea);
  }
}