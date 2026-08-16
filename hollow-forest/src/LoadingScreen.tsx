import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'

export function LoadingScreen() {
  const progress = useProgress((state) => state.progress)
  const active = useProgress((state) => state.active)
  const total = useProgress((state) => state.total)
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  const ready = !active && (total === 0 || progress >= 100)
  const displayProgress = ready ? 100 : progress

  useEffect(() => {
    if (!ready) return

    const fadeTimer = window.setTimeout(() => setFading(true), 400)
    const hideTimer = window.setTimeout(() => setVisible(false), 1000)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [ready])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#05060a',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.7s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'Georgia, serif',
          fontSize: '1.15rem',
          letterSpacing: '0.28em',
          color: '#ffd36a',
          textShadow: '0 0 18px rgba(255, 211, 106, 0.5)',
        }}
      >
        Entering the Hollow...
      </p>
      <div
        style={{
          marginTop: '2rem',
          height: 1,
          width: 176,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.max(displayProgress, 8)}%`,
            background: '#ffd36a',
            boxShadow: '0 0 12px rgba(255, 211, 106, 0.8)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <p
        style={{
          marginTop: '0.75rem',
          fontSize: 11,
          letterSpacing: '0.28em',
          color: 'rgba(155, 184, 173, 0.7)',
        }}
      >
        {Math.round(displayProgress)}%
      </p>
    </div>
  )
}
