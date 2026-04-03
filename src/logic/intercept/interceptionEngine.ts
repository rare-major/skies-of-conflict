import type { Vector3Tuple } from 'three'
import { distance } from '../physics/kinematics'
import { randomGaussian } from '../physics/kinematics'

/**
 * Check if an interceptor has achieved a kill.
 *
 * P_kill = baseAccuracy * (1 - targetStealth) * distanceFactor
 * distanceFactor = max(0, 1 - dist/killRadius)
 */
export function checkInterception(
  interceptorPos: Vector3Tuple,
  targetPos: Vector3Tuple,
  killRadius: number,
  accuracy: number,
  targetStealth: number
): { hit: boolean; distance: number } {
  const dist = distance(interceptorPos, targetPos)

  if (dist > killRadius) {
    return { hit: false, distance: dist }
  }

  const distanceFactor = Math.max(0, 1 - dist / killRadius)
  const pKill = accuracy * (1 - Math.max(0, targetStealth)) * distanceFactor

  const roll = Math.random()
  return { hit: roll < pKill, distance: dist }
}

/**
 * Add Gaussian noise to a position to simulate targeting inaccuracy.
 */
export function addTargetingError(
  position: Vector3Tuple,
  errorMargin: number
): Vector3Tuple {
  return [
    position[0] + randomGaussian() * errorMargin,
    position[1] + randomGaussian() * errorMargin,
    position[2] + randomGaussian() * errorMargin,
  ]
}
