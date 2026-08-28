import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useOperationsStore } from '../../store/operationsStore'

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = Math.imul(value, 1664525) + 1013904223 >>> 0
    return value / 4294967296
  }
}

export function WeatherSystem() {
  const weather = useOperationsStore((state) => state.weather)
  const wind = useOperationsStore((state) => state.windStrength)
  const pointsRef = useRef<THREE.Points>(null)
  const lightningRef = useRef<THREE.PointLight>(null)

  const particleCount = weather === 'monsoon' ? 2200 : weather === 'storm' ? 1600 : weather === 'dust' ? 1300 : weather === 'overcast' ? 450 : 0
  const geometry = useMemo(() => {
    const random = seededRandom(88531 + particleCount)
    const positions = new Float32Array(Math.max(1, particleCount) * 3)
    for (let index = 0; index < particleCount; index++) {
      positions[index * 3] = (random() - 0.5) * 900
      positions[index * 3 + 1] = random() * 330
      positions[index * 3 + 2] = (random() - 0.5) * 900
    }
    const result = new THREE.BufferGeometry()
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return result
  }, [particleCount])

  useFrame((_, delta) => {
    if (pointsRef.current && particleCount > 0) {
      const position = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
      const speed = weather === 'dust' ? 9 : weather === 'monsoon' ? 105 : weather === 'storm' ? 82 : 22
      for (let index = 0; index < particleCount; index++) {
        const offset = index * 3
        position.array[offset] += delta * wind * (weather === 'dust' ? 34 : 8)
        position.array[offset + 1] -= delta * speed
        if (position.array[offset + 1] < 0) position.array[offset + 1] = 330
        if (position.array[offset] > 470) position.array[offset] = -470
      }
      position.needsUpdate = true
    }
    if (lightningRef.current) {
      const flash = weather === 'storm' && Math.random() > 0.995
      lightningRef.current.intensity = flash ? 45 : Math.max(0, lightningRef.current.intensity - delta * 90)
    }
  })

  if (particleCount === 0) return null
  const color = weather === 'dust' ? '#c49b68' : weather === 'overcast' ? '#9eb3c8' : '#b9dcff'
  return <group>
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial color={color} size={weather === 'dust' ? 2.2 : 1.35} transparent opacity={weather === 'overcast' ? 0.14 : weather === 'dust' ? 0.22 : 0.38} depthWrite={false} sizeAttenuation />
    </points>
    {weather === 'storm' && <pointLight ref={lightningRef} position={[90, 250, -160]} color="#d7e9ff" intensity={0} distance={900} decay={1.2} />}
  </group>
}
