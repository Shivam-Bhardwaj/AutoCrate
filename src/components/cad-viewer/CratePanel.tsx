'use client'

import { useMemo } from 'react'
import { Edges } from '@react-three/drei'

interface CratePanelProps {
  type: 'bottom' | 'top' | 'side' | 'end'
  dimensions: {
    width: number
    length: number
    thickness: number
  }
  position: [number, number, number]
  rotation?: [number, number, number]
  material: string
}

export function CratePanel({
  type,
  dimensions,
  position,
  rotation = [0, 0, 0],
  material
}: CratePanelProps) {
  const materialColor = useMemo(() => getPanelColor(material, type), [material, type])
  const edgeColor = useMemo(() => adjustColor(materialColor, -0.35), [materialColor])
  
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[dimensions.width, dimensions.thickness, dimensions.length]} />
      <meshLambertMaterial
        color={materialColor}
        transparent
        opacity={0.92}
      />
      <Edges color={edgeColor} threshold={20} />
    </mesh>
  )
}

function getPanelColor(material: string, type: CratePanelProps['type']): string {
  const materialPalette: Record<string, string> = {
    'CDX': '#e6cc9f',
    'BC': '#eed7b0',
    'AC': '#f6e7c9',
    'Marine': '#f1d9a6',
    'OSB': '#d7b483',
    'Standard': '#c8894c',
    '#2': '#d79b63',
    '#1': '#e8ae78',
    'Select': '#f4c999'
  }

  const baseColor = materialPalette[material] || '#e0c79c'
  const panelTone: Record<CratePanelProps['type'], number> = {
    bottom: -0.12,
    top: 0.06,
    side: -0.04,
    end: -0.08
  }

  return adjustColor(baseColor, panelTone[type])
}

function adjustColor(hex: string, factor: number): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) {
    return hex
  }

  const num = parseInt(normalized, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff

  const adjust = (value: number) => {
    if (factor >= 0) {
      return Math.min(255, Math.round(value + (255 - value) * factor))
    }

    return Math.max(0, Math.round(value + value * factor))
  }

  r = adjust(r)
  g = adjust(g)
  b = adjust(b)

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

