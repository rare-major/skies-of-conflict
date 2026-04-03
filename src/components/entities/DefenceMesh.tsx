import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DefenceEntity } from '../../types/entities'

const DEFENCE_COLORS: Record<string, string> = {
  'long-range-sam': '#33ff66',
  'medium-range-sam': '#33cc88',
  'short-range-sam': '#33ffaa',
  'ciws': '#66ffcc',
  'aa-gun': '#88ff88',
  'anti-drone-gun': '#44ddaa',
  'signal-jammer': '#aa66ff',
  'laser-defence': '#00ffff',
}

interface Props {
  entity: DefenceEntity
}

export function DefenceMesh({ entity }: Props) {
  const reloadRingRef = useRef<THREE.Mesh>(null)
  const color = DEFENCE_COLORS[entity.type] || '#33ff66'
  const isJammer = entity.type === 'signal-jammer'
  const isGun = entity.type === 'ciws' || entity.type === 'aa-gun' || entity.type === 'anti-drone-gun'
  const isLaser = entity.type === 'laser-defence'

  useFrame((_, dt) => {
    if (reloadRingRef.current && entity.isReloading) {
      reloadRingRef.current.rotation.y += dt * 3
    }
  })

  return (
    <group position={entity.position}>
      {/* Base platform */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[3, 4, 2, 8]} />
        <meshStandardMaterial color="#1a2a1a" emissive={color} emissiveIntensity={0.1} />
      </mesh>

      {isJammer ? (
        <group position={[0, 4, 0]}>
          <mesh>
            <sphereGeometry args={[2, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.7} />
          </mesh>
          <pointLight color={color} intensity={2} distance={40} />
        </group>
      ) : isGun ? (
        <group position={[0, 3, 0]}>
          <mesh rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 6, 6]} />
            <meshStandardMaterial color="#444" emissive={color} emissiveIntensity={0.2} />
          </mesh>
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#2a2a2a" emissive={color} emissiveIntensity={0.15} />
          </mesh>
        </group>
      ) : isLaser ? (
        <group position={[0, 3, 0]}>
          <mesh>
            <cylinderGeometry args={[1, 1.5, 2, 8]} />
            <meshStandardMaterial color="#1a2a3a" emissive={color} emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 1.5, 0]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 4, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
          </mesh>
        </group>
      ) : (
        <group position={[0, 3, 0]}>
          <mesh rotation={[0.8, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 5, 6]} />
            <meshStandardMaterial color="#2a3a2a" emissive={color} emissiveIntensity={0.2} />
          </mesh>
          <mesh>
            <boxGeometry args={[3, 1.5, 3]} />
            <meshStandardMaterial color="#1a2a1a" emissive={color} emissiveIntensity={0.1} />
          </mesh>
        </group>
      )}

      {/* Reload indicator: pulsing ring */}
      {entity.isReloading && (
        <mesh ref={reloadRingRef} position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5, 0.2, 8, 32]} />
          <meshBasicMaterial color="#ffaa33" transparent opacity={0.5} />
        </mesh>
      )}

      {entity.engagedTarget && (
        <pointLight color="#ff3333" intensity={3} distance={30} position={[0, 5, 0]} />
      )}
    </group>
  )
}
