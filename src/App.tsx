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
import { WelcomeTutorial } from './components/ui/WelcomeTutorial'

function GithubMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.386-1.332-1.756-1.332-1.756-1.089-.744.082-.729.082-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.763-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.874.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.804 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.604-.014 2.898-.014 3.293 0 .32.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.63-5.373-12-12-12" />
    </svg>
  )
}

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
      <WelcomeTutorial />

      <header className="brand-lockup">
        <span className="brand-mark"><img src="/brand-mark.png" alt="" /></span>
        <div>
          <div className="brand-eyebrow"><Radio size={9} /> Global defence network <span>online</span></div>
          <h1><span>SKIES</span> <em>OF</em> <span>CONFLICT</span> <b>// C2</b></h1>
          <p>Integrated air-defence command theatre</p>
          <a
            className="brand-credits"
            href="https://github.com/rare-major/skies-of-conflict"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubMark /> rare-major/skies-of-conflict
          </a>
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
