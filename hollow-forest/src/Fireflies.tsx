import { Sparkles } from '@react-three/drei'

export const ACCENT_COLOR = '#4dffc3'

export function Fireflies() {
  return (
    <group>
      <Sparkles
        count={160}
        scale={[8, 5.5, 62]}
        position={[0, 3.1, 2]}
        size={3.8}
        speed={0.32}
        opacity={1}
        color={ACCENT_COLOR}
        noise={0.35}
      />
      <Sparkles
        count={80}
        scale={[46, 9, 68]}
        position={[0, 3.8, 0]}
        size={2.2}
        speed={0.18}
        opacity={0.7}
        color={ACCENT_COLOR}
        noise={0.5}
      />
    </group>
  )
}
