import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Crosshair, Shield, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEntitySpawner } from '../../hooks/useEntitySpawner'
import { ATTACK_PRESETS } from '../../data/attackPresets'
import { DEFENCE_PRESETS } from '../../data/defencePresets'
import { ATTACK_TYPE_TIPS, DEFENCE_TYPE_TIPS, ATTACK_TRAJECTORY_TIPS, DEFENCE_TRAJECTORY_TIPS } from '../../data/tooltipDescriptions'
import type { AttackType, AttackTrajectory, DefenceType, DefenceTrajectory } from '../../types/entities'
import { IconButton } from './IconButton'
import { useScenarioStore } from '../../store/scenarioStore'

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
  const setActiveScenario = useScenarioStore((s) => s.setActive)
  const [attackType, setAttackType] = useState<AttackType>(ATTACK_PRESETS[0].type)
  const [attackTraj, setAttackTraj] = useState<AttackTrajectory>(ATTACK_PRESETS[0].defaultTrajectory)
  const [defencePresetId, setDefencePresetId] = useState(DEFENCE_PRESETS[0].id)
  const [defenceTraj, setDefenceTraj] = useState<DefenceTrajectory>(DEFENCE_PRESETS[0].defaultTrajectory)
  const defencePreset = DEFENCE_PRESETS.find((preset) => preset.id === defencePresetId) ?? DEFENCE_PRESETS[0]
  const defenceType: DefenceType = defencePreset.type

  const handleAttackTypeChange = (type: AttackType) => {
    setAttackType(type)
    const preset = ATTACK_PRESETS.find((p) => p.type === type)
    if (preset) setAttackTraj(preset.defaultTrajectory)
  }

  const handleDefencePresetChange = (presetId: string) => {
    setDefencePresetId(presetId)
    const preset = DEFENCE_PRESETS.find((p) => p.id === presetId)
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
          onClick={() => {
            setActiveScenario(null)
            spawnAttack(attackType, attackTraj)
          }}
          variant="red"
          className="w-full"
        />
      </Section>

      <Section title="Defence" icon={Shield}>
        <Select
          label="Type"
          value={defencePresetId}
          options={DEFENCE_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
          onChange={handleDefencePresetChange}
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
          onClick={() => {
            setActiveScenario(null)
            spawnDefence(defenceType, defenceTraj, undefined, undefined, defencePresetId)
          }}
          variant="green"
          className="w-full"
        />
      </Section>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <section className="spawn-section space-y-3">
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      </div>
      {children}
    </section>
  )
}

function Select({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const [activeIndex, setActiveIndex] = useState(selectedIndex)
  const rootRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const selected = options[selectedIndex]

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const choose = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setActiveIndex(index)
    setOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key === 'Tab') {
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setOpen(true)
      setActiveIndex((index) => ((open ? index : selectedIndex) + direction + options.length) % options.length)
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) choose(activeIndex)
      else {
        setActiveIndex(selectedIndex)
        setOpen(true)
      }
    }
  }

  return (
    <div className="tactical-select" ref={rootRef}>
      <span className="label" id={`${id}-label`}>{label}</span>
      <button
        type="button"
        className={`tactical-select__trigger ${open ? 'is-open' : ''}`}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
        onClick={() => {
          setActiveIndex(selectedIndex)
          setOpen((current) => !current)
        }}
        onKeyDown={handleKeyDown}
      >
        <span id={`${id}-value`}>{selected?.label}</span>
        <ChevronDown size={14} className={open ? 'rotate-180' : ''} />
      </button>
      {open && (
        <div className="tactical-select__menu animate-fadeIn" id={`${id}-listbox`} role="listbox" aria-labelledby={`${id}-label`}>
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex
            return (
              <button
                type="button"
                id={`${id}-option-${index}`}
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={`tactical-select__option ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={13} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Hint({ text }: { text?: string }) {
  if (!text) return null
  return (
    <p className="text-[10px] leading-relaxed -mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
      {text}
    </p>
  )
}
