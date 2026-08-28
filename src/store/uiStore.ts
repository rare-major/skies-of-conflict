import { create } from 'zustand'

interface UIStore {
  commandPanelCollapsed: boolean
  missionStatusCollapsed: boolean
  setCommandPanelCollapsed: (collapsed: boolean) => void
  setMissionStatusCollapsed: (collapsed: boolean) => void
  collapseForEngagement: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  commandPanelCollapsed: false,
  missionStatusCollapsed: false,
  setCommandPanelCollapsed: (commandPanelCollapsed) => set({ commandPanelCollapsed }),
  setMissionStatusCollapsed: (missionStatusCollapsed) => set({ missionStatusCollapsed }),
  collapseForEngagement: () => set({
    commandPanelCollapsed: true,
    missionStatusCollapsed: true,
  }),
}))
