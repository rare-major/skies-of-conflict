import type { LucideIcon } from 'lucide-react'
import { Tooltip } from './Tooltip'

interface ToggleSwitchProps {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  icon?: LucideIcon
  tooltip?: string
}

export function ToggleSwitch({ label, value, onChange, icon: Icon, tooltip }: ToggleSwitchProps) {
  const inner = (
    <label className="flex items-center justify-between cursor-pointer py-1 w-full group">
      <span className="flex items-center gap-2 text-[11px] font-medium transition-colors duration-200"
        style={{ color: value ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
        {Icon && (
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
            style={{
              background: value ? 'var(--bg-active)' : 'var(--bg-element)',
              color: value ? 'var(--accent)' : 'var(--text-dim)',
            }}
          >
            <Icon size={12} />
          </span>
        )}
        {label}
      </span>
      <div
        onClick={(e) => { e.preventDefault(); onChange(!value) }}
        className="w-9 h-[20px] rounded-full transition-all duration-300 relative cursor-pointer flex-shrink-0"
        style={{
          background: value ? 'var(--accent-solid)' : 'var(--bg-element)',
          boxShadow: value ? '0 0 8px var(--accent-glow)' : 'inset 0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <div
          className="w-4 h-4 rounded-full absolute top-[2px] transition-all duration-300 ease-out"
          style={{
            left: value ? '18px' : '2px',
            background: value ? '#ffffff' : 'var(--text-muted)',
            boxShadow: value ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
          }}
        />
      </div>
    </label>
  )

  if (tooltip) return <Tooltip content={tooltip} position="left">{inner}</Tooltip>
  return inner
}
