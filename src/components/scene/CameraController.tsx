import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCameraStore } from '../../store/cameraStore'
import { useEntityStore } from '../../store/entityStore'
import { useOperationsStore } from '../../store/operationsStore'
import { useSimulationStore } from '../../store/simulationStore'

const LERP_SPEED = 2.0
const ORBIT_SPEED = 0.09
const COMBAT_DISTANCE = 350
const WORLD_UP = new THREE.Vector3(0, 1, 0)

export function CameraController() {
  const orbitAngle = useRef(0)
  const prevExplosionCount = useRef(0)
  const previousShake = useRef(new THREE.Vector3())

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05)
    const { mode, followEntityId, shakeIntensity } = useCameraStore.getState()
    const directorEnabled = useOperationsStore.getState().directorEnabled
    const elapsed = useSimulationStore.getState().elapsed

    const entities = useEntityStore.getState().entities
    const explosions = useEntityStore.getState().explosions
    const cam = state.camera

    cam.position.sub(previousShake.current)
    previousShake.current.set(0, 0, 0)

    if (explosions.length > prevExplosionCount.current && explosions.length > 0) {
      useCameraStore.getState().triggerShake(0.6)
    }
    prevExplosionCount.current = explosions.length

    if (shakeIntensity > 0) {
      useCameraStore.getState().decayShake(dt)
      const shake = shakeIntensity * 1.45
      previousShake.current.set(
        (Math.random() - 0.5) * shake,
        (Math.random() - 0.5) * shake * 0.45,
        (Math.random() - 0.5) * shake,
      )
      cam.position.add(previousShake.current)
    }

    if (mode === 'free') return

    const activeAttacks = entities.filter((e) => e.kind === 'attack' && e.status === 'active')
    const activeDefences = entities.filter((e) => e.kind === 'defence' && e.status === 'active')
    const allActive = [...activeAttacks, ...activeDefences]

    if (allActive.length === 0) return

    const center = new THREE.Vector3()
    for (const e of allActive) {
      center.x += e.position[0]
      center.y += e.position[1]
      center.z += e.position[2]
    }
    center.divideScalar(allActive.length)

    const bounds = new THREE.Box3()
    for (const e of allActive) bounds.expandByPoint(new THREE.Vector3(...e.position))
    const span = bounds.getSize(new THREE.Vector3()).length()
    const adaptiveDistance = THREE.MathUtils.clamp(span * 0.72, 280, 520)

    const controls = state.controls as { target?: THREE.Vector3; update?: () => void } | null

    if (mode === 'follow' && followEntityId) {
      const entity = entities.find((e) => e.id === followEntityId)
      if (entity) {
        const target = new THREE.Vector3(...entity.position)
        const heading = new THREE.Vector3(...entity.velocity)
        if (heading.lengthSq() < 0.0001) heading.set(0, 0, -1)
        heading.normalize()

        // A low, offset chase camera keeps the silhouette, bank and exhaust in
        // view. The old fixed world-space offset often left small aircraft lost
        // against the terrain or presented edge-on as an indistinct bar.
        const side = new THREE.Vector3().crossVectors(heading, WORLD_UP)
        if (side.lengthSq() < 0.0001) side.set(1, 0, 0)
        side.normalize()
        const isAttack = entity.kind === 'attack'
        const followDistance = isAttack ? 24 : 31
        const followHeight = isAttack ? 9 : 16
        const desiredPos = target.clone()
          .addScaledVector(heading, -followDistance)
          .addScaledVector(side, 7)
          .addScaledVector(WORLD_UP, followHeight)
        const lookAhead = target.clone().addScaledVector(heading, isAttack ? 7 : 3)

        const chaseAlpha = 1 - Math.exp(-8 * dt)
        cam.position.lerp(desiredPos, chaseAlpha)
        if ('fov' in cam) {
          cam.fov = THREE.MathUtils.lerp(cam.fov, isAttack ? 38 : 43, dt * 2.4)
          cam.updateProjectionMatrix()
        }
        if (controls?.target) {
          controls.target.copy(lookAhead)
          controls.update?.()
        } else {
          cam.lookAt(lookAhead)
        }
      }
    } else if (mode === 'combat') {
      const desiredTarget = center.clone()
      const desiredPos = new THREE.Vector3(
        center.x + adaptiveDistance * 0.58,
        center.y + Math.max(135, adaptiveDistance * 0.46),
        center.z + adaptiveDistance * 0.58
      )
      cam.position.lerp(desiredPos, LERP_SPEED * 0.5 * dt)
      if ('fov' in cam) {
        cam.fov = THREE.MathUtils.lerp(cam.fov, 46, dt * 1.2)
        cam.updateProjectionMatrix()
      }
      if (controls?.target) {
        controls.target.lerp(desiredTarget, LERP_SPEED * 0.5 * dt)
      }
    } else if (mode === 'cinematic') {
      orbitAngle.current += ORBIT_SPEED * dt
      const latestExplosion = explosions.at(-1)
      const focusExplosion = directorEnabled && latestExplosion && elapsed - latestExplosion.time < 1.8 ? latestExplosion : null
      const directorCenter = focusExplosion ? new THREE.Vector3(...focusExplosion.position) : center
      const radius = focusExplosion ? 145 : Math.max(COMBAT_DISTANCE, adaptiveDistance)
      const desiredPos = new THREE.Vector3(
        directorCenter.x + Math.cos(orbitAngle.current) * radius,
        directorCenter.y + Math.max(focusExplosion ? 48 : 110, radius * 0.34),
        directorCenter.z + Math.sin(orbitAngle.current) * radius
      )
      cam.position.lerp(desiredPos, LERP_SPEED * (focusExplosion ? 0.75 : 0.3) * dt)
      if ('fov' in cam) {
        cam.fov = THREE.MathUtils.lerp(cam.fov, focusExplosion ? 34 : 42, dt * (focusExplosion ? 2.4 : 0.8))
        cam.updateProjectionMatrix()
      }
      if (controls?.target) {
        controls.target.lerp(directorCenter, LERP_SPEED * (focusExplosion ? 1.2 : 0.5) * dt)
      }
    }
  })

  return null
}
