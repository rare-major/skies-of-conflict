import type { DefenceEntity, AttackEntity, InterceptorEntity } from '../../types/entities'
import type { Vector3Tuple } from 'three'
import { distance } from '../physics/kinematics'
import { rankThreats } from './threatPrioritization'
import { getDetectionProbability } from '../radar/detection'
import { simulationRandom } from '../game/random'

export type DefenceZone = 'long' | 'medium' | 'short'

export function getDefenceZone(type: DefenceEntity['type']): DefenceZone {
  switch (type) {
    case 'long-range-sam': return 'long'
    case 'medium-range-sam': return 'medium'
    default: return 'short'
  }
}

interface EngagementDecision {
  defenceId: string
  targetId: string
  priority: number
}

/**
 * Determine which defence units should engage which targets.
 * Implements layered defence: long-range fires first, then medium, then short.
 */
export function computeEngagements(
  defences: DefenceEntity[],
  attacks: AttackEntity[],
  interceptors: InterceptorEntity[],
  elapsed: number,
  jammingMap: Map<string, number>
): EngagementDecision[] {
  const decisions: EngagementDecision[] = []
  const engagedTargets = new Set<string>()

  for (const int of interceptors) {
    if (int.status === 'active') engagedTargets.add(int.targetId)
  }

  const activeAttacks = attacks.filter((a) => a.status === 'active')
  const zoneOrder: DefenceZone[] = ['long', 'medium', 'short']

  for (const zone of zoneOrder) {
    const zoneDefences = defences.filter(
      (d) => d.status === 'active' && getDefenceZone(d.type) === zone
    )

    for (const def of zoneDefences) {
      if (def.engagedTarget) continue

      const jamming = jammingMap.get(def.id) || 0
      const cooldownReady = elapsed - def.lastFireTime >= def.params.cooldown
      if (!cooldownReady) continue

      const facing: Vector3Tuple = def.facing || [0, 0, 1]
      const detectable = activeAttacks.filter((a) => {
        if (engagedTargets.has(a.id)) return false
        const dist = distance(def.position, a.position)
        if (dist > def.params.maxRange) return false
        if (def.params.assuredDetection) return true
        const pDetect = getDetectionProbability(
          def.position, facing, def.params.fovAngle,
          def.params.detectionRange, a.position,
          a.params.stealthFactor, jamming
        )
        return simulationRandom() < pDetect
      })

      if (detectable.length === 0) continue

      const threats = rankThreats(def.position, [0, 0, 0], detectable, def.params.threatPriority)
      const viable = threats.filter((t) => simulationRandom() > t.isDecoyProbability)
      if (viable.length === 0) continue

      const best = viable[0]
      decisions.push({
        defenceId: def.id,
        targetId: best.entityId,
        priority: best.score,
      })
      engagedTargets.add(best.entityId)
    }
  }

  return decisions
}
