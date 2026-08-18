import { useEffect, useMemo, useRef } from 'react'
import { Instance, Instances, Sparkles, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  AmbientLight,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  MeshStandardMaterial,
  PointLight,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import { useQuality } from './quality'
import {
  HEART,
  HALL_SCALE,
  HALL_Y,
  HOUSES,
  journeyState,
  selectHouse,
} from './theme'
import { ACADEMY_ROBE, Face, Hair, type HairStyle } from './academyFigure'
import { HousePath } from './HousePath'

const STONE = '#8f877c'
const WOOD = '#4a3424'
const WOOD_DARK = '#2c1d14'
const warmWindow = new Color('#f6e2b0')
const warmFill = new Color('#ffe9c4')
const warmAmbient = new Color('#f0e6d2')
const SKINS = [
  '#c58c5c',
  '#8d5524',
  '#d4a574',
  '#e8c4a0',
  '#6b3f24',
  '#f0d0b0',
  '#a0673a',
  '#b07850',
]
const HAIRS = [
  '#1a120c',
  '#140e0a',
  '#3b2416',
  '#c45c2a',
  '#e07098',
  '#4a3020',
  '#0e0c0a',
  '#6b3a1f',
  '#2a1810',
  '#d4a017',
]
const ROBES = ['#121214', '#141418', '#101012', '#161418']
const HAIR_STYLES: HairStyle[] = ['short', 'pony', 'bun', 'side', 'long']
const BANNER = [
  { color: '#7a1f1f', name: 'EMBER' },
  { color: '#1f5c38', name: 'PINE' },
  { color: '#1a5f73', name: 'TIDE' },
  { color: '#5b3d7a', name: 'DUSK' },
] as const

const TABLES = [
  { x: -5.55, z: -2.6, yaw: 0.038, length: 23.6, banner: BANNER[0] },
  { x: -1.85, z: -5.1, yaw: -0.022, length: 27.4, banner: BANNER[1] },
  { x: 2.15, z: -3.4, yaw: 0.03, length: 25.2, banner: BANNER[2] },
  { x: 5.7, z: -5.8, yaw: -0.048, length: 22.8, banner: BANNER[3] },
] as const

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function makeStoneTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#8a8276'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 700; i++) {
    const shade = 110 + Math.random() * 45
    ctx.fillStyle = `rgba(${shade}, ${shade - 8}, ${shade - 18}, 0.22)`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 12, 2 + Math.random() * 8)
  }
  ctx.strokeStyle = 'rgba(58, 50, 42, 0.42)'
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

function makeFloorTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#cbb48a'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 420; i++) {
    const shade = 160 + Math.random() * 40
    ctx.fillStyle = `rgba(${shade}, ${shade - 18}, ${shade - 48}, 0.16)`
    ctx.fillRect(
      Math.random() * 256,
      Math.random() * 256,
      4 + Math.random() * 16,
      3 + Math.random() * 10,
    )
  }
  ctx.strokeStyle = 'rgba(92, 72, 48, 0.38)'
  ctx.lineWidth = 3
  for (let y = 0; y < 256; y += 64) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(256, y)
    ctx.stroke()
  }
  for (let x = 0; x < 256; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 256)
    ctx.stroke()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(10, 16)
  return texture
}

function makeArchGlassTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#c9c2b3'
  ctx.fillRect(0, 0, 512, 768)
  for (let i = 0; i < 220; i++) {
    const shade = 140 + seeded(i + 3) * 40
    ctx.fillStyle = `rgba(${shade}, ${shade - 10}, ${shade - 20}, 0.12)`
    ctx.fillRect(seeded(i) * 512, seeded(i + 8) * 768, 8, 6)
  }

  ctx.beginPath()
  ctx.moveTo(64, 748)
  ctx.lineTo(64, 318)
  ctx.quadraticCurveTo(256, 8, 448, 318)
  ctx.lineTo(448, 748)
  ctx.closePath()
  ctx.fillStyle = '#1c1610'
  ctx.fill()
  ctx.save()
  ctx.clip()

  const palette = [
    '#e8c56a',
    '#d4a84a',
    '#c48a2a',
    '#f3dd9a',
    '#b8862b',
    '#f0d080',
    '#e2b85a',
    '#c9a227',
  ]
  const teals = ['#1d6a68', '#145654']
  const cx = 256
  const cy = 428

  for (let ring = 0; ring < 10; ring++) {
    const count = 6 + ring * 4
    const rInner = 10 + ring * 34
    const rOuter = rInner + 22 + seeded(ring + 2) * 20
    for (let k = 0; k < count; k++) {
      const twist = ring * 0.21 + seeded(ring * 11 + k) * 0.2
      const a0 = (k / count) * Math.PI * 2 + twist
      const span = ((0.62 + seeded(k * 4 + ring) * 0.5) / count) * Math.PI * 2
      const a1 = a0 + span
      const j = (seeded(k + ring * 17) - 0.5) * 14
      ctx.beginPath()
      ctx.moveTo(
        cx + Math.cos(a0) * (rInner + j),
        cy + Math.sin(a0) * (rInner * 1.18 + j * 0.4),
      )
      ctx.lineTo(
        cx + Math.cos(a1) * (rInner + j * 0.4),
        cy + Math.sin(a1) * (rInner * 1.18),
      )
      ctx.lineTo(
        cx + Math.cos(a1 + 0.04) * rOuter,
        cy + Math.sin(a1 + 0.04) * (rOuter * 1.2),
      )
      ctx.lineTo(
        cx + Math.cos(a0 - 0.05) * (rOuter + j * 0.3),
        cy + Math.sin(a0 - 0.05) * (rOuter * 1.2),
      )
      ctx.closePath()
      const useTeal = seeded(k * 7 + ring * 3) > 0.88
      ctx.fillStyle = useTeal
        ? teals[seeded(k) > 0.5 ? 1 : 0]
        : palette[Math.floor(seeded(k * 13 + ring) * palette.length)]
      ctx.fill()
      ctx.strokeStyle = 'rgba(24, 18, 12, 0.88)'
      ctx.lineWidth = 1.8
      ctx.stroke()
    }
  }

  ctx.fillStyle = 'rgba(255, 236, 180, 0.14)'
  ctx.beginPath()
  ctx.arc(210, 300, 90, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = '#2a241c'
  ctx.lineWidth = 22
  ctx.beginPath()
  ctx.moveTo(64, 748)
  ctx.lineTo(64, 318)
  ctx.quadraticCurveTo(256, 8, 448, 318)
  ctx.lineTo(448, 748)
  ctx.stroke()

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function makeHouseFlagTexture(house: (typeof HOUSES)[number]) {
  const width = 512
  const height = 1024
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const fill =
    house.id === 'EMBER'
      ? '#9e1c1c'
      : house.id === 'PINE'
        ? '#2a8a3c'
        : house.id === 'TIDE'
          ? '#1a7a9c'
          : '#5c3d82'
  const trim = house.glow
  const notchY = height * 0.78

  ctx.clearRect(0, 0, width, height)
  ctx.beginPath()
  ctx.moveTo(28, 28)
  ctx.lineTo(width - 28, 28)
  ctx.lineTo(width - 28, notchY)
  ctx.lineTo(width / 2, height - 18)
  ctx.lineTo(28, notchY)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.save()
  ctx.clip()

  ctx.strokeStyle = trim
  ctx.lineWidth = 22
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255, 244, 210, 0.55)'
  ctx.lineWidth = 6
  ctx.stroke()

  const cx = width / 2
  const cy = 280
  ctx.beginPath()
  ctx.arc(cx, cy, 118, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(20, 12, 8, 0.28)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, 108, 0, Math.PI * 2)
  ctx.fillStyle = '#f3e0a8'
  ctx.fill()
  ctx.strokeStyle = '#3a2414'
  ctx.lineWidth = 8
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, 92, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = trim
  ctx.lineWidth = 5
  ctx.stroke()

  ctx.fillStyle = trim
  ctx.strokeStyle = trim
  if (house.id === 'EMBER') {
    ctx.beginPath()
    ctx.moveTo(cx, cy - 62)
    ctx.quadraticCurveTo(cx + 48, cy - 10, cx + 18, cy + 58)
    ctx.lineTo(cx, cy + 28)
    ctx.lineTo(cx - 18, cy + 58)
    ctx.quadraticCurveTo(cx - 48, cy - 10, cx, cy - 62)
    ctx.fill()
    ctx.fillStyle = '#f6d58a'
    ctx.beginPath()
    ctx.moveTo(cx, cy - 28)
    ctx.quadraticCurveTo(cx + 18, cy + 8, cx + 4, cy + 38)
    ctx.lineTo(cx - 4, cy + 38)
    ctx.quadraticCurveTo(cx - 18, cy + 8, cx, cy - 28)
    ctx.fill()
  } else if (house.id === 'PINE') {
    ctx.beginPath()
    ctx.moveTo(cx, cy - 64)
    ctx.lineTo(cx + 58, cy + 8)
    ctx.lineTo(cx - 58, cy + 8)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx, cy - 28)
    ctx.lineTo(cx + 48, cy + 36)
    ctx.lineTo(cx - 48, cy + 36)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(cx - 10, cy + 36, 20, 28)
  } else if (house.id === 'TIDE') {
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx - 62, cy - 8)
    ctx.quadraticCurveTo(cx - 28, cy - 42, cx, cy - 8)
    ctx.quadraticCurveTo(cx + 28, cy + 26, cx + 62, cy - 8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - 62, cy + 28)
    ctx.quadraticCurveTo(cx - 28, cy - 6, cx, cy + 28)
    ctx.quadraticCurveTo(cx + 28, cy + 62, cx + 62, cy + 28)
    ctx.stroke()
  } else {
    ctx.lineWidth = 14
    ctx.beginPath()
    ctx.arc(cx + 8, cy, 48, 0.55, Math.PI * 1.7, false)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + 38, cy - 46, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = house.id === 'PINE' ? '#1a120c' : '#f7efe2'
  ctx.textAlign = 'center'
  ctx.font = "bold 78px 'Times New Roman', Georgia, serif"
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 8
  ctx.fillText(house.name, cx, 720)
  ctx.shadowBlur = 0
  ctx.font = "italic 28px Georgia, serif"
  ctx.fillStyle = trim
  ctx.fillText(house.motto, cx, 780)

  ctx.restore()

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
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

type Seat = {
  x: number
  z: number
  rotY: number
  skin: string
  hair: string
  robe: string
  scale: number
  hairStyle: HairStyle
}

function TableStudents({
  length,
  houseColor,
  mobile,
  tableSeed,
  tableX,
}: {
  length: number
  houseColor: string
  mobile: boolean
  tableSeed: number
  tableX: number
}) {
  const seats = useMemo(() => {
    const step = mobile ? 0.92 : 0.62
    const half = length / 2
    const aisleSide = tableX < 0 ? 1 : -1
    const list: Seat[] = []
    let i = 0
    for (let along = -half + 1.05; along <= half - 1.15; along += step) {
      for (const side of [-1, 1] as const) {
        const seed = tableSeed * 97 + i * 13
        const onAisle = side === aisleSide
        const rotY = onAisle
          ? 0.06 + (seeded(seed + 4) - 0.5) * 0.28
          : (side > 0 ? -0.62 : 0.62) + (seeded(seed + 4) - 0.5) * 0.18
        list.push({
          x: side * 1.08,
          z: along + (seeded(seed) - 0.5) * 0.04,
          rotY,
          skin: SKINS[Math.floor(seeded(seed + 1) * SKINS.length)],
          hair: HAIRS[Math.floor(seeded(seed + 3) * HAIRS.length)],
          robe: ROBES[Math.floor(seeded(seed + 5) * ROBES.length)],
          scale: 0.92 + seeded(seed + 7) * 0.14,
          hairStyle: HAIR_STYLES[Math.floor(seeded(seed + 9) * HAIR_STYLES.length)],
        })
        i += 1
      }
    }
    return list
  }, [length, mobile, tableSeed, tableX])

  const count = seats.length
  const ponies = useMemo(
    () => seats.filter((seat) => seat.hairStyle === 'pony' || seat.hairStyle === 'long'),
    [seats],
  )
  const buns = useMemo(
    () => seats.filter((seat) => seat.hairStyle === 'bun'),
    [seats],
  )

  return (
    <group>
      <Instances limit={count} range={count}>
        <capsuleGeometry args={[0.055, 0.2, 3, 6]} />
        <meshStandardMaterial roughness={0.86} />
        {seats.map((seat, index) => {
          const forwardX = Math.sin(seat.rotY)
          const forwardZ = Math.cos(seat.rotY)
          return (
            <Instance
              key={`thigh-${index}`}
              position={[
                seat.x + forwardX * 0.12,
                0.58,
                seat.z + forwardZ * 0.12,
              ]}
              rotation={[1.18, seat.rotY, 0]}
              scale={seat.scale}
              color={seat.robe}
            />
          )
        })}
      </Instances>
      <Instances limit={count} range={count}>
        <capsuleGeometry args={[0.12, 0.28, 3, 8]} />
        <meshStandardMaterial roughness={0.86} />
        {seats.map((seat, index) => (
          <Instance
            key={`robe-${index}`}
            position={[seat.x, 0.86, seat.z]}
            rotation={[0.08, seat.rotY, 0]}
            scale={seat.scale}
            color={seat.robe}
          />
        ))}
      </Instances>
      <Instances limit={count} range={count}>
        <boxGeometry args={[0.28, 0.42, 0.07]} />
        <meshStandardMaterial roughness={0.88} />
        {seats.map((seat, index) => {
          const forwardX = Math.sin(seat.rotY)
          const forwardZ = Math.cos(seat.rotY)
          return (
            <Instance
              key={`cape-${index}`}
              position={[
                seat.x - forwardX * 0.08,
                0.82,
                seat.z - forwardZ * 0.08,
              ]}
              rotation={[0.12, seat.rotY, 0]}
              scale={seat.scale}
              color={seat.robe}
            />
          )
        })}
      </Instances>
      <Instances limit={count} range={count}>
        <boxGeometry args={[0.14, 0.12, 0.04]} />
        <meshStandardMaterial roughness={0.55} />
        {seats.map((seat, index) => {
          const forwardX = Math.sin(seat.rotY)
          const forwardZ = Math.cos(seat.rotY)
          return (
            <Instance
              key={`shirt-${index}`}
              position={[
                seat.x + forwardX * 0.055,
                0.94,
                seat.z + forwardZ * 0.055,
              ]}
              rotation={[0.05, seat.rotY, 0]}
              scale={seat.scale}
              color="#f4f0e8"
            />
          )
        })}
      </Instances>
      <Instances limit={count} range={count}>
        <boxGeometry args={[0.035, 0.16, 0.02]} />
        <meshStandardMaterial roughness={0.5} />
        {seats.map((seat, index) => {
          const forwardX = Math.sin(seat.rotY)
          const forwardZ = Math.cos(seat.rotY)
          return (
            <Instance
              key={`tie-${index}`}
              position={[
                seat.x + forwardX * 0.075,
                0.88,
                seat.z + forwardZ * 0.075,
              ]}
              rotation={[0.08, seat.rotY, 0]}
              scale={seat.scale}
              color={houseColor}
            />
          )
        })}
      </Instances>
      <Instances limit={count} range={count}>
        <sphereGeometry args={[0.088, 10, 10]} />
        <meshStandardMaterial roughness={0.55} />
        {seats.map((seat, index) => {
          const forwardX = Math.sin(seat.rotY)
          const forwardZ = Math.cos(seat.rotY)
          return (
            <Instance
              key={`head-${index}`}
              position={[
                seat.x + forwardX * 0.02,
                1.14,
                seat.z + forwardZ * 0.02,
              ]}
              rotation={[0, seat.rotY, 0]}
              scale={seat.scale}
              color={seat.skin}
            />
          )
        })}
      </Instances>
      <Instances limit={count * 2} range={count * 2}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial roughness={0.28} />
        {seats.flatMap((seat, index) => {
          const fx = Math.sin(seat.rotY)
          const fz = Math.cos(seat.rotY)
          const rx = Math.cos(seat.rotY)
          const rz = -Math.sin(seat.rotY)
          return ([-1, 1] as const).map((eye) => (
            <Instance
              key={`eye-${index}-${eye}`}
              position={[
                seat.x + fx * 0.078 + rx * eye * 0.03,
                1.155,
                seat.z + fz * 0.078 + rz * eye * 0.03,
              ]}
              scale={seat.scale}
              color="#f7f4ee"
            />
          ))
        })}
      </Instances>
      <Instances limit={count * 2} range={count * 2}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial roughness={0.35} />
        {seats.flatMap((seat, index) => {
          const fx = Math.sin(seat.rotY)
          const fz = Math.cos(seat.rotY)
          const rx = Math.cos(seat.rotY)
          const rz = -Math.sin(seat.rotY)
          return ([-1, 1] as const).map((eye) => (
            <Instance
              key={`pupil-${index}-${eye}`}
              position={[
                seat.x + fx * 0.092 + rx * eye * 0.03,
                1.155,
                seat.z + fz * 0.092 + rz * eye * 0.03,
              ]}
              scale={seat.scale}
              color="#1a120c"
            />
          ))
        })}
      </Instances>
      <Instances limit={count * 2} range={count * 2}>
        <boxGeometry args={[0.03, 0.007, 0.01]} />
        <meshStandardMaterial roughness={0.7} />
        {seats.flatMap((seat, index) => {
          const fx = Math.sin(seat.rotY)
          const fz = Math.cos(seat.rotY)
          const rx = Math.cos(seat.rotY)
          const rz = -Math.sin(seat.rotY)
          return ([-1, 1] as const).map((eye) => (
            <Instance
              key={`brow-${index}-${eye}`}
              position={[
                seat.x + fx * 0.076 + rx * eye * 0.03,
                1.178,
                seat.z + fz * 0.076 + rz * eye * 0.03,
              ]}
              rotation={[0, seat.rotY, eye * 0.14]}
              scale={seat.scale}
              color="#1c1410"
            />
          ))
        })}
      </Instances>
      <Instances limit={count} range={count}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshStandardMaterial roughness={0.5} />
        {seats.map((seat, index) => {
          const fx = Math.sin(seat.rotY)
          const fz = Math.cos(seat.rotY)
          return (
            <Instance
              key={`nose-${index}`}
              position={[
                seat.x + fx * 0.09,
                1.132,
                seat.z + fz * 0.09,
              ]}
              scale={seat.scale}
              color={seat.skin}
            />
          )
        })}
      </Instances>
      <Instances limit={count} range={count}>
        <boxGeometry args={[0.028, 0.008, 0.01]} />
        <meshStandardMaterial roughness={0.55} />
        {seats.map((seat, index) => {
          const fx = Math.sin(seat.rotY)
          const fz = Math.cos(seat.rotY)
          return (
            <Instance
              key={`mouth-${index}`}
              position={[
                seat.x + fx * 0.084,
                1.108,
                seat.z + fz * 0.084,
              ]}
              rotation={[0, seat.rotY, 0]}
              scale={seat.scale}
              color="#7a3a42"
            />
          )
        })}
      </Instances>
      <Instances limit={count} range={count}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial roughness={0.62} />
        {seats.map((seat, index) => {
          const fx = Math.sin(seat.rotY)
          const fz = Math.cos(seat.rotY)
          return (
            <Instance
              key={`hair-${index}`}
              position={[
                seat.x - fx * 0.01,
                1.21,
                seat.z - fz * 0.01,
              ]}
              scale={[1.18 * seat.scale, 0.62 * seat.scale, 1.22 * seat.scale]}
              color={seat.hair}
            />
          )
        })}
      </Instances>
      <Instances limit={count} range={count}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial roughness={0.62} />
        {seats.map((seat, index) => {
          const fx = Math.sin(seat.rotY)
          const fz = Math.cos(seat.rotY)
          return (
            <Instance
              key={`hairback-${index}`}
              position={[
                seat.x - fx * 0.07,
                1.1,
                seat.z - fz * 0.07,
              ]}
              scale={[0.95 * seat.scale, 0.72 * seat.scale, 0.78 * seat.scale]}
              color={seat.hair}
            />
          )
        })}
      </Instances>
      {ponies.length > 0 && (
        <Instances limit={ponies.length} range={ponies.length}>
          <capsuleGeometry args={[0.032, 0.2, 4, 8]} />
          <meshStandardMaterial roughness={0.62} />
          {ponies.map((seat, index) => {
            const fx = Math.sin(seat.rotY)
            const fz = Math.cos(seat.rotY)
            return (
              <Instance
                key={`pony-${index}`}
                position={[
                  seat.x - fx * 0.11,
                  1.02,
                  seat.z - fz * 0.11,
                ]}
                rotation={[0.85, seat.rotY, 0]}
                scale={seat.scale}
                color={seat.hair}
              />
            )
          })}
        </Instances>
      )}
      {buns.length > 0 && (
        <Instances limit={buns.length} range={buns.length}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial roughness={0.62} />
          {buns.map((seat, index) => {
            const fx = Math.sin(seat.rotY)
            const fz = Math.cos(seat.rotY)
            return (
              <Instance
                key={`bun-${index}`}
                position={[
                  seat.x - fx * 0.03,
                  1.28,
                  seat.z - fz * 0.03,
                ]}
                scale={seat.scale}
                color={seat.hair}
              />
            )
          })}
        </Instances>
      )}
    </group>
  )
}

function GoldPlate({ x }: { x: number }) {
  return (
    <mesh position={[x, 0, 0]}>
      <cylinderGeometry args={[0.13, 0.145, 0.022, 12]} />
      <meshStandardMaterial color="#e8c56a" metalness={0.88} roughness={0.2} />
    </mesh>
  )
}

function Goblet({ x, z = 0 }: { x: number; z?: number }) {
  return (
    <group position={[x, 0.02, z]}>
      <mesh>
        <cylinderGeometry args={[0.028, 0.038, 0.12, 8]} />
        <meshStandardMaterial color="#c9a227" metalness={0.84} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.042, 8, 8]} />
        <meshStandardMaterial color="#d4b24a" metalness={0.82} roughness={0.24} />
      </mesh>
    </group>
  )
}

