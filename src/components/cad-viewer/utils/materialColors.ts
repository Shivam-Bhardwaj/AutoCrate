const DEFAULT_LUMBER_COLOR = '#c8894c'
const DEFAULT_PLYWOOD_COLOR = '#e0c79c'

const LUMBER_COLORS: Record<string, string> = {
  Standard: '#c8894c',
  '#2': '#d79b63',
  '#1': '#e8ae78',
  Select: '#f4c999'
}

const SKID_COLORS: Record<string, string> = {
  Standard: '#bc7e45',
  '#2': '#cc9359',
  '#1': '#ddaa70',
  Select: '#efc389'
}

const PANEL_BASE_COLORS: Record<string, string> = {
  CDX: '#e6cc9f',
  BC: '#eed7b0',
  AC: '#f6e7c9',
  Marine: '#f1d9a6',
  OSB: '#d7b483',
  Standard: '#c8894c',
  '#2': '#d79b63',
  '#1': '#e8ae78',
  Select: '#f4c999'
}

const PANEL_TONES = {
  bottom: -0.12,
  top: 0.06,
  side: -0.04,
  end: -0.08
} as const

export type CratePanelType = keyof typeof PANEL_TONES

export function getLumberColor(material: string): string {
  return LUMBER_COLORS[material] || DEFAULT_LUMBER_COLOR
}

export function getSkidColor(material: string): string {
  if (material in SKID_COLORS) {
    return SKID_COLORS[material]
  }

  return adjustColor(getLumberColor(material), -0.08)
}

export function getPanelColor(material: string, type: CratePanelType): string {
  const baseColor = PANEL_BASE_COLORS[material] || DEFAULT_PLYWOOD_COLOR
  const tone = PANEL_TONES[type]

  return adjustColor(baseColor, tone)
}

export function adjustColor(hex: string, factor: number): string {
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
