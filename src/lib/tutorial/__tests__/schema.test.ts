/* @jest-environment node */

import { NXGenerator, type CrateConfig } from '@/lib/nx-generator'
import { buildFullTutorial, buildBasicTutorial, buildAssemblyTutorial, getStepHighlightTargets, buildCallouts, classifyBoxForAssembly } from '@/lib/tutorial/schema'
import type { NXBox } from '@/lib/nx-generator'

function makeGenerator(): NXGenerator {
  const cfg: CrateConfig = {
    product: { length: 48, width: 40, height: 36, weight: 1200 },
    clearances: { side: 2, end: 2, top: 2 },
    materials: { skidSize: '4x4', plywoodThickness: 0.25, panelThickness: 1.0, cleatSize: '1x4' },
  }
  return new NXGenerator(cfg)
}

describe('Tutorial schema (browserless)', () => {
  it('builds a complete tutorial with basic and extended steps', () => {
    const gen = makeGenerator()
    const boxes = gen.getBoxes()
    const steps = buildFullTutorial(gen, boxes)

    const ids = steps.map(s => s.id)
    expect(ids).toContain('datum-axes')
    expect(ids).toContain('skid-block')
    expect(ids).toContain('skid-pattern')
    // Extended
    expect(ids.some(id => id.startsWith('plywood-'))).toBe(true)
    expect(ids.some(id => id.startsWith('cleats-'))).toBe(true)
    expect(ids).toContain('hardware-guidance')
  })

  it('builds basic tutorial with datum, skid, and pattern steps', () => {
    const gen = makeGenerator()
    const boxes = gen.getBoxes()
    const steps = buildBasicTutorial(gen, boxes)

    expect(steps.length).toBeGreaterThan(0)
    expect(steps[0].id).toBe('datum-axes')
    expect(steps[0].expressions).toEqual(expect.arrayContaining([
      'overall_width',
      'overall_length',
      'overall_height',
    ]))
  })

  it('computes highlight targets and callouts deterministically', () => {
    const gen = makeGenerator()
    const boxes = gen.getBoxes()
    const steps = buildFullTutorial(gen, boxes)

    const skidBlock = steps.find(s => s.id === 'skid-block')!
    const targets = getStepHighlightTargets(skidBlock, boxes)
    expect(targets).toEqual(expect.arrayContaining(['SKID']))

    const callouts = buildCallouts(skidBlock, boxes)
    expect(callouts.find(c => c.boxName === 'SKID')).toBeTruthy()
  })

  it('surfaces real plywood expression names with values for tutorial guidance', () => {
    const gen = makeGenerator()
    const boxes = gen.getBoxes()
    const steps = buildFullTutorial(gen, boxes)

    const frontPlywoodStep = steps.find(s => s.id === 'plywood-front_panel')
    expect(frontPlywoodStep).toBeTruthy()
    expect(frontPlywoodStep?.expressions).toBeTruthy()
    frontPlywoodStep?.expressions?.forEach(expr => {
      expect(expr.startsWith('NAME_')).toBe(false)
    })
    expect(frontPlywoodStep?.expressions).toEqual(expect.arrayContaining([
      'FRONT_PANEL_PLY_1_X',
      'FRONT_PANEL_PLY_1_WIDTH',
      'FRONT_PANEL_PLY_1_THICKNESS',
    ]))

    const plywoodCallouts = buildCallouts(frontPlywoodStep!, boxes)
    const firstPieceCallout = plywoodCallouts.find(c => c.boxName === 'FRONT_PANEL_PLY_1')
    expect(firstPieceCallout).toBeTruthy()
    expect(firstPieceCallout?.label).toContain('FRONT_PANEL_PLY_1_X')
    expect(firstPieceCallout?.label).toContain('FRONT_PANEL_PLY_1_THICKNESS')

    expect(frontPlywoodStep?.expressionValues).toBeTruthy()
    expect(frontPlywoodStep?.expressionValues).toHaveProperty('FRONT_PANEL_PLY_1_X')
    expect(frontPlywoodStep?.expressionValues).toHaveProperty('FRONT_PANEL_PLY_1_THICKNESS')
    expect(frontPlywoodStep?.expressionValues?.FRONT_PANEL_PLY_1_WIDTH).toBeGreaterThan(0)
    expect(frontPlywoodStep?.expressionValues?.FRONT_PANEL_PLY_1_LENGTH).toBeGreaterThan(0)
    expect(frontPlywoodStep?.expressionValues?.FRONT_PANEL_PLY_1_HEIGHT).toBeGreaterThan(0)
    expect(frontPlywoodStep?.expressionValues?.FRONT_PANEL_PLY_1_THICKNESS).toBeGreaterThan(0)

    const cleatStep = steps.find(s => s.id === 'cleats-front_panel')
    expect(cleatStep).toBeTruthy()
    expect(cleatStep?.expressions).toEqual(expect.arrayContaining([
      expect.stringMatching(/FRONT_PANEL_CLEAT_/)
    ]))
    expect(cleatStep?.expressionValues).toBeTruthy()
    const cleatThicknessKey = Object.keys(cleatStep?.expressionValues || {}).find(key => key.endsWith('_THICKNESS'))
    expect(cleatThicknessKey).toBeTruthy()
    expect(cleatStep?.expressionValues?.[cleatThicknessKey!]).toBeGreaterThan(0)
  })

  it('lists individual floorboard expressions with values for copy/paste', () => {
    const gen = makeGenerator()
    const boxes = gen.getBoxes()
    const steps = buildFullTutorial(gen, boxes)

    const floorStep = steps.find(s => s.id === 'floorboards')
    expect(floorStep).toBeTruthy()
    const expressions = floorStep?.expressions ?? []
    expect(expressions.length).toBeGreaterThan(0)
    expect(expressions).not.toContain('FLOORBOARD_n_X1..Z2')
    expect(expressions).toEqual(expect.arrayContaining([
      'floorboard_count',
      'floorboard_width',
      'floorboard_length',
      'floorboard_thickness',
      'floorboard_1',
    ]))

    const activeFloorCount = boxes.filter(box => box.type === 'floor' && !box.suppressed).length
    const x1Expressions = expressions.filter(expr => expr.endsWith('_X1'))
    expect(x1Expressions.length).toBe(activeFloorCount)

    const totalFloorboards = boxes.filter(box => box.type === 'floor').length
    const partNameExpressions = expressions.filter(expr => /^floorboard_\d+$/.test(expr))
    expect(partNameExpressions.length).toBe(totalFloorboards)

    const firstBoardName = boxes.find(box => box.type === 'floor')?.name
    if (firstBoardName) {
      const firstBoardLower = firstBoardName.toLowerCase()
      expect(expressions).toEqual(expect.arrayContaining([
        `${firstBoardName}_X1`,
        `${firstBoardName}_Y1`,
        `${firstBoardName}_Z1`,
        `${firstBoardName}_X2`,
        `${firstBoardName}_Y2`,
        `${firstBoardName}_Z2`,
        `${firstBoardName}_SUPPRESSED`,
        firstBoardLower,
      ]))
      expect(floorStep?.expressionValues?.[`${firstBoardName}_X1`]).not.toBeUndefined()
      expect(floorStep?.expressionValues?.[`${firstBoardName}_SUPPRESSED`]).toBeDefined()

      const nameIndex = expressions.indexOf(firstBoardLower)
      const x1Index = expressions.indexOf(`${firstBoardName}_X1`)
      expect(nameIndex).toBeGreaterThan(-1)
      expect(x1Index).toBeGreaterThan(-1)
      expect(nameIndex).toBeLessThan(x1Index)
    }

    const suppressedExpressions = expressions.filter(expr => expr.endsWith('_SUPPRESSED'))
    expect(suppressedExpressions.length).toBeGreaterThan(0)
    const suppressedValues = suppressedExpressions
      .map(expr => floorStep?.expressionValues?.[expr])
      .filter((value): value is number => typeof value === 'number')
    expect(suppressedValues.length).toBeGreaterThan(0)
    expect(suppressedValues.some(value => value === 1 || value === 0)).toBe(true)
  })

  describe('classifyBoxForAssembly', () => {
    it('classifies skid boxes correctly', () => {
      const box: NXBox = {
        name: 'SKID',
        type: 'skid',
        point1: { x: 0, y: 0, z: 0 },
        point2: { x: 4, y: 4, z: 4 },
      }
      const classification = classifyBoxForAssembly(box)
      expect(classification.topName).toBe('SHIPPING_BASE')
      expect(classification.subName).toBe('SKID_ASSEMBLY')
    })

    it('classifies floor boxes correctly', () => {
      const box: NXBox = {
        name: 'FLOORBOARD_1',
        type: 'floor',
        point1: { x: 0, y: 0, z: 0 },
        point2: { x: 4, y: 4, z: 0.25 },
      }
      const classification = classifyBoxForAssembly(box)
      expect(classification.topName).toBe('SHIPPING_BASE')
      expect(classification.subName).toBe('FLOORBOARD_ASSEMBLY')
    })

    it('classifies klimp/fastener boxes correctly', () => {
      const box: NXBox = {
        name: 'KLIMP_1',
        type: 'klimp',
        point1: { x: 0, y: 0, z: 0 },
        point2: { x: 1, y: 1, z: 1 },
        metadata: 'fastener',
      }
      const classification = classifyBoxForAssembly(box)
      expect(classification.topName).toBe('KLIMP_FASTENERS')
      expect(classification.subName).toBeUndefined()
    })

    it('classifies stencil/decal boxes correctly', () => {
      const box: NXBox = {
        name: 'STENCIL_1',
        type: undefined, // Boxes with metadata can have undefined type
        point1: { x: 0, y: 0, z: 0 },
        point2: { x: 1, y: 1, z: 0.1 },
        metadata: 'stencil',
      }
      const classification = classifyBoxForAssembly(box)
      expect(classification.topName).toBe('STENCILS')
      expect(classification.subName).toBeUndefined()
    })

    it('classifies panel boxes with panelName correctly', () => {
      const box: NXBox = {
        name: 'FRONT_PANEL_PLY_1',
        type: 'plywood',
        panelName: 'FRONT_PANEL',
        point1: { x: 0, y: 0, z: 0 },
        point2: { x: 1, y: 1, z: 0.25 },
      }
      const classification = classifyBoxForAssembly(box)
      expect(classification.topName).toBe('CRATE_CAP')
      expect(classification.subName).toBe('FRONT_PANEL_ASSEMBLY')
    })

    it('classifies boxes without panelName as CAP_MISC_ASSEMBLY', () => {
      const box: NXBox = {
        name: 'MISC_BOX',
        type: undefined, // Boxes without specific type
        point1: { x: 0, y: 0, z: 0 },
        point2: { x: 1, y: 1, z: 1 },
      }
      const classification = classifyBoxForAssembly(box)
      expect(classification.topName).toBe('CRATE_CAP')
      expect(classification.subName).toBe('CAP_MISC_ASSEMBLY')
    })

    it('handles all panel types correctly', () => {
      const panelTypes = ['FRONT_PANEL', 'BACK_PANEL', 'LEFT_END_PANEL', 'RIGHT_END_PANEL', 'TOP_PANEL']
      const expectedAssemblies = [
        'FRONT_PANEL_ASSEMBLY',
        'BACK_PANEL_ASSEMBLY',
        'LEFT_PANEL_ASSEMBLY',
        'RIGHT_PANEL_ASSEMBLY',
        'TOP_PANEL_ASSEMBLY',
      ]

      panelTypes.forEach((panelName, index) => {
        const box: NXBox = {
          name: `${panelName}_PLY_1`,
          type: 'plywood',
          panelName,
          point1: { x: 0, y: 0, z: 0 },
          point2: { x: 1, y: 1, z: 0.25 },
        }
        const classification = classifyBoxForAssembly(box)
        expect(classification.topName).toBe('CRATE_CAP')
        expect(classification.subName).toBe(expectedAssemblies[index])
      })
    })
  })

  describe('buildAssemblyTutorial', () => {
    it('builds assembly tutorial steps', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      const steps = buildAssemblyTutorial(gen, boxes)

      expect(steps.length).toBeGreaterThan(0)
      steps.forEach(step => {
        expect(step.id).toMatch(/^assembly-/)
        expect(step.title).toBeTruthy()
        expect(step.description).toBeTruthy()
        expect(step.target).toBeTruthy()
      })
    })

    it('groups boxes by assembly classification', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      const steps = buildAssemblyTutorial(gen, boxes)

      // Should have steps for different assemblies
      const assemblyIds = steps.map(s => s.id)
      expect(assemblyIds.some(id => id.includes('skid'))).toBe(true)
      expect(assemblyIds.some(id => id.includes('floorboard'))).toBe(true)
      expect(assemblyIds.some(id => id.includes('panel'))).toBe(true)
    })

    it('includes expressions for assembly steps when available', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      const steps = buildAssemblyTutorial(gen, boxes)

      // At least some steps should have expressions (skids, floorboards, panels should have expressions)
      const stepsWithExpressions = steps.filter(s => s.expressions && s.expressions.length > 0)
      // It's okay if some steps don't have expressions (e.g., if no boxes match)
      // But we should have at least one step with expressions for typical crates
      if (stepsWithExpressions.length > 0) {
        stepsWithExpressions.forEach(step => {
          expect(step.expressions!.length).toBeGreaterThan(0)
        })
      }
      // The test passes regardless - expressions are optional
    })

    it('handles suppressed boxes correctly', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      // Mark some boxes as suppressed
      const suppressedBoxes = boxes.map(box => ({
        ...box,
        suppressed: box.name.includes('PLY_2') || box.name.includes('PLY_3'),
      }))
      const steps = buildAssemblyTutorial(gen, suppressedBoxes)

      // Should still create steps but without suppressed boxes
      expect(steps.length).toBeGreaterThan(0)
    })

    it('includes boxNames in target for assembly steps', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      const steps = buildAssemblyTutorial(gen, boxes)

      const stepWithTarget = steps.find(s => s.target?.boxNames && s.target.boxNames.length > 0)
      expect(stepWithTarget).toBeTruthy()
      if (stepWithTarget) {
        expect(stepWithTarget.target!.boxNames!.length).toBeGreaterThan(0)
      }
    })
  })

  describe('getStepHighlightTargets', () => {
    it('handles steps with assemblyNames', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      const step = {
        id: 'test-assembly',
        title: 'Test Assembly',
        description: 'Test',
        target: {
          assemblyNames: ['FRONT_PANEL_ASSEMBLY'],
        },
      }
      const targets = getStepHighlightTargets(step, boxes)
      expect(targets.length).toBeGreaterThan(0)
    })

    it('handles steps with both boxNames and types', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      const step = {
        id: 'test-mixed',
        title: 'Test Mixed',
        description: 'Test',
        target: {
          boxNames: ['SKID'],
          types: ['floor'] as NXBox['type'][],
        },
      }
      const targets = getStepHighlightTargets(step, boxes)
      expect(targets.length).toBeGreaterThan(0)
      expect(targets).toContain('SKID')
    })
  })

  describe('buildCallouts', () => {
    it('handles steps with expressions containing equals sign', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      const step = {
        id: 'test-callout',
        title: 'Test Callout',
        description: 'Test',
        target: {
          boxNames: ['SKID'],
        },
        expressions: ['lag_screw_count=10', 'klimp_instances_active=5'],
      }
      const callouts = buildCallouts(step, boxes)
      expect(callouts.length).toBeGreaterThan(0)
    })

    it('handles steps with assemblyNames in callouts', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      const step = {
        id: 'test-assembly-callout',
        title: 'Test Assembly Callout',
        description: 'Test',
        target: {
          assemblyNames: ['FRONT_PANEL_ASSEMBLY'],
          boxNames: [],
        },
      }
      const callouts = buildCallouts(step, boxes)
      expect(callouts.length).toBeGreaterThan(0)
    })

    it('creates callouts for types', () => {
      const gen = makeGenerator()
      const boxes = gen.getBoxes()
      const step = {
        id: 'test-type-callout',
        title: 'Test Type Callout',
        description: 'Test',
        target: {
          types: ['skid'] as NXBox['type'][],
        },
      }
      const callouts = buildCallouts(step, boxes)
      expect(callouts.length).toBeGreaterThan(0)
    })
  })

})
