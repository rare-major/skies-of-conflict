import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useOperationsStore } from '../../store/operationsStore'
import type { TacticalShape } from '../../types/operations'

const COLORS = {
  route: '#62ceff',
  patrol: '#c6a7ff',
  'defence-zone': '#5ce8ad',
  'no-fly': '#ff6976',
} as const

export function TacticalSceneOverlay() {
  const shapes = useOperationsStore((state) => state.tacticalShapes)
  const draft = useOperationsStore((state) => state.draftPoints)
  const tool = useOperationsStore((state) => state.tacticalTool)

  return <group>{shapes.map((shape) => <TacticalShape3D key={shape.id} shape={shape} />)}{draft.length > 0 && <TacticalShape3D shape={{ id: 'draft', kind: tool, label: 'Draft', points: draft, createdAt: 0 }} draft />}</group>
}

function TacticalShape3D({ shape, draft = false }: { shape: TacticalShape; draft?: boolean }) {
  const color = COLORS[shape.kind]
  const positions = useMemo(() => shape.points.map((point) => new THREE.Vector3(point.x, 1.2, point.z)), [shape.points])
  const radius = positions.length > 1 ? Math.max(28, positions[0].distanceTo(positions[1])) : shape.kind === 'patrol' ? 78 : 64

  if (shape.kind !== 'route') {
    const center = positions[0]
    if (!center) return null
    return <group position={center}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.max(2, radius - 1.4), radius, 72]} />
        <meshBasicMaterial color={color} transparent opacity={draft ? 0.75 : 0.42} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <circleGeometry args={[radius, 72]} />
        <meshBasicMaterial color={color} transparent opacity={0.025} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.4, 0]}><cylinderGeometry args={[1.5, 1.5, 5, 8]} /><meshBasicMaterial color={color} transparent opacity={0.8} /></mesh>
    </group>
  }

  if (positions.length === 0) return null
  return <group>
    {positions.length > 1 && <Line points={positions} color={color} lineWidth={draft ? 2 : 1.25} transparent opacity={draft ? 0.9 : 0.58} dashed dashSize={9} gapSize={5} />}
    {positions.map((position, index) => <group key={index} position={position}><mesh position={[0, 2.2, 0]}><sphereGeometry args={[2.2, 10, 8]} /><meshBasicMaterial color={color} /></mesh><mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[5.5, 6, 24]} /><meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} /></mesh></group>)}
  </group>
}
