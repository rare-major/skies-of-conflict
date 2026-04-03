import type { Vector3Tuple } from 'three'
import { distance } from '../physics/kinematics'
import type { AttackEntity, DefenceEntity } from '../../types/entities'

/**
 * Calculate the effective jamming factor on a defence unit
 * from all nearby EW sources.
 *
 * effectiveRange = baseRange * (1 - jammingStrength * proximityFactor)
 */
export function calculateJammingFactor(
  defencePos: Vector3Tuple,
  ewSources: AttackEntity[]
): number {
  let totalJamming = 0

  for (const src of ewSources) {
    if (src.status !== 'active') continue
    if (src.params.jammingStrength <= 0) continue

    const dist = distance(defencePos, src.position)
    const effectiveRange = 300
    if (dist > effectiveRange) continue

    const proximityFactor = 1 - dist / effectiveRange
    totalJamming += src.params.jammingStrength * proximityFactor
  }

  return Math.min(0.9, totalJamming)
}

/**
 * Build a map of defenceId -> jammingFactor for all defence units.
 */
export function buildJammingMap(
  defences: DefenceEntity[],
  attacks: AttackEntity[]
): Map<string, number> {
  const ewSources = attacks.filter(
    (a) => a.params.jammingStrength > 0 && a.status === 'active'
  )

  const map = new Map<string, number>()
  for (const def of defences) {
    map.set(def.id, calculateJammingFactor(def.position, ewSources))
  }
  return map
}
