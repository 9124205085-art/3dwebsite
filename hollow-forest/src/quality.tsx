import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type QualitySettings = {
  mobile: boolean
  treeCols: number
  treeRows: number
  pathSparkles: number
  forestSparkles: number
  swirlSparkles: number
  runeCount: number
  shadows: boolean
  dpr: [number, number]
  pages: number
}

function getSettings(width: number): QualitySettings {
  const mobile = width < 768

  if (mobile) {
    return {
      mobile: true,
      treeCols: 11,
      treeRows: 16,
      pathSparkles: 70,
      forestSparkles: 36,
      swirlSparkles: 48,
      runeCount: 4,
      shadows: false,
      dpr: [1, 1.25],
      pages: 8,
    }
  }

  return {
    mobile: false,
      treeCols: 16,
      treeRows: 22,
    pathSparkles: 150,
    forestSparkles: 72,
    swirlSparkles: 100,
    runeCount: 7,
    shadows: true,
    dpr: [1, 1.75],
    pages: 10,
  }
}

const QualityContext = createContext<QualitySettings>(getSettings(1200))

export function QualityProvider({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 1200 : window.innerWidth,
  )

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const settings = useMemo(() => getSettings(width), [width])

  return (
    <QualityContext.Provider value={settings}>{children}</QualityContext.Provider>
  )
}

export function useQuality() {
  return useContext(QualityContext)
}
