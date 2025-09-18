// STEP File Generator for Crate Model
// Creates ISO 10303-21 (STEP AP214) compliant files for CAD exchange

import { NXBox } from './nx-generator'

export class StepGenerator {
  private entityId = 1
  private entities: string[] = []
  private boxes: NXBox[]

  constructor(boxes: NXBox[]) {
    // Filter out suppressed boxes
    this.boxes = boxes.filter(box => !box.suppressed)
  }

  private getNextId(): string {
    return `#${this.entityId++}`
  }

  private addEntity(entity: string): string {
    const id = this.getNextId()
    this.entities.push(`${id}=${entity};`)
    return id
  }

  // Generate simplified STEP AP214 with basic block solids
  public generateSimplified(): string {
    // Reset for clean generation
    this.entityId = 10
    this.entities = []

    // STEP file header
    const header = [
      'ISO-10303-21;',
      'HEADER;',
      'FILE_DESCRIPTION((',
      "'IDA-STEP-VIEWER'",
      "'2020-01-14T17:12:59'",
      "('STEP AP214')",
      '),"1");',
      'FILE_NAME(',
      "'crate_model.stp'",
      `'${new Date().toISOString()}'`,
      "('AutoCrate')",
      "('AutoCrate Codex')",
      "'STEP AP214'",
      "'AutoCrate STEP Generator'",
      "'');",
      "FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));",
      'ENDSEC;'
    ].join('\n')

    // Start DATA section
    this.entities.push('DATA;')

    // Create application context
    const appContext = this.addEntity("APPLICATION_CONTEXT('automotive_design')")
    const appProtoDef = this.addEntity(`APPLICATION_PROTOCOL_DEFINITION('standard','automotive_design',2010,${appContext})`)
    const productContext = this.addEntity(`PRODUCT_CONTEXT('',${appContext},'mechanical')`)
    const productDefContext = this.addEntity(`PRODUCT_DEFINITION_CONTEXT('part definition',${appContext},'design')`)

    // Units
    const planeAngleUnit = this.addEntity("(NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.))")
    const solidAngleUnit = this.addEntity("(NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT())")

    // Length unit with conversion (inches to millimeters)
    const lengthUnit = this.addEntity("(CONVERSION_BASED_UNIT('inch',#25)LENGTH_UNIT()NAMED_UNIT(#26))")
    const lengthMeasure = this.addEntity("LENGTH_MEASURE_WITH_UNIT(LENGTH_MEASURE(25.4),#27)")
    const dimensions = this.addEntity("DIMENSIONAL_EXPONENTS(1.0,0.0,0.0,0.0,0.0,0.0,0.0)")
    const siUnit = this.addEntity("(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.))")

    // Uncertainty
    const uncertainty = this.addEntity(`UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.0001),${lengthUnit},'distance accuracy','')`)

    // Geometric context
    const geomContext = this.addEntity(`(GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((${uncertainty}))GLOBAL_UNIT_ASSIGNED_CONTEXT((${lengthUnit},${planeAngleUnit},${solidAngleUnit}))REPRESENTATION_CONTEXT('','')`)

    // Create each box as a simple CSG block
    let itemId = 100
    for (const box of this.boxes) {
      // Calculate dimensions in inches (keep original units)
      const width = Math.abs(box.point2.x - box.point1.x)
      const length = Math.abs(box.point2.y - box.point1.y)
      const height = Math.abs(box.point2.z - box.point1.z)

      // Calculate center position
      const centerX = (box.point1.x + box.point2.x) / 2
      const centerY = (box.point1.y + box.point2.y) / 2
      const centerZ = (box.point1.z + box.point2.z) / 2

      // Create coordinate system for the block
      const origin = this.addEntity(`CARTESIAN_POINT('origin',(${centerX},${centerY},${centerZ}))`)
      const zDir = this.addEntity("DIRECTION('z',(0.0,0.0,1.0))")
      const xDir = this.addEntity("DIRECTION('x',(1.0,0.0,0.0))")
      const placement = this.addEntity(`AXIS2_PLACEMENT_3D('placement',${origin},${zDir},${xDir})`)

      // Create block primitive
      const block = this.addEntity(`BLOCK('${box.name}',${placement},${width},${length},${height})`)

      // Create shape representation
      const shapeRep = this.addEntity(`SHAPE_REPRESENTATION('SR',(${block}),${geomContext})`)

      // Product definition
      const product = this.addEntity(`PRODUCT('#${itemId}','${box.name}','',(${productContext}))`)
      const productDefFormation = this.addEntity(`PRODUCT_DEFINITION_FORMATION('','',${product})`)
      const productDef = this.addEntity(`PRODUCT_DEFINITION('','',${productDefFormation},${productDefContext})`)
      const productDefShape = this.addEntity(`PRODUCT_DEFINITION_SHAPE('','',${productDef})`)
      const shapeDef = this.addEntity(`SHAPE_DEFINITION_REPRESENTATION(${productDefShape},${shapeRep})`)

      itemId++
    }

    // End DATA section
    this.entities.push('ENDSEC;')
    this.entities.push('END-ISO-10303-21;')

    // Combine header and entities
    return [header, ...this.entities].join('\n')
  }

