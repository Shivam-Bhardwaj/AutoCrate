/**
 * Manufacturing Connector Service
 * Generates CNC code, laser cutting templates, assembly instructions, and QC checklists
 */

import {
  ManufacturingIntegration,
  ManufacturingSystem,
  ManufacturingCapability,
  MachineConfig,
  ToolDefinition,
  CNCProgram,
  LaserCuttingProgram,
  AssemblyInstructions,
  AssemblyStep,
  AssemblyPart,
  QualityChecklist,
  QualityCheckItem,
} from '@/types/integration';
import { CrateConfiguration } from '@/types/crate';
import { BOMItem } from '@/types/nx';

export class ManufacturingConnectorService {
  private config: CrateConfiguration;
  private machineConfig?: MachineConfig;

  constructor(config: CrateConfiguration, machineConfig?: MachineConfig) {
    this.config = config;
    this.machineConfig = machineConfig;
  }

  // ============ CNC Code Generation ============
  public generateCNCProgram(
    partType: 'skid' | 'cleat' | 'bracket' | 'custom',
    machine?: MachineConfig
  ): CNCProgram {
    const machineType = machine?.type || 'cnc';
    const postProcessor = machine?.postProcessor || 'fanuc';
    
    let gcode = '';
    let estimatedTime = 0;
    const toolList: ToolDefinition[] = [];

    switch (partType) {
      case 'skid':
        gcode = this.generateSkidCNCCode();
        estimatedTime = 45; // minutes
        toolList.push(
          { toolId: 'T01', name: '3/4" End Mill', type: 'endmill', diameter: 0.75, length: 3, flutes: 4, material: 'carbide' },
          { toolId: 'T02', name: '1/4" Drill', type: 'drill', diameter: 0.25, length: 2, material: 'hss' }
        );
        break;
      case 'cleat':
        gcode = this.generateCleatCNCCode();
        estimatedTime = 15;
        toolList.push(
          { toolId: 'T01', name: '1/2" End Mill', type: 'endmill', diameter: 0.5, length: 2, flutes: 3, material: 'carbide' }
        );
        break;
      case 'bracket':
        gcode = this.generateBracketCNCCode();
        estimatedTime = 20;
        toolList.push(
          { toolId: 'T01', name: '1/2" End Mill', type: 'endmill', diameter: 0.5, length: 2, flutes: 3, material: 'carbide' },
          { toolId: 'T03', name: '1/8" Drill', type: 'drill', diameter: 0.125, length: 1, material: 'hss' }
        );
        break;
      default:
        gcode = this.generateCustomCNCCode();
        estimatedTime = 60;
    }

    // Apply post-processor specific formatting
    gcode = this.applyPostProcessor(gcode, postProcessor);

    return {
      programName: `CRATE_${partType.toUpperCase()}_${Date.now()}`,
      machineType: machineType.toString(),
      postProcessor,
      code: gcode,
      estimatedTime,
      toolList,
      setupInstructions: this.generateSetupInstructions(partType),
    };
  }

  private generateSkidCNCCode(): string {
    const { dimensions, base } = this.config;
    
    return `% SKID MACHINING PROGRAM
O1001 (CRATE SKID)
(DATE: ${new Date().toISOString().split('T')[0]})
(MATERIAL: 2X4 LUMBER)
(TOOLS: T01=3/4 ENDMILL, T02=1/4 DRILL)

G90 G94 G17 G91.1 (ABSOLUTE, FEED/MIN, XY PLANE)
G20 (INCH UNITS)
G53 G0 Z0 (RETRACT TO MACHINE ZERO)
G54 (WORK OFFSET 1)

(TOOL 1 - 3/4 END MILL)
T01 M06
S1500 M03 (SPINDLE ON CW)
G00 X0 Y0
G43 Z1.0 H01 (TOOL LENGTH COMP)
M08 (COOLANT ON)

(PROFILE CUTTING)
G00 X0 Y0 Z0.1
G01 Z-0.5 F20.0 (PLUNGE)
G01 X${dimensions.length} F50.0 (CUT LENGTH)
G01 Y${base.skidWidth}
G01 X0
G01 Y0
G00 Z1.0 (RETRACT)

(NOTCH CUTTING FOR CROSS MEMBERS)
${this.generateNotchCode(dimensions.length, base.skidWidth)}

(TOOL 2 - 1/4 DRILL)
T02 M06
S2000 M03
G00 X2.0 Y${base.skidWidth / 2}
G43 Z1.0 H02

(DRILL HOLES FOR FASTENERS)
${this.generateDrillPattern(dimensions.length, base.skidWidth, 12)}

M09 (COOLANT OFF)
G53 G0 Z0 (RETRACT)
M30 (END PROGRAM)
%`;
  }

