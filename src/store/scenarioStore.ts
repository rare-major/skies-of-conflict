import { create } from 'zustand'
import type { Scenario } from '../types/scenarios'
import { PRESET_SCENARIOS } from '../data/scenarios'

const STORAGE_KEY = 'air-warfare-saved-scenarios'

function loadSaved(): Scenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

interface ScenarioStore {
  presets: Scenario[]
  saved: Scenario[]
  activeScenarioId: string | null
  activeScenario: Scenario | null

  loadScenario: (id: string) => Scenario | undefined
  saveScenario: (scenario: Scenario) => void
  deleteSaved: (id: string) => void
  setActive: (id: string | null) => void
  setActiveScenario: (scenario: Scenario | null) => void
}

export const useScenarioStore = create<ScenarioStore>((set, get) => ({
  presets: PRESET_SCENARIOS,
  saved: loadSaved(),
  activeScenarioId: null,
  activeScenario: null,

  loadScenario: (id) => {
    const all = [...get().presets, ...get().saved]
    return all.find((s) => s.id === id)
  },

  saveScenario: (scenario) => {
    set((s) => {
      const existing = s.saved.filter((sc) => sc.id !== scenario.id)
      const updated = [...existing, scenario]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return { saved: updated }
    })
  },

  deleteSaved: (id) => {
    set((s) => {
      const updated = s.saved.filter((sc) => sc.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return { saved: updated }
    })
  },

  setActive: (id) => set((state) => ({
    activeScenarioId: id,
    activeScenario: id ? [...state.presets, ...state.saved].find((scenario) => scenario.id === id) ?? null : null,
  })),
  setActiveScenario: (activeScenario) => set({ activeScenarioId: activeScenario?.id ?? null, activeScenario }),
}))
