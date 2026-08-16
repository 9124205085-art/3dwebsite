import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  AmbientLight,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  FogExp2,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PointLight,
  Vector3,
} from 'three'
import { CASTLE_SCALE, FOG_COLOR, HEART, stormState } from './theme'

const FLASH_COLOR = new Color('#dce8ff')
const FOG_BASE = new Color(FOG_COLOR)
const SKY_BASE = new Color('#070910')
const SKY_FLASH = new Color('#b7c8e6')

const STRIKE_TARGET = new Vector3(
  HEART.x + 0.45 * CASTLE_SCALE,
  18.5,
  HEART.z - 0.55 * CASTLE_SCALE,
)

function jaggedCurve(end: Vector3, sideways = 5.5) {
  const start = new Vector3(
    end.x + (Math.random() - 0.5) * 10,
    62,
    end.z + (Math.random() - 0.5) * 8,
  )
  const points: Vector3[] = []
  const segments = 12
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const point = start.clone().lerp(end, t)
    const scatter = (1 - t) * (1 - t)
    if (i > 0 && i < segments) {
      point.x += (Math.random() - 0.5) * sideways * scatter * 2.4
      point.z += (Math.random() - 0.5) * sideways * scatter * 1.6
    }
    points.push(point)
  }
  return new CatmullRomCurve3(points)
}

function branchCurve(parent: CatmullRomCurve3) {
  const origin = parent.getPoint(0.32 + Math.random() * 0.28)
  const end = origin.clone().add(
    new Vector3(
      (Math.random() - 0.5) * 10,
      -8 - Math.random() * 7,
      (Math.random() - 0.5) * 6,
    ),
  )
  return jaggedCurve(end, 3.2)
}

function boltMaterial(color: string, opacity: number) {
  return (
    <meshBasicMaterial
      color={color}
      transparent
      opacity={opacity}
      blending={AdditiveBlending}
      depthWrite={false}
      toneMapped={false}
      fog={false}
    />
  )
}

export function Storm() {
  const light = useRef<DirectionalLight>(null)
  const ambient = useRef<AmbientLight>(null)
  const hemi = useRef<HemisphereLight>(null)
  const impact = useRef<PointLight>(null)
  const group = useRef<Group>(null)
  const nextStrike = useRef(1.4)
  const secondBurst = useRef(false)
  const [boltId, setBoltId] = useState(0)
  const [mainCurve, setMainCurve] = useState(() => jaggedCurve(STRIKE_TARGET))
  const [sideCurve, setSideCurve] = useState(() => branchCurve(mainCurve))

  useFrame(({ scene }, delta) => {
    nextStrike.current -= delta

    if (nextStrike.current <= 0) {
      stormState.flash = secondBurst.current ? 0.8 : 1
      const next = jaggedCurve(STRIKE_TARGET)
      setMainCurve(next)
      setSideCurve(branchCurve(next))
      setBoltId((id) => id + 1)
      if (!secondBurst.current && Math.random() > 0.35) {
        secondBurst.current = true
        nextStrike.current = 0.09 + Math.random() * 0.07
      } else {
        secondBurst.current = false
        nextStrike.current = 2.6 + Math.random() * 4.5
      }
    }

    stormState.flash = Math.max(0, stormState.flash - delta * 2.6)
    const flash = stormState.flash

    if (light.current) {
      light.current.intensity = flash * 28
      light.current.position.set(
        STRIKE_TARGET.x + 8,
        40,
        STRIKE_TARGET.z + 12,
      )
    }
    if (impact.current) {
      impact.current.intensity = flash * 16
    }
    if (ambient.current) ambient.current.intensity = flash * 3.4
    if (hemi.current) hemi.current.intensity = flash * 2

    if (group.current) {
      group.current.visible = flash > 0.04
      group.current.traverse((child) => {
        if (child instanceof Mesh && child.material instanceof MeshBasicMaterial) {
          const base = child.userData.baseOpacity ?? 1
          child.material.opacity = base * Math.min(1, flash * 1.2)
        }
      })
    }

    const fog = scene.fog
    if (fog instanceof FogExp2) {
      fog.color.lerpColors(FOG_BASE, FLASH_COLOR, flash * 0.9)
    }
    if (scene.background instanceof Color) {
      scene.background.lerpColors(SKY_BASE, SKY_FLASH, flash * 0.75)
    }
  })

  return (
    <group>
      <ambientLight ref={ambient} color="#eef3ff" intensity={0} />
      <hemisphereLight
        ref={hemi}
        color="#dce6f5"
        groundColor="#3d433c"
        intensity={0}
      />
      <directionalLight ref={light} color="#eaf2ff" intensity={0} />
      <pointLight
        ref={impact}
        color="#f7fbff"
        intensity={0}
        distance={52}
        position={STRIKE_TARGET.toArray()}
      />

      <group ref={group} visible={false} renderOrder={20}>
        <mesh
          key={`core-${boltId}`}
          renderOrder={22}
          userData={{ baseOpacity: 1 }}
        >
          <tubeGeometry args={[mainCurve, 48, 0.18, 8, false]} />
          {boltMaterial('#ffffff', 1)}
        </mesh>
        <mesh
          key={`glow-${boltId}`}
          renderOrder={21}
          userData={{ baseOpacity: 0.5 }}
        >
          <tubeGeometry args={[mainCurve, 48, 0.78, 8, false]} />
          {boltMaterial('#cfe4ff', 0.5)}
        </mesh>
        <mesh
          key={`halo-${boltId}`}
          renderOrder={20}
          userData={{ baseOpacity: 0.2 }}
        >
          <tubeGeometry args={[mainCurve, 32, 1.7, 8, false]} />
          {boltMaterial('#8eb8ff', 0.2)}
        </mesh>
        <mesh
          key={`branch-${boltId}`}
          renderOrder={21}
          userData={{ baseOpacity: 0.75 }}
        >
          <tubeGeometry args={[sideCurve, 24, 0.1, 6, false]} />
          {boltMaterial('#eef6ff', 0.75)}
        </mesh>
        <mesh
          position={STRIKE_TARGET.toArray()}
          renderOrder={23}
          userData={{ baseOpacity: 0.9 }}
        >
          <sphereGeometry args={[1.25, 12, 12]} />
          {boltMaterial('#ffffff', 0.9)}
        </mesh>
        <mesh
          position={STRIKE_TARGET.toArray()}
          renderOrder={22}
          userData={{ baseOpacity: 0.3 }}
        >
          <sphereGeometry args={[3.1, 12, 12]} />
          {boltMaterial('#bcd4ff', 0.3)}
        </mesh>
      </group>
    </group>
  )
}
