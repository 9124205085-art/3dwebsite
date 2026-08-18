import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { HEART, journeyState, scrollState, smoothstep } from './theme'

export const CAMERA_START = { x: 0, y: 5.5, z: 28 } as const

const START_Z = CAMERA_START.z
const END_Z = -18
const BASE_Y = CAMERA_START.y
const LOOK_AHEAD = 14
const ORBIT_RADIUS = 26
const ORBIT_HEIGHT = 9.5

const PARALLAX_X = 0.7
const PARALLAX_Y = 0.28
const LOOK_PARALLAX = 0.18

const POSITION_LERP = 3.2
const LOOK_LERP = 3.8

export function CameraRig() {
  const scroll = useScroll()
  const desiredPosition = useRef(
    new Vector3(CAMERA_START.x, CAMERA_START.y, CAMERA_START.z),
  )
  const desiredLook = useRef(new Vector3(0, 1.8, START_Z - LOOK_AHEAD))
  const lookTarget = useRef(new Vector3(0, 1.8, START_Z - LOOK_AHEAD))
  const pathPos = useRef(new Vector3())
  const orbitPos = useRef(new Vector3())
  const insidePos = useRef(new Vector3())
  const insideLook = useRef(new Vector3())
  const arrivalPos = useRef(new Vector3())
  const arrivalLook = useRef(new Vector3())
  const explorePos = useRef(new Vector3())
  const exploreLook = useRef(new Vector3())

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (journeyState.interior < 0.72) return
      const step = event.deltaY * 0.00105
      if (step > 0) {
        if (journeyState.feast < 1) {
          journeyState.feast = MathUtils.clamp(journeyState.feast + step, 0, 1)
        } else {
          journeyState.whiteout = MathUtils.clamp(
            journeyState.whiteout + step * 1.15,
            0,
            1,
          )
        }
      } else {
        if (journeyState.whiteout > 0) {
          journeyState.whiteout = MathUtils.clamp(
            journeyState.whiteout + step * 1.15,
            0,
            1,
          )
        } else {
          journeyState.feast = MathUtils.clamp(journeyState.feast + step, 0, 1)
        }
      }
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  useFrame((state, delta) => {
    const offset = scroll.offset
    scrollState.offset = offset
    const interior = journeyState.interior

    const z = MathUtils.lerp(START_Z, END_Z, offset)
    const endBlend = smoothstep(0.68, 0.92, offset)
    const explore = smoothstep(0.86, 1, offset) * (1 - interior) * 0.15
    const parallaxFade = 1 - endBlend * 0.55

    const parallaxX = state.pointer.x * PARALLAX_X * parallaxFade
    const parallaxY = state.pointer.y * PARALLAX_Y * parallaxFade

    pathPos.current.set(
      parallaxX,
      BASE_Y + parallaxY + endBlend * 2.2,
      z,
    )

    const orbitYaw = state.pointer.x * Math.PI
    const lift = MathUtils.clamp(state.pointer.y, -0.85, 1)
    orbitPos.current.set(
      HEART.x + Math.sin(orbitYaw) * ORBIT_RADIUS,
      ORBIT_HEIGHT + lift * 7,
      HEART.z + Math.cos(orbitYaw) * ORBIT_RADIUS,
    )

    desiredPosition.current.lerpVectors(pathPos.current, orbitPos.current, explore)
    desiredLook.current.set(
      MathUtils.lerp(parallaxX * LOOK_PARALLAX, HEART.x, endBlend),
      MathUtils.lerp(1.8 + parallaxY * 0.12, 2.4, endBlend),
      MathUtils.lerp(z - LOOK_AHEAD, HEART.z + 6.5, endBlend),
    )

    const arrival = smoothstep(0.7, 0.93, offset) * (1 - interior)
    arrivalPos.current.set(
      state.pointer.x * 1.4,
      4.5 + state.pointer.y * 0.7,
      HEART.z + 16.8,
    )
    arrivalLook.current.set(0, 1.65, HEART.z + 6.2)
    desiredPosition.current.lerp(arrivalPos.current, arrival)
    desiredLook.current.lerp(arrivalLook.current, arrival)

    insidePos.current.set(0, 4.7, HEART.z + 11.8)
    insideLook.current.set(0, 5.4, HEART.z - 18)

    desiredPosition.current.lerp(insidePos.current, interior)
    desiredLook.current.lerp(insideLook.current, interior)

    const free = smoothstep(0.7, 1, interior)
    if (free > 0.01) {
      const lookYaw = state.pointer.x * 0.55
      const lookPitch = MathUtils.clamp(state.pointer.y, -0.45, 0.45) * 0.28
      explorePos.current.set(0, 4.72, HEART.z + 11.7)
      exploreLook.current.set(
        Math.sin(lookYaw) * 3.2,
        5.35 + Math.sin(lookPitch) * 2.4,
        HEART.z + 2.2,
      )
      desiredPosition.current.lerp(explorePos.current, free)
      desiredLook.current.lerp(exploreLook.current, free)
    }

    const tPos = 1 - Math.exp(-(POSITION_LERP + free * 5.5) * delta)
    const tLook = 1 - Math.exp(-(LOOK_LERP + free * 6) * delta)

    state.camera.position.lerp(desiredPosition.current, tPos)
    lookTarget.current.lerp(desiredLook.current, tLook)
    state.camera.lookAt(lookTarget.current)
  })

  return null
}
