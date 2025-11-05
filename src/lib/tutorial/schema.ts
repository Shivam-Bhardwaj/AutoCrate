import type { NXBox, NXGenerator } from '@/lib/nx-generator'

export type TutorialTarget = {
  boxNames?: string[]
  types?: NXBox['type'][]
  assemblyNames?: string[] // For assembly-level tutorials
}

export type TutorialStep = {
  id: string
  title: string
  description: string
  target?: TutorialTarget
  expressions?: string[]
  expressionValues?: Record<string, number>
  tips?: string[]
}

export function buildBasicTutorial(generator: NXGenerator, boxes: NXBox[]): TutorialStep[] {
  const steps: TutorialStep[] = []

  // Step 1: Datum and coordinate system
  steps.push({
    id: 'datum-axes',
    title: 'Set Datum and Axes',
    description: 'In NX, confirm primary datum A (XY, Z=0), secondary B (YZ, X=0), tertiary C (XZ, Y=0). Ensure units are inches and origin is at crate center bottom.',
    expressions: [
      'overall_width',
      'overall_length',
      'overall_height',
    ],
    tips: [
      'Origin: X=0 at center, Y=0 at front, Z=0 at floor.',
      'Use these dimensions to validate your envelope later.'
    ],
  })

  // Step 2: Create base SKID as a Block using opposite corners
  const hasSkid = boxes.some(b => b.name === 'SKID')
  if (hasSkid) {
    steps.push({
      id: 'skid-block',
      title: 'Create SKID Block (Opposite Corners)',
      description: 'Insert → Design Feature → Block → Opposite Corners. Bind all fields to expressions.',
      target: { boxNames: ['SKID'] },
      expressions: [
        'SKID_X1', 'SKID_Y1', 'SKID_Z1',
        'SKID_X2', 'SKID_Y2', 'SKID_Z2',
      ],
      tips: [
        'Click fx next to each coordinate field and type the expression name.',
        'Do not type raw numbers; keep the model parametric.'
      ],
    })
  }

  // Step 3: Pattern skids along X using pattern_count and pattern_spacing
  const hasAnySkids = boxes.some(b => b.type === 'skid')
  if (hasAnySkids) {
    steps.push({
      id: 'skid-pattern',
      title: 'Pattern Skids (X Direction)',
      description: 'Pattern the SKID feature along X (left/right). Use center-to-center spacing.',
      target: { types: ['skid'] },
      expressions: ['pattern_count', 'pattern_spacing'],
      tips: [
        'Skids run along Y (front to back).',
        'Pattern direction is X; spacing is center-to-center.'
      ],
    })
  }

  return steps
}

