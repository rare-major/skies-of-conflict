import { create } from 'zustand'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'skyshield-theme'

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* noop */ }
  return 'dark'
}

interface ThemeStore {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: loadTheme(),
  toggle: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    return { theme: next }
  }),
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    set({ theme })
  },
}))
