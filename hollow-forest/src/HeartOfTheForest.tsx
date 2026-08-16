import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { AdditiveBlending, DoubleSide, Group, Mesh } from 'three'
import { useQuality } from './quality'
import { HEART, SPARKLE_COLOR, journeyState } from './theme'
import { GlowingCastle } from './GlowingCastle'

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

function FireflySwirl() {
  const group = useRef<Group>(null)
  const { swirlSparkles } = useQuality()

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.14
    }
  })

  return (
    <group ref={group} position={[HEART.x, HEART.y + 12, HEART.z]}>
      <Sparkles
        count={swirlSparkles}
        scale={[16, 18, 16]}
        size={5}
        speed={0.45}
        opacity={1}
        color={SPARKLE_COLOR}
        noise={0.25}
      />
      <Sparkles
        count={Math.max(16, Math.round(swirlSparkles * 0.45))}
        scale={[8, 11, 8]}
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
  const extras = useRef<Group>(null)

  useFrame((state) => {
    if (extras.current) extras.current.visible = journeyState.interior < 0.2
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
      <GlowingCastle />
      <group ref={extras}>
        <FireflySwirl />
        <group position={[HEART.x, HEART.y, HEART.z]}>
        <LightBeam
          meshRef={beamA}
          position={[0.5, 11.5, 0.3]}
          rotation={[Math.PI + 0.05, 0, 0.03]}
          radius={1.9}
          height={18}
          opacity={0.07}
        />
        <LightBeam
          meshRef={beamB}
          position={[-1.1, 10.2, -0.4]}
          rotation={[Math.PI - 0.08, 0.35, -0.06]}
          radius={1.35}
          height={15}
          opacity={0.055}
        />
        </group>
      </group>
    </group>
  )
}
