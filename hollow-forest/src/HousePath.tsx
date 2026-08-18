import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  DoubleSide,
  Group,
  MathUtils,
  MeshStandardMaterial,
  Vector3,
} from 'three'
import { makeParchmentTexture } from './HouseParchment'
import { HOUSE_CYCLE, advanceHouse, journeyState } from './theme'

const WOOD = '#4a3424'
const WOOD_DARK = '#2c1d14'
const UP = new Vector3(0, 1, 0)

const STOPS = [
  { x: 0, y: 1.7, z: 4.55 },
  { x: -1.2, y: 1.82, z: 2.4 },
  { x: 1.2, y: 1.9, z: 0.25 },
  { x: 0, y: 2.02, z: -1.95 },
] as const

function ArrowSegment({
  from,
  to,
  unlock,
}: {
  from: (typeof STOPS)[number]
  to: (typeof STOPS)[number]
  unlock: number
}) {
  const group = useRef<Group>(null)
  const a = useMemo(() => new Vector3(from.x, from.y + 0.12, from.z), [from])
  const b = useMemo(() => new Vector3(to.x, to.y + 0.12, to.z), [to])
  const mid = useRef(new Vector3())
  const dir = useRef(new Vector3())
  const tip = useRef(new Vector3())
  const shown = useRef(0)

  useFrame((_, delta) => {
    if (!group.current) return
    const target = journeyState.houseIndex >= unlock ? 1 : 0
    shown.current = MathUtils.damp(shown.current, target, 5, delta)
    const visible = shown.current
    group.current.visible = visible > 0.02
    tip.current.lerpVectors(a, b, visible)
    dir.current.copy(tip.current).sub(a)
    const len = dir.current.length()
    if (len < 0.04) return
    dir.current.normalize()
    mid.current.lerpVectors(a, tip.current, 0.5)
    group.current.position.copy(mid.current)
    group.current.quaternion.setFromUnitVectors(UP, dir.current)
    group.current.scale.set(1, len, 1)
  })

  return (
    <group ref={group} visible={false}>
      <mesh>
        <cylinderGeometry args={[0.028, 0.028, 1, 8]} />
        <meshStandardMaterial
          color="#e8c56a"
          emissive="#e8c56a"
          emissiveIntensity={0.65}
          metalness={0.85}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <coneGeometry args={[0.08, 0.22, 8]} />
        <meshStandardMaterial
          color="#f3dd9a"
          emissive="#e8c56a"
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.22}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function CharmBall() {
  const group = useRef<Group>(null)
  const left = useRef<Group>(null)
  const right = useRef<Group>(null)
  const from = useRef(new Vector3())
  const points = useMemo(
    () => STOPS.map((stop) => new Vector3(stop.x, stop.y + 0.22, stop.z)),
    [],
  )

  useFrame((state, delta) => {
    if (!group.current) return
    from.current.copy(points[journeyState.houseIndex])
    group.current.position.lerp(from.current, 1 - Math.exp(-5.5 * delta))
    group.current.position.y += Math.sin(state.clock.elapsedTime * 5.2) * 0.04
    const flap = Math.sin(state.clock.elapsedTime * 24) * 0.55
    if (left.current) left.current.rotation.z = 0.35 + flap
    if (right.current) right.current.rotation.z = -0.35 - flap
    group.current.visible = journeyState.interior > 0.2
  })

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.1, 22, 22]} />
        <meshStandardMaterial
          color="#e6c25a"
          emissive="#c9a227"
          emissiveIntensity={0.45}
          metalness={0.95}
          roughness={0.16}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.4, 0]}>
        <torusGeometry args={[0.072, 0.01, 8, 22]} />
        <meshStandardMaterial color="#b8862b" metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh rotation={[0.2, 0, Math.PI / 2]}>
        <torusGeometry args={[0.06, 0.008, 8, 18]} />
        <meshStandardMaterial color="#b8862b" metalness={0.9} roughness={0.22} />
      </mesh>
      <group ref={left} position={[-0.08, 0.02, 0]}>
        <mesh rotation={[0.15, 0.2, 0.15]} position={[-0.14, 0, 0]}>
          <planeGeometry args={[0.32, 0.11]} />
          <meshStandardMaterial
            color="#f6e2b0"
            emissive="#e8c56a"
            emissiveIntensity={0.35}
            transparent
            opacity={0.62}
            side={DoubleSide}
            metalness={0.55}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
      </group>
      <group ref={right} position={[0.08, 0.02, 0]}>
        <mesh rotation={[0.15, -0.2, -0.15]} position={[0.14, 0, 0]}>
          <planeGeometry args={[0.32, 0.11]} />
          <meshStandardMaterial
            color="#f6e2b0"
            emissive="#e8c56a"
            emissiveIntensity={0.35}
            transparent
            opacity={0.62}
            side={DoubleSide}
            metalness={0.55}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
      </group>
      <pointLight color="#ffe7a0" intensity={1.4} distance={3.2} />
    </group>
  )
}

