import { create } from 'zustand'

const WELCOME_SEEN_KEY = 'skiesOfConflict.welcomeSeen'

function hasSeenWelcome() {
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

interface UIStore {
  commandPanelCollapsed: boolean
  missionStatusCollapsed: boolean
  welcomeVisible: boolean
  setCommandPanelCollapsed: (collapsed: boolean) => void
  setMissionStatusCollapsed: (collapsed: boolean) => void
  collapseForEngagement: () => void
  openWelcome: () => void
  dismissWelcome: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  commandPanelCollapsed: false,
  missionStatusCollapsed: false,
  welcomeVisible: !hasSeenWelcome(),
  setCommandPanelCollapsed: (commandPanelCollapsed) => set({ commandPanelCollapsed }),
  setMissionStatusCollapsed: (missionStatusCollapsed) => set({ missionStatusCollapsed }),
  collapseForEngagement: () => set({
    commandPanelCollapsed: true,
    missionStatusCollapsed: true,
  }),
  openWelcome: () => set({ welcomeVisible: true }),
  dismissWelcome: () => {
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, '1')
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
    set({ welcomeVisible: false })
  },
}))
