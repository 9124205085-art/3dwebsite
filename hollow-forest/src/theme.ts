export const ACCENT_COLOR = '#4dffc3'
export const SPARKLE_COLOR = '#ffd36a'
export const FOG_COLOR = '#05060a'
export const FOG_DENSITY = 0.018

export const HEART = { x: 0, y: 0, z: -36 } as const
export const HEART_CLEARING_RADIUS = 14

export const scrollState = { offset: 0 }

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
