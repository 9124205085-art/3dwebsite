import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  HOUSES,
  HOUSE_ZIGZAG,
  houseState,
  journeyState,
  scrollState,
  selectHouse,
  smoothstep,
  subscribeHouse,
} from './theme'
import { WhiteFlight } from './WhiteFlight'

export function UIOverlay() {
  const introRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const endingRef = useRef<HTMLDivElement>(null)
  const hallRef = useRef<HTMLDivElement>(null)
  const whiteRef = useRef<HTMLDivElement>(null)
  const selected = useSyncExternalStore(
    subscribeHouse,
    () => houseState.selected,
  )
  const house = HOUSES.find((item) => item.id === selected) ?? null

  useEffect(() => {
    let frame = 0

    const update = () => {
      const offset = scrollState.offset
      const intro = 1 - smoothstep(0.03, 0.16, offset)
      const hint = 1 - smoothstep(0.01, 0.08, offset)
      const ending =
        smoothstep(0.78, 0.93, offset) * (1 - smoothstep(0.08, 0.45, journeyState.interior))
      const hall =
        smoothstep(0.28, 0.7, journeyState.interior) *
        (1 - smoothstep(0.12, 0.45, journeyState.feast)) *
        (1 - smoothstep(0.02, 0.28, journeyState.whiteout))
      const white = journeyState.whiteout

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
      if (whiteRef.current) {
        whiteRef.current.style.opacity = String(white)
        whiteRef.current.style.pointerEvents = white > 0.45 ? 'auto' : 'none'
      }

      frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') selectHouse(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
          background:
            'linear-gradient(to top, rgba(12, 8, 6, 0.72) 0%, rgba(12, 8, 6, 0.32) 36%, transparent 68%)',
        }}
      >
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
            letterSpacing: '0.18em',
            color: '#f7efe2',
            textShadow:
              '0 2px 14px rgba(0, 0, 0, 0.9), 0 0 22px rgba(0, 0, 0, 0.55)',
          }}
        >
          Click House of Tide for the next house
        </p>
        <p
          style={{
            marginTop: '0.55rem',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(240, 217, 160, 0.82)',
            textShadow: '0 1px 10px rgba(0, 0, 0, 0.95)',
          }}
        >
          Scroll down · house boards wait on the white screen
        </p>
      </div>

      <div
        ref={whiteRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 80,
          overflow: 'auto',
          background: '#ffffff',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <WhiteSky />
      </div>

      {house && (
        <div
          onClick={() => selectHouse(null)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            pointerEvents: 'auto',
            background: 'rgba(8, 6, 4, 0.72)',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(28rem, 100%)',
              padding: '1.7rem 1.6rem 1.4rem',
              borderRadius: 18,
              background: 'linear-gradient(180deg, #1a1410 0%, #120e0b 100%)',
              border: `1px solid ${house.color}`,
              boxShadow: `0 18px 50px rgba(0,0,0,0.55), 0 0 28px ${house.color}55`,
              textAlign: 'left',
              pointerEvents: 'auto',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: house.glow,
              }}
            >
              House of Hollow Academy
            </p>
            <h2
              style={{
                margin: '0.55rem 0 0',
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(2rem, 6vw, 3rem)',
                letterSpacing: '0.14em',
                color: '#f7efe2',
              }}
            >
              {house.name.toUpperCase()}
            </h2>
            <p
              style={{
                margin: '0.45rem 0 0',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                color: house.glow,
                letterSpacing: '0.04em',
              }}
            >
              {house.motto}
            </p>
            <p
              style={{
                margin: '1rem 0 0',
                color: 'rgba(247, 239, 226, 0.88)',
                lineHeight: 1.55,
                fontSize: 15,
              }}
            >
              {house.text}
            </p>
            <button
              type="button"
              onClick={() => selectHouse(null)}
              style={{
                marginTop: '1.35rem',
                padding: '0.65rem 1.2rem',
                borderRadius: 999,
                border: '1px solid #f0d9a0',
                background: 'transparent',
                color: '#f0d9a0',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function useWhiteVisible() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const next = journeyState.whiteout > 0.16
      setVisible((prev) => (prev === next ? prev : next))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return visible
}

function WhiteSky() {
  const flying = useWhiteVisible()

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: 0,
          zIndex: 6,
          pointerEvents: 'none',
        }}
      >
        <div style={{ height: '100vh', width: '100%' }}>
          {flying ? <WhiteFlight /> : null}
        </div>
      </div>

      <p
        style={{
          margin: '1.4rem 0 0.2rem',
          textAlign: 'center',
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(1.15rem, 3.2vw, 1.7rem)',
          letterSpacing: '0.16em',
          color: '#3a2414',
        }}
      >
        The Four Houses
      </p>
      <p
        style={{
          margin: '0 0 0.4rem',
          textAlign: 'center',
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#7a6240',
        }}
      >
        Ember · Pine · Tide · Dusk
      </p>
      <HouseZigZag />
    </div>
  )
}

type House = (typeof HOUSES)[number]

