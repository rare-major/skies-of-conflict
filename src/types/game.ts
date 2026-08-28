import type { AttackTrajectory, AttackType, DefenceTrajectory, DefenceType } from './entities'

export type GameModeId = 'duel' | 'survival' | 'coop' | 'puzzle' | 'campaign' | 'tournament' | 'async'

export type GamePhase =
  | 'mode-select'
  | 'briefing'
  | 'defender-setup'
  | 'defender-handoff'
  | 'attacker-setup'
  | 'final-lock'
  | 'battle'
  | 'debrief'

export type ForceSide = 'attack' | 'defence'

export interface ForceSelection {
  assetId: string
  count: number
}

export interface DefenceDoctrine {
  formation: 'layered' | 'ring' | 'concentrated'
  radarPolicy: 'networked' | 'always-on' | 'silent-watch'
  engagementPriority: 'time-to-impact' | 'high-value' | 'mass-threat'
  salvoPolicy: 'conserve' | 'balanced' | 'overwhelming'
  reservePercent: number
}

export interface AttackDoctrine {
  approach: 'west' | 'east' | 'north' | 'south'
  formation: 'saturation' | 'multi-axis' | 'low-observable'
  waveTiming: 'simultaneous' | 'staggered' | 'feint-first'
  altitude: 'nap-of-earth' | 'medium' | 'high'
  targetPriority: 'command' | 'radar' | 'launchers'
}

export type IntelLevel = 'none' | 'signals' | 'full-spectrum'

export interface MatchRules {
  countryId: string
  defenderBudget: number
  attackerBudget: number
  maxDefenceUnits: number
  maxAttackUnits: number
  seed: number
  objective: 'capital' | 'airbase' | 'command-node'
}

export interface MatchResult {
  winner: 'attack' | 'defence' | 'draw'
  defenderScore: number
  attackerScore: number
  intercepted: number
  impacts: number
  escaped: number
  interceptionRate: number
  duration: number
  interceptorsFired: number
  defenderSpend: number
  attackerSpend: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
}

export interface GameModeDefinition {
  id: GameModeId
  name: string
  eyebrow: string
  description: string
  status: 'ready' | 'prototype' | 'planned'
  players: string
}

export interface AttackCatalogItem {
  id: string
  side: 'attack'
  label: string
  category: string
  description: string
  cost: number
  maxCount: number
  type: AttackType
  trajectory: AttackTrajectory
}

export interface DefenceCatalogItem {
  id: string
  side: 'defence'
  label: string
  category: string
  description: string
  cost: number
  maxCount: number
  type: DefenceType
  trajectory: DefenceTrajectory
  presetId: string
}

export type ForceCatalogItem = AttackCatalogItem | DefenceCatalogItem

export interface SavedMatchPlan {
  id: string
  name: string
  createdAt: number
  rules: MatchRules
  defenceForce: ForceSelection[]
  attackForce: ForceSelection[]
  defenceDoctrine: DefenceDoctrine
  attackDoctrine: AttackDoctrine
  intelLevel: IntelLevel
}

export interface CampaignState {
  credits: number
  victories: number
  defeats: number
  unlockedOperation: number
  readiness: number
  territory: number
  intelligence: number
  cumulativeLosses: number
}

export interface TournamentState {
  defenderWins: number
  attackerWins: number
  round: number
}

export interface ModeOperation {
  id: string
  mode: 'survival' | 'coop' | 'puzzle' | 'campaign'
  name: string
  eyebrow: string
  description: string
  difficulty: 'Cadet' | 'Veteran' | 'Nightmare'
  countryId: string
  defenceForce: ForceSelection[]
  attackForce: ForceSelection[]
  defenceDoctrine: DefenceDoctrine
  attackDoctrine: AttackDoctrine
  campaignId?: string
}
