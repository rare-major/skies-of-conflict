import type { Vector3Tuple } from 'three'
import { sub, add, scale, normalize, length, cross, dot } from '../../physics/kinematics'

/**
 * Proportional Navigation Guidance Law
 *
 * The acceleration command is proportional to the line-of-sight (LOS) rate:
 *   a_cmd = N * V_c * (dLambda/dt)
 *
 * Where:
 *   N = navigation constant (typically 3-5)
 *   V_c = closing velocity (rate at which range decreases)
 *   dLambda/dt = LOS rotation rate
 */
const NAV_CONSTANT = 4.0

export function updateProportionalNav(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  turnRate: number,
  dt: number,
  targetPosition: Vector3Tuple,
  targetVelocity: Vector3Tuple
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const relPos = sub(targetPosition, position)
  const relVel = sub(targetVelocity, velocity)
  const range = length(relPos)

  if (range < 1e-4) {
    return { position, velocity }
  }

  // Closing velocity: negative of range rate
  const closingVelocity = -dot(relPos, relVel) / range

  // LOS rate: omega = (R x V_rel) / |R|^2
  const losRate = scale(cross(relPos, relVel), 1 / (range * range))

  // Commanded acceleration: a = N * Vc * omega
  const accelCmd = scale(losRate, NAV_CONSTANT * Math.max(closingVelocity, speed * 0.5))

  // Apply acceleration with turn rate limit
  const maxAccel = turnRate * speed
  const accelMag = length(accelCmd)
  const clampedAccel = accelMag > maxAccel
    ? scale(normalize(accelCmd), maxAccel)
    : accelCmd

  const newVel = add(velocity, scale(clampedAccel, dt))
  const vel = scale(normalize(newVel), speed)
  const pos = add(position, scale(vel, dt))

  return { position: pos, velocity: vel }
}
