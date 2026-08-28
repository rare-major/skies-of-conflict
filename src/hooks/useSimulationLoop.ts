import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import { useEntityStore } from '../store/entityStore'
import { useReplayStore } from '../store/replayStore'
import type { ReplayEvent } from '../store/replayStore'
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
import { getDetectionProbability } from '../logic/radar/detection'
import { useOperationsStore } from '../store/operationsStore'
import type { TrackClassification } from '../types/operations'
import { simulationRandom } from '../logic/game/random'

const INTERCEPTOR_SPEED = 250
const INTERCEPTOR_TURN_RATE = 3.0
const BURST_PROJECTILE_SPEED = 400
const BURST_LIFETIME = 0.8
const JET_LAUNCH_RANGE = 200
const JET_LAUNCH_COOLDOWN = 3.0
const PROTECTED_ZONE_RADIUS = 120

type V3 = [number, number, number]

function sweptClosestDistance(
  interceptorStart: V3,
  interceptorEnd: V3,
  targetStart: V3,
  targetEnd: V3,
): number {
  const relativeStart: V3 = [
    interceptorStart[0] - targetStart[0],
    interceptorStart[1] - targetStart[1],
    interceptorStart[2] - targetStart[2],
  ]
  const relativeDelta: V3 = [
    (interceptorEnd[0] - interceptorStart[0]) - (targetEnd[0] - targetStart[0]),
    (interceptorEnd[1] - interceptorStart[1]) - (targetEnd[1] - targetStart[1]),
    (interceptorEnd[2] - interceptorStart[2]) - (targetEnd[2] - targetStart[2]),
  ]
  const deltaLengthSq = relativeDelta[0] ** 2 + relativeDelta[1] ** 2 + relativeDelta[2] ** 2
  const closestT = deltaLengthSq > 0
    ? Math.max(0, Math.min(1, -(
      relativeStart[0] * relativeDelta[0]
      + relativeStart[1] * relativeDelta[1]
      + relativeStart[2] * relativeDelta[2]
    ) / deltaLengthSq))
    : 0

  return Math.hypot(
    relativeStart[0] + relativeDelta[0] * closestT,
    relativeStart[1] + relativeDelta[1] * closestT,
    relativeStart[2] + relativeDelta[2] * closestT,
  )
}

function findAttack(entities: (AttackEntity | DefenceEntity)[], id: string): AttackEntity | undefined {
  return entities.find((e) => e.id === id && e.kind === 'attack') as AttackEntity | undefined
}

const JET_TYPES = new Set(['f-35', 'f-22', 'su-30', 'su-57', 'rafale', 'j-35', 'fighter-jet', 'stealth-aircraft', 'bomber'])

function weatherInterference(weather: ReturnType<typeof useOperationsStore.getState>['weather']) {
  if (weather === 'monsoon') return 0.3
  if (weather === 'storm') return 0.24
  if (weather === 'dust') return 0.2
  if (weather === 'overcast') return 0.08
  return 0
}

function trackClassification(confidence: number): TrackClassification {
  if (confidence >= 0.82) return 'identified'
  if (confidence >= 0.58) return 'classified'
  if (confidence >= 0.3) return 'probable'
  return 'unconfirmed'
}

function trackLabel(attack: AttackEntity, classification: TrackClassification) {
  if (classification === 'identified') return attack.type.replaceAll('-', ' ').toUpperCase()
  if (classification === 'classified') {
    if (JET_TYPES.has(attack.type)) return 'TACTICAL AIRCRAFT'
    if (attack.type.includes('drone') || attack.type === 'loitering-munition') return 'UNMANNED AIR SYSTEM'
    if (attack.type.includes('bomb')) return 'GUIDED MUNITION'
    return 'MISSILE CLASS TRACK'
  }
  return classification === 'probable' ? 'PROBABLE HOSTILE' : 'UNKNOWN TRACK'
}

function aiSignatureModifier(commander: ReturnType<typeof useOperationsStore.getState>['aiCommander'], attack: AttackEntity, elapsed: number) {
  if (commander === 'stealth') return 0.14
  if (commander === 'deceptive') return attack.isDecoy ? 0.22 : 0.04
  if (commander === 'adaptive') return elapsed > 10 ? 0.06 : 0
  return 0
}

function aiSpeedFactor(commander: ReturnType<typeof useOperationsStore.getState>['aiCommander']) {
  if (commander === 'aggressive') return 1.11
  if (commander === 'saturation') return 1.06
  if (commander === 'stealth') return 0.96
  return 1
}

