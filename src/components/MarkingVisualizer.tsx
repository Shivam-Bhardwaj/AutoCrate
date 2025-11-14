'use client'

import { Text, Plane, Box } from '@react-three/drei'
import { NXBox, NXGenerator, MarkingDimensions } from '@/lib/nx-generator'
import { MARKING_STANDARDS } from '@/lib/crate-constants'
import { StencilBoundingBox, useStepDimensions } from './StepBoundingBox'
import { OrientationDetector } from '@/lib/orientation-detector'
import * as THREE from 'three'
import { useMemo } from 'react'

interface MarkingVisualizerProps {
  boxes: NXBox[]
  generator: NXGenerator
  useBoundingBox?: boolean  // New prop to control whether to use bounding boxes or text
}

export function MarkingVisualizer({ boxes, generator, useBoundingBox = true }: MarkingVisualizerProps) {
  const scale = 0.1 // Same scale as CrateVisualizer

  const markings = useMemo(() => {
    // Get marking dimensions
    const fragileDims = generator.getMarkingDimensions('fragile')
    const handlingDims = generator.getMarkingDimensions('handling')

    // Return early if no markings are enabled
    if (!fragileDims && !handlingDims) {
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

      // Different offsets for different markings to prevent z-fighting and overlap
      // Fragile marking offset (closer to surface)
      const fragileSurfaceOffset = 0.01
      // Handling marking offset (slightly further from surface to avoid overlap)
      const handlingSurfaceOffset = 0.02

      // Position offset from edges (inches in real dimensions)
      const edgeOffset = MARKING_STANDARDS.POSITIONING.EDGE_OFFSET
      
      // Additional separation to prevent overlap between fragile and handling markings
      const markingSeparation = 4  // Minimum distance between markings (inches)

      if (panelType === 'FRONT_PANEL') {
        // Front panel faces -Y direction
        // Convert NX coordinates to Three.js: X->X, Y->-Z, Z->Y

        if (fragileDims) {
          markingList.push({
            position: new THREE.Vector3(
              center.x * scale,
              center.z * scale,
              -(center.y - size.y/2) * scale - fragileSurfaceOffset
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
          // Position handling marking at top-right corner, ensuring it doesn't overlap with fragile
          // Check if fragile marking would overlap - if so, move handling marking further
          const fragileHalfWidth = fragileDims ? fragileDims.width / 2 : 0
          const handlingHalfWidth = handlingDims.width / 2
          const minXForHandling = center.x + fragileHalfWidth + handlingHalfWidth + markingSeparation
          const maxXForPanel = center.x + size.x / 2
          const handlingX = Math.max(
            minXForHandling,
            Math.min(center.x + size.x/2 - handlingDims.width/2 - edgeOffset, maxXForPanel - handlingDims.width/2 - edgeOffset)
          )
          
          markingList.push({
            position: new THREE.Vector3(
              handlingX * scale,
              (center.z + size.z/2 - handlingDims.height/2 - edgeOffset) * scale,
              -(center.y - size.y/2) * scale - handlingSurfaceOffset
            ),
            size: [handlingDims.width * scale, handlingDims.height * scale],
            text: '↑\nGLASS\nUMBRELLA',
            color: MARKING_STANDARDS.COLORS.HANDLING,
            fontSize: handlingDims.height * scale * 0.2,
            partNumber: handlingDims.partNumber
          })
        }
      } else if (panelType === 'BACK_PANEL') {
        // Back panel faces +Y direction

        if (fragileDims) {
          markingList.push({
            position: new THREE.Vector3(
              center.x * scale,
              center.z * scale,
              -(center.y + size.y/2) * scale + fragileSurfaceOffset
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
          // Position handling marking at top-left corner, ensuring it doesn't overlap with fragile
          const fragileHalfWidth = fragileDims ? fragileDims.width / 2 : 0
          const handlingHalfWidth = handlingDims.width / 2
          const maxXForHandling = center.x - fragileHalfWidth - handlingHalfWidth - markingSeparation
          const minXForPanel = center.x - size.x / 2
          const handlingX = Math.min(
            maxXForHandling,
            Math.max(center.x - size.x/2 + handlingDims.width/2 + edgeOffset, minXForPanel + handlingDims.width/2 + edgeOffset)
          )
          
          markingList.push({
            position: new THREE.Vector3(
              handlingX * scale,
              (center.z + size.z/2 - handlingDims.height/2 - edgeOffset) * scale,
              -(center.y + size.y/2) * scale + handlingSurfaceOffset
            ),
            size: [handlingDims.width * scale, handlingDims.height * scale],
            text: '↑\nGLASS\nUMBRELLA',
            color: MARKING_STANDARDS.COLORS.HANDLING,
            fontSize: handlingDims.height * scale * 0.2,
            rotation: [0, Math.PI, 0],
            partNumber: handlingDims.partNumber
          })
        }
      } else if (panelType === 'LEFT_END_PANEL') {
        // Left panel faces -X direction

        if (fragileDims) {
          markingList.push({
            position: new THREE.Vector3(
              (center.x - size.x/2) * scale - fragileSurfaceOffset,
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
          // Position handling marking at top, ensuring vertical separation from fragile
          const fragileHalfHeight = fragileDims ? fragileDims.height / 2 : 0
          const handlingHalfHeight = handlingDims.height / 2
          const minZForHandling = center.z + fragileHalfHeight + handlingHalfHeight + markingSeparation
          const maxZForPanel = center.z + size.z / 2
          const handlingZ = Math.max(
            minZForHandling,
            Math.min(center.z + size.z/2 - handlingDims.height/2 - edgeOffset, maxZForPanel - handlingDims.height/2 - edgeOffset)
          )
          
          markingList.push({
            position: new THREE.Vector3(
              (center.x - size.x/2) * scale - handlingSurfaceOffset,
              handlingZ * scale,
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
      } else if (panelType === 'RIGHT_END_PANEL') {
        // Right panel faces +X direction

        if (fragileDims) {
          markingList.push({
            position: new THREE.Vector3(
              (center.x + size.x/2) * scale + fragileSurfaceOffset,
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
          // Position handling marking at top, ensuring vertical separation from fragile
          const fragileHalfHeight = fragileDims ? fragileDims.height / 2 : 0
          const handlingHalfHeight = handlingDims.height / 2
          const minZForHandling = center.z + fragileHalfHeight + handlingHalfHeight + markingSeparation
          const maxZForPanel = center.z + size.z / 2
          const handlingZ = Math.max(
            minZForHandling,
            Math.min(center.z + size.z/2 - handlingDims.height/2 - edgeOffset, maxZForPanel - handlingDims.height/2 - edgeOffset)
          )
          
          markingList.push({
            position: new THREE.Vector3(
              (center.x + size.x/2) * scale + handlingSurfaceOffset,
              handlingZ * scale,
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
      }
    })

    return markingList
  }, [boxes, generator])

  if (markings.length === 0) {
    return null
  }

  // If using bounding boxes, render dark boxes from STEP files
  if (useBoundingBox) {
    return (
      <group name="markings-bounding-boxes">
        {markings.map((marking, index) => {
          // Determine stencil type from marking text
          let stencilType: 'fragile' | 'horizontal-handling' | 'vertical-handling' | 'cg' | 'do-not-stack' | 'applied-impact' = 'fragile'

          if (marking.text.includes('FRAGILE')) {
            stencilType = 'fragile'
          } else if (marking.text.includes('GLASS') || marking.text.includes('UMBRELLA')) {
            // For now, use vertical handling for all handling symbols
            stencilType = 'vertical-handling'
          }

          // Determine edge/panel from rotation
          let edge: 'front' | 'back' | 'left' | 'right' | 'top' = 'front'
          const rot = marking.rotation || [0, 0, 0]

          if (Math.abs(rot[1] - Math.PI) < 0.1) {
            edge = 'back'
          } else if (Math.abs(rot[1] - Math.PI / 2) < 0.1) {
            edge = 'right'
          } else if (Math.abs(rot[1] + Math.PI / 2) < 0.1) {
            edge = 'left'
          }

          // Get orientation for this stencil
          const orientation = OrientationDetector.getStencilOrientation(
            stencilType === 'fragile' ? 'STENCIL - FRAGILE.stp' : 'STENCIL - VERTICAL HANDLING.stp',
            {
              edge,
              surfaceNormal: { x: 0, y: edge === 'left' ? -1 : edge === 'right' ? 1 : 0, z: 0 }
            }
          )

          // Convert Three.js position back to NX coordinates for StencilBoundingBox
          const nxPos: [number, number, number] = [
            marking.position.x / 0.1,  // Scale back from Three.js
            -marking.position.z / 0.1,
            marking.position.y / 0.1
          ]

          return (
            <StencilBoundingBox
              key={index}
              stencilType={stencilType}
              position={nxPos}
              rotation={[orientation.rotation.x, orientation.rotation.y, orientation.rotation.z]}
              scale={0.1}
            />
          )
        })}
      </group>
    )
  }

  // Otherwise render with text (original behavior)
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
