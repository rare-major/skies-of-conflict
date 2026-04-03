import type { Vector3Tuple } from 'three'
import { updatePredictiveIntercept } from './predictiveIntercept'

const RADAR_UPDATE_INTERVAL = 0.5

/**
 * Radar-guided: same as predictive intercept but target position
 * is only updated at discrete radar scan intervals.
 * Uses per-interceptor cached state via a WeakMap-style approach keyed by id.
 */
const cache = new Map<string, { pos: Vector3Tuple; vel: Vector3Tuple; time: number }>()

export function updateRadarGuided(
  interceptorId: string,
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  speed: number,
  turnRate: number,
  dt: number,
  targetPosition: Vector3Tuple,
  targetVelocity: Vector3Tuple,
  elapsed: number
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  let cached = cache.get(interceptorId)

  if (!cached || elapsed - cached.time > RADAR_UPDATE_INTERVAL) {
    cached = { pos: targetPosition, vel: targetVelocity, time: elapsed }
    cache.set(interceptorId, cached)
  }

  return updatePredictiveIntercept(
    position, velocity, speed, turnRate, dt,
    cached.pos, cached.vel
  )
}

export function clearRadarCache(interceptorId: string) {
  cache.delete(interceptorId)
}
