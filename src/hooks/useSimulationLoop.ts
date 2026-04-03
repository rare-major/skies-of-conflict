import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import { useEntityStore } from '../store/entityStore'
import { useReplayStore } from '../store/replayStore'
import { useCameraStore } from '../store/cameraStore'
import type { AttackEntity, DefenceEntity, InterceptorEntity } from '../types/entities'
import { updateStraight } from '../logic/trajectories/attack/straight'
import { updateBallistic } from '../logic/trajectories/attack/ballistic'
import { updateCruise } from '../logic/trajectories/attack/cruise'
import { updateZigzag } from '../logic/trajectories/attack/zigzag'
import { updateDive } from '../logic/trajectories/attack/dive'
import { updateLoitering } from '../logic/trajectories/attack/loitering'
import { updateSwarm } from '../logic/trajectories/attack/swarm'
import { updateDirectIntercept } from '../logic/trajectories/defence/directIntercept'
import { updatePredictiveIntercept } from '../logic/trajectories/defence/predictiveIntercept'
import { updateProportionalNav } from '../logic/trajectories/defence/proportionalNav'
import { updateHeatSeeking } from '../logic/trajectories/defence/heatSeeking'
import { updateBurstProjectile } from '../logic/trajectories/defence/burstFire'
import { checkInterception } from '../logic/intercept/interceptionEngine'
import { buildJammingMap } from '../logic/ew/jamming'
import { computeEngagements } from '../logic/ai/engagementLogic'
import { createBurstVelocity } from '../logic/trajectories/defence/burstFire'
import { distance } from '../logic/physics/kinematics'

const INTERCEPTOR_SPEED = 250
const INTERCEPTOR_TURN_RATE = 3.0
const BURST_PROJECTILE_SPEED = 400
const BURST_LIFETIME = 0.8
const JET_LAUNCH_RANGE = 200
const JET_LAUNCH_COOLDOWN = 3.0

type V3 = [number, number, number]

function findAttack(entities: (AttackEntity | DefenceEntity)[], id: string): AttackEntity | undefined {
  return entities.find((e) => e.id === id && e.kind === 'attack') as AttackEntity | undefined
}

const JET_TYPES = new Set(['f-35', 'f-22', 'su-30', 'su-57', 'rafale', 'j-35', 'fighter-jet', 'stealth-aircraft', 'bomber'])

