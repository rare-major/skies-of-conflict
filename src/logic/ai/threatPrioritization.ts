import type { Vector3Tuple } from 'three'
import { distance, length, sub } from '../physics/kinematics'
import type { AttackEntity } from '../../types/entities'

export interface ThreatScore {
  entityId: string
  score: number
  distance: number
  speed: number
  timeToImpact: number
  isDecoyProbability: number
}

const W_DISTANCE = 1.0
const W_SPEED = 0.5
const W_TIME_TO_IMPACT = 2.0

const HIGH_VALUE_TYPES = new Set([
  'ballistic-missile', 'hypersonic-glide', 'fighter-jet', 'stealth-aircraft',
  'bomber', 'ew-aircraft', 'f-35', 'f-22', 'su-30', 'su-57', 'rafale', 'j-35',
])

/**
 * Score threats for a defence unit.
 * Higher score = higher priority.
 */
export function scoreThreat(
  defencePos: Vector3Tuple,
  protectedPos: Vector3Tuple,
  attack: AttackEntity,
  priority: 'time-to-impact' | 'high-value' | 'mass-threat' = 'time-to-impact',
): ThreatScore {
  const dist = distance(defencePos, attack.position)
  const speed = length(attack.velocity)

  const toProtected = sub(protectedPos, attack.position)
  const distToProtected = length(toProtected)
  const timeToImpact = speed > 0 ? distToProtected / speed : Infinity

  // Decoy probability: negative stealth = high RCS = suspicious
  const isDecoyProbability = attack.isDecoy
    ? Math.min(0.9, 0.3 + Math.max(0, -attack.params.stealthFactor))
    : Math.max(0, -attack.params.stealthFactor * 0.3)

  let score =
    W_DISTANCE * (1 / Math.max(dist, 1)) * 1000 +
    W_SPEED * speed +
    W_TIME_TO_IMPACT * (1 / Math.max(timeToImpact, 0.1)) * 100

  if (priority === 'high-value' && HIGH_VALUE_TYPES.has(attack.type)) score += 240
  if (priority === 'mass-threat' && (attack.type === 'rocket' || attack.type.includes('drone') || attack.isDecoy)) score += 115

  return {
    entityId: attack.id,
    score,
    distance: dist,
    speed,
    timeToImpact,
    isDecoyProbability,
  }
}

/**
 * Rank all threats and return sorted (highest priority first).
 */
export function rankThreats(
  defencePos: Vector3Tuple,
  protectedPos: Vector3Tuple,
  attacks: AttackEntity[],
  priority: 'time-to-impact' | 'high-value' | 'mass-threat' = 'time-to-impact',
): ThreatScore[] {
  return attacks
    .map((a) => scoreThreat(defencePos, protectedPos, a, priority))
    .sort((a, b) => b.score - a.score)
}
