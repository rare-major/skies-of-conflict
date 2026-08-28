import type { LucideIcon } from 'lucide-react'
import { Tooltip } from './Tooltip'

interface IconButtonProps {
  icon: LucideIcon
  label?: string
  onClick: () => void
  variant?: 'default' | 'red' | 'green' | 'accent' | 'primary' | 'ghost'
  active?: boolean
  size?: number
  className?: string
  tooltip?: string
  disabled?: boolean
}

const VARIANTS = {
  default: {
    bg: 'var(--bg-element)', hoverBg: 'var(--bg-element-hover)',
    color: 'var(--text-secondary)', border: 'var(--border)', shadow: 'none',
  },
  red: {
    bg: 'rgba(239,68,68,0.06)', hoverBg: 'rgba(239,68,68,0.18)',
    color: 'var(--text-muted)', border: 'var(--border)', shadow: 'none',
  },
  green: {
    bg: 'rgba(34,197,94,0.1)', hoverBg: 'rgba(34,197,94,0.2)',
    color: 'var(--green)', border: 'rgba(34,197,94,0.2)', shadow: 'none',
  },
  accent: {
    bg: 'var(--bg-active)', hoverBg: 'rgba(59,130,246,0.3)',
    color: 'var(--accent)', border: 'var(--border-active)', shadow: 'none',
  },
  primary: {
    bg: 'var(--accent-solid)', hoverBg: 'var(--accent)',
    color: '#ffffff', border: 'transparent', shadow: '0 0 16px var(--accent-glow), 0 2px 8px rgba(0,0,0,0.2)',
  },
  ghost: {
    bg: 'transparent', hoverBg: 'var(--bg-element)',
    color: 'var(--text-muted)', border: 'transparent', shadow: 'none',
  },
}

export function IconButton({ icon: Icon, label, onClick, variant = 'default', active, size = 14, className = '', tooltip, disabled = false }: IconButtonProps) {
  const v = active ? VARIANTS.accent : VARIANTS[variant]
  const isPrimary = variant === 'primary'
  const isRedGhost = variant === 'red'

  const btn = (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label ?? tooltip}
      title={!tooltip ? label : undefined}
      className={`icon-button icon-button--${variant} inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold
        transition-all duration-200 active:scale-[0.95] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100
        ${isPrimary ? 'py-2.5 px-4 hover:brightness-110 animate-cta-glow' : 'py-2 px-3 hover:scale-[1.02]'}
        ${className}`}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        color: v.color,
        boxShadow: v.shadow,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = v.hoverBg
        if (isRedGhost) e.currentTarget.style.color = 'var(--red)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = v.bg
        if (isRedGhost) e.currentTarget.style.color = v.color
      }}
    >
      <Icon size={isPrimary ? 16 : size} />
      {label && <span>{label}</span>}
    </button>
  )

  if (tooltip) return <Tooltip content={tooltip} position="bottom" className={className}>{btn}</Tooltip>
  return btn
}
