import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import { Scene } from './Scene'
import { CAMERA_START } from './CameraRig'

export default function App() {
  return (
    <Canvas
      camera={{
        position: [CAMERA_START.x, CAMERA_START.y, CAMERA_START.z],
        fov: 60,
        near: 0.1,
        far: 200,
      }}
      dpr={[1, 2]}
      shadows
    >
      <ScrollControls pages={10} damping={0.4}>
        <Scene />
      </ScrollControls>
    </Canvas>
  )
}
