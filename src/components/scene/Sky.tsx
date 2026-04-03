import { useMemo } from 'react'
import * as THREE from 'three'
import { useThemeStore } from '../../store/themeStore'

const DARK_COLORS = { top: '#0c1929', bottom: '#1a2a40', horizon: '#2d4058' }
const LIGHT_COLORS = { top: '#5a9ed0', bottom: '#90b8d8', horizon: '#c8d4e0' }

export function Sky() {
  const theme = useThemeStore((s) => s.theme)
  const geometry = useMemo(() => new THREE.SphereGeometry(1200, 32, 32), [])
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS

  return (
    <mesh geometry={geometry} scale={[-1, 1, 1]}>
      <shaderMaterial
        key={theme}
        side={THREE.BackSide}
        uniforms={{
          topColor: { value: new THREE.Color(colors.top) },
          bottomColor: { value: new THREE.Color(colors.bottom) },
          horizonColor: { value: new THREE.Color(colors.horizon) },
          offset: { value: 20 },
          exponent: { value: 0.4 },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform vec3 horizonColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            float t = max(pow(max(h, 0.0), exponent), 0.0);
            vec3 color = mix(horizonColor, topColor, t);
            if (h < 0.0) color = mix(horizonColor, bottomColor, min(abs(h) * 3.0, 1.0));
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  )
}