// Extended builder: floorboards, panels (plywood 7-params), cleats, hardware guidance
export function buildFullTutorial(generator: NXGenerator, boxes: NXBox[]): TutorialStep[] {
  const base = buildBasicTutorial(generator, boxes)
  const steps: TutorialStep[] = [...base]
  const exprMap = generator.getExpressions()
  const boxesByName = new Map<string, NXBox>()
  boxes.forEach(box => boxesByName.set(box.name, box))

  const resolveExpressionValue = (expr: string): number | undefined => {
    if (expr.includes('..')) return undefined
    const key = expr.includes('=') ? expr.split('=')[0] : expr
    const direct = exprMap.get(key)
    if (typeof direct === 'number') return direct

    const suffixHandlers: Array<[string, (box: NXBox) => number | undefined]> = [
      ['_SUPPRESSED', box => (box.suppressed ? 1 : 0)],
      ['_X1', box => box.point1.x],
      ['_Y1', box => box.point1.y],
      ['_Z1', box => box.point1.z],
      ['_X2', box => box.point2.x],
      ['_Y2', box => box.point2.y],
      ['_Z2', box => box.point2.z],
      ['_X', box => box.point1.x],
      ['_Y', box => box.point1.y],
      ['_Z', box => box.point1.z],
      ['_WIDTH', box => Math.abs(box.point2.x - box.point1.x)],
      ['_LENGTH', box => Math.abs(box.point2.y - box.point1.y)],
      ['_HEIGHT', box => Math.abs(box.point2.z - box.point1.z)],
      ['_THICKNESS', box => {
        const zSpan = Math.abs(box.point2.z - box.point1.z)
        if (zSpan > 0) return zSpan
        const xSpan = Math.abs(box.point2.x - box.point1.x)
        if (xSpan > 0 && xSpan <= 1.5) return xSpan
        const ySpan = Math.abs(box.point2.y - box.point1.y)
        if (ySpan > 0 && ySpan <= 1.5) return ySpan
        const globalThickness = exprMap.get('plywood_thickness')
        return typeof globalThickness === 'number' ? globalThickness : undefined
      }],
    ]

    for (const [suffix, getter] of suffixHandlers) {
      if (key.endsWith(suffix)) {
        const baseName = key.slice(0, -suffix.length)
        const box = boxesByName.get(baseName)
        if (!box) return undefined
        return getter(box)
      }
    }

    return undefined
  }

  const attachExpressionValues = (step: TutorialStep) => {
    if (!step.expressions || step.expressions.length === 0) return
    const values: Record<string, number> = {}
    for (const expr of step.expressions) {
      const value = resolveExpressionValue(expr)
      if (typeof value === 'number') {
        values[expr] = value
      }
    }
    if (Object.keys(values).length > 0) {
      step.expressionValues = values
    }
  }

  const hasFloors = boxes.some(b => b.type === 'floor')
  if (hasFloors) {
    steps.push({
      id: 'floorboards',
      title: 'Create Floorboards (Opposite Corners)',
      description: 'Create Blocks for each FLOORBOARD_n using opposite corners (two points). Suppress any marked as suppressed in the export.',
      target: { types: ['floor'] },
      expressions: [
        'FLOORBOARD_n_X1..Z2',
        'floorboard_count',
        'floorboard_width',
        'floorboard_thickness',
      ],
      tips: [
        'Floorboards run along X and sit on skids (Z = skid_height).',
        'Use the naming pattern FLOORBOARD_1, FLOORBOARD_2, ... for expressions (X1,Y1,Z1 / X2,Y2,Z2).'
      ],
    })
  }

  const panelMap: Record<string, { title: string }> = {
    FRONT_PANEL: { title: 'Front Panel (Plywood Pieces)' },
    BACK_PANEL: { title: 'Back Panel (Plywood Pieces)' },
    LEFT_END_PANEL: { title: 'Left End Panel (Plywood Pieces)' },
    RIGHT_END_PANEL: { title: 'Right End Panel (Plywood Pieces)' },
    TOP_PANEL: { title: 'Top Panel (Plywood Pieces)' },
  }

  const plywoodByPanel = new Map<string, NXBox[]>()
  boxes.filter(b => b.type === 'plywood' && !b.suppressed).forEach(b => {
    const key = b.panelName || 'UNKNOWN_PANEL'
    const arr = plywoodByPanel.get(key) || []
    arr.push(b)
    plywoodByPanel.set(key, arr)
  })
  for (const [panel, arr] of plywoodByPanel.entries()) {
    const meta = panelMap[panel] || { title: `${panel} (Plywood Pieces)` }
    const plywoodSuffixes = ['X', 'Y', 'Z', 'WIDTH', 'LENGTH', 'HEIGHT', 'THICKNESS']
    const plywoodExpressions = Array.from(new Set(
      arr.flatMap(box => plywoodSuffixes.map(suffix => `${box.name}_${suffix}`))
    ))
    const thicknessLabel = arr[0] ? `${arr[0].name}_THICKNESS` : 'PLY_THICKNESS'
    const step: TutorialStep = {
      id: `plywood-${panel.toLowerCase()}`,
      title: meta.title,
      description: 'For each piece, create a Block by base corner and extents bound to expressions (7 parameters). Suppress any piece marked as suppressed.',
      target: { boxNames: arr.map(b => b.name) },
      expressions: plywoodExpressions,
      tips: [
        `Use ${thicknessLabel} for plywood thickness (typically 0.250).`,
        'Orientation is consistent with coordinate system: X width, Y length, Z thickness.',
      ],
    }
    attachExpressionValues(step)
    steps.push(step)
  }

  const cleatsByPanel = new Map<string, NXBox[]>()
  boxes.filter(b => b.type === 'cleat' && !b.suppressed).forEach(b => {
    const key = b.panelName || 'UNKNOWN_PANEL'
    const arr = cleatsByPanel.get(key) || []
    arr.push(b)
    cleatsByPanel.set(key, arr)
  })
  for (const [panel, arr] of cleatsByPanel.entries()) {
    const cleatSuffixes = ['X', 'Y', 'Z', 'WIDTH', 'LENGTH', 'HEIGHT', 'THICKNESS']
    const cleatExpressions = Array.from(new Set(
      arr.flatMap(box => cleatSuffixes.map(suffix => `${box.name}_${suffix}`))
    ))
    const thicknessLabel = arr[0] ? `${arr[0].name}_THICKNESS` : 'CLEAT_THICKNESS'
    const step: TutorialStep = {
      id: `cleats-${panel.toLowerCase()}`,
      title: `${panel} Cleats (7 Parameters)`,
      description: 'Create cleat solids using the same 7-parameter set as plywood; thickness is 0.750 for 1x4.',
      target: { boxNames: arr.map(b => b.name) },
      expressions: cleatExpressions,
      tips: [
        `Use ${thicknessLabel} = 0.750 for 1x4 cleats.`,
        'Respect edge clearances and spacing rules defined by the expressions.',
      ],
    }
    attachExpressionValues(step)
    steps.push(step)
  }

  const expr = generator.getExpressions()
  const lagCount = expr.get('lag_screw_count') || 0
  const klimpTotal = expr.get('klimp_instances_active') || expr.get('klimp_total_count') || 0
  steps.push({
    id: 'hardware-guidance',
    title: 'Hardware Guidance (Klimp + Lag Screws)',
    description: 'Import hardware STEP files once and place instances at generated positions as guidance. Refer to counts and spacing rules.',
    target: { types: ['hardware', 'klimp'] },
    expressions: [
      `lag_screw_count=${lagCount}`,
      `klimp_instances_active=${klimpTotal}`,
    ],
    tips: [
      'Lag screws: 3/8" x 3.00" centered on vertical cleats; use generated rows and spacing.',
      'Klimp clamps: limit to spacing and clearances; STEP once, reuse instances.',
    ],
  })

  steps.forEach(attachExpressionValues)

  return steps
}

