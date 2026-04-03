import type { Vector3Tuple } from 'three'
import { add, scale } from '../../physics/kinematics'

const GRAVITY = 9.81

export function updateBallistic(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  _speed: number,
  _acceleration: number,
  dt: number
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const vel: Vector3Tuple = [
    velocity[0],
    velocity[1] - GRAVITY * dt,
    velocity[2],
  ]
  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel }
}
