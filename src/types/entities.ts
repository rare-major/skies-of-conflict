import type { Vector3Tuple } from 'three'

export type AttackType =
  | 'rocket' | 'ballistic-missile' | 'cruise-missile' | 'hypersonic-glide'
  | 'anti-radiation-missile' | 'recon-drone' | 'kamikaze-drone' | 'swarm-drone'
  | 'stealth-drone' | 'loitering-munition' | 'fighter-jet' | 'stealth-aircraft'
  | 'bomber' | 'ew-aircraft' | 'glide-bomb' | 'laser-guided-bomb'
  | 'gps-guided-bomb' | 'cluster-munition' | 'decoy' | 'naval-missile'
  | 'f-35' | 'f-22' | 'su-30' | 'su-57' | 'rafale' | 'j-35'

export type DefenceType =
  | 'long-range-sam' | 'medium-range-sam' | 'short-range-sam'
  | 'ciws' | 'aa-gun' | 'anti-drone-gun'
  | 'signal-jammer' | 'laser-defence'

export type AttackTrajectory =
  | 'straight' | 'ballistic' | 'cruise' | 'zigzag'
  | 'waypoint' | 'dive' | 'loitering' | 'swarm'

export type DefenceTrajectory =
  | 'direct-intercept' | 'predictive-intercept' | 'proportional-nav'
  | 'radar-guided' | 'heat-seeking' | 'burst-fire'

export type EntityStatus = 'active' | 'intercepted' | 'destroyed' | 'missed' | 'exploded'

export type GuidanceSystem = 'unguided' | 'radar' | 'infrared' | 'gps' | 'laser' | 'inertial' | 'command'

export interface Payload {
  type: 'aa-missile' | 'ag-missile' | 'bomb'
  count: number
  speed: number
  killRadius: number
  trajectory: AttackTrajectory
}

export interface EntityParams {
  speed: number
  acceleration: number
  turnRate: number
  detectionRange: number
  stealthFactor: number
  accuracy: number
  reactionDelay: number
  guidanceSystem: GuidanceSystem
  maxRange: number
  killRadius: number
  cooldown: number
  maxTrackedTargets: number
  fovAngle: number
  jammingStrength: number
  ammo: number
  maxAmmo: number
  reloadTime: number
  payloadCapacity: number
  payloads: Payload[]
}

export interface AttackEntity {
  id: string
  kind: 'attack'
  type: AttackType
  trajectory: AttackTrajectory
  position: Vector3Tuple
  velocity: Vector3Tuple
  params: EntityParams
  status: EntityStatus
  targetId?: string
  trail: Vector3Tuple[]
  spawnTime: number
  isDecoy: boolean
  waypoints?: Vector3Tuple[]
  loiterCenter?: Vector3Tuple
  loiterRadius?: number
  diveTriggered?: boolean
  parentJetId?: string
}

export interface DefenceEntity {
  id: string
  kind: 'defence'
  type: DefenceType
  trajectory: DefenceTrajectory
  position: Vector3Tuple
  velocity: Vector3Tuple
  params: EntityParams
  status: EntityStatus
  targetId?: string
  trail: Vector3Tuple[]
  spawnTime: number
  isInterceptor: boolean
  lastFireTime: number
  trackedTargets: string[]
  engagedTarget?: string
  interceptors: string[]
  isReloading: boolean
  reloadStartTime: number
  facing: Vector3Tuple
}

export type SimEntity = AttackEntity | DefenceEntity

export interface InterceptorEntity {
  id: string
  kind: 'interceptor'
  parentId: string
  trajectory: DefenceTrajectory
  position: Vector3Tuple
  velocity: Vector3Tuple
  targetId: string
  speed: number
  turnRate: number
  accuracy: number
  killRadius: number
  status: EntityStatus
  trail: Vector3Tuple[]
  spawnTime: number
}

export type AnyEntity = SimEntity | InterceptorEntity
