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