function RoastPlatter() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.2, 0.22, 0.03, 12]} />
        <meshStandardMaterial color="#b8862b" metalness={0.78} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[0.15, 0.4, 0.2]} scale={[1.15, 0.55, 0.72]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#6b3a22" roughness={0.68} />
      </mesh>
      <mesh position={[0.07, 0.1, 0.04]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color="#8a4a28" roughness={0.62} />
      </mesh>
      <mesh position={[-0.06, 0.09, -0.03]}>
        <sphereGeometry args={[0.038, 6, 6]} />
        <meshStandardMaterial color="#7a4020" roughness={0.65} />
      </mesh>
    </group>
  )
}

function BreadBasket() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.16, 0.17, 0.05, 10]} />
        <meshStandardMaterial color="#5c3b22" roughness={0.8} />
      </mesh>
      <mesh position={[0.02, 0.07, 0]} rotation={[0.2, 0.3, 0.1]} scale={[1.2, 0.45, 0.55]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#d4a05a" roughness={0.7} />
      </mesh>
      <mesh position={[-0.05, 0.06, 0.03]} rotation={[-0.15, 0.8, 0.2]} scale={[0.9, 0.38, 0.42]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#c48a3a" roughness={0.72} />
      </mesh>
    </group>
  )
}

function FruitBowl() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.12, 0.15, 0.08, 10]} />
        <meshStandardMaterial color="#8a5a28" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[0.03, 0.08, 0.02]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#c43a2a" roughness={0.45} />
      </mesh>
      <mesh position={[-0.04, 0.07, 0.01]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#e8c56a" roughness={0.4} />
      </mesh>
      <mesh position={[0.01, 0.09, -0.04]}>
        <sphereGeometry args={[0.038, 8, 8]} />
        <meshStandardMaterial color="#2f6b2a" roughness={0.5} />
      </mesh>
      <mesh position={[-0.02, 0.1, 0.04]}>
        <sphereGeometry args={[0.032, 8, 8]} />
        <meshStandardMaterial color="#7a1f1f" roughness={0.42} />
      </mesh>
    </group>
  )
}

