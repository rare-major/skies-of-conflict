import type { Vector3Tuple } from 'three'
import { sub, scale, normalize, length, cross, dot } from '../physics/kinematics'

/**
 * Pure pursuit: always fly directly toward target's current position.
 */
export function purePursuit(
  interceptorPos: Vector3Tuple,
  targetPos: Vector3Tuple,
  speed: number
): Vector3Tuple {
  const dir = normalize(sub(targetPos, interceptorPos))
  return scale(dir, speed)
}

/**
 * Lead pursuit: fly toward where the target will be.
 */
export function leadPursuit(
  interceptorPos: Vector3Tuple,
  interceptorSpeed: number,
  targetPos: Vector3Tuple,
  targetVel: Vector3Tuple
): Vector3Tuple {
  const dist = length(sub(targetPos, interceptorPos))
  const tGo = dist / interceptorSpeed
  const futurePos: Vector3Tuple = [
    targetPos[0] + targetVel[0] * tGo,
    targetPos[1] + targetVel[1] * tGo,
    targetPos[2] + targetVel[2] * tGo,
  ]
  return normalize(sub(futurePos, interceptorPos))
}

/**
 * Proportional navigation acceleration command.
 * Returns the commanded acceleration vector.
 */
export function proportionalNavAccel(
  interceptorPos: Vector3Tuple,
  interceptorVel: Vector3Tuple,
  targetPos: Vector3Tuple,
  targetVel: Vector3Tuple,
  navConstant: number = 4.0
): Vector3Tuple {
  const relPos = sub(targetPos, interceptorPos)
  const relVel = sub(targetVel, interceptorVel)
  const range = length(relPos)

  if (range < 1e-4) return [0, 0, 0]

  const closingVel = -dot(relPos, relVel) / range
  const losRate = scale(cross(relPos, relVel), 1 / (range * range))
  return scale(losRate, navConstant * Math.max(closingVel, 1))
}
