import { Text } from '@react-three/drei'
import { HEART } from './theme'

function SchoolSign() {
  return (
    <group position={[2.45, 0, HEART.z + 13]}>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.12, 2.3, 0.12]} />
        <meshStandardMaterial color="#4b3a24" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.45, 0.08]}>
        <boxGeometry args={[1.85, 0.72, 0.08]} />
        <meshStandardMaterial color="#f0c400" roughness={0.4} />
      </mesh>
      <Text
        position={[0, 2.45, 0.14]}
        fontSize={0.28}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        SCHOOL
      </Text>
    </group>
  )
}

function ApproachStairs() {
  return (
    <group>
      {Array.from({ length: 12 }, (_, index) => {
        const z = HEART.z + 12.4 - index * 0.62
        const y = 0.14 + index * 0.28
        return (
          <mesh key={index} position={[0, y, z]} receiveShadow>
            <boxGeometry args={[3.3, 0.28, 0.68]} />
            <meshStandardMaterial color="#3a3f48" roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Road() {
  const startZ = 30
  const endZ = HEART.z + 13
  const length = startZ - endZ
  const centerZ = (startZ + endZ) / 2

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, centerZ]}
        receiveShadow
      >
        <planeGeometry args={[3.6, length]} />
        <meshStandardMaterial color="#2b2c2a" roughness={0.92} metalness={0.04} />
      </mesh>
      {Array.from({ length: 28 }, (_, index) => {
        const z = startZ - 2.2 - index * 2.2
        if (z < endZ + 1) return null
        return (
          <mesh
            key={index}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.05, z]}
          >
            <planeGeometry args={[0.12, 0.9]} />
            <meshStandardMaterial
              color="#c9a227"
              emissive="#c9a227"
              emissiveIntensity={0.12}
              roughness={0.6}
            />
          </mesh>
        )
      })}
      <SchoolSign />
      <ApproachStairs />
    </group>
  )
}
