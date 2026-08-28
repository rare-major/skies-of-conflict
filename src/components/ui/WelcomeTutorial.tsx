import { Compass, Layers, MousePointerClick, Rocket, Swords, X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const STEPS = [
  { icon: Layers, text: 'Open the Scenarios tab and Stage a mission from the library.' },
  { icon: Rocket, text: 'Hit Engage in Simulation to launch the attack and watch your defences respond.' },
  { icon: MousePointerClick, text: 'Drag to orbit, scroll to zoom, and click a unit to follow it in.' },
  { icon: Swords, text: 'Try War Game for a two-player hot-seat match once you know the ropes.' },
] as const

export function WelcomeTutorial() {
  const visible = useUIStore((s) => s.welcomeVisible)
  const dismiss = useUIStore((s) => s.dismissWelcome)

  if (!visible) return null

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <button className="welcome-overlay__close" onClick={dismiss} aria-label="Close welcome guide">
        <X size={14} />
      </button>
      <div className="welcome-overlay__content">
        <span className="welcome-overlay__icon"><Compass size={24} /></span>
        <small>First deployment</small>
        <h2 id="welcome-title">Welcome, Commander</h2>
        <p>
          Skies of Conflict is an air-defence command simulation. Stage a scenario, take
          control of the battlespace, and see whether your defences can stop the attack.
        </p>
        <ol className="welcome-overlay__steps">
          {STEPS.map(({ icon: Icon, text }, i) => (
            <li key={i}>
              <span><Icon size={13} /></span>
              {text}
            </li>
          ))}
        </ol>
        <button className="welcome-overlay__cta" onClick={dismiss}>Enter command deck</button>
      </div>
    </div>
  )
}
