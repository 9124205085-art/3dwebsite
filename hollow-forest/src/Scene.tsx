import { useMemo } from 'react'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { CameraRig } from './CameraRig'
import { Fireflies, ACCENT_COLOR } from './Fireflies'
import { Ground } from './Ground'

const FOG_COLOR = '#05060a'
const FOG_DENSITY = 0.038
const GRID_SIZE = 10
const GRID_SPACING = 6.5

type PlaceholderTree = {
  x: number
  z: number
  height: number
  radius: number
  glow: boolean
}

function PlaceholderTrees() {
  const trees = useMemo(() => {
    const items: PlaceholderTree[] = []

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x =
          (i - (GRID_SIZE - 1) / 2) * GRID_SPACING +
          (Math.random() - 0.5) * 3.2
        const z =
          (j - (GRID_SIZE - 1) / 2) * GRID_SPACING +
          (Math.random() - 0.5) * 3.2
        const nearPath = Math.abs(x) < 6
        const glow = nearPath && (i + j) % 3 === 0

        items.push({
          x,
          z,
          height: 2.2 + Math.random() * 3.8,
          radius: 0.35 + Math.random() * 0.55,
          glow,
        })
      }
    }

    return items
  }, [])

  return (
    <group>
      {trees.map((tree, index) => (
        <mesh
          key={index}
          position={[tree.x, tree.height / 2, tree.z]}
          castShadow
        >
          <coneGeometry args={[tree.radius, tree.height, 6]} />
          <meshStandardMaterial
            color="#5a5a5a"
            emissive={tree.glow ? ACCENT_COLOR : '#000000'}
            emissiveIntensity={tree.glow ? 0.65 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}

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
      <PlaceholderTrees />
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
