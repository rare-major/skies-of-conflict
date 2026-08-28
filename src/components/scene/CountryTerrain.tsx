import { useMemo } from 'react'
import * as THREE from 'three'
import type { TerrainParams } from '../../data/countries'
import { useThemeStore } from '../../store/themeStore'

interface Props {
  params: TerrainParams
}

function hash(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 43758.5453) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

function smoothNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy, seed)
  const b = hash(ix + 1, iy, seed)
  const c = hash(ix, iy + 1, seed)
  const d = hash(ix + 1, iy + 1, seed)
  return a + sx * (b - a) + sy * (c - a) + sx * sy * (a - b - c + d)
}

function fbm(x: number, y: number, seed: number, octaves: number): number {
  let val = 0, amp = 1, freq = 1, max = 0
  for (let i = 0; i < octaves; i++) {
    val += amp * smoothNoise(x * freq, y * freq, seed + i * 37)
    max += amp
    amp *= 0.48
    freq *= 2.1
  }
  return val / max
}

function ridgedFbm(x: number, y: number, seed: number, octaves: number): number {
  let val = 0, amp = 1, freq = 1, max = 0
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(smoothNoise(x * freq, y * freq, seed + i * 53))
    val += amp * n * n
    max += amp
    amp *= 0.45
    freq *= 2.2
  }
  return val / max
}

export function CountryTerrain({ params }: Props) {
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'

  const { geometry, minY, maxY } = useMemo(() => {
    const segments = 160
    const geo = new THREE.PlaneGeometry(1600, 1600, segments, segments)
    geo.rotateX(-Math.PI / 2)

    const pos = geo.attributes.position
    let lo = Infinity, hi = -Infinity

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)

      const base = fbm(x * 0.002, z * 0.002, params.seed, 5) * 30 * params.roughness
      const ridges = ridgedFbm(x * 0.003, z * 0.003, params.seed + 200, 4) * 20 * params.mountainScale
      const detail = fbm(x * 0.012, z * 0.012, params.seed + 99, 3) * 5 * params.roughness
      const micro = fbm(x * 0.04, z * 0.04, params.seed + 150, 2) * 1.5

      const distFromCenter = Math.sqrt(x * x + z * z)
      const edgeFade = Math.max(0, 1 - distFromCenter / 800)
      const cityFlat = Math.max(0, 1 - distFromCenter / 80)

      let y = (base + ridges + detail + micro) * edgeFade * (1 - cityFlat * 0.8)

      if (params.hasCoast) {
        const coastLine = fbm(z * 0.004, params.seed * 0.1, params.seed + 500, 3) * 180
        if (x > 500 + coastLine) y = Math.min(y, -2)
      }

      pos.setY(i, y)
      lo = Math.min(lo, y)
      hi = Math.max(hi, y)
    }

    geo.computeVertexNormals()
    return { geometry: geo, minY: lo, maxY: hi }
  }, [params.seed, params.roughness, params.mountainScale, params.hasCoast])

  const colorAttr = useMemo(() => {
    const pos = geometry.attributes.position
    const colors = new Float32Array(pos.count * 3)

    const valley = new THREE.Color(dark ? params.valleyColor : params.baseColor)
    const base = new THREE.Color(dark ? params.darkColor : params.baseColor)
    const peak = new THREE.Color(dark ? params.peakColor : params.peakColor)
    const snow = new THREE.Color(dark ? '#c0c8d0' : '#f0f0f0')
    const tmp = new THREE.Color()

    const range = maxY - minY || 1

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const t = (y - minY) / range

      if (t < 0.15) {
        tmp.copy(valley).lerp(base, t / 0.15)
      } else if (t < 0.6) {
        tmp.copy(base).lerp(peak, (t - 0.15) / 0.45)
      } else if (t < 0.85) {
        tmp.copy(peak).lerp(snow, (t - 0.6) / 0.25)
      } else {
        tmp.copy(snow)
      }

      const n1 = hash(pos.getX(i) * 0.08, pos.getZ(i) * 0.08, params.seed + 777)
      const n2 = hash(pos.getX(i) * 0.3, pos.getZ(i) * 0.3, params.seed + 999)
      const variation = n1 * 0.04 + n2 * 0.02
      tmp.r = Math.max(0, Math.min(1, tmp.r + variation))
      tmp.g = Math.max(0, Math.min(1, tmp.g + variation * 0.85))
      tmp.b = Math.max(0, Math.min(1, tmp.b + variation * 0.7))

      colors[i * 3] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b
    }

    return new THREE.BufferAttribute(colors, 3)
  }, [geometry, minY, maxY, dark, params])

  geometry.setAttribute('color', colorAttr)

  return (
    <group>
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>

      {params.hasCoast && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
          <planeGeometry args={[1600, 1600]} />
          <meshStandardMaterial
            color={dark ? params.waterColor : '#3a7aaa'}
            transparent
            opacity={dark ? 0.7 : 0.55}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      )}
    </group>
  )
}