function HouseBoard({
  slot,
  maps,
}: {
  slot: number
  maps: ReturnType<typeof makeParchmentTexture>[]
}) {
  const group = useRef<Group>(null)
  const mat = useRef<MeshStandardMaterial>(null)
  const bar = useRef<MeshStandardMaterial>(null)
  const stop = STOPS[slot]
  const last = useRef(0)
  const spin = useRef(0)

  useFrame((_, delta) => {
    if (!group.current) return
    const idx = (journeyState.houseIndex + slot) % HOUSE_CYCLE.length
    const house = HOUSE_CYCLE[idx]
    if (mat.current && maps[idx] && mat.current.map !== maps[idx]) {
      mat.current.map = maps[idx]
      mat.current.needsUpdate = true
    }
    if (bar.current) bar.current.color.set(house.color)
    if (slot === 0 && last.current !== journeyState.houseIndex) {
      spin.current = 0
      last.current = journeyState.houseIndex
    }
    if (slot === 0 && spin.current < 1) {
      spin.current = Math.min(1, spin.current + delta * 3.2)
      group.current.rotation.y = Math.sin(spin.current * Math.PI) * 0.08
    }
    const show = 1
    group.current.visible = show > 0.04
    const s = slot === 0 ? 1 : 0.86
    group.current.scale.setScalar(s)
  })

  return (
    <group ref={group} position={[stop.x, 0, stop.z]} scale={slot === 0 ? 1 : 0.86}>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.12, 1.24, 0.12]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[0.7, 0.07, 0.16]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      <mesh
        position={[0, stop.y, 0.04]}
        onClick={(event) => {
          event.stopPropagation()
          if (slot === 0) advanceHouse()
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          if (slot === 0) document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <planeGeometry args={[1.22, 1.82]} />
        <meshStandardMaterial
          ref={mat}
          map={maps[slot] ?? undefined}
          transparent
          roughness={0.9}
          metalness={0}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, stop.y - 1.02, 0.05]}>
        <boxGeometry args={[0.55, 0.08, 0.04]} />
        <meshStandardMaterial ref={bar} color={HOUSE_CYCLE[slot].color} roughness={0.55} />
      </mesh>
    </group>
  )
}

export function HousePath() {
  const maps = useMemo(
    () => HOUSE_CYCLE.map((house) => makeParchmentTexture(house)),
    [],
  )
  const boards = useRef<Group>(null)

  useEffect(() => {
    return () => {
      maps.forEach((map) => map?.dispose())
    }
  }, [maps])

  useFrame(() => {
    if (boards.current) boards.current.visible = journeyState.whiteout < 0.38
  })

  return (
    <group>
      <group ref={boards}>
        {HOUSE_CYCLE.map((house, index) => (
          <HouseBoard key={house.id} slot={index} maps={maps} />
        ))}
        <ArrowSegment from={STOPS[0]} to={STOPS[1]} unlock={1} />
        <ArrowSegment from={STOPS[1]} to={STOPS[2]} unlock={2} />
        <ArrowSegment from={STOPS[2]} to={STOPS[3]} unlock={3} />
        <CharmBall />
      </group>
    </group>
  )
}
