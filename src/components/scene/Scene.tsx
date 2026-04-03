import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Ground } from './Ground'
import { Sky } from './Sky'
import { Terrain } from './Terrain'
import { DomeGrid } from './DomeGrid'
import { CountryTerrain } from './CountryTerrain'
import { CityMarker } from './CityMarker'
import { Landmark } from './Landmark'
import { CameraController } from './CameraController'
import { EntityRenderer } from '../entities/EntityRenderer'
import { SimulationEngine } from '../entities/SimulationEngine'
import { VisualEffects } from '../visuals/VisualEffects'
import { useThemeStore } from '../../store/themeStore'
import { useSimulationStore } from '../../store/simulationStore'
import { useCountryStore } from '../../store/countryStore'
import { getCountryById } from '../../data/countries'

export function Scene() {
  const theme = useThemeStore((s) => s.theme)
  const showTerrain = useSimulationStore((s) => s.showTerrain)
  const showDomeGrid = useSimulationStore((s) => s.showDomeGrid)
  const dark = theme === 'dark'

  const selectedCountryId = useCountryStore((s) => s.selectedCountryId)
  const country = selectedCountryId ? getCountryById(selectedCountryId) : null

  const fogColor = country
    ? country.terrain.fogColor
    : dark ? '#1e293b' : '#b8c4d0'

  const sceneBg = dark ? '#0f172a' : '#dde4ec'
  const fogDensity = dark ? 0.0015 : 0.0012

  return (
    <Canvas
      camera={{ position: [200, 200, 300], fov: 55, near: 1, far: 2000 }}
      shadows
      gl={{ antialias: true, alpha: false }}
      style={{ background: sceneBg }}
    >
      {/* Ambient base — guarantees minimum visibility */}
      <ambientLight intensity={dark ? 1.0 : 0.7} color="#ffffff" />

      {/* Key light — angled like late-afternoon sun for long shadows */}
      <directionalLight
        position={[150, 250, 100]}
        intensity={dark ? 2.2 : 1.8}
        castShadow
        color={dark ? '#e8eef8' : '#fff4e8'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-600}
        shadow-camera-right={600}
        shadow-camera-top={600}
        shadow-camera-bottom={-600}
        shadow-camera-near={1}
        shadow-camera-far={1200}
        shadow-bias={-0.0005}
      />

      {/* Fill light — opposite side, cool tint, no shadows */}
      <directionalLight
        position={[-100, 80, -80]}
        intensity={dark ? 0.5 : 0.35}
        color={dark ? '#8aa0c0' : '#c8d8f0'}
      />

      {/* Overhead point — soft top-down highlight */}
      <pointLight
        position={[0, 200, 0]}
        intensity={dark ? 0.4 : 0.12}
        color={dark ? '#6ab0ff' : '#f0e0c8'}
      />

      {/* Hemisphere — sky/ground ambient fill */}
      <hemisphereLight
        color={dark ? '#4060a0' : '#90b8d8'}
        groundColor={dark ? '#1a2840' : '#c0b8a8'}
        intensity={dark ? 0.5 : 0.3}
      />

      {/* Exponential fog — more natural depth falloff than linear */}
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />

      <Sky />

      {country ? (
        <>
          {showTerrain ? (
            <CountryTerrain params={country.terrain} />
          ) : (
            <Ground />
          )}
          {country.cities.map((city) => (
            <CityMarker key={city.name} city={city} accentColor={country.flagColors[0]} palette={country.buildingPalette} />
          ))}
          {country.landmarks.map((lm) => (
            <Landmark key={lm.name} landmark={lm} />
          ))}
        </>
      ) : (
        showTerrain ? <Terrain /> : <Ground />
      )}

      {showDomeGrid && <DomeGrid />}

      <EntityRenderer />
      <VisualEffects />
      <SimulationEngine />
      <CameraController />

      <OrbitControls
        makeDefault
        maxDistance={1000}
        minDistance={20}
        maxPolarAngle={Math.PI / 2.1}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  )
}
