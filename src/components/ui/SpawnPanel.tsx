import { useState } from 'react'
import { Crosshair, Shield, Plus } from 'lucide-react'
import { useEntitySpawner } from '../../hooks/useEntitySpawner'
import { ATTACK_PRESETS } from '../../data/attackPresets'
import { DEFENCE_PRESETS } from '../../data/defencePresets'
import { ATTACK_TYPE_TIPS, DEFENCE_TYPE_TIPS, ATTACK_TRAJECTORY_TIPS, DEFENCE_TRAJECTORY_TIPS } from '../../data/tooltipDescriptions'
import type { AttackType, AttackTrajectory, DefenceType, DefenceTrajectory } from '../../types/entities'
import { IconButton } from './IconButton'

const ATTACK_TRAJECTORIES: { value: AttackTrajectory; label: string }[] = [
  { value: 'straight', label: 'Straight' },
  { value: 'ballistic', label: 'Ballistic' },
  { value: 'cruise', label: 'Cruise' },
  { value: 'zigzag', label: 'Zig-Zag Evasive' },
  { value: 'waypoint', label: 'Waypoint' },
  { value: 'dive', label: 'Dive Attack' },
  { value: 'loitering', label: 'Loitering' },
  { value: 'swarm', label: 'Swarm' },
]

const DEFENCE_TRAJECTORIES: { value: DefenceTrajectory; label: string }[] = [
  { value: 'direct-intercept', label: 'Direct Intercept' },
  { value: 'predictive-intercept', label: 'Predictive Intercept' },
  { value: 'proportional-nav', label: 'Proportional Navigation' },
  { value: 'radar-guided', label: 'Radar Guided' },
  { value: 'heat-seeking', label: 'Heat Seeking' },
  { value: 'burst-fire', label: 'Burst Fire' },
]

export function SpawnPanel() {
  const { spawnAttack, spawnDefence } = useEntitySpawner()
  const [attackType, setAttackType] = useState<AttackType>(ATTACK_PRESETS[0].type)
  const [attackTraj, setAttackTraj] = useState<AttackTrajectory>(ATTACK_PRESETS[0].defaultTrajectory)
  const [defenceType, setDefenceType] = useState<DefenceType>(DEFENCE_PRESETS[0].type)
  const [defenceTraj, setDefenceTraj] = useState<DefenceTrajectory>(DEFENCE_PRESETS[0].defaultTrajectory)

  const handleAttackTypeChange = (type: AttackType) => {
    setAttackType(type)
    const preset = ATTACK_PRESETS.find((p) => p.type === type)
    if (preset) setAttackTraj(preset.defaultTrajectory)
  }

  const handleDefenceTypeChange = (type: DefenceType) => {
    setDefenceType(type)
    const preset = DEFENCE_PRESETS.find((p) => p.type === type)
    if (preset) setDefenceTraj(preset.defaultTrajectory)
  }

  return (
    <div className="space-y-5">
      <Section title="Attack" icon={Crosshair}>
        <Select
          label="Type"
          value={attackType}
          options={ATTACK_PRESETS.map((p) => ({ value: p.type, label: p.label }))}
          onChange={(v) => handleAttackTypeChange(v as AttackType)}
        />
        <Hint text={ATTACK_TYPE_TIPS[attackType]} />
        <Select
          label="Trajectory"
          value={attackTraj}
          options={ATTACK_TRAJECTORIES}
          onChange={(v) => setAttackTraj(v as AttackTrajectory)}
        />
        <Hint text={ATTACK_TRAJECTORY_TIPS[attackTraj]} />
        <IconButton
          icon={Plus}
          label="Spawn Attack"
          onClick={() => spawnAttack(attackType, attackTraj)}
          variant="red"
          className="w-full"
        />
      </Section>

      <Section title="Defence" icon={Shield}>
        <Select
          label="Type"
          value={defenceType}
          options={DEFENCE_PRESETS.map((p) => ({ value: p.type, label: p.label }))}
          onChange={(v) => handleDefenceTypeChange(v as DefenceType)}
        />
        <Hint text={DEFENCE_TYPE_TIPS[defenceType]} />
        <Select
          label="Trajectory"
          value={defenceTraj}
          options={DEFENCE_TRAJECTORIES}
          onChange={(v) => setDefenceTraj(v as DefenceTrajectory)}
        />
        <Hint text={DEFENCE_TRAJECTORY_TIPS[defenceTraj]} />
        <IconButton
          icon={Plus}
          label="Spawn Defence"
          onClick={() => spawnDefence(defenceType, defenceTraj)}
          variant="green"
          className="w-full"
        />
      </Section>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Select({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-xs outline-none cursor-pointer appearance-none transition-colors"
        style={{
          background: 'var(--bg-element)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function Hint({ text }: { text?: string }) {
  if (!text) return null
  return (
    <p className="text-[9px] leading-relaxed -mt-1 px-1" style={{ color: 'var(--text-dim)' }}>
      {text}
    </p>
  )
}
