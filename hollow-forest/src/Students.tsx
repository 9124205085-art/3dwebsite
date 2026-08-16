import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { HEART, journeyState } from './theme'

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f97316', '#06b6d4']

function Student({
  color,
  lane,
  delay,
}: {
  color: string
  lane: number
  delay: number
}) {
  const group = useRef<Group>(null)

  useFrame((state) => {
    const t = Math.max(0, journeyState.students - delay)
    if (!group.current) return
    const walk = Math.min(1, t)
    const startZ = journeyState.busZ - 1.8
    const endZ = HEART.z + 4.8
    const z = MathUtils.lerp(startZ, endZ, walk)
    const y = MathUtils.lerp(0.42, 3.55, walk)
    const bob =
      Math.sin(state.clock.elapsedTime * 9 + delay * 12) *
      0.045 *
      (walk > 0.02 && walk < 0.98 ? 1 : 0)
    group.current.position.set(lane, y + bob, z)
    group.current.visible = t > 0 && journeyState.interior < 0.72
  })

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, 0.38, 0]}>
        <capsuleGeometry args={[0.12, 0.28, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshStandardMaterial color="#f1c27d" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.18, 0.04]}>
        <boxGeometry args={[0.22, 0.16, 0.12]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function Students() {
  return (
    <group>
      {COLORS.map((color, index) => (
        <Student
          key={color}
          color={color}
          lane={(index - 2.5) * 0.26}
          delay={index * 0.09}
        />
      ))}
    </group>
  )
}
