import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import {
  ACADEMY_ROBE,
  ACADEMY_SHIRT,
  Face,
  Hair,
  type HairStyle,
} from './academyFigure'
import { HALL_Y, HEART, journeyState, smoothstep } from './theme'

type Seat = {
  x: number
  z: number
  lookX: number
  lookZ: number
}

type StudentLook = {
  skin: string
  hair: string
  tie: string
  hairStyle: HairStyle
  scale: number
  lane: number
  delay: number
  seat: Seat
}

const SEATS: Seat[] = [
  { x: -6.1, z: HEART.z - 3.8, lookX: -7.9, lookZ: HEART.z - 4.1 },
  { x: -1.1, z: HEART.z - 7.2, lookX: -2.6, lookZ: HEART.z - 7.4 },
  { x: 1.4, z: HEART.z - 4.9, lookX: 3.1, lookZ: HEART.z - 5.1 },
  { x: 6.2, z: HEART.z - 8.2, lookX: 8.1, lookZ: HEART.z - 8.4 },
  { x: -5.8, z: HEART.z - 6.4, lookX: -7.9, lookZ: HEART.z - 6.6 },
  { x: 5.9, z: HEART.z - 5.2, lookX: 8.1, lookZ: HEART.z - 5.4 },
]

const STUDENTS: StudentLook[] = [
  {
    skin: '#c58c5c',
    hair: '#1a120c',
    tie: '#7a1f1f',
    hairStyle: 'short',
    scale: 1.02,
    lane: -0.7,
    delay: 0,
    seat: SEATS[0],
  },
  {
    skin: '#8d5524',
    hair: '#140e0a',
    tie: '#1f5c38',
    hairStyle: 'pony',
    scale: 0.97,
    lane: -0.4,
    delay: 0.08,
    seat: SEATS[1],
  },
  {
    skin: '#d4a574',
    hair: '#c45c2a',
    tie: '#1a5f73',
    hairStyle: 'long',
    scale: 1.06,
    lane: -0.1,
    delay: 0.16,
    seat: SEATS[2],
  },
  {
    skin: '#6f4e37',
    hair: '#0d0d0d',
    tie: '#5b3d7a',
    hairStyle: 'bun',
    scale: 0.95,
    lane: 0.2,
    delay: 0.24,
    seat: SEATS[3],
  },
  {
    skin: '#e1b899',
    hair: '#e07098',
    tie: '#7a1f1f',
    hairStyle: 'side',
    scale: 1,
    lane: 0.48,
    delay: 0.32,
    seat: SEATS[4],
  },
  {
    skin: '#b0784a',
    hair: '#24160e',
    tie: '#1f5c38',
    hairStyle: 'pony',
    scale: 0.99,
    lane: 0.76,
    delay: 0.4,
    seat: SEATS[5],
  },
]

function StudentBody({
  look,
  movingRef,
}: {
  look: StudentLook
  movingRef: { current: boolean }
}) {
  const leftThigh = useRef<Group>(null)
  const rightThigh = useRef<Group>(null)
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)

  useFrame((state) => {
    const swing = movingRef.current
      ? Math.sin(state.clock.elapsedTime * 7.4 + look.delay * 12)
      : 0
    if (leftThigh.current) leftThigh.current.rotation.x = swing * 0.48
    if (rightThigh.current) rightThigh.current.rotation.x = -swing * 0.48
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.32
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.32
  })

  return (
    <group scale={look.scale}>
      <group ref={leftThigh} position={[-0.075, 0.92, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.048, 0.28, 6, 12]} />
          <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.48, 0.015]}>
          <capsuleGeometry args={[0.042, 0.26, 6, 12]} />
          <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.66, 0.04]}>
          <boxGeometry args={[0.09, 0.07, 0.18]} />
          <meshStandardMaterial color="#111111" roughness={0.48} />
        </mesh>
      </group>
      <group ref={rightThigh} position={[0.075, 0.92, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.048, 0.28, 6, 12]} />
          <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.48, 0.015]}>
          <capsuleGeometry args={[0.042, 0.26, 6, 12]} />
          <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.66, 0.04]}>
          <boxGeometry args={[0.09, 0.07, 0.18]} />
          <meshStandardMaterial color="#111111" roughness={0.48} />
        </mesh>
      </group>

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
        <meshStandardMaterial color={look.tie} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.08, 12]} />
        <meshStandardMaterial color={look.skin} roughness={0.42} metalness={0.02} />
      </mesh>

      <group ref={leftArm} position={[-0.175, 1.34, 0]}>
        <mesh position={[0, -0.18, 0]} rotation={[0, 0, 0.08]} castShadow>
          <capsuleGeometry args={[0.036, 0.3, 6, 10]} />
          <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.36, 0.01]}>
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshStandardMaterial color={look.skin} roughness={0.42} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.175, 1.34, 0]}>
        <mesh position={[0, -0.18, 0]} rotation={[0, 0, -0.08]} castShadow>
          <capsuleGeometry args={[0.036, 0.3, 6, 10]} />
          <meshStandardMaterial color={ACADEMY_ROBE} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.36, 0.01]}>
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshStandardMaterial color={look.skin} roughness={0.42} />
        </mesh>
      </group>

      <group position={[0, 1.58, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.092, 18, 18]} />
          <meshStandardMaterial color={look.skin} roughness={0.42} metalness={0.02} />
        </mesh>
        <mesh position={[-0.09, 0, 0]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color={look.skin} roughness={0.42} />
        </mesh>
        <mesh position={[0.09, 0, 0]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color={look.skin} roughness={0.42} />
        </mesh>
        <Face skin={look.skin} />
        <Hair style={look.hairStyle} color={look.hair} />
      </group>
    </group>
  )
}

function Student({ look }: { look: StudentLook }) {
  const group = useRef<Group>(null)
  const moving = useRef(false)

  useFrame((state) => {
    const appear = Math.max(0, journeyState.students - look.delay)
    if (!group.current) return
    group.current.visible = appear > 0

    const toGate = Math.min(1, appear)
    const toHall = journeyState.interior
    const startZ = journeyState.busZ - 1.9
    const gateZ = HEART.z + 9.2
    const seat = look.seat

    let x: number
    let y: number
    let z: number
    if (toHall < 0.06) {
      x = MathUtils.lerp(look.lane, look.lane * 0.35, toGate)
      y = MathUtils.lerp(0, HALL_Y, toGate)
      z = MathUtils.lerp(startZ, gateZ, toGate)
      group.current.rotation.y = Math.PI
      moving.current = toGate > 0.03 && toGate < 0.97
    } else {
      const u = toHall
      x = MathUtils.lerp(look.lane * 0.35, seat.x, u)
      y = HALL_Y
      z = MathUtils.lerp(gateZ, seat.z, u)
      const lookYaw = Math.atan2(seat.lookX - seat.x, seat.lookZ - seat.z)
      group.current.rotation.y = MathUtils.lerp(Math.PI, lookYaw, smoothstep(0.72, 1, u))
      moving.current = u > 0.06 && u < 0.9
    }

    const bob =
      Math.sin(state.clock.elapsedTime * 7.4 + look.delay * 12) *
      0.025 *
      (moving.current ? 1 : 0)
    group.current.position.set(x, y + bob, z)
  })

  return (
    <group ref={group} visible={false}>
      <StudentBody look={look} movingRef={moving} />
    </group>
  )
}

export function Students() {
  return (
    <group>
      {STUDENTS.map((look) => (
        <Student key={look.lane} look={look} />
      ))}
    </group>
  )
}
