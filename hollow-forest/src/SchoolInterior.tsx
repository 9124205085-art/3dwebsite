import { useEffect, useMemo, useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  AmbientLight,
  CanvasTexture,
  DoubleSide,
  Group,
  MeshStandardMaterial,
  PointLight,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import { useQuality } from './quality'
import { HEART, journeyState } from './theme'

const STONE = '#c9c2b3'
const WOOD = '#4a3424'
const WOOD_DARK = '#2c1d14'
const BANNER = [
  { color: '#7a1f1f', name: 'EMBER' },
  { color: '#1f5c38', name: 'PINE' },
  { color: '#1a5f73', name: 'TIDE' },
  { color: '#5b3d7a', name: 'DUSK' },
] as const
const TABLE_X = [-6.9, -2.35, 2.35, 6.9] as const

function makeStoneTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#cfc6b6'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 700; i++) {
    const shade = 150 + Math.random() * 50
    ctx.fillStyle = `rgba(${shade}, ${shade - 8}, ${shade - 18}, 0.18)`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 12, 2 + Math.random() * 8)
  }
  ctx.strokeStyle = 'rgba(90, 78, 64, 0.28)'
  ctx.lineWidth = 1.4
  for (let y = 0; y < 256; y += 32) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(256, y)
    ctx.stroke()
    const offset = (y / 32) % 2 === 0 ? 0 : 24
    for (let x = offset; x < 256; x += 48) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + 32)
      ctx.stroke()
    }
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(8, 14)
  return texture
}

function makeGlassTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#2b241c'
  ctx.fillRect(0, 0, 512, 768)
  const panes = [
    ['#c9a227', '#7a1f1f', '#d4c4a0'],
    ['#1f5c38', '#8fbf7a', '#c9a227'],
    ['#1a5f73', '#7ec8c4', '#dfe9f2'],
    ['#5b3d7a', '#c4a3e0', '#c9a227'],
  ]
  const colW = 110
  panes.forEach((row, col) => {
    const x = 36 + col * colW
    row.forEach((color, rowIndex) => {
      const y = 40 + rowIndex * 210
      ctx.fillStyle = color
      ctx.fillRect(x, y, 96, 190)
      ctx.strokeStyle = '#1a1510'
      ctx.lineWidth = 6
      ctx.strokeRect(x, y, 96, 190)
      ctx.fillStyle = 'rgba(255,255,255,0.16)'
      ctx.fillRect(x + 10, y + 12, 28, 70)
    })
  })
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function Beam({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-10.2, 6.4, 0]}>
        <boxGeometry args={[0.55, 12.6, 0.55]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.88} />
      </mesh>
      <mesh position={[10.2, 6.4, 0]}>
        <boxGeometry args={[0.55, 12.6, 0.55]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.88} />
      </mesh>
      <mesh position={[0, 12.35, 0]}>
        <boxGeometry args={[21.4, 0.42, 0.7]} />
        <meshStandardMaterial color={WOOD} roughness={0.82} />
      </mesh>
      <mesh position={[-5.4, 10.4, 0]} rotation={[0, 0, 0.42]}>
        <boxGeometry args={[8.4, 0.28, 0.38]} />
        <meshStandardMaterial color={WOOD} roughness={0.84} />
      </mesh>
      <mesh position={[5.4, 10.4, 0]} rotation={[0, 0, -0.42]}>
        <boxGeometry args={[8.4, 0.28, 0.38]} />
        <meshStandardMaterial color={WOOD} roughness={0.84} />
      </mesh>
    </group>
  )
}

function LongTable({ x, banner }: { x: number; banner: (typeof BANNER)[number] }) {
  return (
    <group position={[x, 0, -4]}>
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[1.55, 0.12, 26]} />
        <meshStandardMaterial color="#5c3b22" roughness={0.7} />
      </mesh>
      {[-12, -4, 4, 12].map((z) => (
        <mesh key={z} position={[0, 0.4, z]}>
          <boxGeometry args={[0.18, 0.8, 0.18]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.86} />
        </mesh>
      ))}
      <mesh position={[-1.05, 0.48, 0]}>
        <boxGeometry args={[0.38, 0.08, 25.4]} />
        <meshStandardMaterial color="#3d2818" roughness={0.8} />
      </mesh>
      <mesh position={[1.05, 0.48, 0]}>
        <boxGeometry args={[0.38, 0.08, 25.4]} />
        <meshStandardMaterial color="#3d2818" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.7, 13.1]}>
        <planeGeometry args={[1.15, 1.7]} />
        <meshStandardMaterial color={banner.color} roughness={0.7} side={DoubleSide} />
      </mesh>
      <Text
        position={[0, 1.7, 13.14]}
        fontSize={0.16}
        color="#f4e6c1"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        {banner.name}
      </Text>
    </group>
  )
}

