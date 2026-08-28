import { useCallback } from 'react'
import { useEntityStore } from '../store/entityStore'
import { useSimulationStore } from '../store/simulationStore'
import { useCameraStore } from '../store/cameraStore'
import { ATTACK_PRESETS } from '../data/attackPresets'
import { DEFENCE_PRESETS } from '../data/defencePresets'
import type { AttackEntity, DefenceEntity, AttackType, DefenceType, AttackTrajectory, DefenceTrajectory } from '../types/entities'
import type { Vector3Tuple } from 'three'
import type { Scenario } from '../types/scenarios'
import type { EntityParams } from '../types/entities'
import { setSimulationSeed } from '../logic/game/random'
import { useOperationsStore } from '../store/operationsStore'

const GRAVITY = 9.81

function normalize3(v: Vector3Tuple): Vector3Tuple {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
  if (len < 0.0001) return [1, 0, 0]
  return [v[0] / len, v[1] / len, v[2] / len]
}

function computeAttackCentroid(scenario: Scenario): Vector3Tuple {
  if (scenario.attacks.length === 0) return [-400, 50, 0]
  let x = 0, y = 0, z = 0
  for (const atk of scenario.attacks) {
    const count = atk.count || 1
    x += atk.position[0] * count
    y += atk.position[1] * count
    z += atk.position[2] * count
  }
  const total = scenario.attacks.reduce((acc, a) => acc + (a.count || 1), 0)
  return [x / total, y / total, z / total]
}

function computeDefenceCentroid(scenario: Scenario): Vector3Tuple {
  if (scenario.defences.length === 0) return [0, 0, 0]
  let x = 0, z = 0
  for (const def of scenario.defences) {
    x += def.position[0]
    z += def.position[2]
  }
  const n = scenario.defences.length
  return [x / n, 0, z / n]
}

/**
 * Compute launch velocity for a ballistic arc that lands near the target.
 * Uses projectile kinematics: given speed, compute launch angle for range.
 */
function computeBallisticVelocity(
  attackPos: Vector3Tuple,
  targetPos: Vector3Tuple,
  speed: number
): Vector3Tuple {
  const dx = targetPos[0] - attackPos[0]
  const dz = targetPos[2] - attackPos[2]
  const hDist = Math.sqrt(dx * dx + dz * dz)
  if (hDist < 1) return [0, speed, 0]

  const hDirX = dx / hDist
  const hDirZ = dz / hDist

  const sinTwoTheta = (hDist * GRAVITY) / (speed * speed)
  let theta: number
  if (sinTwoTheta >= 1) {
    theta = Math.PI / 4
  } else {
    theta = Math.asin(Math.min(1, sinTwoTheta)) / 2
    theta = Math.max(theta, Math.PI / 7)
  }

  const hSpeed = speed * Math.cos(theta)
  const vSpeed = speed * Math.sin(theta)
  return [hDirX * hSpeed, vSpeed, hDirZ * hSpeed]
}

/**
 * Aim a non-ballistic attack velocity toward the defense centroid while
 * preserving the original speed magnitude.
 */
function aimVelocityAtTarget(
  attackPos: Vector3Tuple,
  targetPos: Vector3Tuple,
  originalVelocity: Vector3Tuple,
  trajectory: AttackTrajectory
): Vector3Tuple {
  const speed = Math.sqrt(
    originalVelocity[0] ** 2 + originalVelocity[1] ** 2 + originalVelocity[2] ** 2
  )
  if (speed < 0.1) return originalVelocity

  const dx = targetPos[0] - attackPos[0]
  const dz = targetPos[2] - attackPos[2]
  const hDist = Math.sqrt(dx * dx + dz * dz)
  if (hDist < 1) return originalVelocity

  const hDirX = dx / hDist
  const hDirZ = dz / hDist

  if (trajectory === 'cruise' || trajectory === 'straight') {
    return [hDirX * speed, originalVelocity[1], hDirZ * speed]
  }

  if (trajectory === 'dive') {
    return [hDirX * speed, 0, hDirZ * speed]
  }

  const yVel = originalVelocity[1]
  const hSpeed = Math.sqrt(Math.max(0, speed * speed - yVel * yVel))
  return [hDirX * hSpeed, yVel, hDirZ * hSpeed]
}

function computeSpreadFacings(
  defencePositions: Vector3Tuple[],
  attackCentroid: Vector3Tuple,
  count: number
): Vector3Tuple[] {
  if (count === 0) return []
  if (count === 1) {
    const dir: Vector3Tuple = [
      attackCentroid[0] - defencePositions[0][0],
      0,
      attackCentroid[2] - defencePositions[0][2],
    ]
    return [normalize3(dir)]
  }

  const spreadAngle = Math.PI * 0.3
  return defencePositions.map((pos, i) => {
    const baseDir: Vector3Tuple = [
      attackCentroid[0] - pos[0],
      0,
      attackCentroid[2] - pos[2],
    ]
    const baseNorm = normalize3(baseDir)
    const baseAngle = Math.atan2(baseNorm[2], baseNorm[0])
    const offset = count > 1
      ? -spreadAngle + (2 * spreadAngle * i) / (count - 1)
      : 0
    const angle = baseAngle + offset
    return normalize3([Math.cos(angle), 0, Math.sin(angle)])
  })
}