function PieDish() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.15, 0.16, 0.05, 12]} />
        <meshStandardMaterial color="#c9a227" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.05, 12]} />
        <meshStandardMaterial color="#c47a2a" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.12, 10, 6]} />
        <meshStandardMaterial color="#e0b060" roughness={0.48} />
      </mesh>
    </group>
  )
}

function StewBowl() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.1, 0.12, 0.08, 10]} />
        <meshStandardMaterial color="#6b4226" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 10]} />
        <meshStandardMaterial color="#8a3a18" roughness={0.4} />
      </mesh>
    </group>
  )
}

function CheeseBoard() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.28, 0.03, 0.18]} />
        <meshStandardMaterial color="#5c3b22" roughness={0.78} />
      </mesh>
      <mesh position={[-0.05, 0.05, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.07, 0.08]} />
        <meshStandardMaterial color="#f0d48a" roughness={0.5} />
      </mesh>
      <mesh position={[0.07, 0.04, 0.02]} rotation={[0.1, -0.4, 0.2]} scale={[1, 0.45, 0.7]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#e8c56a" roughness={0.48} />
      </mesh>
    </group>
  )
}

function GrapeCluster() {
  return (
    <group>
      {[-0.04, 0, 0.04].flatMap((x, i) =>
        [-0.03, 0.02].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.05 + ((i + j) % 2) * 0.02, z]}>
            <sphereGeometry args={[0.028, 6, 6]} />
            <meshStandardMaterial color="#5b3d7a" roughness={0.35} />
          </mesh>
        )),
      )}
      <mesh position={[0.01, 0.09, 0]}>
        <sphereGeometry args={[0.026, 6, 6]} />
        <meshStandardMaterial color="#4a2e68" roughness={0.35} />
      </mesh>
    </group>
  )
}

