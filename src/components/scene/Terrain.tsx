import { useMemo } from 'react'
import * as THREE from 'three'
import { noise2D } from '../../logic/terrain/noise'
import { useThemeStore } from '../../store/themeStore'

export function Terrain() {
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1600, 1600, 128, 128)
    geo.rotateX(-Math.PI / 2)

    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)

    const low = new THREE.Color(dark ? '#1a2535' : '#7a8a98')
    const mid = new THREE.Color(dark ? '#243448' : '#8a9aaa')
    const high = new THREE.Color(dark ? '#2e4258' : '#a0b0be')
    const peak = new THREE.Color(dark ? '#384e65' : '#b8c4d0')
    const tmp = new THREE.Color()

    let minY = Infinity, maxY = -Infinity

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = noise2D(x * 0.003, z * 0.003) * 25
             + noise2D(x * 0.01, z * 0.01) * 8
             + noise2D(x * 0.025, z * 0.025) * 3
      pos.setY(i, y)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }

    const range = maxY - minY || 1

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = pos.getY(i)
      const t = (y - minY) / range

      if (t < 0.3) {
        tmp.copy(low).lerp(mid, t / 0.3)
      } else if (t < 0.7) {
        tmp.copy(mid).lerp(high, (t - 0.3) / 0.4)
      } else {
        tmp.copy(high).lerp(peak, (t - 0.7) / 0.3)
      }

      const n = noise2D(x * 0.02, z * 0.02) * 0.04
      tmp.r = Math.max(0, Math.min(1, tmp.r + n))
      tmp.g = Math.max(0, Math.min(1, tmp.g + n * 0.8))
      tmp.b = Math.max(0, Math.min(1, tmp.b + n * 0.6))

      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }

    geo.computeVertexNormals()
    const attr = new THREE.BufferAttribute(colors, 3)
    geo.setAttribute('color', attr)
    return geo
  }, [dark])

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  )
}
