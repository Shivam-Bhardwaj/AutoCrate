import { NXGenerator, CrateConfig } from '../nx-generator'
import { StepGenerator } from '../step-generator'
import { writeFileSync } from 'fs'

describe('StepGenerator integration', () => {
  it('generates STEP without invalid values for default crate', () => {
    const config: CrateConfig = {
      product: {
        length: 135,
        width: 135,
        height: 135,
        weight: 10000
      },
      clearances: {
        side: 2,
        end: 2,
        top: 3
      },
      materials: {
        skidSize: '4x4',
        plywoodThickness: 0.25,
        panelThickness: 1,
        cleatSize: '1x4',
        allow3x4Lumber: false
      },
      markings: {
        appliedMaterialsLogo: true,
        fragileStencil: true,
        handlingSymbols: true,
        autocrateText: true
      }
    }

    const generator = new NXGenerator(config)
    const boxes = generator.getBoxes()
    const step = new StepGenerator(boxes)
    const output = step.generate()

    writeFileSync('debug-output.stp', output)

    expect(output).not.toMatch(/NaN|Infinity|undefined/)
  })
})
