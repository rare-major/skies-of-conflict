import { Html } from '@react-three/drei'
import { useEntityStore } from '../../store/entityStore'
import { useSimulationStore } from '../../store/simulationStore'

export function HitMissIndicators() {
  const explosions = useEntityStore((s) => s.explosions)
  const elapsed = useSimulationStore((s) => s.elapsed)

  return (
    <group>
      {explosions.map((exp) => {
        const age = elapsed - exp.time
        if (age > 2.5) return null
        const opacity = Math.max(0, 1 - age / 2.5)
        const yOffset = age * 15

        return (
          <group key={exp.id} position={[exp.position[0], exp.position[1] + yOffset, exp.position[2]]}>
            <Html center distanceFactor={200} style={{ pointerEvents: 'none' }}>
              <span
                className="rounded-md bg-slate-950/70 px-2 py-1 text-[11px] font-bold tracking-wider font-mono"
                style={{
                  opacity,
                  color: exp.type === 'hit' ? '#ff5533' : exp.type === 'miss' ? '#6688aa' : '#ff8844',
                  textShadow: `0 0 8px ${exp.type === 'hit' ? 'rgba(255,85,51,0.5)' : 'rgba(102,136,170,0.3)'}`,
                }}
              >
                {exp.type === 'hit' ? 'INTERCEPTED' : exp.type === 'miss' ? 'MISS' : 'IMPACT'}
              </span>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
