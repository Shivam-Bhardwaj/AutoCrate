'use client'

import { Text, Plane, Box } from '@react-three/drei'
import { NXBox, NXGenerator, MarkingDimensions } from '@/lib/nx-generator'
import { MARKING_STANDARDS } from '@/lib/crate-constants'
import * as THREE from 'three'
import { useMemo } from 'react'

interface MarkingVisualizerProps {
  boxes: NXBox[]
  generator: NXGenerator
}

export function MarkingVisualizer({ boxes, generator }: MarkingVisualizerProps) {
  const scale = 0.1 // Same scale as CrateVisualizer

  const markings = useMemo(() => {
    // Get marking dimensions
    const fragileDims = generator.getMarkingDimensions('fragile')
    const handlingDims = generator.getMarkingDimensions('handling')
    const autocrateDims = generator.getMarkingDimensions('autocrate')

    // Return early if no markings are enabled
    if (!fragileDims && !handlingDims && !autocrateDims) {
      return []
    }

    // Find all panel boxes (including plywood panels)
    const panels = boxes.filter(box => {
      // Check for main panels
      if (box.type === 'panel') {
        return box.name === 'FRONT_PANEL' ||
               box.name === 'BACK_PANEL' ||
               box.name === 'LEFT_END_PANEL' ||
               box.name === 'RIGHT_END_PANEL'
      }
      // Also check for plywood pieces of these panels
      if (box.type === 'plywood') {
        return box.name?.includes('FRONT_PANEL_PLY') ||
               box.name?.includes('BACK_PANEL_PLY') ||
               box.name?.includes('LEFT_END_PANEL_PLY') ||
               box.name?.includes('RIGHT_END_PANEL_PLY')
      }
      return false
    })

    const markingList: any[] = []

    // For each main panel type, find the first panel piece
    const panelTypes = ['FRONT_PANEL', 'BACK_PANEL', 'LEFT_END_PANEL', 'RIGHT_END_PANEL']

    panelTypes.forEach(panelType => {
      // Find all plywood pieces for this panel type
      const panelPieces = panels.filter(p =>
        p.name === panelType || p.name?.startsWith(`${panelType}_PLY`)
      )

      if (panelPieces.length === 0) return

      // Calculate aggregate bounding box for entire panel (all plywood pieces)
      const minX = Math.min(...panelPieces.map(p => Math.min(p.point1.x, p.point2.x)))
      const maxX = Math.max(...panelPieces.map(p => Math.max(p.point1.x, p.point2.x)))
      const minY = Math.min(...panelPieces.map(p => Math.min(p.point1.y, p.point2.y)))
      const maxY = Math.max(...panelPieces.map(p => Math.max(p.point1.y, p.point2.y)))
      const minZ = Math.min(...panelPieces.map(p => Math.min(p.point1.z, p.point2.z)))
      const maxZ = Math.max(...panelPieces.map(p => Math.max(p.point1.z, p.point2.z)))

      const center = {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        z: (minZ + maxZ) / 2,
      }

      const size = {
        x: maxX - minX,
        y: maxY - minY,
        z: maxZ - minZ,
      }

      // Small offset from panel surface (in scaled units) to prevent z-fighting
      const surfaceOffset = 0.01  // Increased to prevent aliasing

      // Position offset from edges (inches in real dimensions)
      const edgeOffset = MARKING_STANDARDS.POSITIONING.EDGE_OFFSET

      if (panelType === 'FRONT_PANEL') {
        // Front panel faces -Y direction
        // Convert NX coordinates to Three.js: X->X, Y->-Z, Z->Y

        if (fragileDims) {
          markingList.push({
            position: new THREE.Vector3(
              center.x * scale,
              center.z * scale,
              -(center.y - size.y/2) * scale - surfaceOffset
            ),
            size: [fragileDims.width * scale, fragileDims.height * scale],
            text: 'FRAGILE',
            color: MARKING_STANDARDS.COLORS.FRAGILE,
            fontSize: fragileDims.height * scale * 0.4,
            rotation: [0, 0, MARKING_STANDARDS.POSITIONING.FRAGILE_ROTATION],
            partNumber: fragileDims.partNumber
          })
        }

        if (handlingDims) {
          markingList.push({
            position: new THREE.Vector3(
              (center.x + size.x/2 - handlingDims.width/2 - edgeOffset) * scale,
              (center.z + size.z/2 - handlingDims.height/2 - edgeOffset) * scale,
              -(center.y - size.y/2) * scale - surfaceOffset
            ),
            size: [handlingDims.width * scale, handlingDims.height * scale],
            text: '↑\nGLASS\nUMBRELLA',
            color: MARKING_STANDARDS.COLORS.HANDLING,
            fontSize: handlingDims.height * scale * 0.2,
            partNumber: handlingDims.partNumber
          })
        }

        if (autocrateDims) {
          // Position AUTOCRATE text below center to avoid overlap with FRAGILE
          const verticalOffset = fragileDims ? fragileDims.height / 2 + MARKING_STANDARDS.POSITIONING.VERTICAL_SEPARATION : 0
          markingList.push({
            position: new THREE.Vector3(
              center.x * scale,
              (center.z - verticalOffset) * scale,
              -(center.y - size.y/2) * scale - surfaceOffset
            ),
            size: [autocrateDims.width * scale, autocrateDims.height * scale],
            text: 'AUTOCRATE',
            color: MARKING_STANDARDS.COLORS.AUTOCRATE,
            fontSize: autocrateDims.height * scale * 0.5,
            partNumber: autocrateDims.partNumber
          })
        }
      } else if (panelType === 'BACK_PANEL') {
        // Back panel faces +Y direction

        if (fragileDims) {
          markingList.push({
            position: new THREE.Vector3(
              center.x * scale,
              center.z * scale,
              -(center.y + size.y/2) * scale + surfaceOffset
            ),
            size: [fragileDims.width * scale, fragileDims.height * scale],
            text: 'FRAGILE',
            color: MARKING_STANDARDS.COLORS.FRAGILE,
            fontSize: fragileDims.height * scale * 0.4,
            rotation: [0, Math.PI, MARKING_STANDARDS.POSITIONING.FRAGILE_ROTATION],
            partNumber: fragileDims.partNumber
          })
        }

        if (handlingDims) {
          markingList.push({
            position: new THREE.Vector3(
              (center.x - size.x/2 + handlingDims.width/2 + edgeOffset) * scale,
              (center.z + size.z/2 - handlingDims.height/2 - edgeOffset) * scale,
              -(center.y + size.y/2) * scale + surfaceOffset
            ),
            size: [handlingDims.width * scale, handlingDims.height * scale],
            text: '↑\nGLASS\nUMBRELLA',
            color: MARKING_STANDARDS.COLORS.HANDLING,
            fontSize: handlingDims.height * scale * 0.2,
            rotation: [0, Math.PI, 0],
            partNumber: handlingDims.partNumber
          })
        }

        if (autocrateDims) {
          // Position AUTOCRATE text below center to avoid overlap with FRAGILE
          const verticalOffset = fragileDims ? fragileDims.height / 2 + MARKING_STANDARDS.POSITIONING.VERTICAL_SEPARATION : 0
          markingList.push({
            position: new THREE.Vector3(
              center.x * scale,
              (center.z - verticalOffset) * scale,
              -(center.y + size.y/2) * scale + surfaceOffset
            ),
            size: [autocrateDims.width * scale, autocrateDims.height * scale],
            text: 'AUTOCRATE',
            color: MARKING_STANDARDS.COLORS.AUTOCRATE,
            fontSize: autocrateDims.height * scale * 0.5,
            rotation: [0, Math.PI, 0],
            partNumber: autocrateDims.partNumber
          })
        }
      } else if (panelType === 'LEFT_END_PANEL') {
        // Left panel faces -X direction

        if (fragileDims) {
          markingList.push({
            position: new THREE.Vector3(
              (center.x - size.x/2) * scale - surfaceOffset,
              center.z * scale,
              -center.y * scale
            ),
            size: [fragileDims.width * scale, fragileDims.height * scale],
            text: 'FRAGILE',
            color: MARKING_STANDARDS.COLORS.FRAGILE,
            fontSize: fragileDims.height * scale * 0.4,
            rotation: [0, -Math.PI/2, MARKING_STANDARDS.POSITIONING.FRAGILE_ROTATION],
            partNumber: fragileDims.partNumber
          })
        }

        if (handlingDims) {
          markingList.push({
            position: new THREE.Vector3(
              (center.x - size.x/2) * scale - surfaceOffset,
              (center.z + size.z/2 - handlingDims.height/2 - edgeOffset) * scale,
              -(center.y + size.y/2 - handlingDims.width/2 - edgeOffset) * scale
            ),
            size: [handlingDims.width * scale, handlingDims.height * scale],
            text: '↑\nGLASS\nUMBRELLA',
            color: MARKING_STANDARDS.COLORS.HANDLING,
            fontSize: handlingDims.height * scale * 0.2,
            rotation: [0, -Math.PI/2, 0],
            partNumber: handlingDims.partNumber
          })
        }

        if (autocrateDims) {
          // Position AUTOCRATE text below center to avoid overlap with FRAGILE
          const verticalOffset = fragileDims ? fragileDims.height / 2 + MARKING_STANDARDS.POSITIONING.VERTICAL_SEPARATION : 0
          markingList.push({
            position: new THREE.Vector3(
              (center.x - size.x/2) * scale - surfaceOffset,
              (center.z - verticalOffset) * scale,
              -center.y * scale
            ),
            size: [autocrateDims.width * scale, autocrateDims.height * scale],
            text: 'AUTOCRATE',
            color: MARKING_STANDARDS.COLORS.AUTOCRATE,
            fontSize: autocrateDims.height * scale * 0.5,
            rotation: [0, -Math.PI/2, 0],
            partNumber: autocrateDims.partNumber
          })
        }
      } else if (panelType === 'RIGHT_END_PANEL') {
        // Right panel faces +X direction

        if (fragileDims) {
          markingList.push({
            position: new THREE.Vector3(
              (center.x + size.x/2) * scale + surfaceOffset,
              center.z * scale,
              -center.y * scale
            ),
            size: [fragileDims.width * scale, fragileDims.height * scale],
            text: 'FRAGILE',
            color: MARKING_STANDARDS.COLORS.FRAGILE,
            fontSize: fragileDims.height * scale * 0.4,
            rotation: [0, Math.PI/2, MARKING_STANDARDS.POSITIONING.FRAGILE_ROTATION],
            partNumber: fragileDims.partNumber
          })
        }

        if (handlingDims) {
          markingList.push({
            position: new THREE.Vector3(
              (center.x + size.x/2) * scale + surfaceOffset,
              (center.z + size.z/2 - handlingDims.height/2 - edgeOffset) * scale,
              -(center.y - size.y/2 + handlingDims.width/2 + edgeOffset) * scale
            ),
            size: [handlingDims.width * scale, handlingDims.height * scale],
            text: '↑\nGLASS\nUMBRELLA',
            color: MARKING_STANDARDS.COLORS.HANDLING,
            fontSize: handlingDims.height * scale * 0.2,
            rotation: [0, Math.PI/2, 0],
            partNumber: handlingDims.partNumber
          })
        }

        if (autocrateDims) {
          // Position AUTOCRATE text below center to avoid overlap with FRAGILE
          const verticalOffset = fragileDims ? fragileDims.height / 2 + MARKING_STANDARDS.POSITIONING.VERTICAL_SEPARATION : 0
          markingList.push({
            position: new THREE.Vector3(
              (center.x + size.x/2) * scale + surfaceOffset,
              (center.z - verticalOffset) * scale,
              -center.y * scale
            ),
            size: [autocrateDims.width * scale, autocrateDims.height * scale],
            text: 'AUTOCRATE',
            color: MARKING_STANDARDS.COLORS.AUTOCRATE,
            fontSize: autocrateDims.height * scale * 0.5,
            rotation: [0, Math.PI/2, 0],
            partNumber: autocrateDims.partNumber
          })
        }
      }
    })

    return markingList
  }, [boxes, generator])

  if (markings.length === 0) {
    return null
  }

  return (
    <group name="markings">
      {markings.map((marking, index) => (
        <group
          key={index}
          position={marking.position}
          rotation={marking.rotation || [0, 0, 0]}
        >
          {/* White background plane */}
          <Plane args={marking.size}>
            <meshBasicMaterial
              color="#FFFFFF"
              opacity={0.9}
              transparent
              side={THREE.DoubleSide}
            />
          </Plane>

          {/* Border frame */}
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(...marking.size)]} />
            <lineBasicMaterial color={marking.color} linewidth={2} />
          </lineSegments>

          {/* Main text */}
          <Text
            position={[0, marking.size[1] * 0.1, 0.002]}
            fontSize={marking.fontSize}
            color={marking.color}
            anchorX="center"
            anchorY="middle"
            lineHeight={1.2}
            textAlign="center"
          >
            {marking.text}
          </Text>

          {/* Part number */}
          <Text
            position={[0, -marking.size[1] * 0.35, 0.002]}
            fontSize={marking.fontSize * 0.3}
            color="#666666"
            anchorX="center"
            anchorY="middle"
          >
            {marking.partNumber}
          </Text>
        </group>
      ))}
    </group>
  )
}
