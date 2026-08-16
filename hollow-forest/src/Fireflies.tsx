import { useRef } from 'react'
import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { useQuality } from './quality'
import { SPARKLE_COLOR, journeyState } from './theme'

export function Fireflies() {
  const { pathSparkles, forestSparkles } = useQuality()
  const group = useRef<Group>(null)

  useFrame(() => {
    if (group.current) group.current.visible = journeyState.interior < 0.2
  })

  return (
    <group ref={group}>
      <Sparkles
        count={pathSparkles}
        scale={[8, 5.5, 58]}
        position={[0, 3.1, 0]}
        size={4.2}
        speed={0.32}
        opacity={1}
        color={SPARKLE_COLOR}
        noise={0.35}
      />
      <Sparkles
        count={forestSparkles}
        scale={[46, 9, 64]}
        position={[0, 3.8, -6]}
        size={2.4}
        speed={0.18}
        opacity={0.85}
        color={SPARKLE_COLOR}
        noise={0.5}
      />
    </group>
  )
}
