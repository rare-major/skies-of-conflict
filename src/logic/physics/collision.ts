import type { Vector3Tuple } from 'three'
import { distance } from './kinematics'

export function checkSphereCollision(
  posA: Vector3Tuple,
  radiusA: number,
  posB: Vector3Tuple,
  radiusB: number
): boolean {
  return distance(posA, posB) < radiusA + radiusB
}

export function checkPointInSphere(
  point: Vector3Tuple,
  center: Vector3Tuple,
  radius: number
): boolean {
  return distance(point, center) < radius
}
