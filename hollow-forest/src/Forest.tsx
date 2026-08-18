import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import { GlowingRunes, type RuneAnchor } from './GlowingRunes'
import { useQuality } from './quality'
import { HEART, HEART_CLEARING_RADIUS } from './theme'

const SPACING_X = 3.8
const SPACING_Z = 3.4
const PATH_CLEARANCE = 3.6
const Z_SHIFT = -4

const TRUNK = {
  args: [0.1, 0.17, 1.2, 6] as const,
  y: 0.6,
  color: '#4a4034',
}

const FOLIAGE = [
  { args: [1.05, 1.85, 6] as const, y: 1.52, color: '#2a3d32' },
  { args: [0.76, 1.42, 6] as const, y: 2.22, color: '#324a3c' },
  { args: [0.46, 1.08, 6] as const, y: 2.82, color: '#283d32' },
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

function generateTreePlacements(
  cols: number,
  rows: number,
): TreePlacement[] {
  const trees: TreePlacement[] = []
  const clearingRadiusSq = HEART_CLEARING_RADIUS * HEART_CLEARING_RADIUS

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x =
        (i - (cols - 1) / 2) * SPACING_X + (Math.random() - 0.5) * 2.3
      const z =
        (j - (rows - 1) / 2) * SPACING_Z +
        Z_SHIFT +
        (Math.random() - 0.5) * 2.1

      const dx = x - HEART.x
      const dz = z - HEART.z
      if (dx * dx + dz * dz < clearingRadiusSq) continue

      const approach =
        z < -16 ? PATH_CLEARANCE + Math.min(8, (-16 - z) * 0.5) : PATH_CLEARANCE
      if (Math.abs(x) < approach && z > HEART.z + 4) continue

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

  for (const side of [-1, 1]) {
    for (let k = 0; k < 36; k++) {
      const z = 32 - k * 2.15 + (Math.random() - 0.5) * 0.8
      if (z < HEART.z + 6) continue
      const x =
        side * (PATH_CLEARANCE + 1.15 + Math.random() * 4.8) +
        (Math.random() - 0.5) * 0.7
      const dx = x - HEART.x
      const dz = z - HEART.z
      if (dx * dx + dz * dz < clearingRadiusSq) continue
      trees.push({
        position: [x, 0, z],
        scale: 0.85 + Math.random() * 0.65,
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

function pickRuneAnchors(
  trees: TreePlacement[],
  runeCount: number,
): RuneAnchor[] {
  const nearPath = trees
    .filter(
      (tree) =>
        Math.abs(tree.position[0]) < 6.8 && tree.position[2] > HEART.z + 8,
    )
    .sort((a, b) => a.position[2] - b.position[2])

  if (nearPath.length === 0) return []

  const step = Math.max(1, Math.floor(nearPath.length / runeCount))

  return nearPath
    .filter((_, index) => index % step === 0)
    .slice(0, runeCount)
    .map((tree) => ({
      position: tree.position,
      scale: tree.scale,
      rotationY: tree.rotation[1],
    }))
}

export function Forest() {
  const { treeCols, treeRows, runeCount } = useQuality()
  const trees = useMemo(
    () => generateTreePlacements(treeCols, treeRows),
    [treeCols, treeRows],
  )
  const runeAnchors = useMemo(
    () => pickRuneAnchors(trees, runeCount),
    [trees, runeCount],
  )

  if (trees.length === 0) return null

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
