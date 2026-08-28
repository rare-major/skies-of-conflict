import type { Vector3Tuple } from 'three'

export type WeatherPreset = 'clear' | 'overcast' | 'storm' | 'monsoon' | 'dust'
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'
export type TacticalTool = 'route' | 'patrol' | 'defence-zone' | 'no-fly'
export type TrackClassification = 'unconfirmed' | 'probable' | 'classified' | 'identified'
export type AiCommanderId = 'adaptive' | 'aggressive' | 'deceptive' | 'saturation' | 'stealth'
export type DoctrineUpgradeId = 'sensor-fusion' | 'rapid-response' | 'hardened-network' | 'terminal-focus'

export interface TacticalPoint {
  x: number
  z: number
}

export interface TacticalShape {
  id: string
  kind: TacticalTool
  label: string
  points: TacticalPoint[]
  createdAt: number
}

export interface SensorTrack {
  entityId: string
  confidence: number
  classification: TrackClassification
  lastSeen: number
  estimatedPosition: Vector3Tuple
  truePosition?: Vector3Tuple
  label: string
  jammed: boolean
}

export interface CommanderProfile {
  callsign: string
  rating: number
  xp: number
  level: number
  victories: number
  operations: number
  dailyStreak: number
  lastDailyDate: string | null
  medals: string[]
  doctrines: DoctrineUpgradeId[]
}

export interface CampaignTheatre {
  id: string
  name: string
  era: string
  description: string
  tone: string
  operations: number
}

export interface CommandLinkState {
  status: 'offline' | 'hosting' | 'joined'
  roomCode: string
  role: 'commander' | 'wingman' | 'spectator'
  peerCount: number
}

export interface RadioMessage {
  id: string
  time: number
  speaker: string
  message: string
  tone: 'intel' | 'warning' | 'success' | 'system'
}
