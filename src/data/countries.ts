import type { Vector3Tuple } from 'three'

export interface City {
  name: string
  position: Vector3Tuple
  isCapital?: boolean
  population?: 'small' | 'medium' | 'large' | 'mega'
}

export type LandmarkShape =
  | 'dome' | 'onion-dome' | 'tower' | 'clock-tower'
  | 'pyramid' | 'pagoda' | 'wall' | 'arch'
  | 'gate' | 'torii' | 'bridge' | 'obelisk'
  | 'eiffel' | 'skyscraper-cluster' | 'minaret'
  | 'statue-base' | 'fortress'

export interface LandmarkDef {
  name: string
  position: Vector3Tuple
  shape: LandmarkShape
  scale: number
  color: string
  accent?: string
}

export type Biome = 'temperate' | 'desert' | 'tropical' | 'arctic' | 'arid' | 'mediterranean'

export interface BuildingPalette {
  glass: string
  concrete: string
  residential: string
  accent: string
}

export interface TerrainParams {
  baseColor: string
  darkColor: string
  peakColor: string
  valleyColor: string
  roughness: number
  seed: number
  fogColor: string
  biome: Biome
  hasCoast: boolean
  waterColor: string
  mountainScale: number
}

export interface Country {
  id: string
  name: string
  flagColors: [string, string, string]
  terrain: TerrainParams
  cities: City[]
  landmarks: LandmarkDef[]
  scenarioIds: string[]
  buildingPalette: BuildingPalette
}

