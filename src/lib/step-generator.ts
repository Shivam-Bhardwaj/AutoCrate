// STEP File Generator for Crate Model
// Generates AP242 (latest) STEP files with BREP solids and basic PMI data

import { NXBox } from './nx-generator'

type DirectionKey = 'X_POS' | 'Y_POS' | 'Z_POS' | 'X_NEG' | 'Y_NEG' | 'Z_NEG'

interface StepGenerationOptions {
  includePMI?: boolean
}

interface StepContexts {
  applicationContext: string
  protocol: string
  mechanicalContext: string
  productContext: string
  designContext: string
  lengthUnit: string
  planeAngleUnit: string
  solidAngleUnit: string
  uncertainty: string
  geomContext: string
  assemblyProduct: string
  assemblyProductDefFormation: string
  assemblyProductDef: string
  assemblyProductDefShape: string
}

interface ProductDefinition {
  product: string
  productDefFormation: string
  productDef: string
  productDefShape: string
}

interface SolidResult {
  solidId: string
  origin: [number, number, number]
  name: string
}

interface Classification {
  topKey: string
  topName: string
  subKey?: string
  subName?: string
}

interface PartOccurrence {
  box: NXBox
  globalPlacementId: string
}

interface PartGroup {
  baseName: string
  aggregatedName: string
  escapedName: string
  product: ProductDefinition
  shapeRepId: string
  localPlacementId: string
  classification: Classification
  occurrences: PartOccurrence[]
}

interface PartReference {
  group: PartGroup
  occurrence: PartOccurrence
}

interface SubAssembly {
  key: string
  name: string
  escapedName: string
  product: ProductDefinition
  localPlacementId: string
  globalPlacementId: string
  shapeRepId?: string
  parts: PartReference[]
}

interface TopLevelAssembly {
  key: string
  name: string
  escapedName: string
  product: ProductDefinition
  localPlacementId: string
  globalPlacementId: string
  shapeRepId?: string
  parts: PartReference[]
  subAssemblies: Map<string, SubAssembly>
}

interface VertexData {
  pointId: string
  vertexId: string
}

interface BoundingBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

const INCH_TO_MM = 25.4
const EPSILON = 1e-6

const SKID_DIMENSION_MAP = [
  { actual: 7.25, nominal: '8' },
  { actual: 5.5, nominal: '6' },
  { actual: 3.5, nominal: '4' },
  { actual: 2.5, nominal: '3' },
  { actual: 1.5, nominal: '2' }
]

export class StepGenerator {
  private entityId = 1
  private entities: string[] = []
  private readonly boxes: NXBox[]
  private readonly options: StepGenerationOptions
  private directions = new Map<DirectionKey, string>()
  private contexts!: StepContexts
  private colorStyles = new Map<string, string>()

  constructor(boxes: NXBox[], options: StepGenerationOptions = {}) {
    this.boxes = boxes.filter(box => !box.suppressed)
    this.options = { includePMI: true, ...options }
  }

  private reset() {
    this.entityId = 1
    this.entities = []
    this.directions = new Map()
    this.colorStyles = new Map()
  }

  private getNextId(): string {
    return `#${this.entityId++}`
  }

  private addEntity(entity: string): string {
    const id = this.getNextId()
    this.entities.push(`${id}=${entity};`)
    return id
  }

