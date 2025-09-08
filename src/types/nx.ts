export interface NXExportOptions {
  format: 'jt' | 'step' | 'exp' | 'prt';
  version: '2022' | '2019' | '12';
  includeAssembly: boolean;
  includeDrawings: boolean;
  applyMaterialsStandards: boolean;
  partNumberPrefix: string;
}

export interface AppliedMaterialsStandards {
  partNumberFormat: string;
  tcEngineeringFormat: string;
  titleBlockTemplate: string;
  materialSpecifications: MaterialSpecification[];
  fastenerSpecifications: FastenerSpecification[];
  complianceStandards: string[];
}

export interface MaterialSpecification {
  id: string;
  name: string;
  type: 'lumber' | 'plywood' | 'hardware';
  grade: string;
  dimensions?: string;
  supplier?: string;
  specifications: Record<string, any>;
}

export interface FastenerSpecification {
  id: string;
  type: 'lag_bolt' | 'screw' | 'nail';
  size: string;
  material: string;
  finish: string;
  quantity: number;
  location: string;
}

export interface TCEngineeringNumber {
  prefix: 'TC2';
  sequence: string;
  revision: string;
  fullNumber: string;
}

export interface JTExportData {
  geometry: ArrayBuffer;
  metadata: JTMetadata;
  assembly: JTAssemblyNode[];
  materials: JTMaterial[];
}

export interface JTMetadata {
  title: string;
  author: string;
  description: string;
  created: Date;
  modified: Date;
  version: string;
  units: 'inches' | 'mm';
  partNumber: string;
  tcNumber: string;
}

export interface JTAssemblyNode {
  id: string;
  name: string;
  partNumber: string;
  tcNumber: string;
  transform: number[];
  children: JTAssemblyNode[];
  geometry?: ArrayBuffer;
  material?: string;
}

export interface JTMaterial {
  id: string;
  name: string;
  color: [number, number, number];
  opacity: number;
  properties: Record<string, any>;
}

export interface NXDrawingTemplate {
  templatePath: string;
  titleBlock: TitleBlockData;
  projectionType: 'third_angle' | 'first_angle';
  standard: 'ASME_Y14.5_2009' | 'ISO_14405';
  sheetSize: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface TitleBlockData {
  projectName: string;
  partNumber: string;
  tcNumber: string;
  revision: string;
  drawnBy: string;
  checkedBy: string;
  approvedBy: string;
  date: Date;
  scale: string;
  material: string;
  finish: string;
}

export interface NXExpressionFile {
  parameters: NXParameter[];
  expressions: NXExpression[];
  features: NXFeature[];
}

export interface NXParameter {
  name: string;
  type: 'length' | 'angle' | 'real' | 'integer' | 'string';
  value: any;
  units?: string;
  description?: string;
}

export interface NXExpression {
  name: string;
  formula: string;
  description?: string;
}

export interface NXFeature {
  type: 'block' | 'extrude' | 'revolve' | 'hole' | 'fillet';
  parameters: Record<string, any>;
  constraints: NXConstraint[];
}

export interface NXConstraint {
  type: 'distance' | 'angle' | 'parallel' | 'perpendicular' | 'concentric';
  entities: string[];
  value?: number;
}

export interface AssemblyStructure {
  rootAssembly: AssemblyComponent;
  components: AssemblyComponent[];
  constraints: AssemblyConstraint[];
  bomStructure: BOMItem[];
}

export interface AssemblyComponent {
  id: string;
  name: string;
  partNumber: string;
  tcNumber: string;
  filePath: string;
  transform: number[];
  children: string[];
  parent?: string;
}

export interface AssemblyConstraint {
  id: string;
  type: 'mate' | 'align' | 'distance' | 'angle';
  component1: string;
  component2: string;
  geometry1: string;
  geometry2: string;
  value?: number;
}

export interface BOMItem {
  itemNumber: number;
  partNumber: string;
  tcNumber: string;
  description: string;
  quantity: number;
  material: string;
  dimensions: string;
  weight: number;
  supplier?: string;
  notes?: string;
}