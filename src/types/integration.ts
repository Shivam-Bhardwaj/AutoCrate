/**
 * Enterprise Integration Types for AutoCrate
 * Defines interfaces for CAD, ERP, and Manufacturing system integrations
 */

// ============ Integration Core Types ============
export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  enabled: boolean;
  authentication?: AuthenticationConfig;
  connectionString?: string;
  apiEndpoint?: string;
  lastSync?: Date;
  syncInterval?: number; // in minutes
  metadata?: Record<string, any>;
}

export type IntegrationType = 
  | 'cad'
  | 'erp'
  | 'manufacturing'
  | 'warehouse'
  | 'quality'
  | 'shipping';

export type IntegrationStatus = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'syncing'
  | 'pending'
  | 'unauthorized';

export interface AuthenticationConfig {
  type: 'api-key' | 'oauth2' | 'basic' | 'certificate' | 'none';
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  certificate?: string;
  tokenUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// ============ CAD Integration Types ============
export interface CADIntegration extends IntegrationConfig {
  type: 'cad';
  cadSystem: CADSystem;
  version?: string;
  supportedFormats: CADFormat[];
  exportOptions?: CADExportOptions;
  importOptions?: CADImportOptions;
}

export type CADSystem = 
  | 'solidworks'
  | 'autocad'
  | 'nx'
  | 'catia'
  | 'creo'
  | 'inventor'
  | 'fusion360';

export type CADFormat = 
  | 'step'
  | 'iges'
  | 'stl'
  | 'dwg'
  | 'dxf'
  | 'sldprt'
  | 'sldasm'
  | 'prt'
  | 'jt'
  | 'sat'
  | 'x_t'
  | 'parasolid';

export interface CADExportOptions {
  format: CADFormat;
  version?: string;
  includeAssembly?: boolean;
  includeDrawings?: boolean;
  includeBOM?: boolean;
  units?: 'inches' | 'mm' | 'cm';
  tolerance?: number;
  tessellation?: TessellationOptions;
}

export interface CADImportOptions {
  format: CADFormat;
  units?: 'inches' | 'mm' | 'cm';
  healing?: boolean;
  simplification?: boolean;
  preserveAssemblyStructure?: boolean;
}

export interface TessellationOptions {
  quality: 'low' | 'medium' | 'high' | 'custom';
  maxDeviation?: number;
  maxEdgeLength?: number;
  angularDeviation?: number;
}

// ============ ERP Integration Types ============
export interface ERPIntegration extends IntegrationConfig {
  type: 'erp';
  erpSystem: ERPSystem;
  modules?: ERPModule[];
  companyCode?: string;
  plant?: string;
  warehouse?: string;
  costCenter?: string;
}

export type ERPSystem = 
  | 'sap'
  | 'oracle'
  | 'microsoft-dynamics'
  | 'netsuite'
  | 'epicor'
  | 'infor';

export type ERPModule = 
  | 'materials-management'
  | 'production-planning'
  | 'sales-distribution'
  | 'finance'
  | 'procurement'
  | 'inventory'
  | 'quality-management';

export interface ERPMaterialData {
  materialNumber: string;
  description: string;
  baseUnit: string;
  materialGroup?: string;
  grossWeight?: number;
  netWeight?: number;
  weightUnit?: string;
  standardPrice?: number;
  currency?: string;
  vendor?: ERPVendor;
  stock?: ERPStock;
}

export interface ERPVendor {
  vendorId: string;
  name: string;
  address?: string;
  leadTime?: number;
  minimumOrderQuantity?: number;
  pricePerUnit?: number;
}

export interface ERPStock {
  quantity: number;
  unit: string;
  location: string;
  reservedQuantity?: number;
  availableQuantity?: number;
  reorderPoint?: number;
  safetyStock?: number;
}

export interface ERPPurchaseOrder {
  orderNumber: string;
  vendor: ERPVendor;
  items: ERPOrderItem[];
  deliveryDate: Date;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'approved' | 'sent' | 'received' | 'closed';
}

export interface ERPOrderItem {
  lineItem: number;
  materialNumber: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  deliveryDate?: Date;
}

// ============ Manufacturing Integration Types ============
export interface ManufacturingIntegration extends IntegrationConfig {
  type: 'manufacturing';
  systemType: ManufacturingSystem;
  capabilities?: ManufacturingCapability[];
  machines?: MachineConfig[];
}

export type ManufacturingSystem = 
  | 'cnc'
  | 'laser-cutting'
  | 'waterjet'
  | 'plasma'
  | '3d-printing'
  | 'assembly-line'
  | 'robotic';

export type ManufacturingCapability = 
  | 'milling'
  | 'turning'
  | 'drilling'
  | 'cutting'
  | 'welding'
  | 'bending'
  | 'forming'
  | 'assembly';

export interface MachineConfig {
  machineId: string;
  name: string;
  type: ManufacturingSystem;
  model?: string;
  capabilities: ManufacturingCapability[];
  postProcessor?: string;
  toolLibrary?: ToolDefinition[];
  workEnvelope?: WorkEnvelope;
}

export interface ToolDefinition {
  toolId: string;
  name: string;
  type: string;
  diameter?: number;
  length?: number;
  flutes?: number;
  material?: string;
}

export interface WorkEnvelope {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  units: 'inches' | 'mm';
}

// ============ Manufacturing Output Types ============
export interface CNCProgram {
  programName: string;
  machineType: string;
  postProcessor: string;
  code: string;
  estimatedTime?: number; // in minutes
  toolList?: ToolDefinition[];
  setupInstructions?: string;
}

export interface LaserCuttingProgram {
  programName: string;
  material: string;
  thickness: number;
  power?: number;
  speed?: number;
  gasType?: string;
  gasPresure?: number;
  pierceTime?: number;
  programCode: string;
  nestingEfficiency?: number;
}

export interface AssemblyInstructions {
  documentId: string;
  title: string;
  version: string;
  steps: AssemblyStep[];
  tools: string[];
  parts: AssemblyPart[];
  estimatedTime?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface AssemblyStep {
  stepNumber: number;
  title: string;
  description: string;
  images?: string[];
  parts: string[];
  tools?: string[];
  duration?: number; // in minutes
  warnings?: string[];
  qualityChecks?: string[];
}

export interface AssemblyPart {
  partNumber: string;
  description: string;
  quantity: number;
  material?: string;
  finish?: string;
  dimensions?: string;
}

export interface QualityChecklist {
  checklistId: string;
  name: string;
  version: string;
  type: 'incoming' | 'in-process' | 'final';
  items: QualityCheckItem[];
  approvalRequired?: boolean;
  signoffRequired?: boolean;
}

export interface QualityCheckItem {
  itemId: string;
  description: string;
  type: 'visual' | 'measurement' | 'functional' | 'documentation';
  specification?: string;
  tolerance?: string;
  tools?: string[];
  frequency?: 'each' | 'batch' | 'sample';
  criticalToQuality?: boolean;
}

// ============ Integration Management Types ============
export interface IntegrationJob {
  jobId: string;
  integrationType: IntegrationType;
  integrationId: string;
  operation: IntegrationOperation;
  status: JobStatus;
  progress?: number;
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: string;
  retryCount?: number;
  maxRetries?: number;
}

export type IntegrationOperation = 
  | 'export'
  | 'import'
  | 'sync'
  | 'validate'
  | 'transform'
  | 'generate';

export type JobStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'retrying';

export interface IntegrationTemplate {
  templateId: string;
  name: string;
  description?: string;
  integrationType: IntegrationType;
  configuration: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  tags?: string[];
}

export interface IntegrationHealth {
  integrationId: string;
  status: IntegrationStatus;
  lastCheckTime: Date;
  responseTime?: number; // in ms
  errorCount?: number;
  successRate?: number; // percentage
  uptime?: number; // percentage
  details?: Record<string, any>;
}

// ============ File Format Conversion Types ============
export interface FileConversion {
  conversionId: string;
  sourceFormat: string;
  targetFormat: string;
  status: JobStatus;
  sourceFile?: File | Blob;
  sourceUrl?: string;
  targetFile?: File | Blob;
  targetUrl?: string;
  options?: ConversionOptions;
  progress?: number;
  error?: string;
}

export interface ConversionOptions {
  quality?: 'low' | 'medium' | 'high';
  units?: 'inches' | 'mm' | 'cm';
  scale?: number;
  preserveStructure?: boolean;
  optimize?: boolean;
  compress?: boolean;
}

// ============ Batch Export Types ============
export interface BatchExport {
  batchId: string;
  name: string;
  exports: ExportItem[];
  status: JobStatus;
  progress?: number;
  startTime?: Date;
  endTime?: Date;
  outputFormat?: 'zip' | 'folder';
  outputPath?: string;
}

export interface ExportItem {
  itemId: string;
  name: string;
  type: string;
  format: string;
  status: JobStatus;
  progress?: number;
  outputFile?: string;
  error?: string;
}

// ============ Version Control Types ============
export interface VersionedFile {
  fileId: string;
  fileName: string;
  version: string;
  format: string;
  size: number;
  checksum?: string;
  createdAt: Date;
  createdBy?: string;
  comment?: string;
  tags?: string[];
  previousVersion?: string;
  isLatest: boolean;
}

export interface VersionHistory {
  fileId: string;
  versions: VersionedFile[];
  currentVersion: string;
  totalVersions: number;
}