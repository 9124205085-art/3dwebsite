import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import {
  AmbientLight,
  Color,
  DirectionalLight,
  FogExp2,
  Group,
  HemisphereLight,
  PointLight,
  Vector3,
} from 'three'
import { FOG_COLOR, journeyState, stormState } from './theme'

const FLASH_COLOR = new Color('#dce8ff')
const FOG_BASE = new Color(FOG_COLOR)
const SKY_BASE = new Color('#070910')
const SKY_FLASH = new Color('#b7c8e6')
const GROUND_Y = 0.05

type BoltPath = {
  points: [number, number, number][]
  width: number
  color: string
  opacity: number
}

function displace(
  start: Vector3,
  end: Vector3,
  generations: number,
  offset: number,
) {
  let points = [start.clone(), end.clone()]
  let amplitude = offset

  for (let generation = 0; generation < generations; generation++) {
    const next: Vector3[] = [points[0]]
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]
      const b = points[i + 1]
      const mid = a.clone().lerp(b, 0.45 + Math.random() * 0.1)
      const dir = b.clone().sub(a)
      const perp = new Vector3(-dir.z, 0, dir.x)
      if (perp.lengthSq() < 0.0001) perp.set(1, 0, 0)
      perp.normalize()
      mid.addScaledVector(perp, (Math.random() - 0.5) * amplitude * 2)
      mid.x += (Math.random() - 0.5) * amplitude * 0.35
      mid.y += (Math.random() - 0.5) * amplitude * 0.12
      mid.z += (Math.random() - 0.5) * amplitude * 0.35
      next.push(mid, b.clone())
    }
    points = next
    amplitude *= 0.46
  }

  return points
}

function toTuples(points: Vector3[]): [number, number, number][] {
  return points.map((point) => [point.x, point.y, point.z])
}

function fractalBolt(
  start: Vector3,
  end: Vector3,
  depth: number,
): BoltPath[] {
  const jagged = displace(start, end, Math.max(3, 6 - depth), 7.5 / (depth + 1))
  const trunk: BoltPath = {
    points: toTuples(jagged),
    width: depth === 0 ? 3.4 : 1.8 / (depth + 0.35),
    color: depth === 0 ? '#ffffff' : '#d7e9ff',
    opacity: depth === 0 ? 1 : 0.72 / (depth * 0.25 + 1),
  }

  const bolts = [trunk]
  if (depth >= 2) return bolts

  const branches =
    depth === 0 ? 4 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2)

  for (let i = 0; i < branches; i++) {
    const index = Math.floor(jagged.length * (0.12 + Math.random() * 0.7))
    const origin = jagged[index]
    const drop = Math.max(4, origin.y * (0.3 + Math.random() * 0.55))
    const branchEnd = new Vector3(
      origin.x + (Math.random() - 0.5) * (16 - depth * 4),
      Math.max(GROUND_Y, origin.y - drop),
      origin.z + (Math.random() - 0.5) * 10,
    )
    bolts.push(...fractalBolt(origin, branchEnd, depth + 1))
  }

  return bolts
}

function spawnStorm(camera: Vector3) {
  const bolts: BoltPath[] = []
  const count = 4 + Math.floor(Math.random() * 3)

  for (let i = 0; i < count; i++) {
    const spread = count <= 1 ? 0 : i / (count - 1) - 0.5
    const x = camera.x + spread * 36 + (Math.random() - 0.5) * 6
    const z = camera.z - (10 + Math.random() * 24)
    const start = new Vector3(
      x + (Math.random() - 0.5) * 8,
      camera.y + 22 + Math.random() * 34,
      z + (Math.random() - 0.5) * 5,
    )
    const end = new Vector3(x, GROUND_Y, z + (Math.random() - 0.5) * 4)
    bolts.push(...fractalBolt(start, end, 0))
  }

  return bolts
}

function layeredBolt(path: BoltPath, key: string) {
  return (
    <group key={key}>
      <Line
        points={path.points}
        color="#7ea6ff"
        lineWidth={path.width * 5.5}
        transparent
        opacity={path.opacity * 0.16}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        fog={false}
      />
      <Line
        points={path.points}
        color="#cfe4ff"
        lineWidth={path.width * 2.3}
        transparent
        opacity={path.opacity * 0.45}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        fog={false}
      />
      <Line
        points={path.points}
        color={path.color}
        lineWidth={path.width}
        transparent
        opacity={path.opacity}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        fog={false}
      />
    </group>
  )
}

export function Storm() {
  const light = useRef<DirectionalLight>(null)
  const ambient = useRef<AmbientLight>(null)
  const hemi = useRef<HemisphereLight>(null)
  const impact = useRef<PointLight>(null)
  const group = useRef<Group>(null)
  const nextStrike = useRef(1.1)
  const secondBurst = useRef(false)
  const [boltId, setBoltId] = useState(0)
  const seed = useMemo(() => new Vector3(0, 5.5, 28), [])
  const [bolts, setBolts] = useState(() => spawnStorm(seed))
  const strikePos = useRef(new Vector3(0, GROUND_Y, 12))

  useFrame(({ camera, scene }, delta) => {
    const inside = journeyState.interior > 0.12

    if (inside) {
      stormState.flash = 0
      nextStrike.current = 3
      if (group.current) group.current.visible = false
      if (light.current) light.current.intensity = 0
      if (impact.current) impact.current.intensity = 0
      if (ambient.current) ambient.current.intensity = 0
      if (hemi.current) hemi.current.intensity = 0
      return
    }

    nextStrike.current -= delta

    if (nextStrike.current <= 0) {
      stormState.flash = secondBurst.current ? 0.85 : 1
      const next = spawnStorm(camera.position)
      setBolts(next)
      setBoltId((id) => id + 1)
      const last = next[0]?.points.at(-1)
      if (last) strikePos.current.set(last[0], last[1], last[2])

      if (!secondBurst.current && Math.random() > 0.28) {
        secondBurst.current = true
        nextStrike.current = 0.08 + Math.random() * 0.08
      } else {
        secondBurst.current = false
        nextStrike.current = 2.2 + Math.random() * 3.8
      }
    }

    stormState.flash = Math.max(0, stormState.flash - delta * 1.55)
    const flash = stormState.flash

    if (light.current) {
      light.current.intensity = flash * 32
      light.current.position.set(
        camera.position.x + 6,
        36,
        camera.position.z - 8,
      )
    }
    if (impact.current) {
      impact.current.intensity = flash * 18
      impact.current.position.copy(strikePos.current)
    }
    if (ambient.current) ambient.current.intensity = flash * 3.8
    if (hemi.current) hemi.current.intensity = flash * 2.2

    if (group.current) {
      group.current.visible = flash > 0.03
    }

    const fog = scene.fog
    if (fog instanceof FogExp2) {
      fog.color.lerpColors(FOG_BASE, FLASH_COLOR, flash * 0.9)
    }
    if (scene.background instanceof Color) {
      scene.background.lerpColors(SKY_BASE, SKY_FLASH, flash * 0.8)
    }
  })

  return (
    <group>
      <ambientLight ref={ambient} color="#eef3ff" intensity={0} />
      <hemisphereLight
        ref={hemi}
        color="#dce6f5"
        groundColor="#3d433c"
        intensity={0}
      />
      <directionalLight ref={light} color="#eaf2ff" intensity={0} />
      <pointLight
        ref={impact}
        color="#f7fbff"
        intensity={0}
        distance={58}
      />

      <group ref={group} visible={false} renderOrder={30}>
        {bolts.map((path, index) => layeredBolt(path, `${boltId}-${index}`))}
      </group>
    </group>
  )
}
