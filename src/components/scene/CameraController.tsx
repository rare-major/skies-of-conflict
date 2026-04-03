import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCameraStore } from '../../store/cameraStore'
import { useEntityStore } from '../../store/entityStore'
import { useSimulationStore } from '../../store/simulationStore'

const LERP_SPEED = 2.0
const ORBIT_SPEED = 0.15
const COMBAT_DISTANCE = 350
const COMBAT_HEIGHT = 200

export function CameraController() {
  const orbitAngle = useRef(0)
  const prevExplosionCount = useRef(0)

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05)
    const { mode, followEntityId, shakeIntensity } = useCameraStore.getState()
    const isRunning = useSimulationStore.getState().isRunning

    if (mode === 'free' && shakeIntensity <= 0) return

    const entities = useEntityStore.getState().entities
    const explosions = useEntityStore.getState().explosions

    if (explosions.length > prevExplosionCount.current && explosions.length > 0) {
      useCameraStore.getState().triggerShake(0.6)
    }
    prevExplosionCount.current = explosions.length

    if (shakeIntensity > 0) {
      useCameraStore.getState().decayShake(dt)
      const shake = shakeIntensity * 2
      state.camera.position.x += (Math.random() - 0.5) * shake
      state.camera.position.y += (Math.random() - 0.5) * shake * 0.5
      state.camera.position.z += (Math.random() - 0.5) * shake
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

    const controls = state.controls as any
    const cam = state.camera

    if (mode === 'follow' && followEntityId) {
      const entity = entities.find((e) => e.id === followEntityId)
      if (entity) {
        const target = new THREE.Vector3(...entity.position)
        const offset = new THREE.Vector3(40, 30, 40)
        const desiredPos = target.clone().add(offset)
        cam.position.lerp(desiredPos, LERP_SPEED * dt)
        if (controls?.target) {
          controls.target.lerp(target, LERP_SPEED * dt)
        }
      }
    } else if (mode === 'combat') {
      const desiredTarget = center.clone()
      const desiredPos = new THREE.Vector3(
        center.x + COMBAT_DISTANCE * 0.6,
        center.y + COMBAT_HEIGHT,
        center.z + COMBAT_DISTANCE * 0.6
      )
      cam.position.lerp(desiredPos, LERP_SPEED * 0.5 * dt)
      if (controls?.target) {
        controls.target.lerp(desiredTarget, LERP_SPEED * 0.5 * dt)
      }
    } else if (mode === 'cinematic') {
      orbitAngle.current += ORBIT_SPEED * dt
      const radius = COMBAT_DISTANCE
      const desiredPos = new THREE.Vector3(
        center.x + Math.cos(orbitAngle.current) * radius,
        center.y + COMBAT_HEIGHT * 0.8,
        center.z + Math.sin(orbitAngle.current) * radius
      )
      cam.position.lerp(desiredPos, LERP_SPEED * 0.3 * dt)
      if (controls?.target) {
        controls.target.lerp(center, LERP_SPEED * 0.5 * dt)
      }
    }
  })

  return null
}