function SideWindow({ z, x }: { z: number; x: number }) {
  return (
    <group
      position={[x, 5.4, z]}
      rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[1.7, 4.6, 0.16]} />
        <meshStandardMaterial color="#2a241c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.1, 0.12]}>
        <planeGeometry args={[1.15, 3.6]} />
        <meshStandardMaterial
          color="#f0d9a0"
          emissive="#e8c56a"
          emissiveIntensity={0.85}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 2.05, 0.12]}>
        <circleGeometry args={[0.58, 12]} />
        <meshStandardMaterial
          color="#f6e2b0"
          emissive="#f0d27a"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function FloatingCandle({
  position,
}: {
  position: [number, number, number]
}) {
  const flame = useRef<MeshStandardMaterial>(null)
  const offset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    if (!flame.current) return
    flame.current.emissiveIntensity =
      1.6 + Math.sin(state.clock.elapsedTime * 7 + offset) * 0.45
  })

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.045, 0.05, 0.55, 6]} />
        <meshStandardMaterial color="#f4efe4" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <sphereGeometry args={[0.055, 6, 6]} />
        <meshStandardMaterial
          ref={flame}
          color="#ffe7a0"
          emissive="#ffbf4a"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function CeilingMist() {
  return (
    <group>
      {[-10, -2, 6].map((z) => (
        <mesh key={z} position={[0, 11.2, z]} rotation={[0.08, 0, 0]}>
          <planeGeometry args={[18, 5.5]} />
          <meshBasicMaterial
            color="#f4f1ea"
            transparent
            opacity={0.14}
            depthWrite={false}
            blending={AdditiveBlending}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export function SchoolInterior() {
  const group = useRef<Group>(null)
  const ambient = useRef<AmbientLight>(null)
  const windowLight = useRef<PointLight>(null)
  const hallFill = useRef<PointLight>(null)
  const candleA = useRef<PointLight>(null)
  const candleB = useRef<PointLight>(null)
  const { mobile } = useQuality()

  const stoneMap = useMemo(() => makeStoneTexture(), [])
  const glassMap = useMemo(() => makeGlassTexture(), [])
  const stone = useMemo(
    () =>
      new MeshStandardMaterial({
        color: STONE,
        map: stoneMap,
        roughness: 0.92,
      }),
    [stoneMap],
  )

  const candles = useMemo(() => {
    const count = mobile ? 26 : 64
    return Array.from({ length: count }, (_, index) => {
      const col = (index % 8) - 3.5
      const row = Math.floor(index / 8)
      return [
        col * 2.15 + (index % 3) * 0.35,
        5.2 + (index % 5) * 1.05 + (row % 2) * 0.4,
        10 - row * 3.1 - (index % 2) * 0.8,
      ] as [number, number, number]
    })
  }, [mobile])

  useEffect(() => {
    return () => {
      stone.dispose()
      stoneMap?.dispose()
      glassMap?.dispose()
    }
  }, [stone, stoneMap, glassMap])

  useFrame((state) => {
    const t = journeyState.interior
    if (group.current) group.current.visible = t > 0.04
    if (ambient.current) ambient.current.intensity = 0.55 * t
    if (windowLight.current) windowLight.current.intensity = 18 * t
    if (hallFill.current) hallFill.current.intensity = 7 * t
    if (candleA.current) {
      candleA.current.intensity =
        4.2 * t * (1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.08)
    }
    if (candleB.current) {
      candleB.current.intensity =
        3.6 * t * (1 + Math.sin(state.clock.elapsedTime * 4.1) * 0.1)
    }
  })

  const windowZs = [-14, -8, -2, 4, 10]

  return (
    <group ref={group} position={[HEART.x, HEART.y + 3.15, HEART.z]} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -4]} receiveShadow material={stone}>
        <planeGeometry args={[24, 40]} />
      </mesh>
      <mesh position={[-11.3, 6.6, -4]} material={stone}>
        <boxGeometry args={[0.7, 13.2, 40]} />
      </mesh>
      <mesh position={[11.3, 6.6, -4]} material={stone}>
        <boxGeometry args={[0.7, 13.2, 40]} />
      </mesh>
      <mesh position={[0, 6.6, -23.6]} material={stone}>
        <boxGeometry args={[23.2, 13.2, 0.7]} />
      </mesh>
      <mesh position={[0, 6.6, 15.6]} material={stone}>
        <boxGeometry args={[23.2, 13.2, 0.7]} />
      </mesh>
      <mesh position={[0, 13.15, -4]}>
        <boxGeometry args={[23.4, 0.35, 40]} />
        <meshStandardMaterial color="#3b2a1c" roughness={0.9} />
      </mesh>

      {[-16, -10, -4, 2, 8, 14].map((z) => (
        <Beam key={z} z={z} />
      ))}

      {windowZs.map((z) => (
        <group key={z}>
          <SideWindow z={z} x={-11} />
          <SideWindow z={z} x={11} />
        </group>
      ))}

      <mesh position={[0, 6.8, -23.18]}>
        <planeGeometry args={[10.4, 9.6]} />
        <meshStandardMaterial
          map={glassMap}
          emissive="#ffffff"
          emissiveMap={glassMap}
          emissiveIntensity={0.55}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 11.7, -23.16]}>
        <circleGeometry args={[2.15, 16]} />
        <meshStandardMaterial
          color="#c9a227"
          emissive="#c9a227"
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>

      {TABLE_X.map((x, index) => (
        <LongTable key={x} x={x} banner={BANNER[index]} />
      ))}

      {candles.map((position, index) => (
        <FloatingCandle key={index} position={position} />
      ))}

      <CeilingMist />

      <Text
        position={[0, 9.6, -22.9]}
        fontSize={0.42}
        color="#f4e6c1"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.18}
      >
        HOLLOW ACADEMY
      </Text>

      <ambientLight ref={ambient} intensity={0} color="#f0e6d2" />
      <pointLight
        ref={windowLight}
        color="#f6e2b0"
        intensity={0}
        distance={48}
        position={[0, 7, -20]}
      />
      <pointLight
        ref={hallFill}
        color="#ffe9c4"
        intensity={0}
        distance={40}
        position={[0, 8, -2]}
      />
      <pointLight
        ref={candleA}
        color="#ffc66a"
        intensity={0}
        distance={22}
        position={[-3, 7, 2]}
      />
      <pointLight
        ref={candleB}
        color="#ffd27a"
        intensity={0}
        distance={22}
        position={[3, 6.5, -8]}
      />
    </group>
  )
}
