import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { AdditiveBlending, DoubleSide, Group, Mesh } from 'three'
import { useQuality } from './quality'
import { ACCENT_COLOR, HEART, SPARKLE_COLOR } from './theme'

function LightBeam({
  position,
  rotation,
  radius,
  height,
  opacity,
  meshRef,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  radius: number
  height: number
  opacity: number
  meshRef: RefObject<Mesh | null>
}) {
  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <coneGeometry args={[radius, height, 12, 1, true]} />
      <meshBasicMaterial
        color={SPARKLE_COLOR}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

function HeartShrine() {
  const core = useRef<Mesh>(null)

  useFrame((state) => {
    const pulse = 1.4 + Math.sin(state.clock.elapsedTime * 1.2) * 0.4
    if (core.current) {
      const material = core.current.material
      if (!Array.isArray(material) && 'emissiveIntensity' in material) {
        material.emissiveIntensity = pulse
      }
      core.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <group position={[HEART.x, HEART.y, HEART.z]} scale={1.65}>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.46, 4.4, 6]} />
        <meshStandardMaterial
          color="#3a3228"
          emissive={ACCENT_COLOR}
          emissiveIntensity={0.22}
          roughness={0.9}
        />
      </mesh>
      <mesh position={[0, 5.1, 0]} castShadow>
        <coneGeometry args={[2.35, 4.2, 6]} />
        <meshStandardMaterial
          color="#1c2a22"
          emissive={ACCENT_COLOR}
          emissiveIntensity={0.7}
          roughness={0.7}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 6.8, 0]} castShadow>
        <coneGeometry args={[1.7, 3.2, 6]} />
        <meshStandardMaterial
          color="#24352b"
          emissive={ACCENT_COLOR}
          emissiveIntensity={0.85}
          roughness={0.68}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 8.3, 0]} castShadow>
        <coneGeometry args={[1.05, 2.4, 6]} />
        <meshStandardMaterial
          color="#1a2c24"
          emissive={ACCENT_COLOR}
          emissiveIntensity={1.05}
          roughness={0.64}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={core} position={[0, 4.4, 0]}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color={SPARKLE_COLOR}
          emissive={SPARKLE_COLOR}
          emissiveIntensity={1.6}
          roughness={0.25}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.05, 6, 16]} />
        <meshStandardMaterial
          color={ACCENT_COLOR}
          emissive={ACCENT_COLOR}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[8.5, 20]} />
        <meshStandardMaterial
          color="#0b1210"
          emissive={ACCENT_COLOR}
          emissiveIntensity={0.1}
          roughness={1}
        />
      </mesh>
      <pointLight
        color={SPARKLE_COLOR}
        intensity={3.2}
        distance={28}
        position={[0, 5.4, 0]}
      />
    </group>
  )
}

function FireflySwirl() {
  const group = useRef<Group>(null)
  const { swirlSparkles } = useQuality()

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.14
    }
  })

  return (
    <group ref={group} position={[HEART.x, HEART.y + 4.2, HEART.z]}>
      <Sparkles
        count={swirlSparkles}
        scale={[8, 10, 8]}
        size={5}
        speed={0.45}
        opacity={1}
        color={SPARKLE_COLOR}
        noise={0.25}
      />
      <Sparkles
        count={Math.max(16, Math.round(swirlSparkles * 0.45))}
        scale={[4, 6, 4]}
        size={6.2}
        speed={0.55}
        opacity={1}
        color={SPARKLE_COLOR}
        noise={0.2}
      />
    </group>
  )
}

export function HeartOfTheForest() {
  const beamA = useRef<Mesh>(null)
  const beamB = useRef<Mesh>(null)

  useFrame((state) => {
    const flicker = 0.08 + Math.sin(state.clock.elapsedTime * 1.8) * 0.02
    for (const beam of [beamA.current, beamB.current]) {
      if (!beam) continue
      const material = beam.material
      if (!Array.isArray(material) && 'opacity' in material) {
        material.opacity = flicker
      }
    }
  })

  return (
    <group>
      <HeartShrine />
      <FireflySwirl />
      <group position={[HEART.x, HEART.y, HEART.z]}>
        <LightBeam
          meshRef={beamA}
          position={[0.2, 8.2, 0.1]}
          rotation={[Math.PI + 0.06, 0, 0.04]}
          radius={1.7}
          height={16}
          opacity={0.08}
        />
        <LightBeam
          meshRef={beamB}
          position={[-0.45, 7.1, -0.25]}
          rotation={[Math.PI - 0.1, 0.4, -0.08]}
          radius={1.2}
          height={13}
          opacity={0.06}
        />
      </group>
    </group>
  )
}
