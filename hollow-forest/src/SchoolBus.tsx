import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useScroll } from '@react-three/drei'
import {
  AdditiveBlending,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SpotLight,
} from 'three'
import { HEART, journeyState, smoothstep } from './theme'
import { ACADEMY_ROBE, ACADEMY_SHIRT, Face, Hair, type HairStyle } from './academyFigure'

const BUS_START_Z = 22
const BUS_END_Z = HEART.z + 14

const PASSENGERS: {
  z: number
  x: number
  skin: string
  hair: string
  tie: string
  hairStyle: HairStyle
}[] = [
  { z: 1.15, x: 0.42, skin: '#c58c5c', hair: '#1a120c', tie: '#7a1f1f', hairStyle: 'short' },
  { z: 0.35, x: 0.42, skin: '#8d5524', hair: '#140e0a', tie: '#1f5c38', hairStyle: 'pony' },
  { z: -0.45, x: 0.42, skin: '#d4a574', hair: '#c45c2a', tie: '#1a5f73', hairStyle: 'long' },
  { z: -1.25, x: 0.42, skin: '#e1b899', hair: '#e07098', tie: '#5b3d7a', hairStyle: 'side' },
  { z: 1.15, x: -0.42, skin: '#6f4e37', hair: '#0d0d0d', tie: '#7a1f1f', hairStyle: 'bun' },
  { z: 0.35, x: -0.42, skin: '#b0784a', hair: '#24160e', tie: '#1f5c38', hairStyle: 'pony' },
  { z: -0.45, x: -0.42, skin: '#c58c5c', hair: '#3b2416', tie: '#1a5f73', hairStyle: 'short' },
  { z: -1.25, x: -0.42, skin: '#d4a574', hair: '#1a120c', tie: '#5b3d7a', hairStyle: 'long' },
]

function Wheel({
  position,
  spinRef,
}: {
  position: [number, number, number]
  spinRef: { current: number }
}) {
  const mesh = useRef<Mesh>(null)
  useFrame(() => {
    if (mesh.current) mesh.current.rotation.x = spinRef.current
  })
  return (
    <group position={position}>
      <mesh ref={mesh} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.24, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.78} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.26, 10]} />
        <meshStandardMaterial color="#6b7280" metalness={0.4} roughness={0.45} />
      </mesh>
    </group>
  )
}

function HeadlightBeam({ position }: { position: [number, number, number] }) {
  const light = useRef<SpotLight>(null)
  const target = useRef<Object3D>(null)

  useLayoutEffect(() => {
    if (light.current && target.current) {
      light.current.target = target.current
    }
  }, [])

  return (
    <group position={position}>
      <mesh position={[0, -0.45, 3.2]} rotation={[-Math.PI / 2 + 0.16, 0, 0]}>
        <coneGeometry args={[1.15, 6.4, 12, 1, true]} />
        <meshBasicMaterial
          color="#ffe7a3"
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <spotLight
        ref={light}
        color="#ffe9a8"
        intensity={52}
        distance={22}
        angle={0.44}
        penumbra={0.55}
        position={[0, 0, 0.1]}
        castShadow={false}
      />
      <object3D ref={target} position={[0, -1.1, 11]} />
    </group>
  )
}

function Lamp({
  position,
  color,
  emissive,
  blink = false,
  size = 0.08,
}: {
  position: [number, number, number]
  color: string
  emissive: string
  blink?: boolean
  size?: number
}) {
  const mat = useRef<MeshStandardMaterial>(null)
  useFrame((state) => {
    if (!mat.current) return
    if (blink) {
      mat.current.emissiveIntensity = Math.sin(state.clock.elapsedTime * 9) > 0 ? 3.4 : 0.15
    }
  })
  return (
    <mesh position={position}>
      <boxGeometry args={[size, size * 0.7, size * 0.45]} />
      <meshStandardMaterial
        ref={mat}
        color={color}
        emissive={emissive}
        emissiveIntensity={blink ? 0.2 : 2.4}
        toneMapped={false}
        roughness={0.25}
      />
    </mesh>
  )
}

