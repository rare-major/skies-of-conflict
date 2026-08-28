import { create } from 'zustand'
import type {
  AiCommanderId,
  CommandLinkState,
  CommanderProfile,
  DoctrineUpgradeId,
  RadioMessage,
  SensorTrack,
  TacticalPoint,
  TacticalShape,
  TacticalTool,
  TimeOfDay,
  WeatherPreset,
} from '../types/operations'

const STORAGE_KEY = 'skies-of-conflict-operations-v1'

const defaultProfile: CommanderProfile = {
  callsign: 'SKYWARD', rating: 1000, xp: 0, level: 1, victories: 0,
  operations: 0, dailyStreak: 0, lastDailyDate: null, medals: [], doctrines: ['sensor-fusion'],
}

interface OperationsPreferences {
  fogOfWar: boolean
  directorEnabled: boolean
  broadcastMode: boolean
  radioChatter: boolean
  weather: WeatherPreset
  timeOfDay: TimeOfDay
  aiCommander: AiCommanderId
  profile: CommanderProfile
  activeCampaignId: string
  activeDoctrine: DoctrineUpgradeId
}

function loadPreferences(): OperationsPreferences {
  const fallback: OperationsPreferences = {
    fogOfWar: true,
    directorEnabled: true,
    broadcastMode: false,
    radioChatter: true,
    weather: 'clear',
    timeOfDay: 'dusk',
    aiCommander: 'adaptive',
    profile: defaultProfile,
    activeCampaignId: 'glass-horizon',
    activeDoctrine: 'sensor-fusion',
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<OperationsPreferences>
    return { ...fallback, ...parsed, profile: { ...defaultProfile, ...parsed.profile } }
  } catch {
    return fallback
  }
}

