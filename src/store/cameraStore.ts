import { create } from 'zustand'

export type CameraMode = 'free' | 'combat' | 'follow' | 'cinematic'

interface CameraStore {
  mode: CameraMode
  followEntityId: string | null
  shakeIntensity: number
  setMode: (mode: CameraMode) => void
  setFollowEntity: (id: string | null) => void
  triggerShake: (intensity: number) => void
  decayShake: (dt: number) => void
}

export const useCameraStore = create<CameraStore>((set) => ({
  mode: 'free',
  followEntityId: null,
  shakeIntensity: 0,
  setMode: (mode) => set({ mode }),
  setFollowEntity: (followEntityId) => set({ followEntityId }),
  triggerShake: (intensity) => set({ shakeIntensity: intensity }),
  decayShake: (dt) => set((s) => ({
    shakeIntensity: Math.max(0, s.shakeIntensity - dt * 8),
  })),
}))
