import type { LucideIcon } from 'lucide-react'
import { Tooltip } from './Tooltip'

interface SegmentOption<T> {
  value: T
  label: string
  tooltip?: string
  icon?: LucideIcon
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string | number>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div
      className="flex rounded-xl p-0.5 gap-0.5"
      style={{ background: 'var(--bg-element)', border: '1px solid var(--border)' }}
    >
      {options.map((opt) => {
        const isActive = value === opt.value
        const Icon = opt.icon

        const btn = (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold
              transition-all duration-200 cursor-pointer
              ${isActive ? '' : 'hover:bg-[var(--bg-element-hover)]'}`}
            style={{
              background: isActive ? 'var(--bg-active)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: isActive ? '0 0 8px var(--accent-glow)' : 'none',
            }}
          >
            {Icon && <Icon size={11} />}
            {opt.label}
          </button>
        )

        if (opt.tooltip) {
          return <Tooltip key={String(opt.value)} content={opt.tooltip} position="bottom">{btn}</Tooltip>
        }
        return btn
      })}
    </div>
  )
}
