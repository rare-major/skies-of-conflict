import { useEntityStore } from '../../store/entityStore'
import { useSimulationStore } from '../../store/simulationStore'
import { AttackMesh } from './AttackMesh'
import { DefenceMesh } from './DefenceMesh'
import { InterceptorMesh } from './InterceptorMesh'
import { TrajectoryTrail } from '../visuals/TrajectoryTrail'
import { RadarCone } from '../visuals/RadarCone'
import type { DefenceEntity } from '../../types/entities'

export function EntityRenderer() {
  const entities = useEntityStore((s) => s.entities)
  const interceptors = useEntityStore((s) => s.interceptors)
  const showTrails = useSimulationStore((s) => s.showTrails)
  const showRadar = useSimulationStore((s) => s.showRadar)

  return (
    <group>
      {entities.map((entity) => {
        if (entity.status !== 'active') return null

        if (entity.kind === 'attack') {
          return (
            <group key={entity.id}>
              <AttackMesh entity={entity} />
              {showTrails && entity.trail.length > 1 && (
                <TrajectoryTrail points={entity.trail} color="#ff4444" />
              )}
            </group>
          )
        }

        if (entity.kind === 'defence') {
          return (
            <group key={entity.id}>
              <DefenceMesh entity={entity} />
              {showRadar && (
                <RadarCone defence={entity as DefenceEntity} />
              )}
            </group>
          )
        }

        return null
      })}

      {interceptors
        .filter((i) => i.status === 'active')
        .map((int) => (
          <group key={int.id}>
            <InterceptorMesh interceptor={int} />
            {showTrails && int.trail.length > 1 && (
              <TrajectoryTrail points={int.trail} color="#44aaff" />
            )}
          </group>
        ))}
    </group>
  )
}