function persist(state: OperationsPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const saved = loadPreferences()

interface OperationsStore extends OperationsPreferences {
  windStrength: number
  tacticalTool: TacticalTool
  tacticalShapes: TacticalShape[]
  draftPoints: TacticalPoint[]
  sensorTracks: Record<string, SensorTrack>
  radioMessages: RadioMessage[]
  briefingVisible: boolean
  commandLink: CommandLinkState

  setFogOfWar: (value: boolean) => void
  setDirectorEnabled: (value: boolean) => void
  setBroadcastMode: (value: boolean) => void
  setRadioChatter: (value: boolean) => void
  setWeather: (value: WeatherPreset) => void
  setTimeOfDay: (value: TimeOfDay) => void
  setWindStrength: (value: number) => void
  setAiCommander: (value: AiCommanderId) => void
  setActiveCampaign: (id: string) => void
  setActiveDoctrine: (id: DoctrineUpgradeId) => void
  setTacticalTool: (tool: TacticalTool) => void
  addDraftPoint: (point: TacticalPoint) => void
  undoDraftPoint: () => void
  commitDraft: () => void
  clearTacticalPlan: () => void
  importTacticalPlan: (shapes: TacticalShape[]) => void
  updateSensorTrack: (track: SensorTrack) => void
  pruneSensorTracks: (entityIds: string[]) => void
  clearSensorTracks: () => void
  addRadioMessage: (message: Omit<RadioMessage, 'id'>) => void
  clearRadioMessages: () => void
  setBriefingVisible: (value: boolean) => void
  recordOutcome: (winner: 'attack' | 'defence' | 'draw', grade: string, interceptionRate: number, dailyDate?: string) => void
  resetProfile: () => void
  createRoom: (role?: CommandLinkState['role']) => void
  joinRoom: (code: string, role?: CommandLinkState['role']) => void
  leaveRoom: () => void
  setPeerCount: (count: number) => void
}

function preferences(state: OperationsStore): OperationsPreferences {
  return {
    fogOfWar: state.fogOfWar,
    directorEnabled: state.directorEnabled,
    broadcastMode: state.broadcastMode,
    radioChatter: state.radioChatter,
    weather: state.weather,
    timeOfDay: state.timeOfDay,
    aiCommander: state.aiCommander,
    profile: state.profile,
    activeCampaignId: state.activeCampaignId,
    activeDoctrine: state.activeDoctrine,
  }
}

export const useOperationsStore = create<OperationsStore>((set, get) => ({
  ...saved,
  windStrength: 0.3,
  tacticalTool: 'route',
  tacticalShapes: [],
  draftPoints: [],
  sensorTracks: {},
  radioMessages: [],
  briefingVisible: false,
  commandLink: { status: 'offline', roomCode: '', role: 'commander', peerCount: 0 },

  setFogOfWar: (fogOfWar) => { set({ fogOfWar }); persist(preferences({ ...get(), fogOfWar })) },
  setDirectorEnabled: (directorEnabled) => { set({ directorEnabled }); persist(preferences({ ...get(), directorEnabled })) },
  setBroadcastMode: (broadcastMode) => { set({ broadcastMode }); persist(preferences({ ...get(), broadcastMode })) },
  setRadioChatter: (radioChatter) => { set({ radioChatter }); persist(preferences({ ...get(), radioChatter })) },
  setWeather: (weather) => { set({ weather }); persist(preferences({ ...get(), weather })) },
  setTimeOfDay: (timeOfDay) => { set({ timeOfDay }); persist(preferences({ ...get(), timeOfDay })) },
  setWindStrength: (windStrength) => set({ windStrength }),
  setAiCommander: (aiCommander) => { set({ aiCommander }); persist(preferences({ ...get(), aiCommander })) },
  setActiveCampaign: (activeCampaignId) => { set({ activeCampaignId }); persist(preferences({ ...get(), activeCampaignId })) },
  setActiveDoctrine: (activeDoctrine) => {
    if (!get().profile.doctrines.includes(activeDoctrine)) return
    set({ activeDoctrine })
    persist(preferences({ ...get(), activeDoctrine }))
  },
  setTacticalTool: (tacticalTool) => set({ tacticalTool, draftPoints: [] }),
  addDraftPoint: (point) => set((state) => ({ draftPoints: [...state.draftPoints, point] })),
  undoDraftPoint: () => set((state) => ({ draftPoints: state.draftPoints.slice(0, -1) })),
  commitDraft: () => set((state) => {
    const minimum = state.tacticalTool === 'route' ? 2 : 1
    if (state.draftPoints.length < minimum) return state
    const labelBase = state.tacticalTool === 'route' ? 'Flight route' : state.tacticalTool === 'patrol' ? 'CAP orbit' : state.tacticalTool === 'defence-zone' ? 'Defence sector' : 'No-fly area'
    const shape: TacticalShape = {
      id: crypto.randomUUID(), kind: state.tacticalTool, label: `${labelBase} ${state.tacticalShapes.length + 1}`,
      points: state.draftPoints, createdAt: Date.now(),
    }
    return { tacticalShapes: [...state.tacticalShapes, shape], draftPoints: [] }
  }),
  clearTacticalPlan: () => set({ tacticalShapes: [], draftPoints: [] }),
  importTacticalPlan: (tacticalShapes) => set({ tacticalShapes, draftPoints: [] }),
  updateSensorTrack: (track) => set((state) => ({ sensorTracks: { ...state.sensorTracks, [track.entityId]: track } })),
  pruneSensorTracks: (entityIds) => set((state) => ({ sensorTracks: Object.fromEntries(Object.entries(state.sensorTracks).filter(([id]) => entityIds.includes(id))) })),
  clearSensorTracks: () => set({ sensorTracks: {} }),
  addRadioMessage: (message) => set((state) => ({ radioMessages: [...state.radioMessages.slice(-11), { ...message, id: crypto.randomUUID() }] })),
  clearRadioMessages: () => set({ radioMessages: [] }),
  setBriefingVisible: (briefingVisible) => set({ briefingVisible }),
  recordOutcome: (winner, grade, interceptionRate, dailyDate) => set((state) => {
    const won = winner === 'defence'
    const medals = new Set(state.profile.medals)
    if (grade === 'S') medals.add('Aegis Citation')
    if (interceptionRate === 100) medals.add('Untouchable Sky')
    if (state.profile.operations + 1 >= 10) medals.add('Theatre Veteran')
    let dailyStreak = state.profile.dailyStreak
    if (dailyDate && state.profile.lastDailyDate !== dailyDate) dailyStreak += 1
    if (dailyStreak >= 3) medals.add('Three-Day Watch')
    const doctrines = new Set(state.profile.doctrines)
    const operationNumber = state.profile.operations + 1
    if (operationNumber >= 2) doctrines.add('rapid-response')
    if (operationNumber >= 4) doctrines.add('hardened-network')
    if (operationNumber >= 7) doctrines.add('terminal-focus')
    const xp = state.profile.xp + (won ? 180 : winner === 'draw' ? 110 : 70) + Math.round(interceptionRate * 0.8)
    const profile: CommanderProfile = {
      ...state.profile,
      xp,
      level: Math.max(1, Math.floor(xp / 800) + 1),
      rating: Math.max(700, state.profile.rating + (won ? 24 : winner === 'draw' ? 2 : -14)),
      victories: state.profile.victories + (won ? 1 : 0),
      operations: state.profile.operations + 1,
      dailyStreak,
      lastDailyDate: dailyDate || state.profile.lastDailyDate,
      medals: [...medals],
      doctrines: [...doctrines],
    }
    const next = { ...state, profile }
    persist(preferences(next))
    return { profile }
  }),
  resetProfile: () => set((state) => {
    const profile = { ...defaultProfile, medals: [...defaultProfile.medals], doctrines: [...defaultProfile.doctrines] }
    const next = { ...state, profile, activeDoctrine: 'sensor-fusion' as const }
    persist(preferences(next))
    return { profile, activeDoctrine: 'sensor-fusion' as const }
  }),
  createRoom: (role = 'commander') => set({ commandLink: { status: 'hosting', roomCode: Math.random().toString(36).slice(2, 8).toUpperCase(), role, peerCount: 0 } }),
  joinRoom: (roomCode, role = 'wingman') => set({ commandLink: { status: 'joined', roomCode: roomCode.trim().toUpperCase().slice(0, 8), role, peerCount: 1 } }),
  leaveRoom: () => set({ commandLink: { status: 'offline', roomCode: '', role: 'commander', peerCount: 0 } }),
  setPeerCount: (peerCount) => set((state) => ({ commandLink: { ...state.commandLink, peerCount } })),
}))
