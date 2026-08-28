import { useMemo } from 'react'
import * as THREE from 'three'
import type { AttackEntity } from '../../types/entities'

const ATTACK_COLORS: Record<string, string> = {
  rocket: '#ff795f',
  'ballistic-missile': '#ff5e5e',
  'cruise-missile': '#ff8b69',
  'hypersonic-glide': '#ff4f33',
  'anti-radiation-missile': '#ffad5b',
  'recon-drone': '#ffb871',
  'kamikaze-drone': '#ff8e5f',
  'swarm-drone': '#ffb65d',
  'stealth-drone': '#b3a7ff',
  'loitering-munition': '#ffc77e',
  'fighter-jet': '#ff6f79',
  'stealth-aircraft': '#9aadd0',
  bomber: '#ff6464',
  'ew-aircraft': '#c28aff',
  'glide-bomb': '#ff956d',
  'laser-guided-bomb': '#ff7c70',
  'gps-guided-bomb': '#ffa174',
  'cluster-munition': '#ff6549',
  decoy: '#ffe66d',
  'naval-missile': '#ff7668',
  'f-35': '#91b9e8',
  'f-22': '#82aee4',
  'su-30': '#e89b72',
  'su-57': '#db8a73',
  rafale: '#a4b8d2',
  'j-35': '#83c2c5',
}

const JET_TYPES = new Set(['fighter-jet', 'stealth-aircraft', 'bomber', 'ew-aircraft', 'f-35', 'f-22', 'su-30', 'su-57', 'rafale', 'j-35'])
const DRONE_TYPES = new Set(['recon-drone', 'kamikaze-drone', 'swarm-drone', 'stealth-drone', 'loitering-munition'])
const BOMB_TYPES = new Set(['glide-bomb', 'laser-guided-bomb', 'gps-guided-bomb', 'cluster-munition'])
const STEALTH_JETS = new Set(['stealth-aircraft', 'f-35', 'f-22', 'su-57', 'j-35'])
const QUADCOPTER_DRONES = new Set(['recon-drone', 'swarm-drone'])

const _worldUp = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()
const _right = new THREE.Vector3()
const _modelUp = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _basis = new THREE.Matrix4()

function extrudedSilhouette(points: [number, number][], depth: number) {
  const shape = new THREE.Shape()
  shape.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1])
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.08,
    bevelThickness: 0.08,
    bevelSegments: 1,
  })
  geometry.translate(0, 0, -depth / 2)
  geometry.computeVertexNormals()
  return geometry
}

const FIGHTER_WING = extrudedSilhouette([
  [0, 2.8], [4.8, -0.15], [2.1, -1.4], [0.85, -1.05],
  [0, -1.45], [-0.85, -1.05], [-2.1, -1.4], [-4.8, -0.15],
], 0.24)

const STEALTH_WING = extrudedSilhouette([
  [0, 3.6], [5.25, -0.95], [2.25, -1.65], [0, -0.9],
  [-2.25, -1.65], [-5.25, -0.95],
], 0.22)

const BOMBER_WING = extrudedSilhouette([
  [0, 2.3], [6.1, -1.45], [2.2, -2.35], [0, -1.2],
  [-2.2, -2.35], [-6.1, -1.45],
], 0.3)

const TAIL_PLANE = extrudedSilhouette([
  [0, 1.1], [2.1, -0.5], [0, -0.25], [-2.1, -0.5],
], 0.18)

const DRONE_WING = extrudedSilhouette([
  [0, 2.1], [3.65, -0.4], [1.1, -1.1], [0, -0.72],
  [-1.1, -1.1], [-3.65, -0.4],
], 0.2)

interface Props {
  entity: AttackEntity
}