export const COUNTRIES: Country[] = [
  {
    id: 'usa',
    name: 'United States',
    flagColors: ['#3c3b6e', '#b22234', '#ffffff'],
    terrain: {
      baseColor: '#3a5a3a', darkColor: '#305040', peakColor: '#6b8b6b', valleyColor: '#3a5838',
      roughness: 1.0, seed: 42, fogColor: '#3a5048', biome: 'temperate',
      hasCoast: true, waterColor: '#1a4a7a', mountainScale: 1.0,
    },
    buildingPalette: { glass: '#7ca8cc', concrete: '#8899aa', residential: '#a09080', accent: '#3c3b6e' },
    cities: [
      { name: 'Washington DC', position: [0, 0, 0], isCapital: true, population: 'large' },
      { name: 'New York', position: [150, 0, -100], population: 'mega' },
      { name: 'Los Angeles', position: [-300, 0, 200], population: 'mega' },
      { name: 'Houston', position: [-100, 0, 250], population: 'large' },
      { name: 'Pearl Harbor', position: [-400, 0, -200], population: 'medium' },
    ],
    landmarks: [
      { name: 'Capitol', position: [0, 0, 0], shape: 'dome', scale: 1.2, color: '#e8e8e8' },
      { name: 'Manhattan', position: [150, 0, -100], shape: 'skyscraper-cluster', scale: 1.5, color: '#7ca8cc', accent: '#3c3b6e' },
      { name: 'Washington Monument', position: [15, 0, -15], shape: 'obelisk', scale: 1.3, color: '#e0ddd0' },
    ],
    scenarioIds: ['usa-dc-defence', 'usa-pearl-harbor'],
  },
  {
    id: 'russia',
    name: 'Russia',
    flagColors: ['#ffffff', '#0039a6', '#d52b1e'],
    terrain: {
      baseColor: '#4a5a4a', darkColor: '#384838', peakColor: '#d0d8d0', valleyColor: '#3a4a38',
      roughness: 1.3, seed: 101, fogColor: '#3a4840', biome: 'arctic',
      hasCoast: false, waterColor: '#1a3a6a', mountainScale: 1.4,
    },
    buildingPalette: { glass: '#8899aa', concrete: '#7a7a7a', residential: '#a09898', accent: '#d52b1e' },
    cities: [
      { name: 'Moscow', position: [0, 0, 0], isCapital: true, population: 'mega' },
      { name: 'St Petersburg', position: [-200, 0, -180], population: 'large' },
      { name: 'Vladivostok', position: [350, 0, 200], population: 'medium' },
      { name: 'Kaliningrad', position: [-350, 0, -100], population: 'medium' },
    ],
    landmarks: [
      { name: 'Kremlin', position: [0, 0, 0], shape: 'onion-dome', scale: 1.4, color: '#cc3333', accent: '#daa520' },
      { name: 'St Basil\'s', position: [20, 0, 15], shape: 'onion-dome', scale: 1.0, color: '#2266aa', accent: '#daa520' },
      { name: 'Fortress Wall', position: [-10, 0, -10], shape: 'fortress', scale: 1.2, color: '#993333' },
    ],
    scenarioIds: ['russia-moscow-shield'],
  },
  {
    id: 'china',
    name: 'China',
    flagColors: ['#de2910', '#ffde00', '#de2910'],
    terrain: {
      baseColor: '#3d5530', darkColor: '#304828', peakColor: '#8a9a70', valleyColor: '#2c4020',
      roughness: 1.2, seed: 200, fogColor: '#384838', biome: 'temperate',
      hasCoast: true, waterColor: '#1a4a6a', mountainScale: 1.3,
    },
    buildingPalette: { glass: '#90aabb', concrete: '#8a8a80', residential: '#c0a890', accent: '#de2910' },
    cities: [
      { name: 'Beijing', position: [0, 0, 0], isCapital: true, population: 'mega' },
      { name: 'Shanghai', position: [250, 0, 200], population: 'mega' },
      { name: 'Shenzhen', position: [200, 0, 350], population: 'large' },
      { name: 'Chengdu', position: [-200, 0, 150], population: 'large' },
    ],
    landmarks: [
      { name: 'Temple of Heaven', position: [0, 0, 0], shape: 'pagoda', scale: 1.4, color: '#2244aa', accent: '#daa520' },
      { name: 'Great Wall', position: [0, 0, -250], shape: 'wall', scale: 2.5, color: '#998877' },
      { name: 'Shanghai Tower', position: [250, 0, 200], shape: 'skyscraper-cluster', scale: 1.3, color: '#8ab8d8', accent: '#de2910' },
    ],
    scenarioIds: ['china-beijing-umbrella'],
  },
  {
    id: 'india',
    name: 'India',
    flagColors: ['#ff9933', '#ffffff', '#138808'],
    terrain: {
      baseColor: '#5a6a3a', darkColor: '#404828', peakColor: '#c0b890', valleyColor: '#4a5830',
      roughness: 0.8, seed: 300, fogColor: '#4a5838', biome: 'tropical',
      hasCoast: true, waterColor: '#1a5070', mountainScale: 0.8,
    },
    buildingPalette: { glass: '#88a8b0', concrete: '#c0b098', residential: '#d0b888', accent: '#ff9933' },
    cities: [
      { name: 'New Delhi', position: [0, 0, 0], isCapital: true, population: 'mega' },
      { name: 'Mumbai', position: [-200, 0, 250], population: 'mega' },
      { name: 'Bangalore', position: [50, 0, 350], population: 'large' },
      { name: 'Chennai', position: [200, 0, 300], population: 'large' },
    ],
    landmarks: [
      { name: 'Taj Mahal', position: [50, 0, -50], shape: 'dome', scale: 1.6, color: '#f0f0e8', accent: '#daa520' },
      { name: 'Taj Minarets', position: [60, 0, -40], shape: 'minaret', scale: 1.2, color: '#f0f0e8' },
      { name: 'India Gate', position: [0, 0, 0], shape: 'arch', scale: 1.1, color: '#d4b88c' },
      { name: 'Temple Spire', position: [200, 0, 300], shape: 'tower', scale: 1.2, color: '#cc8844', accent: '#daa520' },
    ],
    scenarioIds: ['india-delhi-dome'],
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flagColors: ['#012169', '#c8102e', '#ffffff'],
    terrain: {
      baseColor: '#3a5540', darkColor: '#2c4430', peakColor: '#708070', valleyColor: '#2a4030',
      roughness: 0.6, seed: 400, fogColor: '#3a4a40', biome: 'temperate',
      hasCoast: true, waterColor: '#2a4a6a', mountainScale: 0.5,
    },
    buildingPalette: { glass: '#7090a0', concrete: '#8a8a80', residential: '#a09080', accent: '#c8102e' },
    cities: [
      { name: 'London', position: [0, 0, 0], isCapital: true, population: 'mega' },
      { name: 'Manchester', position: [-150, 0, -200], population: 'large' },
      { name: 'Edinburgh', position: [-100, 0, -350], population: 'medium' },
      { name: 'Belfast', position: [-300, 0, -150], population: 'medium' },
    ],
    landmarks: [
      { name: 'Big Ben', position: [0, 0, 0], shape: 'clock-tower', scale: 1.4, color: '#c8a87c', accent: '#daa520' },
      { name: 'Tower Bridge', position: [30, 0, 20], shape: 'bridge', scale: 1.1, color: '#6688aa', accent: '#c8102e' },
      { name: 'The Shard', position: [20, 0, -15], shape: 'skyscraper-cluster', scale: 0.9, color: '#8899bb' },
    ],
    scenarioIds: ['uk-london-defence'],
  },
  {
    id: 'france',
    name: 'France',
    flagColors: ['#002395', '#ffffff', '#ed2939'],
    terrain: {
      baseColor: '#4a6040', darkColor: '#354830', peakColor: '#a0b090', valleyColor: '#3a4a30',
      roughness: 0.7, seed: 500, fogColor: '#3a5038', biome: 'mediterranean',
      hasCoast: true, waterColor: '#2a5080', mountainScale: 0.6,
    },
    buildingPalette: { glass: '#90a0b0', concrete: '#d4c8b0', residential: '#e0d0b8', accent: '#002395' },
    cities: [
      { name: 'Paris', position: [0, 0, 0], isCapital: true, population: 'mega' },
      { name: 'Marseille', position: [150, 0, 300], population: 'large' },
      { name: 'Lyon', position: [100, 0, 150], population: 'large' },
      { name: 'Strasbourg', position: [250, 0, -100], population: 'medium' },
    ],
    landmarks: [
      { name: 'Eiffel Tower', position: [0, 0, 0], shape: 'eiffel', scale: 1.5, color: '#8b7355' },
      { name: 'Arc de Triomphe', position: [-30, 0, -20], shape: 'arch', scale: 1.2, color: '#d4c5a9' },
      { name: 'Louvre Pyramid', position: [20, 0, 10], shape: 'pyramid', scale: 0.6, color: '#a0b8d0' },
    ],
    scenarioIds: ['france-paris-interception'],
  },
  {
    id: 'israel',
    name: 'Israel',
    flagColors: ['#0038b8', '#ffffff', '#0038b8'],
    terrain: {
      baseColor: '#a08860', darkColor: '#6a5840', peakColor: '#d0c0a0', valleyColor: '#7a6848',
      roughness: 0.5, seed: 600, fogColor: '#706048', biome: 'desert',
      hasCoast: true, waterColor: '#1a5080', mountainScale: 0.4,
    },
    buildingPalette: { glass: '#88aacc', concrete: '#d0c8b8', residential: '#e0d8c8', accent: '#0038b8' },
    cities: [
      { name: 'Tel Aviv', position: [0, 0, 0], isCapital: true, population: 'large' },
      { name: 'Jerusalem', position: [60, 0, -80], population: 'large' },
      { name: 'Haifa', position: [-80, 0, -150], population: 'medium' },
      { name: 'Beersheba', position: [80, 0, 150], population: 'medium' },
    ],
    landmarks: [
      { name: 'Dome of the Rock', position: [60, 0, -80], shape: 'dome', scale: 1.3, color: '#daa520', accent: '#0038b8' },
      { name: 'Western Wall', position: [55, 0, -85], shape: 'wall', scale: 0.8, color: '#c8b898' },
      { name: 'Tel Aviv Towers', position: [0, 0, 0], shape: 'skyscraper-cluster', scale: 0.8, color: '#88aacc' },
    ],
    scenarioIds: ['israel-tel-aviv-barrage'],
  },
  {
    id: 'iran',
    name: 'Iran',
    flagColors: ['#239f40', '#ffffff', '#da0000'],
    terrain: {
      baseColor: '#907050', darkColor: '#5a4838', peakColor: '#c8b090', valleyColor: '#685040',
      roughness: 1.1, seed: 700, fogColor: '#605040', biome: 'arid',
      hasCoast: false, waterColor: '#1a4060', mountainScale: 1.2,
    },
    buildingPalette: { glass: '#80a0b0', concrete: '#c8b8a0', residential: '#d0c0a0', accent: '#239f40' },
    cities: [
      { name: 'Tehran', position: [0, 0, 0], isCapital: true, population: 'mega' },
      { name: 'Isfahan', position: [-150, 0, 200], population: 'large' },
      { name: 'Tabriz', position: [-200, 0, -200], population: 'medium' },
      { name: 'Shiraz', position: [100, 0, 300], population: 'medium' },
    ],
    landmarks: [
      { name: 'Shah Mosque', position: [-150, 0, 200], shape: 'dome', scale: 1.4, color: '#4488cc', accent: '#daa520' },
      { name: 'Minaret', position: [-140, 0, 210], shape: 'minaret', scale: 1.3, color: '#c8b898' },
      { name: 'Azadi Tower', position: [0, 0, 0], shape: 'arch', scale: 1.0, color: '#e0e0d8' },
    ],
    scenarioIds: ['iran-tehran-strike'],
  },
  {
    id: 'japan',
    name: 'Japan',
    flagColors: ['#ffffff', '#bc002d', '#ffffff'],
    terrain: {
      baseColor: '#3a6838', darkColor: '#305030', peakColor: '#e8e8e8', valleyColor: '#3a5830',
      roughness: 0.9, seed: 800, fogColor: '#385040', biome: 'temperate',
      hasCoast: true, waterColor: '#1a4878', mountainScale: 1.1,
    },
    buildingPalette: { glass: '#88b8cc', concrete: '#c0c0c0', residential: '#d8d0c0', accent: '#bc002d' },
    cities: [
      { name: 'Tokyo', position: [0, 0, 0], isCapital: true, population: 'mega' },
      { name: 'Osaka', position: [-200, 0, 150], population: 'mega' },
      { name: 'Yokohama', position: [50, 0, 50], population: 'large' },
      { name: 'Nagoya', position: [-100, 0, 80], population: 'large' },
    ],
    landmarks: [
      { name: 'Sensoji Pagoda', position: [0, 0, 0], shape: 'pagoda', scale: 1.3, color: '#cc3333', accent: '#daa520' },
      { name: 'Torii Gate', position: [50, 0, 50], shape: 'torii', scale: 1.0, color: '#cc2222' },
      { name: 'Tokyo Tower', position: [10, 0, -20], shape: 'eiffel', scale: 0.9, color: '#ee5533', accent: '#ffffff' },
      { name: 'Tokyo Skytree', position: [-15, 0, 10], shape: 'tower', scale: 1.6, color: '#c0c8d0' },
    ],
    scenarioIds: ['japan-tokyo-shield'],
  },
  {
    id: 'north-korea',
    name: 'North Korea',
    flagColors: ['#024fa2', '#ed1c27', '#ffffff'],
    terrain: {
      baseColor: '#3a4a38', darkColor: '#2c3828', peakColor: '#808880', valleyColor: '#304028',
      roughness: 1.4, seed: 900, fogColor: '#354838', biome: 'temperate',
      hasCoast: true, waterColor: '#1a3a60', mountainScale: 1.5,
    },
    buildingPalette: { glass: '#7a8890', concrete: '#808080', residential: '#a09888', accent: '#ed1c27' },
    cities: [
      { name: 'Pyongyang', position: [0, 0, 0], isCapital: true, population: 'large' },
      { name: 'Kaesong', position: [-100, 0, 150], population: 'small' },
      { name: 'Wonsan', position: [200, 0, 50], population: 'small' },
      { name: 'Sinuiju', position: [-250, 0, -100], population: 'small' },
    ],
    landmarks: [
      { name: 'Ryugyong Hotel', position: [0, 0, 0], shape: 'pyramid', scale: 2.0, color: '#808080' },
      { name: 'Juche Tower', position: [30, 0, -30], shape: 'obelisk', scale: 1.6, color: '#cccccc', accent: '#ed1c27' },
      { name: 'Monument', position: [-20, 0, 20], shape: 'statue-base', scale: 1.0, color: '#998877' },
    ],
    scenarioIds: ['nk-pyongyang-defence'],
  },
  {
    id: 'turkey',
    name: 'Turkey',
    flagColors: ['#e30a17', '#ffffff', '#e30a17'],
    terrain: {
      baseColor: '#6a6a40', darkColor: '#484830', peakColor: '#a0a080', valleyColor: '#505030',
      roughness: 0.9, seed: 1000, fogColor: '#4a5038', biome: 'mediterranean',
      hasCoast: true, waterColor: '#1a5080', mountainScale: 0.8,
    },
    buildingPalette: { glass: '#88a0b0', concrete: '#c0b0a0', residential: '#d0c0a8', accent: '#e30a17' },
    cities: [
      { name: 'Istanbul', position: [0, 0, 0], isCapital: false, population: 'mega' },
      { name: 'Ankara', position: [200, 0, -100], isCapital: true, population: 'large' },
      { name: 'Izmir', position: [-200, 0, 150], population: 'large' },
      { name: 'Antalya', position: [0, 0, 300], population: 'medium' },
    ],
    landmarks: [
      { name: 'Hagia Sophia', position: [0, 0, 0], shape: 'dome', scale: 1.6, color: '#cc8866', accent: '#daa520' },
      { name: 'Sultanahmet Minaret', position: [12, 0, 8], shape: 'minaret', scale: 1.4, color: '#d0c0a0' },
      { name: 'Bosphorus Bridge', position: [40, 0, 20], shape: 'bridge', scale: 1.4, color: '#6688aa', accent: '#e30a17' },
    ],
    scenarioIds: ['turkey-istanbul-strait'],
  },
]

export function getCountryById(id: string): Country | undefined {
  return COUNTRIES.find((c) => c.id === id)
}