  private generateCleatCNCCode(): string {
    return `% CLEAT MACHINING PROGRAM
O1002 (CORNER CLEAT)
(DATE: ${new Date().toISOString().split('T')[0]})
(MATERIAL: 2X2 LUMBER)

G90 G94 G17 G91.1
G20
G53 G0 Z0
G54

T01 M06 (1/2 END MILL)
S1800 M03
G00 X0 Y0
G43 Z1.0 H01
M08

(PROFILE)
G00 X0 Y0 Z0.1
G01 Z-0.25 F15.0
G01 X2.0 F40.0
G01 Y2.0
G01 X0
G01 Y0
G00 Z1.0

(45 DEGREE CHAMFER)
G00 X0.5 Y0
G01 Z-0.125 F15.0
G01 X0 Y0.5 F30.0
G00 Z1.0

M09
G53 G0 Z0
M30
%`;
  }

  private generateBracketCNCCode(): string {
    return `% BRACKET MACHINING PROGRAM
O1003 (REINFORCEMENT BRACKET)
(DATE: ${new Date().toISOString().split('T')[0]})
(MATERIAL: 1/4 STEEL PLATE)

G90 G94 G17 G91.1
G20
G53 G0 Z0
G54

T01 M06 (1/2 END MILL)
S1200 M03
G00 X0 Y0
G43 Z1.0 H01
M08

(PROFILE)
G00 X0 Y0 Z0.1
G01 Z-0.25 F10.0
G01 X4.0 F25.0
G01 Y3.0
G01 X0
G01 Y0
G00 Z1.0

T03 M06 (1/8 DRILL)
S2500 M03
G00 X0.5 Y0.5
G43 Z1.0 H03

(MOUNTING HOLES)
G81 X0.5 Y0.5 Z-0.3 R0.1 F8.0
X3.5 Y0.5
X3.5 Y2.5
X0.5 Y2.5
G80

M09
G53 G0 Z0
M30
%`;
  }

  private generateCustomCNCCode(): string {
    // Generic CNC template
    return `% CUSTOM PART PROGRAM
O9999 (CUSTOM CRATE COMPONENT)
(CONFIGURE PARAMETERS AS NEEDED)
G90 G94 G17 G91.1
G20
G53 G0 Z0
G54
(ADD CUSTOM TOOLPATHS HERE)
M30
%`;
  }

  private generateNotchCode(length: number, width: number): string {
    const notchSpacing = length / 4;
    let code = '';
    
    for (let i = 1; i < 4; i++) {
      const x = notchSpacing * i;
      code += `
G00 X${x - 0.75} Y0 Z0.1
G01 Z-1.5 F15.0
G01 X${x + 0.75} F30.0
G01 Z0.1 F50.0`;
    }
    
    return code;
  }

  private generateDrillPattern(length: number, width: number, spacing: number): string {
    let code = 'G81 Z-1.0 R0.1 F12.0\n';
    
    for (let x = spacing; x < length; x += spacing) {
      code += `X${x} Y${width / 2}\n`;
    }
    
    code += 'G80';
    return code;
  }

  private applyPostProcessor(gcode: string, processor: string): string {
    // Apply processor-specific modifications
    switch (processor) {
      case 'fanuc':
        // FANUC format is default
        return gcode;
      case 'haas':
        // HAAS specific formatting
        return gcode.replace(/G53 G0/g, 'G28 G91');
      case 'mazak':
        // Mazak specific
        return gcode.replace(/M06/g, 'M06\nG43.4');
      default:
        return gcode;
    }
  }

