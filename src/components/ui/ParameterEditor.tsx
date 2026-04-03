import { Gauge, Target, Eye, Crosshair, Zap, Route } from 'lucide-react'
import { useEntityStore } from '../../store/entityStore'
import { ATTACK_TRAJECTORY_TIPS, DEFENCE_TRAJECTORY_TIPS, PARAM_TIPS } from '../../data/tooltipDescriptions'
import { Tooltip } from './Tooltip'
import type { EntityParams, AttackTrajectory, DefenceTrajectory, SimEntity } from '../../types/entities'

const ATTACK_TRAJECTORIES: { value: AttackTrajectory; label: string }[] = [
  { value: 'straight', label: 'Straight' },
  { value: 'ballistic', label: 'Ballistic' },
  { value: 'cruise', label: 'Cruise' },
  { value: 'zigzag', label: 'Zig-Zag' },
  { value: 'waypoint', label: 'Waypoint' },
  { value: 'dive', label: 'Dive' },
  { value: 'loitering', label: 'Loiter' },
  { value: 'swarm', label: 'Swarm' },
]

const DEFENCE_TRAJECTORIES: { value: DefenceTrajectory; label: string }[] = [
  { value: 'direct-intercept', label: 'Direct' },
  { value: 'predictive-intercept', label: 'Predictive' },
  { value: 'proportional-nav', label: 'Prop Nav' },
  { value: 'radar-guided', label: 'Radar' },
  { value: 'heat-seeking', label: 'Heat Seek' },
  { value: 'burst-fire', label: 'Burst' },
]

export function ParameterEditor() {
  const selectedId = useEntityStore((s) => s.selectedEntityId)
  const entities = useEntityStore((s) => s.entities)
  const entity = entities.find((e) => e.id === selectedId)

  if (!entity) {
    return (
      <div className="text-[10px] text-center py-4" style={{ color: 'var(--text-dim)' }}>
        Select an entity to edit parameters
      </div>
    )
  }

  const params = entity.params
  const trajTips = entity.kind === 'attack' ? ATTACK_TRAJECTORY_TIPS : DEFENCE_TRAJECTORY_TIPS

  const updateParam = (key: keyof EntityParams, value: number) => {
    const store = useEntityStore.getState()
    const updated = store.entities.map((e) =>
      e.id === entity.id ? { ...e, params: { ...e.params, [key]: value } } : e
    )
    store.setEntities(updated as any)
  }

  const updateTrajectory = (trajectory: string) => {
    const store = useEntityStore.getState()
    const updated = store.entities.map((e) =>
      e.id === entity.id ? { ...e, trajectory } : e
    )
    store.setEntities(updated as SimEntity[])
  }

  const trajectoryOptions = entity.kind === 'attack' ? ATTACK_TRAJECTORIES : DEFENCE_TRAJECTORIES

  return (
    <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
      <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Parameters — {entity.type}
      </h3>

      <Group label="Trajectory" icon={Route}>
        <TrajectoryPicker
          options={trajectoryOptions}
          value={entity.trajectory}
          onChange={updateTrajectory}
          tips={trajTips}
        />
      </Group>

      <Group label="Movement" icon={Gauge}>
        <Slider label="Speed" tip={PARAM_TIPS['Speed']} value={params.speed} min={5} max={500} step={5} onChange={(v) => updateParam('speed', v)} />
        <Slider label="Acceleration" tip={PARAM_TIPS['Acceleration']} value={params.acceleration} min={0} max={100} step={1} onChange={(v) => updateParam('acceleration', v)} />
        <Slider label="Turn Rate" tip={PARAM_TIPS['Turn Rate']} value={params.turnRate} min={0.1} max={5} step={0.1} onChange={(v) => updateParam('turnRate', v)} />
      </Group>

      <Group label="Combat" icon={Crosshair}>
        <Slider label="Accuracy" tip={PARAM_TIPS['Accuracy']} value={params.accuracy} min={0} max={1} step={0.05} onChange={(v) => updateParam('accuracy', v)} />
        <Slider label="Kill Radius" tip={PARAM_TIPS['Kill Radius']} value={params.killRadius} min={1} max={50} step={1} onChange={(v) => updateParam('killRadius', v)} />
        <Slider label="Reaction Delay" tip={PARAM_TIPS['Reaction Delay']} value={params.reactionDelay} min={0} max={5} step={0.1} onChange={(v) => updateParam('reactionDelay', v)} />
      </Group>

      <Group label="Detection" icon={Eye}>
        <Slider label="Det. Range" tip={PARAM_TIPS['Det. Range']} value={params.detectionRange} min={0} max={800} step={10} onChange={(v) => updateParam('detectionRange', v)} />
        <Slider label="Stealth" tip={PARAM_TIPS['Stealth']} value={params.stealthFactor} min={-0.5} max={1} step={0.05} onChange={(v) => updateParam('stealthFactor', v)} />
      </Group>
    </div>
  )
}

function Group({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <Icon size={10} style={{ color: 'var(--text-dim)' }} />
        <span className="text-[8px] uppercase tracking-widest font-medium" style={{ color: 'var(--text-dim)' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function TrajectoryPicker({ options, value, onChange, tips }: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  tips: Record<string, string>
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => {
        const isActive = value === opt.value
        const pill = (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-2 py-1 rounded-md text-[9px] font-medium transition-all duration-150 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: isActive ? 'var(--bg-active)' : 'var(--bg-element)',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${isActive ? 'var(--border-active)' : 'var(--border)'}`,
              boxShadow: isActive ? '0 0 8px var(--accent-glow)' : 'none',
            }}
          >
            {opt.label}
          </button>
        )
        const tip = tips[opt.value]
        if (tip) return <Tooltip key={opt.value} content={tip} position="bottom">{pill}</Tooltip>
        return pill
      })}
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange, tip }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; tip?: string
}) {
  const labelEl = (
    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
  )

  return (
    <div>
      <div className="flex justify-between mb-0.5">
        {tip ? <Tooltip content={tip}>{labelEl}</Tooltip> : labelEl}
        <span className="text-[9px] font-mono" style={{ color: 'var(--text-secondary)' }}>
          {value.toFixed(step < 1 ? 2 : 0)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_var(--accent-glow)]"
        style={{ background: 'var(--bg-element)' }}
      />
    </div>
  )
}
