import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Vector3Tuple } from 'three'

interface Props {
  points: Vector3Tuple[]
  color: string
}

export function TrajectoryTrail({ points, color }: Props) {
  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(points.length * 3)
    const opacities = new Float32Array(points.length)

    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i][0]
      positions[i * 3 + 1] = points[i][1]
      positions[i * 3 + 2] = points[i][2]
      opacities[i] = i / points.length
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1))
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 })
    return new THREE.Line(geo, material)
  }, [points, color])

  useEffect(() => () => {
    line.geometry.dispose()
    ;(line.material as THREE.Material).dispose()
  }, [line])

  return <primitive object={line} />
}
