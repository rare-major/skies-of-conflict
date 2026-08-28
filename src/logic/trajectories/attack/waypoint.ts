import type { Vector3Tuple } from 'three'
import { add, sub, scale, normalize, length } from '../../physics/kinematics'

/**
 * Catmull-Rom spline interpolation for smooth waypoint following.
 */
function catmullRom(p0: Vector3Tuple, p1: Vector3Tuple, p2: Vector3Tuple, p3: Vector3Tuple, t: number): Vector3Tuple {
  const t2 = t * t
  const t3 = t2 * t
  return [
    0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
    0.5 * ((2 * p1[2]) + (-p0[2] + p2[2]) * t + (2 * p0[2] - 5 * p1[2] + 4 * p2[2] - p3[2]) * t2 + (-p0[2] + 3 * p1[2] - 3 * p2[2] + p3[2]) * t3),
  ]
}

export function updateWaypoint(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  _acceleration: number,
  dt: number,
  waypoints: Vector3Tuple[],
  waypointIndex: number
): { position: Vector3Tuple; velocity: Vector3Tuple; waypointIndex: number } {
  if (!waypoints.length) {
    const dir = normalize(velocity)
    const vel = scale(dir, speed)
    return { position: add(position, scale(vel, dt)), velocity: vel, waypointIndex: 0 }
  }

  let idx = waypointIndex
  if (idx >= waypoints.length) idx = waypoints.length - 1

  const target = waypoints[idx]
  const toTarget = sub(target, position)
  const dist = length(toTarget)

  if (dist < speed * dt * 2 && idx < waypoints.length - 1) {
    idx++
  }

  // For 4+ waypoints, use Catmull-Rom for smooth curves
  if (waypoints.length >= 4 && idx >= 1 && idx < waypoints.length - 1) {
    const p0 = waypoints[Math.max(0, idx - 1)]
    const p1 = waypoints[idx]
    const p2 = waypoints[Math.min(waypoints.length - 1, idx + 1)]
    const p3 = waypoints[Math.min(waypoints.length - 1, idx + 2)]

    const segLen = length(sub(p2, p1))
    const t = segLen > 0 ? 1 - dist / segLen : 0
    const splinePoint = catmullRom(p0, p1, p2, p3, Math.max(0, Math.min(1, t)))
    const dir = normalize(sub(splinePoint, position))
    const vel = scale(dir, speed)
    const pos = add(position, scale(vel, dt))
    return { position: pos, velocity: vel, waypointIndex: idx }
  }

  const dir = normalize(toTarget)
  const vel = scale(dir, speed)
  const pos = add(position, scale(vel, dt))
  return { position: pos, velocity: vel, waypointIndex: idx }
}
