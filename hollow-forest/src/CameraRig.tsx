import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { HEART, scrollState, smoothstep } from './theme'

export const CAMERA_START = { x: 0, y: 5.5, z: 28 } as const

const START_Z = CAMERA_START.z
const END_Z = -22
const BASE_Y = CAMERA_START.y
const LOOK_AHEAD = 14

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

  useFrame((state, delta) => {
    const offset = scroll.offset
    scrollState.offset = offset

    const z = MathUtils.lerp(START_Z, END_Z, offset)
    const endBlend = smoothstep(0.72, 0.96, offset)
    const parallaxFade = 1 - endBlend * 0.75

    const parallaxX = state.pointer.x * PARALLAX_X * parallaxFade
    const parallaxY = state.pointer.y * PARALLAX_Y * parallaxFade

    desiredPosition.current.set(
      parallaxX,
      BASE_Y + parallaxY - endBlend * 0.2,
      z,
    )
    desiredLook.current.set(
      MathUtils.lerp(parallaxX * LOOK_PARALLAX, HEART.x, endBlend),
      MathUtils.lerp(1.8 + parallaxY * 0.12, 4.2, endBlend),
      MathUtils.lerp(z - LOOK_AHEAD, HEART.z, endBlend),
    )

    const tPos = 1 - Math.exp(-POSITION_LERP * delta)
    const tLook = 1 - Math.exp(-LOOK_LERP * delta)

    state.camera.position.lerp(desiredPosition.current, tPos)
    lookTarget.current.lerp(desiredLook.current, tLook)
    state.camera.lookAt(lookTarget.current)
  })

  return null
}
