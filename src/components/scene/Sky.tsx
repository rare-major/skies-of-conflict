import { useMemo } from 'react'
import * as THREE from 'three'
import { useThemeStore } from '../../store/themeStore'
import { useOperationsStore } from '../../store/operationsStore'

const DARK_COLORS = {
  top: '#020611',
  bottom: '#111a29',
  horizon: '#36445f',
  sun: '#ff8758',
}
const LIGHT_COLORS = {
  top: '#4c87b9',
  bottom: '#b8c8d4',
  horizon: '#e3c6ad',
  sun: '#ffcf9f',
}

export function Sky() {
  const theme = useThemeStore((s) => s.theme)
  const timeOfDay = useOperationsStore((s) => s.timeOfDay)
  const weather = useOperationsStore((s) => s.weather)
  const geometry = useMemo(() => new THREE.SphereGeometry(1200, 32, 32), [])
  const base = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS
  const colors = timeOfDay === 'night'
    ? { top: '#01030a', bottom: '#080d19', horizon: '#17223a', sun: '#8eb8ff' }
    : timeOfDay === 'dawn'
      ? { top: '#111d36', bottom: '#3a2635', horizon: '#b05f59', sun: '#ffc08a' }
      : timeOfDay === 'dusk'
        ? { top: '#071127', bottom: '#241a2b', horizon: '#78444d', sun: '#ff8a5b' }
        : base
  const weatherMuted = weather === 'storm' || weather === 'monsoon' || weather === 'overcast'

  return (
    <mesh geometry={geometry} scale={[-1, 1, 1]}>
      <shaderMaterial
        key={`${theme}-${timeOfDay}-${weather}`}
        side={THREE.BackSide}
        uniforms={{
          topColor: { value: new THREE.Color(weatherMuted ? '#111927' : colors.top) },
          bottomColor: { value: new THREE.Color(colors.bottom) },
          horizonColor: { value: new THREE.Color(colors.horizon) },
          sunColor: { value: new THREE.Color(colors.sun) },
          sunDirection: { value: new THREE.Vector3(-0.72, 0.15, -0.68).normalize() },
          offset: { value: 20 },
          exponent: { value: theme === 'dark' || timeOfDay !== 'day' ? 0.58 : 0.42 },
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
          uniform vec3 sunColor;
          uniform vec3 sunDirection;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            vec3 direction = normalize(vWorldPosition);
            float h = normalize(vWorldPosition + offset).y;
            float t = max(pow(max(h, 0.0), exponent), 0.0);
            vec3 color = mix(horizonColor, topColor, t);
            if (h < 0.0) color = mix(horizonColor, bottomColor, min(abs(h) * 3.0, 1.0));
            float horizonBand = exp(-abs(h) * 8.5);
            float sunAmount = max(dot(direction, sunDirection), 0.0);
            float sunHalo = pow(sunAmount, 18.0) * 0.42;
            float sunCore = pow(sunAmount, 420.0) * 1.25;
            color += sunColor * (sunHalo + sunCore) * horizonBand;
            color += sunColor * horizonBand * 0.035;
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  )
}