  private generateSetupInstructions(partType: string): string {
    return `SETUP INSTRUCTIONS FOR ${partType.toUpperCase()}:

1. MATERIAL PREPARATION:
   - Verify material dimensions and grade
   - Check for defects or warping
   - Clean surfaces of debris

2. WORK HOLDING:
   - Mount material securely in vise or fixture
   - Ensure proper alignment with machine axes
   - Verify Z-height clearance

3. TOOL SETUP:
   - Install tools as per tool list
   - Set tool lengths in offset table
   - Verify tool condition and sharpness

4. WORK OFFSET:
   - Set G54 work offset at part origin
   - Verify with edge finder or probe
   - Record offset values

5. SAFETY CHECK:
   - Verify program in graphics mode
   - Run air cut at reduced feed
   - Check coolant flow and chip evacuation

6. PRODUCTION:
   - Start with conservative speeds/feeds
   - Monitor first part closely
   - Adjust parameters as needed`;
  }

  // ============ Laser Cutting Program Generation ============
  public generateLaserCuttingProgram(
    material: 'plywood' | 'steel' | 'aluminum',
    thickness: number
  ): LaserCuttingProgram {
    const { dimensions, cap } = this.config;
    
    // Calculate laser parameters based on material
    const params = this.calculateLaserParameters(material, thickness);
    
    // Generate nesting layout for optimal material usage
    const nestingData = this.generateNestingLayout();
    
    // Generate laser program
    const programCode = this.generateLaserCode(material, thickness, params);

    return {
      programName: `LASER_CRATE_${material.toUpperCase()}_${Date.now()}`,
      material,
      thickness,
      power: params.power,
      speed: params.speed,
      gasType: params.gasType,
      gasPresure: params.gasPressure,
      pierceTime: params.pierceTime,
      programCode,
      nestingEfficiency: nestingData.efficiency,
    };
  }

  private calculateLaserParameters(material: string, thickness: number): any {
    const parameters: Record<string, any> = {
      'plywood': {
        0.75: { power: 80, speed: 20, gasType: 'air', gasPressure: 60, pierceTime: 0.5 },
        0.5: { power: 60, speed: 30, gasType: 'air', gasPressure: 50, pierceTime: 0.3 },
      },
      'steel': {
        0.25: { power: 95, speed: 15, gasType: 'oxygen', gasPressure: 80, pierceTime: 1.0 },
        0.125: { power: 85, speed: 25, gasType: 'oxygen', gasPressure: 70, pierceTime: 0.7 },
      },
      'aluminum': {
        0.25: { power: 90, speed: 18, gasType: 'nitrogen', gasPressure: 100, pierceTime: 0.8 },
        0.125: { power: 80, speed: 28, gasType: 'nitrogen', gasPressure: 90, pierceTime: 0.5 },
      },
    };

    return parameters[material]?.[thickness] || {
      power: 75,
      speed: 20,
      gasType: 'air',
      gasPressure: 60,
      pierceTime: 0.5,
    };
  }

  private generateNestingLayout(): { efficiency: number; layout: string } {
    // Simulate nesting optimization
    const efficiency = 85 + Math.random() * 10; // 85-95% efficiency
    
    const layout = `
    NESTING LAYOUT:
    Sheet 1: Front/Back Panels
    Sheet 2: Side Panels
    Sheet 3: Top Panel + Cleats
    Material Utilization: ${efficiency.toFixed(1)}%
    `;
    
    return { efficiency, layout };
  }

  private generateLaserCode(material: string, thickness: number, params: any): string {
    const { dimensions } = this.config;
    
    return `; LASER CUTTING PROGRAM
; Material: ${material.toUpperCase()}
; Thickness: ${thickness}"
; Power: ${params.power}%
; Speed: ${params.speed} IPM
; Gas: ${params.gasType} @ ${params.gasPressure} PSI

G90 (ABSOLUTE MODE)
G20 (INCH UNITS)
M82 (LASER ASSIST GAS ON)
M83 S${params.power} (SET LASER POWER)

; FRONT PANEL
G00 X0 Y0
M84 P${params.pierceTime} (PIERCE)
M85 (LASER ON)
G01 X${dimensions.length} F${params.speed}
G01 Y${dimensions.height}
G01 X0
G01 Y0
M86 (LASER OFF)

; VENTILATION HOLES (IF CONFIGURED)
${this.generateVentilationPattern()}

; MOVE TO NEXT PART
G00 X${dimensions.length + 2} Y0

; CONTINUE WITH OTHER PANELS...

M87 (ASSIST GAS OFF)
M30 (END PROGRAM)`;
  }

