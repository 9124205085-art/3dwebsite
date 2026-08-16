import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshStandardMaterial } from 'three'
import { ACCENT_COLOR } from './theme'

export type RuneAnchor = {
  position: [number, number, number]
  scale: number
  rotationY: number
}

const PULSE_SPEED = 1.45
const PULSE_MIN = 0.45
const PULSE_MAX = 1.35

export function GlowingRunes({ anchors }: { anchors: RuneAnchor[] }) {
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: ACCENT_COLOR,
        emissive: ACCENT_COLOR,
        emissiveIntensity: 0.9,
        roughness: 0.35,
        metalness: 0.05,
        toneMapped: false,
      }),
    [],
  )
  const materialRef = useRef(material)
  materialRef.current = material

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  useFrame((state) => {
    const wave = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * PULSE_SPEED)
    materialRef.current.emissiveIntensity =
      PULSE_MIN + (PULSE_MAX - PULSE_MIN) * wave
  })

  return (
    <group>
      {anchors.map((anchor, index) => {
        const faceInward = anchor.position[0] >= 0 ? -1 : 1
        const glyphX = faceInward * 0.22

        return (
          <group key={index} position={anchor.position} scale={anchor.scale}>
            <mesh
              position={[0, 0.82, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              material={material}
            >
              <torusGeometry args={[0.2, 0.028, 5, 8]} />
            </mesh>
            <mesh
              position={[glyphX, 1.18, 0]}
              rotation={[0, faceInward > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
              material={material}
            >
              <ringGeometry args={[0.07, 0.13, 6]} />
            </mesh>
            <mesh
              position={[glyphX, 1.18, 0]}
              rotation={[0, faceInward > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
              material={material}
            >
              <circleGeometry args={[0.035, 6]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
