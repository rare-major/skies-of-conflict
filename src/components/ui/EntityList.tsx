import { Plane, Radio, Crosshair, Shield, Bomb, Zap } from 'lucide-react'
import { useEntityStore } from '../../store/entityStore'
import { useCameraStore } from '../../store/cameraStore'
import type { SimEntity, DefenceEntity } from '../../types/entities'

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--green)',
  intercepted: 'var(--red)',
  destroyed: 'var(--orange)',
  missed: '#eab308',
  exploded: '#6b7280',
}

function getEntityIcon(entity: SimEntity) {
  if (entity.kind === 'defence') return Shield
  const t = entity.type
  if (t.includes('drone') || t === 'loitering-munition') return Radio
  if (t.includes('jet') || t.includes('aircraft') || t === 'bomber' || t === 'ew-aircraft'
    || t === 'f-35' || t === 'f-22' || t === 'su-30' || t === 'su-57' || t === 'rafale' || t === 'j-35') return Plane
  if (t.includes('bomb') || t === 'cluster-munition') return Bomb
  return Crosshair
}

export function EntityList() {
  const entities = useEntityStore((s) => s.entities)
  const selectedId = useEntityStore((s) => s.selectedEntityId)
  const selectEntity = useEntityStore((s) => s.selectEntity)
  const setFollowEntity = useCameraStore((s) => s.setFollowEntity)

  const active = entities.filter((e) => e.status === 'active')
  const inactive = entities.filter((e) => e.status !== 'active')

  const handleSelect = (id: string) => {
    const newId = id === selectedId ? null : id
    selectEntity(newId)
    setFollowEntity(newId)
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Active ({active.length})
      </h3>

      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {active.map((entity) => {
          const Icon = getEntityIcon(entity)
          const isSelected = entity.id === selectedId
          const isDefence = entity.kind === 'defence'
          const def = isDefence ? entity as DefenceEntity : null

          return (
            <button
              key={entity.id}
              onClick={() => handleSelect(entity.id)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all duration-150
                hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              style={{
                background: isSelected ? 'var(--bg-active)' : 'var(--bg-panel)',
                border: isSelected ? '1px solid var(--border-active)' : '1px solid transparent',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[entity.status] }} />
              <Icon size={12} style={{ color: isDefence ? 'var(--green)' : 'var(--red)', opacity: 0.7, flexShrink: 0 }} />
              <span className="truncate" style={{ color: isDefence ? 'var(--green)' : 'var(--red)', opacity: 0.8 }}>
                {entity.type}
              </span>
              {def && def.params.ammo < 999 && (
                <span className="text-[9px] font-mono ml-auto flex-shrink-0" style={{ color: def.isReloading ? 'var(--orange)' : 'var(--text-dim)' }}>
                  {def.isReloading ? 'RLD' : `${def.params.ammo}/${def.params.maxAmmo}`}
                </span>
              )}
              {!isDefence && (
                <span className="text-[9px] ml-auto flex-shrink-0" style={{ color: 'var(--text-dim)' }}>
                  {(entity as any).trajectory}
                </span>
              )}
            </button>
          )
        })}

        {active.length === 0 && (
          <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-dim)' }}>No active entities</p>
        )}
      </div>

      {inactive.length > 0 && (
        <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <h3 className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>
            Inactive ({inactive.length})
          </h3>
          <div className="space-y-0.5 max-h-24 overflow-y-auto">
            {inactive.map((entity) => (
              <div key={entity.id} className="px-2.5 py-1 text-[10px] flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[entity.status] }} />
                <span>{entity.type}</span>
                <span className="ml-auto">{entity.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
