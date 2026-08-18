import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import {
  CanvasTexture,
  Group,
  MathUtils,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import {
  ACCENT_COLOR,
  CASTLE_SCALE,
  HEART,
  SPARKLE_COLOR,
  journeyState,
  stormState,
} from './theme'

const STONE = '#1b2028'
const STONE_DARK = '#12151b'
const ROCK = '#171b20'
const ROOF = '#0d1015'
const WINDOW_GOLD = '#ffb347'

function makeStoneTexture(base: string, grout: string, repeatX: number, repeatY: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = base
  ctx.fillRect(0, 0, 256, 256)

  for (let i = 0; i < 900; i++) {
    const shade = 8 + Math.random() * 28
    ctx.fillStyle = `rgba(${shade}, ${shade + 2}, ${shade + 8}, ${0.12 + Math.random() * 0.28})`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 10, 1 + Math.random() * 7)
  }

  ctx.strokeStyle = grout
  ctx.lineWidth = 1.2
  for (let y = 8; y < 256; y += 16) {
    ctx.beginPath()
    ctx.moveTo(0, y + Math.sin(y * 0.2) * 1.5)
    ctx.lineTo(256, y)
    ctx.stroke()
    const offset = y % 32 === 8 ? 0 : 22
    for (let x = offset; x < 256; x += 44) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + 16)
      ctx.stroke()
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.anisotropy = 4
  return texture
}

type TowerSpec = {
  position: [number, number, number]
  radius: number
  height: number
  roof: number
  windowRows: number
  windowAngles: number[]
}

const TOWERS: TowerSpec[] = [
  {
    position: [0.45, 1.85, -0.55],
    radius: 1.28,
    height: 8.2,
    roof: 8.4,
    windowRows: 7,
    windowAngles: [0.06, 0.55, -0.5, Math.PI * 0.72, Math.PI * 1.15, Math.PI * 1.55],
  },
  {
    position: [-4.35, 1.7, -1.85],
    radius: 0.52,
    height: 9.4,
    roof: 5.2,
    windowRows: 7,
    windowAngles: [0.1, Math.PI * 0.62, Math.PI * 1.12],
  },
  {
    position: [3.85, 1.65, -2.15],
    radius: 0.46,
    height: 8.1,
    roof: 4.6,
    windowRows: 6,
    windowAngles: [-0.12, Math.PI * 0.5, Math.PI * 1.05],
  },
  {
    position: [4.55, 1.55, 1.05],
    radius: 0.38,
    height: 6.2,
    roof: 3.4,
    windowRows: 5,
    windowAngles: [0.08, Math.PI * 0.7],
  },
  {
    position: [-2.15, 1.6, -3.05],
    radius: 0.34,
    height: 5.4,
    roof: 3.1,
    windowRows: 4,
    windowAngles: [0.18, Math.PI * 0.9],
  },
]

function GothicWindow({
  position,
  rotation,
  material,
  frame,
  scale = 1,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  material: MeshStandardMaterial
  frame: MeshStandardMaterial
  scale?: number
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh material={frame} position={[0, 0.06, -0.012]}>
        <planeGeometry args={[0.2, 0.72]} />
      </mesh>
      <mesh material={material} position={[0, 0, 0.01]}>
        <planeGeometry args={[0.12, 0.55]} />
      </mesh>
      <mesh material={material} position={[0, 0.32, 0.01]}>
        <circleGeometry args={[0.06, 8]} />
      </mesh>
    </group>
  )
}

function NeedleTurret({
  position,
  stone,
  roof,
}: {
  position: [number, number, number]
  stone: MeshStandardMaterial
  roof: MeshStandardMaterial
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} material={stone}>
        <cylinderGeometry args={[0.15, 0.18, 0.85, 6]} />
      </mesh>
      <mesh position={[0, 1.55, 0]} material={roof}>
        <coneGeometry args={[0.26, 1.9, 6]} />
      </mesh>
    </group>
  )
}

