/* @jest-environment node */

import { NXGenerator, type CrateConfig } from '@/lib/nx-generator'
import { buildFullTutorial, getStepHighlightTargets, buildCallouts } from '@/lib/tutorial/schema'

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

})