export function useSimulationLoop() {
  const engagementCooldown = useRef(0)
  const jetLaunchTimers = useRef<Map<string, number>>(new Map())
  const recordCounter = useRef(0)
  const replayStatuses = useRef<Map<string, AttackEntity['status']>>(new Map())
  const replayInterceptorIds = useRef<Set<string>>(new Set())
  const announcedTracks = useRef<Set<string>>(new Set())
  const lastLaunchCallout = useRef(-10)

  useFrame((_, rawDelta) => {
    const { isRunning, timeScale, elapsed } = useSimulationStore.getState()
    if (!isRunning) return

    const dt = Math.min(rawDelta * timeScale, 0.1)
    const newElapsed = elapsed + dt
    useSimulationStore.getState().tick(dt)

    const store = useEntityStore.getState()
    const operations = useOperationsStore.getState()
    const { entities, interceptors } = store
    const attacks = entities.filter((e) => e.kind === 'attack' && e.status === 'active') as AttackEntity[]
    const launchedAttacks = attacks.filter((attack) => newElapsed >= (attack.activationTime || 0))
    const defences = entities.filter((e) => e.kind === 'defence' && e.status === 'active') as DefenceEntity[]
    const swarmEntities = launchedAttacks.filter((a) => a.trajectory === 'swarm')

    if (attacks.length === 0 && elapsed > 0 && entities.some((e) => e.kind === 'attack')) {
      store.clearExplosions(Number.POSITIVE_INFINITY)
      useSimulationStore.getState().pause()
      return
    }

    // Compute defence centroid as target for attack trajectories
    let defTarget: V3 = [0, 0, 0]
    if (defences.length > 0) {
      let cx = 0, cz = 0
      for (const d of defences) { cx += d.position[0]; cz += d.position[2] }
      defTarget = [cx / defences.length, 0, cz / defences.length]
    }
    const sealedZoneRadius = defences.reduce(
      (radius, defence) => Math.max(radius, defence.params.sealedZoneRadius || 0),
      0,
    )

    // -- Update attack entities --
    for (const atk of launchedAttacks) {
      let result: { position: V3; velocity: V3; diveTriggered?: boolean }
      const commandedSpeed = atk.params.speed * aiSpeedFactor(operations.aiCommander)

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
          result = updateStraight(atk.position, atk.velocity, commandedSpeed, atk.params.acceleration, dt)
          break
        case 'ballistic':
          result = updateBallistic(atk.position, atk.velocity, commandedSpeed, atk.params.acceleration, dt)
          break
        case 'cruise':
          result = updateCruise(atk.position, atk.velocity, commandedSpeed, atk.params.acceleration, dt)
          break
        case 'zigzag':
          result = updateZigzag(
            atk.position,
            atk.velocity,
            commandedSpeed,
            atk.params.acceleration,
            dt,
            newElapsed,
            defTarget,
            Array.from(atk.id.slice(-8)).reduce((sum, char) => sum + char.charCodeAt(0), 0) * 0.17,
          )
          break
        case 'waypoint': {
          result = updateStraight(atk.position, atk.velocity, commandedSpeed, atk.params.acceleration, dt)
          break
        }
        case 'dive':
          result = updateDive(atk.position, atk.velocity, commandedSpeed, atk.params.acceleration, dt, nearestDefPos, atk.diveTriggered)
          if (result.diveTriggered && !atk.diveTriggered) {
            store.setAttackDiveTriggered(atk.id)
          }
          break
        case 'loitering':
          result = updateLoitering(atk.position, atk.velocity, commandedSpeed, atk.params.acceleration, dt, newElapsed, atk.loiterCenter, atk.loiterRadius, nearestDefPos, atk.diveTriggered)
          break
        case 'swarm':
          result = updateSwarm(atk, swarmEntities, commandedSpeed, atk.params.turnRate, dt, defTarget)
          break
        default:
          result = updateStraight(atk.position, atk.velocity, commandedSpeed, atk.params.acceleration, dt)
      }

      const turbulence = weatherInterference(operations.weather) * operations.windStrength
      if (turbulence > 0) {
        result.position = [
          result.position[0] + (simulationRandom() - 0.5) * turbulence * 3.5,
          result.position[1] + (simulationRandom() - 0.5) * turbulence * 1.2,
          result.position[2] + (simulationRandom() - 0.5) * turbulence * 3.5,
        ]
      }

      if (atk.params.guidanceSystem === 'gps' || atk.params.guidanceSystem === 'command' || atk.params.guidanceSystem === 'radar') {
        const jammer = defences.find((defence) => defence.type === 'signal-jammer' && distance(defence.position, result.position) < Math.max(140, defence.params.detectionRange))
        if (jammer) {
          const strength = Math.max(0.08, jammer.params.jammingStrength || 0.35)
          result.position = [result.position[0] + (simulationRandom() - 0.5) * strength * 9, result.position[1], result.position[2] + (simulationRandom() - 0.5) * strength * 9]
        }
      }

      store.updateEntityPosition(atk.id, result.position, result.velocity)
      store.appendTrail(atk.id, result.position)

      const dx = result.position[0] - defTarget[0]
      const dz = result.position[2] - defTarget[2]
      const distanceFromProtectedZone = Math.hypot(dx, dz)

      if (sealedZoneRadius > 0 && distanceFromProtectedZone <= sealedZoneRadius) {
        store.setEntityStatus(atk.id, 'intercepted')
        store.addExplosion(result.position, 'hit', newElapsed)
      } else if (result.position[1] < 0) {
        const reachedProtectedZone = defences.length > 0 && Math.hypot(dx, dz) <= PROTECTED_ZONE_RADIUS
        store.setEntityStatus(atk.id, reachedProtectedZone ? 'exploded' : 'missed')
        store.addExplosion(result.position, reachedProtectedZone ? 'impact' : 'miss', newElapsed)
        if (reachedProtectedZone) {
          let nearestDefence: DefenceEntity | undefined
          let nearestDistance = Number.POSITIVE_INFINITY
          for (const defence of defences) {
            const currentDistance = distance(defence.position, result.position)
            if (currentDistance < nearestDistance) { nearestDistance = currentDistance; nearestDefence = defence }
          }
          if (nearestDefence && nearestDistance <= Math.max(72, atk.params.killRadius * 5)) {
            const subsystem = atk.type === 'anti-radiation-missile' ? 'radar' : atk.params.guidanceSystem === 'gps' ? 'communications' : 'weapons'
            store.applyDamage(nearestDefence.id, Math.min(100, 28 + atk.params.killRadius * 4), subsystem)
          }
          if (operations.radioChatter) operations.addRadioMessage({ time: newElapsed, speaker: 'BATTLE MANAGER', message: 'Impact registered inside the protected sector. Damage-control teams responding.', tone: 'warning' })
        }
      } else if (Math.abs(result.position[0]) > 800 || Math.abs(result.position[2]) > 800) {
        store.setEntityStatus(atk.id, 'missed')
      }
    }

    // -- Jet payload launch logic --
    for (const atk of launchedAttacks) {
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
      const previousTarget = findAttack(entities, int.targetId)
      const target = findAttack(useEntityStore.getState().entities, int.targetId)
      if (!previousTarget || !target || target.status !== 'active') {
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

      const closestDistance = sweptClosestDistance(
        int.position,
        result.position,
        previousTarget.position,
        target.position,
      )
      let resolved = false
      if (closestDistance <= int.killRadius) {
        const intercept = checkInterception(
          result.position, target.position,
          int.killRadius, int.accuracy, target.params.stealthFactor,
          closestDistance,
          int.assuredKill,
        )

        if (intercept.hit) {
          store.setEntityStatus(target.id, 'intercepted')
          store.setInterceptorStatus(int.id, 'destroyed')
          store.addExplosion(target.position, 'hit', newElapsed)
          if (operations.radioChatter) operations.addRadioMessage({ time: newElapsed, speaker: 'WEAPONS', message: `Track ${target.id.slice(0, 4).toUpperCase()} destroyed. Confirmed kill.`, tone: 'success' })
        } else {
          store.setInterceptorStatus(int.id, 'missed')
          store.addExplosion(result.position, 'miss', newElapsed)
          if (closestDistance <= int.killRadius * 2.2) store.applyDamage(target.id, 18 + int.killRadius * 1.4, 'guidance')
        }
        resolved = true
      }

      if (!resolved && (result.position[1] < 0 || Math.abs(result.position[0]) > 800 || Math.abs(result.position[2]) > 800)) {
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
      engagementCooldown.current = operations.activeDoctrine === 'rapid-response' ? 0.34 : 0.5

      const jammingMap = buildJammingMap(defences, launchedAttacks)
      const interference = weatherInterference(operations.weather) * (operations.activeDoctrine === 'hardened-network' ? 0.7 : 1)
      for (const defence of defences) jammingMap.set(defence.id, Math.min(0.9, (jammingMap.get(defence.id) || 0) + interference))

      for (const attack of launchedAttacks) {
        let probability = 0
        let jammed = false
        for (const defence of defences) {
          const jamming = jammingMap.get(defence.id) || 0
          jammed ||= jamming > 0.28
          const stealth = Math.min(0.97, attack.params.stealthFactor + aiSignatureModifier(operations.aiCommander, attack, newElapsed))
          probability = Math.max(probability, defence.params.assuredDetection ? 1 : getDetectionProbability(defence.position, defence.facing, defence.params.fovAngle, defence.params.detectionRange, attack.position, stealth, jamming))
        }
        const previous = operations.sensorTracks[attack.id]
        const fusionFactor = operations.activeDoctrine === 'sensor-fusion' ? 1.18 : 1
        const confidence = Math.max(0, Math.min(1, (previous?.confidence || 0) + probability * 0.34 * fusionFactor - (probability < 0.04 ? 0.065 : 0.012)))
        const classification = trackClassification(confidence)
        const uncertainty = (1 - confidence) * 24
        const estimatedPosition: V3 = [attack.position[0] + (simulationRandom() - 0.5) * uncertainty, attack.position[1] + (simulationRandom() - 0.5) * uncertainty * 0.2, attack.position[2] + (simulationRandom() - 0.5) * uncertainty]
        operations.updateSensorTrack({ entityId: attack.id, confidence, classification, lastSeen: newElapsed, estimatedPosition, truePosition: classification === 'identified' ? attack.position : undefined, label: trackLabel(attack, classification), jammed })
        if (confidence >= 0.3 && !announcedTracks.current.has(attack.id)) {
          announcedTracks.current.add(attack.id)
          if (operations.radioChatter) operations.addRadioMessage({ time: newElapsed, speaker: 'SENSOR FUSION', message: `New ${trackLabel(attack, classification).toLowerCase()} correlated. Confidence ${Math.round(confidence * 100)} percent.`, tone: jammed ? 'warning' : 'intel' })
        }
      }
      operations.pruneSensorTracks(entities.filter((entity) => entity.kind === 'attack').map((entity) => entity.id))

      // Filter defences that can fire (not reloading, have ammo)
      const readyDefences = defences.filter((d) =>
        !d.isReloading
        && d.params.ammo > 0
        && d.type !== 'signal-jammer'
        && newElapsed - d.spawnTime >= d.params.reactionDelay
      )
      const commandAttacks = launchedAttacks.map((attack) => ({ ...attack, params: { ...attack.params, stealthFactor: Math.min(0.97, attack.params.stealthFactor + aiSignatureModifier(operations.aiCommander, attack, newElapsed)) } }))
      const decisions = computeEngagements(readyDefences, commandAttacks, interceptors, newElapsed, jammingMap)

      for (const decision of decisions) {
        const def = defences.find((d) => d.id === decision.defenceId)
        const target = launchedAttacks.find((a) => a.id === decision.targetId)
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
              accuracy: Math.min(1, def.params.accuracy + (operations.activeDoctrine === 'terminal-focus' ? 0.06 : 0)),
              killRadius: def.params.killRadius,
              assuredKill: def.params.assuredKill,
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
            accuracy: Math.min(1, def.params.accuracy + (operations.activeDoctrine === 'terminal-focus' ? 0.06 : 0)),
            killRadius: def.params.killRadius,
            assuredKill: def.params.assuredKill,
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
        if (operations.radioChatter && newElapsed - lastLaunchCallout.current > 2.4) {
          lastLaunchCallout.current = newElapsed
          operations.addRadioMessage({ time: newElapsed, speaker: 'AIR DEFENCE', message: `Weapons free. Interceptor away against ${target.id.slice(0, 4).toUpperCase()}.`, tone: 'system' })
        }
      }
    }

    // -- Replay recording (every 5 frames ≈ 12fps) --
    recordCounter.current++
    if (recordCounter.current % 5 === 0) {
      const replayStore = useReplayStore.getState()
      if (replayStore.isRecording) {
        if (replayStore.frames.length === 0) {
          replayStatuses.current.clear()
          replayInterceptorIds.current.clear()
        }
        const currentState = useEntityStore.getState()
        const events: ReplayEvent[] = []
        for (const entity of currentState.entities) {
          const previousStatus = replayStatuses.current.get(entity.id)
          if (entity.kind === 'attack' && previousStatus && previousStatus !== entity.status) {
            const type: ReplayEvent['type'] = entity.status === 'intercepted'
              ? 'hit'
              : entity.status === 'exploded'
                ? 'impact'
                : 'miss'
            events.push({ type, entityId: entity.id, time: newElapsed, position: entity.position })
          }
          replayStatuses.current.set(entity.id, entity.status)
        }
        for (const interceptor of currentState.interceptors) {
          if (!replayInterceptorIds.current.has(interceptor.id)) {
            events.push({ type: 'launch', entityId: interceptor.id, time: newElapsed, position: interceptor.position })
            replayInterceptorIds.current.add(interceptor.id)
          }
        }
        replayStore.recordFrame({
          time: newElapsed,
          entities: [
            ...currentState.entities.map((e) => ({
              id: e.id,
              position: e.position,
              velocity: e.velocity,
              status: e.status,
              kind: e.kind,
            })),
            ...currentState.interceptors.map((i) => ({
              id: i.id,
              position: i.position,
              velocity: i.velocity,
              status: i.status,
              kind: 'interceptor' as const,
            })),
          ],
          events,
        })
      }
    }

    store.clearExplosions(newElapsed - 3)
  })
}