  private generateVentilationPattern(): string {
    const { cap } = this.config;
    
    if (!cap.frontPanel.ventilation?.enabled) {
      return '; NO VENTILATION REQUIRED';
    }

    const { type, count, size } = cap.frontPanel.ventilation;
    let pattern = '; VENTILATION PATTERN\n';
    
    if (type === 'holes') {
      for (let i = 0; i < count; i++) {
        const x = 10 + (i * 8);
        const y = 10;
        pattern += `G00 X${x} Y${y}\nM84 P0.2\nG02 I${size / 2} J0 (CIRCLE)\n`;
      }
    } else if (type === 'slots') {
      for (let i = 0; i < count; i++) {
        const x = 10 + (i * 12);
        const y = 10;
        pattern += `G00 X${x} Y${y}\nM85\nG01 X${x + size * 3} F30\nM86\n`;
      }
    }
    
    return pattern;
  }

  // ============ Assembly Instructions Generation ============
  public generateAssemblyInstructions(): AssemblyInstructions {
    const steps = this.createAssemblySteps();
    const tools = this.getRequiredTools();
    const parts = this.getAssemblyParts();
    
    return {
      documentId: `ASSY-${Date.now()}`,
      title: `Assembly Instructions - ${this.config.projectName} Shipping Crate`,
      version: '1.0',
      steps,
      tools,
      parts,
      estimatedTime: this.calculateAssemblyTime(steps),
      difficulty: this.assessDifficulty(),
    };
  }

  private createAssemblySteps(): AssemblyStep[] {
    const steps: AssemblyStep[] = [
      {
        stepNumber: 1,
        title: 'Prepare Work Area',
        description: 'Clear a flat, level surface large enough for the crate assembly. Gather all tools and materials.',
        parts: [],
        tools: ['Tape Measure', 'Level'],
        duration: 10,
        warnings: ['Ensure adequate ventilation if using adhesives'],
        qualityChecks: ['Verify surface is level within 1/4"'],
      },
      {
        stepNumber: 2,
        title: 'Assemble Base Frame',
        description: 'Position the three skids parallel to each other, spaced evenly. Attach cross members using 3" nails.',
        parts: ['SKID-001', 'SKID-002', 'SKID-003', 'CROSS-001', 'CROSS-002'],
        tools: ['Hammer', 'Nail Gun', 'Square'],
        duration: 20,
        warnings: ['Check skid alignment before fastening'],
        qualityChecks: ['Verify frame is square', 'Check all joints are secure'],
      },
      {
        stepNumber: 3,
        title: 'Install Floorboards',
        description: 'Lay plywood sheets on base frame. Secure with 2" screws at 6" intervals along all edges.',
        parts: ['FLOOR-001', 'FLOOR-002'],
        tools: ['Drill', 'Screwdriver Bits'],
        duration: 15,
        warnings: ['Pre-drill holes to prevent splitting'],
        qualityChecks: ['No gaps between sheets', 'All edges secured'],
      },
      {
        stepNumber: 4,
        title: 'Attach Corner Cleats',
        description: 'Install vertical cleats at all four corners. Ensure they are plumb and secure.',
        parts: ['CLEAT-001', 'CLEAT-002', 'CLEAT-003', 'CLEAT-004'],
        tools: ['Level', 'Drill', 'Clamps'],
        duration: 25,
        warnings: ['Cleats must be perfectly vertical'],
        qualityChecks: ['Check plumb with level', 'Verify attachment strength'],
      },
      {
        stepNumber: 5,
        title: 'Install Side Panels',
        description: 'Position left and right panels against cleats. Secure with screws every 8 inches.',
        parts: ['PANEL-LEFT', 'PANEL-RIGHT'],
        tools: ['Drill', 'Level', 'Assistant Helper'],
        duration: 30,
        warnings: ['Panels are heavy - use proper lifting technique'],
        qualityChecks: ['Panels are flush with base', 'No visible gaps'],
      },
      {
        stepNumber: 6,
        title: 'Install Front and Back Panels',
        description: 'Position front and back panels. Secure to cleats and side panels.',
        parts: ['PANEL-FRONT', 'PANEL-BACK'],
        tools: ['Drill', 'Square', 'Assistant Helper'],
        duration: 30,
        warnings: ['Check ventilation holes are properly oriented'],
        qualityChecks: ['All corners are square', 'Panels properly aligned'],
      },
      {
        stepNumber: 7,
        title: 'Install Top Panel',
        description: 'Place top panel on assembled walls. Secure with screws around perimeter.',
        parts: ['PANEL-TOP'],
        tools: ['Drill', 'Ladder'],
        duration: 20,
        warnings: ['Use ladder safely', 'Panel must be centered'],
        qualityChecks: ['Top is level', 'All edges secured'],
      },
      {
        stepNumber: 8,
        title: 'Add Reinforcements',
        description: 'Install corner brackets and additional fasteners as specified.',
        parts: ['BRACKET-001', 'BRACKET-002', 'BRACKET-003', 'BRACKET-004'],
        tools: ['Drill', 'Wrench'],
        duration: 15,
        warnings: ['Do not overtighten bolts'],
        qualityChecks: ['All brackets properly installed', 'Hardware torqued to spec'],
      },
      {
        stepNumber: 9,
        title: 'Final Inspection',
        description: 'Perform complete quality check of assembled crate.',
        parts: [],
        tools: ['Checklist', 'Camera'],
        duration: 15,
        warnings: [],
        qualityChecks: [
          'All fasteners secure',
          'No sharp edges or splinters',
          'Dimensions within tolerance',
          'Markings and labels applied',
        ],
      },
    ];

    return steps;
  }

