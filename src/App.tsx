import { useEffect } from 'react'
import { Scene } from './components/scene/Scene'
import { ControlPanel } from './components/ui/ControlPanel'
import { useThemeStore } from './store/themeStore'

export default function App() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }, [theme])

  return (
    <div className="w-full h-full relative transition-colors duration-300">
      <Scene />
      <ControlPanel />

      <div className="fixed top-4 left-4 z-50">
        <h1 className="text-sm font-semibold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          SKYSHIELD
        </h1>
        <p className="text-[9px] tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
          Air Warfare Simulation
        </p>
      </div>
    </div>
  )
}
