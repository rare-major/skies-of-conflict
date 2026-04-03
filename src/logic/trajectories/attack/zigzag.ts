import type { Vector3Tuple } from 'three'
import { add, scale, normalize, length, cross } from '../../physics/kinematics'

export function updateZigzag(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  acceleration: number,
  dt: number,
  elapsed: number
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const dir = normalize(velocity)
  const currentSpeed = Math.min(length(velocity) + acceleration * dt, speed * 2)

  // Lateral oscillation perpendicular to heading
  const up: Vector3Tuple = [0, 1, 0]
  const lateral = normalize(cross(dir, up))
  const zigzagAmplitude = currentSpeed * 0.3
  const zigzagFreq = 3.0
  const lateralOffset = Math.sin(elapsed * zigzagFreq) * zigzagAmplitude

  const vel: Vector3Tuple = [
    dir[0] * currentSpeed + lateral[0] * lateralOffset,
    dir[1] * currentSpeed,
    dir[2] * currentSpeed + lateral[2] * lateralOffset,
  ]
  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel }
}
