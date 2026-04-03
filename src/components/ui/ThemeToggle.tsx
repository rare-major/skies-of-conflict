import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
      style={{
        background: 'var(--bg-element)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Icon size={14} />
    </button>
  )
}