function Passenger({
  z,
  x,
  skin,
  hair,
  tie,
  hairStyle,
  index,
  rear = false,
}: {
  z: number
  x: number
  skin: string
  hair: string
  tie: string
  hairStyle: HairStyle
  index: number
  rear?: boolean
}) {
  const group = useRef<Group>(null)
  useFrame(() => {
    if (!group.current) return
    group.current.visible = journeyState.students < 0.12 + index * 0.08
  })
  const yaw = rear ? Math.PI : x > 0 ? Math.PI * 0.5 : -Math.PI * 0.5
  return (
    <group ref={group} position={[x, 1.02, z]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.16, 0]}>
        <capsuleGeometry args={[0.1, 0.18, 6, 10]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.12, -0.08]}>
        <boxGeometry args={[0.22, 0.28, 0.06]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.22, 0.06]}>
        <boxGeometry args={[0.12, 0.08, 0.03]} />
        <meshStandardMaterial color={ACADEMY_SHIRT} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.18, 0.075]}>
        <boxGeometry args={[0.025, 0.1, 0.016]} />
        <meshStandardMaterial color={tie} roughness={0.5} />
      </mesh>
      <group position={[0, 0.4, 0.02]}>
        <mesh>
          <sphereGeometry args={[0.078, 12, 12]} />
          <meshStandardMaterial color={skin} roughness={0.42} />
        </mesh>
        <Face skin={skin} />
        <Hair style={hairStyle} color={hair} />
      </group>
    </group>
  )
}

function SideWindows() {
  const zs = [1.2, 0.38, -0.44, -1.26]
  return (
    <group>
      {zs.map((z) =>
        [1, -1].map((side) => (
          <group key={`${z}-${side}`} position={[side * 0.93, 1.18, z]}>
            <mesh>
              <boxGeometry args={[0.05, 0.5, 0.62]} />
              <meshStandardMaterial color="#111111" roughness={0.7} />
            </mesh>
            <mesh position={[side * 0.02, 0, 0]}>
              <boxGeometry args={[0.03, 0.4, 0.5]} />
              <meshPhysicalMaterial
                color="#8ec9e8"
                transmission={0.72}
                opacity={0.35}
                transparent
                roughness={0.08}
                metalness={0.05}
                thickness={0.04}
                ior={1.4}
              />
            </mesh>
          </group>
        )),
      )}
    </group>
  )
}

