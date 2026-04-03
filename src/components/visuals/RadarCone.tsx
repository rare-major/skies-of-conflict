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
    engaged: new THREE.Color('#ff2222'),
    tracking: new THREE.Color('#ffaa00'),
    idle: new THREE.Color('#00ff88'),
  },
  light: {
    engaged: new THREE.Color('#dc2626'),
    tracking: new THREE.Color('#d97706'),
    idle: new THREE.Color('#059669'),
  },
}

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
  const fillOpacity = isEngaged ? 0.45 : isTracking ? 0.3 : 0.18
  const wireOpacity = isEngaged ? 0.7 : isTracking ? 0.5 : 0.3
  const glowIntensity = isEngaged ? 8 : isTracking ? 4 : 1.5
  const glowDistance = Math.min(detectionRange * 0.6, 200)

  const coneHeight = Math.min(detectionRange, 400)
  const coneRadius = coneHeight * Math.tan((Math.min(fovAngle, 360) / 2) * (Math.PI / 180))
  const clampedRadius = Math.min(coneRadius, 200)

  const fillGeo = useMemo(
    () => buildGradientCone(clampedRadius, coneHeight, 24),
    [clampedRadius, coneHeight],
  )
  const wireGeo = useMemo(
    () => new THREE.ConeGeometry(clampedRadius, coneHeight, 24, 1, true),
    [clampedRadius, coneHeight],
  )

  const facingRotation = useMemo(() => {
    if (fovAngle >= 360) return new THREE.Euler(0, 0, 0)
    const facing = defence.facing || [0, 0, 1]
    const dir = new THREE.Vector3(facing[0], facing[1], facing[2]).normalize()
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    return new THREE.Euler().setFromQuaternion(quaternion)
  }, [defence.facing, fovAngle])

  useFrame((_, dt) => {
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
    const sphereRadius = Math.min(detectionRange, 300)
    return (
      <group position={defence.position}>
        <mesh>
          <sphereGeometry args={[sphereRadius, 24, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={fillOpacity * 0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[sphereRadius, 12, 12]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={wireOpacity * 0.5}
            wireframe
            depthWrite={false}
          />
        </mesh>
        <pointLight
          ref={lightRef}
          color={color}
          intensity={glowIntensity * 0.5}
          distance={glowDistance}
        />
      </group>
    )
  }

  return (
    <group position={defence.position}>
      {/* Filled cone — additive blending for natural glow, vertex-color gradient */}
      <mesh ref={fillRef} geometry={fillGeo} rotation={facingRotation}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={fillOpacity}
          blending={THREE.AdditiveBlending}
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
