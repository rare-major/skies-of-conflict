import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import type { City, BuildingPalette } from '../../data/countries'
import { useThemeStore } from '../../store/themeStore'

interface Props {
  city: City
  accentColor: string
  palette: BuildingPalette
}

interface Building {
  x: number
  z: number
  h: number
  w: number
  d: number
  type: 'glass' | 'concrete' | 'residential'
  hasAntenna: boolean
  cylindrical: boolean
}

function rng(s: number): number {
  s = Math.sin(s) * 43758.5453
  return s - Math.floor(s)
}

export function CityMarker({ city, accentColor, palette }: Props) {
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'

  const buildings = useMemo(() => {
    const pop = city.population || 'medium'
    const count = pop === 'mega' ? 28 : pop === 'large' ? 18 : pop === 'medium' ? 10 : 6
    const maxH = pop === 'mega' ? 28 : pop === 'large' ? 20 : pop === 'medium' ? 12 : 8
    const spread = pop === 'mega' ? 45 : pop === 'large' ? 35 : pop === 'medium' ? 22 : 15
    const seed = city.position[0] * 13 + city.position[2] * 7

    const result: Building[] = []

    for (let i = 0; i < count; i++) {
      const r = rng(seed + i * 3.7)
      const angle = rng(seed + i * 5.3) * Math.PI * 2
      const dist = rng(seed + i * 7.1) * spread
      const x = Math.cos(angle) * dist
      const z = Math.sin(angle) * dist

      const coreRng = rng(seed + i * 11.3)
      const isTall = coreRng > 0.7
      const isCylindrical = coreRng > 0.9 && pop !== 'small'

      const h = isTall
        ? maxH * 0.5 + rng(seed + i * 13) * maxH * 0.5
        : 3 + rng(seed + i * 13) * maxH * 0.35

      const w = isTall ? 2.2 + r * 2 : 2.5 + r * 3.5
      const d = isCylindrical ? w : 2 + rng(seed + i * 17) * 3

      const typeR = rng(seed + i * 19)
      const type: Building['type'] = isTall
        ? (typeR > 0.4 ? 'glass' : 'concrete')
        : (typeR > 0.5 ? 'residential' : 'concrete')

      result.push({ x, z, h, w, d, type, hasAntenna: isTall && rng(seed + i * 23) > 0.6, cylindrical: isCylindrical })
    }
    return result
  }, [city])

  const getColor = (type: Building['type']) => {
    if (dark) {
      return type === 'glass' ? '#2a3a50' : type === 'concrete' ? '#2a2a30' : '#3a3028'
    }
    return palette[type]
  }

  const labelColor = dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)'
  const bgColor = dark ? 'rgba(10,15,25,0.65)' : 'rgba(255,255,255,0.7)'

  const tallest = Math.max(...buildings.map((b) => b.h), 10)

  return (
    <group position={city.position}>
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2, b.z]}>
          {b.cylindrical ? (
            <mesh>
              <cylinderGeometry args={[b.w / 2, b.w / 2 * 1.05, b.h, 12]} />
              <meshStandardMaterial
                color={getColor(b.type)}
                roughness={b.type === 'glass' ? 0.15 : 0.7}
                metalness={b.type === 'glass' ? 0.6 : 0.05}
                emissive={dark && b.type === 'glass' ? '#1a2a40' : '#000000'}
                emissiveIntensity={dark ? 0.3 : 0}
              />
            </mesh>
          ) : (
            <mesh>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial
                color={getColor(b.type)}
                roughness={b.type === 'glass' ? 0.15 : 0.7}
                metalness={b.type === 'glass' ? 0.6 : 0.05}
                emissive={dark && b.type === 'glass' ? '#1a2a40' : '#000000'}
                emissiveIntensity={dark ? 0.3 : 0}
              />
            </mesh>
          )}
          {b.hasAntenna && (
            <mesh position={[0, b.h / 2 + 1.5, 0]}>
              <cylinderGeometry args={[0.1, 0.15, 3, 4]} />
              <meshStandardMaterial color={dark ? '#556070' : '#888888'} />
            </mesh>
          )}
        </group>
      ))}

      {/* Window glow at night */}
      {dark && (
        <pointLight
          position={[0, tallest * 0.3, 0]}
          intensity={1.2}
          distance={60}
          color="#ffddaa"
        />
      )}

      {/* City glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <ringGeometry args={[3, buildings.length > 15 ? 50 : 28, 32]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={dark ? 0.08 : 0.05}
        />
      </mesh>

      {/* Center marker */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[1.5, 12, 12]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.7} />
      </mesh>
      <pointLight position={[0, 2, 0]} intensity={0.4} distance={25} color={accentColor} />

      <Html
        position={[0, tallest + 6, 0]}
        center
        distanceFactor={200}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            color: labelColor,
            background: bgColor,
            backdropFilter: 'blur(12px) saturate(150%)',
            WebkitBackdropFilter: 'blur(12px) saturate(150%)',
            padding: '3px 10px',
            borderRadius: 8,
            fontSize: city.isCapital ? 11 : 9,
            fontWeight: city.isCapital ? 700 : 500,
            whiteSpace: 'nowrap',
            fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            border: `1px solid ${city.isCapital ? accentColor + '50' : 'rgba(128,128,128,0.15)'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            letterSpacing: city.isCapital ? '0.04em' : '0.01em',
          }}
        >
          {city.isCapital && '★ '}{city.name}
        </div>
      </Html>
    </group>
  )
}
