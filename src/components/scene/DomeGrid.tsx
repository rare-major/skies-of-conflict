import { useMemo } from 'react'
import * as THREE from 'three'
import { useThemeStore } from '../../store/themeStore'

interface Props {
  radius?: number
  latitudeRings?: number
  longitudeLines?: number
  segments?: number
}

/**
 * Tactical hemisphere wireframe grid providing altitude and bearing reference.
 * Built from custom line geometry: latitude rings, longitude meridians, and
 * a base circle. Uses additive blending in dark mode for natural glow.
 */
export function DomeGrid({
  radius = 400,
  latitudeRings = 6,
  longitudeLines = 16,
  segments = 64,
}: Props) {
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'

  const { ringGeo, meridianGeo, baseGeo } = useMemo(() => {
    const ringPositions: number[] = []
    const meridianPositions: number[] = []
    const basePositions: number[] = []

    for (let r = 1; r <= latitudeRings; r++) {
      const phi = (r / (latitudeRings + 1)) * (Math.PI / 2)
      const ringRadius = radius * Math.cos(phi)
      const y = radius * Math.sin(phi)

      for (let i = 0; i < segments; i++) {
        const a0 = (i / segments) * Math.PI * 2
        const a1 = ((i + 1) / segments) * Math.PI * 2
        ringPositions.push(
          Math.cos(a0) * ringRadius, y, Math.sin(a0) * ringRadius,
          Math.cos(a1) * ringRadius, y, Math.sin(a1) * ringRadius,
        )
      }
    }

    for (let m = 0; m < longitudeLines; m++) {
      const theta = (m / longitudeLines) * Math.PI * 2
      const cosT = Math.cos(theta)
      const sinT = Math.sin(theta)

      const arcSegments = 32
      for (let i = 0; i < arcSegments; i++) {
        const phi0 = (i / arcSegments) * (Math.PI / 2)
        const phi1 = ((i + 1) / arcSegments) * (Math.PI / 2)

        meridianPositions.push(
          cosT * radius * Math.cos(phi0), radius * Math.sin(phi0), sinT * radius * Math.cos(phi0),
          cosT * radius * Math.cos(phi1), radius * Math.sin(phi1), sinT * radius * Math.cos(phi1),
        )
      }
    }

    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2
      const a1 = ((i + 1) / segments) * Math.PI * 2
      basePositions.push(
        Math.cos(a0) * radius, 0, Math.sin(a0) * radius,
        Math.cos(a1) * radius, 0, Math.sin(a1) * radius,
      )
    }

    const toGeo = (arr: number[]) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3))
      return geo
    }

    return {
      ringGeo: toGeo(ringPositions),
      meridianGeo: toGeo(meridianPositions),
      baseGeo: toGeo(basePositions),
    }
  }, [radius, latitudeRings, longitudeLines, segments])

  const ringColor = dark ? '#22d3ee' : '#0e7490'
  const meridianColor = dark ? '#06b6d4' : '#155e75'
  const baseColor = dark ? '#67e8f9' : '#0891b2'

  const ringOpacity = dark ? 0.35 : 0.4
  const meridianOpacity = dark ? 0.18 : 0.22
  const baseOpacity = dark ? 0.5 : 0.55

  const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending

  return (
    <group renderOrder={1}>
      <lineSegments geometry={ringGeo}>
        <lineBasicMaterial
          color={ringColor}
          transparent
          opacity={ringOpacity}
          blending={blending}
          depthWrite={false}
        />
      </lineSegments>

      <lineSegments geometry={meridianGeo}>
        <lineBasicMaterial
          color={meridianColor}
          transparent
          opacity={meridianOpacity}
          blending={blending}
          depthWrite={false}
        />
      </lineSegments>

      <lineSegments geometry={baseGeo}>
        <lineBasicMaterial
          color={baseColor}
          transparent
          opacity={baseOpacity}
          blending={blending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
