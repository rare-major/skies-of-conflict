import { useEffect } from 'react'
import { Radio, Sparkles } from 'lucide-react'
import { Scene } from './components/scene/Scene'
import { ControlPanel } from './components/ui/ControlPanel'
import { MissionStatus } from './components/ui/MissionStatus'
import { useThemeStore } from './store/themeStore'
import { useSimulationStore } from './store/simulationStore'
import { useEntityStore } from './store/entityStore'
import { useCountryStore } from './store/countryStore'
import { useCameraStore } from './store/cameraStore'
import { getCountryById } from './data/countries'
import { GameModeController } from './components/game/GameModeController'
import { CommandDirectorOverlay } from './components/ui/CommandDirectorOverlay'

export default function App() {
  const theme = useThemeStore((s) => s.theme)
  const isRunning = useSimulationStore((s) => s.isRunning)
  const activeTracks = useEntityStore((s) => s.entities.filter((entity) => entity.status === 'active').length)
  const selectedCountryId = useCountryStore((s) => s.selectedCountryId)
  const cameraMode = useCameraStore((s) => s.mode)
  const theatre = selectedCountryId ? getCountryById(selectedCountryId)?.name : null

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }, [theme])

  return (
    <main className={`app-shell w-full h-full relative transition-colors duration-300 ${isRunning ? 'is-live' : ''}`}>
      <Scene />
      <div className="scene-vignette" aria-hidden="true" />
      <div className="cinematic-grain" aria-hidden="true" />
      <div className="cinematic-frame" aria-hidden="true">
        <span className="frame-corner frame-corner--tl" />
        <span className="frame-corner frame-corner--tr" />
        <span className="frame-corner frame-corner--bl" />
        <span className="frame-corner frame-corner--br" />
      </div>
      <ControlPanel />
      <GameModeController />
      <CommandDirectorOverlay />

      <header className="brand-lockup">
        <span className="brand-mark"><img src="/brand-mark.png" alt="" /></span>
        <div>
          <div className="brand-eyebrow"><Radio size={9} /> Global defence network <span>online</span></div>
          <h1><span>SKIES</span> <em>OF</em> <span>CONFLICT</span> <b>// C2</b></h1>
          <p>Integrated air-defence command theatre</p>
        </div>
      </header>

      <MissionStatus />

      <div className="interaction-hint" aria-hidden="true">
        <Sparkles size={11} /> Drag to orbit <span>·</span> Scroll to zoom <span>·</span> Select a unit to follow
      </div>

      <div className="scene-meta" aria-label="Scene telemetry">
        <span>{theatre ?? 'Global test range'}</span>
        <i />
        <span>{activeTracks.toString().padStart(2, '0')} active units</span>
        <i />
        <span>{cameraMode} camera</span>
      </div>
    </main>
  )
}
