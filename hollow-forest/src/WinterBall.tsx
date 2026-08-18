import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Group, MathUtils } from 'three'
import { Face, Hair, ACADEMY_ROBE, type HairStyle } from './academyFigure'
import { HOUSES, journeyState, smoothstep } from './theme'
import { useQuality } from './quality'

const SKINS = ['#c58c5c', '#8d5524', '#d4a574', '#e8c4a0', '#6b3f24', '#f0d0b0']
const HAIRS = ['#1a120c', '#c45c2a', '#e07098', '#0e0c0a', '#d4a017', '#3b2416']
const STYLES: HairStyle[] = ['short', 'pony', 'bun', 'side', 'long']
const GOWNS = [ACADEMY_ROBE, '#1a1020', '#14181f', '#3a1218', '#10202a']

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function ChristmasTree({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.28, 0.38, 0.9, 8]} />
        <meshStandardMaterial color="#4a3424" roughness={0.9} />
      </mesh>
      {[
        [1.6, 2.2, 2.15],
        [2.7, 1.7, 1.7],
        [3.7, 1.25, 1.25],
        [4.55, 0.85, 0.88],
        [5.2, 0.52, 0.55],
      ].map(([y, r, snow], index) => (
        <group key={y}>
          <mesh position={[0, y, 0]}>
            <coneGeometry args={[r, 1.55, 8]} />
            <meshStandardMaterial color="#16382c" roughness={0.82} />
          </mesh>
          <mesh position={[0, y + 0.38, 0]}>
            <coneGeometry args={[snow, 0.85, 8]} />
            <meshStandardMaterial color="#f4fbff" roughness={0.55} />
          </mesh>
          {Array.from({ length: 5 }, (_, k) => {
            const a = (k / 5) * Math.PI * 2 + index
            return (
              <mesh
                key={k}
                position={[Math.cos(a) * r * 0.62, y - 0.1, Math.sin(a) * r * 0.62]}
              >
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial
                  color={index % 2 ? '#e8c56a' : '#7a1f1f'}
                  metalness={0.55}
                  roughness={0.3}
                  emissive={index % 2 ? '#e8c56a' : '#000000'}
                  emissiveIntensity={index % 2 ? 0.4 : 0}
                />
              </mesh>
            )
          })}
        </group>
      ))}
      <mesh position={[0, 5.85, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.55, 0.12, 0.08]} />
        <meshStandardMaterial
          color="#e8c56a"
          emissive="#e8c56a"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 5.85, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.55, 0.12, 0.08]} />
        <meshStandardMaterial
          color="#e8c56a"
          emissive="#e8c56a"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 4.2, 0]} color="#d9fbff" intensity={3.4} distance={12} />
    </group>
  )
}

