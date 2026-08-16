import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import { Scene } from './Scene'
import { CAMERA_START } from './CameraRig'
import { LoadingScreen } from './LoadingScreen'
import { QualityProvider, useQuality } from './quality'
import { UIOverlay } from './UIOverlay'

function Experience() {
  const quality = useQuality()

  return (
    <>
      <Canvas
        camera={{
          position: [CAMERA_START.x, CAMERA_START.y, CAMERA_START.z],
          fov: 55,
          near: 0.1,
          far: 420,
        }}
        dpr={quality.dpr}
        shadows={quality.shadows}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={quality.pages} damping={0.42}>
            <Scene />
          </ScrollControls>
        </Suspense>
      </Canvas>
      <UIOverlay />
      <LoadingScreen />
    </>
  )
}

export default function App() {
  return (
    <QualityProvider>
      <Experience />
    </QualityProvider>
  )
}
