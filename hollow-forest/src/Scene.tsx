import { useMemo } from 'react'
import { EffectComposer } from '@react-three/postprocessing'
import { CameraRig } from './CameraRig'
import { Ground } from './Ground'

const FOG_COLOR = '#05060a'
const FOG_DENSITY = 0.038
const GRID_SIZE = 10
const GRID_SPACING = 6.5

function PlaceholderTrees() {
  const trees = useMemo(() => {
    const items: { x: number; z: number; height: number; radius: number }[] = []

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const height = 2.2 + Math.random() * 3.8
        items.push({
          x:
            (i - (GRID_SIZE - 1) / 2) * GRID_SPACING +
            (Math.random() - 0.5) * 3.2,
          z:
            (j - (GRID_SIZE - 1) / 2) * GRID_SPACING +
            (Math.random() - 0.5) * 3.2,
          height,
          radius: 0.35 + Math.random() * 0.55,
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
          <meshStandardMaterial color="#5a5a5a" />
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
      <CameraRig />

      <EffectComposer>
        {null}
      </EffectComposer>
    </>
  )
}
