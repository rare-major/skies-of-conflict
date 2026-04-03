import { useEntityStore } from '../../store/entityStore'
import { useSimulationStore } from '../../store/simulationStore'
import { ExplosionEffect } from './ExplosionEffect'
import { LockOnIndicators } from './LockOnIndicator'
import { HitMissIndicators } from './HitMissIndicator'

export function VisualEffects() {
  const explosions = useEntityStore((s) => s.explosions)
  const elapsed = useSimulationStore((s) => s.elapsed)

  return (
    <group>
      {explosions.map((exp) => (
        <ExplosionEffect
          key={exp.id}
          position={exp.position}
          type={exp.type}
          startTime={exp.time}
          elapsed={elapsed}
        />
      ))}
      <LockOnIndicators />
      <HitMissIndicators />
    </group>
  )
}
