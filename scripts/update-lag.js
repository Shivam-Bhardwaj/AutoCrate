const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'src', 'lib', 'nx-generator.ts')
const original = fs.readFileSync(filePath, 'utf8')

const sidePattern = /  private addLagHardwareForSidePanel\([\s\S]*?  }\r?\n/
const backPattern = /  private addLagHardwareForBackPanel\([\s\S]*?  }\r?\n/

const sideReplacement = `  private addLagHardwareForSidePanel(
    cleatLayout: PanelCleatLayout,
    panelOriginX: number,
    panelOriginY: number,
    panelOriginZ: number
  ) {
    const geometry = LagSTEPIntegration.getGeometry()
    const stepPath = LagSTEPIntegration.getStepPath()
    const floorboardThickness = this.expressions.get('floorboard_thickness') || 0
    const skidHeight = this.expressions.get('skid_height') || 0
    const floorboardMidZ = skidHeight + floorboardThickness / 2
    const isLeftPanel = cleatLayout.panelName === 'LEFT_END_PANEL'

    const supportCleats = cleatLayout.cleats.filter(
      cleat =>
        cleat.orientation === 'vertical' &&
        cleat.type !== 'perimeter'
    )

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

    supportCleats.forEach(cleat => {
      const headRadius = geometry.headDiameter / 2
      const shankRadius = geometry.shankDiameter / 2

      const centerY = panelOriginY + cleat.x + cleat.width / 2
      const panelStartY = panelOriginY
      const panelEndY = panelOriginY + cleatLayout.panelWidth
      const minY = panelStartY + shankRadius
      const maxY = panelEndY - shankRadius
      const frontTarget = panelStartY + 0.5
      const backTarget = panelEndY - 0.5

      const frontCandidate = clamp(frontTarget, minY, maxY)
      const backCandidate = clamp(backTarget, minY, maxY)

      const nearSide = Math.abs(centerY - frontCandidate) <= Math.abs(centerY - backCandidate)
        ? { center: frontCandidate, label: 'NEAR_FRONT', sideNote: '0.5" inboard of front side cleat' }
        : { center: backCandidate, label: 'NEAR_BACK', sideNote: '0.5" inboard of rear side cleat' }

      const yPlacements: Array<{ center: number; label: 'CENTER' | 'NEAR_FRONT' | 'NEAR_BACK'; sideNote?: string }> = [
        { center: centerY, label: 'CENTER', sideNote: 'centered between side cleats' }
      ]

      if (Math.abs(nearSide.center - centerY) > 1e-3) {
        yPlacements.push(nearSide)
      }

      const outsideFaceX = isLeftPanel
        ? panelOriginX
        : panelOriginX + cleat.thickness

      const headStartX = isLeftPanel
        ? outsideFaceX - geometry.headHeight
        : outsideFaceX
      const headEndX = isLeftPanel
        ? outsideFaceX
        : outsideFaceX + geometry.headHeight

      const shankStartX = isLeftPanel
        ? outsideFaceX
        : outsideFaceX - geometry.shankLength
      const shankEndX = isLeftPanel
        ? outsideFaceX + geometry.shankLength
        : outsideFaceX

      const orientation = isLeftPanel ? '+X inward' : '-X inward'
      const axisTag = isLeftPanel ? '+X' : '-X'
      const baseName = `${cleat.id}_LAG`
      const placements: Array<{ centerZ: number; note: string; suffix: 'MID' | 'LOW' }> = []

      placements.push({
        centerZ: floorboardMidZ,
        note: 'floorboard centerline',
        suffix: 'MID',
      })

      const cleatBottomZ = panelOriginZ + cleat.y
      const cleatTopZ = cleatBottomZ + cleat.length
      const nearCleatCenterZ = cleatBottomZ + 0.5
      if (
        nearCleatCenterZ - headRadius >= cleatBottomZ &&
        nearCleatCenterZ + headRadius <= cleatTopZ
      ) {
        placements.push({
          centerZ: nearCleatCenterZ,
          note: '0.5" above lower cleat',
          suffix: 'LOW',
        })
      }

      placements.forEach(({ centerZ, note, suffix }) => {
        yPlacements.forEach(({ center, label, sideNote }) => {
          const headPoint1 = {
            x: Math.min(headStartX, headEndX),
            y: center - headRadius,
            z: centerZ - headRadius
          }
          const headPoint2 = {
            x: Math.max(headStartX, headEndX),
            y: center + headRadius,
            z: centerZ + headRadius
          }

          const shankPoint1 = {
            x: Math.min(shankStartX, shankEndX),
            y: center - shankRadius,
            z: centerZ - shankRadius
          }
          const shankPoint2 = {
            x: Math.max(shankStartX, shankEndX),
            y: center + shankRadius,
            z: centerZ + shankRadius
          }

          const locationNote = sideNote ? `${note}, ${sideNote}` : note
          const suffixWithLocation = `${suffix}_${label}`

          this.boxes.push({
            name: `${baseName}_${suffixWithLocation}_HEAD`,
            point1: headPoint1,
            point2: headPoint2,
            color: '#6B7280',
            type: 'hardware',
            suppressed: false,
            panelName: cleatLayout.panelName,
            metadata: `Lag screw head (3/8" x 2.5") on ${cleat.id} (${orientation}, ${locationNote}, axis ${axisTag}) - STEP: "${stepPath}"`,
          })

          this.boxes.push({
            name: `${baseName}_${suffixWithLocation}_SHAFT`,
            point1: shankPoint1,
            point2: shankPoint2,
            color: '#4B5563',
            type: 'hardware',
            suppressed: false,
            panelName: cleatLayout.panelName,
            metadata: `Lag screw shank (3/8" x 2.5") on ${cleat.id} (${orientation}, ${locationNote}, axis ${axisTag}) - STEP: "${stepPath}"`,
          })

          this.lagScrewCount += 1
        })
      })
    })
  }
`

