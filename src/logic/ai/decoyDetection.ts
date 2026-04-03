import type { AttackEntity } from '../../types/entities'

/**
 * Estimate the probability that an entity is a decoy.
 *
 * Real decoys have abnormally high radar cross-section (negative stealth)
 * and simple flight patterns. Over time, tracking reveals their nature.
 */
export function estimateDecoyProbability(
  entity: AttackEntity,
  trackingDuration: number
): number {
  let prob = 0

  // Negative stealth factor is suspicious (high RCS)
  if (entity.params.stealthFactor < 0) {
    prob += Math.min(0.4, Math.abs(entity.params.stealthFactor) * 0.5)
  }

  // Low speed + straight trajectory is decoy-like
  if (entity.params.speed < 50 && entity.trajectory === 'straight') {
    prob += 0.2
  }

  // Longer tracking increases identification accuracy
  prob += Math.min(0.3, trackingDuration * 0.05)

  return Math.min(0.95, prob)
}