// Helpers to compute tutorial targets and callouts in a testable, browserless way
export function getStepHighlightTargets(step: TutorialStep, boxes: NXBox[]): string[] {
  const targets: string[] = []
  if (step.target?.boxNames?.length) targets.push(...step.target.boxNames)
  if (step.target?.types?.length) {
    const typeSet = new Set(step.target.types)
    boxes.forEach(b => { if (typeSet.has(b.type!)) targets.push(b.name) })
  }
  // For assembly-level tutorials, include all boxes that belong to those assemblies
  if (step.target?.assemblyNames?.length) {
    const assemblyNames = new Set(step.target.assemblyNames)
    for (const box of boxes) {
      const classification = classifyBoxForAssembly(box)
      if (assemblyNames.has(classification.subName || '') || assemblyNames.has(classification.topName)) {
        targets.push(box.name)
      }
    }
  }
  return targets
}

export function buildCallouts(step: TutorialStep, boxes: NXBox[]): { boxName: string; label: string }[] {
  const hasExpressions = step.expressions && step.expressions.length > 0
  const expressionMap = new Map<string, string[]>()
  if (hasExpressions) {
    for (const expr of step.expressions!) {
      const key = (() => {
        if (expr.includes('=')) return expr.split('=')[0]
        const idx = expr.lastIndexOf('_')
        if (idx <= 0) return null
        return expr.slice(0, idx)
      })()
      if (!key) continue
      const arr = expressionMap.get(key) || []
      arr.push(expr)
      expressionMap.set(key, arr)
    }
  }

  const makeLabel = (boxName: string) => {
    const specific = expressionMap.get(boxName)
    if (specific && specific.length > 0) {
      return `Use: ${specific.join(', ')}`
    }
    if (hasExpressions) {
      return `Use: ${step.expressions!.join(', ')}`
    }
    return step.title
  }

  const results: { boxName: string; label: string }[] = []
  const names = new Set(step.target?.boxNames || [])
  names.forEach(n => results.push({ boxName: n, label: makeLabel(n) }))
  if (step.target?.types?.length) {
    const typeSet = new Set(step.target.types)
    boxes.forEach(b => {
      if (typeSet.has(b.type!)) {
        results.push({ boxName: b.name, label: makeLabel(b.name) })
      }
    })
  }
  // For assembly-level tutorials, include callouts for boxes in those assemblies
  if (step.target?.assemblyNames?.length) {
    const assemblyNames = new Set(step.target.assemblyNames)
    boxes.forEach(b => {
      const classification = classifyBoxForAssembly(b)
      if (assemblyNames.has(classification.subName || '') || assemblyNames.has(classification.topName)) {
        if (!names.has(b.name)) {
          results.push({ boxName: b.name, label: makeLabel(b.name) })
        }
      }
    })
  }
  return results
}