const backReplacement = `  private addLagHardwareForBackPanel(
    cleatLayout: PanelCleatLayout,
    panelOriginX: number,
    panelOriginY: number,
    panelOriginZ: number
  ) {
    const geometry = LagSTEPIntegration.getGeometry()
    const stepPath = LagSTEPIntegration.getStepPath()
    const floorboardThickness = this.expressions.get('floorboard_thickness') || 0
    const skidHeight = this.expressions.get('skid_height') || 0
    const floorboardMidZ = skidHeight + floorboardThickness / 2

    const supportCleats = cleatLayout.cleats.filter(
      cleat =>
        cleat.orientation === 'vertical' &&
        cleat.type !== 'perimeter'
    )

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

    supportCleats.forEach(cleat => {
      const headRadius = geometry.headDiameter / 2
      const shankRadius = geometry.shankDiameter / 2

      const centerX = panelOriginX + cleat.x + cleat.width / 2
      const panelStartX = panelOriginX
      const panelEndX = panelOriginX + cleatLayout.panelWidth
      const minX = panelStartX + shankRadius
      const maxX = panelEndX - shankRadius
      const leftTarget = panelStartX + 0.5
      const rightTarget = panelEndX - 0.5

      const leftCandidate = clamp(leftTarget, minX, maxX)
      const rightCandidate = clamp(rightTarget, minX, maxX)

      const nearSide = Math.abs(centerX - leftCandidate) <= Math.abs(centerX - rightCandidate)
        ? { center: leftCandidate, label: 'NEAR_LEFT', sideNote: '0.5" inboard of left side cleat' }
        : { center: rightCandidate, label: 'NEAR_RIGHT', sideNote: '0.5" inboard of right side cleat' }

      const xPlacements: Array<{ center: number; label: 'CENTER' | 'NEAR_LEFT' | 'NEAR_RIGHT'; sideNote?: string }> = [
        { center: centerX, label: 'CENTER', sideNote: 'centered between side cleats' }
      ]

      if (Math.abs(nearSide.center - centerX) > 1e-3) {
        xPlacements.push(nearSide)
      }

      const outsideFaceY = panelOriginY + cleat.thickness
      const orientation = '-Y inward'
      const axisTag = '-Y'
      const baseName = `${cleat.id}_LAG`
      const placements: Array<{ centerZ: number; note: string; suffix: 'MID' | 'LOW' }> = []

      placements.push({
        centerZ: floorboardMidZ,
        note: 'floorboard centerline',
        suffix: 'MID',
      })

      const cleatBottomZ = panelOriginZ + cleat.y
      const cleatTopZ = cleatBottomZ + cleat.length
      const nearCleatCenterZ = cleatBottomZ + 0.5
      if (
        nearCleatCenterZ - headRadius >= cleatBottomZ &&
        nearCleatCenterZ + headRadius <= cleatTopZ
      ) {
        placements.push({
          centerZ: nearCleatCenterZ,
          note: '0.5" above lower cleat',
          suffix: 'LOW',
        })
      }

      placements.forEach(({ centerZ, note, suffix }) => {
        xPlacements.forEach(({ center, label, sideNote }) => {
          const headPoint1 = {
            x: center - headRadius,
            y: outsideFaceY - geometry.headHeight,
            z: centerZ - headRadius
          }
          const headPoint2 = {
            x: center + headRadius,
            y: outsideFaceY,
            z: centerZ + headRadius
          }

          const shankPoint1 = {
            x: center - shankRadius,
            y: outsideFaceY - geometry.shankLength,
            z: centerZ - shankRadius
          }
          const shankPoint2 = {
            x: center + shankRadius,
            y: outsideFaceY,
            z: centerZ + shankRadius
          }

          const locationNote = sideNote ? `${note}, ${sideNote}` : note
          const suffixWithLocation = `${suffix}_${label}`

          this.boxes.push({
            name: `${baseName}_${suffixWithLocation}_HEAD`,
            point1: headPoint1,
            point2: headPoint2,
            color: '#6B7280',
            type: 'hardware',
            suppressed: false,
            panelName: cleatLayout.panelName,
            metadata: `Lag screw head (3/8" x 2.5") on ${cleat.id} (${orientation}, ${locationNote}, axis ${axisTag}) - STEP: "${stepPath}"`,
          })

          this.boxes.push({
            name: `${baseName}_${suffixWithLocation}_SHAFT`,
            point1: shankPoint1,
            point2: shankPoint2,
            color: '#4B5563',
            type: 'hardware',
            suppressed: false,
            panelName: cleatLayout.panelName,
            metadata: `Lag screw shank (3/8" x 2.5") on ${cleat.id} (${orientation}, ${locationNote}, axis ${axisTag}) - STEP: "${stepPath}"`,
          })

          this.lagScrewCount += 1
        })
      })
    })
  }
`

if (!sidePattern.test(original) || !backPattern.test(original)) {
  throw new Error('Unable to locate lag hardware functions in nx-generator.ts')
}

const updated = original
  .replace(sidePattern, sideReplacement + '\n')
  .replace(backPattern, backReplacement + '\n')

fs.writeFileSync(filePath, updated)
