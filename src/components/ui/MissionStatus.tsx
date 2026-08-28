import { Activity, AlertTriangle, ChevronDown, ChevronUp, Flame, Gauge, Radar, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEntityStore } from '../../store/entityStore'
import { useScenarioStore } from '../../store/scenarioStore'
import { useSimulationStore } from '../../store/simulationStore'
import { useUIStore } from '../../store/uiStore'

type MissionPhase = 'setup' | 'ready' | 'live' | 'paused' | 'complete'

const PHASE_LABELS: Record<MissionPhase, string> = {
  setup: 'Awaiting mission',
  ready: 'Ready to launch',
  live: 'Engagement live',
  paused: 'Simulation paused',
  complete: 'Mission complete',
}

export function MissionStatus() {
  const collapsed = useUIStore((s) => s.missionStatusCollapsed)
  const setCollapsed = useUIStore((s) => s.setMissionStatusCollapsed)
  const activeScenarioId = useScenarioStore((s) => s.activeScenarioId)
  const activeScenario = useScenarioStore((s) => s.activeScenario)
  const isRunning = useSimulationStore((s) => s.isRunning)
  const elapsed = useSimulationStore((s) => s.elapsed)
  const initialSnapshot = useSimulationStore((s) => s.initialSnapshot)

  const activeAttacks = useEntityStore((s) => s.entities.filter((e) => e.kind === 'attack' && e.status === 'active').length)
  const defenders = useEntityStore((s) => s.entities.filter((e) => e.kind === 'defence' && e.status === 'active').length)
  const intercepted = useEntityStore((s) => s.entities.filter((e) => e.kind === 'attack' && e.status === 'intercepted').length)
  const impacts = useEntityStore((s) => s.entities.filter((e) => e.kind === 'attack' && e.status === 'exploded').length)
  const escaped = useEntityStore((s) => s.entities.filter((e) => e.kind === 'attack' && (e.status === 'missed' || e.status === 'destroyed')).length)

  const snapshotAttacks = initialSnapshot?.entities.filter((e) => e.kind === 'attack').length ?? 0
  const totalAttacks = Math.max(snapshotAttacks, activeAttacks + intercepted + impacts + escaped)
  const resolved = intercepted + impacts + escaped
  const progress = totalAttacks > 0 ? Math.min(100, (resolved / totalAttacks) * 100) : 0
  const defenceRate = resolved > 0 ? Math.round((intercepted / resolved) * 100) : 0
  const verdictTone = defenceRate >= 75 ? 'success' : defenceRate >= 50 ? 'warning' : 'danger'

  let phase: MissionPhase = 'setup'
  if (totalAttacks > 0 && isRunning) phase = 'live'
  else if (totalAttacks > 0 && elapsed > 0 && activeAttacks === 0) phase = 'complete'
  else if (totalAttacks > 0 && elapsed > 0) phase = 'paused'
  else if (totalAttacks > 0) phase = 'ready'

  const title = activeScenario?.name ?? (totalAttacks > 0 ? 'Custom engagement' : 'No mission deployed')
  const description = activeScenario?.description
    ?? (totalAttacks > 0 ? 'Custom forces are staged and awaiting your command.' : 'Open Scenarios to deploy a complete engagement, or build one in Spawn.')
  const operationCode = activeScenarioId
    ? activeScenarioId.slice(0, 5).toUpperCase()
    : totalAttacks > 0 ? 'CUSTOM' : 'STANDBY'

  return (
    <section className={`mission-hud ${collapsed ? 'is-collapsed' : ''}`} data-phase={phase} aria-label="Mission status">
      <div className="mission-hud__topline">
        <div className={`mission-phase mission-phase--${phase}`}>
          <span className="mission-phase__dot" />
          {PHASE_LABELS[phase]}
        </div>
        <div className="mission-hud__actions">
          <span className="mission-operation-id">OPS / {operationCode}</span>
          <button
            type="button"
            className="mission-collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand mission status' : 'Collapse mission status'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {collapsed ? (
        <div className="mission-compact">
          <span className="mission-emblem"><Radar size={16} strokeWidth={1.5} /></span>
          <div>
            <h2>{title}</h2>
            <span>{totalAttacks > 0 ? `${activeAttacks} inbound · ${defenders} systems · T+${elapsed.toFixed(1)}s` : 'Command link ready'}</span>
          </div>
        </div>
      ) : <>
        <div className="mission-title-row">
          <span className="mission-emblem"><Radar size={19} strokeWidth={1.5} /></span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>

        {totalAttacks > 0 ? (
        <>
          <div className="mission-intel-row">
            <span><Activity size={11} /> {defenders} systems online</span>
            <span className="font-mono-timer">T+{elapsed.toFixed(1)}s</span>
          </div>
          <div className="mission-progress-label">
            <span>Threat resolution</span>
            <span>{resolved}/{totalAttacks}</span>
          </div>
          <div className="mission-progress" aria-label={`${Math.round(progress)} percent of threats resolved`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="mission-metrics">
            <MissionMetric icon={AlertTriangle} label="Inbound" value={activeAttacks} tone="danger" />
            <MissionMetric icon={ShieldCheck} label="Stopped" value={intercepted} tone="success" />
            <MissionMetric icon={Flame} label="Impacts" value={impacts} tone="warning" />
          </div>
          {phase === 'complete' && (
            <div className="mission-verdict" data-tone={verdictTone}>
              <Gauge size={14} />
              <span><strong>{defenceRate}%</strong> interception efficiency · {impacts} impacts · {escaped} escaped</span>
            </div>
          )}
        </>
        ) : (
          <div className="mission-standby">
            <Activity size={14} style={{ color: 'var(--accent)' }} />
            <div><strong>Command link ready</strong><span>Choose a scenario to stage the first engagement.</span></div>
          </div>
        )}
      </>}
    </section>
  )
}

function MissionMetric({ icon: Icon, label, value, tone }: {
  icon: LucideIcon
  label: string
  value: number
  tone: 'danger' | 'success' | 'warning'
}) {
  return (
    <div className={`mission-metric mission-metric--${tone}`}>
      <Icon size={12} />
      <span className="mission-metric__value">{value}</span>
      <span className="mission-metric__label">{label}</span>
    </div>
  )
}
