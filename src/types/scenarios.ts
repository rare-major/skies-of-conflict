import type { AttackType, AttackTrajectory, DefenceType, DefenceTrajectory, EntityParams } from './entities'
import type { Vector3Tuple } from 'three'

export interface ScenarioAttackEntry {
  type: AttackType
  trajectory: AttackTrajectory
  position: Vector3Tuple
  velocity: Vector3Tuple
  waypoints?: Vector3Tuple[]
  isDecoy?: boolean
  count?: number
  spacing?: number
  launchDelay?: number
  params?: Partial<EntityParams>
}

export interface ScenarioDefenceEntry {
  type: DefenceType
  trajectory: DefenceTrajectory
  position: Vector3Tuple
  facing?: Vector3Tuple
  presetId?: string
  params?: Partial<EntityParams>
}

export interface Scenario {
  id: string
  name: string
  description: string
  simulationSeed?: number
  attacks: ScenarioAttackEntry[]
  defences: ScenarioDefenceEntry[]
}
