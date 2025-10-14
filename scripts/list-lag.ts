import { NXGenerator } from '../src/lib/nx-generator'

const generator = new NXGenerator({
  product: { length: 60, width: 40, height: 35, weight: 450 },
  clearances: { side: 2, end: 2, top: 3 },
  materials: {
    skidSize: '4x4',
    plywoodThickness: 0.25,
    panelThickness: 1,
    cleatSize: '1x4',
    allow3x4Lumber: true,
    availableLumber: ['2x12']
  },
  markings: {
    appliedMaterialsLogo: true,
    fragileStencil: true,
    handlingSymbols: true,
    autocrateText: true
  }
})

const shaftNames = generator.getBoxes()
  .filter(box => box.type === 'hardware' && box.name.endsWith('_SHAFT'))
  .map(box => ({ name: box.name, panel: box.panelName, meta: box.metadata }))

console.log(JSON.stringify(shaftNames, null, 2))
