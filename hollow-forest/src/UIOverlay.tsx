import { useEffect, useRef } from 'react'
import { journeyState, scrollState, smoothstep } from './theme'

export function UIOverlay() {
  const introRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const endingRef = useRef<HTMLDivElement>(null)
  const hallRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0

    const update = () => {
      const offset = scrollState.offset
      const intro = 1 - smoothstep(0.03, 0.16, offset)
      const hint = 1 - smoothstep(0.01, 0.08, offset)
      const ending =
        smoothstep(0.78, 0.93, offset) * (1 - smoothstep(0.08, 0.45, journeyState.interior))
      const hall = smoothstep(0.28, 0.7, journeyState.interior)

      if (introRef.current) {
        introRef.current.style.opacity = String(intro)
        introRef.current.style.transform = `translateY(${(1 - intro) * -12}px)`
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(hint)
      }
      if (endingRef.current) {
        endingRef.current.style.opacity = String(ending)
        endingRef.current.style.transform = `translateY(${(1 - ending) * 16}px)`
      }
      if (hallRef.current) {
        hallRef.current.style.opacity = String(hall)
        hallRef.current.style.transform = `translateY(${(1 - hall) * 14}px)`
      }

      frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        pointerEvents: 'none',
        color: '#eaf8f2',
      }}
    >
      <div
        ref={introRef}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 1.5rem',
        }}
      >
        <h1
          className="font-serif text-5xl tracking-[0.42em] md:text-7xl"
          style={{
            margin: 0,
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2.4rem, 8vw, 4.5rem)',
            letterSpacing: '0.42em',
            color: '#f3fff9',
            textShadow: '0 0 28px rgba(255, 211, 106, 0.4)',
          }}
        >
          HOLLOW
        </h1>
        <p
          className="mt-5 max-w-md text-sm tracking-wide md:text-base"
          style={{
            marginTop: '1.25rem',
            maxWidth: '28rem',
            color: 'rgba(155, 184, 173, 0.9)',
            letterSpacing: '0.04em',
          }}
        >
          Some forests remember what we forget.
        </p>
      </div>

      <p
        ref={hintRef}
        className="absolute bottom-10 left-0 right-0 text-center text-[11px] uppercase tracking-[0.32em]"
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 11,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(255, 211, 106, 0.85)',
        }}
      >
        Scroll to enter ↓
      </p>

      <div
        ref={endingRef}
        className="absolute inset-0 flex items-end justify-center px-6 pb-16 text-center md:pb-20"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 1.5rem 4rem',
          textAlign: 'center',
          opacity: 0,
        }}
      >
        <p
          className="font-serif text-2xl tracking-[0.18em] md:text-4xl"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
            letterSpacing: '0.18em',
            color: '#f3fff9',
            textShadow: '0 0 22px rgba(255, 211, 106, 0.45)',
          }}
        >
          Some doors only open at night.
        </p>
        <p
          style={{
            marginTop: '0.85rem',
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255, 211, 106, 0.7)',
          }}
        >
          Watch the last bus home
        </p>
      </div>

      <div
        ref={hallRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 1.5rem 4rem',
          textAlign: 'center',
          opacity: 0,
        }}
      >
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
            letterSpacing: '0.18em',
            color: '#7c2d12',
            textShadow: '0 0 18px rgba(255, 247, 237, 0.8)',
          }}
        >
          Climb the steps.
        </p>
        <p
          style={{
            marginTop: '0.85rem',
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#b45309',
          }}
        >
          This hall is the website
        </p>
      </div>
    </div>
  )
}