export function useEntitySpawner() {
  const addEntity = useEntityStore((s) => s.addEntity)
  const clearAll = useEntityStore((s) => s.clearAll)

  const spawnAttack = useCallback((
    type: AttackType,
    trajectory: AttackTrajectory,
    position?: Vector3Tuple,
    velocity?: Vector3Tuple,
    params?: Partial<EntityParams>,
    activationTime?: number,
  ) => {
    const preset = ATTACK_PRESETS.find((p) => p.type === type) || ATTACK_PRESETS[0]
    const pos = position || [-400, 50 + Math.random() * 60, (Math.random() - 0.5) * 200]
    let vel = velocity || [preset.params.speed, 0, 0]

    if (trajectory === 'ballistic' && vel[1] <= 0) {
      const hSpeed = Math.sqrt(vel[0] * vel[0] + vel[2] * vel[2])
      vel = [vel[0] * 0.75, hSpeed * 0.65, vel[2] * 0.75]
    }

    const entity: AttackEntity = {
      id: crypto.randomUUID(),
      kind: 'attack',
      type,
      trajectory,
      position: pos as Vector3Tuple,
      velocity: vel as Vector3Tuple,
      params: { ...preset.params, ...params, payloads: params?.payloads?.map((p) => ({ ...p })) ?? preset.params.payloads.map((p) => ({ ...p })) },
      status: 'active',
      trail: [],
      spawnTime: useSimulationStore.getState().elapsed,
      activationTime,
      isDecoy: preset.isDecoy,
      integrity: 100,
      subsystems: { radar: 100, propulsion: 100, guidance: 100, weapons: 100, communications: 100 },
    }
    addEntity(entity)
    return entity.id
  }, [addEntity])

  const spawnDefence = useCallback((
    type: DefenceType,
    trajectory: DefenceTrajectory,
    position?: Vector3Tuple,
    facing?: Vector3Tuple,
    presetId?: string,
    params?: Partial<EntityParams>,
  ) => {
    const preset = DEFENCE_PRESETS.find((p) => p.id === presetId)
      || DEFENCE_PRESETS.find((p) => p.type === type)
      || DEFENCE_PRESETS[0]
    const pos = position || [50 + Math.random() * 100, 0, (Math.random() - 0.5) * 100]

    const entity: DefenceEntity = {
      id: crypto.randomUUID(),
      kind: 'defence',
      type,
      trajectory,
      position: pos as Vector3Tuple,
      velocity: [0, 0, 0],
      params: { ...preset.params, ...params, payloads: [] },
      status: 'active',
      trail: [],
      spawnTime: useSimulationStore.getState().elapsed,
      isInterceptor: preset.isInterceptor,
      lastFireTime: -999,
      trackedTargets: [],
      interceptors: [],
      isReloading: false,
      reloadStartTime: 0,
      facing: facing || [-1, 0, 0],
      presetId: preset.id,
      integrity: 100,
      subsystems: { radar: 100, propulsion: 100, guidance: 100, weapons: 100, communications: 100 },
    }
    addEntity(entity)
    return entity.id
  }, [addEntity])

  const loadScenario = useCallback((scenario: Scenario) => {
    clearAll()
    useOperationsStore.getState().clearSensorTracks()
    useOperationsStore.getState().clearRadioMessages()
    useSimulationStore.getState().reset()
    setSimulationSeed(scenario.simulationSeed ?? Date.now())

    const defCentroid = computeDefenceCentroid(scenario)

    for (const atk of scenario.attacks) {
      const count = atk.count || 1
      for (let i = 0; i < count; i++) {
        const offset = atk.spacing || 0
        const pos: Vector3Tuple = [
          atk.position[0] + i * offset,
          atk.position[1],
          atk.position[2] + i * offset * 0.5,
        ]

        let vel = atk.velocity
        const preset = ATTACK_PRESETS.find((p) => p.type === atk.type) || ATTACK_PRESETS[0]
        const baseSpeed = vel
          ? Math.sqrt(vel[0] ** 2 + vel[1] ** 2 + vel[2] ** 2)
          : preset.params.speed

        if (atk.trajectory === 'ballistic') {
          vel = computeBallisticVelocity(pos, defCentroid, baseSpeed)
        } else if (vel) {
          vel = aimVelocityAtTarget(pos, defCentroid, vel, atk.trajectory)
        }

        spawnAttack(atk.type, atk.trajectory, pos, vel, atk.params, atk.launchDelay)
      }
    }

    const attackCentroid = computeAttackCentroid(scenario)
    const defPositions = scenario.defences.map((d) => d.position)
    const autoFacings = computeSpreadFacings(defPositions, attackCentroid, scenario.defences.length)

    for (let i = 0; i < scenario.defences.length; i++) {
      const def = scenario.defences[i]
      const facing = def.facing || autoFacings[i] || [-1, 0, 0]
      spawnDefence(def.type, def.trajectory, def.position, facing, def.presetId, def.params)
    }

    captureInitialSnapshot()
    useCameraStore.getState().setMode('cinematic')
    const operations = useOperationsStore.getState()
    if (operations.directorEnabled) operations.setBriefingVisible(true)
    if (operations.radioChatter) operations.addRadioMessage({ time: 0, speaker: 'BATTLE MANAGER', message: `${scenario.name} loaded. Sensor network is initializing.`, tone: 'system' })
  }, [clearAll, spawnAttack, spawnDefence])

  return { spawnAttack, spawnDefence, loadScenario, clearAll }
}

function captureInitialSnapshot() {
  const snap = useEntityStore.getState()
  useSimulationStore.getState().setInitialSnapshot({
    entities: JSON.parse(JSON.stringify(snap.entities)),
    interceptors: [],
  })
}
