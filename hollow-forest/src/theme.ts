export const ACCENT_COLOR = '#4dffc3'
export const SPARKLE_COLOR = '#ffd36a'
export const FOG_COLOR = '#05060a'
export const FOG_DENSITY = 0.018

export const HEART = { x: 0, y: 0, z: -36 } as const
export const HEART_CLEARING_RADIUS = 42
export const CASTLE_SCALE = 2.95
export const HALL_SCALE = 1.45
export const HALL_Y = 3.15

export const scrollState = { offset: 0 }
export const stormState = { flash: 0 }
export const journeyState = {
  busZ: 24,
  gateOpen: 0,
  students: 0,
  interior: 0,
  explore: 0,
  feast: 0,
  houseIndex: 0,
  whiteout: 0,
}

export function advanceHouse() {
  journeyState.houseIndex = (journeyState.houseIndex + 1) % HOUSE_CYCLE.length
}

export type HouseId = 'EMBER' | 'PINE' | 'TIDE' | 'DUSK'

export const HOUSES = [
  {
    id: 'EMBER' as const,
    name: 'Ember',
    color: '#7a1f1f',
    glow: '#e8a060',
    motto: 'Kindle the dark.',
    text: 'Ember is the house of first light. Its students keep the hall warm, take the first step when others freeze, and turn fear into flame.',
  },
  {
    id: 'PINE' as const,
    name: 'Pine',
    color: '#1f5c38',
    glow: '#7dbe8a',
    motto: 'Stand and remember.',
    text: 'Pine is the house of the deep wood. Its students stay rooted, keep watch through the night, and remember the forest that brought them to Hollow Academy.',
  },
  {
    id: 'TIDE' as const,
    name: 'Tide',
    color: '#1a5f73',
    glow: '#7ec8d9',
    motto: 'Move, and find.',
    text: 'Tide is the house of changing water. Its students follow the current, find what is hidden beneath the surface, and never stay still for long.',
  },
  {
    id: 'DUSK' as const,
    name: 'Dusk',
    color: '#5b3d7a',
    glow: '#c4a0e8',
    motto: 'Walk the last hour.',
    text: 'Dusk is the house of the last hour. Its students walk the edge of night, keep secrets kindly, and light the way home when the candles burn low.',
  },
] as const

export const HOUSE_CYCLE = [HOUSES[2], HOUSES[1], HOUSES[0], HOUSES[3]]
export const HOUSE_ZIGZAG = [HOUSES[2], HOUSES[3], HOUSES[0], HOUSES[1]]

type HouseListener = () => void
const houseListeners = new Set<HouseListener>()

export const houseState = { selected: null as HouseId | null }

export function selectHouse(id: HouseId | null) {
  houseState.selected = id
  houseListeners.forEach((fn) => fn())
}

export function subscribeHouse(listener: HouseListener) {
  houseListeners.add(listener)
  return () => {
    houseListeners.delete(listener)
  }
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
