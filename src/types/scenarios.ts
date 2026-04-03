import type { AttackType, AttackTrajectory, DefenceType, DefenceTrajectory } from './entities'
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
}

export interface ScenarioDefenceEntry {
  type: DefenceType
  trajectory: DefenceTrajectory
  position: Vector3Tuple
  facing?: Vector3Tuple
}

export interface Scenario {
  id: string
  name: string
  description: string
  attacks: ScenarioAttackEntry[]
  defences: ScenarioDefenceEntry[]
}