function IceColumn({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 6.4, 0]}>
        <cylinderGeometry args={[0.42, 0.55, 12.8, 6]} />
        <meshPhysicalMaterial
          color="#d7f6ff"
          transparent
          opacity={0.38}
          roughness={0.1}
          transmission={0.45}
          thickness={0.8}
        />
      </mesh>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh
          key={index}
          position={[
            (index % 2 ? 0.22 : -0.18),
            10.2 - index * 1.15,
            0.12,
          ]}
        >
          <coneGeometry args={[0.08 + index * 0.02, 1.1 + index * 0.12, 5]} />
          <meshPhysicalMaterial
            color="#e8fbff"
            transparent
            opacity={0.55}
            roughness={0.08}
            transmission={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

function GoldSnowflake() {
  const group = useRef<Group>(null)
  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.22
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.1
  })
  return (
    <group ref={group} position={[7.4, 7.6, 0.4]}>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2
        const long = index % 2 === 0
        return (
          <mesh key={index} rotation={[0, 0, angle]}>
            <boxGeometry args={[long ? 1.7 : 1.05, 0.1, 0.1]} />
            <meshStandardMaterial
              color="#e8c56a"
              emissive="#e8c56a"
              emissiveIntensity={1.15}
              metalness={0.82}
              roughness={0.2}
              toneMapped={false}
            />
          </mesh>
        )
      })}
      <mesh>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#f3dd9a"
          emissive="#e8c56a"
          emissiveIntensity={1.3}
          metalness={0.85}
          roughness={0.16}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function Guest({ seed, x, z }: { seed: number; x: number; z: number }) {
  const skin = SKINS[Math.floor(seeded(seed + 1) * SKINS.length)]
  const hair = HAIRS[Math.floor(seeded(seed + 3) * HAIRS.length)]
  const gown = GOWNS[Math.floor(seeded(seed + 5) * GOWNS.length)]
  const house = HOUSES[Math.floor(seeded(seed + 8) * HOUSES.length)]
  const style = STYLES[Math.floor(seeded(seed + 11) * STYLES.length)]
  const scale = 0.92 + seeded(seed + 14) * 0.16

  return (
    <group
      position={[x, 0, z]}
      scale={scale}
      rotation={[0, Math.PI / 2 + (seeded(seed) - 0.5) * 0.18, 0]}
    >
      <mesh position={[-0.07, 0.28, 0.02]}>
        <capsuleGeometry args={[0.05, 0.42, 4, 8]} />
        <meshStandardMaterial color={gown} roughness={0.86} />
      </mesh>
      <mesh position={[0.07, 0.28, 0.02]}>
        <capsuleGeometry args={[0.05, 0.42, 4, 8]} />
        <meshStandardMaterial color={gown} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <capsuleGeometry args={[0.14, 0.42, 4, 8]} />
        <meshStandardMaterial color={gown} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.62, -0.04]}>
        <coneGeometry args={[0.22, 0.7, 8]} />
        <meshStandardMaterial color={gown} roughness={0.88} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0.86, 0.06]}>
        <boxGeometry args={[0.16, 0.14, 0.04]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.78, 0.08]}>
        <boxGeometry args={[0.035, 0.18, 0.02]} />
        <meshStandardMaterial color={house.color} roughness={0.5} />
      </mesh>
      <group position={[0, 1.14, 0.02]}>
        <mesh>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        <Face skin={skin} />
        <Hair style={style} color={hair} />
      </group>
    </group>
  )
}

export function WinterBall() {
  const group = useRef<Group>(null)
  const { mobile } = useQuality()
  const crowd = useMemo(() => {
    const count = mobile ? 28 : 52
    return Array.from({ length: count }, (_, index) => {
      const col = index % 7
      const row = Math.floor(index / 7)
      return {
        x: -3.6 + col * 0.85 + (seeded(index + 2) - 0.5) * 0.2,
        z: -8.5 + row * 1.15 + (seeded(index + 9) - 0.5) * 0.25,
        seed: index * 17 + 4,
      }
    })
  }, [mobile])

  useFrame((_, delta) => {
    if (!group.current) return
    const show = smoothstep(0.28, 0.7, journeyState.whiteout)
    group.current.visible = show > 0.04
    const s = MathUtils.damp(group.current.scale.x, Math.max(0.001, show), 5, delta)
    group.current.scale.setScalar(s)
  })

  return (
    <group ref={group} scale={0.001} visible={false}>
      <ChristmasTree position={[8.35, 0, 1.15]} scale={1.12} />
      <ChristmasTree position={[8.55, 0, -2.35]} scale={0.86} />
      <GoldSnowflake />
      <IceColumn x={9.6} z={4.2} />
      <IceColumn x={9.6} z={-0.4} />
      <IceColumn x={9.6} z={-5.2} />
      <IceColumn x={-9.6} z={2} />
      <IceColumn x={-9.6} z={-6} />
      {crowd.map((person) => (
        <Guest key={person.seed} {...person} />
      ))}
      <pointLight position={[8.4, 5.5, -0.4]} color="#c8f6ff" intensity={10} distance={22} />
      <pointLight position={[0, 7, 0]} color="#9ee8f2" intensity={6} distance={28} />
      <ambientLight intensity={0.35} color="#d9fbff" />
    </group>
  )
}