const ZIGZAG_SLOTS: Array<{
  house: House
  left: number
  top: number
}> = [
  { house: HOUSE_ZIGZAG[0], left: 18, top: 18 },
  { house: HOUSE_ZIGZAG[1], left: 412, top: 232 },
  { house: HOUSE_ZIGZAG[2], left: 18, top: 478 },
  { house: HOUSE_ZIGZAG[3], left: 412, top: 718 },
]

function HouseZigZag() {
  return (
    <div
      style={{
        position: 'relative',
        width: 'min(720px, 94vw)',
        height: 'min(980px, 138vw)',
        margin: '2.4vh auto 4vh',
        maxWidth: 720,
      }}
    >
      <svg
        viewBox="0 0 720 980"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <marker
            id="house-arrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="#1a5f73" />
          </marker>
        </defs>
        <path
          d="M 298 86 C 520 48, 610 170, 412 248"
          fill="none"
          stroke="#1a5f73"
          strokeWidth="2.4"
          strokeDasharray="9 7"
          strokeLinecap="round"
          markerEnd="url(#house-arrow)"
        />
        <path
          d="M 412 428 C 220 448, 90 500, 298 534"
          fill="none"
          stroke="#1a5f73"
          strokeWidth="2.4"
          strokeDasharray="9 7"
          strokeLinecap="round"
          markerEnd="url(#house-arrow)"
        />
        <path
          d="M 298 674 C 530 692, 600 790, 412 780"
          fill="none"
          stroke="#1a5f73"
          strokeWidth="2.4"
          strokeDasharray="9 7"
          strokeLinecap="round"
          markerEnd="url(#house-arrow)"
        />
      </svg>

      {ZIGZAG_SLOTS.map((slot) => (
        <HouseBanner
          key={slot.house.id}
          house={slot.house}
          left={`${(slot.left / 720) * 100}%`}
          top={`${(slot.top / 980) * 100}%`}
        />
      ))}
    </div>
  )
}

function HouseBanner({
  house,
  left,
  top,
}: {
  house: House
  left: string
  top: string
}) {
  return (
    <article
      style={{
        position: 'absolute',
        left,
        top,
        width: 'min(290px, 42vw)',
        zIndex: 2,
      }}
    >
      <div
        style={{
          padding: '1.05rem 0.95rem 0.72rem',
          textAlign: 'center',
          color: '#3a2414',
          background:
            'linear-gradient(180deg, #ead7a8 0%, #d7c08c 48%, #c4a66d 100%)',
          clipPath:
            'polygon(3% 4%, 9% 1.4%, 18% 3.8%, 30% 1%, 44% 3.6%, 58% 0.8%, 72% 3.4%, 84% 1.2%, 94% 3.6%, 98% 2%, 99% 14%, 97% 32%, 99% 52%, 97% 72%, 99% 88%, 97% 98%, 86% 99%, 70% 97%, 54% 99%, 38% 97%, 22% 99%, 8% 97%, 2% 98%, 1% 84%, 3% 64%, 1% 42%, 3% 22%, 1% 8%)',
          boxShadow: '0 12px 28px rgba(70, 48, 24, 0.18)',
        }}
      >
        <svg
          viewBox="0 0 200 34"
          width="84%"
          style={{ display: 'block', margin: '0 auto 0.15rem' }}
        >
          <path
            d="M12 28 Q100 -6 188 28"
            fill="none"
            stroke="#4a3420"
            strokeWidth="1.5"
          />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const t = i / 7
            const x = 12 + 176 * t
            const y = 28 - Math.sin(t * Math.PI) * 34
            return <circle key={i} cx={x} cy={y - 2} r="1.5" fill="#3d2a16" />
          })}
        </svg>
        <h2
          style={{
            margin: 0,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(1.05rem, 3.2vw, 1.45rem)',
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          House of {house.name}
        </h2>
        <p
          style={{
            margin: '0.28rem 0 0',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: '#5c3b22',
          }}
        >
          {house.motto}
        </p>
        <p
          style={{
            margin: '0.55rem auto 0',
            maxWidth: '16.5rem',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 12,
            lineHeight: 1.45,
            color: '#2e2014',
          }}
        >
          {house.text}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 18,
            marginTop: 10,
          }}
        >
          <Pennant color={house.color} tilt={-22} />
          <Pennant color={house.color} tilt={22} />
        </div>
        <p
          style={{
            margin: '0.55rem 0 0',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 11,
            color: '#4a3420',
          }}
        >
          Hollow Academy
        </p>
        <p
          style={{
            margin: '0.12rem 0 0',
            fontFamily: 'Georgia, serif',
            fontSize: 10,
            color: '#4a3420',
          }}
        >
          Anno 1209
        </p>
      </div>
    </article>
  )
}

function Pennant({ color, tilt }: { color: string; tilt: number }) {
  return (
    <svg
      width="48"
      height="32"
      viewBox="0 0 48 32"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <rect x="2" y="2" width="3" height="28" rx="1" fill="#4a3424" />
      <path
        d="M5 4 L44 14 L5 24 Z"
        fill={color}
        stroke="rgba(40,24,12,0.4)"
        strokeWidth="0.8"
      />
    </svg>
  )
}
