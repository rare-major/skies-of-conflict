import type { Vector3Tuple } from 'three'
import { add, scale, normalize, length } from '../../physics/kinematics'

export function updateStraight(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  acceleration: number,
  dt: number
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const dir = normalize(velocity)
  const currentSpeed = Math.min(length(velocity) + acceleration * dt, speed * 2)
  const vel: Vector3Tuple = scale(dir, currentSpeed)
  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel }
}
