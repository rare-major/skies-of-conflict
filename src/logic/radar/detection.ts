import type { Vector3Tuple } from 'three'
import { sub, normalize, dot, distance } from '../physics/kinematics'

/**
 * Calculate detection probability.
 *
 * P_detect = max(0, (1 - dist/maxRange)) * (1 - stealth) * (1 - jamming)
 */
export function getDetectionProbability(
  defencePos: Vector3Tuple,
  defenceFacing: Vector3Tuple,
  fovAngle: number,
  maxRange: number,
  targetPos: Vector3Tuple,
  targetStealth: number,
  jammingFactor: number
): number {
  const dist = distance(defencePos, targetPos)
  if (dist > maxRange) return 0

  // Check FOV
  if (fovAngle < 360) {
    const toTarget = normalize(sub(targetPos, defencePos))
    const facing = normalize(defenceFacing)
    const angleCos = dot(toTarget, facing)
    const halfFovRad = (fovAngle / 2) * (Math.PI / 180)
    if (angleCos < Math.cos(halfFovRad)) return 0
  }

  const rangeFactor = Math.max(0, 1 - dist / maxRange)
  const stealthFactor = 1 - Math.max(0, Math.min(1, targetStealth))
  const jammingPenalty = 1 - Math.max(0, Math.min(1, jammingFactor))

  return Math.max(0, Math.min(1, rangeFactor * stealthFactor * jammingPenalty))
}

/**
 * Check if a target is within detection cone FOV.
 */
export function isInFieldOfView(
  defencePos: Vector3Tuple,
  defenceFacing: Vector3Tuple,
  fovAngle: number,
  targetPos: Vector3Tuple
): boolean {
  if (fovAngle >= 360) return true
  const toTarget = normalize(sub(targetPos, defencePos))
  const facing = normalize(defenceFacing)
  const angleCos = dot(toTarget, facing)
  const halfFovRad = (fovAngle / 2) * (Math.PI / 180)
  return angleCos >= Math.cos(halfFovRad)
}
