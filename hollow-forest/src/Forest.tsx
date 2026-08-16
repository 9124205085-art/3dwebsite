import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import { GlowingRunes, type RuneAnchor } from './GlowingRunes'

const GRID_COLS = 12
const GRID_ROWS = 14
const SPACING_X = 5.5
const SPACING_Z = 5.1
const PATH_CLEARANCE = 2.7
const RUNE_COUNT = 7

const TRUNK = {
  args: [0.1, 0.17, 1.2, 6] as const,
  y: 0.6,
  color: '#3a3228',
}

const FOLIAGE = [
  { args: [1.05, 1.85, 6] as const, y: 1.52, color: '#1c2a22' },
  { args: [0.76, 1.42, 6] as const, y: 2.22, color: '#24352b' },
  { args: [0.46, 1.08, 6] as const, y: 2.82, color: '#1a2c24' },
] as const

type TreePlacement = {
  position: [number, number, number]
  scale: number
  rotation: [number, number, number]
}

type LowPolyTreeProps = {
  position?: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
}

export function LowPolyTree({
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
}: LowPolyTreeProps) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, TRUNK.y, 0]} castShadow>
        <cylinderGeometry args={[...TRUNK.args]} />
        <meshStandardMaterial color={TRUNK.color} roughness={0.92} />
      </mesh>
      {FOLIAGE.map((part) => (
        <mesh key={part.y} position={[0, part.y, 0]} castShadow>
          <coneGeometry args={[...part.args]} />
          <meshStandardMaterial color={part.color} roughness={0.86} />
        </mesh>
      ))}
    </group>
  )
}

function generateTreePlacements(): TreePlacement[] {
  const trees: TreePlacement[] = []

  for (let i = 0; i < GRID_COLS; i++) {
    for (let j = 0; j < GRID_ROWS; j++) {
      const x =
        (i - (GRID_COLS - 1) / 2) * SPACING_X + (Math.random() - 0.5) * 2.3
      const z =
        (j - (GRID_ROWS - 1) / 2) * SPACING_Z + (Math.random() - 0.5) * 2.1

      if (Math.abs(x) < PATH_CLEARANCE) continue

      trees.push({
        position: [x, 0, z],
        scale: 0.72 + Math.random() * 0.7,
        rotation: [
          (Math.random() - 0.5) * 0.08,
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.06,
        ],
      })
    }
  }

  return trees
}

function pickRuneAnchors(trees: TreePlacement[]): RuneAnchor[] {
  const nearPath = trees
    .filter((tree) => Math.abs(tree.position[0]) < 6.8)
    .sort((a, b) => a.position[2] - b.position[2])

  if (nearPath.length === 0) return []

  const step = Math.max(1, Math.floor(nearPath.length / RUNE_COUNT))

  return nearPath
    .filter((_, index) => index % step === 0)
    .slice(0, RUNE_COUNT)
    .map((tree) => ({
      position: tree.position,
      scale: tree.scale,
      rotationY: tree.rotation[1],
    }))
}

export function Forest() {
  const trees = useMemo(generateTreePlacements, [])
  const runeAnchors = useMemo(() => pickRuneAnchors(trees), [trees])

  return (
    <group>
      <Instances limit={trees.length} frames={1} castShadow>
        <cylinderGeometry args={[...TRUNK.args]} />
        <meshStandardMaterial color={TRUNK.color} roughness={0.92} />
        {trees.map((tree, index) => (
          <Instance
            key={`trunk-${index}`}
            position={[
              tree.position[0],
              TRUNK.y * tree.scale,
              tree.position[2],
            ]}
            scale={tree.scale}
            rotation={tree.rotation}
          />
        ))}
      </Instances>

      {FOLIAGE.map((part) => (
        <Instances
          key={part.y}
          limit={trees.length}
          frames={1}
          castShadow
        >
          <coneGeometry args={[...part.args]} />
          <meshStandardMaterial color={part.color} roughness={0.86} />
          {trees.map((tree, index) => (
            <Instance
              key={`foliage-${part.y}-${index}`}
              position={[
                tree.position[0],
                part.y * tree.scale,
                tree.position[2],
              ]}
              scale={tree.scale}
              rotation={tree.rotation}
            />
          ))}
        </Instances>
      ))}

      <GlowingRunes anchors={runeAnchors} />
    </group>
  )
}