  private escape(value: string): string {
    return value.replace(/'/g, "''")
  }

  private ensureDirection(key: DirectionKey, vector: [number, number, number]): string {
    if (this.directions.has(key)) {
      return this.directions.get(key)!
    }
    const id = this.addEntity(`DIRECTION('',(${vector[0]},${vector[1]},${vector[2]}))`)
    this.directions.set(key, id)
    return id
  }

  private initializeDirections() {
    this.ensureDirection('X_POS', [1, 0, 0])
    this.ensureDirection('Y_POS', [0, 1, 0])
    this.ensureDirection('Z_POS', [0, 0, 1])
    this.ensureDirection('X_NEG', [-1, 0, 0])
    this.ensureDirection('Y_NEG', [0, -1, 0])
    this.ensureDirection('Z_NEG', [0, 0, -1])
  }

  private createContexts(productName: string): StepContexts {
    const escaped = this.escape(productName)
    const applicationContext = this.addEntity(`APPLICATION_CONTEXT('mechanical design')`)
    const protocol = this.addEntity(
      `APPLICATION_PROTOCOL_DEFINITION('international standard','ap242_managed_model_based_3d_engineering_mim_latest',2020,${applicationContext})`
    )
    const mechanicalContext = this.addEntity(`MECHANICAL_CONTEXT('',${applicationContext},'mechanical')`)
    const productContext = this.addEntity(`PRODUCT_CONTEXT('${escaped}',${applicationContext},'design')`)
    const designContext = this.addEntity(`DESIGN_CONTEXT('${escaped}',${applicationContext},'design')`)

    const planeAngleUnit = this.addEntity(`(NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.))`)
    const solidAngleUnit = this.addEntity(`(NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT())`)
    const lengthUnit = this.addEntity(`(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.))`)
    const uncertainty = this.addEntity(
      `UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.01),${lengthUnit},'distance accuracy','')`
    )

    const geomContext = this.addEntity(
      `(GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNIT_ASSIGNED_CONTEXT((${lengthUnit},${planeAngleUnit},${solidAngleUnit}))GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((${uncertainty}))REPRESENTATION_CONTEXT('','3D'))`
    )

    const assemblyProduct = this.addEntity(`PRODUCT('${escaped}','${escaped}','',(${mechanicalContext}))`)
    const assemblyProductDefFormation = this.addEntity(`PRODUCT_DEFINITION_FORMATION('','',${assemblyProduct})`)
    const assemblyProductDef = this.addEntity(
      `PRODUCT_DEFINITION('crate definition','',${assemblyProductDefFormation},${designContext})`
    )
    const assemblyProductDefShape = this.addEntity(`PRODUCT_DEFINITION_SHAPE('','',${assemblyProductDef})`)

    return {
      applicationContext,
      protocol,
      mechanicalContext,
      productContext,
      designContext,
      lengthUnit,
      planeAngleUnit,
      solidAngleUnit,
      uncertainty,
      geomContext,
      assemblyProduct,
      assemblyProductDefFormation,
      assemblyProductDef,
      assemblyProductDefShape
    }
  }

  private createComponentProduct(name: string): ProductDefinition {
    const escaped = this.escape(name)
    const product = this.addEntity(`PRODUCT('${escaped}','${escaped}','',(${this.contexts.mechanicalContext}))`)
    const productDefFormation = this.addEntity(`PRODUCT_DEFINITION_FORMATION('','',${product})`)
    const productDef = this.addEntity(
      `PRODUCT_DEFINITION('${escaped} definition','',${productDefFormation},${this.contexts.designContext})`
    )
    const productDefShape = this.addEntity(`PRODUCT_DEFINITION_SHAPE('','',${productDef})`)
    return { product, productDefFormation, productDef, productDefShape }
  }

  private toSnakeCase(value: string): string {
    const cleaned = value.replace(/\\/g, '/').split('/').pop() || value
    const withoutExt = cleaned.replace(/\.[^\.]+$/, '')
    return withoutExt
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase()
      || 'component'
  }

  private getPanelAssemblyName(panelName: string): string {
    const mapping: Record<string, string> = {
      TOP_PANEL: 'TOP_PANEL_ASSEMBLY',
      FRONT_PANEL: 'FRONT_END_PANEL_ASSEMBLY',
      BACK_PANEL: 'BACK_END_PANEL_ASSEMBLY',
      LEFT_END_PANEL: 'LEFT_SIDE_PANEL_ASSEMBLY',
      RIGHT_END_PANEL: 'RIGHT_SIDE_PANEL_ASSEMBLY'
    }
    if (mapping[panelName]) {
      return mapping[panelName]
    }
    const snake = this.toSnakeCase(panelName)
    return `${snake.toUpperCase()}_ASSEMBLY`
  }

  private findNominal(valueInches: number, candidates: { actual: number; nominal: string }[], tolerance = 0.3): string | null {
    for (const { actual, nominal } of candidates) {
      if (Math.abs(valueInches - actual) <= tolerance) {
        return nominal
      }
    }
    return null
  }

  private componentBaseName(box: NXBox): string {
    const panelSnake = box.panelName ? this.toSnakeCase(box.panelName) : ''
    const metadata = (box.metadata || '').toLowerCase()

    if (metadata.includes('stencil') || metadata.includes('decal')) {
      return 'stencil'
    }

    if (metadata.includes('fastener')) {
      return 'fastener'
    }

    switch (box.type) {
      case 'skid':
        {
          const metrics = this.getBoxMetrics(box)
          const widthInches = metrics.width / INCH_TO_MM
          const heightInches = metrics.height / INCH_TO_MM
          const widthNominal = this.findNominal(widthInches, SKID_DIMENSION_MAP)
          const heightNominal = this.findNominal(heightInches, SKID_DIMENSION_MAP)
          if (widthNominal && heightNominal) {
            return `skid_${heightNominal}x${widthNominal}`
          }
          return 'skid'
        }
      case 'floor':
        {
          if (metadata.includes('custom')) {
            return 'floorboard_custom'
          }
          const nominalMatch = metadata.match(/(\d+x\d+)/)
          if (nominalMatch) {
            return `floorboard_${nominalMatch[1].toLowerCase()}`
          }
          return 'floorboard'
        }
      case 'klimp':
        return 'klimp_fastener'
      case 'cleat':
        return panelSnake ? `${panelSnake}_cleat` : 'cleat'
      case 'plywood':
        return panelSnake ? `${panelSnake}_ply` : 'plywood'
      case 'panel':
        return panelSnake ? `${panelSnake}_panel` : 'panel'
      default:
        if (box.name) {
          const snake = this.toSnakeCase(box.name)
          if (snake) {
            return snake
          }
        }
        if (box.type) {
          return this.toSnakeCase(box.type)
        }
        return 'component'
    }
  }

  private classifyBox(box: NXBox): Classification {
    const type = box.type ?? 'misc'
    const panelName = box.panelName ?? ''
    const metadata = (box.metadata || '').toLowerCase()

    // SHIPPING_BASE assemblies
    if (type === 'skid') {
      return {
        topKey: 'SHIPPING_BASE',
        topName: 'SHIPPING_BASE',
        subKey: 'SHIPPING_BASE::SKID_ASSEMBLY',
        subName: 'SKID_ASSEMBLY'
      }
    }

    if (type === 'floor') {
      return {
        topKey: 'SHIPPING_BASE',
        topName: 'SHIPPING_BASE',
        subKey: 'SHIPPING_BASE::FLOORBOARD_ASSEMBLY',
        subName: 'FLOORBOARD_ASSEMBLY'
      }
    }

    // FASTENERS top-level assembly: all nuts/bolts/klimps and hardware
    if (type === 'klimp' || metadata.includes('fastener') || type === 'hardware') {
      return {
        topKey: 'FASTENERS',
        topName: 'FASTENERS'
      }
    }

    // STENCILS top-level assembly: markings/decals
    if (metadata.includes('stencil') || metadata.includes('decal')) {
      return {
        topKey: 'STENCILS',
        topName: 'STENCILS'
      }
    }

    // CRATE_CAP assemblies (panels)
    const topKey = 'CRATE_CAP'
    const topName = 'CRATE_CAP'

    if (panelName) {
      const subName = this.getPanelAssemblyName(panelName)
      return {
        topKey,
        topName,
        subKey: `${topKey}::${subName}`,
        subName
      }
    }

    // Boxes without a panelName live directly under CRATE_CAP with no misc subassembly
    return {
      topKey,
      topName
    }
  }

  private getBoxMetrics(box: NXBox) {
    const x1 = Math.min(box.point1.x, box.point2.x) * INCH_TO_MM
    const x2 = Math.max(box.point1.x, box.point2.x) * INCH_TO_MM
    const y1 = Math.min(box.point1.y, box.point2.y) * INCH_TO_MM
    const y2 = Math.max(box.point1.y, box.point2.y) * INCH_TO_MM
    const z1 = Math.min(box.point1.z, box.point2.z) * INCH_TO_MM
    const z2 = Math.max(box.point1.z, box.point2.z) * INCH_TO_MM

    const width = x2 - x1
    const length = y2 - y1
    const height = z2 - z1

    return { x1, x2, y1, y2, z1, z2, width, length, height }
  }

  private uniqueComponentName(base: string, _count: number, usedNames: Map<string, number>): string {
    let candidate = base
    let suffix = 1
    while (usedNames.has(candidate)) {
      suffix += 1
      candidate = `${base}_${suffix}`
    }
    usedNames.set(candidate, 1)
    return candidate
  }

  private ensureColorStyle(colorHex?: string): string | null {
    if (!colorHex) {
      return null
    }

    let hex = colorHex.trim()
    if (hex.startsWith('#')) {
      hex = hex.slice(1)
    }
    if (hex.length !== 6) {
      return null
    }
    const key = hex.toUpperCase()
    if (this.colorStyles.has(key)) {
      return this.colorStyles.get(key)!
    }

    const r = parseInt(key.slice(0, 2), 16) / 255
    const g = parseInt(key.slice(2, 4), 16) / 255
    const b = parseInt(key.slice(4, 6), 16) / 255

    const colourId = this.addEntity(`COLOUR_RGB('',${r.toFixed(6)},${g.toFixed(6)},${b.toFixed(6)})`)
    const fillColourId = this.addEntity(`FILL_AREA_STYLE_COLOUR('',${colourId})`)
    const fillAreaId = this.addEntity(`FILL_AREA_STYLE('',(${fillColourId}))`)
    const surfaceFillId = this.addEntity(`SURFACE_STYLE_FILL_AREA(${fillAreaId})`)
    const surfaceUsageId = this.addEntity(`SURFACE_STYLE_USAGE(.BOTH.,${surfaceFillId})`)
    const styleAssignmentId = this.addEntity(`PRESENTATION_STYLE_ASSIGNMENT((${surfaceUsageId}))`)

    this.colorStyles.set(key, styleAssignmentId)
    return styleAssignmentId
  }

  private applyColorStyle(solidId: string, colorHex?: string) {
    const styleId = this.ensureColorStyle(colorHex)
    if (!styleId) {
      return
    }
    this.addEntity(`STYLED_ITEM('',(${styleId}),${solidId})`)
  }

  private ensureTopLevelAssembly(
    topGroups: Map<string, TopLevelAssembly>,
    key: string,
    name: string
  ): TopLevelAssembly {
    let group = topGroups.get(key)
    if (group) {
      return group
    }

    const product = this.createComponentProduct(name)
    const localPlacementId = this.createAxisPlacement(`${name}_LOCAL`, [0, 0, 0])
    const globalPlacementId = this.createAxisPlacement(`${name}_ASM`, [0, 0, 0])

    group = {
      key,
      name,
      escapedName: this.escape(name),
      product,
      localPlacementId,
      globalPlacementId,
      parts: [],
      subAssemblies: new Map<string, SubAssembly>()
    }

    topGroups.set(key, group)
    return group
  }

  private createAxisPlacement(label: string, origin: [number, number, number]): string {
    const escapedLabel = this.escape(label)
    const pointId = this.addEntity(`CARTESIAN_POINT('',(${origin[0]},${origin[1]},${origin[2]}))`)
    return this.addEntity(
      `AXIS2_PLACEMENT_3D('${escapedLabel}',${pointId},${this.ensureDirection('Z_POS', [0, 0, 1])},${this.ensureDirection('X_POS', [1, 0, 0])})`
    )
  }

  private formatDisplayName(identifier: string): string {
    return identifier
      .toLowerCase()
      .split(/[_\s]+/)
      .filter(Boolean)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ')
  }

  private buildHeader(): string {
    return [
      'ISO-10303-21;',
      'HEADER;',
      `FILE_DESCRIPTION(('AutoCrate crate model with PMI'),'2;1');`,
      `FILE_NAME('crate_model.step','${new Date().toISOString()}',('AutoCrate'),('AutoCrate Codex'),'AutoCrate STEP Generator','AutoCrate Codex','');`,
      `FILE_SCHEMA(('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LATEST'));`,
      'ENDSEC;'
    ].join('\n')
  }

  private directionVector(key: DirectionKey): [number, number, number] {
    switch (key) {
      case 'X_POS': return [1, 0, 0]
      case 'X_NEG': return [-1, 0, 0]
      case 'Y_POS': return [0, 1, 0]
      case 'Y_NEG': return [0, -1, 0]
      case 'Z_POS': return [0, 0, 1]
      case 'Z_NEG': return [0, 0, -1]
    }
  }

  private createEdge(vertexStart: VertexData, vertexEnd: VertexData, directionKey: DirectionKey, length: number): string {
    const directionId = this.ensureDirection(directionKey, this.directionVector(directionKey))
    const vectorId = this.addEntity(`VECTOR('',${directionId},${length})`)
    const lineId = this.addEntity(`LINE('',${vertexStart.pointId},${vectorId})`)
    return this.addEntity(`EDGE_CURVE('',${vertexStart.vertexId},${vertexEnd.vertexId},${lineId},.T.)`)
  }

  private createOrientedEdge(edgeId: string, orientation: boolean): string {
    return this.addEntity(`ORIENTED_EDGE('',*,*,${edgeId},${orientation ? '.T.' : '.F.'})`)
  }

  private createPlane(pointId: string, normalKey: DirectionKey, refDirectionKey: DirectionKey): string {
    const normalId = this.ensureDirection(normalKey, this.directionVector(normalKey))
    const refId = this.ensureDirection(refDirectionKey, this.directionVector(refDirectionKey))
    const axisId = this.addEntity(`AXIS2_PLACEMENT_3D('',${pointId},${normalId},${refId})`)
    return this.addEntity(`PLANE('',${axisId})`)
  }

  private createFace(orientedEdgeIds: string[], planeId: string): string {
    const loopId = this.addEntity(`EDGE_LOOP('',(${orientedEdgeIds.join(',')}))`)
    const boundId = this.addEntity(`FACE_OUTER_BOUND('',${loopId},.T.)`)
    return this.addEntity(`ADVANCED_FACE('',(${boundId}),${planeId},.T.)`)
  }

  private createBoxSolid(box: NXBox, overrideName?: string): SolidResult | null {
    const metrics = this.getBoxMetrics(box)
    const { x1, y1, z1, width, length, height } = metrics

    if (width < EPSILON || length < EPSILON || height < EPSILON) {
      return null
    }

    const vertices = [
      { x: 0, y: 0, z: 0 },              // v0
      { x: width, y: 0, z: 0 },          // v1
      { x: width, y: length, z: 0 },     // v2
      { x: 0, y: length, z: 0 },         // v3
      { x: 0, y: 0, z: height },         // v4
      { x: width, y: 0, z: height },     // v5
      { x: width, y: length, z: height },// v6
      { x: 0, y: length, z: height }     // v7
    ]

    const vertexData: VertexData[] = vertices.map(v => {
      const pointId = this.addEntity(`CARTESIAN_POINT('',(${v.x},${v.y},${v.z}))`)
      const vertexId = this.addEntity(`VERTEX_POINT('',${pointId})`)
      return { pointId, vertexId }
    })

    const edges = [
      { start: 0, end: 1, direction: 'X_POS' as DirectionKey, length: width },  // e0
      { start: 1, end: 2, direction: 'Y_POS' as DirectionKey, length: length }, // e1
      { start: 3, end: 2, direction: 'X_POS' as DirectionKey, length: width },  // e2
      { start: 0, end: 3, direction: 'Y_POS' as DirectionKey, length: length }, // e3
      { start: 4, end: 5, direction: 'X_POS' as DirectionKey, length: width },  // e4
      { start: 5, end: 6, direction: 'Y_POS' as DirectionKey, length: length }, // e5
      { start: 7, end: 6, direction: 'X_POS' as DirectionKey, length: width },  // e6
      { start: 4, end: 7, direction: 'Y_POS' as DirectionKey, length: length }, // e7
      { start: 0, end: 4, direction: 'Z_POS' as DirectionKey, length: height }, // e8
      { start: 1, end: 5, direction: 'Z_POS' as DirectionKey, length: height }, // e9
      { start: 2, end: 6, direction: 'Z_POS' as DirectionKey, length: height }, // e10
      { start: 3, end: 7, direction: 'Z_POS' as DirectionKey, length: height }  // e11
    ]

    const edgeCurveIds = edges.map(edge =>
      this.createEdge(vertexData[edge.start], vertexData[edge.end], edge.direction, edge.length)
    )

    const oriented = (index: number, orientation: boolean) => this.createOrientedEdge(edgeCurveIds[index], orientation)
    const centerPoint = (x: number, y: number, z: number) => this.addEntity(`CARTESIAN_POINT('',(${x},${y},${z}))`)

    const faceIds: string[] = []

    // Bottom face (z = 0, normal -Z)
    const bottomCenter = centerPoint(width / 2, length / 2, 0)
    const bottomPlane = this.createPlane(bottomCenter, 'Z_NEG', 'X_POS')
    faceIds.push(
      this.createFace([
        oriented(0, true),
        oriented(1, true),
        oriented(2, false),
        oriented(3, false)
      ], bottomPlane)
    )

    // Top face (z = height, normal +Z)
    const topCenter = centerPoint(width / 2, length / 2, height)
    const topPlane = this.createPlane(topCenter, 'Z_POS', 'X_POS')
    faceIds.push(
      this.createFace([
        oriented(4, true),
        oriented(5, true),
        oriented(6, false),
        oriented(7, false)
      ], topPlane)
    )

    // Front face (y = 0, normal -Y)
    const frontCenter = centerPoint(width / 2, 0, height / 2)
    const frontPlane = this.createPlane(frontCenter, 'Y_NEG', 'X_POS')
    faceIds.push(
      this.createFace([
        oriented(0, true),
        oriented(9, true),
        oriented(4, false),
        oriented(8, false)
      ], frontPlane)
    )

    // Back face (y = length, normal +Y)
    const backCenter = centerPoint(width / 2, length, height / 2)
    const backPlane = this.createPlane(backCenter, 'Y_POS', 'X_POS')
    faceIds.push(
      this.createFace([
        oriented(11, true),
        oriented(6, true),
        oriented(10, false),
        oriented(2, false)
      ], backPlane)
    )

    // Left face (x = 0, normal -X)
    const leftCenter = centerPoint(0, length / 2, height / 2)
    const leftPlane = this.createPlane(leftCenter, 'X_NEG', 'Y_POS')
    faceIds.push(
      this.createFace([
        oriented(3, true),
        oriented(11, true),
        oriented(7, false),
        oriented(8, false)
      ], leftPlane)
    )

    // Right face (x = width, normal +X)
    const rightCenter = centerPoint(width, length / 2, height / 2)
    const rightPlane = this.createPlane(rightCenter, 'X_POS', 'Y_POS')
    faceIds.push(
      this.createFace([
        oriented(9, true),
        oriented(5, true),
        oriented(10, false),
        oriented(1, false)
      ], rightPlane)
    )

    const shellId = this.addEntity(`CLOSED_SHELL('',(${faceIds.join(',')}))`)
    const solidLabel = overrideName || box.name || 'CRATE_COMPONENT'
    const solidName = this.escape(solidLabel)
    const solidId = this.addEntity(`MANIFOLD_SOLID_BREP('${solidName}',${shellId})`)
    return {
      solidId,
      origin: [x1, y1, z1],
      name: solidLabel
    }
  }

  private createPartGroups(): PartGroup[] {
    const usedNames = new Map<string, number>()
    const grouped = new Map<string, {
      baseName: string
      classification: Classification
      boxes: { box: NXBox; origin: [number, number, number] }[]
    }>()

    for (const box of this.boxes) {
      const metrics = this.getBoxMetrics(box)
      if (metrics.width < EPSILON || metrics.length < EPSILON || metrics.height < EPSILON) {
        continue
      }

      const classification = this.classifyBox(box)
      const baseName = this.componentBaseName(box)
      const geometryKey = [
        classification.topKey,
        classification.subKey ?? '',
        baseName,
        box.type ?? '',
        box.panelName ?? '',
        box.color ?? '',
        metrics.width.toFixed(6),
        metrics.length.toFixed(6),
        metrics.height.toFixed(6)
      ].join('|')

      if (!grouped.has(geometryKey)) {
        grouped.set(geometryKey, {
          baseName,
          classification,
          boxes: []
        })
      }

      grouped.get(geometryKey)!.boxes.push({
        box,
        origin: [metrics.x1, metrics.y1, metrics.z1]
      })
    }

    const partGroups: PartGroup[] = []

    for (const { baseName, classification, boxes } of grouped.values()) {
      if (boxes.length === 0) {
        continue
      }

      const count = boxes.length
      const aggregatedName = this.uniqueComponentName(baseName, count, usedNames)
      const solidResult = this.createBoxSolid(boxes[0].box, baseName)
      if (!solidResult) {
        continue
      }

      this.applyColorStyle(solidResult.solidId, boxes[0].box.color)

      const escapedName = this.escape(aggregatedName)
      const product = this.createComponentProduct(aggregatedName)
      const shapeRepId = this.addEntity(
        `ADVANCED_BREP_SHAPE_REPRESENTATION('${escapedName}',(${solidResult.solidId}),${this.contexts.geomContext})`
      )
      this.addEntity(`SHAPE_DEFINITION_REPRESENTATION(${product.productDefShape},${shapeRepId})`)

      const localPlacementId = this.createAxisPlacement(`${aggregatedName}_LOCAL`, [0, 0, 0])

      const occurrences: PartOccurrence[] = boxes.map((entry, occurrenceIndex) => {
        const placementLabel = `${aggregatedName}_ASM_${occurrenceIndex + 1}`
        const globalPlacementId = this.createAxisPlacement(placementLabel, entry.origin)
        return {
          box: entry.box,
          globalPlacementId
        }
      })

      partGroups.push({
        baseName,
        aggregatedName,
        escapedName,
        product,
        shapeRepId,
        localPlacementId,
        classification,
        occurrences
      })
    }

    return partGroups
  }

  private buildAssemblyStructure(partGroups: PartGroup[], assemblyName: string, assemblyNameEscaped: string) {
    const topGroups = new Map<string, TopLevelAssembly>()

    for (const group of partGroups) {
      const classification = group.classification
      const topGroup = this.ensureTopLevelAssembly(topGroups, classification.topKey, classification.topName)

      if (classification.subName) {
        const subKey = classification.subKey ?? `${classification.topKey}::${classification.subName}`
        let subGroup = topGroup.subAssemblies.get(subKey)

        if (!subGroup) {
          const product = this.createComponentProduct(classification.subName)
          const localPlacementId = this.createAxisPlacement(`${classification.subName}_LOCAL`, [0, 0, 0])
          const globalPlacementId = this.createAxisPlacement(`${classification.subName}_ASM`, [0, 0, 0])

          subGroup = {
            key: subKey,
            name: classification.subName,
            escapedName: this.escape(classification.subName),
            product,
            localPlacementId,
            globalPlacementId,
            parts: []
          }

          topGroup.subAssemblies.set(subKey, subGroup)
        }

        for (const occurrence of group.occurrences) {
          subGroup.parts.push({ group, occurrence })
        }
      } else {
        for (const occurrence of group.occurrences) {
          topGroup.parts.push({ group, occurrence })
        }
      }
    }

    // Ensure required top-level assemblies exist even if they currently have no parts
    this.ensureTopLevelAssembly(topGroups, 'SHIPPING_BASE', 'SHIPPING_BASE')
    this.ensureTopLevelAssembly(topGroups, 'CRATE_CAP', 'CRATE_CAP')
    this.ensureTopLevelAssembly(topGroups, 'FASTENERS', 'FASTENERS')
    this.ensureTopLevelAssembly(topGroups, 'STENCILS', 'STENCILS')

    const topGroupList = Array.from(topGroups.values())
    const rootPlacements = topGroupList.map(group => group.globalPlacementId)
    const rootItems = rootPlacements.length > 0 ? `(${rootPlacements.join(',')})` : '()'
    const rootShapeRepId = this.addEntity(
      `SHAPE_REPRESENTATION('${assemblyNameEscaped}',${rootItems},${this.contexts.geomContext})`
    )
    this.addEntity(`SHAPE_DEFINITION_REPRESENTATION(${this.contexts.assemblyProductDefShape},${rootShapeRepId})`)

    let occurrenceIndex = 1

    for (const topGroup of topGroupList) {
      const subAssemblies = Array.from(topGroup.subAssemblies.values())
      const childPlacements = [
        ...subAssemblies.map(sub => sub.globalPlacementId),
        ...topGroup.parts.map(ref => ref.occurrence.globalPlacementId)
      ]
      const topItems = childPlacements.length > 0 ? `(${childPlacements.join(',')})` : '()'
      const topShapeRepId = this.addEntity(
        `SHAPE_REPRESENTATION('${topGroup.escapedName}',${topItems},${this.contexts.geomContext})`
      )
      this.addEntity(`SHAPE_DEFINITION_REPRESENTATION(${topGroup.product.productDefShape},${topShapeRepId})`)
      topGroup.shapeRepId = topShapeRepId

      const topTransformId = this.addEntity(
        `ITEM_DEFINED_TRANSFORMATION('${topGroup.escapedName}_TRANSFORM_${occurrenceIndex}','',${topGroup.localPlacementId},${topGroup.globalPlacementId})`
      )
      const topRelationId = this.addEntity(
        `( REPRESENTATION_RELATIONSHIP('${topGroup.escapedName}','',${rootShapeRepId},${topShapeRepId}) REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION(${topTransformId}) SHAPE_REPRESENTATION_RELATIONSHIP() )`
      )
      const topOccurrenceName = `NAUO_${occurrenceIndex++}`
      const topUsageId = this.addEntity(
        `NEXT_ASSEMBLY_USAGE_OCCURRENCE('${topOccurrenceName}','${topGroup.escapedName}','',${this.contexts.assemblyProductDef},${topGroup.product.productDef},$)`
      )
      const topUsageShapeId = this.addEntity(`PRODUCT_DEFINITION_SHAPE('','',${topUsageId})`)
      this.addEntity(`CONTEXT_DEPENDENT_SHAPE_REPRESENTATION(${topRelationId},${topUsageShapeId})`)

      for (const subGroup of subAssemblies) {
        const subChildPlacements = subGroup.parts.map(ref => ref.occurrence.globalPlacementId)
        const subItems = subChildPlacements.length > 0 ? `(${subChildPlacements.join(',')})` : '()'
        const subShapeRepId = this.addEntity(
          `SHAPE_REPRESENTATION('${subGroup.escapedName}',${subItems},${this.contexts.geomContext})`
        )
        this.addEntity(`SHAPE_DEFINITION_REPRESENTATION(${subGroup.product.productDefShape},${subShapeRepId})`)
        subGroup.shapeRepId = subShapeRepId

        const subTransformId = this.addEntity(
          `ITEM_DEFINED_TRANSFORMATION('${subGroup.escapedName}_TRANSFORM_${occurrenceIndex}','',${subGroup.localPlacementId},${subGroup.globalPlacementId})`
        )
        const subRelationId = this.addEntity(
          `( REPRESENTATION_RELATIONSHIP('${subGroup.escapedName}','',${topShapeRepId},${subShapeRepId}) REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION(${subTransformId}) SHAPE_REPRESENTATION_RELATIONSHIP() )`
        )
        const subOccurrenceName = `NAUO_${occurrenceIndex++}`
        const subUsageId = this.addEntity(
          `NEXT_ASSEMBLY_USAGE_OCCURRENCE('${subOccurrenceName}','${subGroup.escapedName}','',${topGroup.product.productDef},${subGroup.product.productDef},$)`
        )
        const subUsageShapeId = this.addEntity(`PRODUCT_DEFINITION_SHAPE('','',${subUsageId})`)
        this.addEntity(`CONTEXT_DEPENDENT_SHAPE_REPRESENTATION(${subRelationId},${subUsageShapeId})`)

        for (const ref of subGroup.parts) {
          const partTransformId = this.addEntity(
            `ITEM_DEFINED_TRANSFORMATION('${ref.group.escapedName}_TRANSFORM_${occurrenceIndex}','',${ref.group.localPlacementId},${ref.occurrence.globalPlacementId})`
          )
          const partRelationId = this.addEntity(
            `( REPRESENTATION_RELATIONSHIP('${ref.group.escapedName}','',${subShapeRepId},${ref.group.shapeRepId}) REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION(${partTransformId}) SHAPE_REPRESENTATION_RELATIONSHIP() )`
          )
          const partOccurrenceName = `NAUO_${occurrenceIndex++}`
          const partUsageId = this.addEntity(
            `NEXT_ASSEMBLY_USAGE_OCCURRENCE('${partOccurrenceName}','${ref.group.escapedName}','',${subGroup.product.productDef},${ref.group.product.productDef},$)`
          )
          const partUsageShapeId = this.addEntity(`PRODUCT_DEFINITION_SHAPE('','',${partUsageId})`)
          this.addEntity(`CONTEXT_DEPENDENT_SHAPE_REPRESENTATION(${partRelationId},${partUsageShapeId})`)
        }
      }

      for (const ref of topGroup.parts) {
        const partTransformId = this.addEntity(
          `ITEM_DEFINED_TRANSFORMATION('${ref.group.escapedName}_TRANSFORM_${occurrenceIndex}','',${ref.group.localPlacementId},${ref.occurrence.globalPlacementId})`
        )
        const partRelationId = this.addEntity(
          `( REPRESENTATION_RELATIONSHIP('${ref.group.escapedName}','',${topShapeRepId},${ref.group.shapeRepId}) REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION(${partTransformId}) SHAPE_REPRESENTATION_RELATIONSHIP() )`
        )
        const partOccurrenceName = `NAUO_${occurrenceIndex++}`
        const partUsageId = this.addEntity(
          `NEXT_ASSEMBLY_USAGE_OCCURRENCE('${partOccurrenceName}','${ref.group.escapedName}','',${topGroup.product.productDef},${ref.group.product.productDef},$)`
        )
        const partUsageShapeId = this.addEntity(`PRODUCT_DEFINITION_SHAPE('','',${partUsageId})`)
        this.addEntity(`CONTEXT_DEPENDENT_SHAPE_REPRESENTATION(${partRelationId},${partUsageShapeId})`)
      }
    }
  }

  private computeBoundingBox(): BoundingBox | null {
    let minX = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    let minZ = Number.POSITIVE_INFINITY
    let maxZ = Number.NEGATIVE_INFINITY
    let found = false

    for (const box of this.boxes) {
      const x1 = Math.min(box.point1.x, box.point2.x) * INCH_TO_MM
      const x2 = Math.max(box.point1.x, box.point2.x) * INCH_TO_MM
      const y1 = Math.min(box.point1.y, box.point2.y) * INCH_TO_MM
      const y2 = Math.max(box.point1.y, box.point2.y) * INCH_TO_MM
      const z1 = Math.min(box.point1.z, box.point2.z) * INCH_TO_MM
      const z2 = Math.max(box.point1.z, box.point2.z) * INCH_TO_MM

      if (x2 - x1 < EPSILON || y2 - y1 < EPSILON || z2 - z1 < EPSILON) {
        continue
      }

      minX = Math.min(minX, x1)
      maxX = Math.max(maxX, x2)
      minY = Math.min(minY, y1)
      maxY = Math.max(maxY, y2)
      minZ = Math.min(minZ, z1)
      maxZ = Math.max(maxZ, z2)
      found = true
    }

    if (!found) {
      return null
    }

    return { minX, maxX, minY, maxY, minZ, maxZ }
  }

  private addLengthPMI(label: string, value: number) {
    const escapedLabel = this.escape(label)
    const measureId = this.addEntity(`LENGTH_MEASURE_WITH_UNIT(LENGTH_MEASURE(${value.toFixed(3)}),${this.contexts.lengthUnit})`)
    const itemId = this.addEntity(`MEASURE_REPRESENTATION_ITEM('${escapedLabel}',${measureId})`)
    const representationId = this.addEntity(`REPRESENTATION('${escapedLabel}',(${itemId}),${this.contexts.geomContext})`)
    const propertyId = this.addEntity(
      `PROPERTY_DEFINITION('${escapedLabel}','product characteristic',${this.contexts.assemblyProductDef})`
    )
    this.addEntity(`PROPERTY_DEFINITION_REPRESENTATION(${propertyId},${representationId})`)
  }

  private addPMI(bbox: BoundingBox) {
    const overallLength = bbox.maxY - bbox.minY
    const overallWidth = bbox.maxX - bbox.minX
    const overallHeight = bbox.maxZ - bbox.minZ

    this.addLengthPMI('overall_length_mm', overallLength)
    this.addLengthPMI('overall_width_mm', overallWidth)
    this.addLengthPMI('overall_height_mm', overallHeight)

    const noteText = `Overall dimensions (mm): L=${overallLength.toFixed(2)}, W=${overallWidth.toFixed(2)}, H=${overallHeight.toFixed(2)}`
    const descriptiveItemId = this.addEntity(`DESCRIPTIVE_REPRESENTATION_ITEM('CRATE_NOTE','${this.escape(noteText)}')`)
    const noteRepresentationId = this.addEntity(`REPRESENTATION('CRATE_PMI_NOTE',(${descriptiveItemId}),${this.contexts.geomContext})`)
    const propertyId = this.addEntity(
      `PROPERTY_DEFINITION('crate_note','product characteristic',${this.contexts.assemblyProductDef})`
    )
    this.addEntity(`PROPERTY_DEFINITION_REPRESENTATION(${propertyId},${noteRepresentationId})`)
  }

  private generateAp242(): string {
    this.reset()
    const header = this.buildHeader()
    this.entities.push('DATA;')

    const assemblyName = 'AUTOCRATE CRATE ASSEMBLY'
    this.contexts = this.createContexts(assemblyName)
    this.initializeDirections()

    const assemblyNameEscaped = this.escape(assemblyName)
    const partGroups = this.createPartGroups()

    if (partGroups.length === 0) {
      const placeholderPoint = this.addEntity(`CARTESIAN_POINT('',(0.,0.,0.))`)
      const placeholderVertex = this.addEntity(`VERTEX_POINT('',${placeholderPoint})`)
      const direction = this.ensureDirection('Z_POS', [0, 0, 1])
      const vector = this.addEntity(`VECTOR('',${direction},1.0)`)
      const line = this.addEntity(`LINE('',${placeholderPoint},${vector})`)
      const edge = this.addEntity(`EDGE_CURVE('',${placeholderVertex},${placeholderVertex},${line},.T.)`)
      const loop = this.addEntity(`EDGE_LOOP('',(${this.createOrientedEdge(edge, true)}))`)
      const bound = this.addEntity(`FACE_OUTER_BOUND('',${loop},.T.)`)
      const plane = this.createPlane(placeholderPoint, 'Z_POS', 'X_POS')
      const face = this.addEntity(`ADVANCED_FACE('',(${bound}),${plane},.T.)`)
      const shell = this.addEntity(`OPEN_SHELL('',(${face}))`)
      const placeholderGeometry = this.addEntity(`SHELL_BASED_SURFACE_MODEL('EMPTY',(${shell}))`)
      const shapeRepId = this.addEntity(
        `ADVANCED_BREP_SHAPE_REPRESENTATION('CRATE_GEOMETRY',(${placeholderGeometry}),${this.contexts.geomContext})`
      )
      this.addEntity(`SHAPE_DEFINITION_REPRESENTATION(${this.contexts.assemblyProductDefShape},${shapeRepId})`)
    } else {
      this.buildAssemblyStructure(partGroups, assemblyName, assemblyNameEscaped)
    }

    if (this.options.includePMI) {
      const bbox = this.computeBoundingBox()
      if (bbox) {
        this.addPMI(bbox)
      }
    }

    this.entities.push('ENDSEC;')
    this.entities.push('END-ISO-10303-21;')

    return [header, ...this.entities].join('\n')
  }

  public generate(): string {
    return this.generateAp242()
  }
}