// Assembly classification (mirrors step-generator logic)
interface AssemblyClassification {
  topKey: string
  topName: string
  subKey?: string
  subName?: string
}

export function classifyBoxForAssembly(box: NXBox): AssemblyClassification {
  const type = box.type ?? 'misc'
  const panelName = box.panelName ?? ''
  const metadata = (box.metadata || '').toLowerCase()

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

  if (type === 'klimp' || metadata.includes('fastener')) {
    return {
      topKey: 'KLIMP_FASTENERS',
      topName: 'KLIMP_FASTENERS'
    }
  }

  if (metadata.includes('stencil') || metadata.includes('decal')) {
    return {
      topKey: 'STENCILS',
      topName: 'STENCILS'
    }
  }

  const topKey = 'CRATE_CAP'
  const topName = 'CRATE_CAP'

  if (panelName) {
    const panelAssemblyMap: Record<string, string> = {
      TOP_PANEL: 'TOP_PANEL_ASSEMBLY',
      FRONT_PANEL: 'FRONT_PANEL_ASSEMBLY',
      BACK_PANEL: 'BACK_PANEL_ASSEMBLY',
      LEFT_END_PANEL: 'LEFT_PANEL_ASSEMBLY',
      RIGHT_END_PANEL: 'RIGHT_PANEL_ASSEMBLY'
    }
    const subName = panelAssemblyMap[panelName] || `${panelName}_ASSEMBLY`
    return {
      topKey,
      topName,
      subKey: `${topKey}::${subName}`,
      subName
    }
  }

  return {
    topKey,
    topName,
    subKey: `${topKey}::CAP_MISC_ASSEMBLY`,
    subName: 'CAP_MISC_ASSEMBLY'
  }
}

/**
 * Build assembly-level tutorials that guide users to create one assembly file per assembly group.
 * Each tutorial step creates one assembly containing all its parts.
 */
