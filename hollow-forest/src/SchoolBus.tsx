import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useScroll } from '@react-three/drei'
import {
  AdditiveBlending,
  Group,
  MathUtils,
  Mesh,
  Object3D,
  SpotLight,
} from 'three'
import { HEART, journeyState, smoothstep } from './theme'

const BUS_START_Z = 22
const BUS_END_Z = HEART.z + 14

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
    <mesh
      ref={mesh}
      position={position}
      rotation={[0, 0, Math.PI / 2]}
    >
      <cylinderGeometry args={[0.28, 0.28, 0.22, 10]} />
      <meshStandardMaterial color="#1c1c1c" roughness={0.8} />
    </mesh>
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
      <mesh position={[0, -0.55, 3.6]} rotation={[-Math.PI / 2 + 0.16, 0, 0]}>
        <coneGeometry args={[1.25, 7.2, 12, 1, true]} />
        <meshBasicMaterial
          color="#ffe7a3"
          transparent
          opacity={0.14}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <spotLight
        ref={light}
        color="#ffe9a8"
        intensity={58}
        distance={24}
        angle={0.46}
        penumbra={0.55}
        position={[0, 0, 0.1]}
        castShadow={false}
      />
      <object3D ref={target} position={[0, -1.1, 11]} />
      <pointLight color="#ffe27a" intensity={3.6} distance={7} />
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
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[1.55, 1.15, 3.7]} />
        <meshStandardMaterial color="#f0c400" roughness={0.45} metalness={0.08} />
      </mesh>
      <mesh position={[0, 1.42, -0.15]}>
        <boxGeometry args={[1.48, 0.22, 3.2]} />
        <meshStandardMaterial color="#d9b000" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.58, 0.18, 3.75]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.05, 1.72]}>
        <boxGeometry args={[1.35, 0.55, 0.08]} />
        <meshStandardMaterial
          color="#9fd7ff"
          emissive="#7ec8ff"
          emissiveIntensity={0.25}
          roughness={0.15}
          transparent
          opacity={0.7}
        />
      </mesh>
      <Text
        position={[0.79, 1.12, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.16}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        SCHOOL BUS
      </Text>
      <Text
        position={[-0.79, 1.12, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.16}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        SCHOOL BUS
      </Text>
      {[-1.05, -0.15, 0.75].map((z) => (
        <mesh key={z} position={[0.78, 1.12, z]}>
          <boxGeometry args={[0.04, 0.32, 0.55]} />
          <meshStandardMaterial
            color="#7ec8ff"
            emissive="#7ec8ff"
            emissiveIntensity={0.15}
            roughness={0.2}
            transparent
            opacity={0.55}
          />
        </mesh>
      ))}
      <Wheel position={[-0.62, 0.32, -1.15]} spinRef={wheelSpin} />
      <Wheel position={[0.62, 0.32, -1.15]} spinRef={wheelSpin} />
      <Wheel position={[-0.62, 0.32, 1.15]} spinRef={wheelSpin} />
      <Wheel position={[0.62, 0.32, 1.15]} spinRef={wheelSpin} />
      <mesh position={[-0.42, 0.82, 1.88]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial
          color="#fff4c8"
          emissive="#ffe27a"
          emissiveIntensity={2.8}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.42, 0.82, 1.88]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial
          color="#fff4c8"
          emissive="#ffe27a"
          emissiveIntensity={2.8}
          toneMapped={false}
        />
      </mesh>
      <HeadlightBeam position={[-0.42, 0.82, 1.92]} />
      <HeadlightBeam position={[0.42, 0.82, 1.92]} />
    </group>
  )
}
