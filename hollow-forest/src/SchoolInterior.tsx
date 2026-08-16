import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group, PointLight, AmbientLight } from 'three'
import { HEART, journeyState } from './theme'

const STEP_COLORS = [
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
]

function Step({ index, color }: { index: number; color: string }) {
  const y = 0.18 + index * 0.42
  const z = -1.1 - index * 0.68
  const width = 4.4 - index * 0.06
  return (
    <mesh position={[0, y, z]} receiveShadow>
      <boxGeometry args={[width, 0.38, 0.74]} />
      <meshStandardMaterial color={color} roughness={0.42} />
    </mesh>
  )
}

export function SchoolInterior() {
  const group = useRef<Group>(null)
  const warm = useRef<PointLight>(null)
  const left = useRef<PointLight>(null)
  const right = useRef<PointLight>(null)
  const ambient = useRef<AmbientLight>(null)
  const [showSite, setShowSite] = useState(false)

  useFrame(() => {
    const t = journeyState.interior
    if (group.current) group.current.visible = t > 0.04
    if (warm.current) warm.current.intensity = 11 * t
    if (left.current) left.current.intensity = 5.5 * t
    if (right.current) right.current.intensity = 5.5 * t
    if (ambient.current) ambient.current.intensity = 1.05 * t
    if (t > 0.32 && !showSite) setShowSite(true)
    if (t < 0.18 && showSite) setShowSite(false)
  })

  return (
    <group ref={group} position={[HEART.x, HEART.y + 3.4, HEART.z + 3.2]} visible={false}>
      <mesh position={[0, 0.06, -3]} receiveShadow>
        <boxGeometry args={[15.5, 0.14, 18]} />
        <meshStandardMaterial color="#fff7ed" roughness={0.82} />
      </mesh>
      <mesh position={[0, 5.1, -12]} receiveShadow>
        <boxGeometry args={[15.5, 10.2, 0.28]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.68} />
      </mesh>
      <mesh position={[-7.7, 5.1, -3]}>
        <boxGeometry args={[0.28, 10.2, 18]} />
        <meshStandardMaterial color="#fecaca" roughness={0.68} />
      </mesh>
      <mesh position={[7.7, 5.1, -3]}>
        <boxGeometry args={[0.28, 10.2, 18]} />
        <meshStandardMaterial color="#a5f3fc" roughness={0.68} />
      </mesh>
      <mesh position={[0, 10.2, -3]}>
        <boxGeometry args={[15.5, 0.22, 18]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.75} />
      </mesh>

      <group position={[0, 0.15, 1.4]}>
        {STEP_COLORS.map((color, index) => (
          <Step key={color} index={index} color={color} />
        ))}
      </group>

      <mesh position={[-2.4, 0.2, 2.8]}>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[2.4, 0.2, 2.8]}>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>

      {showSite && (
        <Html
          position={[0, 4.6, -11.7]}
          transform
          occlude={false}
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              width: 420,
              padding: '28px 32px',
              borderRadius: 18,
              background: 'linear-gradient(180deg, #fff7ed 0%, #ffe4e6 100%)',
              color: '#1f2937',
              fontFamily: 'Georgia, serif',
              boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                letterSpacing: '0.28em',
                fontSize: 11,
                textTransform: 'uppercase',
                color: '#b45309',
              }}
            >
              Welcome inside
            </p>
            <h2
              style={{
                margin: '10px 0 8px',
                fontSize: 28,
                letterSpacing: '0.12em',
              }}
            >
              HOLLOW ACADEMY
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#4b5563' }}>
              The stairs are the website. Keep climbing.
            </p>
            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'center',
                marginTop: 18,
              }}
            >
              {['Home', 'Classes', 'Library'].map((label) => (
                <span
                  key={label}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: '#111827',
                    color: '#fde68a',
                    fontSize: 12,
                    letterSpacing: '0.08em',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </Html>
      )}

      <ambientLight ref={ambient} intensity={0} color="#fff4e5" />
      <pointLight
        ref={warm}
        color="#fff1c2"
        intensity={0}
        distance={32}
        position={[0, 7.5, -2]}
      />
      <pointLight
        ref={left}
        color="#fb923c"
        intensity={0}
        distance={20}
        position={[-4, 5, -5]}
      />
      <pointLight
        ref={right}
        color="#38bdf8"
        intensity={0}
        distance={20}
        position={[4, 5, -5]}
      />
    </group>
  )
}