const CENTER_FEAST = [
  RoastPlatter,
  BreadBasket,
  FruitBowl,
  PieDish,
  StewBowl,
  CheeseBoard,
  GrapeCluster,
  RoastPlatter,
]

function TableSettings({ length }: { length: number }) {
  const places = useMemo(() => {
    const half = length / 2
    const zs: number[] = []
    for (let z = -half + 1.35; z < half - 1.35; z += 0.95) zs.push(z)
    return zs
  }, [length])

  return (
    <group>
      {places.map((z, index) => {
        const Feast = CENTER_FEAST[index % CENTER_FEAST.length]
        const side = index % 2 === 0 ? 0.18 : -0.18
        return (
          <group key={z} position={[0, 0.9, z]}>
            <GoldPlate x={-0.46} />
            <GoldPlate x={0.46} />
            <Goblet x={-0.62} z={0.1} />
            <Goblet x={0.62} z={-0.08} />
            <mesh position={[-0.46, 0.03, 0]} scale={[0.7, 0.22, 0.55]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial
                color={index % 2 ? '#7a4020' : '#c48a3a'}
                roughness={0.62}
              />
            </mesh>
            <mesh position={[0.46, 0.03, 0]} scale={[0.55, 0.2, 0.5]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial
                color={index % 3 ? '#2f6b2a' : '#8a3a18'}
                roughness={0.55}
              />
            </mesh>
            <group position={[side, 0.02, 0]}>
              <Feast />
            </group>
          </group>
        )
      })}
    </group>
  )
}

function HouseTableFlags({
  banner,
  tableX,
}: {
  banner: (typeof BANNER)[number]
  tableX: number
}) {
  const house = HOUSES.find((item) => item.name.toUpperCase() === banner.name) ?? HOUSES[0]
  const map = useMemo(() => makeHouseFlagTexture(house), [house])
  const towardWall = tableX < 0 ? -1 : 1
  const faceAisle = tableX < 0 ? Math.PI / 2 : -Math.PI / 2

  useEffect(() => {
    return () => map?.dispose()
  }, [map])

  return (
    <HangingFlag
      z={0.4}
      x={towardWall * 1.55}
      yaw={faceAisle}
      map={map}
      color={house.color}
      glow={house.glow}
      delay={tableX}
    />
  )
}

function HangingFlag({
  x,
  z,
  yaw,
  map,
  color,
  glow,
  delay,
}: {
  x: number
  z: number
  yaw: number
  map: CanvasTexture | null
  color: string
  glow: string
  delay: number
}) {
  const group = useRef<Group>(null)
  const FLAG_W = 1.95
  const FLAG_H = 6.5
  const topY = 12.12
  const centerY = topY - FLAG_H / 2

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime + delay
    group.current.rotation.z = Math.sin(t * 0.48) * 0.04
    group.current.rotation.x = Math.cos(t * 0.33) * 0.018
  })

  return (
    <group ref={group} position={[x, 0, z]} rotation={[0, yaw, 0]}>
      <mesh position={[0, topY + 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, FLAG_W + 0.18, 8]} />
        <meshStandardMaterial color="#c9a227" metalness={0.7} roughness={0.32} />
      </mesh>
      <mesh position={[0, topY + 0.42, 0]}>
        <boxGeometry args={[0.06, 0.72, 0.06]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      <mesh position={[0, centerY, 0]}>
        <planeGeometry args={[FLAG_W, FLAG_H]} />
        <meshStandardMaterial
          map={map ?? undefined}
          color={map ? '#ffffff' : color}
          transparent
          alphaTest={0.12}
          roughness={0.72}
          metalness={0.04}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, centerY - FLAG_H / 2 + 0.22, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={glow} metalness={0.55} roughness={0.3} />
      </mesh>
    </group>
  )
}

function LongTable({
  x,
  z,
  yaw,
  length,
  banner,
  mobile,
  tableSeed,
}: {
  x: number
  z: number
  yaw: number
  length: number
  banner: (typeof BANNER)[number]
  mobile: boolean
  tableSeed: number
}) {
  const half = length / 2
  const legs = [-half + 1.4, -half * 0.35, half * 0.32, half - 1.6]
  return (
    <group position={[x, 0, z]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[1.55, 0.12, length]} />
        <meshStandardMaterial color="#5c3b22" roughness={0.7} />
      </mesh>
      {legs.map((legZ) => (
        <mesh key={legZ} position={[0, 0.4, legZ]}>
          <boxGeometry args={[0.18, 0.8, 0.18]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.86} />
        </mesh>
      ))}
      <mesh position={[-1.05, 0.48, 0]}>
        <boxGeometry args={[0.38, 0.08, length - 0.6]} />
        <meshStandardMaterial color="#3d2818" roughness={0.8} />
      </mesh>
      <mesh position={[1.05, 0.48, 0]}>
        <boxGeometry args={[0.38, 0.08, length - 0.6]} />
        <meshStandardMaterial color="#3d2818" roughness={0.8} />
      </mesh>
      <HouseTableFlags banner={banner} tableX={x} />
      <TableSettings length={length} />
      <TableStudents
        length={length}
        houseColor={banner.color}
        mobile={mobile}
        tableSeed={tableSeed}
        tableX={x}
      />
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
          emissiveIntensity={1.05}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 2.05, 0.12]}>
        <circleGeometry args={[0.58, 12]} />
        <meshStandardMaterial
          color="#f6e2b0"
          emissive="#f0d27a"
          emissiveIntensity={1.15}
          toneMapped={false}
        />
      </mesh>
      <mesh
        position={[0.15, -0.4, 1.6]}
        rotation={[0.42, 0, x < 0 ? 0.18 : -0.18]}
      >
        <planeGeometry args={[1.4, 7.2]} />
        <meshBasicMaterial
          color="#f6d58a"
          transparent
          opacity={0.09}
          depthWrite={false}
          blending={AdditiveBlending}
          fog={false}
        />
      </mesh>
    </group>
  )
}