export function AttackMesh({ entity }: Props) {
  const accent = ATTACK_COLORS[entity.type] || '#ff6f62'
  const isJet = JET_TYPES.has(entity.type)
  const isDrone = DRONE_TYPES.has(entity.type)
  const isBomb = BOMB_TYPES.has(entity.type)
  const isQuadcopter = QUADCOPTER_DRONES.has(entity.type)

  const rotation = useMemo(() => {
    const [vx, vy, vz] = entity.velocity
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
    if (speed < 0.001) return new THREE.Euler(0, 0, 0)

    // The models use local +Y as forward and local +Z as up. Build a full
    // flight frame so wings and rotor discs stay level instead of rolling
    // vertically when the nose turns toward a horizontal velocity vector.
    _dir.set(vx, isQuadcopter ? 0 : vy, vz)
    if (_dir.lengthSq() < 0.0001) _dir.set(0, 0, -1)
    _dir.normalize()
    _right.crossVectors(_dir, _worldUp)
    if (_right.lengthSq() < 0.0001) _right.set(1, 0, 0)
    _right.normalize()
    _modelUp.crossVectors(_right, _dir).normalize()
    _basis.makeBasis(_right, _dir, _modelUp)
    _quat.setFromRotationMatrix(_basis)
    return new THREE.Euler().setFromQuaternion(_quat)
  }, [entity.velocity, isQuadcopter])

  const bankAngle = useMemo(() => {
    if (!isJet || entity.trail.length < 3) return 0
    const previous = entity.trail[entity.trail.length - 3]
    const recent = entity.trail[entity.trail.length - 1]
    const previousDirection = new THREE.Vector3(
      recent[0] - previous[0],
      recent[1] - previous[1],
      recent[2] - previous[2],
    ).normalize()
    const velocityDirection = new THREE.Vector3(...entity.velocity).normalize()
    const turn = previousDirection.x * velocityDirection.z - previousDirection.z * velocityDirection.x
    return THREE.MathUtils.clamp(-turn * 28, -0.62, 0.62)
  }, [entity.trail, entity.velocity, isJet])

  return (
    <group position={entity.position} rotation={rotation} scale={isJet ? 1.05 : isDrone ? 1.08 : 1.12}>
      <mesh>
        <sphereGeometry args={[4.8, 12, 12]} />
        <meshBasicMaterial color={accent} transparent opacity={0.035} depthWrite={false} />
      </mesh>

      <group rotation={[0, bankAngle, 0]}>
        {isJet ? (
          <JetModel type={entity.type} accent={accent} />
        ) : isDrone ? (
          <DroneModel type={entity.type} accent={accent} />
        ) : isBomb ? (
          <BombModel accent={accent} />
        ) : (
          <MissileModel type={entity.type} accent={accent} />
        )}
      </group>

      {entity.isDecoy && <pointLight color="#ffe66d" intensity={2.2} distance={34} />}
    </group>
  )
}

function JetModel({ type, accent }: { type: AttackEntity['type']; accent: string }) {
  const isStealth = STEALTH_JETS.has(type)
  const isBomber = type === 'bomber'
  const wingGeometry = isBomber ? BOMBER_WING : isStealth ? STEALTH_WING : FIGHTER_WING
  const bodyColor = isStealth ? '#3d4958' : isBomber ? '#4a5058' : '#5c6874'

  return (
    <group>
      <mesh geometry={wingGeometry} castShadow>
        <meshStandardMaterial color={bodyColor} roughness={0.58} metalness={0.42} />
      </mesh>

      <mesh position={[0, 0.25, 0.24]} castShadow>
        <capsuleGeometry args={[isBomber ? 0.86 : 0.68, isBomber ? 6.4 : 5.6, 5, 10]} />
        <meshStandardMaterial color={isBomber ? '#555d65' : '#657383'} roughness={0.48} metalness={0.5} />
      </mesh>
      <mesh position={[0, 4.15, 0.24]} castShadow>
        <coneGeometry args={[isBomber ? 0.82 : 0.64, 2.25, 12]} />
        <meshStandardMaterial color="#8795a3" roughness={0.42} metalness={0.58} />
      </mesh>

      {!isBomber && (
        <mesh geometry={TAIL_PLANE} position={[0, -3.1, 0.22]} castShadow>
          <meshStandardMaterial color={bodyColor} roughness={0.58} metalness={0.42} />
        </mesh>
      )}

      <mesh position={[0, 1.25, 0.78]} scale={[0.62, 1.3, 0.42]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#142b3d" emissive="#4aa8d8" emissiveIntensity={0.16} roughness={0.16} metalness={0.68} />
      </mesh>

      <mesh position={[-0.72, -3.25, 0.13]}>
        <cylinderGeometry args={[0.4, 0.5, 1.9, 12]} />
        <meshStandardMaterial color="#252d35" roughness={0.36} metalness={0.72} />
      </mesh>
      <mesh position={[0.72, -3.25, 0.13]}>
        <cylinderGeometry args={[0.4, 0.5, 1.9, 12]} />
        <meshStandardMaterial color="#252d35" roughness={0.36} metalness={0.72} />
      </mesh>

      <mesh position={[-0.72, -4.38, 0.13]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.35, 2.0, 12]} />
        <meshBasicMaterial color={accent} transparent opacity={0.56} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0.72, -4.38, 0.13]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.35, 2.0, 12]} />
        <meshBasicMaterial color={accent} transparent opacity={0.56} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh position={[-4.25, -0.1, 0.12]}><sphereGeometry args={[0.13, 8, 8]} /><meshBasicMaterial color="#ff4f5e" toneMapped={false} /></mesh>
      <mesh position={[4.25, -0.1, 0.12]}><sphereGeometry args={[0.13, 8, 8]} /><meshBasicMaterial color="#55f2a4" toneMapped={false} /></mesh>
      <pointLight color={accent} intensity={1.3} distance={28} position={[0, -4, 0]} />
    </group>
  )
}

