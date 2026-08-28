import { create } from 'zustand'
import type { SimEntity, InterceptorEntity, EntityStatus, DefenceEntity, SubsystemState } from '../types/entities'
import type { Vector3Tuple } from 'three'

interface EntityStore {
  entities: SimEntity[]
  interceptors: InterceptorEntity[]
  explosions: { id: string; position: Vector3Tuple; time: number; type: 'hit' | 'miss' | 'impact' }[]
  selectedEntityId: string | null

  addEntity: (e: SimEntity) => void
  addInterceptor: (i: InterceptorEntity) => void
  removeEntity: (id: string) => void
  updateEntityPosition: (id: string, position: Vector3Tuple, velocity: Vector3Tuple) => void
  updateInterceptorPosition: (id: string, position: Vector3Tuple, velocity: Vector3Tuple) => void
  setEntityStatus: (id: string, status: EntityStatus) => void
  setInterceptorStatus: (id: string, status: EntityStatus) => void
  appendTrail: (id: string, point: Vector3Tuple) => void
  appendInterceptorTrail: (id: string, point: Vector3Tuple) => void
  addExplosion: (position: Vector3Tuple, type: 'hit' | 'miss' | 'impact', time: number) => void
  clearExplosions: (before: number) => void
  selectEntity: (id: string | null) => void
  clearAll: () => void
  setEntities: (entities: SimEntity[]) => void

  updateDefenceTracking: (id: string, trackedTargets: string[], engagedTarget?: string) => void
  setDefenceLastFireTime: (id: string, time: number) => void
  addDefenceInterceptor: (defenceId: string, interceptorId: string) => void
  setAttackDiveTriggered: (id: string) => void

  clearEngagedTarget: (defenceId: string) => void
  decrementAmmo: (defenceId: string) => void
  startReload: (defenceId: string, time: number) => void
  finishReload: (defenceId: string) => void
  decrementPayload: (attackId: string, payloadIndex: number) => void
  applyDamage: (id: string, amount: number, subsystem?: keyof SubsystemState) => void
}