export function useSimulationLoop() {
  const engagementCooldown = useRef(0)
  const jetLaunchTimers = useRef<Map<string, number>>(new Map())
  const recordCounter = useRef(0)

  useFrame((_, rawDelta) => {
    const { isRunning, timeScale, elapsed } = useSimulationStore.getState()
    if (!isRunning) return

    const dt = Math.min(rawDelta, 0.05) * timeScale
    const newElapsed = elapsed + dt
    useSimulationStore.getState().tick(dt)

    const store = useEntityStore.getState()
    const { entities, interceptors } = store
    const attacks = entities.filter((e) => e.kind === 'attack' && e.status === 'active') as AttackEntity[]
    const defences = entities.filter((e) => e.kind === 'defence' && e.status === 'active') as DefenceEntity[]
    const swarmEntities = attacks.filter((a) => a.trajectory === 'swarm')

    // Compute defence centroid as target for attack trajectories
    let defTarget: V3 = [0, 0, 0]
    if (defences.length > 0) {
      let cx = 0, cz = 0
      for (const d of defences) { cx += d.position[0]; cz += d.position[2] }
      defTarget = [cx / defences.length, 0, cz / defences.length]
    }

    // -- Update attack entities --
    for (const atk of attacks) {
      let result: { position: V3; velocity: V3; diveTriggered?: boolean }

      // Find nearest defence for dive/swarm targeting
      let nearestDefPos: V3 = defTarget
      let bestDist = Infinity
      for (const d of defences) {
        const dx = d.position[0] - atk.position[0]
        const dz = d.position[2] - atk.position[2]
        const dist = dx * dx + dz * dz
        if (dist < bestDist) { bestDist = dist; nearestDefPos = d.position }
      }

      switch (atk.trajectory) {
        case 'straight':
          result = updateStraight(atk.position, atk.velocity, atk.params.speed, atk.params.acceleration, dt)
          break
        case 'ballistic':
          result = updateBallistic(atk.position, atk.velocity, atk.params.speed, atk.params.acceleration, dt)
          break
        case 'cruise':
          result = updateCruise(atk.position, atk.velocity, atk.params.speed, atk.params.acceleration, dt)
          break
        case 'zigzag':
          result = updateZigzag(atk.position, atk.velocity, atk.params.speed, atk.params.acceleration, dt, newElapsed)
          break
        case 'waypoint': {
          result = updateStraight(atk.position, atk.velocity, atk.params.speed, atk.params.acceleration, dt)
          break
        }
        case 'dive':
          result = updateDive(atk.position, atk.velocity, atk.params.speed, atk.params.acceleration, dt, nearestDefPos, atk.diveTriggered)
          if (result.diveTriggered && !atk.diveTriggered) {
            store.setAttackDiveTriggered(atk.id)
          }
          break
        case 'loitering':
          result = updateLoitering(atk.position, atk.velocity, atk.params.speed, atk.params.acceleration, dt, newElapsed, atk.loiterCenter, atk.loiterRadius, nearestDefPos, atk.diveTriggered)
          break
        case 'swarm':
          result = updateSwarm(atk, swarmEntities, atk.params.speed, atk.params.turnRate, dt, defTarget)
          break
        default:
          result = updateStraight(atk.position, atk.velocity, atk.params.speed, atk.params.acceleration, dt)
      }

      store.updateEntityPosition(atk.id, result.position, result.velocity)
      store.appendTrail(atk.id, result.position)

      if (result.position[1] < 0) {
        store.setEntityStatus(atk.id, 'exploded')
        store.addExplosion(result.position, 'impact', newElapsed)
      } else if (Math.abs(result.position[0]) > 800 || Math.abs(result.position[2]) > 800) {
        store.setEntityStatus(atk.id, 'destroyed')
      }
    }

    // -- Jet payload launch logic --
    for (const atk of attacks) {
      if (!JET_TYPES.has(atk.type) || !atk.params.payloads.length) continue

      const lastLaunch = jetLaunchTimers.current.get(atk.id) || 0
      if (newElapsed - lastLaunch < JET_LAUNCH_COOLDOWN) continue

      const availablePayload = atk.params.payloads.findIndex((p) => p.count > 0)
      if (availablePayload < 0) continue

      // Find nearest defence as target
      let nearestDef: DefenceEntity | null = null
      let nearestDist = Infinity
      for (const def of defences) {
        const d = distance(atk.position, def.position)
        if (d < JET_LAUNCH_RANGE && d < nearestDist) {
          nearestDist = d
          nearestDef = def
        }
      }

      if (!nearestDef) continue

      const payload = atk.params.payloads[availablePayload]
      const dir: V3 = [
        nearestDef.position[0] - atk.position[0],
        nearestDef.position[1] - atk.position[1],
        nearestDef.position[2] - atk.position[2],
      ]
      const len = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2)
      const normDir: V3 = len > 0 ? [dir[0] / len, dir[1] / len, dir[2] / len] : [0, -1, 0]

      const launchedEntity: AttackEntity = {
        id: crypto.randomUUID(),
        kind: 'attack',
        type: payload.type === 'bomb' ? 'gps-guided-bomb' : payload.type === 'ag-missile' ? 'cruise-missile' : 'anti-radiation-missile',
        trajectory: payload.trajectory,
        position: [...atk.position],
        velocity: [normDir[0] * payload.speed, normDir[1] * payload.speed, normDir[2] * payload.speed],
        params: {
          ...atk.params,
          speed: payload.speed,
          killRadius: payload.killRadius,
          payloads: [],
          payloadCapacity: 0,
        },
        status: 'active',
        trail: [],
        spawnTime: newElapsed,
        isDecoy: false,
        parentJetId: atk.id,
      }
      store.addEntity(launchedEntity)
      store.decrementPayload(atk.id, availablePayload)
      jetLaunchTimers.current.set(atk.id, newElapsed)
    }

    // -- Update interceptors --
    const activeInterceptors = interceptors.filter((i) => i.status === 'active')
    for (const int of activeInterceptors) {
      const target = findAttack(entities, int.targetId)
      if (!target || target.status !== 'active') {
        store.setInterceptorStatus(int.id, 'missed')
        continue
      }

      let result: { position: V3; velocity: V3 }

      switch (int.trajectory) {
        case 'direct-intercept':
          result = updateDirectIntercept(int.position, int.velocity, int.speed, int.turnRate, dt, target.position)
          break
        case 'predictive-intercept':
          result = updatePredictiveIntercept(int.position, int.velocity, int.speed, int.turnRate, dt, target.position, target.velocity)
          break
        case 'proportional-nav':
          result = updateProportionalNav(int.position, int.velocity, int.speed, int.turnRate, dt, target.position, target.velocity)
          break
        case 'radar-guided':
          result = updatePredictiveIntercept(int.position, int.velocity, int.speed, int.turnRate, dt, target.position, target.velocity)
          break
        case 'heat-seeking':
          result = updateHeatSeeking(int.position, int.velocity, int.speed, int.turnRate, dt, target.position)
          break
        case 'burst-fire':
          result = updateBurstProjectile(int.position, int.velocity, int.speed, dt)
          if (newElapsed - int.spawnTime > BURST_LIFETIME) {
            store.setInterceptorStatus(int.id, 'missed')
            continue
          }
          break
        default:
          result = updateDirectIntercept(int.position, int.velocity, int.speed, int.turnRate, dt, target.position)
      }

      store.updateInterceptorPosition(int.id, result.position, result.velocity)
      store.appendInterceptorTrail(int.id, result.position)

      const intercept = checkInterception(
        result.position, target.position,
        int.killRadius, int.accuracy, target.params.stealthFactor
      )

      if (intercept.hit) {
        store.setEntityStatus(target.id, 'intercepted')
        store.setInterceptorStatus(int.id, 'destroyed')
        store.addExplosion(target.position, 'hit', newElapsed)
      } else if (intercept.distance < int.killRadius * 0.5) {
        store.setInterceptorStatus(int.id, 'missed')
        store.addExplosion(result.position, 'miss', newElapsed)
      }

      if (result.position[1] < 0 || Math.abs(result.position[0]) > 800 || Math.abs(result.position[2]) > 800) {
        store.setInterceptorStatus(int.id, 'missed')
      }
    }

    // -- Defence reload & engaged target cleanup --
    for (const def of defences) {
      // Clear engagedTarget if all interceptors targeting it are resolved
      if (def.engagedTarget) {
        const hasActiveInterceptor = interceptors.some(
          (i) => i.parentId === def.id && i.status === 'active'
        )
        if (!hasActiveInterceptor) {
          store.clearEngagedTarget(def.id)
        }
      }

      // Reload logic
      if (def.isReloading) {
        if (newElapsed - def.reloadStartTime >= def.params.reloadTime) {
          store.finishReload(def.id)
        }
      } else if (def.params.ammo <= 0 && def.params.maxAmmo > 0 && def.params.reloadTime > 0) {
        store.startReload(def.id, newElapsed)
      }
    }

    // -- AI Engagement cycle (every 0.5s) --
    engagementCooldown.current -= dt
    if (engagementCooldown.current <= 0) {
      engagementCooldown.current = 0.5

      const jammingMap = buildJammingMap(defences, attacks)

      // Filter defences that can fire (not reloading, have ammo)
      const readyDefences = defences.filter((d) =>
        !d.isReloading && d.params.ammo > 0 && d.type !== 'signal-jammer'
      )
      const decisions = computeEngagements(readyDefences, attacks, interceptors, newElapsed, jammingMap)

      for (const decision of decisions) {
        const def = defences.find((d) => d.id === decision.defenceId)
        const target = attacks.find((a) => a.id === decision.targetId)
        if (!def || !target) continue
        if (def.params.ammo <= 0 || def.isReloading) continue

        if (def.type === 'ciws' || def.type === 'aa-gun' || def.type === 'anti-drone-gun' || def.type === 'laser-defence') {
          for (let i = 0; i < 3; i++) {
            const vel = createBurstVelocity(def.position, target.position, target.velocity, BURST_PROJECTILE_SPEED, 3)
            const intcp: InterceptorEntity = {
              id: crypto.randomUUID(),
              kind: 'interceptor',
              parentId: def.id,
              trajectory: 'burst-fire',
              position: [...def.position],
              velocity: vel,
              targetId: target.id,
              speed: BURST_PROJECTILE_SPEED,
              turnRate: 0,
              accuracy: def.params.accuracy,
              killRadius: def.params.killRadius,
              status: 'active',
              trail: [],
              spawnTime: newElapsed,
            }
            store.addInterceptor(intcp)
          }
        } else {
          const dir: V3 = [
            target.position[0] - def.position[0],
            target.position[1] - def.position[1],
            target.position[2] - def.position[2],
          ]
          const len = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2)
          const normDir: V3 = len > 0 ? [dir[0] / len, dir[1] / len, dir[2] / len] : [0, 1, 0]

          const intcp: InterceptorEntity = {
            id: crypto.randomUUID(),
            kind: 'interceptor',
            parentId: def.id,
            trajectory: def.trajectory,
            position: [def.position[0], def.position[1] + 5, def.position[2]],
            velocity: [normDir[0] * INTERCEPTOR_SPEED, normDir[1] * INTERCEPTOR_SPEED, normDir[2] * INTERCEPTOR_SPEED],
            targetId: target.id,
            speed: INTERCEPTOR_SPEED,
            turnRate: INTERCEPTOR_TURN_RATE,
            accuracy: def.params.accuracy,
            killRadius: def.params.killRadius,
            status: 'active',
            trail: [],
            spawnTime: newElapsed,
          }
          store.addInterceptor(intcp)
          store.addDefenceInterceptor(def.id, intcp.id)
        }

        store.decrementAmmo(def.id)
        store.setDefenceLastFireTime(def.id, newElapsed)
        store.updateDefenceTracking(def.id, [target.id], target.id)
      }
    }

    // -- Replay recording (every 5 frames ≈ 12fps) --
    recordCounter.current++
    if (recordCounter.current % 5 === 0) {
      const replayStore = useReplayStore.getState()
      if (replayStore.isRecording) {
        replayStore.recordFrame({
          time: newElapsed,
          entities: [
            ...entities.map((e) => ({
              id: e.id,
              position: e.position,
              velocity: e.velocity,
              status: e.status,
              kind: e.kind,
            })),
            ...interceptors.map((i) => ({
              id: i.id,
              position: i.position,
              velocity: i.velocity,
              status: i.status,
              kind: 'interceptor' as const,
            })),
          ],
          events: [],
        })
      }
    }

    store.clearExplosions(newElapsed - 3)
  })
}
