import type { Vector3Tuple } from 'three'
import { add, sub, scale, normalize, length } from '../../physics/kinematics'

export function updateLoitering(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  _acceleration: number,
  dt: number,
  elapsed: number,
  loiterCenter?: Vector3Tuple,
  loiterRadius?: number,
  targetPosition?: Vector3Tuple,
  diveTriggered?: boolean
): { position: Vector3Tuple; velocity: Vector3Tuple; diveTriggered: boolean } {
  const center = loiterCenter || [0, position[1], 0]
  const radius = loiterRadius || 80

  if (diveTriggered && targetPosition) {
    const toTarget = sub(targetPosition, position)
    const dir = normalize(toTarget)
    const diveSpeed = speed * 1.5
    const vel = scale(dir, diveSpeed)
    return { position: add(position, scale(vel, dt)), velocity: vel, diveTriggered: true }
  }

  // Circular orbit
  const angle = elapsed * (speed / radius)
  const orbitX = center[0] + Math.cos(angle) * radius
  const orbitZ = center[2] + Math.sin(angle) * radius
  const targetPos: Vector3Tuple = [orbitX, position[1], orbitZ]

  const toOrbit = sub(targetPos, position)
  const dir = normalize(toOrbit)
  const vel = scale(dir, speed)
  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel, diveTriggered: false }
}
