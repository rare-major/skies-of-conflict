import { create } from 'zustand'
import type {
  AttackDoctrine,
  DefenceDoctrine,
  ForceSelection,
  ForceSide,
  GameModeId,
  GamePhase,
  IntelLevel,
  MatchResult,
  MatchRules,
  SavedMatchPlan,
  CampaignState,
  TournamentState,
} from '../types/game'

const PLAN_STORAGE_KEY = 'skyshield-command-plans-v1'
const META_STORAGE_KEY = 'skyshield-game-progress-v1'

const defaultRules: MatchRules = {
  countryId: 'india',
  defenderBudget: 1200,
  attackerBudget: 1200,
  maxDefenceUnits: 12,
  maxAttackUnits: 16,
  seed: 41073,
  objective: 'capital',
}

const defaultDefenceDoctrine: DefenceDoctrine = {
  formation: 'layered',
  radarPolicy: 'networked',
  engagementPriority: 'time-to-impact',
  salvoPolicy: 'balanced',
  reservePercent: 20,
}

const defaultAttackDoctrine: AttackDoctrine = {
  approach: 'west',
  formation: 'multi-axis',
  waveTiming: 'simultaneous',
  altitude: 'medium',
  targetPriority: 'command',
}

function loadPlans(): SavedMatchPlan[] {
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadProgress(): { campaign: CampaignState; tournament: TournamentState } {
  const fallback = {
    campaign: { credits: 1200, victories: 0, defeats: 0, unlockedOperation: 0, readiness: 100, territory: 50, intelligence: 0, cumulativeLosses: 0 },
    tournament: { defenderWins: 0, attackerWins: 0, round: 1 },
  }
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return {
      campaign: { ...fallback.campaign, ...parsed.campaign },
      tournament: { ...fallback.tournament, ...parsed.tournament },
    }
  } catch {
    return fallback
  }
}

const savedProgress = loadProgress()

interface GameModeStore {
  selectedMode: GameModeId | null
  phase: GamePhase
  rules: MatchRules
  defenceForce: ForceSelection[]
  attackForce: ForceSelection[]
  defenceDoctrine: DefenceDoctrine
  attackDoctrine: AttackDoctrine
  intelLevel: IntelLevel
  result: MatchResult | null
  savedPlans: SavedMatchPlan[]
  activeOperationName: string
  campaign: CampaignState
  tournament: TournamentState

  selectMode: (mode: GameModeId) => void
  setPhase: (phase: GamePhase) => void
  setRules: (rules: Partial<MatchRules>) => void
  setForceCount: (side: ForceSide, assetId: string, count: number) => void
  setDefenceDoctrine: (doctrine: Partial<DefenceDoctrine>) => void
  setAttackDoctrine: (doctrine: Partial<AttackDoctrine>) => void
  setIntelLevel: (level: IntelLevel) => void
  setResult: (result: MatchResult | null) => void
  setOperationName: (name: string) => void
  resetMatch: () => void
  savePlan: (name: string) => void
  loadPlan: (id: string) => void
  deletePlan: (id: string) => void
  setForces: (defence: ForceSelection[], attack: ForceSelection[]) => void
  recordMetaResult: (result: MatchResult) => void
  resetCampaign: () => void
}

