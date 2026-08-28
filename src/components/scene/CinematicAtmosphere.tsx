import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useThemeStore } from '../../store/themeStore'
import { useOperationsStore } from '../../store/operationsStore'

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function CinematicAtmosphere() {
  const theme = useThemeStore((s) => s.theme)
  const timeOfDay = useOperationsStore((s) => s.timeOfDay)
  const starsRef = useRef<THREE.Points>(null)
  const dark = theme === 'dark' && timeOfDay !== 'day'

  const starsGeometry = useMemo(() => {
    const random = seededRandom(73421)
    const positions: number[] = []

    for (let i = 0; i < 1100; i++) {
      const theta = random() * Math.PI * 2
      const y = -0.08 + random() * 1.04
      const horizontal = Math.sqrt(Math.max(0, 1 - y * y))
      const radius = 760 + random() * 260
      positions.push(
        Math.cos(theta) * horizontal * radius,
        y * radius,
        Math.sin(theta) * horizontal * radius,
      )
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [])

  useFrame((_, delta) => {
    if (starsRef.current) starsRef.current.rotation.y += delta * 0.0025
  })

  if (!dark) return null

  return (
    <group>
      <points ref={starsRef} geometry={starsGeometry} renderOrder={-9}>
        <pointsMaterial
          color="#b9d9ff"
          size={1.15}
          sizeAttenuation={false}
          transparent
          opacity={0.62}
          depthWrite={false}
          fog={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <group position={[-690, 145, -650]} renderOrder={-8}>
        <mesh>
          <sphereGeometry args={[23, 48, 48]} />
          <meshBasicMaterial color="#ffe1bd" toneMapped={false} fog={false} />
        </mesh>
        <mesh scale={2.8}>
          <sphereGeometry args={[23, 32, 32]} />
          <meshBasicMaterial
            color="#ff8a5b"
            transparent
            opacity={0.06}
            depthWrite={false}
            fog={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh scale={5.8}>
          <sphereGeometry args={[23, 24, 24]} />
          <meshBasicMaterial
            color="#ff7048"
            transparent
            opacity={0.018}
            depthWrite={false}
            fog={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  )
}
