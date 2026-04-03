import type { Vector3Tuple } from 'three'
import { add, scale } from '../../physics/kinematics'

const CRUISE_ALTITUDE = 35

export function updateCruise(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  acceleration: number,
  dt: number
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const hSpeed = Math.sqrt(velocity[0] ** 2 + velocity[2] ** 2)
  const hDir: [number, number] = hSpeed > 0.001
    ? [velocity[0] / hSpeed, velocity[2] / hSpeed]
    : [1, 0]

  const currentSpeed = Math.min(hSpeed + acceleration * dt, speed * 2)

  const altError = CRUISE_ALTITUDE - position[1]
  const yVel = Math.max(-currentSpeed * 0.35, Math.min(currentSpeed * 0.35, altError * 2.5))

  const rawVel: Vector3Tuple = [hDir[0] * currentSpeed, yVel, hDir[1] * currentSpeed]
  const totalSpeed = Math.sqrt(rawVel[0] ** 2 + rawVel[1] ** 2 + rawVel[2] ** 2)
  const maxSpeed = speed * 2
  const vel: Vector3Tuple = totalSpeed > maxSpeed
    ? [rawVel[0] * maxSpeed / totalSpeed, rawVel[1] * maxSpeed / totalSpeed, rawVel[2] * maxSpeed / totalSpeed]
    : rawVel

  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel }
}