export function buildAssemblyTutorial(generator: NXGenerator, boxes: NXBox[]): TutorialStep[] {
  const steps: TutorialStep[] = []
  
  // Group boxes by assembly classification
  const topLevelAssemblies = new Map<string, {
    topName: string
    subAssemblies: Map<string, { subName: string; boxes: NXBox[] }>
    directBoxes: NXBox[]
  }>()

  for (const box of boxes) {
    const classification = classifyBoxForAssembly(box)
    
    let topLevel = topLevelAssemblies.get(classification.topKey)
    if (!topLevel) {
      topLevel = {
        topName: classification.topName,
        subAssemblies: new Map(),
        directBoxes: []
      }
      topLevelAssemblies.set(classification.topKey, topLevel)
    }

    if (classification.subName) {
      let subAssembly = topLevel.subAssemblies.get(classification.subKey!)
      if (!subAssembly) {
        subAssembly = {
          subName: classification.subName,
          boxes: []
        }
        topLevel.subAssemblies.set(classification.subKey!, subAssembly)
      }
      subAssembly.boxes.push(box)
    } else {
      topLevel.directBoxes.push(box)
    }
  }

  const exprMap = generator.getExpressions()
  const boxesByName = new Map<string, NXBox>()
  boxes.forEach(box => boxesByName.set(box.name, box))

  // Helper to collect all expressions for boxes in an assembly
  const collectExpressions = (assemblyBoxes: NXBox[]): string[] => {
    const exprSet = new Set<string>()
    for (const box of assemblyBoxes) {
      if (box.suppressed) continue
      
      // Add box-specific expressions (check if they exist in the expression map)
      const suffixes = ['X1', 'Y1', 'Z1', 'X2', 'Y2', 'Z2', 'X', 'Y', 'Z', 'WIDTH', 'LENGTH', 'HEIGHT', 'THICKNESS']
      for (const suffix of suffixes) {
        const expr = `${box.name}_${suffix}`
        // Check if expression exists in map
        if (exprMap.has(expr)) {
          exprSet.add(expr)
        }
      }
    }
    return Array.from(exprSet).sort()
  }

  // Create tutorial steps for sub-assemblies first (they're more specific)
  const processedTopLevels = new Set<string>()
  
  for (const [topKey, topLevel] of topLevelAssemblies.entries()) {
    // Process sub-assemblies
    for (const [subKey, subAssembly] of topLevel.subAssemblies.entries()) {
      if (subAssembly.boxes.length === 0) continue

      const assemblyBoxes = subAssembly.boxes.filter(b => !b.suppressed)
      if (assemblyBoxes.length === 0) continue

      const expressions = collectExpressions(assemblyBoxes)
      const boxNames = assemblyBoxes.map(b => b.name)

      const assemblyTitleMap: Record<string, string> = {
        'SKID_ASSEMBLY': 'SKID Assembly',
        'FLOORBOARD_ASSEMBLY': 'FLOORBOARD Assembly',
        'FRONT_PANEL_ASSEMBLY': 'FRONT_PANEL Assembly',
        'BACK_PANEL_ASSEMBLY': 'BACK_PANEL Assembly',
        'LEFT_PANEL_ASSEMBLY': 'LEFT_PANEL Assembly',
        'RIGHT_PANEL_ASSEMBLY': 'RIGHT_PANEL Assembly',
        'TOP_PANEL_ASSEMBLY': 'TOP_PANEL Assembly',
        'CAP_MISC_ASSEMBLY': 'CAP_MISC Assembly'
      }

      const title = assemblyTitleMap[subAssembly.subName] || `${subAssembly.subName} Assembly`

      steps.push({
        id: `assembly-${subKey.toLowerCase().replace(/::/g, '-')}`,
        title: `Create ${title}`,
        description: `Create a new assembly part file named "${subAssembly.subName}". Add all components for this assembly as separate parts and assemble them using the expressions. This creates one assembly file containing all ${assemblyBoxes.length} parts for ${subAssembly.subName}.`,
        target: {
          assemblyNames: [subAssembly.subName],
          boxNames: boxNames
        },
        expressions: expressions.length > 0 ? expressions : undefined,
        tips: [
          `This assembly contains ${assemblyBoxes.length} component(s).`,
          'Use File → New → Assembly to create a new assembly part.',
          'Add components as parts and constrain them using the coordinate expressions.',
          'Each component should reference its expressions for positioning.'
        ],
      })
    }

    // Process top-level assemblies with direct parts (no sub-assemblies)
    if (topLevel.directBoxes.length > 0 && topLevel.subAssemblies.size === 0) {
      const directBoxes = topLevel.directBoxes.filter(b => !b.suppressed)
      if (directBoxes.length > 0) {
        const expressions = collectExpressions(directBoxes)
        const boxNames = directBoxes.map(b => b.name)

        steps.push({
          id: `assembly-${topKey.toLowerCase()}`,
          title: `Create ${topLevel.topName} Assembly`,
          description: `Create a new assembly part file named "${topLevel.topName}". Add all components for this assembly as separate parts and assemble them using the expressions. This creates one assembly file containing all ${directBoxes.length} parts for ${topLevel.topName}.`,
          target: {
            assemblyNames: [topLevel.topName],
            boxNames: boxNames
          },
          expressions: expressions.length > 0 ? expressions : undefined,
          tips: [
            `This assembly contains ${directBoxes.length} component(s).`,
            'Use File → New → Assembly to create a new assembly part.',
            'Add components as parts and constrain them using the coordinate expressions.',
            'Each component should reference its expressions for positioning.'
          ],
        })
      }
    }

    processedTopLevels.add(topKey)
  }

  return steps
}
