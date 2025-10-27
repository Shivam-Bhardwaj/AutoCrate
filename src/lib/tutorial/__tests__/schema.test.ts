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

    // Find skid-block step and verify targets include SKID
    const skidBlock = steps.find(s => s.id === 'skid-block')!
    const targets = getStepHighlightTargets(skidBlock, boxes)
    expect(targets).toEqual(expect.arrayContaining(['SKID']))

    const callouts = buildCallouts(skidBlock, boxes)
    expect(callouts.find(c => c.boxName === 'SKID')).toBeTruthy()
  })
})

