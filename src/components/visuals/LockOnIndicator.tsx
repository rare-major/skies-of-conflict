import { Html } from '@react-three/drei'
import { useEntityStore } from '../../store/entityStore'
import type { AttackEntity } from '../../types/entities'

export function LockOnIndicators() {
  const entities = useEntityStore((s) => s.entities)
  const interceptors = useEntityStore((s) => s.interceptors)

  const attacks = entities.filter((e) => e.kind === 'attack' && e.status === 'active') as AttackEntity[]
  const activeInterceptors = interceptors.filter((i) => i.status === 'active')

  const targetedIds = new Set(activeInterceptors.map((i) => i.targetId))

  return (
    <group>
      {attacks.filter((a) => targetedIds.has(a.id)).map((attack) => (
        <group key={`lock-${attack.id}`} position={attack.position}>
          <Html center distanceFactor={150} style={{ pointerEvents: 'none' }}>
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-10 h-10 border border-red-400/70 rotate-45 relative">
                <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-red-400" />
                <div className="absolute -top-px -right-px w-2 h-2 border-t border-r border-red-400" />
                <div className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-red-400" />
                <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-red-400" />
              </div>
              <span className="text-[10px] font-bold text-red-300 mt-1.5 font-mono tracking-wider">
                TRACKED
              </span>
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}
