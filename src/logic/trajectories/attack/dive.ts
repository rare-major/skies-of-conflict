import type { Vector3Tuple } from 'three'
import { add, sub, scale, normalize, length } from '../../physics/kinematics'

const DIVE_TRIGGER_DISTANCE = 150
const DIVE_ANGLE_FACTOR = 2.5

export function updateDive(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  acceleration: number,
  dt: number,
  targetPosition?: Vector3Tuple,
  diveTriggered?: boolean
): { position: Vector3Tuple; velocity: Vector3Tuple; diveTriggered: boolean } {
  const currentSpeed = Math.min(length(velocity) + acceleration * dt, speed * 2)

  if (!targetPosition) {
    const dir = normalize(velocity)
    const vel = scale(dir, currentSpeed)
    return { position: add(position, scale(vel, dt)), velocity: vel, diveTriggered: false }
  }

  const toTarget = sub(targetPosition, position)
  const horizontalDist = Math.sqrt(toTarget[0] * toTarget[0] + toTarget[2] * toTarget[2])
  const shouldDive = diveTriggered || horizontalDist < DIVE_TRIGGER_DISTANCE

  if (shouldDive) {
    // Steep dive toward target
    const diveDir = normalize([toTarget[0], toTarget[1] * DIVE_ANGLE_FACTOR, toTarget[2]])
    const diveSpeed = currentSpeed * 1.3
    const vel = scale(diveDir, diveSpeed)
    return { position: add(position, scale(vel, dt)), velocity: vel, diveTriggered: true }
  }

  // Approach at altitude
  const approachDir = normalize([toTarget[0], 0, toTarget[2]])
  const vel = scale(approachDir, currentSpeed)
  return { position: add(position, scale(vel, dt)), velocity: vel, diveTriggered: false }
}
