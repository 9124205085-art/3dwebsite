import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { FogExp2, MathUtils, UnsignedByteType } from 'three'
import { CameraRig } from './CameraRig'
import { Fireflies } from './Fireflies'
import { Forest } from './Forest'
import { Ground } from './Ground'
import { HeartOfTheForest } from './HeartOfTheForest'
import { FOG_COLOR, FOG_DENSITY, smoothstep } from './theme'

function Atmosphere() {
  const scroll = useScroll()

  useFrame(({ scene }) => {
    const fog = scene.fog
    if (fog instanceof FogExp2) {
      fog.density = MathUtils.lerp(
        FOG_DENSITY,
        0.012,
        smoothstep(0.74, 1, scroll.offset),
      )
    }
  })

  return (
    <>
      <color attach="background" args={[FOG_COLOR]} />
      <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />
    </>
  )
}

export function Scene() {
  return (
    <>
      <Atmosphere />

      <ambientLight intensity={0.28} />
      <directionalLight
        position={[8, 18, 8]}
        intensity={0.85}
        color="#d7e2f2"
        castShadow
      />
      <hemisphereLight color="#8aa0b8" groundColor="#1a1814" intensity={0.25} />

      <Ground />
      <Forest />
      <HeartOfTheForest />
      <Fireflies />
      <CameraRig />

      <EffectComposer
        multisampling={0}
        enableNormalPass={false}
        frameBufferType={UnsignedByteType}
      >
        <Bloom
          luminanceThreshold={0.22}
          luminanceSmoothing={0.4}
          intensity={1.15}
          mipmapBlur
          radius={0.7}
        />
      </EffectComposer>
    </>
  )
}
