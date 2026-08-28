import type { Vector3Tuple } from 'three'
import { sub, add, scale, normalize, distance } from '../../physics/kinematics'
import { randomGaussian } from '../../physics/kinematics'

/**
 * Burst fire: creates short-lived projectiles in a cone.
 * Returns the updated position for a single burst projectile.
 */
export function updateBurstProjectile(
  position: Vector3Tuple,
  velocity: Vector3Tuple,
  _speed: number,
  dt: number
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const pos = add(position, scale(velocity, dt))
  return { position: pos, velocity }
}

/** Generate initial velocity for a burst-fire projectile with spread */
export function createBurstVelocity(
  firerPosition: Vector3Tuple,
  targetPosition: Vector3Tuple,
  targetVelocity: Vector3Tuple,
  projectileSpeed: number,
  spreadAngle: number
): Vector3Tuple {
  const dist = distance(firerPosition, targetPosition)
  const timeToTarget = dist / projectileSpeed

  // Lead the target
  const futurePos: Vector3Tuple = [
    targetPosition[0] + targetVelocity[0] * timeToTarget,
    targetPosition[1] + targetVelocity[1] * timeToTarget,
    targetPosition[2] + targetVelocity[2] * timeToTarget,
  ]

  const dir = normalize(sub(futurePos, firerPosition))

  // Add spread noise
  const spread = spreadAngle * (Math.PI / 180)
  const noiseX = randomGaussian() * spread
  const noiseY = randomGaussian() * spread
  const noiseZ = randomGaussian() * spread

  const noisyDir: Vector3Tuple = normalize([
    dir[0] + noiseX,
    dir[1] + noiseY,
    dir[2] + noiseZ,
  ])

  return scale(noisyDir, projectileSpeed)
}
