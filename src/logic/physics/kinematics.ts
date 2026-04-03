import type { Vector3Tuple } from 'three'

export const GRAVITY = 9.81

export function add(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

export function sub(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function scale(v: Vector3Tuple, s: number): Vector3Tuple {
  return [v[0] * s, v[1] * s, v[2] * s]
}

export function length(v: Vector3Tuple): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
}

export function normalize(v: Vector3Tuple): Vector3Tuple {
  const len = length(v)
  if (len < 1e-8) return [0, 0, 0]
  return [v[0] / len, v[1] / len, v[2] / len]
}

export function dot(a: Vector3Tuple, b: Vector3Tuple): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function cross(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

export function distance(a: Vector3Tuple, b: Vector3Tuple): number {
  return length(sub(a, b))
}

export function lerp(a: Vector3Tuple, b: Vector3Tuple, t: number): Vector3Tuple {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}

export function clampMagnitude(v: Vector3Tuple, maxLen: number): Vector3Tuple {
  const len = length(v)
  if (len <= maxLen) return v
  return scale(normalize(v), maxLen)
}

/** Steer toward a desired velocity with maximum turn rate */
export function steerToward(
  currentVel: Vector3Tuple,
  desiredDir: Vector3Tuple,
  speed: number,
  maxTurnRate: number,
  dt: number
): Vector3Tuple {
  const desired = scale(normalize(desiredDir), speed)
  const steering = sub(desired, currentVel)
  const maxSteer = maxTurnRate * speed * dt
  const clamped = clampMagnitude(steering, maxSteer)
  const newVel = add(currentVel, clamped)
  return scale(normalize(newVel), speed)
}

export function randomGaussian(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}