export const useEntityStore = create<EntityStore>((set) => ({
  entities: [],
  interceptors: [],
  explosions: [],
  selectedEntityId: null,

  addEntity: (e) => set((s) => ({ entities: [...s.entities, e] })),
  addInterceptor: (i) => set((s) => ({ interceptors: [...s.interceptors, i] })),
  removeEntity: (id) => set((s) => ({
    entities: s.entities.filter((e) => e.id !== id),
    interceptors: s.interceptors.filter((i) => i.id !== id),
  })),

  updateEntityPosition: (id, position, velocity) => set((s) => ({
    entities: s.entities.map((e) => e.id === id ? { ...e, position, velocity } : e),
  })),

  updateInterceptorPosition: (id, position, velocity) => set((s) => ({
    interceptors: s.interceptors.map((i) => i.id === id ? { ...i, position, velocity } : i),
  })),

  setEntityStatus: (id, status) => set((s) => ({
    entities: s.entities.map((e) => e.id === id ? { ...e, status } : e),
  })),

  setInterceptorStatus: (id, status) => set((s) => ({
    interceptors: s.interceptors.map((i) => i.id === id ? { ...i, status } : i),
  })),

  appendTrail: (id, point) => set((s) => ({
    entities: s.entities.map((e) =>
      e.id === id ? { ...e, trail: [...e.trail.slice(-80), point] } : e
    ),
  })),

  appendInterceptorTrail: (id, point) => set((s) => ({
    interceptors: s.interceptors.map((i) =>
      i.id === id ? { ...i, trail: [...i.trail.slice(-60), point] } : i
    ),
  })),

  addExplosion: (position, type, time) => set((s) => ({
    explosions: [...s.explosions, { id: crypto.randomUUID(), position, type, time }],
  })),

  clearExplosions: (before) => set((s) => ({
    explosions: s.explosions.filter((e) => e.time > before),
  })),

  selectEntity: (id) => set({ selectedEntityId: id }),
  clearAll: () => set({ entities: [], interceptors: [], explosions: [], selectedEntityId: null }),
  setEntities: (entities) => set({ entities }),

  updateDefenceTracking: (id, trackedTargets, engagedTarget) => set((s) => ({
    entities: s.entities.map((e) =>
      e.id === id && e.kind === 'defence'
        ? { ...e, trackedTargets, engagedTarget } as SimEntity
        : e
    ),
  })),

  setDefenceLastFireTime: (id, time) => set((s) => ({
    entities: s.entities.map((e) =>
      e.id === id && e.kind === 'defence' ? { ...e, lastFireTime: time } as SimEntity : e
    ),
  })),

  addDefenceInterceptor: (defenceId, interceptorId) => set((s) => ({
    entities: s.entities.map((e) =>
      e.id === defenceId && e.kind === 'defence'
        ? { ...e, interceptors: [...(e as DefenceEntity).interceptors, interceptorId] } as SimEntity
        : e
    ),
  })),

  setAttackDiveTriggered: (id) => set((s) => ({
    entities: s.entities.map((e) =>
      e.id === id && e.kind === 'attack' ? { ...e, diveTriggered: true } as SimEntity : e
    ),
  })),

  clearEngagedTarget: (defenceId) => set((s) => ({
    entities: s.entities.map((e) =>
      e.id === defenceId && e.kind === 'defence'
        ? { ...e, engagedTarget: undefined } as SimEntity
        : e
    ),
  })),

  decrementAmmo: (defenceId) => set((s) => ({
    entities: s.entities.map((e) =>
      e.id === defenceId && e.kind === 'defence'
        ? { ...e, params: { ...e.params, ammo: Math.max(0, e.params.ammo - 1) } } as SimEntity
        : e
    ),
  })),

  startReload: (defenceId, time) => set((s) => ({
    entities: s.entities.map((e) =>
      e.id === defenceId && e.kind === 'defence'
        ? { ...e, isReloading: true, reloadStartTime: time } as SimEntity
        : e
    ),
  })),

  finishReload: (defenceId) => set((s) => ({
    entities: s.entities.map((e) =>
      e.id === defenceId && e.kind === 'defence'
        ? { ...e, isReloading: false, reloadStartTime: 0, params: { ...e.params, ammo: e.params.maxAmmo } } as SimEntity
        : e
    ),
  })),

  decrementPayload: (attackId, payloadIndex) => set((s) => ({
    entities: s.entities.map((e) => {
      if (e.id !== attackId || e.kind !== 'attack') return e
      const payloads = [...e.params.payloads]
      if (payloads[payloadIndex] && payloads[payloadIndex].count > 0) {
        payloads[payloadIndex] = { ...payloads[payloadIndex], count: payloads[payloadIndex].count - 1 }
      }
      return { ...e, params: { ...e.params, payloads } } as SimEntity
    }),
  })),

  applyDamage: (id, amount, subsystem) => set((state) => ({
    entities: state.entities.map((entity) => {
      if (entity.id !== id) return entity
      const integrity = Math.max(0, (entity.integrity ?? 100) - Math.max(0, amount))
      const currentSubsystems = entity.subsystems ?? { radar: 100, propulsion: 100, guidance: 100, weapons: 100, communications: 100 }
      const subsystems = subsystem
        ? { ...currentSubsystems, [subsystem]: Math.max(0, currentSubsystems[subsystem] - amount * 1.35) }
        : currentSubsystems
      const damageFactor = Math.max(0.18, integrity / 100)
      const params = entity.kind === 'defence'
        ? {
            ...entity.params,
            detectionRange: entity.params.detectionRange * Math.max(0.35, subsystems.radar / 100),
            accuracy: Math.max(0.1, entity.params.accuracy * Math.max(0.4, subsystems.weapons / 100)),
            reactionDelay: entity.params.reactionDelay / damageFactor,
          }
        : {
            ...entity.params,
            speed: entity.params.speed * Math.max(0.35, subsystems.propulsion / 100),
            accuracy: Math.max(0.08, entity.params.accuracy * Math.max(0.3, subsystems.guidance / 100)),
          }
      return {
        ...entity,
        integrity,
        subsystems,
        params,
        status: integrity <= 0 ? (entity.kind === 'attack' ? 'intercepted' : 'destroyed') : entity.status,
      } as SimEntity
    }),
  })),
}))
