import type { Vector3Tuple } from 'three'
import { add, scale, normalize, length, cross, lerp, sub } from '../../physics/kinematics'

export function updateZigzag(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  acceleration: number,
  dt: number,
  elapsed: number,
  targetPosition?: Vector3Tuple,
  phase = 0,
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const currentDirection = normalize(velocity)
  const currentSpeed = Math.min(length(velocity) + acceleration * dt, speed * 1.08)
  const up: Vector3Tuple = [0, 1, 0]
  const levelTarget: Vector3Tuple = targetPosition
    ? [targetPosition[0], position[1], targetPosition[2]]
    : add(position, currentDirection)
  const strategicDirection = normalize(sub(levelTarget, position))
  const forward = normalize(lerp(currentDirection, strategicDirection, Math.min(1, dt * 0.9)))
  const lateral = normalize(cross(forward, up))

  // A broad, bankable S-turn. The old implementation fed its lateral velocity
  // back into the heading every frame, which produced unrealistic corkscrews.
  const lateralCommand = Math.sin(elapsed * 0.68 + phase) * 0.17
    + Math.sin(elapsed * 1.35 + phase * 0.7) * 0.035
  const altitudeCommand = Math.sin(elapsed * 0.34 + phase) * 0.018
  const desiredDirection = normalize([
    forward[0] + lateral[0] * lateralCommand,
    forward[1] + altitudeCommand,
    forward[2] + lateral[2] * lateralCommand,
  ])
  const smoothedDirection = normalize(lerp(currentDirection, desiredDirection, Math.min(1, dt * 1.65)))
  const vel = scale(smoothedDirection, currentSpeed)
  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel }
}
