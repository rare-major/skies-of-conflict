import type { Vector3Tuple } from 'three'
import { sub, normalize, scale, add } from '../../physics/kinematics'

export function updateDirectIntercept(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  turnRate: number,
  dt: number,
  targetPosition: Vector3Tuple
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const toTarget = sub(targetPosition, position)
  const desired = normalize(toTarget)
  const steer = sub(desired, normalize(velocity))
  const maxTurn = turnRate * dt
  const steerLen = Math.sqrt(steer[0] ** 2 + steer[1] ** 2 + steer[2] ** 2)
  const clampedSteer = steerLen > maxTurn
    ? scale(normalize(steer), maxTurn)
    : steer
  const newDir = normalize(add(normalize(velocity), clampedSteer))
  const vel = scale(newDir, speed)
  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel }
}
