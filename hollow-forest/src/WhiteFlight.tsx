import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { DoubleSide, Group, MathUtils } from 'three'
import {
  ACADEMY_ROBE,
  ACADEMY_SHIRT,
  Face,
  Hair,
} from './academyFigure'

function GoldMat({
  color = '#e6c25a',
  emissive = '#c9a227',
  roughness = 0.16,
}: {
  color?: string
  emissive?: string
  roughness?: number
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={0.38}
      metalness={0.96}
      roughness={roughness}
    />
  )
}

function Wing({ side }: { side: -1 | 1 }) {
  const ribs = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const t = i / 6
        return {
          x: side * (0.07 + t * 0.46),
          w: 0.008,
          h: 0.055 + Math.sin(t * Math.PI) * 0.07,
        }
      }),
    [side],
  )

  return (
    <group>
      <mesh
        position={[side * 0.38, 0.01, 0]}
        rotation={[0.08, side * 0.12, side * 0.04]}
        scale={[1.15, 0.2, 0.042]}
      >
        <sphereGeometry args={[0.3, 16, 10]} />
        <meshStandardMaterial
          color="#f6e6b4"
          emissive="#e8c56a"
          emissiveIntensity={0.32}
          metalness={0.72}
          roughness={0.22}
          transparent
          opacity={0.82}
          side={DoubleSide}
        />
      </mesh>
      {ribs.map((rib, i) => (
        <mesh
          key={i}
          position={[rib.x, 0.012, 0.004]}
          rotation={[0.1, side * 0.12, 0]}
        >
          <boxGeometry args={[rib.w, rib.h, 0.006]} />
          <meshStandardMaterial
            color="#d7b56a"
            metalness={0.85}
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

function SpinnerBall({
  seed,
  scale = 1,
}: {
  seed: number
  scale?: number
}) {
  const group = useRef<Group>(null)
  const body = useRef<Group>(null)
  const left = useRef<Group>(null)
  const right = useRef<Group>(null)

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime + seed * 1.7
    const x =
      Math.sin(t * 0.42 + seed) * 3.8 + Math.sin(t * 0.95 + seed) * 0.7
    const y =
      0.35 +
      Math.cos(t * 0.63 + seed * 0.4) * 1.55 +
      Math.sin(t * 1.25) * 0.28
    const z =
      Math.cos(t * 0.38 + seed) * 1.8 + Math.sin(t * 0.7) * 0.45
    group.current.position.set(x, y, z)

    const dx = Math.cos(t * 0.42 + seed) * 3.8
    group.current.rotation.y = Math.atan2(dx, -Math.sin(t * 0.38 + seed) * 1.8)
    group.current.rotation.z = Math.sin(t * 0.9) * 0.18
    group.current.rotation.x = Math.cos(t * 0.7) * 0.12

    if (body.current) body.current.rotation.y = t * 3.4
    const flap = Math.sin(t * 26) * 0.62
    if (left.current) left.current.rotation.z = 0.28 + flap
    if (right.current) right.current.rotation.z = -0.28 - flap
  })

  return (
    <group ref={group} scale={scale}>
      <group ref={body}>
        <mesh>
          <sphereGeometry args={[0.13, 28, 28]} />
          <GoldMat />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.35, 0.2]}>
          <torusKnotGeometry args={[0.09, 0.011, 72, 8, 2, 3]} />
          <GoldMat color="#c9a227" emissive="#a67c18" roughness={0.12} />
        </mesh>
        <mesh rotation={[0.4, 0.8, Math.PI / 2]}>
          <torusGeometry args={[0.078, 0.01, 8, 24]} />
          <GoldMat color="#b8862b" emissive="#8a6418" roughness={0.2} />
        </mesh>
        <mesh rotation={[-0.5, 0.2, 0.6]}>
          <torusGeometry args={[0.062, 0.008, 8, 20]} />
          <GoldMat color="#b8862b" emissive="#8a6418" roughness={0.2} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[
                Math.cos(a) * 0.12,
                Math.sin(a * 1.7) * 0.08,
                Math.sin(a) * 0.12,
              ]}
            >
              <sphereGeometry args={[0.012, 8, 8]} />
              <GoldMat color="#f0d48a" roughness={0.1} />
            </mesh>
          )
        })}
      </group>
      <group ref={left} position={[-0.1, 0.01, 0]}>
        <Wing side={-1} />
      </group>
      <group ref={right} position={[0.1, 0.01, 0]}>
        <Wing side={1} />
      </group>
      <pointLight color="#ffe7a0" intensity={0.85} distance={2.6} />
    </group>
  )
}

