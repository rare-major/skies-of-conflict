import { Grid } from '@react-three/drei'
import { useThemeStore } from '../../store/themeStore'

export function Ground() {
  const theme = useThemeStore((s) => s.theme)
  const dark = theme === 'dark'

  return (
    <group>
      <Grid
        args={[1600, 1600]}
        cellSize={20}
        cellThickness={0.5}
        cellColor={dark ? '#2e4460' : '#8898a8'}
        sectionSize={100}
        sectionThickness={1.0}
        sectionColor={dark ? '#3a5878' : '#7888a0'}
        fadeDistance={700}
        fadeStrength={1.5}
        position={[0, -0.01, 0]}
        infiniteGrid
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[1600, 1600]} />
        <meshStandardMaterial
          color={dark ? '#1e293b' : '#94a3b8'}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}
