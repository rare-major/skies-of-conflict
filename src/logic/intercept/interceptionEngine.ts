import type { Vector3Tuple } from 'three'
import { distance } from '../physics/kinematics'
import { randomGaussian } from '../physics/kinematics'
import { simulationRandom } from '../game/random'

/**
 * Check if an interceptor has achieved a kill.
 *
 * P_kill = baseAccuracy * (1 - targetStealth) * distanceFactor
 * A proximity fuse retains partial lethality at the edge of its kill radius,
 * then ramps to full effect near the target.
 */
export function checkInterception(
  interceptorPos: Vector3Tuple,
  targetPos: Vector3Tuple,
  killRadius: number,
  accuracy: number,
  targetStealth: number,
  measuredDistance?: number,
  assuredKill = false,
): { hit: boolean; distance: number } {
  const dist = measuredDistance ?? distance(interceptorPos, targetPos)

  if (dist > killRadius) {
    return { hit: false, distance: dist }
  }

  if (assuredKill) {
    return { hit: true, distance: dist }
  }

  const proximity = Math.max(0, 1 - dist / killRadius)
  const distanceFactor = 0.35 + proximity * 0.65
  const pKill = accuracy * (1 - Math.max(0, targetStealth)) * distanceFactor

  const roll = simulationRandom()
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
