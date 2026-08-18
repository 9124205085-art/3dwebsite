export const ACADEMY_ROBE = '#141418'
export const ACADEMY_SHIRT = '#f4f0e8'
export const ACADEMY_TIE = '#3a1418'

export type HairStyle = 'short' | 'pony' | 'bun' | 'side' | 'long'

export function Face({ skin }: { skin: string }) {
  return (
    <group>
      <mesh position={[-0.03, 0.026, 0.08]} rotation={[0, 0, 0.14]}>
        <boxGeometry args={[0.032, 0.007, 0.01]} />
        <meshStandardMaterial color="#1c1410" roughness={0.7} />
      </mesh>
      <mesh position={[0.03, 0.026, 0.08]} rotation={[0, 0, -0.14]}>
        <boxGeometry args={[0.032, 0.007, 0.01]} />
        <meshStandardMaterial color="#1c1410" roughness={0.7} />
      </mesh>
      <mesh position={[-0.03, 0.008, 0.084]}>
        <sphereGeometry args={[0.016, 10, 10]} />
        <meshStandardMaterial color="#f7f4ee" roughness={0.28} />
      </mesh>
      <mesh position={[0.03, 0.008, 0.084]}>
        <sphereGeometry args={[0.016, 10, 10]} />
        <meshStandardMaterial color="#f7f4ee" roughness={0.28} />
      </mesh>
      <mesh position={[-0.03, 0.008, 0.097]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#1a120c" roughness={0.35} />
      </mesh>
      <mesh position={[0.03, 0.008, 0.097]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#1a120c" roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.006, 0.092]}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.48} />
      </mesh>
      <mesh position={[0, -0.03, 0.086]}>
        <boxGeometry args={[0.03, 0.008, 0.01]} />
        <meshStandardMaterial color="#7a3a42" roughness={0.55} />
      </mesh>
    </group>
  )
}

function HairMat({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.58} />
}

export function Hair({ style, color }: { style: HairStyle; color: string }) {
  if (style === 'pony') {
    return (
      <group>
        <mesh position={[0, 0.055, -0.04]} scale={[1.16, 0.58, 1.12]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <HairMat color={color} />
        </mesh>
        <mesh position={[0, 0.02, -0.1]} scale={[1.05, 0.7, 0.7]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <HairMat color={color} />
        </mesh>
        <mesh position={[0, -0.08, -0.12]} rotation={[0.85, 0, 0]}>
          <capsuleGeometry args={[0.032, 0.22, 6, 10]} />
          <HairMat color={color} />
        </mesh>
      </group>
    )
  }
  if (style === 'bun') {
    return (
      <group>
        <mesh position={[0, 0.052, -0.04]} scale={[1.14, 0.52, 1.12]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <HairMat color={color} />
        </mesh>
        <mesh position={[0, 0.13, -0.04]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <HairMat color={color} />
        </mesh>
      </group>
    )
  }
  if (style === 'long') {
    return (
      <group>
        <mesh position={[0, 0.055, -0.04]} scale={[1.18, 0.66, 1.14]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <HairMat color={color} />
        </mesh>
        <mesh position={[0, -0.04, -0.1]} rotation={[0.35, 0, 0]}>
          <capsuleGeometry args={[0.07, 0.22, 6, 10]} />
          <HairMat color={color} />
        </mesh>
      </group>
    )
  }
  if (style === 'side') {
    return (
      <group>
        <mesh position={[0.02, 0.055, -0.03]} scale={[1.2, 0.55, 1.1]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <HairMat color={color} />
        </mesh>
        <mesh position={[0.08, 0.01, 0.02]} rotation={[0.2, 0, -0.4]}>
          <capsuleGeometry args={[0.03, 0.14, 6, 8]} />
          <HairMat color={color} />
        </mesh>
      </group>
    )
  }
  return (
    <group>
      <mesh position={[0, 0.055, -0.04]} scale={[1.14, 0.5, 1.12]}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <HairMat color={color} />
      </mesh>
      <mesh position={[0, 0.02, -0.07]} scale={[1, 0.55, 0.72]}>
        <sphereGeometry args={[0.078, 12, 12]} />
        <HairMat color={color} />
      </mesh>
    </group>
  )
}

export function AcademyRobe({
  tie = ACADEMY_TIE,
  seated = false,
}: {
  tie?: string
  seated?: boolean
}) {
  if (seated) {
    return (
      <group>
        <mesh position={[0, 0.08, 0.1]} rotation={[1.12, 0, 0]}>
          <capsuleGeometry args={[0.055, 0.2, 4, 8]} />
          <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <capsuleGeometry args={[0.12, 0.28, 4, 8]} />
          <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
        </mesh>
        <mesh position={[0, 0.32, -0.09]}>
          <boxGeometry args={[0.3, 0.42, 0.08]} />
          <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.44, 0.06]}>
          <boxGeometry args={[0.16, 0.12, 0.04]} />
          <meshStandardMaterial color={ACADEMY_SHIRT} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.38, 0.08]}>
          <boxGeometry args={[0.035, 0.16, 0.02]} />
          <meshStandardMaterial color={tie} roughness={0.5} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh position={[0, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.14, 0.38, 8, 14]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.12, -0.1]}>
        <boxGeometry args={[0.34, 0.55, 0.1]} />
        <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.34, 0.06]}>
        <boxGeometry args={[0.16, 0.12, 0.04]} />
        <meshStandardMaterial color={ACADEMY_SHIRT} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.26, 0.08]}>
        <boxGeometry args={[0.035, 0.16, 0.02]} />
        <meshStandardMaterial color={tie} roughness={0.5} />
      </mesh>
    </group>
  )
}
