import { useMemo } from 'react'
import * as THREE from 'three'
import type { InterceptorEntity } from '../../types/entities'

interface Props {
  interceptor: InterceptorEntity
}

const _up = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()
const _quat = new THREE.Quaternion()

export function InterceptorMesh({ interceptor }: Props) {
  const rotation = useMemo(() => {
    const [vx, vy, vz] = interceptor.velocity
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
    if (speed < 0.001) return new THREE.Euler(0, 0, 0)

    _dir.set(vx / speed, vy / speed, vz / speed)
    _quat.setFromUnitVectors(_up, _dir)
    return new THREE.Euler().setFromQuaternion(_quat)
  }, [interceptor.velocity])

  const isBurst = interceptor.trajectory === 'burst-fire'

  return (
    <group position={interceptor.position} rotation={rotation}>
      {isBurst ? (
        <mesh>
          <sphereGeometry args={[0.4, 4, 4]} />
          <meshStandardMaterial color="#ffaa33" emissive="#ffaa33" emissiveIntensity={0.8} />
        </mesh>
      ) : (
        <group>
          <mesh>
            <coneGeometry args={[0.5, 3, 5]} />
            <meshStandardMaterial color="#44aaff" emissive="#44aaff" emissiveIntensity={0.6} />
          </mesh>
          <pointLight color="#44aaff" intensity={1.5} distance={15} />
        </group>
      )}
    </group>
  )
}
