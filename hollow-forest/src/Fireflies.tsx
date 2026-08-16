import { Sparkles } from '@react-three/drei'
import { useQuality } from './quality'
import { SPARKLE_COLOR } from './theme'

export function Fireflies() {
  const { pathSparkles, forestSparkles } = useQuality()

  return (
    <group>
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
