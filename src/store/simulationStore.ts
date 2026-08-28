import { create } from 'zustand'
import type { SimEntity, InterceptorEntity } from '../types/entities'

export interface InitialSnapshot {
  entities: SimEntity[]
  interceptors: InterceptorEntity[]
}

interface SimulationStore {
  isRunning: boolean
  timeScale: number
  elapsed: number
  showTrails: boolean
  showRadar: boolean
  showCollisions: boolean
  showTerrain: boolean
  showDomeGrid: boolean
  initialSnapshot: InitialSnapshot | null

  start: () => void
  pause: () => void
  reset: () => void
  toggleRunning: () => void
  setTimeScale: (s: number) => void
  tick: (dt: number) => void
  setShowTrails: (v: boolean) => void
  setShowRadar: (v: boolean) => void
  setShowCollisions: (v: boolean) => void
  setShowTerrain: (v: boolean) => void
  setShowDomeGrid: (v: boolean) => void
  setInitialSnapshot: (snap: InitialSnapshot | null) => void
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  isRunning: false,
  timeScale: 1,
  elapsed: 0,
  showTrails: true,
  showRadar: true,
  showCollisions: false,
  showTerrain: true,
  showDomeGrid: false,
  initialSnapshot: null,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => set({ isRunning: false, elapsed: 0 }),
  toggleRunning: () => set((s) => ({ isRunning: !s.isRunning })),
  setTimeScale: (timeScale) => set({ timeScale }),
  tick: (dt) => set((s) => ({ elapsed: s.elapsed + dt })),
  setShowTrails: (showTrails) => set({ showTrails }),
  setShowRadar: (showRadar) => set({ showRadar }),
  setShowCollisions: (showCollisions) => set({ showCollisions }),
  setShowTerrain: (showTerrain) => set({ showTerrain }),
  setShowDomeGrid: (showDomeGrid) => set({ showDomeGrid }),
  setInitialSnapshot: (initialSnapshot) => set({ initialSnapshot }),
}))