  private getRequiredTools(): string[] {
    return [
      'Hammer',
      'Nail Gun (optional)',
      'Power Drill',
      'Screwdriver Bits',
      'Tape Measure',
      '4-foot Level',
      'Framing Square',
      'C-Clamps (4)',
      'Safety Glasses',
      'Work Gloves',
      'Pencil/Marker',
      'Ladder (6-foot)',
    ];
  }

  private getAssemblyParts(): AssemblyPart[] {
    const parts: AssemblyPart[] = [];
    const { dimensions, base, cap } = this.config;

    // Add skids
    for (let i = 0; i < base.skidCount; i++) {
      parts.push({
        partNumber: `SKID-00${i + 1}`,
        description: `${base.skidWidth}x4 Skid`,
        quantity: 1,
        material: 'Pine Lumber',
        dimensions: `${base.skidWidth}" x 4" x ${dimensions.length}"`,
      });
    }

    // Add panels
    parts.push(
      {
        partNumber: 'PANEL-FRONT',
        description: 'Front Panel',
        quantity: 1,
        material: 'CDX Plywood',
        dimensions: `${cap.frontPanel.thickness}" x ${dimensions.length}" x ${dimensions.height}"`,
      },
      {
        partNumber: 'PANEL-BACK',
        description: 'Back Panel',
        quantity: 1,
        material: 'CDX Plywood',
        dimensions: `${cap.backPanel.thickness}" x ${dimensions.length}" x ${dimensions.height}"`,
      },
      {
        partNumber: 'PANEL-LEFT',
        description: 'Left Panel',
        quantity: 1,
        material: 'CDX Plywood',
        dimensions: `${cap.leftPanel.thickness}" x ${dimensions.width}" x ${dimensions.height}"`,
      },
      {
        partNumber: 'PANEL-RIGHT',
        description: 'Right Panel',
        quantity: 1,
        material: 'CDX Plywood',
        dimensions: `${cap.rightPanel.thickness}" x ${dimensions.width}" x ${dimensions.height}"`,
      }
    );

    // Add floor
    parts.push({
      partNumber: 'FLOOR-001',
      description: 'Floor Panel',
      quantity: Math.ceil((dimensions.length * dimensions.width) / (48 * 96)),
      material: 'CDX Plywood',
      dimensions: `${base.floorboardThickness}" x 48" x 96"`,
    });

    // Add cleats
    for (let i = 0; i < 4; i++) {
      parts.push({
        partNumber: `CLEAT-00${i + 1}`,
        description: 'Corner Cleat',
        quantity: 1,
        material: 'Pine Lumber',
        dimensions: `2" x 2" x ${dimensions.height * 0.8}"`,
      });
    }

    return parts;
  }

