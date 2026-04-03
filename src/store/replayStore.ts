import { create } from 'zustand'
import type { Vector3Tuple } from 'three'
import type { EntityStatus, SimEntity, InterceptorEntity } from '../types/entities'

export interface ReplayEntitySnapshot {
  id: string
  position: Vector3Tuple
  velocity: Vector3Tuple
  status: EntityStatus
  kind: 'attack' | 'defence' | 'interceptor'
}

export interface ReplayEvent {
  type: 'spawn' | 'launch' | 'hit' | 'miss' | 'impact' | 'destroyed'
  entityId: string
  time: number
  position: Vector3Tuple
}

export interface ReplayFrame {
  time: number
  entities: ReplayEntitySnapshot[]
  events: ReplayEvent[]
}

export interface PreReplaySnapshot {
  entities: SimEntity[]
  interceptors: InterceptorEntity[]
}

const MAX_FRAMES = 3600

interface ReplayStore {
  isRecording: boolean
  frames: ReplayFrame[]
  currentFrameIndex: number
  isReplaying: boolean
  hasRecording: boolean
  preReplaySnapshot: PreReplaySnapshot | null

  startRecording: () => void
  stopRecording: () => void
  toggleRecording: () => void
  recordFrame: (frame: ReplayFrame) => void
  startReplay: () => void
  stopReplay: () => void
  seekTo: (index: number) => void
  advanceFrame: (count: number) => void
  setPreReplaySnapshot: (snapshot: PreReplaySnapshot) => void
  clear: () => void
}

export const useReplayStore = create<ReplayStore>((set, get) => ({
  isRecording: false,
  frames: [],
  currentFrameIndex: 0,
  isReplaying: false,
  hasRecording: false,
  preReplaySnapshot: null,

  startRecording: () => set({ isRecording: true, frames: [], hasRecording: false }),
  stopRecording: () => set((s) => ({
    isRecording: false,
    hasRecording: s.frames.length > 0,
  })),
  toggleRecording: () => {
    const s = get()
    if (s.isRecording) {
      s.stopRecording()
    } else {
      s.startRecording()
    }
  },

  recordFrame: (frame) => set((s) => {
    const frames = s.frames.length >= MAX_FRAMES
      ? [...s.frames.slice(1), frame]
      : [...s.frames, frame]
    return { frames }
  }),

  startReplay: () => set({ isReplaying: true, currentFrameIndex: 0 }),
  stopReplay: () => set({ isReplaying: false }),
  seekTo: (index) => set({ currentFrameIndex: index }),
  advanceFrame: (count) => set((s) => ({
    currentFrameIndex: Math.min(s.currentFrameIndex + count, s.frames.length - 1),
  })),
  setPreReplaySnapshot: (snapshot) => set({ preReplaySnapshot: snapshot }),
  clear: () => set({ frames: [], currentFrameIndex: 0, isReplaying: false, hasRecording: false, preReplaySnapshot: null }),
}))
