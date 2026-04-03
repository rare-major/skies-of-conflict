import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vector3Tuple } from 'three'

interface Props {
  position: Vector3Tuple
  type: 'hit' | 'miss' | 'impact'
  startTime: number
  elapsed: number
}

const COLORS = {
  hit: '#ff6633',
  miss: '#6688aa',
  impact: '#ff3311',
}

const DURATION = 2.0

export function ExplosionEffect({ position, type, startTime, elapsed }: Props) {
  const ref = useRef<THREE.Group>(null)
  const age = elapsed - startTime

  if (age > DURATION) return null

  const progress = age / DURATION
  const scale = 1 + progress * (type === 'impact' ? 20 : 12)
  const opacity = Math.max(0, 1 - progress)
  const color = COLORS[type]

  return (
    <group ref={ref} position={position}>
      <mesh scale={[scale, scale, scale]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.6} />
      </mesh>
      <mesh scale={[scale * 0.6, scale * 0.6, scale * 0.6]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={opacity * 0.4} />
      </mesh>
      <pointLight color={color} intensity={opacity * 10} distance={scale * 5} />
    </group>
  )
}
