import { Line } from '@react-three/drei'
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
 * Uses screen-space line widths so the grid remains readable at every camera
 * distance, with a restrained additive halo under a crisp tactical core.
 */
export function DomeGrid({
  radius = 400,
  latitudeRings = 6,
  longitudeLines = 16,
  segments = 64,
}: Props) {
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'

  const { ringPaths, meridianPaths, basePath, axisPath } = useMemo(() => {
    const rings: [number, number, number][][] = []
    const meridians: [number, number, number][][] = []

    for (let r = 1; r <= latitudeRings; r++) {
      const phi = (r / (latitudeRings + 1)) * (Math.PI / 2)
      const ringRadius = radius * Math.cos(phi)
      const y = radius * Math.sin(phi)
      const points: [number, number, number][] = []

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push([Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius])
      }
      rings.push(points)
    }

    for (let m = 0; m < longitudeLines; m++) {
      const theta = (m / longitudeLines) * Math.PI * 2
      const cosT = Math.cos(theta)
      const sinT = Math.sin(theta)
      const arcSegments = 32
      const points: [number, number, number][] = []
      for (let i = 0; i <= arcSegments; i++) {
        const phi = (i / arcSegments) * (Math.PI / 2)
        points.push([
          cosT * radius * Math.cos(phi),
          radius * Math.sin(phi),
          sinT * radius * Math.cos(phi),
        ])
      }
      meridians.push(points)
    }

    const base: [number, number, number][] = []
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      base.push([Math.cos(angle) * radius, 0.4, Math.sin(angle) * radius])
    }

    return {
      ringPaths: rings,
      meridianPaths: meridians,
      basePath: base,
      axisPath: [[0, 0.4, 0], [0, radius, 0]] as [number, number, number][],
    }
  }, [radius, latitudeRings, longitudeLines, segments])

  const ringColor = dark ? '#20b8de' : '#087d9a'
  const meridianColor = dark ? '#0f9fc5' : '#0e7490'
  const baseColor = dark ? '#49c5e8' : '#036f8d'

  const glowBlending = dark ? THREE.AdditiveBlending : THREE.NormalBlending

  return (
    <group renderOrder={3}>
      {ringPaths.map((points, index) => (
        <group key={`ring-${index}`}>
          <Line points={points} color={ringColor} lineWidth={3.4} transparent opacity={dark ? 0.04 : 0.025} blending={glowBlending} depthWrite={false} />
          <Line points={points} color={ringColor} lineWidth={1.2} transparent opacity={dark ? 0.62 : 0.48} blending={THREE.NormalBlending} depthWrite={false} />
        </group>
      ))}

      {meridianPaths.map((points, index) => (
        <group key={`meridian-${index}`}>
          <Line points={points} color={meridianColor} lineWidth={2.7} transparent opacity={dark ? 0.025 : 0.018} blending={glowBlending} depthWrite={false} />
          <Line points={points} color={meridianColor} lineWidth={0.9} transparent opacity={dark ? 0.36 : 0.25} blending={THREE.NormalBlending} depthWrite={false} />
        </group>
      ))}

      <Line points={axisPath} color={baseColor} lineWidth={2.5} transparent opacity={dark ? 0.04 : 0.025} blending={glowBlending} depthWrite={false} />
      <Line points={axisPath} color={baseColor} lineWidth={0.9} transparent opacity={dark ? 0.42 : 0.31} blending={THREE.NormalBlending} depthWrite={false} dashed dashSize={8} gapSize={7} />
      <Line points={basePath} color={baseColor} lineWidth={4} transparent opacity={dark ? 0.05 : 0.03} blending={glowBlending} depthWrite={false} />
      <Line points={basePath} color={baseColor} lineWidth={1.5} transparent opacity={dark ? 0.74 : 0.58} blending={THREE.NormalBlending} depthWrite={false} />
    </group>
  )
}
