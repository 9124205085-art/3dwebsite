import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, useScroll } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Color, FogExp2, Group, MathUtils, UnsignedByteType } from 'three'
import { CameraRig } from './CameraRig'
import { Fireflies } from './Fireflies'
import { Forest } from './Forest'
import { Ground } from './Ground'
import { HeartOfTheForest } from './HeartOfTheForest'
import { Road } from './Road'
import { SchoolBus } from './SchoolBus'
import { SchoolInterior } from './SchoolInterior'
import { Storm } from './Storm'
import { Students } from './Students'
import {
  FOG_COLOR,
  FOG_DENSITY,
  journeyState,
  smoothstep,
  stormState,
} from './theme'

const nightFog = new Color(FOG_COLOR)
const hallFog = new Color('#e0cba8')
const nightBg = new Color('#070910')
const hallBg = new Color('#c4a878')
const whiteBg = new Color('#ffffff')

function Atmosphere() {
  const scroll = useScroll()
  const stars = useRef<Group>(null)

  useFrame(({ scene }) => {
    const fog = scene.fog
    const interior = journeyState.interior
    const whiteout = journeyState.whiteout
    if (fog instanceof FogExp2) {
      const base = MathUtils.lerp(
        FOG_DENSITY,
        0.01,
        smoothstep(0.74, 1, scroll.offset),
      )
      fog.density = MathUtils.lerp(base, 0.0035, interior) * (1 - stormState.flash * 0.6)
      fog.color.lerpColors(nightFog, hallFog, interior)
      if (whiteout > 0) {
        fog.color.lerp(whiteBg, whiteout)
        fog.density = MathUtils.lerp(fog.density, 0.002, whiteout)
      }
    }
    if (scene.background instanceof Color) {
      scene.background.lerpColors(nightBg, hallBg, interior)
      if (whiteout > 0) {
        scene.background.lerp(whiteBg, whiteout)
      }
    }
    if (stars.current) stars.current.visible = interior < 0.35
  })

  return (
    <>
      <color attach="background" args={['#070910']} />
      <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />
      <group ref={stars}>
        <Stars
          radius={90}
          depth={40}
          count={900}
          factor={2.4}
          saturation={0}
          fade
          speed={0.2}
        />
      </group>
    </>
  )
}

export function Scene() {
  return (
    <>
      <Atmosphere />
      <Storm />

      <ambientLight intensity={0.16} />
      <hemisphereLight color="#7e93ad" groundColor="#121015" intensity={0.18} />
      <directionalLight
        position={[8, 18, 8]}
        intensity={0.42}
        color="#c9d6e8"
        castShadow
      />
      <directionalLight
        position={[-10, 14, -18]}
        intensity={0.38}
        color="#9bb6d4"
      />

      <Ground />
      <Road />
      <Forest />
      <HeartOfTheForest />
      <SchoolBus />
      <Students />
      <SchoolInterior />
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
          intensity={1.35}
          mipmapBlur
          radius={0.7}
        />
      </EffectComposer>
    </>
  )
}