function WallSconce({ x, z }: { x: number; z: number }) {
  const facing = x < 0 ? 1 : -1
  return (
    <group
      position={[x, 5.55, z]}
      rotation={[0, facing > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <mesh position={[0, 0.42, 0.12]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#6e655c" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.22, 0.32]} rotation={[0.85, 0, 0]}>
        <coneGeometry args={[0.1, 0.28, 6]} />
        <meshStandardMaterial color="#5c544c" roughness={0.9} />
      </mesh>
      <mesh position={[-0.14, 0.58, 0.14]} rotation={[0, 0, 0.55]}>
        <coneGeometry args={[0.045, 0.2, 5]} />
        <meshStandardMaterial color="#5c544c" roughness={0.9} />
      </mesh>
      <mesh position={[0.14, 0.58, 0.14]} rotation={[0, 0, -0.55]}>
        <coneGeometry args={[0.045, 0.2, 5]} />
        <meshStandardMaterial color="#5c544c" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.18, 0.26]}>
        <cylinderGeometry args={[0.016, 0.016, 0.72, 6]} />
        <meshStandardMaterial color="#3a2c1c" metalness={0.45} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.62, 0.26]}>
        <boxGeometry args={[0.24, 0.34, 0.24]} />
        <meshStandardMaterial
          color="#e8c56a"
          emissive="#e8c56a"
          emissiveIntensity={1.25}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.62, 0.26]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial
          color="#ffe7a0"
          emissive="#ffbf4a"
          emissiveIntensity={1.55}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function Pillar({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.15, 0.64, 1.15]} />
        <meshStandardMaterial color="#7a7268" roughness={0.9} />
      </mesh>
      <mesh position={[0, 6.4, 0]}>
        <boxGeometry args={[0.88, 12.2, 0.88]} />
        <meshStandardMaterial color="#8a8176" roughness={0.92} />
      </mesh>
      <mesh position={[0, 12.55, 0]}>
        <boxGeometry args={[1.12, 0.42, 1.12]} />
        <meshStandardMaterial color="#7a7268" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Fireplace() {
  return (
    <group position={[10.55, 0, -7.4]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[3.6, 3.7, 0.7]} />
        <meshStandardMaterial color="#7a7268" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.45, 0.22]}>
        <boxGeometry args={[1.85, 2.05, 0.45]} />
        <meshStandardMaterial color="#1a120c" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.42, 0.18]}>
        <boxGeometry args={[2.2, 0.28, 0.7]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.86} />
      </mesh>
      <mesh position={[-0.18, 0.62, 0.28]} rotation={[0.2, 0.3, 0.4]}>
        <cylinderGeometry args={[0.07, 0.09, 0.7, 6]} />
        <meshStandardMaterial color="#4a2e18" roughness={0.88} />
      </mesh>
      <mesh position={[0.16, 0.6, 0.26]} rotation={[0.15, -0.4, -0.3]}>
        <cylinderGeometry args={[0.06, 0.08, 0.62, 6]} />
        <meshStandardMaterial color="#3d2414" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.85, 0.32]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial
          color="#ff8a3a"
          emissive="#ff6a1a"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#ff8a3a" intensity={7.5} distance={11} position={[0, 1.15, 0.7]} />
    </group>
  )
}

