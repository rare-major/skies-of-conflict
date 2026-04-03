import type { Vector3Tuple } from 'three'
import { sub, add, scale, normalize, length } from '../../physics/kinematics'

/**
 * Heat-seeking: pure tail-chase with limited turn rate.
 * Follows the target's current position with constrained maneuverability.
 */
export function updateHeatSeeking(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  turnRate: number,
  dt: number,
  targetPosition: Vector3Tuple
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const toTarget = sub(targetPosition, position)
  const desired = normalize(toTarget)
  const current = normalize(velocity)

  // Limited turn rate gives heat-seekers characteristic lag
  const steer = sub(desired, current)
  const maxTurn = turnRate * 0.6 * dt // reduced turn rate for heat-seekers
  const steerLen = length(steer)
  const clampedSteer = steerLen > maxTurn
    ? scale(normalize(steer), maxTurn)
    : steer

  const newDir = normalize(add(current, clampedSteer))
  const vel = scale(newDir, speed)
  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel }
}
