import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Ground } from './Ground'
import { Sky } from './Sky'
import { Terrain } from './Terrain'
import { DomeGrid } from './DomeGrid'
import { CountryTerrain } from './CountryTerrain'
import { CityMarker } from './CityMarker'
import { Landmark } from './Landmark'
import { CameraController } from './CameraController'
import { CinematicAtmosphere } from './CinematicAtmosphere'
import { TacticalSceneOverlay } from './TacticalSceneOverlay'
import { WeatherSystem } from './WeatherSystem'
import { EntityRenderer } from '../entities/EntityRenderer'
import { SimulationEngine } from '../entities/SimulationEngine'
import { VisualEffects } from '../visuals/VisualEffects'
import { useThemeStore } from '../../store/themeStore'
import { useSimulationStore } from '../../store/simulationStore'
import { useCountryStore } from '../../store/countryStore'
import { getCountryById } from '../../data/countries'
import { useOperationsStore } from '../../store/operationsStore'

export function Scene() {
  const theme = useThemeStore((s) => s.theme)
  const showTerrain = useSimulationStore((s) => s.showTerrain)
  const showDomeGrid = useSimulationStore((s) => s.showDomeGrid)
  const dark = theme === 'dark'
  const weather = useOperationsStore((s) => s.weather)
  const timeOfDay = useOperationsStore((s) => s.timeOfDay)

  const selectedCountryId = useCountryStore((s) => s.selectedCountryId)
  const country = selectedCountryId ? getCountryById(selectedCountryId) : null

  const baseFogColor = country
    ? country.terrain.fogColor
    : dark ? '#111827' : '#bac7d2'

  const fogColor = weather === 'dust' ? '#6f5b49' : weather === 'storm' || weather === 'monsoon' ? '#17202d' : baseFogColor

  const sceneBg = timeOfDay === 'night' ? '#01040a' : timeOfDay === 'dawn' ? '#15111b' : dark ? '#030711' : '#dce6ed'
  const weatherFog = weather === 'monsoon' ? 0.0029 : weather === 'storm' ? 0.00235 : weather === 'dust' ? 0.00265 : weather === 'overcast' ? 0.00165 : 0
  const fogDensity = Math.max(dark ? 0.0012 : 0.00105, weatherFog)
  const lightFactor = timeOfDay === 'night' ? 0.38 : timeOfDay === 'dusk' || timeOfDay === 'dawn' ? 0.72 : 1

  return (
    <Canvas
      camera={{ position: [310, 175, 370], fov: 48, near: 1, far: 2200 }}
      shadows="basic"
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onCreated={({ gl }) => { gl.toneMappingExposure = dark ? 1.18 : 1.04 }}
      style={{ background: sceneBg }}
    >
      {/* Ambient base — guarantees minimum visibility */}
      <ambientLight intensity={(dark ? 0.34 : 0.68) * lightFactor} color={timeOfDay === 'night' ? '#6288c7' : dark ? '#9bb7da' : '#ffffff'} />

      {/* Key light — angled like late-afternoon sun for long shadows */}
      <directionalLight
        position={[-260, 360, -220]}
        intensity={(dark ? 3.8 : 2.1) * lightFactor}
        castShadow
        color={dark ? '#ffd2ac' : '#fff0dd'}
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
        position={[260, 130, 240]}
        intensity={dark ? 0.85 : 0.4}
        color={dark ? '#5d8ed8' : '#c8d8f0'}
      />

      {/* Overhead point — soft top-down highlight */}
      <pointLight
        position={[0, 200, 0]}
        intensity={dark ? 0.55 : 0.12}
        color={dark ? '#67b7ff' : '#f0e0c8'}
      />

      {/* Hemisphere — sky/ground ambient fill */}
      <hemisphereLight
        color={dark ? '#345a9c' : '#90b8d8'}
        groundColor={dark ? '#130f18' : '#c0b8a8'}
        intensity={dark ? 0.62 : 0.3}
      />

      {/* Exponential fog — more natural depth falloff than linear */}
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />

      <Sky />
      <CinematicAtmosphere />
      <WeatherSystem />

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
      <TacticalSceneOverlay />

      <EntityRenderer />
      <VisualEffects />
      <SimulationEngine />
      <CameraController />

      <OrbitControls
        makeDefault
        maxDistance={1000}
        minDistance={20}
        maxPolarAngle={Math.PI / 2.1}
        zoomToCursor
        screenSpacePanning
        zoomSpeed={0.9}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  )
}
