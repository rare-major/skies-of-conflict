import { useState, useRef, useCallback, type ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left'
  delay?: number
  className?: string
}

export function Tooltip({ content, children, position = 'top', delay = 400, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    timer.current = setTimeout(() => setVisible(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setVisible(false)
  }, [])

  const posClass =
    position === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' :
    position === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' :
    'bottom-full mb-2 left-1/2 -translate-x-1/2'

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onPointerDown={hide}
    >
      {children}
      {visible && content && (
        <div
          className={`absolute z-[100] pointer-events-none ${posClass} animate-tooltipIn`}
          style={{ maxWidth: 220, minWidth: 100 }}
          role="tooltip"
        >
          <div
            className="rounded-xl px-3 py-2 text-[10px] leading-relaxed"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(60px) saturate(180%)',
              WebkitBackdropFilter: 'blur(60px) saturate(180%)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-panel)',
              color: 'var(--text-secondary)',
            }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