function Tower({
  spec,
  stone,
  roof,
  windowMaterial,
  frame,
}: {
  spec: TowerSpec
  stone: MeshStandardMaterial
  roof: MeshStandardMaterial
  windowMaterial: MeshStandardMaterial
  frame: MeshStandardMaterial
}) {
  const { position, radius, height, roof: roofHeight, windowRows, windowAngles } =
    spec

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow material={stone}>
        <cylinderGeometry args={[radius, radius * 1.18, height, 6]} />
      </mesh>
      <mesh
        position={[radius * 0.72, height * 0.28, radius * 0.15]}
        rotation={[0.3, 0.6, 0.2]}
        material={stone}
      >
        <dodecahedronGeometry args={[radius * 0.42, 0]} />
      </mesh>
      <mesh
        position={[-radius * 0.65, height * 0.55, -radius * 0.2]}
        rotation={[-0.2, 1.1, -0.15]}
        material={stone}
      >
        <icosahedronGeometry args={[radius * 0.38, 0]} />
      </mesh>
      <mesh position={[0, height + 0.1, 0]} material={stone}>
        <cylinderGeometry args={[radius * 1.16, radius * 1.16, 0.22, 8]} />
      </mesh>
      <mesh position={[0, height + roofHeight / 2 + 0.1, 0]} material={roof}>
        <coneGeometry args={[radius * 1.34, roofHeight, 8]} />
      </mesh>
      {Array.from({ length: windowRows }, (_, row) => {
        const y = 1.05 + (row / Math.max(windowRows - 1, 1)) * (height - 1.8)
        const scale = radius > 1 ? 1.15 : 0.82
        return windowAngles.map((angle) => (
          <GothicWindow
            key={`${row}-${angle}`}
            position={[
              Math.sin(angle) * (radius + 0.02),
              y,
              Math.cos(angle) * (radius + 0.02),
            ]}
            rotation={[0, angle, 0]}
            material={windowMaterial}
            frame={frame}
            scale={scale}
          />
        ))
      })}
    </group>
  )
}

