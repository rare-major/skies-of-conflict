import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useThemeStore } from '../../store/themeStore'
import type { DefenceEntity } from '../../types/entities'

interface Props {
  defence: DefenceEntity
}

const COLORS = {
  dark: {
    engaged: new THREE.Color('#ef3657'),
    tracking: new THREE.Color('#e8a51e'),
    idle: new THREE.Color('#00c98b'),
  },
  light: {
    engaged: new THREE.Color('#e11d48'),
    tracking: new THREE.Color('#b45309'),
    idle: new THREE.Color('#047857'),
  },
}

const RANGE_RINGS = [0.34, 0.67, 1]

function buildGradientCone(radius: number, height: number, segments: number) {
  const geo = new THREE.ConeGeometry(radius, height, segments, 1, true)
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)

  let minY = Infinity, maxY = -Infinity
  for (let i = 0; i < pos.count; i++) {
    minY = Math.min(minY, pos.getY(i))
    maxY = Math.max(maxY, pos.getY(i))
  }
  const range = maxY - minY || 1

  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) - minY) / range
    colors[i * 3] = t
    colors[i * 3 + 1] = t
    colors[i * 3 + 2] = t
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geo
}

export function RadarCone({ defence }: Props) {
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'
  const fillRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  const { detectionRange, fovAngle } = defence.params
  const isEngaged = !!defence.engagedTarget
  const isTracking = defence.trackedTargets.length > 0

  const palette = dark ? COLORS.dark : COLORS.light
  const color = isEngaged ? palette.engaged : isTracking ? palette.tracking : palette.idle
  const fillOpacity = isEngaged ? 0.18 : isTracking ? 0.12 : 0.065
  const wireOpacity = isEngaged ? 0.56 : isTracking ? 0.42 : 0.28
  const glowIntensity = isEngaged ? 2.4 : isTracking ? 0.9 : 0.15
  const glowDistance = Math.min(detectionRange * 0.6, 200)

  const coneHeight = Math.min(detectionRange, 360)
  const coneRadius = coneHeight * Math.tan((Math.min(fovAngle, 360) / 2) * (Math.PI / 180))
  const clampedRadius = Math.min(coneRadius, 160)

  const fillGeo = useMemo(
    () => buildGradientCone(clampedRadius, coneHeight, 24),
    [clampedRadius, coneHeight],
  )
  const wireGeo = useMemo(
    () => new THREE.ConeGeometry(clampedRadius, coneHeight, 24, 1, true),
    [clampedRadius, coneHeight],
  )

  const { facingRotation, coneOffset } = useMemo(() => {
    if (fovAngle >= 360) {
      return { facingRotation: new THREE.Euler(0, 0, 0), coneOffset: new THREE.Vector3(0, 0, 0) }
    }
    const facing = defence.facing || [0, 0, 1]
    const dir = new THREE.Vector3(facing[0], facing[1], facing[2]).normalize()
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    return {
      facingRotation: new THREE.Euler().setFromQuaternion(quaternion),
      coneOffset: dir.multiplyScalar(coneHeight / 2),
    }
  }, [coneHeight, defence.facing, fovAngle])

  useFrame(() => {
    if (!isEngaged && !isTracking) return

    const pulse = 0.85 + Math.sin(Date.now() * (isEngaged ? 0.008 : 0.004)) * 0.15
    if (fillRef.current) {
      const mat = fillRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = fillOpacity * pulse
    }
    if (wireRef.current) {
      const mat = wireRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = wireOpacity * pulse
    }
    if (lightRef.current) {
      lightRef.current.intensity = glowIntensity * pulse
    }
  })

  if (fovAngle >= 360) {
    const sphereRadius = Math.min(detectionRange, 280)
    return (
      <group position={defence.position} renderOrder={4}>
        {RANGE_RINGS.map((scale) => {
          const radius = sphereRadius * scale
          const thickness = Math.max(0.9, sphereRadius * 0.006)
          return (
            <mesh key={scale} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
              <ringGeometry args={[Math.max(0, radius - thickness), radius, 96]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={wireOpacity * (0.42 + scale * 0.28)}
                blending={THREE.NormalBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}
        <mesh>
          <sphereGeometry args={[sphereRadius, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={wireOpacity * 0.34}
            wireframe
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[
      defence.position[0] + coneOffset.x,
      defence.position[1] + coneOffset.y,
      defence.position[2] + coneOffset.z,
    ]}>
      {/* Filled cone — normal blending preserves the tactical state color when coverage overlaps. */}
      <mesh ref={fillRef} geometry={fillGeo} rotation={facingRotation}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={fillOpacity}
          blending={THREE.NormalBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
          vertexColors
        />
      </mesh>

      {/* Wireframe edge overlay for structure/definition */}
      <mesh ref={wireRef} geometry={wireGeo} rotation={facingRotation}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={wireOpacity}
          wireframe
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Point light at the defence origin for ambient glow */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={glowIntensity}
        distance={glowDistance}
      />
    </group>
  )
}
