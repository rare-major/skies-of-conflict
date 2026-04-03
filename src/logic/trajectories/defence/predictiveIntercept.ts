import type { Vector3Tuple } from 'three'
import { sub, add, scale, normalize, length, distance } from '../../physics/kinematics'

/** Lead-pursuit: aim at where the target will be */
export function updatePredictiveIntercept(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  turnRate: number,
  dt: number,
  targetPosition: Vector3Tuple,
  targetVelocity: Vector3Tuple
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const dist = distance(position, targetPosition)
  const timeToIntercept = dist / speed

  // Predict target future position
  const futureTarget: Vector3Tuple = [
    targetPosition[0] + targetVelocity[0] * timeToIntercept,
    targetPosition[1] + targetVelocity[1] * timeToIntercept,
    targetPosition[2] + targetVelocity[2] * timeToIntercept,
  ]

  const toFuture = sub(futureTarget, position)
  const desired = normalize(toFuture)

  const steer = sub(desired, normalize(velocity))
  const maxTurn = turnRate * dt
  const steerLen = length(steer)
  const clampedSteer = steerLen > maxTurn
    ? scale(normalize(steer), maxTurn)
    : steer

  const newDir = normalize(add(normalize(velocity), clampedSteer))
  const vel = scale(newDir, speed)
  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel }
}
