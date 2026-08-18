import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CanvasTexture,
  DoubleSide,
  Group,
  MathUtils,
  MeshStandardMaterial,
  SRGBColorSpace,
} from 'three'
import { HOUSE_CYCLE, HOUSES } from './theme'

const WOOD = '#4a3424'
const WOOD_DARK = '#2c1d14'

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  let cursor = y
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth) {
      ctx.fillText(line, x, cursor)
      line = word
      cursor += lineHeight
    } else {
      line = next
    }
  }
  if (line) ctx.fillText(line, x, cursor)
}

function drawPennant(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = '#4a3424'
  ctx.fillRect(-3, -4, 8, 92)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(5, 4)
  ctx.lineTo(88, 22)
  ctx.lineTo(5, 40)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(40, 24, 12, 0.45)'
  ctx.stroke()
  ctx.restore()
}

export function makeParchmentTexture(house: (typeof HOUSES)[number]) {
  const width = 512
  const height = 768
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, width, height)
  const ragged = new Path2D()
  ragged.moveTo(28, 36)
  for (let x = 28; x <= 484; x += 18) {
    ragged.lineTo(x, 22 + Math.sin(x * 0.17) * 8 + (seeded(x + 2) - 0.5) * 10)
  }
  ragged.lineTo(490, 36)
  for (let y = 36; y <= 732; y += 16) {
    ragged.lineTo(498 + Math.sin(y * 0.13) * 7 + (seeded(y + 9) - 0.5) * 8, y)
  }
  ragged.lineTo(484, 748)
  for (let x = 484; x >= 28; x -= 18) {
    ragged.lineTo(x, 746 + Math.sin(x * 0.2) * 8 + (seeded(x + 14) - 0.5) * 10)
  }
  ragged.lineTo(22, 732)
  for (let y = 732; y >= 36; y -= 16) {
    ragged.lineTo(16 + Math.sin(y * 0.11) * 7 + (seeded(y + 21) - 0.5) * 8, y)
  }
  ragged.closePath()
  ctx.fillStyle = '#d8c49a'
  ctx.fill(ragged)
  ctx.save()
  ctx.clip(ragged)

  const stain = ctx.createLinearGradient(0, 0, 0, height)
  stain.addColorStop(0, '#ead7a8')
  stain.addColorStop(0.45, '#d7c08c')
  stain.addColorStop(1, '#c4a66d')
  ctx.fillStyle = stain
  ctx.fillRect(0, 0, width, height)

  for (let i = 0; i < 900; i++) {
    const shade = 140 + seeded(i + 4) * 70
    ctx.fillStyle = `rgba(${shade}, ${shade - 28}, ${shade - 62}, 0.08)`
    ctx.fillRect(seeded(i) * width, seeded(i + 8) * height, 6 + seeded(i + 3) * 18, 3)
  }
  ctx.fillStyle = 'rgba(90, 60, 28, 0.08)'
  ctx.beginPath()
  ctx.arc(120, 200, 90, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(400, 560, 110, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#4a3420'
  ctx.lineWidth = 3.2
  ctx.beginPath()
  ctx.moveTo(78, 168)
  ctx.quadraticCurveTo(256, 48, 434, 168)
  ctx.stroke()
  for (let i = 0; i <= 14; i++) {
    const t = i / 14
    const x = 78 + (434 - 78) * t
    const y = 168 - Math.sin(t * Math.PI) * 120
    ctx.beginPath()
    ctx.arc(x, y - 6, 3.2, 0, Math.PI * 2)
    ctx.fillStyle = '#3d2a16'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (t < 0.5 ? -10 : 10), y + 12)
    ctx.strokeStyle = '#3d2a16'
    ctx.lineWidth = 1.6
    ctx.stroke()
  }

  ctx.fillStyle = '#3a2414'
  ctx.textAlign = 'center'
  ctx.font = "italic 42px 'Segoe Script', 'Lucida Handwriting', Georgia, serif"
  ctx.fillText(`House of ${house.name}`, width / 2, 214)
  ctx.font = 'italic 22px Georgia, serif'
  ctx.fillStyle = '#5c3b22'
  ctx.fillText(house.motto, width / 2, 258)

  ctx.font = 'italic 22px Georgia, serif'
  ctx.fillStyle = '#2e2014'
  wrapLines(ctx, house.text, width / 2, 318, 360, 32)

  drawPennant(ctx, 168, 548, -0.55, house.color)
  drawPennant(ctx, 344, 548, 0.55, house.color)

  ctx.font = 'italic 18px Georgia, serif'
  ctx.fillStyle = '#4a3420'
  ctx.fillText('Hollow Academy', width / 2, 700)
  ctx.font = '16px Georgia, serif'
  ctx.fillText('Anno 1209  ·  scroll for the next house', width / 2, 726)

  ctx.restore()
  ctx.strokeStyle = 'rgba(70, 48, 24, 0.35)'
  ctx.lineWidth = 2
  ctx.stroke(ragged)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function ParchmentFace({
  map,
  materialRef,
}: {
  map: CanvasTexture | null
  materialRef: { current: MeshStandardMaterial | null }
}) {
  return (
    <mesh>
      <planeGeometry args={[1.48, 2.18]} />
      <meshStandardMaterial
        ref={materialRef}
        map={map ?? undefined}
        transparent
        roughness={0.9}
        metalness={0}
        side={DoubleSide}
      />
    </mesh>
  )
}

export function ParchmentStand() {
  const spin = useRef<Group>(null)
  const index = useRef(0)
  const targetYaw = useRef(0)
  const flipping = useRef(false)
  const hovered = useRef(false)
  const frontMat = useRef<MeshStandardMaterial>(null)
  const backMat = useRef<MeshStandardMaterial>(null)

  const maps = useMemo(
    () => HOUSE_CYCLE.map((house) => makeParchmentTexture(house)),
    [],
  )

  useEffect(() => {
    return () => {
      maps.forEach((map) => map?.dispose())
    }
  }, [maps])

  useFrame((_, delta) => {
    if (!spin.current) return
    const yaw = MathUtils.damp(
      spin.current.rotation.y,
      targetYaw.current,
      7.5,
      delta,
    )
    spin.current.rotation.y = yaw
    if (Math.abs(yaw - targetYaw.current) < 0.012) {
      spin.current.rotation.y = targetYaw.current
      flipping.current = false
    }
    const scale = hovered.current ? 1.035 : 1
    spin.current.scale.setScalar(scale)
  })

  const showNext = () => {
    if (flipping.current) return
    flipping.current = true
    const next = (index.current + 1) % HOUSE_CYCLE.length
    if (index.current % 2 === 0) {
      if (backMat.current) {
        backMat.current.map = maps[next]
        backMat.current.needsUpdate = true
      }
    } else if (frontMat.current) {
      frontMat.current.map = maps[next]
      frontMat.current.needsUpdate = true
    }
    index.current = next
    targetYaw.current += Math.PI
  }

  return (
    <group position={[0, 0, 4.7]}>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.14, 1.44, 0.14]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[0.82, 0.08, 0.18]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>
      <group
        ref={spin}
        position={[0, 1.78, 0]}
        onClick={(event) => {
          event.stopPropagation()
          showNext()
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          hovered.current = true
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          hovered.current = false
          document.body.style.cursor = 'auto'
        }}
      >
        <group position={[0, 0, 0.045]}>
          <ParchmentFace map={maps[0]} materialRef={frontMat} />
        </group>
        <group position={[0, 0, -0.045]} rotation={[0, Math.PI, 0]}>
          <ParchmentFace map={maps[1]} materialRef={backMat} />
        </group>
      </group>
    </group>
  )
}
