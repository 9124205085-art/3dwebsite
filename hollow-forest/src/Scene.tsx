import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { CameraRig } from './CameraRig'
import { Fireflies } from './Fireflies'
import { Forest } from './Forest'
import { Ground } from './Ground'

const FOG_COLOR = '#05060a'
const FOG_DENSITY = 0.038

export function Scene() {
  return (
    <>
      <color attach="background" args={[FOG_COLOR]} />
      <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />

      <ambientLight intensity={0.12} />
      <directionalLight
        position={[8, 16, 6]}
        intensity={0.38}
        color="#b8c4d8"
        castShadow
      />

      <Ground />
      <Forest />
      <Fireflies />
      <CameraRig />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.35}
          luminanceSmoothing={0.35}
          intensity={1.25}
          mipmapBlur
          radius={0.65}
        />
      </EffectComposer>
    </>
  )
}