  // Alternative: Generate as simple ASCII STL-like STEP (for debugging)
  public generateBasicBlocks(): string {
    // Very simple STEP AP203 format that most CAD systems can read
    const timestamp = new Date().toISOString()

    let stepContent = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('STEP AP203'),'1');
FILE_NAME('crate.stp','${timestamp}',(''),(''),'','','');
FILE_SCHEMA(('CONFIG_CONTROL_DESIGN'));
ENDSEC;
DATA;
#10=MECHANICAL_CONTEXT('',#11,'mechanical');
#11=APPLICATION_CONTEXT('configuration controlled 3d designs of mechanical parts');
#12=APPLICATION_PROTOCOL_DEFINITION('standard','config_control_design',1994,#11);
#13=DESIGN_CONTEXT('',#11,'design');
#14=PRODUCT_CONTEXT('',#11,'mechanical');
#15=(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.));
#16=(NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.));
#17=(NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT());
#18=UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.01),#15,'','');
#19=(GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#18))GLOBAL_UNIT_ASSIGNED_CONTEXT((#15,#16,#17))REPRESENTATION_CONTEXT('','3D'));
`

    let entityNum = 100

    for (const box of this.boxes) {
      // Convert to mm
      const x1 = box.point1.x * 25.4
      const y1 = box.point1.y * 25.4
      const z1 = box.point1.z * 25.4
      const x2 = box.point2.x * 25.4
      const y2 = box.point2.y * 25.4
      const z2 = box.point2.z * 25.4

      const width = Math.abs(x2 - x1)
      const length = Math.abs(y2 - y1)
      const height = Math.abs(z2 - z1)
      const centerX = (x1 + x2) / 2
      const centerY = (y1 + y2) / 2
      const centerZ = (z1 + z2) / 2

      stepContent += `#${entityNum}=CARTESIAN_POINT('',(${centerX},${centerY},${centerZ}));
#${entityNum+1}=DIRECTION('',(0.,0.,1.));
#${entityNum+2}=DIRECTION('',(1.,0.,0.));
#${entityNum+3}=AXIS2_PLACEMENT_3D('',#${entityNum},#${entityNum+1},#${entityNum+2});
#${entityNum+4}=BLOCK('${box.name}',#${entityNum+3},${width},${length},${height});
#${entityNum+5}=SHAPE_REPRESENTATION('',(#${entityNum+4}),#19);
#${entityNum+6}=PRODUCT('${box.name}','${box.name}','',(#14));
#${entityNum+7}=PRODUCT_DEFINITION_FORMATION('','',#${entityNum+6});
#${entityNum+8}=PRODUCT_DEFINITION('','',#${entityNum+7},#13);
#${entityNum+9}=PRODUCT_DEFINITION_SHAPE('','',#${entityNum+8});
#${entityNum+10}=SHAPE_DEFINITION_REPRESENTATION(#${entityNum+9},#${entityNum+5});
`
      entityNum += 20
    }

    stepContent += `ENDSEC;
END-ISO-10303-21;`

    return stepContent
  }

  public generate(): string {
    // Use the basic blocks version as it's most compatible
    return this.generateBasicBlocks()
  }
}