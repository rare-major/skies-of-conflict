import { useMemo } from 'react'
import * as THREE from 'three'
import type { AttackEntity } from '../../types/entities'

const ATTACK_COLORS: Record<string, string> = {
  'rocket': '#ff6644',
  'ballistic-missile': '#ff4444',
  'cruise-missile': '#ff7755',
  'hypersonic-glide': '#ff3311',
  'anti-radiation-missile': '#ff9944',
  'recon-drone': '#bbbbff',
  'kamikaze-drone': '#ffaa55',
  'swarm-drone': '#ffbb66',
  'stealth-drone': '#8888bb',
  'loitering-munition': '#ffcc77',
  'fighter-jet': '#ff6688',
  'stealth-aircraft': '#667788',
  'bomber': '#ee4444',
  'ew-aircraft': '#aa77ff',
  'glide-bomb': '#ff8855',
  'laser-guided-bomb': '#ff7766',
  'gps-guided-bomb': '#ff9966',
  'cluster-munition': '#ff5533',
  'decoy': '#ffff66',
  'naval-missile': '#ff6655',
  'f-35': '#6699dd',
  'f-22': '#5588cc',
  'su-30': '#dd7744',
  'su-57': '#cc6644',
  'rafale': '#7799bb',
  'j-35': '#66aaaa',
}

const JET_TYPES = new Set(['fighter-jet', 'stealth-aircraft', 'bomber', 'ew-aircraft', 'f-35', 'f-22', 'su-30', 'su-57', 'rafale', 'j-35'])
const DRONE_TYPES = new Set(['recon-drone', 'kamikaze-drone', 'swarm-drone', 'stealth-drone', 'loitering-munition'])
const BOMB_TYPES = new Set(['glide-bomb', 'laser-guided-bomb', 'gps-guided-bomb', 'cluster-munition'])

const _up = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()
const _quat = new THREE.Quaternion()

interface Props {
  entity: AttackEntity
}

export function AttackMesh({ entity }: Props) {
  const color = ATTACK_COLORS[entity.type] || '#ff5555'
  const isJet = JET_TYPES.has(entity.type)
  const isDrone = DRONE_TYPES.has(entity.type)
  const isBomb = BOMB_TYPES.has(entity.type)

  const rotation = useMemo(() => {
    const [vx, vy, vz] = entity.velocity
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
    if (speed < 0.001) return new THREE.Euler(0, 0, 0)

    _dir.set(vx / speed, vy / speed, vz / speed)
    _quat.setFromUnitVectors(_up, _dir)
    return new THREE.Euler().setFromQuaternion(_quat)
  }, [entity.velocity])

  return (
    <group position={entity.position} rotation={rotation}>
      <mesh>
        <sphereGeometry args={[3.5, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {isJet ? (
        <group>
          <mesh>
            <coneGeometry args={[1.8, 9, 4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0, 1]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[11, 0.4, 2.5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
          </mesh>
          <pointLight color={color} intensity={1.5} distance={35} />
        </group>
      ) : isDrone ? (
        <group>
          <mesh>
            <boxGeometry args={[2, 0.6, 3.5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[7, 0.2, 1.2]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
          </mesh>
          <pointLight color={color} intensity={1.2} distance={30} />
        </group>
      ) : isBomb ? (
        <group>
          <mesh>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
          <pointLight color={color} intensity={1.5} distance={30} />
        </group>
      ) : (
        <group>
          <mesh>
            <coneGeometry args={[1.2, 6, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
          </mesh>
          <pointLight color={color} intensity={2.5} distance={40} />
        </group>
      )}

      {entity.isDecoy && (
        <pointLight color="#ffff00" intensity={3} distance={40} />
      )}
    </group>
  )
}