function Broom() {
  const twigs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        return {
          x: Math.cos(a) * 0.045,
          y: Math.sin(a) * 0.045,
          rot: 0.22 + (i % 3) * 0.04,
          color: i % 2 ? '#c4a056' : '#8d6a32',
        }
      }),
    [],
  )

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.032, 0.04, 2.2, 8]} />
        <meshStandardMaterial color="#6b4226" roughness={0.74} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.038, 0.038, 0.2, 8]} />
        <meshStandardMaterial color="#3d2414" roughness={0.58} />
      </mesh>
      <group position={[0, 0, 1.08]}>
        <mesh>
          <cylinderGeometry args={[0.07, 0.09, 0.1, 8]} />
          <meshStandardMaterial color="#4a2e18" roughness={0.7} />
        </mesh>
        {twigs.map((twig, i) => (
          <mesh
            key={i}
            position={[twig.x, twig.y, 0.28]}
            rotation={[twig.rot, 0, Math.atan2(twig.y, twig.x)]}
          >
            <cylinderGeometry args={[0.011, 0.003, 0.58, 4]} />
            <meshStandardMaterial color={twig.color} roughness={0.92} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Rider({
  skin,
  hair,
  hairStyle,
  tie,
}: {
  skin: string
  hair: string
  hairStyle: 'short' | 'pony' | 'bun' | 'side' | 'long'
  tie: string
}) {
  return (
    <group position={[0, 0.18, -0.12]} rotation={[0.42, 0, 0]}>
      <group position={[0, 0.58, 0.04]}>
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        <Face skin={skin} />
        <Hair style={hairStyle} color={hair} />
        <mesh position={[0, 0.08, -0.02]} rotation={[-0.2, 0, 0]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color="#141418" roughness={0.78} />
        </mesh>
      </group>
      <mesh position={[0, 0.34, 0.02]}>
        <capsuleGeometry args={[0.11, 0.26, 4, 8]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.32, -0.08]}>
        <boxGeometry args={[0.28, 0.38, 0.08]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.42, 0.08]}>
        <boxGeometry args={[0.14, 0.1, 0.035]} />
        <meshStandardMaterial color={ACADEMY_SHIRT} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.36, 0.1]}>
        <boxGeometry args={[0.03, 0.14, 0.018]} />
        <meshStandardMaterial color={tie} roughness={0.5} />
      </mesh>
      <mesh position={[-0.16, 0.34, 0.02]} rotation={[1.15, 0, 0.35]}>
        <capsuleGeometry args={[0.038, 0.22, 4, 8]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
      <mesh position={[0.16, 0.34, 0.02]} rotation={[1.15, 0, -0.35]}>
        <capsuleGeometry args={[0.038, 0.22, 4, 8]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
      <mesh position={[-0.08, 0.06, 0.08]} rotation={[0.55, 0, 0.18]}>
        <capsuleGeometry args={[0.042, 0.28, 4, 8]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
      <mesh position={[0.08, 0.06, 0.08]} rotation={[0.55, 0, -0.18]}>
        <capsuleGeometry args={[0.042, 0.28, 4, 8]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
    </group>
  )
}

function BroomRider({
  seed,
  scale = 0.92,
  radiusX = 3.35,
  radiusZ = 1.55,
  speed = 0.34,
  yLift = 0.05,
  skin,
  hair,
  hairStyle,
  tie,
}: {
  seed: number
  scale?: number
  radiusX?: number
  radiusZ?: number
  speed?: number
  yLift?: number
  skin: string
  hair: string
  hairStyle: 'short' | 'pony' | 'bun' | 'side' | 'long'
  tie: string
}) {
  const group = useRef<Group>(null)

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime * speed + seed
    const x = Math.cos(t) * radiusX
    const y = Math.sin(t * 2.1) * 0.55 + yLift
    const z = Math.sin(t) * radiusZ
    group.current.position.set(x, y, z)

    const lookX = x - Math.sin(t) * radiusX
    const lookZ = z + Math.cos(t) * radiusZ
    group.current.lookAt(lookX, y, lookZ)
    group.current.rotation.z = MathUtils.lerp(
      group.current.rotation.z,
      Math.sin(t) * 0.28,
      0.12,
    )
  })

  return (
    <group ref={group} scale={scale}>
      <Broom />
      <Rider skin={skin} hair={hair} hairStyle={hairStyle} tie={tie} />
    </group>
  )
}

function FlightScene() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 6, 8]} intensity={1.55} color="#fff6d8" />
      <directionalLight position={[-5, 2, 3]} intensity={0.45} color="#ffe9c4" />
      <SpinnerBall seed={0.2} scale={1.28} />
      <SpinnerBall seed={2.4} scale={0.92} />
      <SpinnerBall seed={4.8} scale={1.08} />
      <BroomRider
        seed={0.2}
        scale={0.95}
        radiusX={3.45}
        radiusZ={1.6}
        speed={0.33}
        yLift={0.35}
        skin="#c58c5c"
        hair="#1a120c"
        hairStyle="short"
        tie="#1a5f73"
      />
      <BroomRider
        seed={2.3}
        scale={0.86}
        radiusX={2.85}
        radiusZ={1.95}
        speed={0.41}
        yLift={-0.55}
        skin="#8d5524"
        hair="#140e0a"
        hairStyle="pony"
        tie="#7a1f1f"
      />
      <BroomRider
        seed={4.1}
        scale={0.9}
        radiusX={3.7}
        radiusZ={1.15}
        speed={0.28}
        yLift={0.95}
        skin="#d4a574"
        hair="#c45c2a"
        hairStyle="long"
        tie="#5b3d7a"
      />
    </>
  )
}

export function WhiteFlight() {
  return (
    <Canvas
      camera={{ position: [0, 0.35, 8.2], fov: 40, near: 0.1, far: 40 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
      }}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <FlightScene />
    </Canvas>
  )
}