export const useGameModeStore = create<GameModeStore>((set, get) => ({
  selectedMode: null,
  phase: 'mode-select',
  rules: defaultRules,
  defenceForce: [],
  attackForce: [],
  defenceDoctrine: defaultDefenceDoctrine,
  attackDoctrine: defaultAttackDoctrine,
  intelLevel: 'none',
  result: null,
  savedPlans: loadPlans(),
  activeOperationName: 'Operation Glass Horizon',
  campaign: savedProgress.campaign,
  tournament: savedProgress.tournament,

  selectMode: (selectedMode) => set({ selectedMode, phase: 'briefing', result: null }),
  setPhase: (phase) => set({ phase }),
  setRules: (rules) => set((state) => ({ rules: { ...state.rules, ...rules } })),
  setForceCount: (side, assetId, count) => set((state) => {
    const key = side === 'attack' ? 'attackForce' : 'defenceForce'
    const force = state[key]
    const withoutAsset = force.filter((item) => item.assetId !== assetId)
    return { [key]: count > 0 ? [...withoutAsset, { assetId, count }] : withoutAsset } as Pick<GameModeStore, typeof key>
  }),
  setDefenceDoctrine: (doctrine) => set((state) => ({ defenceDoctrine: { ...state.defenceDoctrine, ...doctrine } })),
  setAttackDoctrine: (doctrine) => set((state) => ({ attackDoctrine: { ...state.attackDoctrine, ...doctrine } })),
  setIntelLevel: (intelLevel) => set({ intelLevel }),
  setResult: (result) => set({ result }),
  setOperationName: (activeOperationName) => set({ activeOperationName }),
  resetMatch: () => set({
    selectedMode: null,
    phase: 'mode-select',
    rules: { ...defaultRules, seed: Math.floor(10000 + Math.random() * 89999) },
    defenceForce: [],
    attackForce: [],
    defenceDoctrine: defaultDefenceDoctrine,
    attackDoctrine: defaultAttackDoctrine,
    intelLevel: 'none',
    result: null,
    activeOperationName: 'Operation Glass Horizon',
  }),
  savePlan: (name) => {
    const state = get()
    const plan: SavedMatchPlan = {
      id: crypto.randomUUID(),
      name: name.trim() || state.activeOperationName,
      createdAt: Date.now(),
      rules: state.rules,
      defenceForce: state.defenceForce,
      attackForce: state.attackForce,
      defenceDoctrine: state.defenceDoctrine,
      attackDoctrine: state.attackDoctrine,
      intelLevel: state.intelLevel,
    }
    const savedPlans = [plan, ...state.savedPlans].slice(0, 12)
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(savedPlans))
    set({ savedPlans })
  },
  loadPlan: (id) => {
    const plan = get().savedPlans.find((candidate) => candidate.id === id)
    if (!plan) return
    set({
      selectedMode: 'duel',
      phase: 'final-lock',
      activeOperationName: plan.name,
      rules: plan.rules,
      defenceForce: plan.defenceForce,
      attackForce: plan.attackForce,
      defenceDoctrine: plan.defenceDoctrine,
      attackDoctrine: plan.attackDoctrine,
      intelLevel: plan.intelLevel,
      result: null,
    })
  },
  deletePlan: (id) => {
    const savedPlans = get().savedPlans.filter((plan) => plan.id !== id)
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(savedPlans))
    set({ savedPlans })
  },
  setForces: (defenceForce, attackForce) => set({ defenceForce, attackForce }),
  recordMetaResult: (result) => set((state) => {
    let campaign = state.campaign
    let tournament = state.tournament
    if (state.selectedMode === 'campaign') {
      const won = result.winner === 'defence'
      campaign = {
        credits: Math.max(500, campaign.credits + (won ? 240 : -120)),
        victories: campaign.victories + (won ? 1 : 0),
        defeats: campaign.defeats + (won ? 0 : 1),
        unlockedOperation: Math.min(2, campaign.unlockedOperation + (won ? 1 : 0)),
        readiness: Math.max(20, Math.min(100, campaign.readiness + (won ? 7 : -14) - result.impacts * 3)),
        territory: Math.max(0, Math.min(100, campaign.territory + (won ? 8 : -7))),
        intelligence: Math.min(100, campaign.intelligence + (result.grade === 'S' ? 18 : result.grade === 'A' ? 12 : 6)),
        cumulativeLosses: campaign.cumulativeLosses + result.impacts,
      }
    }
    if (state.selectedMode === 'tournament') {
      tournament = {
        defenderWins: tournament.defenderWins + (result.winner === 'defence' ? 1 : 0),
        attackerWins: tournament.attackerWins + (result.winner === 'attack' ? 1 : 0),
        round: tournament.round + 1,
      }
    }
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify({ campaign, tournament }))
    return { campaign, tournament }
  }),
  resetCampaign: () => set((state) => {
    const campaign = { credits: 1200, victories: 0, defeats: 0, unlockedOperation: 0, readiness: 100, territory: 50, intelligence: 0, cumulativeLosses: 0 }
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify({ campaign, tournament: state.tournament }))
    return { campaign }
  }),
}))
