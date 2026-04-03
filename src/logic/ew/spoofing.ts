import type { Vector3Tuple } from 'three'
import { randomGaussian } from '../physics/kinematics'

/**
 * Apply GPS spoofing to a guided weapon's perceived position.
 * Adds random offset proportional to spoofing strength.
 */
export function applySpoofing(
  realPosition: Vector3Tuple,
  spoofingStrength: number
): Vector3Tuple {
  if (spoofingStrength <= 0) return realPosition

  const maxOffset = spoofingStrength * 50
  return [
    realPosition[0] + randomGaussian() * maxOffset,
    realPosition[1] + randomGaussian() * maxOffset * 0.3,
    realPosition[2] + randomGaussian() * maxOffset,
  ]
}

/**
 * Calculate communication disruption delay.
 * Adds reaction time to defence systems.
 */
export function getDisruptionDelay(
  baseDelay: number,
  jammingFactor: number
): number {
  return baseDelay * (1 + jammingFactor * 2)
}
