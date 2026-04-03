import type { Vector3Tuple } from 'three'
import { add, sub, scale, normalize, length, distance } from '../../physics/kinematics'
import type { AttackEntity } from '../../types/entities'

const SEPARATION_RADIUS = 25
const ALIGNMENT_RADIUS = 50
const COHESION_RADIUS = 60
const W_SEPARATION = 2.0
const W_ALIGNMENT = 1.0
const W_COHESION = 1.0
const W_TARGET = 1.5

export function updateSwarm(
  entity: AttackEntity,
  allSwarmEntities: AttackEntity[],
  speed: number,
  turnRate: number,
  dt: number,
  targetPosition?: Vector3Tuple
): { position: Vector3Tuple; velocity: Vector3Tuple } {
  const pos = entity.position
  const vel = entity.velocity
  const neighbors = allSwarmEntities.filter(
    (e) => e.id !== entity.id && distance(e.position, pos) < COHESION_RADIUS
  )

  let separation: Vector3Tuple = [0, 0, 0]
  let alignment: Vector3Tuple = [0, 0, 0]
  let cohesion: Vector3Tuple = [0, 0, 0]

  if (neighbors.length > 0) {
    // Separation: steer away from close neighbors
    for (const n of neighbors) {
      const d = distance(n.position, pos)
      if (d < SEPARATION_RADIUS && d > 0) {
        const away = normalize(sub(pos, n.position))
        separation = add(separation, scale(away, 1 / d))
      }
    }

    // Alignment: match average velocity
    const avgVel = neighbors.reduce<Vector3Tuple>(
      (acc, n) => add(acc, n.velocity), [0, 0, 0]
    )
    alignment = scale(avgVel, 1 / neighbors.length)
    alignment = sub(alignment, vel)

    // Cohesion: steer toward center of mass
    const avgPos = neighbors.reduce<Vector3Tuple>(
      (acc, n) => add(acc, n.position), [0, 0, 0]
    )
    cohesion = sub(scale(avgPos, 1 / neighbors.length), pos)
  }

  let target: Vector3Tuple = [0, 0, 0]
  if (targetPosition) {
    target = sub(targetPosition, pos)
  }

  const steer = add(
    add(scale(normalize(separation), W_SEPARATION), scale(normalize(alignment), W_ALIGNMENT)),
    add(scale(normalize(cohesion), W_COHESION), scale(normalize(target), W_TARGET))
  )

  const desired = normalize(steer)
  const maxTurn = turnRate * dt
  const diff = sub(desired, normalize(vel))
  const clampedDiff = length(diff) > maxTurn ? scale(normalize(diff), maxTurn) : diff
  const newDir = normalize(add(normalize(vel), clampedDiff))
  const newVel = scale(newDir, speed)
  const newPos = add(pos, scale(newVel, dt))

  return { position: newPos, velocity: newVel }
}
