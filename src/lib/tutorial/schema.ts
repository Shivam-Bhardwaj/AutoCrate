import type { NXBox, NXGenerator } from '@/lib/nx-generator'

export type TutorialTarget = {
  boxNames?: string[]
  types?: NXBox['type'][]
}

export type TutorialStep = {
  id: string
  title: string
  description: string
  target?: TutorialTarget
  expressions?: string[]
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

  // Group by panel and add one step per panel for plywood
  const plywoodByPanel = new Map<string, NXBox[]>()
  boxes.filter(b => b.type === 'plywood' && !b.suppressed).forEach(b => {
    const key = b.panelName || 'UNKNOWN_PANEL'
    const arr = plywoodByPanel.get(key) || []
    arr.push(b)
    plywoodByPanel.set(key, arr)
  })
  for (const [panel, arr] of plywoodByPanel.entries()) {
    const meta = panelMap[panel] || { title: `${panel} (Plywood Pieces)` }
    steps.push({
      id: `plywood-${panel.toLowerCase()}`,
      title: meta.title,
      description: 'For each piece, create a Block by base corner and extents bound to expressions (7 parameters). Suppress any piece marked as suppressed.',
      target: { boxNames: arr.map(b => b.name) },
      expressions: ['NAME_X', 'NAME_Y', 'NAME_Z', 'NAME_WIDTH', 'NAME_LENGTH', 'NAME_HEIGHT', 'NAME_THICKNESS'],
      tips: [
        'Use NAME_THICKNESS for plywood thickness (typically 0.250).',
        'Orientation is consistent with coordinate system: X width, Y length, Z thickness.',
      ],
    })
  }

  // Cleats per panel (7 parameters, fixed thickness 0.750)
  const cleatsByPanel = new Map<string, NXBox[]>()
  boxes.filter(b => b.type === 'cleat' && !b.suppressed).forEach(b => {
    const key = b.panelName || 'UNKNOWN_PANEL'
    const arr = cleatsByPanel.get(key) || []
    arr.push(b)
    cleatsByPanel.set(key, arr)
  })
  for (const [panel, arr] of cleatsByPanel.entries()) {
    steps.push({
      id: `cleats-${panel.toLowerCase()}`,
      title: `${panel} Cleats (7 Parameters)`,
      description: 'Create cleat solids using the same 7-parameter set as plywood; thickness is 0.750 for 1x4.',
      target: { boxNames: arr.map(b => b.name) },
      expressions: ['NAME_X', 'NAME_Y', 'NAME_Z', 'NAME_WIDTH', 'NAME_LENGTH', 'NAME_HEIGHT', 'NAME_THICKNESS'],
      tips: [
        'Use NAME_THICKNESS = 0.750 for 1x4 cleats.',
        'Respect edge clearances and spacing rules defined by the expressions.',
      ],
    })
  }

  // Hardware guidance (no solids created directly; STEP import guidance)
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
  return targets
}

export function buildCallouts(step: TutorialStep, boxes: NXBox[]): { boxName: string; label: string }[] {
  const label = step.expressions && step.expressions.length > 0 ? `Use: ${step.expressions.join(', ')}` : step.title
  const results: { boxName: string; label: string }[] = []
  const names = new Set(step.target?.boxNames || [])
  names.forEach(n => results.push({ boxName: n, label }))
  if (step.target?.types?.length) {
    const typeSet = new Set(step.target.types)
    boxes.forEach(b => { if (typeSet.has(b.type!)) results.push({ boxName: b.name, label }) })
  }
  return results
}