export function SchoolBus() {
  const group = useRef<Group>(null)
  const wheelSpin = useRef(0)
  const scroll = useScroll()
  const hold = useRef(0)

  useFrame((_, delta) => {
    const travel = Math.min(1, scroll.offset / 0.9)
    journeyState.busZ = MathUtils.lerp(BUS_START_Z, BUS_END_Z, travel)

    if (scroll.offset > 0.93) {
      hold.current += delta
    } else {
      hold.current = Math.max(0, hold.current - delta * 1.8)
    }

    journeyState.gateOpen = smoothstep(0.12, 1.35, hold.current)
    journeyState.students = smoothstep(1.05, 4.1, hold.current)
    journeyState.interior = smoothstep(3.6, 6.4, hold.current)

    if (group.current) {
      group.current.position.z = journeyState.busZ
      if (travel < 0.985) wheelSpin.current += delta * 9
    }
  })

  return (
    <group ref={group} position={[0, 0, BUS_START_Z]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 1.12, -0.15]} castShadow>
        <boxGeometry args={[1.78, 1.28, 4.15]} />
        <meshStandardMaterial color="#e6b800" roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.72, 2.28]} castShadow>
        <boxGeometry args={[1.72, 0.62, 1.15]} />
        <meshStandardMaterial color="#d4a800" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.48, 0.1]}>
        <boxGeometry args={[1.82, 0.2, 5.35]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.38, 2.82]}>
        <boxGeometry args={[1.7, 0.18, 0.22]} />
        <meshStandardMaterial color="#111111" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.62, 2.86]}>
        <boxGeometry args={[0.7, 0.22, 0.06]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.35} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.28, 2.96]}>
        <boxGeometry args={[0.5, 0.16, 0.04]} />
        <meshStandardMaterial color="#f4f1e8" roughness={0.35} />
      </mesh>
      <Text
        position={[0, 0.28, 2.99]}
        fontSize={0.055}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        HA 09 1209
      </Text>

      <Lamp position={[-0.58, 0.72, 2.86]} color="#fff4c8" emissive="#ffe27a" size={0.14} />
      <Lamp position={[0.58, 0.72, 2.86]} color="#fff4c8" emissive="#ffe27a" size={0.14} />
      <Lamp
        position={[-0.78, 0.72, 2.86]}
        color="#fb923c"
        emissive="#ff7a18"
        blink
        size={0.09}
      />
      <Lamp
        position={[0.78, 0.72, 2.86]}
        color="#fb923c"
        emissive="#ff7a18"
        blink
        size={0.09}
      />

      <mesh position={[0, 1.22, 2.52]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[1.55, 0.62, 0.08]} />
        <meshPhysicalMaterial
          color="#9fd4ef"
          transmission={0.55}
          transparent
          opacity={0.42}
          roughness={0.08}
          thickness={0.05}
          ior={1.45}
        />
      </mesh>
      <mesh position={[0, 1.22, 2.48]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[1.62, 0.7, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      <pointLight position={[0, 1.15, 0.2]} color="#ffe9c4" intensity={1.6} distance={4.5} />
      {PASSENGERS.map((person, index) => (
        <Passenger key={`${person.x}-${person.z}`} {...person} index={index} />
      ))}
      <SideWindows />

      <Lamp position={[-0.62, 0.78, -2.24]} color="#ef4444" emissive="#ef4444" size={0.1} />
      <Lamp position={[0.62, 0.78, -2.24]} color="#ef4444" emissive="#ef4444" size={0.1} />
      <Lamp
        position={[-0.78, 0.78, -2.24]}
        color="#fb923c"
        emissive="#ff7a18"
        blink
        size={0.08}
      />
      <Lamp
        position={[0.78, 0.78, -2.24]}
        color="#fb923c"
        emissive="#ff7a18"
        blink
        size={0.08}
      />

      <mesh position={[0, 1.28, -2.24]}>
        <boxGeometry args={[1.52, 0.62, 0.05]} />
        <meshStandardMaterial color="#111111" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.28, -2.27]}>
        <boxGeometry args={[1.32, 0.46, 0.04]} />
        <meshPhysicalMaterial
          color="#8ec9e8"
          transmission={0.78}
          transparent
          opacity={0.32}
          roughness={0.06}
          thickness={0.05}
          ior={1.45}
        />
      </mesh>
      <mesh position={[0, 1.28, -2.255]}>
        <boxGeometry args={[0.04, 0.46, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.65} />
      </mesh>
      <Passenger
        z={-1.72}
        x={-0.28}
        skin="#c58c5c"
        hair="#1a120c"
        tie="#7a1f1f"
        hairStyle="short"
        index={0}
        rear
      />
      <Passenger
        z={-1.72}
        x={0.28}
        skin="#d4a574"
        hair="#c45c2a"
        tie="#1a5f73"
        hairStyle="long"
        index={1}
        rear
      />

      <mesh position={[0, 0.28, -2.28]}>
        <boxGeometry args={[0.46, 0.14, 0.04]} />
        <meshStandardMaterial color="#f4f1e8" roughness={0.35} />
      </mesh>
      <Text
        position={[0, 0.28, -2.31]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.05}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        HA 09 1209
      </Text>

      <Text
        position={[0.91, 1.55, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.14}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        SCHOOL BUS
      </Text>
      <Text
        position={[-0.91, 1.55, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.14}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        SCHOOL BUS
      </Text>

      <mesh position={[1.02, 1.35, 2.15]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.04, 0.18, 0.12]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[-1.02, 1.35, 2.15]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.04, 0.18, 0.12]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      <Wheel position={[-0.78, 0.32, -1.55]} spinRef={wheelSpin} />
      <Wheel position={[0.78, 0.32, -1.55]} spinRef={wheelSpin} />
      <Wheel position={[-0.78, 0.32, 1.55]} spinRef={wheelSpin} />
      <Wheel position={[0.78, 0.32, 1.55]} spinRef={wheelSpin} />

      <HeadlightBeam position={[-0.58, 0.72, 2.9]} />
      <HeadlightBeam position={[0.58, 0.72, 2.9]} />
    </group>
  )
}
