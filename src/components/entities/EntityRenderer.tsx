import { useEntityStore } from '../../store/entityStore'
import { useSimulationStore } from '../../store/simulationStore'
import { AttackMesh } from './AttackMesh'
import { DefenceMesh } from './DefenceMesh'
import { InterceptorMesh } from './InterceptorMesh'
import { TrajectoryTrail } from '../visuals/TrajectoryTrail'
import { RadarCone } from '../visuals/RadarCone'
import type { DefenceEntity } from '../../types/entities'
import type { Vector3Tuple } from 'three'
import { useOperationsStore } from '../../store/operationsStore'
import * as THREE from 'three'

export function EntityRenderer() {
  const entities = useEntityStore((s) => s.entities)
  const interceptors = useEntityStore((s) => s.interceptors)
  const showTrails = useSimulationStore((s) => s.showTrails)
  const showRadar = useSimulationStore((s) => s.showRadar)
  const showCollisions = useSimulationStore((s) => s.showCollisions)
  const elapsed = useSimulationStore((s) => s.elapsed)
  const fogOfWar = useOperationsStore((s) => s.fogOfWar)
  const sensorTracks = useOperationsStore((s) => s.sensorTracks)

  return (
    <group>
      {entities.map((entity) => {
        if (entity.status !== 'active') return null

        if (entity.kind === 'attack') {
          if (elapsed < (entity.activationTime || 0)) return null
          const track = sensorTracks[entity.id]
          if (fogOfWar && (!track || track.confidence < 0.12)) return null
          if (fogOfWar && track.confidence < 0.72) {
            return <SensorContact key={entity.id} position={track.estimatedPosition} confidence={track.confidence} jammed={track.jammed} />
          }
          return (
            <group key={entity.id}>
              <AttackMesh entity={entity} />
              {showCollisions && (
                <CollisionSphere position={entity.position} radius={entity.params.killRadius} color="#fb7185" />
              )}
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
            {showCollisions && (
              <CollisionSphere position={int.position} radius={int.killRadius} color="#60a5fa" />
            )}
            {showTrails && int.trail.length > 1 && (
              <TrajectoryTrail points={int.trail} color="#44aaff" />
            )}
          </group>
        ))}
    </group>
  )
}

function SensorContact({ position, confidence, jammed }: { position: Vector3Tuple; confidence: number; jammed: boolean }) {
  const color = jammed ? '#ffb55f' : confidence >= 0.5 ? '#ffd56a' : '#aab7ca'
  return <group position={position}>
    <mesh rotation={[0, Math.PI / 4, 0]}>
      <octahedronGeometry args={[3.2, 0]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.78} depthWrite={false} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[5.5, 6, 28]} />
      <meshBasicMaterial color={color} transparent opacity={0.38} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
    <pointLight color={color} intensity={0.45 + confidence} distance={22} />
  </group>
}

function CollisionSphere({ position, radius, color }: { position: Vector3Tuple; radius: number; color: string }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[Math.max(1, radius), 12, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} wireframe depthWrite={false} />
    </mesh>
  )
}