function FrontGates() {
  const left = useRef<Group>(null)
  const right = useRef<Group>(null)

  useFrame((_, delta) => {
    const open = journeyState.gateOpen * 1.45
    if (left.current) {
      left.current.rotation.y = MathUtils.lerp(left.current.rotation.y, -open, 1 - Math.exp(-5.5 * delta))
    }
    if (right.current) {
      right.current.rotation.y = MathUtils.lerp(right.current.rotation.y, open, 1 - Math.exp(-5.5 * delta))
    }
  })

  return (
    <group>
      <group ref={left} position={[-1.55, 2.05, 0.55]}>
        <mesh position={[0.72, 0, 0]} castShadow>
          <boxGeometry args={[1.44, 4.05, 0.12]} />
          <meshStandardMaterial color="#1a120c" roughness={0.55} metalness={0.35} />
        </mesh>
        {[-0.9, 0, 0.9].map((y) => (
          <mesh key={y} position={[0.72, y, 0.07]}>
            <boxGeometry args={[1.2, 0.06, 0.04]} />
            <meshStandardMaterial color="#3a2a18" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>
      <group ref={right} position={[1.55, 2.05, 0.55]}>
        <mesh position={[-0.72, 0, 0]} castShadow>
          <boxGeometry args={[1.44, 4.05, 0.12]} />
          <meshStandardMaterial color="#1a120c" roughness={0.55} metalness={0.35} />
        </mesh>
        {[-0.9, 0, 0.9].map((y) => (
          <mesh key={y} position={[-0.72, y, 0.07]}>
            <boxGeometry args={[1.2, 0.06, 0.04]} />
            <meshStandardMaterial color="#3a2a18" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function TerrorArch({
  stone,
  stoneDark,
}: {
  stone: MeshStandardMaterial
  stoneDark: MeshStandardMaterial
}) {
  return (
    <group position={[0.1, 0, 4.15]}>
      <mesh position={[-2.35, 3.5, 0]} castShadow material={stone}>
        <boxGeometry args={[1.15, 7.1, 2.2]} />
      </mesh>
      <mesh position={[2.35, 3.5, 0]} castShadow material={stone}>
        <boxGeometry args={[1.15, 7.1, 2.2]} />
      </mesh>
      <mesh position={[-1.35, 7.15, 0]} rotation={[0, 0, 0.62]} material={stoneDark}>
        <boxGeometry args={[2.9, 0.85, 2.2]} />
      </mesh>
      <mesh position={[1.35, 7.15, 0]} rotation={[0, 0, -0.62]} material={stoneDark}>
        <boxGeometry args={[2.9, 0.85, 2.2]} />
      </mesh>
      <mesh position={[0, 8.55, 0]} material={stoneDark}>
        <boxGeometry args={[1.6, 0.7, 2.25]} />
      </mesh>
      <mesh position={[0, 9.55, 0]} material={stone}>
        <coneGeometry args={[0.55, 1.7, 4]} />
      </mesh>
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 9.15, 0.2]} material={stoneDark}>
          <coneGeometry args={[0.16, 0.9, 4]} />
        </mesh>
      ))}
      <mesh position={[-2.35, 7.3, 0.9]} rotation={[0.2, 0.4, 0]} material={stoneDark}>
        <dodecahedronGeometry args={[0.55, 0]} />
      </mesh>
      <mesh position={[2.35, 7.3, 0.9]} rotation={[-0.15, -0.3, 0]} material={stoneDark}>
        <dodecahedronGeometry args={[0.5, 0]} />
      </mesh>
      <mesh position={[0, 8.55, 1.18]}>
        <boxGeometry args={[3.6, 0.7, 0.12]} />
        <meshStandardMaterial color="#120e0a" roughness={0.7} />
      </mesh>
      <Text
        position={[0, 8.62, 1.28]}
        fontSize={0.32}
        color="#e8c56a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.14}
        outlineWidth={0.012}
        outlineColor="#1a1008"
      >
        HOLLOW ACADEMY
      </Text>
      <Text
        position={[0, 8.28, 1.28]}
        fontSize={0.12}
        color="#c9a227"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.22}
      >
        SCHOOL OF THE HOLLOW
      </Text>
      <FrontGates />
    </group>
  )
}

function Cliff({ rock }: { rock: MeshStandardMaterial }) {
  return (
    <group>
      <mesh
        position={[0.2, 0.85, -2.8]}
        rotation={[0, 0.35, 0.04]}
        castShadow
        material={rock}
      >
        <cylinderGeometry args={[3.8, 4.8, 1.9, 7]} />
      </mesh>
      <mesh
        position={[-3.4, 0.55, 1.6]}
        rotation={[0.2, 0.8, 0.12]}
        material={rock}
      >
        <dodecahedronGeometry args={[1.9, 0]} />
      </mesh>
      <mesh
        position={[3.6, 0.45, 1.35]}
        rotation={[-0.15, 0.4, -0.1]}
        material={rock}
      >
        <dodecahedronGeometry args={[1.55, 0]} />
      </mesh>
      <mesh
        position={[2.8, 0.35, -2.4]}
        rotation={[0.1, 1.1, 0.08]}
        material={rock}
      >
        <icosahedronGeometry args={[1.35, 0]} />
      </mesh>
      <mesh
        position={[-2.6, 0.3, -2.6]}
        rotation={[0.25, 0.2, -0.12]}
        material={rock}
      >
        <icosahedronGeometry args={[1.5, 0]} />
      </mesh>
      <mesh position={[2.35, 0.2, 3.15]} rotation={[0.3, 0.6, 0]} material={rock}>
        <dodecahedronGeometry args={[1.05, 0]} />
      </mesh>
      <mesh position={[-2.2, 0.18, 3.05]} rotation={[0.2, -0.4, 0.08]} material={rock}>
        <dodecahedronGeometry args={[0.95, 0]} />
      </mesh>
      <mesh
        position={[-4.6, 0.25, -0.4]}
        rotation={[0.1, 0.9, 0.15]}
        material={rock}
      >
        <dodecahedronGeometry args={[1.25, 0]} />
      </mesh>
    </group>
  )
}

export function GlowingCastle() {
  const stoneMap = useMemo(
    () => makeStoneTexture('#1c222c', 'rgba(6,8,12,0.55)', 3, 7),
    [],
  )
  const rockMap = useMemo(
    () => makeStoneTexture('#161b21', 'rgba(4,6,8,0.4)', 2, 3),
    [],
  )

  const stone = useMemo(
    () =>
      new MeshStandardMaterial({
        color: STONE,
        map: stoneMap,
        roughness: 0.86,
        metalness: 0.04,
        emissive: '#c5d0e0',
        emissiveIntensity: 0,
      }),
    [stoneMap],
  )
  const stoneDark = useMemo(
    () =>
      new MeshStandardMaterial({
        color: STONE_DARK,
        map: stoneMap,
        roughness: 0.88,
        metalness: 0.05,
        emissive: '#c5d0e0',
        emissiveIntensity: 0,
      }),
    [stoneMap],
  )
  const rock = useMemo(
    () =>
      new MeshStandardMaterial({
        color: ROCK,
        map: rockMap,
        roughness: 0.95,
        metalness: 0.02,
        emissive: '#b7c4d4',
        emissiveIntensity: 0,
      }),
    [rockMap],
  )
  const roof = useMemo(
    () =>
      new MeshStandardMaterial({
        color: ROOF,
        roughness: 0.82,
        metalness: 0.06,
        emissive: '#c5d0e0',
        emissiveIntensity: 0,
      }),
    [],
  )
  const frame = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#0a0c10',
        roughness: 0.9,
      }),
    [],
  )
  const windowMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: WINDOW_GOLD,
        emissive: WINDOW_GOLD,
        emissiveIntensity: 2.1,
        roughness: 0.2,
        toneMapped: false,
      }),
    [],
  )
  const runeMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: ACCENT_COLOR,
        emissive: ACCENT_COLOR,
        emissiveIntensity: 0.9,
        roughness: 0.3,
        metalness: 0.05,
        toneMapped: false,
      }),
    [],
  )

  const windowRef = useRef(windowMaterial)
  const runeRef = useRef(runeMaterial)
  const root = useRef<Group>(null)
  windowRef.current = windowMaterial
  runeRef.current = runeMaterial

  useEffect(() => {
    return () => {
      stone.dispose()
      stoneDark.dispose()
      rock.dispose()
      roof.dispose()
      frame.dispose()
      windowMaterial.dispose()
      runeMaterial.dispose()
      stoneMap?.dispose()
      rockMap?.dispose()
    }
  }, [stone, stoneDark, rock, roof, frame, windowMaterial, runeMaterial, stoneMap, rockMap])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const flash = stormState.flash
    windowRef.current.emissiveIntensity = 2.2 + Math.sin(t * 1.2) * 0.45 + flash * 2.4
    runeRef.current.emissiveIntensity = 0.65 + Math.sin(t * 1.45) * 0.35 + flash * 0.8
    stone.emissiveIntensity = flash * 0.55
    stoneDark.emissiveIntensity = flash * 0.5
    rock.emissiveIntensity = flash * 0.48
    roof.emissiveIntensity = flash * 0.4
    if (root.current) root.current.visible = journeyState.interior < 0.5
  })

  const hallWindows = [-1.7, -1.05, -0.4, 0.25, 0.9, 1.55]

  return (
    <group ref={root} position={[HEART.x, HEART.y, HEART.z]} scale={CASTLE_SCALE}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[9.4, 22]} />
        <meshStandardMaterial color="#090c10" roughness={1} />
      </mesh>
      <mesh
        position={[0, 0.08, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={runeMaterial}
      >
        <torusGeometry args={[3.7, 0.04, 6, 32]} />
      </mesh>

      <Cliff rock={rock} />
      <mesh position={[0.15, 0.7, 2.15]} material={rock}>
        <boxGeometry args={[3.2, 1.4, 1.5]} />
      </mesh>

      {TOWERS.map((spec) => (
        <Tower
          key={spec.position.join(',')}
          spec={spec}
          stone={stone}
          roof={roof}
          windowMaterial={windowMaterial}
          frame={frame}
        />
      ))}

      <group position={[-3.15, 1.75, 1.15]}>
        <mesh position={[0, 1.7, 0]} castShadow material={stone}>
          <boxGeometry args={[4.6, 3.4, 2.35]} />
        </mesh>
        <mesh
          position={[0, 4.15, 0]}
          rotation={[0, Math.PI / 4, 0]}
          scale={[1.55, 1, 0.72]}
          material={roof}
        >
          <coneGeometry args={[2.15, 2.7, 4]} />
        </mesh>
        {hallWindows.map((x) => (
          <GothicWindow
            key={`hall-${x}`}
            position={[x, 1.85, 1.2]}
            material={windowMaterial}
            frame={frame}
            scale={1.15}
          />
        ))}
        {hallWindows.map((x) => (
          <GothicWindow
            key={`hall-up-${x}`}
            position={[x, 2.65, 1.2]}
            material={windowMaterial}
            frame={frame}
            scale={0.9}
          />
        ))}
        <NeedleTurret position={[-2.05, 3.55, 0.95]} stone={stone} roof={roof} />
        <NeedleTurret position={[2.05, 3.55, 0.95]} stone={stone} roof={roof} />
      </group>

      <group position={[2.85, 1.65, 0.35]}>
        <mesh position={[0, 1.35, 0]} castShadow material={stone}>
          <boxGeometry args={[2.8, 2.7, 2.05]} />
        </mesh>
        <mesh
          position={[0, 3.35, 0]}
          rotation={[0, Math.PI / 4, 0]}
          scale={[1.2, 1, 0.7]}
          material={roof}
        >
          <coneGeometry args={[1.55, 1.9, 4]} />
        </mesh>
        {[-0.7, 0, 0.7].map((x) => (
          <GothicWindow
            key={`wing-${x}`}
            position={[x, 1.45, 1.05]}
            material={windowMaterial}
            frame={frame}
          />
        ))}
      </group>

      <mesh position={[-0.9, 2.55, 1.35]} castShadow material={stoneDark}>
        <boxGeometry args={[2.4, 1.55, 1.35]} />
      </mesh>
      <mesh position={[1.55, 2.45, -1.15]} castShadow material={stoneDark}>
        <boxGeometry args={[2.1, 1.4, 1.5]} />
      </mesh>
      <mesh position={[-1.4, 2.35, -1.7]} castShadow material={stone}>
        <boxGeometry args={[1.8, 1.25, 1.7]} />
      </mesh>

      <TerrorArch stone={stone} stoneDark={stoneDark} />

      <NeedleTurret position={[1.55, 9.55, -0.7]} stone={stone} roof={roof} />
      <NeedleTurret position={[-0.55, 9.55, 0.15]} stone={stone} roof={roof} />
      <NeedleTurret position={[3.85, 9.7, -2.15]} stone={stone} roof={roof} />

      <pointLight
        color={WINDOW_GOLD}
        intensity={2.6}
        distance={24}
        position={[0.4, 5.2, 2.2]}
      />
      <pointLight
        color={WINDOW_GOLD}
        intensity={1.8}
        distance={18}
        position={[-3.1, 4.4, 2.1]}
      />
      <pointLight
        color={SPARKLE_COLOR}
        intensity={1.3}
        distance={16}
        position={[0.45, 11.5, -0.55]}
      />
      <pointLight
        color={ACCENT_COLOR}
        intensity={0.4}
        distance={11}
        position={[0, 0.7, 1.2]}
      />
    </group>
  )
}