function StandingStudent({
  x,
  z,
  seed,
}: {
  x: number
  z: number
  seed: number
}) {
  const skin = SKINS[Math.floor(seeded(seed + 1) * SKINS.length)]
  const hair = HAIRS[Math.floor(seeded(seed + 3) * HAIRS.length)]
  const house = BANNER[Math.floor(seeded(seed + 8) * BANNER.length)]
  const scale = 0.92 + seeded(seed + 11) * 0.14
  const hairStyle = HAIR_STYLES[Math.floor(seeded(seed + 14) * HAIR_STYLES.length)]

  return (
    <group position={[x, 0, z]} scale={scale} rotation={[0, seeded(seed) * 0.35 - 0.18, 0]}>
      <mesh position={[-0.07, 0.28, 0.02]} rotation={[0.08, 0, 0.04]}>
        <capsuleGeometry args={[0.05, 0.42, 4, 8]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
      <mesh position={[0.07, 0.28, 0.02]} rotation={[0.08, 0, -0.04]}>
        <capsuleGeometry args={[0.05, 0.42, 4, 8]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <capsuleGeometry args={[0.13, 0.38, 4, 8]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.72, -0.09]}>
        <boxGeometry args={[0.32, 0.52, 0.08]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.86, 0.06]}>
        <boxGeometry args={[0.16, 0.14, 0.04]} />
        <meshStandardMaterial color="#f4f0e8" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.78, 0.08]}>
        <boxGeometry args={[0.035, 0.18, 0.02]} />
        <meshStandardMaterial color={house.color} roughness={0.5} />
      </mesh>
      <group position={[0, 1.12, 0.02]}>
        <mesh>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        <Face skin={skin} />
        <Hair style={hairStyle} color={hair} />
      </group>
    </group>
  )
}