  private calculateAssemblyTime(steps: AssemblyStep[]): number {
    return steps.reduce((total, step) => total + (step.duration || 0), 0);
  }

  private assessDifficulty(): 'easy' | 'medium' | 'hard' {
    const { dimensions, weight } = this.config;
    
    if (dimensions.length > 120 || dimensions.height > 96 || weight.gross > 2000) {
      return 'hard';
    } else if (dimensions.length > 72 || dimensions.height > 60 || weight.gross > 1000) {
      return 'medium';
    }
    return 'easy';
  }

  // ============ Quality Control Checklist Generation ============
  public generateQualityChecklist(type: 'incoming' | 'in-process' | 'final'): QualityChecklist {
    const checklistId = `QC-${type.toUpperCase()}-${Date.now()}`;
    const items = this.getChecklistItems(type);

    return {
      checklistId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Inspection Checklist - ${this.config.projectName}`,
      version: '1.0',
      type,
      items,
      approvalRequired: type === 'final',
      signoffRequired: type === 'final' || type === 'in-process',
    };
  }

  private getChecklistItems(type: 'incoming' | 'in-process' | 'final'): QualityCheckItem[] {
    switch (type) {
      case 'incoming':
        return this.getIncomingQualityChecks();
      case 'in-process':
        return this.getInProcessQualityChecks();
      case 'final':
        return this.getFinalQualityChecks();
      default:
        return [];
    }
  }

  private getIncomingQualityChecks(): QualityCheckItem[] {
    return [
      {
        itemId: 'INC-001',
        description: 'Verify lumber grade and species',
        type: 'visual',
        specification: 'Grade #2 or better, kiln-dried',
        tools: ['Grade stamp reader'],
        frequency: 'batch',
        criticalToQuality: true,
      },
      {
        itemId: 'INC-002',
        description: 'Check moisture content',
        type: 'measurement',
        specification: '≤19%',
        tolerance: '±2%',
        tools: ['Moisture meter'],
        frequency: 'sample',
        criticalToQuality: true,
      },
      {
        itemId: 'INC-003',
        description: 'Measure plywood thickness',
        type: 'measurement',
        specification: '0.75 inches',
        tolerance: '±0.031 inches',
        tools: ['Calipers'],
        frequency: 'each',
        criticalToQuality: false,
      },
      {
        itemId: 'INC-004',
        description: 'Inspect for defects',
        type: 'visual',
        specification: 'No major splits, warping, or damage',
        tools: ['Visual inspection'],
        frequency: 'each',
        criticalToQuality: true,
      },
      {
        itemId: 'INC-005',
        description: 'Verify fastener specifications',
        type: 'documentation',
        specification: 'Match purchase order requirements',
        tools: ['Specification sheet'],
        frequency: 'batch',
        criticalToQuality: false,
      },
    ];
  }

  private getInProcessQualityChecks(): QualityCheckItem[] {
    return [
      {
        itemId: 'PRO-001',
        description: 'Check base frame squareness',
        type: 'measurement',
        specification: 'Diagonal measurements equal',
        tolerance: '±0.25 inches',
        tools: ['Tape measure', 'Square'],
        frequency: 'each',
        criticalToQuality: true,
      },
      {
        itemId: 'PRO-002',
        description: 'Verify skid spacing',
        type: 'measurement',
        specification: `${this.config.dimensions.length / (this.config.base.skidCount - 1)} inches`,
        tolerance: '±0.5 inches',
        tools: ['Tape measure'],
        frequency: 'each',
        criticalToQuality: false,
      },
      {
        itemId: 'PRO-003',
        description: 'Check panel fit and alignment',
        type: 'visual',
        specification: 'Panels flush with no gaps >1/8"',
        tools: ['Feeler gauge'],
        frequency: 'each',
        criticalToQuality: true,
      },
      {
        itemId: 'PRO-004',
        description: 'Verify fastener installation',
        type: 'visual',
        specification: 'Proper depth, no splitting',
        tools: ['Visual inspection'],
        frequency: 'sample',
        criticalToQuality: false,
      },
      {
        itemId: 'PRO-005',
        description: 'Test joint strength',
        type: 'functional',
        specification: 'No movement under hand pressure',
        tools: ['Manual test'],
        frequency: 'sample',
        criticalToQuality: true,
      },
    ];
  }

  private getFinalQualityChecks(): QualityCheckItem[] {
    const { dimensions, weight } = this.config;

    return [
      {
        itemId: 'FIN-001',
        description: 'Verify overall dimensions',
        type: 'measurement',
        specification: `L:${dimensions.length}" W:${dimensions.width}" H:${dimensions.height}"`,
        tolerance: '±0.5 inches',
        tools: ['Tape measure'],
        frequency: 'each',
        criticalToQuality: true,
      },
      {
        itemId: 'FIN-002',
        description: 'Check weight capacity',
        type: 'documentation',
        specification: `Rated for ${weight.maxGross} lbs`,
        tools: ['Load calculation sheet'],
        frequency: 'each',
        criticalToQuality: true,
      },
      {
        itemId: 'FIN-003',
        description: 'Inspect surface finish',
        type: 'visual',
        specification: 'No splinters, rough edges, or protrusions',
        tools: ['Visual and touch inspection'],
        frequency: 'each',
        criticalToQuality: false,
      },
      {
        itemId: 'FIN-004',
        description: 'Verify ventilation openings',
        type: 'measurement',
        specification: 'As per drawing specifications',
        tolerance: '±0.125 inches',
        tools: ['Calipers'],
        frequency: 'each',
        criticalToQuality: false,
      },
      {
        itemId: 'FIN-005',
        description: 'Check marking and labeling',
        type: 'visual',
        specification: 'All required markings present and legible',
        tools: ['Marking checklist'],
        frequency: 'each',
        criticalToQuality: true,
      },
      {
        itemId: 'FIN-006',
        description: 'Perform drop test (if required)',
        type: 'functional',
        specification: 'No structural damage from 12" drop',
        tools: ['Drop test fixture'],
        frequency: 'sample',
        criticalToQuality: true,
      },
      {
        itemId: 'FIN-007',
        description: 'Verify documentation package',
        type: 'documentation',
        specification: 'All certificates and test reports included',
        tools: ['Documentation checklist'],
        frequency: 'each',
        criticalToQuality: false,
      },
    ];
  }

  // ============ Work Instructions Generation ============
  public generateWorkInstructions(operation: string): string {
    const instructions = `
WORK INSTRUCTIONS
==================
Operation: ${operation}
Date: ${new Date().toISOString().split('T')[0]}
Product: ${this.config.projectName} Shipping Crate

SAFETY REQUIREMENTS:
- Safety glasses required at all times
- Steel-toed boots required
- Hearing protection when using power tools
- Dust masks when cutting or sanding

QUALITY STANDARDS:
- All dimensions ±0.5" unless otherwise specified
- Surface roughness: 125 Ra max
- Moisture content: 19% max
- No visible defects affecting structural integrity

PROCESS STEPS:
${this.getProcessSteps(operation)}

INSPECTION POINTS:
${this.getInspectionPoints(operation)}

DOCUMENTATION:
- Record all measurements on QC form
- Note any deviations or non-conformances
- Obtain supervisor approval for any changes
- File completed paperwork with job packet

REVISION HISTORY:
Rev A - ${new Date().toISOString().split('T')[0]} - Initial Release
`;

    return instructions;
  }

  private getProcessSteps(operation: string): string {
    // Generate operation-specific steps
    return `
1. Review drawings and specifications
2. Gather required materials and tools
3. Perform pre-operation safety check
4. Execute operation per standard procedure
5. Perform in-process quality checks
6. Complete operation documentation
7. Move to next operation or storage
`;
  }

  private getInspectionPoints(operation: string): string {
    return `
- First article inspection required
- In-process check every 10 units
- Final inspection 100% for critical dimensions
- Random sampling for non-critical features (AQL 2.5)
`;
  }
}