function DroneModel({ type, accent }: { type: AttackEntity['type']; accent: string }) {
  if (!QUADCOPTER_DRONES.has(type)) {
    const stealth = type === 'stealth-drone'
    return (
      <group>
        <mesh geometry={DRONE_WING} castShadow>
          <meshStandardMaterial color={stealth ? '#343c4a' : '#555e66'} roughness={0.64} metalness={0.34} />
        </mesh>
        <mesh position={[0, 0.1, 0.2]}>
          <capsuleGeometry args={[0.38, 3.1, 4, 8]} />
          <meshStandardMaterial color="#606d76" roughness={0.55} metalness={0.38} />
        </mesh>
        <mesh position={[0, 2.25, 0.2]}>
          <coneGeometry args={[0.36, 1.5, 10]} />
          <meshStandardMaterial color="#7a8790" roughness={0.48} metalness={0.42} />
        </mesh>
        <mesh position={[0, -2.05, 0.2]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.26, 1.15, 10]} />
          <meshBasicMaterial color={accent} transparent opacity={0.58} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <pointLight color={accent} intensity={1.2} distance={24} position={[0, -2, 0]} />
      </group>
    )
  }

  const rotorPositions: [number, number, number][] = [
    [-1.9, 1.9, 0.1], [1.9, 1.9, 0.1], [-1.9, -1.9, 0.1], [1.9, -1.9, 0.1],
  ]

  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[5.4, 0.22, 0.2]} />
        <meshStandardMaterial color="#4c5862" roughness={0.62} metalness={0.38} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[5.4, 0.22, 0.2]} />
        <meshStandardMaterial color="#4c5862" roughness={0.62} metalness={0.38} />
      </mesh>
      <mesh scale={[0.85, 1.18, 0.46]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#596772" roughness={0.48} metalness={0.46} />
      </mesh>
      <mesh position={[0, 0.9, -0.42]}>
        <sphereGeometry args={[0.34, 10, 8]} />
        <meshStandardMaterial color="#132b3b" emissive="#4db8dc" emissiveIntensity={0.2} roughness={0.15} metalness={0.62} />
      </mesh>
      {rotorPositions.map((position, index) => (
        <group position={position} key={index}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.24, 10]} />
            <meshStandardMaterial color="#202830" roughness={0.46} metalness={0.66} />
          </mesh>
          <mesh position={[0, 0, 0.18]}>
            <torusGeometry args={[0.75, 0.035, 5, 24]} />
            <meshBasicMaterial color="#afc0cc" transparent opacity={0.45} depthWrite={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.65, 0.08]}><sphereGeometry args={[0.14, 8, 8]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
      <pointLight color={accent} intensity={1.05} distance={22} position={[0, 2.4, 0]} />
    </group>
  )
}

function MissileModel({ type, accent }: { type: AttackEntity['type']; accent: string }) {
  const ballistic = type === 'ballistic-missile' || type === 'hypersonic-glide'
  const length = ballistic ? 7.8 : 5.8
  const radius = ballistic ? 0.7 : 0.48

  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[radius * 0.86, radius, length, 12]} />
        <meshStandardMaterial color={ballistic ? '#69717a' : '#7c858c'} roughness={0.48} metalness={0.48} />
      </mesh>
      <mesh position={[0, length / 2 + 0.85, 0]} castShadow>
        <coneGeometry args={[radius * 0.86, 1.7, 12]} />
        <meshStandardMaterial color="#a2a9ae" roughness={0.4} metalness={0.54} />
      </mesh>
      <mesh position={[0, -length * 0.22, 0]}>
        <cylinderGeometry args={[radius * 1.025, radius * 1.025, 0.35, 12]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} roughness={0.38} metalness={0.44} />
      </mesh>
      <mesh position={[0, -length / 2 + 0.7, 0]}>
        <boxGeometry args={[radius * 4.1, 1.25, 0.13]} />
        <meshStandardMaterial color="#444d54" roughness={0.58} metalness={0.4} />
      </mesh>
      <mesh position={[0, -length / 2 + 0.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[radius * 4.1, 1.25, 0.13]} />
        <meshStandardMaterial color="#444d54" roughness={0.58} metalness={0.4} />
      </mesh>
      <mesh position={[0, -length / 2 - 1.15, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[radius * 0.68, 2.6, 12]} />
        <meshBasicMaterial color={accent} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color={accent} intensity={2.2} distance={34} position={[0, -length / 2, 0]} />
    </group>
  )
}

function BombModel({ accent }: { accent: string }) {
  return (
    <group>
      <mesh castShadow>
        <capsuleGeometry args={[0.7, 2.7, 5, 10]} />
        <meshStandardMaterial color="#5c6469" roughness={0.62} metalness={0.38} />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <coneGeometry args={[0.68, 1.7, 12]} />
        <meshStandardMaterial color="#777f84" roughness={0.54} metalness={0.42} />
      </mesh>
      <mesh position={[0, -2.0, 0]}>
        <boxGeometry args={[2.7, 1.05, 0.14]} />
        <meshStandardMaterial color="#42494d" roughness={0.68} metalness={0.32} />
      </mesh>
      <mesh position={[0, -2.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.7, 1.05, 0.14]} />
        <meshStandardMaterial color="#42494d" roughness={0.68} metalness={0.32} />
      </mesh>
      <mesh position={[0, -0.65, 0]}>
        <torusGeometry args={[0.74, 0.09, 6, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.18} />
      </mesh>
      <pointLight color={accent} intensity={0.65} distance={16} />
    </group>
  )
}