function FloatingCandle({
  position,
  index,
}: {
  position: [number, number, number]
  index: number
}) {
  const group = useRef<Group>(null)
  const flame = useRef<MeshStandardMaterial>(null)
  const phase = index * 0.73

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.position.x = position[0] + Math.sin(t * 0.52 + phase) * 0.09
      group.current.position.y = position[1] + Math.sin(t * 0.67 + phase * 1.3) * 0.14
      group.current.position.z = position[2] + Math.cos(t * 0.41 + phase * 0.8) * 0.07
      group.current.rotation.z = Math.sin(t * 0.58 + phase) * 0.08
      group.current.rotation.x = Math.cos(t * 0.47 + phase * 1.1) * 0.05
    }
    if (flame.current) {
      flame.current.emissiveIntensity =
        1.55 +
        Math.sin(t * 6.4 + phase) * 0.28 +
        Math.sin(t * 13.1 + phase * 2.2) * 0.12
    }
  })

  return (
    <group ref={group} position={position}>
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

function Chandelier({
  position,
  scale = 1,
  seed = 0,
}: {
  position: [number, number, number]
  scale?: number
  seed?: number
}) {
  const group = useRef<Group>(null)
  const glow = useRef<MeshStandardMaterial>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.18 + seed) * 0.05
    }
    if (glow.current) {
      glow.current.emissiveIntensity =
        1.25 +
        Math.sin(t * 4.7 + seed) * 0.2 +
        Math.sin(t * 11.4 + seed * 1.7) * 0.1
    }
  })

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 3.1, 6]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.86} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.18, 0.07, 8, 28]} />
        <meshStandardMaterial
          ref={glow}
          color="#c9a227"
          emissive="#e8c56a"
          emissiveIntensity={1.35}
          metalness={0.35}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2 + seed
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 1.18, -0.18, Math.sin(angle) * 1.18]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#ffe7a0"
              emissive="#ffbf4a"
              emissiveIntensity={1.7}
              toneMapped={false}
            />
          </mesh>
        )
      })}
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
            color="#f6e0b0"
            transparent
            opacity={0.16}
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
  const floorMap = useMemo(() => makeFloorTexture(), [])
  const glassMap = useMemo(() => makeArchGlassTexture(), [])
  const stone = useMemo(
    () =>
      new MeshStandardMaterial({
        color: STONE,
        map: stoneMap,
        roughness: 0.92,
      }),
    [stoneMap],
  )
  const floor = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#d2c09a',
        map: floorMap,
        roughness: 0.82,
      }),
    [floorMap],
  )

  const candles = useMemo(() => {
    const count = mobile ? 48 : 96
    return Array.from({ length: count }, (_, index) => {
      const x = (seeded(index + 1) - 0.5) * 15.5
      const z = (seeded(index + 21) - 0.48) * 26 - 1.5
      const y = 5.1 + seeded(index + 44) * 5.8
      return [x, y, z] as [number, number, number]
    })
  }, [mobile])

  useEffect(() => {
    return () => {
      stone.dispose()
      floor.dispose()
      stoneMap?.dispose()
      floorMap?.dispose()
      glassMap?.dispose()
    }
  }, [stone, floor, stoneMap, floorMap, glassMap])

  useFrame((state) => {
    const t = journeyState.interior
    const time = state.clock.elapsedTime
    if (group.current) group.current.visible = t > 0.04
    if (ambient.current) {
      ambient.current.intensity = 0.68 * t
      ambient.current.color.copy(warmAmbient)
    }
    if (windowLight.current) {
      windowLight.current.intensity =
        20 * t * (1 + Math.sin(time * 0.7) * 0.04)
      windowLight.current.color.copy(warmWindow)
    }
    if (hallFill.current) {
      hallFill.current.intensity = 9.2 * t
      hallFill.current.color.copy(warmFill)
    }
    if (candleA.current) {
      candleA.current.intensity =
        4.2 * t * (1 + Math.sin(time * 3.35) * 0.1 + Math.sin(time * 8.1) * 0.05)
    }
    if (candleB.current) {
      candleB.current.intensity =
        3.6 * t * (1 + Math.sin(time * 4.4 + 1.2) * 0.12 + Math.sin(time * 9.6) * 0.04)
    }
  })

  const windowZs = [-14, -8, -2, 4, 10]

  return (
    <group
      ref={group}
      position={[HEART.x, HEART.y + HALL_Y, HEART.z]}
      scale={HALL_SCALE}
      visible={false}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -4]} receiveShadow material={floor}>
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

      <mesh position={[-10.88, 1.2, -4]}>
        <boxGeometry args={[0.18, 2.4, 39]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.86} />
      </mesh>
      <mesh position={[10.88, 1.2, -4]}>
        <boxGeometry args={[0.18, 2.4, 39]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.2, -23.22]}>
        <boxGeometry args={[22.2, 2.4, 0.16]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.86} />
      </mesh>

      {[-16, -10, -4, 2, 8, 14].map((z) => (
        <Beam key={z} z={z} />
      ))}

      {[-14, -8, -2, 4, 10].map((z) => (
        <group key={`pillar-${z}`}>
          <Pillar x={-9.55} z={z} />
          <Pillar x={9.55} z={z} />
        </group>
      ))}

      {windowZs.map((z) => (
        <group key={z}>
          <SideWindow z={z} x={-11} />
          <SideWindow z={z} x={11} />
        </group>
      ))}

      <mesh position={[0, 6.55, -23.18]}>
        <planeGeometry args={[9.6, 12.4]} />
        <meshStandardMaterial
          map={glassMap}
          emissive="#ffffff"
          emissiveMap={glassMap}
          emissiveIntensity={0.62}
          roughness={0.32}
          toneMapped={false}
        />
      </mesh>

      {TABLES.map((table, index) => (
        <LongTable
          key={table.banner.name}
          x={table.x}
          z={table.z}
          yaw={table.yaw}
          length={table.length}
          banner={table.banner}
          mobile={mobile}
          tableSeed={index + 1}
        />
      ))}

      <HousePath />
      <Fireplace />

      {[-11, -5, 1, 7, 13].map((z) => (
        <group key={`sconce-${z}`}>
          <WallSconce x={-10.85} z={z} />
          <WallSconce x={10.85} z={z} />
        </group>
      ))}

      {[
        [-1.85, -14.8],
        [-1.15, -15.6],
        [1.2, -15.4],
        [1.85, -14.6],
        [-1.7, -16.4],
        [1.65, -16.2],
        [-1.05, -13.9],
        [1.1, -14.1],
      ].map(([x, z], index) => (
        <StandingStudent key={`stand-${index}`} x={x} z={z} seed={index * 17 + 4} />
      ))}

      {candles.map((position, index) => (
        <FloatingCandle key={index} position={position} index={index} />
      ))}

      {HOUSES.map((house, index) => (
        <mesh
          key={`wall-banner-${house.name}`}
          position={[-5.1 + index * 3.4, 3.55, -23.22]}
          onClick={(event) => {
            event.stopPropagation()
            selectHouse(house.id)
          }}
          onPointerOver={(event) => {
            event.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
          }}
        >
          <planeGeometry args={[2.35, 4.1]} />
          <meshStandardMaterial
            color={house.color}
            roughness={0.72}
            side={DoubleSide}
          />
        </mesh>
      ))}

      <Chandelier position={[-4.1, 9.35, 2.4]} scale={1.05} seed={0.6} />
      <Chandelier position={[0.2, 9.8, -5.4]} scale={1.14} seed={1.1} />
      <Chandelier position={[5.35, 8.7, -9.2]} scale={1.12} seed={1.8} />

      <CeilingMist />
      <Sparkles
        count={mobile ? 28 : 70}
        scale={[5.5, 8, 16]}
        position={[0.4, 5.2, -14]}
        size={1.15}
        speed={0.12}
        opacity={0.28}
        color="#f4e6c1"
        noise={0.8}
      />

      <group position={[0, 12.35, -22.82]}>
        <mesh>
          <planeGeometry args={[8.6, 1.15]} />
          <meshBasicMaterial
            color="#120e0a"
            transparent
            opacity={0.58}
            depthWrite={false}
          />
        </mesh>
        <Text
          position={[0, 0, 0.04]}
          fontSize={0.36}
          color="#f4e6c1"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.16}
          outlineWidth={0.01}
          outlineColor="#1a120c"
        >
          HOLLOW ACADEMY
        </Text>
      </group>

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
        position={[-4.1, 8.4, 2.4]}
      />
      <pointLight
        ref={candleB}
        color="#ffd27a"
        intensity={0}
        distance={22}
        position={[5.35, 8.1, -9.2]}
      />
    </group>
  )
}
